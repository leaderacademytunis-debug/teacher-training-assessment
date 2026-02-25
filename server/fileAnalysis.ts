import { PDFParse } from "pdf-parse";
import { createWorker } from "tesseract.js";

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
  try {
    const parser = new PDFParse(fileBuffer);
    const result = await parser.getText();
    
    return {
      text: result.text,
      pageCount: result.total,
    };
  } catch (error) {
    console.error("Error analyzing PDF:", error);
    throw new Error("Failed to extract text from PDF");
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
  language: string = "ara+fra+eng"
): Promise<FileAnalysisResult> {
  const worker = await createWorker(language);
  
  try {
    const { data } = await worker.recognize(fileBuffer);
    
    return {
      text: data.text,
      language: data.text ? "detected" : undefined,
    };
  } catch (error) {
    console.error("Error analyzing image:", error);
    throw new Error("Failed to extract text from image");
  } finally {
    await worker.terminate();
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
    return await analyzeImage(fileBuffer);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}
