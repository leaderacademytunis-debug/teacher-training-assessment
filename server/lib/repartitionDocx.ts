import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  ShadingType,
  VerticalAlign,
  PageOrientation,
} from "docx";

interface Activity {
  activityName: string;
  duration: string;
  objet: string;
  objectifSpecifique: string;
  objectif: string;
  etapes: string[];
  remarques: string;
}

interface RepartitionData {
  niveau: string;
  uniteNumber: number;
  moduleNumber: number;
  journeeNumber: number;
  dateFrom?: string;
  dateTo?: string;
  sousTheme?: string;
  activities: Activity[];
  tableStructure: "6eme" | "3_5eme";
}

const BLUE_DARK = "2c5282";
const BLUE_LIGHT = "ebf4ff";
const WHITE = "ffffff";
const GRAY_LIGHT = "f7fafc";

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.SOLID, color: BLUE_DARK, fill: BLUE_DARK },
    verticalAlign: VerticalAlign.CENTER,
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text, bold: true, color: WHITE, size: 20, font: "Calibri" }),
        ],
      }),
    ],
  });
}

function textCell(text: string, width: number, opts?: { bold?: boolean; color?: string; bgColor?: string; alignment?: typeof AlignmentType[keyof typeof AlignmentType] }): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: opts?.bgColor ? { type: ShadingType.SOLID, color: opts.bgColor, fill: opts.bgColor } : undefined,
    verticalAlign: VerticalAlign.TOP,
    children: [
      new Paragraph({
        alignment: opts?.alignment || AlignmentType.LEFT,
        spacing: { before: 40, after: 40 },
        children: [
          new TextRun({
            text,
            bold: opts?.bold || false,
            color: opts?.color || "1a1a1a",
            size: 19,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function etapesCell(etapes: string[], width: number, bgColor?: string): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: bgColor ? { type: ShadingType.SOLID, color: bgColor, fill: bgColor } : undefined,
    verticalAlign: VerticalAlign.TOP,
    children: etapes.map(
      (e) =>
        new Paragraph({
          spacing: { before: 20, after: 20 },
          children: [
            new TextRun({ text: "→ ", bold: true, color: BLUE_DARK, size: 18, font: "Calibri" }),
            new TextRun({ text: e, size: 18, font: "Calibri" }),
          ],
        })
    ),
  });
}

export async function generateRepartitionDocx(data: RepartitionData): Promise<Buffer> {
  const is6eme = data.tableStructure === "6eme";

  // ===== HEADER SECTION =====
  const headerParagraphs: Paragraph[] = [];

  if (is6eme) {
    headerParagraphs.push(
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Unité d'apprentissage n° ", bold: true, color: BLUE_DARK, size: 22, font: "Calibri" }),
          new TextRun({ text: String(data.uniteNumber), bold: true, size: 24, font: "Calibri" }),
          new TextRun({ text: "          Date : ", color: "4a5568", size: 20, font: "Calibri" }),
          new TextRun({ text: `de ${data.dateFrom || "……"} à ${data.dateTo || "……"}`, size: 20, font: "Calibri" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 100 },
        children: [
          new TextRun({ text: "Niveau : ", bold: true, color: BLUE_DARK, size: 22, font: "Calibri" }),
          new TextRun({ text: data.niveau, bold: true, size: 22, font: "Calibri" }),
        ],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: `Module ${data.moduleNumber}`, bold: true, color: BLUE_DARK, size: 22, font: "Calibri" }),
          new TextRun({ text: " — ", color: "a0aec0", size: 22, font: "Calibri" }),
          new TextRun({ text: `Journée ${data.journeeNumber}`, bold: true, color: BLUE_DARK, size: 22, font: "Calibri" }),
        ],
      })
    );
  } else {
    // 3ème-5ème header with 3-column table
    const headerTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: `Unité : ${data.uniteNumber} / Module : ${data.moduleNumber} / Journée : ${data.journeeNumber}`, bold: true, size: 20, font: "Calibri" }),
                  ],
                }),
                ...(data.sousTheme
                  ? [
                      new Paragraph({
                        spacing: { before: 20, after: 40 },
                        children: [
                          new TextRun({ text: `Sous thème : ${data.sousTheme}`, size: 19, color: "4a5568", font: "Calibri" }),
                        ],
                      }),
                    ]
                  : []),
              ],
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "……………… ………… ………………", color: "a0aec0", size: 18, font: "Calibri" })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 40, after: 20 },
                  children: [new TextRun({ text: data.niveau, bold: true, color: BLUE_DARK, size: 22, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 20, after: 40 },
                  children: [new TextRun({ text: `De ${data.dateFrom || "……"} à ${data.dateTo || "……"}`, size: 19, color: "4a5568", font: "Calibri" })],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    headerParagraphs.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    // We'll add the header table separately
    headerParagraphs.splice(0, headerParagraphs.length); // Clear and use table instead
    headerParagraphs.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
  }

  // ===== MAIN TABLE =====
  const tableHeaders = is6eme
    ? [
        headerCell("Activités", 14),
        headerCell("Objet (contenu)", 20),
        headerCell("Objectif de la séance", 26),
        headerCell("Étapes", 25),
        headerCell("Remarques", 15),
      ]
    : [
        headerCell("Activités", 16),
        headerCell("Objets", 18),
        headerCell("Objectifs spécifiques", 22),
        headerCell("Objectif de la séance", 22),
        headerCell("Étapes", 22),
      ];

  const tableRows = data.activities.map((a, idx) => {
    const bgColor = idx % 2 === 0 ? WHITE : GRAY_LIGHT;
    if (is6eme) {
      const activityText = a.duration ? `${a.activityName}\n(${a.duration})` : a.activityName;
      return new TableRow({
        children: [
          textCell(activityText, 14, { bold: true, color: BLUE_DARK, alignment: AlignmentType.CENTER, bgColor }),
          textCell(a.objet, 20, { bgColor }),
          textCell(a.objectif, 26, { bgColor }),
          etapesCell(a.etapes, 25, bgColor),
          textCell(a.remarques || "—", 15, { color: "718096", bgColor }),
        ],
      });
    } else {
      return new TableRow({
        children: [
          textCell(a.activityName, 16, { bold: true, color: BLUE_DARK, alignment: AlignmentType.CENTER, bgColor }),
          textCell(a.objet, 18, { bgColor }),
          textCell(a.objectifSpecifique || "—", 22, { color: "4a5568", bgColor }),
          textCell(a.objectif, 22, { bgColor }),
          etapesCell(a.etapes, 22, bgColor),
        ],
      });
    }
  });

  const mainTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: tableHeaders }),
      ...tableRows,
    ],
  });

  // ===== FOOTER =====
  const footerParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200 },
    children: [
      new TextRun({ text: "Leader Academy", bold: true, color: BLUE_DARK, size: 16, font: "Calibri" }),
      new TextRun({ text: " — المساعد البيداغوجي الذكي — نسخة تونس 2026", color: "718096", size: 16, font: "Calibri" }),
    ],
  });

  // ===== DOCUMENT ASSEMBLY =====
  const docChildren: (Paragraph | Table)[] = [];

  if (!is6eme) {
    // Add 3-column header table for 3ème-5ème
    const hdrTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 40, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
              },
              children: [
                new Paragraph({
                  spacing: { before: 60, after: 30 },
                  children: [
                    new TextRun({ text: `Unité : ${data.uniteNumber} / Module : ${data.moduleNumber} / Journée : ${data.journeeNumber}`, bold: true, size: 20, font: "Calibri" }),
                  ],
                }),
                ...(data.sousTheme
                  ? [
                      new Paragraph({
                        spacing: { before: 20, after: 60 },
                        children: [
                          new TextRun({ text: `Sous thème : ${data.sousTheme}`, size: 19, color: "4a5568", font: "Calibri" }),
                        ],
                      }),
                    ]
                  : [new Paragraph({ children: [] })]),
              ],
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: "……………… ………… ………………", color: "a0aec0", size: 18, font: "Calibri" })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                left: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
                right: { style: BorderStyle.SINGLE, size: 1, color: "a0aec0" },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 60, after: 20 },
                  children: [new TextRun({ text: data.niveau, bold: true, color: BLUE_DARK, size: 22, font: "Calibri" })],
                }),
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  spacing: { before: 20, after: 60 },
                  children: [new TextRun({ text: `De ${data.dateFrom || "……"} à ${data.dateTo || "……"}`, size: 19, color: "4a5568", font: "Calibri" })],
                }),
              ],
            }),
          ],
        }),
      ],
    });
    docChildren.push(hdrTable);
    docChildren.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
  } else {
    docChildren.push(...headerParagraphs);
  }

  docChildren.push(mainTable);
  docChildren.push(footerParagraph);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: docChildren,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
