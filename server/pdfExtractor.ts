import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { randomBytes } from "crypto";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

/**
 * Extract text content from a PDF file using pdftotext utility
 * @param pdfUrl - URL of the PDF file to extract
 * @returns Extracted text content
 */
export async function extractPdfContent(pdfUrl: string): Promise<string> {
  const tempPdfPath = join(tmpdir(), `pdf-${randomBytes(8).toString("hex")}.pdf`);
  const tempTxtPath = join(tmpdir(), `txt-${randomBytes(8).toString("hex")}.txt`);

  try {
    // Download PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to download PDF: ${response.statusText}`);
    }
    
    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(tempPdfPath, buffer);

    // Extract text using pdftotext (from poppler-utils)
    await execAsync(`pdftotext "${tempPdfPath}" "${tempTxtPath}"`);

    // Read extracted text
    const { readFile } = await import("fs/promises");
    const content = await readFile(tempTxtPath, "utf-8");

    // Cleanup
    await unlink(tempPdfPath);
    await unlink(tempTxtPath);

    // Return cleaned content (remove excessive whitespace)
    return content
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 50000); // Limit to 50k characters to avoid DB issues
  } catch (error) {
    console.error("[PDF Extractor] Failed to extract PDF content:", error);
    
    // Cleanup on error
    try {
      await unlink(tempPdfPath);
      await unlink(tempTxtPath);
    } catch {}
    
    throw error;
  }
}

/**
 * Extract content from multiple PDFs in parallel
 * @param pdfUrls - Array of PDF URLs
 * @returns Array of extracted contents (null for failed extractions)
 */
export async function extractMultiplePdfs(pdfUrls: string[]): Promise<(string | null)[]> {
  return await Promise.all(
    pdfUrls.map(async (url) => {
      try {
        return await extractPdfContent(url);
      } catch (error) {
        console.error(`[PDF Extractor] Failed to extract ${url}:`, error);
        return null;
      }
    })
  );
}
