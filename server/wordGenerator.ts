import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";
import type { PedagogicalSheet, LessonPlan, TeacherExam } from "../drizzle/schema";

// Helper to create section heading
function createHeading(text: string): Paragraph {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.RIGHT,
    spacing: { before: 400, after: 200 },
    border: {
      bottom: {
        color: "4472C4",
        space: 1,
        style: BorderStyle.SINGLE,
        size: 6,
      },
    },
  });
}

// Helper to create labeled content
function createLabeledContent(label: string, content: string): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: `${label}: `,
          bold: true,
          size: 24,
        }),
        new TextRun({
          text: content,
          size: 24,
        }),
      ],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 100, after: 100 },

    }),
  ];
}

export async function generatePedagogicalSheetWord(sheet: PedagogicalSheet): Promise<Buffer> {
  const educationLevelMap = {
    primary: "ابتدائي",
    middle: "إعدادي",
    secondary: "ثانوي",
  };

  const paragraphs: Paragraph[] = [
    // Title
    new Paragraph({
      text: "مذكرة بيداغوجية",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Identification section
    createHeading("معلومات التعريف"),
    ...createLabeledContent("السنة الدراسية", sheet.schoolYear),
    ...createLabeledContent("المستوى", educationLevelMap[sheet.educationLevel]),
    ...createLabeledContent("الصف", sheet.grade),
    ...createLabeledContent("المادة", sheet.subject),
    ...createLabeledContent("عنوان الدرس", sheet.lessonTitle),
  ];

  if (sheet.duration) {
    paragraphs.push(...createLabeledContent("المدة", `${sheet.duration} دقيقة`));
  }

  // Objectives
  if (sheet.lessonObjectives) {
    paragraphs.push(
      createHeading("الأهداف والكفايات"),
      new Paragraph({
        text: sheet.lessonObjectives,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
  
      })
    );
  }

  // Materials
  if (sheet.materials) {
    paragraphs.push(
      createHeading("الوسائل المطلوبة"),
      new Paragraph({
        text: sheet.materials,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
  
      })
    );
  }

  // Introduction
  if (sheet.introduction) {
    paragraphs.push(
      createHeading("المقدمة / التمهيد"),
      new Paragraph({
        text: sheet.introduction,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
  
      })
    );
  }

  // Main Activities
  if (sheet.mainActivities && Array.isArray(sheet.mainActivities) && sheet.mainActivities.length > 0) {
    paragraphs.push(createHeading("الأنشطة الرئيسية"));
    sheet.mainActivities.forEach((activity, index) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${activity.title} (${activity.duration} دقيقة)`,
              bold: true,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 100 },
        }),
        new Paragraph({
          text: `   ${activity.description}`,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
    
        })
      );
    });
  }

  // Conclusion
  if (sheet.conclusion) {
    paragraphs.push(
      createHeading("الخاتمة"),
      new Paragraph({
        text: sheet.conclusion,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
  
      })
    );
  }

  // Evaluation
  if (sheet.evaluation) {
    paragraphs.push(
      createHeading("التقييم"),
      new Paragraph({
        text: sheet.evaluation,
        alignment: AlignmentType.RIGHT,
        spacing: { after: 200 },
  
      })
    );
  }

  // References
  if (sheet.guidePageReference || sheet.programReference) {
    paragraphs.push(createHeading("المراجع الرسمية"));
    if (sheet.guidePageReference) {
      paragraphs.push(...createLabeledContent("مرجع دليل المعلم", sheet.guidePageReference));
    }
    if (sheet.programReference) {
      paragraphs.push(...createLabeledContent("مرجع البرنامج الرسمي", sheet.programReference));
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function generateLessonPlanWord(plan: LessonPlan): Promise<Buffer> {
  const educationLevelMap = {
    primary: "ابتدائي",
    middle: "إعدادي",
    secondary: "ثانوي",
  };

  const paragraphs: Paragraph[] = [
    // Title
    new Paragraph({
      text: "خطة دروس",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Identification
    createHeading("معلومات التعريف"),
    ...createLabeledContent("السنة الدراسية", plan.schoolYear),
    ...createLabeledContent("المستوى", educationLevelMap[plan.educationLevel]),
    ...createLabeledContent("الصف", plan.grade),
    ...createLabeledContent("المادة", plan.subject),
    ...createLabeledContent("عنوان الخطة", plan.planTitle),
  ];

  if (plan.startDate) {
    paragraphs.push(...createLabeledContent("تاريخ البداية", new Date(plan.startDate).toLocaleDateString("ar-TN")));
  }
  if (plan.endDate) {
    paragraphs.push(...createLabeledContent("تاريخ النهاية", new Date(plan.endDate).toLocaleDateString("ar-TN")));
  }
  if (plan.totalLessons) {
    paragraphs.push(...createLabeledContent("عدد الدروس", plan.totalLessons.toString()));
  }

  // Lessons
  if (plan.lessons && Array.isArray(plan.lessons) && plan.lessons.length > 0) {
    paragraphs.push(createHeading("الدروس"));

    plan.lessons.forEach((lesson, index) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `الأسبوع ${lesson.week}: ${lesson.lessonTitle}`,
              bold: true,
              size: 26,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 100 },
        })
      );
      if (lesson.objectives) {
        paragraphs.push(
          new Paragraph({
            text: `الأهداف: ${lesson.objectives}`,
            alignment: AlignmentType.RIGHT,
            spacing: { after: 50 },
      
          })
        );
      }
      paragraphs.push(
        new Paragraph({
          text: `المدة: ${lesson.duration} دقيقة`,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
    
        })
      );
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}

export async function generateTeacherExamWord(exam: TeacherExam): Promise<Buffer> {
  const educationLevelMap = {
    primary: "ابتدائي",
    middle: "إعدادي",
    secondary: "ثانوي",
  };

  const examTypeMap = {
    diagnostic: "تشخيصي",
    formative: "تكويني",
    summative: "ختامي",
  };

  const paragraphs: Paragraph[] = [
    // Title
    new Paragraph({
      text: "اختبار",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Identification
    createHeading("معلومات التعريف"),
    ...createLabeledContent("السنة الدراسية", exam.schoolYear),
    ...createLabeledContent("المستوى", educationLevelMap[exam.educationLevel]),
    ...createLabeledContent("الصف", exam.grade),
    ...createLabeledContent("المادة", exam.subject),
    ...createLabeledContent("عنوان الاختبار", exam.examTitle),
    ...createLabeledContent("نوع الاختبار", examTypeMap[exam.examType]),
  ];

  if (exam.duration) {
    paragraphs.push(...createLabeledContent("المدة", `${exam.duration} دقيقة`));
  }
  paragraphs.push(...createLabeledContent("المجموع", `${exam.totalPoints} نقطة`));

  // Questions
  if (exam.questions && Array.isArray(exam.questions) && exam.questions.length > 0) {
    paragraphs.push(createHeading("الأسئلة"));

    exam.questions.forEach((question, index) => {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `السؤال ${index + 1} (${question.points} نقاط):`,
              bold: true,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: question.questionText,
          alignment: AlignmentType.RIGHT,
          spacing: { after: 100 },
    
        })
      );

      if (question.questionType === "mcq" && question.options) {
        question.options.forEach((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          paragraphs.push(
            new Paragraph({
              text: `${letter}. ${option}`,
              alignment: AlignmentType.RIGHT,
              spacing: { after: 50 },
        
            })
          );
        });
      }
    });
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBuffer(doc);
}
