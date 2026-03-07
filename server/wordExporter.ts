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
