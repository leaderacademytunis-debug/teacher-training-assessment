import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  followUpReports, progressEvaluations, generatedTherapeuticExercises,
} from "../../drizzle/schema";
import { eq, and, desc, count } from "drizzle-orm";

// ===== STUDENT DASHBOARD ROUTER =====
export const studentDashboardRouter = router({

  // ===== GET ALL STUDENTS =====
  getStudents: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const userId = String(ctx.user.id);

    // Get unique student names from all three tables
    const reportStudents = await database
      .select({ studentName: followUpReports.studentName })
      .from(followUpReports)
      .where(eq(followUpReports.userId, userId))
      .groupBy(followUpReports.studentName);

    const evalStudents = await database
      .select({ studentName: progressEvaluations.studentName })
      .from(progressEvaluations)
      .where(eq(progressEvaluations.userId, userId))
      .groupBy(progressEvaluations.studentName);

    const exerciseStudents = await database
      .select({ studentName: generatedTherapeuticExercises.studentName })
      .from(generatedTherapeuticExercises)
      .where(eq(generatedTherapeuticExercises.userId, userId))
      .groupBy(generatedTherapeuticExercises.studentName);

    // Merge unique student names
    const nameSet = new Set<string>();
    [...reportStudents, ...evalStudents, ...exerciseStudents].forEach(s => {
      if (s.studentName) nameSet.add(s.studentName);
    });

    // For each student, get summary stats
    const students = await Promise.all(
      Array.from(nameSet).map(async (name) => {
        const [reportCount] = await database.select({ count: count() }).from(followUpReports)
          .where(and(eq(followUpReports.userId, userId), eq(followUpReports.studentName, name)));
        const [evalCount] = await database.select({ count: count() }).from(progressEvaluations)
          .where(and(eq(progressEvaluations.userId, userId), eq(progressEvaluations.studentName, name)));
        const [exerciseCount] = await database.select({ count: count() }).from(generatedTherapeuticExercises)
          .where(and(eq(generatedTherapeuticExercises.userId, userId), eq(generatedTherapeuticExercises.studentName, name)));

        // Get latest report for difficulty type and scores
        const [latestReport] = await database.select().from(followUpReports)
          .where(and(eq(followUpReports.userId, userId), eq(followUpReports.studentName, name), eq(followUpReports.status, "completed")))
          .orderBy(desc(followUpReports.createdAt)).limit(1);

        // Get latest evaluation for progress
        const [latestEval] = await database.select().from(progressEvaluations)
          .where(and(eq(progressEvaluations.userId, userId), eq(progressEvaluations.studentName, name), eq(progressEvaluations.status, "completed")))
          .orderBy(desc(progressEvaluations.createdAt)).limit(1);

        return {
          name,
          reportCount: reportCount?.count || 0,
          evalCount: evalCount?.count || 0,
          exerciseCount: exerciseCount?.count || 0,
          difficultyType: latestReport?.difficultyType || latestEval?.difficultyType || null,
          gradeLevel: latestReport?.gradeLevel || latestEval?.gradeLevel || null,
          latestScores: latestReport ? {
            reading: latestReport.readingScore,
            writing: latestReport.writingScore,
            math: latestReport.mathScore,
            attention: latestReport.attentionScore,
            social: latestReport.socialScore,
            motivation: latestReport.motivationScore,
          } : null,
          overallProgress: latestEval?.overallProgress || null,
          progressPercentage: latestEval?.progressPercentage || null,
          lastActivity: latestReport?.createdAt || latestEval?.createdAt || null,
        };
      })
    );

    // Sort by last activity (most recent first)
    students.sort((a, b) => {
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });

    return students;
  }),

  // ===== GET STUDENT DETAIL =====
  getStudentDetail: protectedProcedure
    .input(z.object({ studentName: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const database = (await getDb())!;
      const userId = String(ctx.user.id);

      // Get all reports for this student
      const reports = await database.select().from(followUpReports)
        .where(and(eq(followUpReports.userId, userId), eq(followUpReports.studentName, input.studentName)))
        .orderBy(desc(followUpReports.createdAt)).limit(20);

      // Get all evaluations
      const evaluations = await database.select().from(progressEvaluations)
        .where(and(eq(progressEvaluations.userId, userId), eq(progressEvaluations.studentName, input.studentName)))
        .orderBy(desc(progressEvaluations.createdAt)).limit(20);

      // Get all exercises
      const exercises = await database.select().from(generatedTherapeuticExercises)
        .where(and(eq(generatedTherapeuticExercises.userId, userId), eq(generatedTherapeuticExercises.studentName, input.studentName)))
        .orderBy(desc(generatedTherapeuticExercises.createdAt)).limit(50);

      // Build timeline data from reports
      const timeline: Array<{
        date: any;
        type: "report" | "evaluation" | "exercise";
        title: string;
        scores: Record<string, number | null> | null;
      }> = [];

      reports.filter(r => r.status === "completed").forEach(r => {
        timeline.push({
          date: r.createdAt,
          type: "report",
          title: r.reportTitle || "تقرير متابعة",
          scores: {
            reading: r.readingScore,
            writing: r.writingScore,
            math: r.mathScore,
            attention: r.attentionScore,
            social: r.socialScore,
            motivation: r.motivationScore,
          },
        });
      });

      evaluations.filter(e => e.status === "completed").forEach(e => {
        timeline.push({
          date: e.createdAt,
          type: "evaluation",
          title: e.analysisTitle || "تقييم التقدم",
          scores: null,
        });
      });

      exercises.filter(e => e.status === "completed").forEach(e => {
        timeline.push({
          date: e.createdAt,
          type: "exercise",
          title: e.title || "تمارين علاجية",
          scores: null,
        });
      });

      // Sort timeline by date
      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return {
        studentName: input.studentName,
        reports,
        evaluations,
        exercises,
        timeline,
      };
    }),

  // ===== GET GLOBAL STATS =====
  getGlobalStats: protectedProcedure.query(async ({ ctx }) => {
    const database = (await getDb())!;
    const userId = String(ctx.user.id);

    const [totalReports] = await database.select({ count: count() }).from(followUpReports)
      .where(eq(followUpReports.userId, userId));
    const [totalEvals] = await database.select({ count: count() }).from(progressEvaluations)
      .where(eq(progressEvaluations.userId, userId));
    const [totalExercises] = await database.select({ count: count() }).from(generatedTherapeuticExercises)
      .where(eq(generatedTherapeuticExercises.userId, userId));

    // Count unique students
    const reportStudents = await database
      .select({ studentName: followUpReports.studentName })
      .from(followUpReports)
      .where(eq(followUpReports.userId, userId))
      .groupBy(followUpReports.studentName);

    const evalStudents = await database
      .select({ studentName: progressEvaluations.studentName })
      .from(progressEvaluations)
      .where(eq(progressEvaluations.userId, userId))
      .groupBy(progressEvaluations.studentName);

    const exerciseStudents = await database
      .select({ studentName: generatedTherapeuticExercises.studentName })
      .from(generatedTherapeuticExercises)
      .where(eq(generatedTherapeuticExercises.userId, userId))
      .groupBy(generatedTherapeuticExercises.studentName);

    const nameSet = new Set<string>();
    [...reportStudents, ...evalStudents, ...exerciseStudents].forEach(s => {
      if (s.studentName) nameSet.add(s.studentName);
    });

    // Difficulty type distribution
    const difficultyDist: Record<string, number> = {};
    const allReports = await database.select({ difficultyType: followUpReports.difficultyType })
      .from(followUpReports).where(eq(followUpReports.userId, userId));
    allReports.forEach(r => {
      if (r.difficultyType) {
        difficultyDist[r.difficultyType] = (difficultyDist[r.difficultyType] || 0) + 1;
      }
    });

    return {
      totalStudents: nameSet.size,
      totalReports: totalReports?.count || 0,
      totalEvaluations: totalEvals?.count || 0,
      totalExercises: totalExercises?.count || 0,
      difficultyDistribution: Object.entries(difficultyDist).map(([type, cnt]) => ({ type, count: cnt })),
    };
  }),
});
