/**
 * Career Pathway Router
 * Provides endpoints for career pathway showcase and statistics
 */

import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { users, jobPostings, partnerSchools, teacherPortfolios, competencyPoints } from "../../drizzle/schema";
import { eq, count } from "drizzle-orm";
import { z } from "zod";

export const careerPathwayRouter = router({
  /**
   * Get career pathway statistics for homepage
   */
  getCareerPathwayStats: publicProcedure.query(async () => {
    try {
      const database = (await getDb())!;

      // Count teachers with public profiles (in showcase)
      const teachersInShowcaseResult = await database
        .select({ count: count() })
        .from(users)
        .where(eq(users.role, "user"));

      // Count active job postings
      const activeJobPostingsResult = await database
        .select({ count: count() })
        .from(jobPostings);

      // Count partner schools
      const partnerSchoolsResult = await database
        .select({ count: count() })
        .from(partnerSchools);

      return {
        teachersInShowcase: teachersInShowcaseResult[0]?.count || 0,
        activeJobPostings: activeJobPostingsResult[0]?.count || 0,
        partnerSchoolsCount: partnerSchoolsResult[0]?.count || 0,
      };
    } catch (error) {
      console.error("Error fetching career pathway stats:", error);
      return {
        teachersInShowcase: 0,
        activeJobPostings: 0,
        partnerSchoolsCount: 0,
      };
    }
  }),

  /**
   * Get public teacher profiles for showcase
   */
  getPublicTeacherProfiles: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        specialty: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const database = (await getDb())!;

        // Get teachers with public profiles
        const teachers = await database
          .select({
            id: users.id,
            fullName: users.fullName,
            username: users.username,
            specialty: users.specialty,
            region: users.region,
            totalPoints: competencyPoints.totalPoints,
            level: competencyPoints.level,
            isVerified: users.isVerified,
          })
          .from(users)
          .leftJoin(competencyPoints, eq(users.id, competencyPoints.userId))
          .where(eq(users.role, "user"))
          .limit(20);

        return teachers;
      } catch (error) {
        console.error("Error fetching teacher profiles:", error);
        return [];
      }
    }),

  /**
   * Get active job postings
   */
  getActiveJobPostings: publicProcedure.query(async () => {
    try {
      const database = (await getDb())!;

      const jobs = await database
        .select({
          id: jobPostings.id,
          title: jobPostings.title,
          schoolName: jobPostings.schoolName,
          location: jobPostings.location,
          description: jobPostings.description,
        })
        .from(jobPostings)
        .limit(10);

      return jobs;
    } catch (error) {
      console.error("Error fetching job postings:", error);
      return [];
    }
  }),
});
