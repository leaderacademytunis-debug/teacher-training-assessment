import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import https from "node:https";
import { processArabicText, wrapArabicText } from './arabicTextHelper';
import { getCertificateContent, type CertificateContent } from './certificateContent';

/**
 * Format date with Arabic month names
 * @param date - Date object
 * @returns Formatted date string (e.g., "24 فيفري 2026")
 */
function formatDateArabic(date: Date): string {
  const arabicMonths = [
    'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 
    'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const day = date.getDate();
  const month = arabicMonths[date.getMonth()];
  const year = date.getFullYear();
  // processArabicText now automatically protects numbers from RTL reversal
  return `${day} ${month} ${year}`;
}

/**
 * Format date with French month names
 * @param date - Date object
 * @returns Formatted date string (e.g., "24 février 2026")
 */
function formatDateFrench(date: Date): string {
  const frenchMonths = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const day = date.getDate();
  const month = frenchMonths[date.getMonth()];
  const year = date.getFullYear();
  // processArabicText automatically protects numbers from RTL reversal
  return `${day} ${month} ${year}`;
}

/**
 * Get border color based on course category
 */
function getBorderColorForCategory(category: string): { outer: any; inner: any } {
  
  switch (category) {
    case 'science_teachers':
      // Dark blue - Science and knowledge
      return {
        outer: rgb(0.1, 0.2, 0.5),  // Dark blue
        inner: rgb(0.2, 0.35, 0.65)  // Medium blue
      };
    
    case 'arabic_teachers':
      // Emerald green - Arabic culture
      return {
        outer: rgb(0.0, 0.5, 0.3),   // Dark emerald
        inner: rgb(0.1, 0.6, 0.4)    // Light emerald
      };
    
    case 'french_teachers':
      // Burgundy red - French culture
      return {
        outer: rgb(0.5, 0.1, 0.2),   // Dark burgundy
        inner: rgb(0.65, 0.2, 0.3)   // Light burgundy
      };
    
    case 'primary_teachers':
      // Gold - Excellence
      return {
        outer: rgb(0.7, 0.5, 0.1),   // Dark gold
        inner: rgb(0.85, 0.65, 0.2)  // Light gold
      };
    
    case 'preschool_facilitators':
      // Purple - Childhood and creativity
      return {
        outer: rgb(0.4, 0.2, 0.6),   // Dark purple
        inner: rgb(0.55, 0.35, 0.75) // Light purple
      };
    
    case 'special_needs_companions':
      // Orange - Support and care
      return {
        outer: rgb(0.8, 0.4, 0.1),   // Dark orange
        inner: rgb(0.9, 0.55, 0.2)   // Light orange
      };
    
    case 'digital_teacher_ai':
      // Cyan - Technology
      return {
        outer: rgb(0.1, 0.5, 0.7),   // Dark cyan
        inner: rgb(0.2, 0.65, 0.85)  // Light cyan
      };
    
    default:
      // Default gray
      return {
        outer: rgb(0.2, 0.2, 0.2),
        inner: rgb(0.4, 0.4, 0.4)
      };
  }
}

const ARABIC_FONT_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/tVoWPiuIjSLTpZzt.ttf";

/**
 * Download resource from URL
 */
async function downloadResource(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks: Buffer[] = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

interface CertificateData {
  participantName: string;
  courseName: string;
  courseType: string;
  courseAxes?: string[]; // Array of course topics/axes
  batchNumber?: string; // Batch/promotion number
  completionDate: Date;
  score: number;
  certificateNumber: string;
  idCardNumber?: string; // National ID card number
  courseDuration?: number; // Course duration in hours
}

/**
 * Generate a professional certificate PDF using pdf-lib with proper Arabic/French support
 */
export async function generateCertificatePDF(data: CertificateData): Promise<{ url: string; key: string }> {
  // Get custom certificate content based on course name
  const content = getCertificateContent(data.courseName);
  
  if (!content) {
    throw new Error(`No certificate content found for course: ${data.courseName}`);
  }

  // Download resources
  const logoUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/TABMpUkybTgmkLSW.png";
  const flagUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/lUjeCQtcebHcrJBL.png";
  const stampUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/yesfhvsAgtOtGlnA.png";
  
  const [logoBytes, flagBytes, stampBytes, fontBytes] = await Promise.all([
    downloadResource(logoUrl).catch(() => null),
    downloadResource(flagUrl).catch(() => null),
    downloadResource(stampUrl).catch(() => null),
    downloadResource(ARABIC_FONT_URL).catch(() => null),
  ]);

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Register fontkit for custom fonts
  pdfDoc.registerFontkit(fontkit);
  
  // Embed fonts
  let customFont;
  let fallbackFont;
  
  if (fontBytes) {
    customFont = await pdfDoc.embedFont(fontBytes);
  }
  
  fallbackFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Use custom font if available, otherwise fallback
  const mainFont = customFont || fallbackFont;
  
  // Create A4 landscape page
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();
  
  // Skip standard borders and logo for English certificates (they have custom geometric design)
  const isEnglishCert = content && content.language === 'en';
  
  if (!isEnglishCert) {
    // Draw decorative borders with category-specific colors
    const margin = 15;
    const innerMargin = 30;
    // Check if this is the comprehensive certificate (use gold borders)
    const isComprehensiveCert = data.courseName.includes('أصحاب الشهادات العليا') || data.courseType === 'comprehensive';
    const borderColors = isComprehensiveCert
      ? { outer: rgb(0.6, 0.45, 0.05), inner: rgb(0.8, 0.65, 0.2) }
      : getBorderColorForCategory(data.courseType);
    
    // Outer border (darker color)
    page.drawRectangle({
      x: margin,
      y: margin,
      width: width - 2 * margin,
      height: height - 2 * margin,
      borderColor: borderColors.outer,
      borderWidth: 3,
    });
    
    // Inner border (lighter color)
    page.drawRectangle({
      x: innerMargin,
      y: innerMargin,
      width: width - 2 * innerMargin,
      height: height - 2 * innerMargin,
      borderColor: borderColors.inner,
      borderWidth: 1.5,
    });
    
    // Embed and draw images
    if (logoBytes) {
      try {
        const logoImage = await pdfDoc.embedPng(logoBytes);
        const logoWidth = 200;
        const logoHeight = logoWidth * (logoImage.height / logoImage.width);
        page.drawImage(logoImage, {
          x: 50, // Position on the left
          y: height - 220,
          width: logoWidth,
          height: logoHeight,
        });
      } catch (error) {
        console.error("Failed to embed logo:", error);
      }
    }
  }
  
  // Flag removed per user request
  
  // Draw text content based on language
  const black = rgb(0, 0, 0);
  const gray = rgb(0.33, 0.33, 0.33);
  const lightGray = rgb(0.4, 0.4, 0.4);
  
  // Check if this is the comprehensive (master) certificate
  const isComprehensive = data.courseName.includes('أصحاب الشهادات العليا') || data.courseType === 'comprehensive';

  if (isComprehensive) {
    // Comprehensive certificate with gold borders and 4 signatures
    await drawComprehensiveCertificate(page, mainFont, content, data, width, height, pdfDoc, stampBytes);
  } else if (content.language === 'ar') {
    // Arabic certificate layout
    await drawArabicCertificate(page, mainFont, content, data, width, height, gray, lightGray, black, pdfDoc, stampBytes);
  } else if (content.language === 'fr') {
    // French certificate layout
    await drawFrenchCertificate(page, fallbackFont, mainFont, content, data, width, height, gray, lightGray, black);
  } else if (content.language === 'en') {
    // English certificate layout (Video AI course - custom geometric design)
    await drawEnglishCertificate(page, fallbackFont, mainFont, content, data, width, height, gray, lightGray, black, pdfDoc, stampBytes);
  }
  
  // Second page removed per user request
  
  // Save PDF
  const pdfBytes = await pdfDoc.save();
  
  // Upload to S3
  const fileName = `${nanoid()}-${data.certificateNumber}.pdf`;
  const fileKey = `certificates/${fileName}`;
  
  const { url } = await storagePut(fileKey, pdfBytes, 'application/pdf');
  
  return { url, key: fileKey };
}

/**
 * Draw Arabic certificate content
 */
async function drawArabicCertificate(
  page: any,
  font: any,
  content: CertificateContent,
  data: CertificateData,
  width: number,
  height: number,
  gray: any,
  lightGray: any,
  black: any,
  pdfDoc: any,
  stampBytes: Buffer | null
) {
  // Right header - Government info
  const headerText1 = processArabicText("الجمهورية التونسية");
  const headerWidth1 = font.widthOfTextAtSize(headerText1, 8);
  page.drawText(headerText1, {
    x: width - 70 - headerWidth1,
    y: height - 120,
    size: 8,
    font: font,
    color: gray,
  });
  
  const headerText2 = processArabicText("وزارة التشغيل والتكوين المهني");
  const headerWidth2 = font.widthOfTextAtSize(headerText2, 8);
  page.drawText(headerText2, {
    x: width - 70 - headerWidth2,
    y: height - 133,
    size: 8,
    font: font,
    color: gray,
  });
  
  const headerText3 = processArabicText("ليدر أكاديمي");
  const headerWidth3 = font.widthOfTextAtSize(headerText3, 8);
  page.drawText(headerText3, {
    x: width - 70 - headerWidth3,
    y: height - 146,
    size: 8,
    font: font,
    color: gray,
  });
  
  const headerText4 = processArabicText("تسجيل عدد 61-903-16");
  const headerWidth4 = font.widthOfTextAtSize(headerText4, 7);
  page.drawText(headerText4, {
    x: width - 70 - headerWidth4,
    y: height - 159,
    size: 7,
    font: font,
    color: lightGray,
  });
  
  // Main title (increased size)
  const titleText = processArabicText(content.title);
  const titleWidth = font.widthOfTextAtSize(titleText, 56);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 115,
    size: 56,
    font: font,
    color: black,
  });
  
  // Subtitle (increased size)
  const subtitleText = processArabicText(content.subtitle);
  const subtitleWidth = font.widthOfTextAtSize(subtitleText, 14);
  page.drawText(subtitleText, {
    x: (width - subtitleWidth) / 2,
    y: height - 180,
    size: 14,
    font: font,
    color: gray,
  });
  
  // Participant name (in Arabic, increased size)
  const participantNameAr = processArabicText(data.participantName);
  const nameWidth = font.widthOfTextAtSize(participantNameAr, 28);
  page.drawText(participantNameAr, {
    x: (width - nameWidth) / 2,
    y: height - 235,
    size: 28,
    font: font,
    color: black,
  });
  
  // ID card number below the name (if provided)
  if (data.idCardNumber) {
    // CRITICAL FIX FOR RTL: In RTL context, we need to draw from RIGHT to LEFT
    // So we draw the NUMBER first (rightmost), then the ARABIC TEXT (leftmost)
    const arabicPart = processArabicText('صاحب/ة بطاقة تعريف وطنية رقم');
    const numberPart = data.idCardNumber; // Keep number as-is, don't process
    
    // Calculate widths
    const arabicWidth = font.widthOfTextAtSize(arabicPart, 12);
    const numberWidth = font.widthOfTextAtSize(numberPart, 12);
    const spaceWidth = 5;
    const fullWidth = arabicWidth + spaceWidth + numberWidth;
    
    // Calculate starting X position to center the whole text
    const startX = (width - fullWidth) / 2;
    
    // RTL ORDER: Draw NUMBER first (appears on the right), then ARABIC TEXT (appears on the left)
    // Draw number part FIRST (rightmost position in RTL)
    page.drawText(numberPart, {
      x: startX,
      y: height - 255,
      size: 12,
      font: font,
      color: gray,
    });
    
    // Draw Arabic part SECOND (leftmost position in RTL)
    page.drawText(arabicPart, {
      x: startX + numberWidth + spaceWidth,
      y: height - 255,
      size: 12,
      font: font,
      color: gray,
    });
  }
  
  // Main text (increased size) - adjusted position to avoid overlap with ID card number
  const mainText = processArabicText(content.mainText);
  const mainTextWidth = font.widthOfTextAtSize(mainText, 13);
  const mainTextY = data.idCardNumber ? height - 280 : height - 265; // More space if ID card is shown
  page.drawText(mainText, {
    x: (width - mainTextWidth) / 2,
    y: mainTextY,
    size: 13,
    font: font,
    color: gray,
  });
  
  // Underline - adjusted position
  const underlineY = data.idCardNumber ? height - 295 : height - 280;
  page.drawLine({
    start: { x: 210, y: underlineY },
    end: { x: width - 210, y: underlineY },
    thickness: 1.5,
    color: black,
  });
  
  // Axes header (increased size) - adjusted position
  const axesHeaderText = processArabicText("التي تناولت المحاور التالية :");
  const axesHeaderWidth = font.widthOfTextAtSize(axesHeaderText, 12);
  const axesHeaderY = data.idCardNumber ? height - 310 : height - 295;
  page.drawText(axesHeaderText, {
    x: width - 150 - axesHeaderWidth,
    y: axesHeaderY,
    size: 12,
    font: font,
    color: gray,
  });
  
  // Draw axes (right-aligned for Arabic) - adjusted starting position
  let yPosition = data.idCardNumber ? height - 335 : height - 320;
  for (const axis of content.axes) {
    const axisText = processArabicText(`• ${axis}`);
    const axisWidth = font.widthOfTextAtSize(axisText, 9);
    
    // Wrap text if too long
    if (axisWidth > width - 200) {
      const words = axis.split(' ');
      let currentLine = '';
      const lines: string[] = [];
      
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(processArabicText(`• ${testLine}`), 9);
        
        if (testWidth > width - 200 && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      // Draw wrapped lines
      for (const line of lines) {
        const lineText = processArabicText(`• ${line}`);
        const lineWidth = font.widthOfTextAtSize(lineText, 11);
        page.drawText(lineText, {
          x: width - 150 - lineWidth,
          y: yPosition,
          size: 11,
          font: font,
          color: gray,
        });
        yPosition -= 15;
      }
    } else {
      page.drawText(axisText, {
        x: width - 150 - axisWidth,
        y: yPosition,
        size: 11,
        font: font,
        color: gray,
      });
      yPosition -= 15;
    }
  }
  
  // Signatures section (increased size and adjusted position)
  const sig1Text = processArabicText("أ. علي سعدالله");
  const sig1Width = font.widthOfTextAtSize(sig1Text, 13);
  page.drawText(sig1Text, {
    x: width - 150 - sig1Width,
    y: 130,
    size: 13,
    font: font,
    color: black,
  });
  
  const sig1SubText = processArabicText("مدير الأكاديمية");
  const sig1SubWidth = font.widthOfTextAtSize(sig1SubText, 11);
  page.drawText(sig1SubText, {
    x: width - 150 - sig1SubWidth,
    y: 113,
    size: 11,
    font: font,
    color: gray,
  });
  
  // Add stamp and signature below director's name (centered)
  if (stampBytes) {
    try {
      const stampImage = await pdfDoc.embedPng(stampBytes);
      const stampSize = 90;
      // Center the stamp under the director's signature
      const sigCenterX = width - 150 - sig1Width / 2;
      page.drawImage(stampImage, {
        x: sigCenterX - stampSize / 2,
        y: 30,
        width: stampSize,
        height: stampSize * (stampImage.height / stampImage.width),
      });
    } catch (error) {
      console.error("Failed to embed stamp:", error);
    }
  }
  
  // Second signature removed per user request
  
  // Add issue date in bottom left corner
  // Display only the date without prefix: "24 فيفري 2026"
  // RTL ORDER: year, month, day (drawn from right to left)
  const issueDate = data.completionDate;
  
  // Get date components
  const day = issueDate.getDate().toString();
  const arabicMonths = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const month = arabicMonths[issueDate.getMonth()];
  const processedMonth = processArabicText(month);
  const year = issueDate.getFullYear().toString();
  
  // Calculate widths for all components
  const yearWidth = font.widthOfTextAtSize(year, 10);
  const monthWidth = font.widthOfTextAtSize(processedMonth, 10);
  const dayWidth = font.widthOfTextAtSize(day, 10);
  const spaceWidth = 3;
  
  // Calculate total width (no prefix)
  const totalWidth = dayWidth + spaceWidth + monthWidth + spaceWidth + yearWidth;
  
  // Start from left edge + total width (rightmost position)
  const startX = 50;
  let currentX = startX + totalWidth;
  
  // RTL ORDER: Draw from RIGHT to LEFT
  // Visual result: 23 فيفري 2026 (right to left)
  // 1. Draw day (rightmost)
  currentX -= dayWidth;
  page.drawText(day, {
    x: currentX,
    y: 50,
    size: 10,
    font: font,
    color: gray,
  });
  currentX -= spaceWidth;
  
  // 2. Draw month (middle)
  currentX -= monthWidth;
  page.drawText(processedMonth, {
    x: currentX,
    y: 50,
    size: 10,
    font: font,
    color: gray,
  });
  currentX -= spaceWidth;
  
  // 3. Draw year (leftmost)
  currentX -= yearWidth;
  page.drawText(year, {
    x: currentX,
    y: 50,
    size: 10,
    font: font,
    color: gray,
  });
}

/**
 * Draw French certificate content
 */
async function drawFrenchCertificate(
  page: any,
  latinFont: any,
  arabicFont: any,
  content: CertificateContent,
  data: CertificateData,
  width: number,
  height: number,
  gray: any,
  lightGray: any,
  black: any
) {
  // Header - Government info (in French)
  page.drawText("République Tunisienne", {
    x: width - 200,
    y: height - 120,
    size: 8,
    font: latinFont,
    color: gray,
  });
  
  page.drawText("Ministère de l'Emploi et de la Formation Professionnelle", {
    x: width - 320,
    y: height - 133,
    size: 8,
    font: latinFont,
    color: gray,
  });
  
  page.drawText("Leader Academy", {
    x: width - 150,
    y: height - 146,
    size: 8,
    font: latinFont,
    color: gray,
  });
  
  page.drawText("Enregistrement N° 61-903-16", {
    x: width - 180,
    y: height - 159,
    size: 7,
    font: latinFont,
    color: lightGray,
  });
  
  // Main title
  const titleLines = content.title.split('\n');
  let titleY = height - 100;
  for (const line of titleLines) {
    const lineWidth = latinFont.widthOfTextAtSize(line, 32);
    page.drawText(line, {
      x: (width - lineWidth) / 2,
      y: titleY,
      size: 32,
      font: latinFont,
      color: black,
    });
    titleY -= 40;
  }
  
  // Subtitle
  const subtitleWidth = latinFont.widthOfTextAtSize(content.subtitle, 12);
  page.drawText(content.subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 195,
    size: 12,
    font: latinFont,
    color: gray,
  });
  
  // Participant name (use Arabic font for Arabic names)
  const processedName = processArabicText(data.participantName);
  const nameWidth = arabicFont.widthOfTextAtSize(processedName, 24);
  page.drawText(processedName, {
    x: (width - nameWidth) / 2,
    y: height - 235,
    size: 24,
    font: arabicFont,
    color: black,
  });
  
  // Main text
  const mainTextWidth = latinFont.widthOfTextAtSize(content.mainText, 11);
  page.drawText(content.mainText, {
    x: (width - mainTextWidth) / 2,
    y: height - 275,
    size: 11,
    font: latinFont,
    color: gray,
  });
  
  // Duration line (e.g., "Durée : 12 heures")
  if (data.courseDuration) {
    const durationText = `Durée : ${data.courseDuration} heures`;
    const durationWidth = latinFont.widthOfTextAtSize(durationText, 10);
    page.drawText(durationText, {
      x: (width - durationWidth) / 2,
      y: height - 290,
      size: 10,
      font: latinFont,
      color: gray,
    });
  }
  
  // Underline
  const underlineYFr = data.courseDuration ? height - 300 : height - 285;
  page.drawLine({
    start: { x: 150, y: underlineYFr },
    end: { x: width - 150, y: underlineYFr },
    thickness: 1.5,
    color: black,
  });
  
  // Axes header
  const axesYOffset = data.courseDuration ? 15 : 0;
  page.drawText("Thématiques abordées:", {
    x: 100,
    y: height - 315 - axesYOffset,
    size: 10,
    font: latinFont,
    color: gray,
  });
  
  // Draw axes (left-aligned for French)
  let yPosition = height - 340 - axesYOffset;
  for (const axis of content.axes) {
    // Wrap text if too long
    const maxWidth = width - 200;
    const words = axis.split(' ');
    let currentLine = '';
    const lines: string[] = [];
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = latinFont.widthOfTextAtSize(`• ${testLine}`, 9);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Draw wrapped lines
    for (const line of lines) {
      page.drawText(`• ${line}`, {
        x: 100,
        y: yPosition,
        size: 9,
        font: latinFont,
        color: gray,
      });
      yPosition -= 15;
    }
  }
  
  // Signatures section
  page.drawText("Ali Saadallah", {
    x: width - 200,
    y: 110,
    size: 11,
    font: latinFont,
    color: black,
  });
  
  page.drawText("Directeur de l'Académie", {
    x: width - 220,
    y: 95,
    size: 9,
    font: latinFont,
    color: gray,
  });
  
  page.drawText("Sami El Haj", {
    x: 100,
    y: 110,
    size: 11,
    font: latinFont,
    color: black,
  });
  
  page.drawText("Coordinateur Général, Misr pour l'Éducation", {
    x: 50,
    y: 95,
    size: 9,
    font: latinFont,
    color: gray,
  });
  
  // Date in bottom-left corner
  const issueDate = data.completionDate; // Use completion date instead of current date
  const formattedDate = formatDateFrench(issueDate);
  
  const dateText = `Délivré le: ${formattedDate}`;
  page.drawText(dateText, {
    x: 50,
    y: 50,
    size: 10,
    font: latinFont,
    color: gray,
  });
}

/**
 * Draw comprehensive (master) certificate - awarded to those who completed all courses
 * Golden/royal design with 4 signatures
 */
async function drawComprehensiveCertificate(
  page: any,
  font: any,
  content: CertificateContent,
  data: CertificateData,
  width: number,
  height: number,
  pdfDoc: any,
  stampBytes: Buffer | null
) {
  const gold = rgb(0.6, 0.45, 0.05);
  const darkGold = rgb(0.45, 0.3, 0.0);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.33, 0.33, 0.33);
  const lightGray = rgb(0.5, 0.5, 0.5);

  // Right header - Government info
  const headerText1 = processArabicText('الجمهورية التونسية');
  const headerWidth1 = font.widthOfTextAtSize(headerText1, 8);
  page.drawText(headerText1, { x: width - 70 - headerWidth1, y: height - 120, size: 8, font, color: gray });

  const headerText2 = processArabicText('وزارة التشغيل والتكوين المهني');
  const headerWidth2 = font.widthOfTextAtSize(headerText2, 8);
  page.drawText(headerText2, { x: width - 70 - headerWidth2, y: height - 133, size: 8, font, color: gray });

  const headerText3 = processArabicText('ليدر أكاديمي');
  const headerWidth3 = font.widthOfTextAtSize(headerText3, 8);
  page.drawText(headerText3, { x: width - 70 - headerWidth3, y: height - 146, size: 8, font, color: gray });

  const headerText4 = processArabicText('تسجيل عدد 61-903-16');
  const headerWidth4 = font.widthOfTextAtSize(headerText4, 7);
  page.drawText(headerText4, { x: width - 70 - headerWidth4, y: height - 159, size: 7, font, color: lightGray });

  // Main title "شهادة" in gold
  const titleText = processArabicText('شهادة');
  const titleWidth = font.widthOfTextAtSize(titleText, 56);
  page.drawText(titleText, { x: (width - titleWidth) / 2, y: height - 115, size: 56, font, color: gold });

  // Subtitle
  const subtitleText = processArabicText('أُسندت هذه الشهادة إلى السيد/ة:');
  const subtitleWidth = font.widthOfTextAtSize(subtitleText, 14);
  page.drawText(subtitleText, { x: (width - subtitleWidth) / 2, y: height - 180, size: 14, font, color: gray });

  // Participant name
  const participantNameAr = processArabicText(data.participantName);
  const nameWidth = font.widthOfTextAtSize(participantNameAr, 28);
  page.drawText(participantNameAr, { x: (width - nameWidth) / 2, y: height - 235, size: 28, font, color: black });

  // ID card number
  if (data.idCardNumber) {
    const arabicPart = processArabicText('صاحب/ة بطاقة تعريف وطنية رقم');
    const numberPart = data.idCardNumber;
    const arabicWidth = font.widthOfTextAtSize(arabicPart, 12);
    const numberWidth = font.widthOfTextAtSize(numberPart, 12);
    const spaceWidth = 5;
    const fullWidth = arabicWidth + spaceWidth + numberWidth;
    const startX = (width - fullWidth) / 2;
    page.drawText(numberPart, { x: startX, y: height - 255, size: 12, font, color: gray });
    page.drawText(arabicPart, { x: startX + numberWidth + spaceWidth, y: height - 255, size: 12, font, color: gray });
  }

  // Main text
  const mainText = processArabicText(content.mainText);
  const mainTextWidth = font.widthOfTextAtSize(mainText, 13);
  const mainTextY = data.idCardNumber ? height - 280 : height - 265;
  page.drawText(mainText, { x: (width - mainTextWidth) / 2, y: mainTextY, size: 13, font, color: gray });

  // Gold decorative line
  const underlineY = data.idCardNumber ? height - 295 : height - 280;
  page.drawLine({ start: { x: 150, y: underlineY }, end: { x: width - 150, y: underlineY }, thickness: 2, color: gold });
  page.drawLine({ start: { x: 160, y: underlineY - 4 }, end: { x: width - 160, y: underlineY - 4 }, thickness: 0.5, color: darkGold });

  // Axes header
  const axesHeaderText = processArabicText('والتي تناولت المحاور التالية :');
  const axesHeaderWidth = font.widthOfTextAtSize(axesHeaderText, 12);
  const axesHeaderY = data.idCardNumber ? height - 315 : height - 300;
  page.drawText(axesHeaderText, { x: width - 150 - axesHeaderWidth, y: axesHeaderY, size: 12, font, color: darkGold });

  // Draw axes
  let yPosition = data.idCardNumber ? height - 335 : height - 320;
  for (const axis of content.axes) {
    const axisText = processArabicText(`• ${axis}`);
    const axisWidth = font.widthOfTextAtSize(axisText, 11);
    if (axisWidth > width - 200) {
      const words = axis.split(' ');
      let currentLine = '';
      const lines: string[] = [];
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = font.widthOfTextAtSize(processArabicText(`• ${testLine}`), 11);
        if (testWidth > width - 200 && currentLine) { lines.push(currentLine); currentLine = word; }
        else { currentLine = testLine; }
      }
      if (currentLine) lines.push(currentLine);
      for (const line of lines) {
        const lineText = processArabicText(`• ${line}`);
        const lineWidth = font.widthOfTextAtSize(lineText, 11);
        page.drawText(lineText, { x: width - 150 - lineWidth, y: yPosition, size: 11, font, color: gray });
        yPosition -= 15;
      }
    } else {
      page.drawText(axisText, { x: width - 150 - axisWidth, y: yPosition, size: 11, font, color: gray });
      yPosition -= 15;
    }
  }

  // 4 signatures at the bottom
  // Sig 1 (far right): د. كمال الحجام
  const sig1Name = processArabicText('د. كمال الحجام');
  const sig1NameW = font.widthOfTextAtSize(sig1Name, 12);
  page.drawText(sig1Name, { x: width - 100 - sig1NameW, y: 145, size: 12, font, color: black });
  const sig1Sub = processArabicText('دكتوراه في علوم التربية');
  const sig1SubW = font.widthOfTextAtSize(sig1Sub, 9);
  page.drawText(sig1Sub, { x: width - 100 - sig1SubW, y: 130, size: 9, font, color: gray });

  // Sig 2: أ. علي سعدالله (director)
  const sig2Name = processArabicText('أ. علي سعدالله');
  const sig2NameW = font.widthOfTextAtSize(sig2Name, 12);
  const sig2X = width * 0.55;
  page.drawText(sig2Name, { x: sig2X - sig2NameW, y: 145, size: 12, font, color: black });
  const sig2Sub = processArabicText('مدير الأكاديمية');
  const sig2SubW = font.widthOfTextAtSize(sig2Sub, 9);
  page.drawText(sig2Sub, { x: sig2X - sig2SubW, y: 130, size: 9, font, color: gray });

  // Sig 3: أ. سامي الجازي
  const sig3Name = processArabicText('أ. سامي الجازي');
  const sig3NameW = font.widthOfTextAtSize(sig3Name, 12);
  const sig3X = width * 0.38;
  page.drawText(sig3Name, { x: sig3X - sig3NameW, y: 145, size: 12, font, color: black });
  const sig3Sub = processArabicText('متفقد عام مميز للتربية');
  const sig3SubW = font.widthOfTextAtSize(sig3Sub, 9);
  page.drawText(sig3Sub, { x: sig3X - sig3SubW, y: 130, size: 9, font, color: gray });

  // Sig 4 (far left): أ. حفيظ البدوي
  const sig4Name = processArabicText('أ. حفيظ البدوي');
  const sig4NameW = font.widthOfTextAtSize(sig4Name, 12);
  const sig4X = width * 0.2;
  page.drawText(sig4Name, { x: sig4X - sig4NameW, y: 145, size: 12, font, color: black });
  const sig4Sub = processArabicText('متفقد عام للتربية');
  const sig4SubW = font.widthOfTextAtSize(sig4Sub, 9);
  page.drawText(sig4Sub, { x: sig4X - sig4SubW, y: 130, size: 9, font, color: gray });

  // Stamp under director's signature
  if (stampBytes) {
    try {
      const stampImage = await pdfDoc.embedPng(stampBytes);
      const stampSize = 90;
      const sigCenterX = sig2X - sig2NameW / 2;
      page.drawImage(stampImage, {
        x: sigCenterX - stampSize / 2,
        y: 30,
        width: stampSize,
        height: stampSize * (stampImage.height / stampImage.width)
      });
    } catch (error) { console.error('Failed to embed stamp:', error); }
  }

  // Batch info at bottom center
  if (data.batchNumber) {
    const batchText = processArabicText(`الدفعة رقم ${data.batchNumber} من البرنامج التكويني لتأهيل المدرسين`);
    const batchWidth = font.widthOfTextAtSize(batchText, 9);
    page.drawText(batchText, { x: (width - batchWidth) / 2, y: 50, size: 9, font, color: lightGray });
  }

  // Date in bottom left
  const issueDate = data.completionDate;
  const arabicMonths = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const day = issueDate.getDate().toString();
  const month = processArabicText(arabicMonths[issueDate.getMonth()]);
  const year = issueDate.getFullYear().toString();
  const dayW = font.widthOfTextAtSize(day, 10);
  const monthW = font.widthOfTextAtSize(month, 10);
  const yearW = font.widthOfTextAtSize(year, 10);
  const sp = 3;
  let cx = 50 + dayW + sp + monthW + sp + yearW;
  cx -= dayW;
  page.drawText(day, { x: cx, y: 50, size: 10, font, color: gray });
  cx -= sp + monthW;
  page.drawText(month, { x: cx, y: 50, size: 10, font, color: gray });
  cx -= sp + yearW;
  page.drawText(year, { x: cx, y: 50, size: 10, font, color: gray });
}


/**
 * Draw English certificate content - Custom geometric design for Video AI course
 * Matches the official Leader Academy certificate template with:
 * - Light gray geometric angular background shapes
 * - Gold/yellow accent triangles
 * - Leader Academy logo top-left
 * - English text layout (LTR)
 * - "Leader Academy" and "Date" at bottom
 */
async function drawEnglishCertificate(
  page: any,
  latinFont: any,
  arabicFont: any,
  content: CertificateContent,
  data: CertificateData,
  width: number,
  height: number,
  gray: any,
  lightGray: any,
  black: any,
  pdfDoc: any,
  stampBytes: Buffer | null
) {
  // ===== GEOMETRIC BACKGROUND DESIGN =====
  // Light gray background fill
  page.drawRectangle({
    x: 0, y: 0,
    width, height,
    color: rgb(0.97, 0.97, 0.97), // Very light gray background
  });

  // Thin border
  page.drawRectangle({
    x: 8, y: 8,
    width: width - 16, height: height - 16,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 1,
  });

  // Geometric angular shapes - top right area (light gray triangles)
  // Triangle 1 - top right
  page.drawLine({ start: { x: width - 200, y: height }, end: { x: width, y: height - 150 }, thickness: 0.5, color: rgb(0.88, 0.88, 0.88) });
  page.drawLine({ start: { x: width - 150, y: height }, end: { x: width, y: height - 100 }, thickness: 0.5, color: rgb(0.90, 0.90, 0.90) });
  page.drawLine({ start: { x: width - 100, y: height }, end: { x: width, y: height - 60 }, thickness: 0.5, color: rgb(0.92, 0.92, 0.92) });

  // Fill top-right corner with light gray triangular area
  page.drawRectangle({
    x: width - 250, y: height - 200,
    width: 250, height: 200,
    color: rgb(0.94, 0.94, 0.94),
    opacity: 0.4,
  });

  // Gold accent triangle - top right
  page.drawLine({ start: { x: width - 120, y: height - 80 }, end: { x: width - 60, y: height - 160 }, thickness: 2, color: rgb(0.85, 0.72, 0.35) });
  page.drawLine({ start: { x: width - 60, y: height - 160 }, end: { x: width - 40, y: height - 100 }, thickness: 2, color: rgb(0.85, 0.72, 0.35) });

  // Gold accent triangle - middle area
  page.drawLine({ start: { x: width - 80, y: height / 2 + 30 }, end: { x: width - 30, y: height / 2 - 40 }, thickness: 1.5, color: rgb(0.85, 0.72, 0.35) });
  page.drawLine({ start: { x: width - 30, y: height / 2 - 40 }, end: { x: width - 50, y: height / 2 + 10 }, thickness: 1.5, color: rgb(0.85, 0.72, 0.35) });

  // Bottom left geometric shapes
  page.drawRectangle({
    x: 0, y: 0,
    width: 200, height: 150,
    color: rgb(0.94, 0.94, 0.94),
    opacity: 0.4,
  });

  // Gold accent triangle - bottom left
  page.drawLine({ start: { x: 40, y: 120 }, end: { x: 100, y: 50 }, thickness: 1.5, color: rgb(0.85, 0.72, 0.35) });
  page.drawLine({ start: { x: 100, y: 50 }, end: { x: 70, y: 90 }, thickness: 1.5, color: rgb(0.85, 0.72, 0.35) });

  // ===== LOGO =====
  // Draw Leader Academy logo in top-left corner
  const logoUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/TABMpUkybTgmkLSW.png";
  try {
    const logoBytes = await downloadResource(logoUrl);
    if (logoBytes) {
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoWidth = 120;
      const logoHeight = logoWidth * (logoImage.height / logoImage.width);
      page.drawImage(logoImage, {
        x: 30,
        y: height - 30 - logoHeight,
        width: logoWidth,
        height: logoHeight,
      });
    }
  } catch (error) {
    console.error("Failed to embed logo in English cert:", error);
  }

  // ===== CONTENT =====
  
  // Main title - "CERTIFICAT" (large, bold-like, centered, underlined)
  const titleText = content.title; // "CERTIFICAT"
  const titleSize = 52;
  const titleWidth = latinFont.widthOfTextAtSize(titleText, titleSize);
  const titleX = (width - titleWidth) / 2;
  const titleY = height - 160;
  page.drawText(titleText, {
    x: titleX,
    y: titleY,
    size: titleSize,
    font: latinFont,
    color: black,
  });
  
  // Underline below title
  page.drawLine({
    start: { x: titleX - 10, y: titleY - 8 },
    end: { x: titleX + titleWidth + 10, y: titleY - 8 },
    thickness: 2,
    color: black,
  });

  // Subtitle - "OF PARTICIPATION"
  const subtitleText = content.subtitle; // "OF PARTICIPATION"
  const subtitleSize = 20;
  const subtitleWidth = latinFont.widthOfTextAtSize(subtitleText, subtitleSize);
  page.drawText(subtitleText, {
    x: (width - subtitleWidth) / 2,
    y: height - 210,
    size: subtitleSize,
    font: latinFont,
    color: black,
  });

  // "THIS CERTIFICATE WAS ACCREDITED TO"
  const accreditedText = "THIS CERTIFICATE WAS ACCREDITED TO";
  const accreditedSize = 11;
  const accreditedWidth = latinFont.widthOfTextAtSize(accreditedText, accreditedSize);
  page.drawText(accreditedText, {
    x: (width - accreditedWidth) / 2,
    y: height - 255,
    size: accreditedSize,
    font: latinFont,
    color: gray,
  });

  // Participant name (use Arabic font for Arabic names, Latin for others)
  const participantName = data.participantName;
  // Try to detect if name contains Arabic characters
  const hasArabic = /[\u0600-\u06FF]/.test(participantName);
  const nameFont = hasArabic ? arabicFont : latinFont;
  const displayName = hasArabic ? processArabicText(participantName) : participantName;
  const nameSize = 26;
  const nameWidth = nameFont.widthOfTextAtSize(displayName, nameSize);
  page.drawText(displayName, {
    x: (width - nameWidth) / 2,
    y: height - 300,
    size: nameSize,
    font: nameFont,
    color: black,
  });

  // Main text - "For active participation in a training course (15 hours) titled :"
  const mainText = content.mainText;
  const mainTextSize = 11;
  const mainTextWidth = latinFont.widthOfTextAtSize(mainText, mainTextSize);
  page.drawText(mainText, {
    x: (width - mainTextWidth) / 2,
    y: height - 340,
    size: mainTextSize,
    font: latinFont,
    color: gray,
  });

  // Course title in guillemets - "«Educational Video Preparation Course using Artificial Intelligence»"
  const courseTitle = `\u00ABEducational Video Preparation Course using Artificial Intelligence\u00BB`;
  const courseTitleSize = 16;
  const courseTitleWidth = latinFont.widthOfTextAtSize(courseTitle, courseTitleSize);
  page.drawText(courseTitle, {
    x: (width - courseTitleWidth) / 2,
    y: height - 375,
    size: courseTitleSize,
    font: latinFont,
    color: black,
  });

  // "The course covered the following topics:"
  const topicsHeader = "The course covered the following topics:";
  const topicsHeaderSize = 10;
  page.drawText(topicsHeader, {
    x: 60,
    y: height - 415,
    size: topicsHeaderSize,
    font: latinFont,
    color: gray,
  });

  // Draw axes/topics
  let yPosition = height - 440;
  for (const axis of content.axes) {
    const maxWidth = width - 120;
    const words = axis.split(' ');
    let currentLine = '';
    const lines: string[] = [];

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = latinFont.widthOfTextAtSize(testLine, 10);
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    for (let i = 0; i < lines.length; i++) {
      const lineText = i === 0 ? lines[i] : lines[i];
      page.drawText(lineText, {
        x: 60,
        y: yPosition,
        size: 10,
        font: latinFont,
        color: gray,
      });
      yPosition -= 14;
    }
    // Add a small dot separator between topics
    if (axis !== content.axes[content.axes.length - 1]) {
      yPosition -= 2;
    }
  }

  // ===== FOOTER =====
  
  // "Leader Academy" - bottom left
  const leaderText = "Leader Academy";
  const leaderSize = 13;
  page.drawText(leaderText, {
    x: 80,
    y: 60,
    size: leaderSize,
    font: latinFont,
    color: black,
  });

  // Add stamp under Leader Academy if available
  if (stampBytes) {
    try {
      const stampImage = await pdfDoc.embedPng(stampBytes);
      const stampSize = 80;
      page.drawImage(stampImage, {
        x: 75,
        y: 70,
        width: stampSize,
        height: stampSize * (stampImage.height / stampImage.width),
        opacity: 0.6,
      });
    } catch (error) {
      console.error("Failed to embed stamp:", error);
    }
  }

  // Date - bottom right
  const issueDate = data.completionDate;
  const day = issueDate.getDate().toString().padStart(2, '0');
  const month = (issueDate.getMonth() + 1).toString().padStart(2, '0');
  const year = issueDate.getFullYear().toString();
  const dateStr = `Date : ${day}/${month}/${year}`;
  const dateSize = 12;
  const dateWidth = latinFont.widthOfTextAtSize(dateStr, dateSize);
  page.drawText(dateStr, {
    x: width - 80 - dateWidth,
    y: 60,
    size: dateSize,
    font: latinFont,
    color: black,
  });
}
