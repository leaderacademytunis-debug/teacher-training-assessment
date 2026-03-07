/**
 * wordExporter.ts
 * تصدير الجذاذات والمخططات السنوية إلى ملف Word بقالب Leader Academy
 */

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  ShadingType,
  Header,
  Footer,
  ImageRun,
  PageOrientation,
  convertInchesToTwip,
} from "docx";
import * as fs from "fs";
import * as path from "path";

// ألوان Leader Academy
const COLORS = {
  primary: "1B4F72",    // أزرق داكن
  secondary: "2E86C1",  // أزرق متوسط
  accent: "F39C12",     // ذهبي/برتقالي
  light: "EBF5FB",      // أزرق فاتح جداً
  lightGray: "F2F3F4",  // رمادي فاتح
  white: "FFFFFF",
  text: "2C3E50",       // رمادي داكن للنص
  green: "1E8449",      // أخضر للتقييم
};

// خط عربي رسمي
const ARABIC_FONT = "Traditional Arabic";
const LATIN_FONT = "Calibri";

interface JathathHeader {
  title: string;
  subject: string;
  level: string;
  duration: string;
  trimester: string;
  terminalCompetency: string;
  distinctiveObjective: string;
  tools: string;
}

interface JathathStage {
  name: string;
  teacherRole: string;
  studentRole: string;
  duration: string;
  content: string;
}

interface JathathEvaluation {
  type: string;
  question: string;
  successCriteria: string;
  correctAnswer: string;
}

export interface JathathJSON {
  Header: JathathHeader;
  Objectives: string[];
  Stages: JathathStage[];
  Evaluation: JathathEvaluation;
}

// ─── مساعدات التنسيق ───────────────────────────────────────────────────────

function arabicText(text: string, options?: {
  bold?: boolean;
  size?: number;
  color?: string;
  italics?: boolean;
}): TextRun {
  return new TextRun({
    text,
    font: ARABIC_FONT,
    bold: options?.bold ?? false,
    size: (options?.size ?? 22) * 2, // half-points
    color: options?.color ?? COLORS.text,
    italics: options?.italics ?? false,
    rightToLeft: true,
  });
}

function sectionTitle(text: string): Paragraph {
  return new Paragraph({
    children: [arabicText(text, { bold: true, size: 14, color: COLORS.white })],
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
    spacing: { before: 200, after: 100 },
    indent: { left: 200, right: 200 },
    bidirectional: true,
  });
}
function bodyParagraph(text: string, bold = false): Paragraph {
  return new Paragraph({
    children: [arabicText(String(text || "—"), { size: 11, bold })],
    alignment: AlignmentType.RIGHT,
    spacing: { before: 60, after: 60 },
    bidirectional: true,
  });
}
function twoColRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: COLORS.light, fill: COLORS.light },
        children: [new Paragraph({
          children: [arabicText(label, { bold: true, size: 11, color: COLORS.primary })],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        })],
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [new Paragraph({
          children: [arabicText(String(value || "—"), { size: 11 })],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        })],
      }),
    ],
  });
}

function labeledRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({
          children: [arabicText(value, { size: 11 })],
          alignment: AlignmentType.RIGHT,
          bidirectional: true,
        })],
        shading: { type: ShadingType.SOLID, color: COLORS.white, fill: COLORS.white },
        width: { size: 70, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({
          children: [arabicText(label, { bold: true, size: 11, color: COLORS.white })],
          alignment: AlignmentType.CENTER,
          bidirectional: true,
        })],
        shading: { type: ShadingType.SOLID, color: COLORS.secondary, fill: COLORS.secondary },
        width: { size: 30, type: WidthType.PERCENTAGE },
      }),
    ],
  });
}

// ─── بناء وثيقة Word ────────────────────────────────────────────────────────

export async function exportJathathToWord(data: JathathJSON): Promise<Buffer> {
  const { Header, Objectives, Stages, Evaluation } = data;

  const sections: any[] = [];

  // ── الترويسة ──────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [arabicText("الجمهورية التونسية", { bold: true, size: 11, color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText("وزارة التربية", { bold: true, size: 11, color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText("المحرك البيداغوجي الذكي — Leader Academy", { bold: true, size: 16, color: COLORS.accent })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 50 },
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText("نسخة تونس 2026", { size: 11, color: COLORS.secondary, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      bidirectional: true,
    }),
  );

  // ── عنوان الجذاذة ─────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [arabicText(`جذاذة: ${Header.title}`, { bold: true, size: 18, color: COLORS.white })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
      spacing: { before: 200, after: 200 },
      bidirectional: true,
    }),
  );

  // ── المعطيات العامة ────────────────────────────────────────────────────────
  sections.push(sectionTitle("◀ المعطيات العامة"));
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        labeledRow("المادة", Header.subject),
        labeledRow("المستوى", Header.level),
        labeledRow("الثلاثي", Header.trimester),
        labeledRow("مدة الحصة", Header.duration),
        labeledRow("الكفاية الختامية", Header.terminalCompetency),
        labeledRow("الهدف المميز", Header.distinctiveObjective),
        labeledRow("الوسائل والأدوات", Header.tools),
      ],
    }),
  );

  // ── الأهداف الإجرائية ─────────────────────────────────────────────────────
  sections.push(sectionTitle("◀ الأهداف الإجرائية"));
  Objectives.forEach((obj, i) => {
    sections.push(
      new Paragraph({
        children: [arabicText(`${i + 1}. ${obj}`, { size: 11 })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 80, after: 80 },
        indent: { right: 400 },
        bidirectional: true,
      }),
    );
  });

  // ── المسار البيداغوجي ─────────────────────────────────────────────────────
  sections.push(sectionTitle("◀ المسار البيداغوجي"));

  // رأس جدول المراحل
  const stageHeaderRow = new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ children: [arabicText("الزمن", { bold: true, size: 10, color: COLORS.white })], alignment: AlignmentType.CENTER, bidirectional: true })],
        shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
        width: { size: 12, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ children: [arabicText("دور المتعلم", { bold: true, size: 10, color: COLORS.white })], alignment: AlignmentType.CENTER, bidirectional: true })],
        shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
        width: { size: 28, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ children: [arabicText("دور المعلم", { bold: true, size: 10, color: COLORS.white })], alignment: AlignmentType.CENTER, bidirectional: true })],
        shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
        width: { size: 28, type: WidthType.PERCENTAGE },
      }),
      new TableCell({
        children: [new Paragraph({ children: [arabicText("المرحلة", { bold: true, size: 10, color: COLORS.white })], alignment: AlignmentType.CENTER, bidirectional: true })],
        shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
        width: { size: 32, type: WidthType.PERCENTAGE },
      }),
    ],
  });

  const stageRows = Stages.map((stage, i) => {
    const bgColor = i % 2 === 0 ? COLORS.light : COLORS.white;
    return new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [arabicText(stage.duration, { size: 10 })], alignment: AlignmentType.CENTER, bidirectional: true })],
          shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
        }),
        new TableCell({
          children: [new Paragraph({ children: [arabicText(stage.studentRole, { size: 10 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
          shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
        }),
        new TableCell({
          children: [new Paragraph({ children: [arabicText(stage.teacherRole, { size: 10 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
          shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
        }),
        new TableCell({
          children: [
            new Paragraph({ children: [arabicText(stage.name, { bold: true, size: 11, color: COLORS.secondary })], alignment: AlignmentType.RIGHT, bidirectional: true }),
            new Paragraph({ children: [arabicText(stage.content, { size: 10 })], alignment: AlignmentType.RIGHT, bidirectional: true }),
          ],
          shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
        }),
      ],
    });
  });

  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [stageHeaderRow, ...stageRows],
    }),
  );

  // ── التقييم ───────────────────────────────────────────────────────────────
  sections.push(sectionTitle("◀ التقييم الختامي"));
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        labeledRow("نوع التقييم", Evaluation.type),
        labeledRow("سؤال التقييم", Evaluation.question),
        labeledRow("معيار النجاح", Evaluation.successCriteria),
        labeledRow("الإجابة الصحيحة", Evaluation.correctAnswer),
      ],
    }),
  );

  // ── التذييل ───────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    new Paragraph({
      children: [arabicText("🇹🇳 الجمهورية التونسية — Leader Academy — leaderacademy.school", { size: 9, color: COLORS.secondary, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      bidirectional: true,
    }),
  );

  // ── بناء الوثيقة ──────────────────────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children: sections,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: ARABIC_FONT,
            size: 22,
            color: COLORS.text,
          },
        },
      },
    },
  });

  return await Packer.toBuffer(doc);
}

// ─── تصدير المخطط السنوي إلى Word ─────────────────────────────────────────

export interface AnnualPlanRow {
  trimester: string;
  unit: string;
  activity: string;
  competencyComponent: string;
  distinguishedObjective: string;
  content: string;
  sessions: number;
}

export interface AnnualPlanData {
  subject: string;
  grade: string;
  schoolYear?: string;
  rows: AnnualPlanRow[];
}

export async function exportAnnualPlanToWord(data: AnnualPlanData): Promise<Buffer> {
  const sections: any[] = [];

  // ── الترويسة ──────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [arabicText("الجمهورية التونسية — وزارة التربية", { bold: true, size: 12, color: COLORS.primary })],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText("المحرك البيداغوجي الذكي — Leader Academy", { bold: true, size: 16, color: COLORS.accent })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 50 },
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText(`المخطط السنوي — مادة: ${data.subject} — السنة: ${data.grade} ابتدائي`, { bold: true, size: 18, color: COLORS.white })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
      spacing: { before: 200, after: 200 },
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText(`السنة الدراسية: ${data.schoolYear || "2025-2026"}`, { size: 11, color: COLORS.secondary })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      bidirectional: true,
    }),
  );

  // ── رأس الجدول ─────────────────────────────────────────────────────────────
  const headerCellStyle = (text: string) => new TableCell({
    children: [new Paragraph({
      children: [arabicText(text, { bold: true, size: 10, color: COLORS.white })],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
    })],
    shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
  });

  const headerRow = new TableRow({
    children: [
      headerCellStyle("عدد الحصص"),
      headerCellStyle("المحتوى"),
      headerCellStyle("الهدف المميز"),
      headerCellStyle("مكوّن الكفاية"),
      headerCellStyle("النشاط"),
      headerCellStyle("الفترة"),
      headerCellStyle("الثلاثي"),
    ],
    tableHeader: true,
  });

  // ── صفوف البيانات ──────────────────────────────────────────────────────────
  const dataRows = data.rows.map((row, i) => {
    const bgColor = i % 2 === 0 ? COLORS.light : COLORS.white;
    const cell = (text: string, bold = false) => new TableCell({
      children: [new Paragraph({
        children: [arabicText(text, { size: 10, bold })],
        alignment: AlignmentType.RIGHT,
        bidirectional: true,
      })],
      shading: { type: ShadingType.SOLID, color: bgColor, fill: bgColor },
    });

    return new TableRow({
      children: [
        cell(String(row.sessions)),
        cell(row.content),
        cell(row.distinguishedObjective),
        cell(row.competencyComponent),
        cell(row.activity, true),
        cell(row.unit),
        cell(row.trimester, true),
      ],
    });
  });

  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }),
  );

  // ── التذييل ───────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    new Paragraph({
      children: [arabicText("🇹🇳 الجمهورية التونسية — Leader Academy — leaderacademy.school", { size: 9, color: COLORS.secondary, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      bidirectional: true,
    }),
  );

  // ── بناء الوثيقة ──────────────────────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.7),
              right: convertInchesToTwip(0.7),
              bottom: convertInchesToTwip(0.7),
              left: convertInchesToTwip(0.7),
            },
            size: {
              orientation: PageOrientation.LANDSCAPE,
            },
          },
        },
        children: sections,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: ARABIC_FONT,
            size: 20,
            color: COLORS.text,
          },
        },
      },
    },
  });

  return await Packer.toBuffer(doc);
}

// ─────────────────────────────────────────────────────────────────────────────
// exportLessonSheetToWord — جذاذة كاملة مولّدة من المخطط السنوي
// ─────────────────────────────────────────────────────────────────────────────

interface LessonSheetInput {
  sheet: Record<string, unknown>;
  schoolName?: string;
  teacherName?: string;
  schoolYear?: string;
}

export async function exportLessonSheetToWord(data: LessonSheetInput): Promise<Buffer> {
  const s = data.sheet as Record<string, unknown>;
  const sections: (Paragraph | Table)[] = [];

  // ── الترويسة ──────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({
      children: [arabicText("الجمهورية التونسية — وزارة التربية", { bold: true, size: 11, color: COLORS.secondary })],
      alignment: AlignmentType.CENTER,
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText("المحرك البيداغوجي الذكي — Leader Academy", { bold: true, size: 14, color: COLORS.accent })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 80 },
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText(`جذاذة درس: ${String(s.lessonTitle || s.distinguishedObjective || "درس")}`, { bold: true, size: 20, color: COLORS.white })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary },
      spacing: { before: 150, after: 150 },
      bidirectional: true,
    }),
  );

  // ── المعطيات العامة ────────────────────────────────────────────────────────
  sections.push(sectionTitle("أولاً — المعطيات العامة"));
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        twoColRow("المادة", String(s.subject || "")),
        twoColRow("المستوى", String(s.level || "")),
        twoColRow("الثلاثي", String(s.trimester || "")),
        twoColRow("الفترة / الوحدة", String(s.period || "")),
        twoColRow("المدة", String(s.duration || "45 دقيقة")),
        twoColRow("المدرسة", data.schoolName || "—"),
        twoColRow("المدرس/ة", data.teacherName || "—"),
        twoColRow("السنة الدراسية", data.schoolYear || "2025-2026"),
      ],
    }),
  );

  // ── الكفاية والأهداف ───────────────────────────────────────────────────────
  sections.push(sectionTitle("ثانياً — الكفاية والأهداف"));
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        twoColRow("الكفاية الختامية", String(s.finalCompetency || "")),
        twoColRow("الهدف المميز", String(s.distinguishedObjective || "")),
      ],
    }),
  );

  // الأهداف الإجرائية
  const objectives = Array.isArray(s.proceduralObjectives) ? s.proceduralObjectives : [];
  if (objectives.length > 0) {
    sections.push(
      new Paragraph({
        children: [arabicText("الأهداف الإجرائية:", { bold: true, size: 12, color: COLORS.primary })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 150, after: 60 },
        bidirectional: true,
      }),
    );
    objectives.forEach((obj, i) => {
      sections.push(bodyParagraph(`${i + 1}. ${String(obj)}`));
    });
  }

  // الوسائل
  const materials = Array.isArray(s.materials) ? s.materials : [];
  if (materials.length > 0) {
    sections.push(
      new Paragraph({
        children: [arabicText("الوسائل والأدوات: " + materials.join(" — "), { size: 11, italics: true })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 100, after: 100 },
        bidirectional: true,
      }),
    );
  }

  // ── مراحل الحصة ───────────────────────────────────────────────────────────
  sections.push(sectionTitle("ثالثاً — مراحل الحصة"));

  // مرحلة الانطلاق
  const launch = (s.launchPhase as Record<string, string>) || {};
  sections.push(
    new Paragraph({
      children: [arabicText(`أ) وضعية الانطلاق / التهيئة (${launch.duration || "10 دقائق"})`, { bold: true, size: 12, color: COLORS.secondary })],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 150, after: 60 },
      bidirectional: true,
    }),
  );
  if (launch.problemSituation) {
    sections.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          twoColRow("وضعية المشكلة", launch.problemSituation),
          twoColRow("نشاط المعلم", launch.teacherActivity || ""),
          twoColRow("نشاط المتعلم", launch.learnerActivity || ""),
        ],
      }),
    );
  }

  // المرحلة الرئيسية
  const main = (s.mainPhase as Record<string, unknown>) || {};
  sections.push(
    new Paragraph({
      children: [arabicText(`ب) بناء التعلمات / النشاط الرئيسي (${String(main.duration || "25 دقائق")})`, { bold: true, size: 12, color: COLORS.secondary })],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 150, after: 60 },
      bidirectional: true,
    }),
  );
  const steps = Array.isArray(main.steps) ? main.steps : [];
  if (steps.length > 0) {
    const stepRows = steps.map((step: unknown) => {
      const st = step as Record<string, string>;
      return new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, color: COLORS.light, fill: COLORS.light },
            children: [new Paragraph({ children: [arabicText(st.step || "", { bold: true, size: 10 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [arabicText(st.teacherActivity || "", { size: 10 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ children: [arabicText(st.learnerActivity || "", { size: 10 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
          }),
        ],
      });
    });
    const headerRow = new TableRow({
      children: [
        new TableCell({ shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary }, children: [new Paragraph({ children: [arabicText("الخطوة", { bold: true, size: 10, color: COLORS.white })], alignment: AlignmentType.CENTER, bidirectional: true })] }),
        new TableCell({ shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary }, children: [new Paragraph({ children: [arabicText("نشاط المعلم", { bold: true, size: 10, color: COLORS.white })], alignment: AlignmentType.CENTER, bidirectional: true })] }),
        new TableCell({ shading: { type: ShadingType.SOLID, color: COLORS.primary, fill: COLORS.primary }, children: [new Paragraph({ children: [arabicText("نشاط المتعلم", { bold: true, size: 10, color: COLORS.white })], alignment: AlignmentType.CENTER, bidirectional: true })] }),
      ],
      tableHeader: true,
    });
    sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...stepRows] }));
  }

  // مرحلة الاستثمار
  const consol = (s.consolidationPhase as Record<string, string>) || {};
  sections.push(
    new Paragraph({
      children: [arabicText(`ج) الاستثمار والتقييم (${consol.duration || "10 دقائق"})`, { bold: true, size: 12, color: COLORS.secondary })],
      alignment: AlignmentType.RIGHT,
      spacing: { before: 150, after: 60 },
      bidirectional: true,
    }),
  );
  if (consol.exercise) {
    sections.push(bodyParagraph(`التمرين (${consol.exerciseType || "تقييمي"}): ${consol.exercise}`));
  }

  // ── الاستنتاج والتقييم الختامي ────────────────────────────────────────────
  sections.push(sectionTitle("رابعاً — الاستنتاج والتقييم الختامي"));
  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        twoColRow("الاستنتاج", String(s.conclusion || "")),
        twoColRow("التقييم الختامي (وضعية إدماجية)", String(s.summativeEvaluation || "")),
      ],
    }),
  );

  // ── التذييل ───────────────────────────────────────────────────────────────
  sections.push(
    new Paragraph({ spacing: { before: 300 }, children: [] }),
    new Paragraph({
      children: [arabicText("🇹🇳 الجمهورية التونسية — Leader Academy — leaderacademy.school", { size: 9, color: COLORS.secondary, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      bidirectional: true,
    }),
  );

  // ── بناء الوثيقة ──────────────────────────────────────────────────────────
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children: sections,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: ARABIC_FONT,
            size: 22,
            color: COLORS.text,
          },
        },
      },
    },
  });

  return await Packer.toBuffer(doc);
}

// ─────────────────────────────────────────────────────────────────────────────
// exportEvaluationToWord — ورقة تقييم كاملة مولّدة من الجذاذة
// ─────────────────────────────────────────────────────────────────────────────
interface EvaluationQuestion {
  number: number;
  question: string;
  options?: string[];
  points: number;
  answer: string;
  justification?: string;
}

interface EvaluationSection {
  sectionNumber: number;
  sectionTitle: string;
  sectionType: string;
  points: number;
  instructions: string;
  questions: EvaluationQuestion[];
}

interface IntegrationSituation {
  context: string;
  task: string;
  points: number;
  expectedAnswer: string;
}

interface EvaluationCriterion {
  criterion: string;
  indicators: string[];
}

interface EvaluationWordInput {
  evaluation: Record<string, unknown>;
  includeAnswerKey: boolean;
  schoolName?: string;
  teacherName?: string;
  schoolYear?: string;
}

export async function exportEvaluationToWord(data: EvaluationWordInput): Promise<Buffer> {
  const ev = data.evaluation as {
    evaluationTitle?: string;
    subject?: string;
    level?: string;
    trimester?: string;
    duration?: string;
    evaluationType?: string;
    totalPoints?: number;
    learningObjective?: string;
    competency?: string;
    sections?: EvaluationSection[];
    integrationSituation?: IntegrationSituation;
    evaluationCriteria?: EvaluationCriterion[];
  };

  const docSections: (Paragraph | Table)[] = [];

  // ــ الترويسة الرسمية SC2M223 ــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــــ
  // صف الترويسة SC2M223: اسم المدرسة | المادة والسنة | الاسم واللقب | الرقم
  docSections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [arabicText("اسم المدرسة: " + (data.schoolName || "..................."), { bold: true, size: 11 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: COLORS.light, fill: COLORS.light },
            }),
            new TableCell({
              children: [new Paragraph({ children: [arabicText("المادة: " + (ev.subject || "—") + " | السنة: " + (ev.level || "—"), { bold: true, size: 11 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.SOLID, color: COLORS.light, fill: COLORS.light },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [arabicText("الاسم واللقب: ...........................................", { size: 11 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [arabicText("الثلاثي: " + (ev.trimester || "—") + " | " + (data.schoolYear || "2025-2026"), { size: 11 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [arabicText("الرقم: .............", { size: 11 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [new Paragraph({ children: [arabicText("المدة: " + (ev.duration || "45 دقيقة") + " | المجموع: " + (ev.totalPoints || 20) + "/20", { size: 11 })], alignment: AlignmentType.RIGHT, bidirectional: true })],
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
    }),
  );
  // عنوان ورقة التقييم
  docSections.push(
    new Paragraph({
      children: [arabicText("الجمهورية التونسية — وزارة التربية", { bold: true, size: 11, color: COLORS.secondary })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 40 },
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText("المحرك البيداغوجي الذكي — Leader Academy", { bold: true, size: 14, color: COLORS.accent })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 40, after: 80 },
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText(`امتحان الثلاثي ${ev.trimester || "الأول"} — ${ev.evaluationType || "تقييم تكويني"}`, { bold: true, size: 18, color: COLORS.white })],
      alignment: AlignmentType.CENTER,
      shading: { type: ShadingType.SOLID, color: COLORS.green, fill: COLORS.green },
      spacing: { before: 100, after: 60 },
      bidirectional: true,
    }),
    new Paragraph({
      children: [arabicText(`${ev.subject || ""} — السنة ${ev.level || ""} — المدة: ${ev.duration || "45 دقيقة"} — المجموع: ${ev.totalPoints || 20}/20`, { bold: false, size: 12, color: COLORS.secondary })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 150 },
      bidirectional: true,
    }),
  );// ── بيانات المتعلم ────────────────────────────────────────────────────────
  docSections.push(sectionTitle("أولاً — بيانات المتعلم"));
  docSections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        twoColRow("المادة", ev.subject || ""),
        twoColRow("المستوى", ev.level || ""),
        twoColRow("الثلاثي", ev.trimester || ""),
        twoColRow("المدة", ev.duration || "45 دقيقة"),
        twoColRow("نوع التقييم", ev.evaluationType || ""),
        twoColRow("المجموع", `${ev.totalPoints || 20} / 20`),
        twoColRow("المدرسة", data.schoolName || "—"),
        twoColRow("المدرس/ة", data.teacherName || "—"),
        twoColRow("السنة الدراسية", data.schoolYear || "2025-2026"),
        twoColRow("اسم المتعلم/ة", "..............................................."),
        twoColRow("الرقم", "..............."),
      ],
    }),
  );

  // ── الكفاية والهدف ────────────────────────────────────────────────────────
  docSections.push(sectionTitle("ثانياً — الكفاية والهدف المستهدف"));
  docSections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        twoColRow("الكفاية المقيّمة", ev.competency || ""),
        twoColRow("الهدف المستهدف", ev.learningObjective || ""),
      ],
    }),
  );

  // ── الأسئلة ───────────────────────────────────────────────────────────────
  docSections.push(sectionTitle("ثالثاً — أسئلة التقييم"));

  const evalSections = Array.isArray(ev.sections) ? ev.sections : [];
  for (const sec of evalSections) {
    docSections.push(
      new Paragraph({
        children: [
          arabicText(
            `القسم ${sec.sectionNumber} — ${sec.sectionTitle} (${sec.points} ن)`,
            { bold: true, size: 13, color: COLORS.secondary }
          ),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 200, after: 80 },
        bidirectional: true,
        shading: { type: ShadingType.SOLID, color: COLORS.light, fill: COLORS.light },
      }),
      new Paragraph({
        children: [arabicText(`التعليمة: ${sec.instructions}`, { italics: true, size: 11, color: COLORS.text })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 100 },
        bidirectional: true,
      }),
    );
    const questions = Array.isArray(sec.questions) ? sec.questions : [];
    for (const q of questions) {
      docSections.push(
        new Paragraph({
          children: [arabicText(`${q.number}. ${q.question}  (${q.points} ن)`, { bold: false, size: 12 })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 80, after: 40 },
          bidirectional: true,
        }),
      );
      if (Array.isArray(q.options) && q.options.length > 0) {
        for (const opt of q.options) {
          docSections.push(
            new Paragraph({
              children: [arabicText(`    ${opt}`, { size: 11 })],
              alignment: AlignmentType.RIGHT,
              spacing: { before: 20, after: 20 },
              bidirectional: true,
            }),
          );
        }
      }
      if (sec.sectionType === "open" || sec.sectionType === "integration") {
        docSections.push(
          new Paragraph({
            children: [arabicText("الإجابة: ............................................................................", { size: 11, color: COLORS.lightGray })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40, after: 60 },
            bidirectional: true,
          }),
        );
      }
    }
  }

  // ── الوضعية الإدماجية ────────────────────────────────────────────────────
  const intSit = ev.integrationSituation;
  if (intSit) {
    docSections.push(
      sectionTitle(`رابعاً — الوضعية الإدماجية (${intSit.points} ن)`),
      new Paragraph({
        children: [arabicText("السياق:", { bold: true, size: 12 })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 100, after: 40 },
        bidirectional: true,
      }),
      new Paragraph({
        children: [arabicText(intSit.context, { size: 11 })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 40, after: 80 },
        bidirectional: true,
      }),
      new Paragraph({
        children: [arabicText("المهمة:", { bold: true, size: 12 })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 60, after: 40 },
        bidirectional: true,
      }),
      new Paragraph({
        children: [arabicText(intSit.task, { size: 11 })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 40, after: 80 },
        bidirectional: true,
      }),
      new Paragraph({
        children: [arabicText("الإجابة: ............................................................................", { size: 11, color: COLORS.lightGray })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 40, after: 40 },
        bidirectional: true,
      }),
      new Paragraph({
        children: [arabicText("        ............................................................................", { size: 11, color: COLORS.lightGray })],
        alignment: AlignmentType.RIGHT,
        spacing: { before: 20, after: 40 },
        bidirectional: true,
      }),
    );
  }

  // ── مفتاح الإجابة (اختياري) ──────────────────────────────────────────────
  if (data.includeAnswerKey) {
    docSections.push(
      new Paragraph({
        children: [arabicText("═══════════════════════════════════════════════════════", { size: 10, color: COLORS.secondary })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 100 },
        bidirectional: true,
      }),
      new Paragraph({
        children: [arabicText("مفتاح الإجابة — للمدرس/ة فقط", { bold: true, size: 16, color: COLORS.white })],
        alignment: AlignmentType.CENTER,
        shading: { type: ShadingType.SOLID, color: COLORS.green, fill: COLORS.green },
        spacing: { before: 100, after: 150 },
        bidirectional: true,
      }),
    );
    for (const sec of evalSections) {
      docSections.push(
        new Paragraph({
          children: [arabicText(`القسم ${sec.sectionNumber} — ${sec.sectionTitle}`, { bold: true, size: 12, color: COLORS.secondary })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 150, after: 60 },
          bidirectional: true,
        }),
      );
      const questions = Array.isArray(sec.questions) ? sec.questions : [];
      for (const q of questions) {
        docSections.push(
          new Paragraph({
            children: [arabicText(`${q.number}. الإجابة: ${q.answer}${q.justification ? ` — ${q.justification}` : ""}`, { size: 11 })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40, after: 40 },
            bidirectional: true,
          }),
        );
      }
    }
    if (intSit) {
      docSections.push(
        new Paragraph({
          children: [arabicText("الوضعية الإدماجية — الإجابة المتوقعة:", { bold: true, size: 12, color: COLORS.secondary })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 150, after: 60 },
          bidirectional: true,
        }),
        new Paragraph({
          children: [arabicText(intSit.expectedAnswer, { size: 11 })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 40, after: 80 },
          bidirectional: true,
        }),
      );
    }
    const criteria = Array.isArray(ev.evaluationCriteria) ? ev.evaluationCriteria : [];
    if (criteria.length > 0) {
      docSections.push(
        new Paragraph({
          children: [arabicText("معايير التقييم:", { bold: true, size: 12, color: COLORS.secondary })],
          alignment: AlignmentType.RIGHT,
          spacing: { before: 150, after: 60 },
          bidirectional: true,
        }),
      );
      for (const c of criteria) {
        docSections.push(
          new Paragraph({
            children: [arabicText(`• ${c.criterion}: ${Array.isArray(c.indicators) ? c.indicators.join(" — ") : ""}`, { size: 11 })],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 40, after: 40 },
            bidirectional: true,
          }),
        );
      }
    }
  }

  // ── التذييل ───────────────────────────────────────────────────────────────
  docSections.push(
    new Paragraph({
      children: [arabicText("🇹🇳 الجمهورية التونسية — Leader Academy — leaderacademy.school", { size: 9, color: COLORS.secondary, italics: true })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 60 },
      bidirectional: true,
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children: docSections,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: ARABIC_FONT,
            size: 22,
            color: COLORS.text,
          },
        },
      },
    },
  });
  return await Packer.toBuffer(doc);
}
