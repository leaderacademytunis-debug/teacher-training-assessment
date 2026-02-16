import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Edit Questions Operations", () => {
  it("should get question by id", async () => {
    // Create a test exam first
    const exam = await db.createExam({
      courseId: 1,
      titleAr: "اختبار تجريبي",
      descriptionAr: "اختبار للتحقق من تحرير الأسئلة",
      duration: 30,
      passingScore: 60,
      createdBy: 1,
    });

    // Create a test question
    const question = await db.createQuestion({
      examId: exam.id,
      questionTextAr: "ما هو 2+2؟",
      options: {
        optionA: "3",
        optionB: "4",
        optionC: "5",
        optionD: "6",
      },
      correctAnswer: "B",
      orderIndex: 0,
      points: 1,
    });

    // Get the question by ID
    const retrieved = await db.getQuestionById(question.id);
    
    expect(retrieved).toBeDefined();
    expect(retrieved?.questionTextAr).toBe("ما هو 2+2؟");
    expect(retrieved?.options.optionB).toBe("4");
    expect(retrieved?.correctAnswer).toBe("B");
  });

  it("should update question text and options", async () => {
    // Create a test exam
    const exam = await db.createExam({
      courseId: 1,
      titleAr: "اختبار تحديث",
      descriptionAr: "اختبار لتحديث الأسئلة",
      duration: 30,
      passingScore: 60,
      createdBy: 1,
    });

    // Create a question
    const question = await db.createQuestion({
      examId: exam.id,
      questionTextAr: "سؤال قديم",
      options: {
        optionA: "أ",
        optionB: "ب",
        optionC: "ج",
        optionD: "د",
      },
      correctAnswer: "A",
      orderIndex: 0,
      points: 1,
    });

    // Update the question
    await db.updateQuestion(question.id, {
      questionTextAr: "سؤال محدث",
      options: {
        optionA: "خيار أول",
        optionB: "خيار ثاني",
        optionC: "خيار ثالث",
        optionD: "خيار رابع",
      },
      correctAnswer: "C",
    });

    // Retrieve and verify
    const updated = await db.getQuestionById(question.id);
    expect(updated?.questionTextAr).toBe("سؤال محدث");
    expect(updated?.options.optionA).toBe("خيار أول");
    expect(updated?.correctAnswer).toBe("C");
  });

  it("should delete a question", async () => {
    // Create exam and question
    const exam = await db.createExam({
      courseId: 1,
      titleAr: "اختبار حذف",
      descriptionAr: "اختبار لحذف الأسئلة",
      duration: 30,
      passingScore: 60,
      createdBy: 1,
    });

    const question = await db.createQuestion({
      examId: exam.id,
      questionTextAr: "سؤال للحذف",
      options: {
        optionA: "أ",
        optionB: "ب",
        optionC: "ج",
        optionD: "د",
      },
      correctAnswer: "A",
      orderIndex: 0,
      points: 1,
    });

    // Delete the question
    await db.deleteQuestion(question.id);

    // Verify deletion
    const deleted = await db.getQuestionById(question.id);
    expect(deleted).toBeUndefined();
  });

  it("should reorder questions correctly", async () => {
    // Create exam
    const exam = await db.createExam({
      courseId: 1,
      titleAr: "اختبار إعادة ترتيب",
      descriptionAr: "اختبار لإعادة ترتيب الأسئلة",
      duration: 30,
      passingScore: 60,
      createdBy: 1,
    });

    // Create 3 questions
    const q1 = await db.createQuestion({
      examId: exam.id,
      questionTextAr: "السؤال 1",
      options: { optionA: "أ", optionB: "ب", optionC: "ج", optionD: "د" },
      correctAnswer: "A",
      orderIndex: 0,
      points: 1,
    });

    const q2 = await db.createQuestion({
      examId: exam.id,
      questionTextAr: "السؤال 2",
      options: { optionA: "أ", optionB: "ب", optionC: "ج", optionD: "د" },
      correctAnswer: "B",
      orderIndex: 1,
      points: 1,
    });

    const q3 = await db.createQuestion({
      examId: exam.id,
      questionTextAr: "السؤال 3",
      options: { optionA: "أ", optionB: "ب", optionC: "ج", optionD: "د" },
      correctAnswer: "C",
      orderIndex: 2,
      points: 1,
    });

    // Move q3 to position 0 (should shift q1 and q2 down)
    await db.updateQuestion(q3.id, { orderIndex: 0 });
    await db.updateQuestion(q1.id, { orderIndex: 1 });
    await db.updateQuestion(q2.id, { orderIndex: 2 });

    // Verify new order
    const questions = await db.getQuestionsByExamId(exam.id);
    expect(questions[0].questionTextAr).toBe("السؤال 3");
    expect(questions[1].questionTextAr).toBe("السؤال 1");
    expect(questions[2].questionTextAr).toBe("السؤال 2");
  });
});
