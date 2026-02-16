import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import https from "node:https";
import { processArabicText, wrapArabicText } from './arabicTextHelper';
import { getCertificateContent, type CertificateContent } from './certificateContent';

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
  
  // Draw decorative borders with category-specific colors
  const margin = 15;
  const innerMargin = 30;
  const borderColors = getBorderColorForCategory(data.courseType);
  
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
  
  // Flag removed per user request
  
  // Draw text content based on language
  const black = rgb(0, 0, 0);
  const gray = rgb(0.33, 0.33, 0.33);
  const lightGray = rgb(0.4, 0.4, 0.4);
  
  if (content.language === 'ar') {
    // Arabic certificate layout
    await drawArabicCertificate(page, mainFont, content, data, width, height, gray, lightGray, black, pdfDoc, stampBytes);
  } else if (content.language === 'fr') {
    // French certificate layout
    await drawFrenchCertificate(page, fallbackFont, mainFont, content, data, width, height, gray, lightGray, black);
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
  
  // Main text (increased size)
  const mainText = processArabicText(content.mainText);
  const mainTextWidth = font.widthOfTextAtSize(mainText, 13);
  page.drawText(mainText, {
    x: (width - mainTextWidth) / 2,
    y: height - 265,
    size: 13,
    font: font,
    color: gray,
  });
  
  // Underline
  page.drawLine({
    start: { x: 210, y: height - 280 },
    end: { x: width - 210, y: height - 280 },
    thickness: 1.5,
    color: black,
  });
  
  // Axes header (increased size)
  const axesHeaderText = processArabicText("التي تناولت المحاور التالية :");
  const axesHeaderWidth = font.widthOfTextAtSize(axesHeaderText, 12);
  page.drawText(axesHeaderText, {
    x: width - 150 - axesHeaderWidth,
    y: height - 295,
    size: 12,
    font: font,
    color: gray,
  });
  
  // Draw axes (right-aligned for Arabic)
  let yPosition = height - 320;
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
  const months = [
    'جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان',
    'جويلية', 'أوت', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const issueDate = new Date();
  const day = issueDate.getDate();
  const month = issueDate.getMonth() + 1; // Months are 0-indexed
  const year = issueDate.getFullYear() % 100; // Get last 2 digits of year
  
  // Format date with Western numerals (padded to 2 digits)
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedYear = String(year).padStart(2, '0');
  
  const arabicPrefix = processArabicText('صدرت بتاريخ:');
  const dateText = `${arabicPrefix} ${formattedDay}/${formattedMonth}/${formattedYear}`;
  
  page.drawText(dateText, {
    x: 50,
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
  
  // Underline
  page.drawLine({
    start: { x: 150, y: height - 285 },
    end: { x: width - 150, y: height - 285 },
    thickness: 1.5,
    color: black,
  });
  
  // Axes header
  page.drawText("Thématiques abordées:", {
    x: 100,
    y: height - 315,
    size: 10,
    font: latinFont,
    color: gray,
  });
  
  // Draw axes (left-aligned for French)
  let yPosition = height - 340;
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
  const issueDate = new Date();
  const day = issueDate.getDate();
  const month = issueDate.getMonth() + 1; // Months are 0-indexed
  const year = issueDate.getFullYear() % 100; // Get last 2 digits of year
  
  // Format date with Western numerals (padded to 2 digits)
  const formattedDay = String(day).padStart(2, '0');
  const formattedMonth = String(month).padStart(2, '0');
  const formattedYear = String(year).padStart(2, '0');
  
  const dateText = `Délivré le: ${formattedDay}/${formattedMonth}/${formattedYear}`;
  page.drawText(dateText, {
    x: 50,
    y: 50,
    size: 10,
    font: latinFont,
    color: gray,
  });
}
