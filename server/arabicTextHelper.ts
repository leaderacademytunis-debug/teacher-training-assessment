import ArabicReshaper from 'arabic-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

/**
 * Process Arabic text for proper display in PDF
 * 1. Reshape Arabic characters to their correct forms (isolated, initial, medial, final)
 * 2. Apply bidirectional algorithm to reverse RTL text
 */
export function processArabicText(text: string): string {
  try {
    // arabic-reshaper exports an object with convertArabic method
    const reshaper = ArabicReshaper as any;
    const reshaped = reshaper.convertArabic ? reshaper.convertArabic(text) : text;
    
    // Then apply bidirectional algorithm
    const processed = bidi.applyBidi(reshaped);
    
    return processed;
  } catch (error) {
    console.error('Error processing Arabic text:', error);
    return text;
  }
}

/**
 * Split long Arabic text into multiple lines that fit within a given width
 */
export function wrapArabicText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    
    if (width > maxWidth && currentLine) {
      lines.push(processArabicText(currentLine));
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(processArabicText(currentLine));
  }
  
  return lines;
}
