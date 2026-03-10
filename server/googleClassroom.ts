/**
 * Google Classroom API Client
 * Handles OAuth2 flow and API operations for syncing with Google Classroom
 */
import { google, classroom_v1 } from "googleapis";
import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { googleClassroomConnections, batchClassroomMappings, assignmentClassroomMappings, classroomSyncLogs } from "../drizzle/schema";

// Google OAuth2 Configuration
const SCOPES = [
  "https://www.googleapis.com/auth/classroom.courses.readonly",
  "https://www.googleapis.com/auth/classroom.coursework.students",
  "https://www.googleapis.com/auth/classroom.rosters.readonly",
  "https://www.googleapis.com/auth/classroom.profile.emails",
  "https://www.googleapis.com/auth/userinfo.email",
];

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth2 credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Generate Google OAuth2 authorization URL
 */
export function getGoogleAuthUrl(state: string, redirectUri: string): string {
  const oauth2Client = getOAuth2Client();
  oauth2Client.redirectUri_ = redirectUri;
  
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state,
    prompt: "consent",
    redirect_uri: redirectUri,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const oauth2Client = getOAuth2Client();
  oauth2Client.redirectUri_ = redirectUri;
  
  const { tokens } = await oauth2Client.getToken({ code, redirect_uri: redirectUri });
  
  // Get user email
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: userInfo } = await oauth2.userinfo.get();
  
  return {
    accessToken: tokens.access_token!,
    refreshToken: tokens.refresh_token!,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    email: userInfo.email!,
    scopes: tokens.scope || SCOPES.join(" "),
  };
}

/**
 * Get an authenticated Classroom client for a connection
 */
async function getClassroomClient(connectionId: number): Promise<{ classroom: classroom_v1.Classroom; connection: any }> {
  const database = await getDb();
  if (!database) throw new Error("Database not available");

  const [connection] = await database.select().from(googleClassroomConnections).where(eq(googleClassroomConnections.id, connectionId));
  if (!connection) throw new Error("Google Classroom connection not found");
  if (!connection.isActive) throw new Error("Google Classroom connection is inactive");

  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({
    access_token: connection.accessToken,
    refresh_token: connection.refreshToken,
    expiry_date: connection.tokenExpiresAt ? connection.tokenExpiresAt.getTime() : undefined,
  });

  // Auto-refresh token if expired
  oauth2Client.on("tokens", async (tokens) => {
    const updateData: any = {};
    if (tokens.access_token) updateData.accessToken = tokens.access_token;
    if (tokens.refresh_token) updateData.refreshToken = tokens.refresh_token;
    if (tokens.expiry_date) updateData.tokenExpiresAt = new Date(tokens.expiry_date);
    
    if (Object.keys(updateData).length > 0) {
      await database.update(googleClassroomConnections).set(updateData).where(eq(googleClassroomConnections.id, connectionId));
    }
  });

  const classroom = google.classroom({ version: "v1", auth: oauth2Client });
  return { classroom, connection };
}

/**
 * List courses from Google Classroom
 */
export async function listGoogleCourses(connectionId: number): Promise<{ id: string; name: string; section?: string; state?: string }[]> {
  const { classroom } = await getClassroomClient(connectionId);
  
  const response = await classroom.courses.list({
    teacherId: "me",
    courseStates: ["ACTIVE"],
    pageSize: 100,
  });

  return (response.data.courses || []).map(course => ({
    id: course.id!,
    name: course.name!,
    section: course.section || undefined,
    state: course.courseState || undefined,
  }));
}

/**
 * Push an assignment to Google Classroom as CourseWork
 */
export async function pushAssignmentToClassroom(
  connectionId: number,
  googleCourseId: string,
  assignment: { title: string; description?: string; maxScore: number; dueDate?: Date }
): Promise<string> {
  const { classroom } = await getClassroomClient(connectionId);

  const courseWorkBody: classroom_v1.Schema$CourseWork = {
    title: assignment.title,
    description: assignment.description || "",
    maxPoints: assignment.maxScore,
    workType: "ASSIGNMENT",
    state: "PUBLISHED",
  };

  // Add due date if provided
  if (assignment.dueDate) {
    const d = assignment.dueDate;
    courseWorkBody.dueDate = {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
    };
    courseWorkBody.dueTime = {
      hours: 23,
      minutes: 59,
    };
  }

  const response = await classroom.courses.courseWork.create({
    courseId: googleCourseId,
    requestBody: courseWorkBody,
  });

  return response.data.id!;
}

/**
 * Sync a grade back to Google Classroom
 */
export async function syncGradeToClassroom(
  connectionId: number,
  googleCourseId: string,
  googleCourseWorkId: string,
  studentEmail: string,
  score: number
): Promise<boolean> {
  const { classroom } = await getClassroomClient(connectionId);

  try {
    // Find the student submission
    const subsResponse = await classroom.courses.courseWork.studentSubmissions.list({
      courseId: googleCourseId,
      courseWorkId: googleCourseWorkId,
    });

    const submissions = subsResponse.data.studentSubmissions || [];
    
    // Find submission by student - we need to match by userId
    // First get the roster to find the student
    const studentsResponse = await classroom.courses.students.list({
      courseId: googleCourseId,
    });
    
    const students = studentsResponse.data.students || [];
    const student = students.find(s => 
      s.profile?.emailAddress?.toLowerCase() === studentEmail.toLowerCase()
    );

    if (!student) {
      console.log(`Student ${studentEmail} not found in Google Classroom course`);
      return false;
    }

    const studentSubmission = submissions.find(s => s.userId === student.userId);
    if (!studentSubmission) {
      console.log(`No submission found for student ${studentEmail}`);
      return false;
    }

    // Patch the grade
    await classroom.courses.courseWork.studentSubmissions.patch({
      courseId: googleCourseId,
      courseWorkId: googleCourseWorkId,
      id: studentSubmission.id!,
      updateMask: "assignedGrade,draftGrade",
      requestBody: {
        assignedGrade: score,
        draftGrade: score,
      },
    });

    // Return the graded submission
    await classroom.courses.courseWork.studentSubmissions.return({
      courseId: googleCourseId,
      courseWorkId: googleCourseWorkId,
      id: studentSubmission.id!,
    });

    return true;
  } catch (error: any) {
    console.error(`Failed to sync grade for ${studentEmail}:`, error.message);
    return false;
  }
}

/**
 * List students in a Google Classroom course
 */
export async function listGoogleClassroomStudents(connectionId: number, googleCourseId: string) {
  const { classroom } = await getClassroomClient(connectionId);

  const response = await classroom.courses.students.list({
    courseId: googleCourseId,
    pageSize: 100,
  });

  return (response.data.students || []).map(student => ({
    userId: student.userId!,
    email: student.profile?.emailAddress || "",
    name: student.profile?.name?.fullName || "",
  }));
}

/**
 * Log a sync operation
 */
export async function logSyncOperation(
  connectionId: number,
  action: "push_assignment" | "sync_grades" | "pull_roster" | "full_sync",
  status: "pending" | "success" | "failed",
  details?: string,
  errorMessage?: string,
  itemsProcessed?: number
) {
  const database = await getDb();
  if (!database) return;

  await database.insert(classroomSyncLogs).values({
    connectionId,
    action,
    status,
    details,
    errorMessage,
    itemsProcessed: itemsProcessed || 0,
  });
}
