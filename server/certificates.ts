import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import https from "node:https";
import { processArabicText, wrapArabicText } from './arabicTextHelper';
import { getCertificateContent, type CertificateContent } from './certificateContent';

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
  const logoUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/aYRTvdXAkBzKfCAY.png";
  const flagUrl = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663310693302/lUjeCQtcebHcrJBL.png";
  
  const [logoBytes, flagBytes, fontBytes] = await Promise.all([
    downloadResource(logoUrl).catch(() => null),
    downloadResource(flagUrl).catch(() => null),
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
  
  // Draw decorative borders
  const margin = 15;
  const innerMargin = 30;
  
  // Outer border
  page.drawRectangle({
    x: margin,
    y: margin,
    width: width - 2 * margin,
    height: height - 2 * margin,
    borderColor: rgb(0.2, 0.2, 0.2),
    borderWidth: 3,
  });
  
  // Inner border
  page.drawRectangle({
    x: innerMargin,
    y: innerMargin,
    width: width - 2 * innerMargin,
    height: height - 2 * innerMargin,
    borderColor: rgb(0.4, 0.4, 0.4),
    borderWidth: 1.5,
  });
  
  // Embed and draw images
  if (logoBytes) {
    try {
      const logoImage = await pdfDoc.embedPng(logoBytes);
      page.drawImage(logoImage, {
        x: 50,
        y: height - 170,
        width: 120,
        height: 120 * (logoImage.height / logoImage.width),
      });
    } catch (error) {
      console.error("Failed to embed logo:", error);
    }
  }
  
  if (flagBytes) {
    try {
      const flagImage = await pdfDoc.embedPng(flagBytes);
      page.drawImage(flagImage, {
        x: width - 120,
        y: height - 140,
        width: 60,
        height: 60 * (flagImage.height / flagImage.width),
      });
    } catch (error) {
      console.error("Failed to embed flag:", error);
    }
  }
  
  // Draw text content based on language
  const black = rgb(0, 0, 0);
  const gray = rgb(0.33, 0.33, 0.33);
  const lightGray = rgb(0.4, 0.4, 0.4);
  
  if (content.language === 'ar') {
    // Arabic certificate layout
    await drawArabicCertificate(page, mainFont, content, data, width, height, gray, lightGray, black);
  } else if (content.language === 'fr') {
    // French certificate layout
    await drawFrenchCertificate(page, fallbackFont, content, data, width, height, gray, lightGray, black);
  }
  
  // Add second page with additional info
  const page2 = pdfDoc.addPage([842, 595]);
  const footerText = content.language === 'ar' 
    ? processArabicText(`الدفعة رقم 701 من البرنامج الوطني لتأهيل المدرسين، ديسمبر 2026`)
    : `Promotion 701 du Programme National de Qualification des Enseignants, Décembre 2026`;
  
  const footerWidth = mainFont.widthOfTextAtSize(footerText, 10);
  page2.drawText(footerText, {
    x: (page2.getWidth() - footerWidth) / 2,
    y: page2.getHeight() - 100,
    size: 10,
    font: mainFont,
    color: gray,
  });
  
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
  black: any
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
  
  // Main title
  const titleText = processArabicText(content.title);
  const titleWidth = font.widthOfTextAtSize(titleText, 48);
  page.drawText(titleText, {
    x: (width - titleWidth) / 2,
    y: height - 115,
    size: 48,
    font: font,
    color: black,
  });
  
  // Subtitle
  const subtitleText = processArabicText(content.subtitle);
  const subtitleWidth = font.widthOfTextAtSize(subtitleText, 12);
  page.drawText(subtitleText, {
    x: (width - subtitleWidth) / 2,
    y: height - 175,
    size: 12,
    font: font,
    color: gray,
  });
  
  // Participant name (in English, no processing needed)
  const nameWidth = font.widthOfTextAtSize(data.participantName, 24);
  page.drawText(data.participantName, {
    x: (width - nameWidth) / 2,
    y: height - 215,
    size: 24,
    font: font,
    color: black,
  });
  
  // Main text
  const mainText = processArabicText(content.mainText);
  const mainTextWidth = font.widthOfTextAtSize(mainText, 11);
  page.drawText(mainText, {
    x: (width - mainTextWidth) / 2,
    y: height - 255,
    size: 11,
    font: font,
    color: gray,
  });
  
  // Underline
  page.drawLine({
    start: { x: 210, y: height - 265 },
    end: { x: width - 210, y: height - 265 },
    thickness: 1.5,
    color: black,
  });
  
  // Axes header
  const axesHeaderText = processArabicText("التي تناولت المحاور التالية :");
  const axesHeaderWidth = font.widthOfTextAtSize(axesHeaderText, 10);
  page.drawText(axesHeaderText, {
    x: width - 100 - axesHeaderWidth,
    y: height - 295,
    size: 10,
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
        const lineWidth = font.widthOfTextAtSize(lineText, 9);
        page.drawText(lineText, {
          x: width - 100 - lineWidth,
          y: yPosition,
          size: 9,
          font: font,
          color: gray,
        });
        yPosition -= 15;
      }
    } else {
      page.drawText(axisText, {
        x: width - 100 - axisWidth,
        y: yPosition,
        size: 9,
        font: font,
        color: gray,
      });
      yPosition -= 15;
    }
  }
  
  // Signatures section
  const sig1Text = processArabicText("أ. علي سعدالله");
  const sig1Width = font.widthOfTextAtSize(sig1Text, 11);
  page.drawText(sig1Text, {
    x: width - 150 - sig1Width,
    y: 110,
    size: 11,
    font: font,
    color: black,
  });
  
  const sig1SubText = processArabicText("مدير الأكاديمية");
  const sig1SubWidth = font.widthOfTextAtSize(sig1SubText, 9);
  page.drawText(sig1SubText, {
    x: width - 150 - sig1SubWidth,
    y: 95,
    size: 9,
    font: font,
    color: gray,
  });
  
  const sig2Text = processArabicText("أ. سامي الحاج");
  const sig2Width = font.widthOfTextAtSize(sig2Text, 11);
  page.drawText(sig2Text, {
    x: 150 - sig2Width / 2,
    y: 110,
    size: 11,
    font: font,
    color: black,
  });
  
  const sig2SubText = processArabicText("منسق عام، مصر للتربية");
  const sig2SubWidth = font.widthOfTextAtSize(sig2SubText, 9);
  page.drawText(sig2SubText, {
    x: 150 - sig2SubWidth / 2,
    y: 95,
    size: 9,
    font: font,
    color: gray,
  });
}

/**
 * Draw French certificate content
 */
async function drawFrenchCertificate(
  page: any,
  font: any,
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
    font: font,
    color: gray,
  });
  
  page.drawText("Ministère de l'Emploi et de la Formation Professionnelle", {
    x: width - 320,
    y: height - 133,
    size: 8,
    font: font,
    color: gray,
  });
  
  page.drawText("Leader Academy", {
    x: width - 150,
    y: height - 146,
    size: 8,
    font: font,
    color: gray,
  });
  
  page.drawText("Enregistrement N° 61-903-16", {
    x: width - 180,
    y: height - 159,
    size: 7,
    font: font,
    color: lightGray,
  });
  
  // Main title
  const titleLines = content.title.split('\n');
  let titleY = height - 100;
  for (const line of titleLines) {
    const lineWidth = font.widthOfTextAtSize(line, 32);
    page.drawText(line, {
      x: (width - lineWidth) / 2,
      y: titleY,
      size: 32,
      font: font,
      color: black,
    });
    titleY -= 40;
  }
  
  // Subtitle
  const subtitleWidth = font.widthOfTextAtSize(content.subtitle, 12);
  page.drawText(content.subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 195,
    size: 12,
    font: font,
    color: gray,
  });
  
  // Participant name
  const nameWidth = font.widthOfTextAtSize(data.participantName, 24);
  page.drawText(data.participantName, {
    x: (width - nameWidth) / 2,
    y: height - 235,
    size: 24,
    font: font,
    color: black,
  });
  
  // Main text
  const mainTextWidth = font.widthOfTextAtSize(content.mainText, 11);
  page.drawText(content.mainText, {
    x: (width - mainTextWidth) / 2,
    y: height - 275,
    size: 11,
    font: font,
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
    font: font,
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
      const testWidth = font.widthOfTextAtSize(`• ${testLine}`, 9);
      
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
        font: font,
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
    font: font,
    color: black,
  });
  
  page.drawText("Directeur de l'Académie", {
    x: width - 220,
    y: 95,
    size: 9,
    font: font,
    color: gray,
  });
  
  page.drawText("Sami El Haj", {
    x: 100,
    y: 110,
    size: 11,
    font: font,
    color: black,
  });
  
  page.drawText("Coordinateur Général, Misr pour l'Éducation", {
    x: 50,
    y: 95,
    size: 9,
    font: font,
    color: gray,
  });
}
