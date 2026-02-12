import ArabicReshaper from 'arabic-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

/**
 * Process Arabic text for proper display in PDF
 * 1. Reshape Arabic characters to their correct forms (isolated, initial, medial, final)
 * 2. Apply bidirectional algorithm for proper RTL ordering
 */
export function processArabicText(text: string): string {
  if (!text || text.trim() === '') {
    return text;
  }
  
  try {
    // Step 1: Reshape Arabic characters to connect them properly
    const reshaper = ArabicReshaper as any;
    const reshaped = reshaper.convertArabic ? reshaper.convertArabic(text) : text;
    
    // Step 2: Apply bidirectional algorithm for RTL
    // bidi.getReorderedString() handles the text reordering for RTL display
    const reordered = bidi.getReorderedString(reshaped);
    
    return reordered;
  } catch (error) {
    console.error('Error processing Arabic text:', error);
    // Return original text if processing fails
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
