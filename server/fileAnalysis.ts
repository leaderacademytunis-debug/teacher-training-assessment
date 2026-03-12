import { PDFParse } from "pdf-parse";
import { invokeLLM } from "./_core/llm";

export interface FileAnalysisResult {
  text: string;
  pageCount?: number;
  language?: string;
}

/**
 * Extract text from PDF file
 * @param fileBuffer - Buffer containing PDF file data
 * @returns Extracted text and page count
 */
export async function analyzePDF(fileBuffer: Buffer): Promise<FileAnalysisResult> {
  let pdf: InstanceType<typeof PDFParse> | null = null;
  try {
    // PDFParse v2 requires { data: Uint8Array, verbosity } options object
    const uint8Array = new Uint8Array(fileBuffer);
    pdf = new PDFParse({ data: uint8Array, verbosity: 0 });
    await pdf.load();
    const textResult = await pdf.getText();
    // getText() returns { text, total, pages } in pdf-parse v2
    const text = (textResult?.text || "").trim();
    if (!text || text.length < 10) {
      throw new Error("PDF_EMPTY_TEXT");
    }

    return {
      text,
    };
  } catch (error: any) {
    if (error?.message === "PDF_EMPTY_TEXT") {
      throw new Error("الملف PDF يحتوي على صور فقط (مسح ضوئي). يُرجى رفع صورة مباشرةً.");
    }
    console.error("Error analyzing PDF:", error?.message || error);
    throw new Error(`فشل استخراج النص من ملف PDF: ${error?.message || "خطأ غير معروف"}`);
  } finally {
    if (pdf) await pdf.destroy().catch(() => {});
  }
}

/**
 * Extract text from image using OCR
 * @param fileBuffer - Buffer containing image file data
 * @param language - Language code for OCR (default: 'ara+fra+eng' for Arabic, French, English)
 * @returns Extracted text and detected language
 */
export async function analyzeImage(
  fileBuffer: Buffer,
  mimeType: string = "image/jpeg"
): Promise<FileAnalysisResult> {
  try {
    const base64 = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
            {
              type: "text",
              text: "استخرج كل النص الموجود في هذه الصورة بدقة. أعد النص كما هو دون أي تعليق أو تعديل.",
            },
          ],
        },
      ],
    });

    const text = response?.choices?.[0]?.message?.content || "";
    return {
      text: typeof text === "string" ? text : JSON.stringify(text),
      language: "detected",
    };
  } catch (error: any) {
    console.error("Error analyzing image:", error?.message || error);
    throw new Error(`فشل استخراج النص من الصورة: ${error?.message || "خطأ غير معروف"}`);
  }
}

/**
 * Analyze file based on MIME type
 * @param fileBuffer - Buffer containing file data
 * @param mimeType - MIME type of the file
 * @returns Extracted text and metadata
 */
export async function analyzeFile(
  fileBuffer: Buffer,
  mimeType: string
): Promise<FileAnalysisResult> {
  if (mimeType === "application/pdf") {
    return await analyzePDF(fileBuffer);
  } else if (mimeType.startsWith("image/")) {
    return await analyzeImage(fileBuffer, mimeType);
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return { text: result.value?.trim() || "" };
    } catch (error: any) {
      throw new Error(`فشل استخراج النص من ملف Word: ${error?.message || "خطأ غير معروف"}`);
    }
  } else {
    throw new Error(`نوع الملف غير مدعوم: ${mimeType}`);
  }
}
