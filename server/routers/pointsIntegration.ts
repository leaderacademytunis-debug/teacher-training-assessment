/**
 * Points Integration Helper
 * This file contains helper functions to track competency points
 * when users complete actions in various tools
 */

import { trackCompetencyPoints } from "../db";

// ============================================
// EDUGPT - PEDAGOGICAL SHEETS
// ============================================

export async function trackEdugptSheetSaved(userId: number, sheetId?: string) {
  await trackCompetencyPoints(userId, "edugpt_sheet", sheetId, "pedagogical_sheet");
}

// ============================================
// EXAM BUILDER - TEST CREATION
// ============================================

export async function trackExamBuilderExport(userId: number, examId?: string) {
  await trackCompetencyPoints(userId, "test_builder", examId, "teacher_exam");
}

// ============================================
// SMART GRADING - CORRECTION
// ============================================

export async function trackSmartGradingComplete(userId: number, gradingSessionId?: string) {
  await trackCompetencyPoints(userId, "smart_correction", gradingSessionId, "grading_session");
}

// ============================================
// VISUAL STUDIO - IMAGE GENERATION
// ============================================

export async function trackVisualStudioImageGenerated(userId: number, imageId?: string) {
  await trackCompetencyPoints(userId, "visual_studio", imageId, "generated_image");
}

// ============================================
// ULTIMATE STUDIO - VIDEO EXPORT
// ============================================

export async function trackUltimateStudioVideoExport(userId: number, videoId?: string) {
  await trackCompetencyPoints(userId, "ultimate_studio", videoId, "studio_project");
}

// ============================================
// MARKETPLACE - CONTENT PUBLISHING
// ============================================

export async function trackMarketplacePublish(userId: number, itemId?: string) {
  await trackCompetencyPoints(userId, "marketplace_publish", itemId, "marketplace_item");
}

// ============================================
// COURSES - COMPLETION
// ============================================

export async function trackCourseCompletion(userId: number, courseId?: string) {
  await trackCompetencyPoints(userId, "course_completion", courseId, "course");
}
