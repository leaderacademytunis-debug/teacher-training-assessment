/**
 * Question parser for importing exams from various formats
 */

export interface ParsedQuestion {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
}

/**
 * Parse questions from text format
 * Expected format:
 * Q: Question text?
 * A: Option A
 * B: Option B
 * C: Option C
 * D: Option D
 * CORRECT: A
 * ---
 */
export function parseTextQuestions(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Split by separator (--- or double newline)
  const blocks = content.split(/---+|\n\n\n+/).map(b => b.trim()).filter(b => b);
  
  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    
    let question = '';
    let optionA = '';
    let optionB = '';
    let optionC = '';
    let optionD = '';
    let correctAnswer: 'A' | 'B' | 'C' | 'D' | '' = '';
    
    for (const line of lines) {
      // Question line
      if (line.match(/^Q[:\s]/i) || line.match(/^س[:\s]/)) {
        question = line.replace(/^(Q|س)[:\s]/i, '').trim();
      }
      // Option A
      else if (line.match(/^A[:\s]/i) || line.match(/^أ[:\s]/)) {
        optionA = line.replace(/^(A|أ)[:\s]/i, '').trim();
      }
      // Option B
      else if (line.match(/^B[:\s]/i) || line.match(/^ب[:\s]/)) {
        optionB = line.replace(/^(B|ب)[:\s]/i, '').trim();
      }
      // Option C
      else if (line.match(/^C[:\s]/i) || line.match(/^ج[:\s]/)) {
        optionC = line.replace(/^(C|ج)[:\s]/i, '').trim();
      }
      // Option D
      else if (line.match(/^D[:\s]/i) || line.match(/^د[:\s]/)) {
        optionD = line.replace(/^(D|د)[:\s]/i, '').trim();
      }
      // Correct answer
      else if (line.match(/^(CORRECT|الإجابة الصحيحة|الاجابة)[:\s]/i)) {
        const answer = line.replace(/^(CORRECT|الإجابة الصحيحة|الاجابة)[:\s]/i, '').trim().toUpperCase();
        if (answer === 'A' || answer === 'أ') correctAnswer = 'A';
        else if (answer === 'B' || answer === 'ب') correctAnswer = 'B';
        else if (answer === 'C' || answer === 'ج') correctAnswer = 'C';
        else if (answer === 'D' || answer === 'د') correctAnswer = 'D';
      }
    }
    
    // Validate question has all required fields
    if (question && optionA && optionB && optionC && optionD && correctAnswer) {
      questions.push({
        question,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
      });
    }
  }
  
  return questions;
}

/**
 * Parse questions from Google Forms CSV export format
 * Expected format:
 * Question,Type,Options
 * "Question text","Multiple Choice","Option A | Option B | Option C | Option D"
 */
export function parseGoogleFormsCSV(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  // Skip header
  const startIndex = 1;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse CSV line
    const fields = parseCSVLine(line);
    
    if (fields.length < 3) continue;
    
    const [question, type, options] = fields;
    
    // Only process Multiple Choice questions
    if (type.trim() !== 'Multiple Choice') continue;
    
    // Split options by |
    const optionsList = options.split('|').map(o => o.trim()).filter(o => o);
    
    // We need at least 4 options
    if (optionsList.length < 4) continue;
    
    // For now, assume first option is correct (user will need to specify)
    // TODO: Add UI to select correct answer after import
    questions.push({
      question: question.trim(),
      optionA: optionsList[0],
      optionB: optionsList[1],
      optionC: optionsList[2],
      optionD: optionsList[3],
      correctAnswer: 'A', // Default, user should update
    });
  }
  
  return questions;
}

/**
 * Parse questions from CSV format
 * Expected format:
 * question,option_a,option_b,option_c,option_d,correct
 * "Question text","Option A","Option B","Option C","Option D","A"
 */
export function parseCSVQuestions(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  
  // Detect delimiter (comma or semicolon)
  const delimiter = content.includes(';') && !content.includes(',') ? ';' : ',';
  
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  // Skip header if present
  const startIndex = lines[0]?.toLowerCase().includes('question') ? 1 : 0;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse CSV line (handle quoted fields)
    const fields = parseCSVLine(line, delimiter);
    
    // Support 4 fields (2 options + points), 5 fields (3 options + points), and 6 fields (4 options + correct)
    if (fields.length < 4) continue;
    
    let question, optionA, optionB, optionC, optionD, correct;
    
    // Determine format based on which fields are filled
    // For CSV with 6 fields: Question,Option1,Option2,Option3,Option4,Points
    if (fields.length >= 6) {
      [question, optionA, optionB, optionC, optionD, correct] = fields;
      
      // Check if it's actually a 2-option format (Option3 and Option4 are empty)
      if ((!optionC || !optionC.trim()) && (!optionD || !optionD.trim())) {
        optionC = 'غير متأكد'; // Add default 3rd option: "Not sure"
        optionD = 'لا شيء مما سبق'; // Add default 4th option: "None of the above"
      }
      // Check if it's a 3-option format (Option4 is empty)
      else if (!optionD || !optionD.trim()) {
        optionD = 'لا شيء مما سبق'; // Add default 4th option
      }
    }
    // Format with 5 fields: Question,Option1,Option2,Option3,Points
    else if (fields.length === 5) {
      [question, optionA, optionB, optionC, correct] = fields;
      optionD = 'لا شيء مما سبق'; // Add default 4th option
    }
    // Format with 4 fields: Question,Option1,Option2,Points
    else if (fields.length === 4) {
      [question, optionA, optionB, correct] = fields;
      optionC = 'غير متأكد'; // Add default 3rd option
      optionD = 'لا شيء مما سبق'; // Add default 4th option
    }
    else {
      continue; // Skip invalid lines
    }
    
    // Skip lines with personal data ("نص حر" or empty required options)
    if (!question || !optionA || optionA.includes('نص حر') || !optionB) continue;
    
    // Normalize correct answer
    let correctAnswer: 'A' | 'B' | 'C' | 'D' | '' = '';
    const normalizedCorrect = correct ? correct.trim().toUpperCase() : '';
    
    // Support letter format (A, B, C, D)
    if (normalizedCorrect === 'A' || normalizedCorrect === 'أ') correctAnswer = 'A';
    else if (normalizedCorrect === 'B' || normalizedCorrect === 'ب') correctAnswer = 'B';
    else if (normalizedCorrect === 'C' || normalizedCorrect === 'ج') correctAnswer = 'C';
    else if (normalizedCorrect === 'D' || normalizedCorrect === 'د') correctAnswer = 'D';
    // Support number format (1, 2, 3, 4) - convert to letters
    else if (normalizedCorrect === '1') correctAnswer = 'A';
    else if (normalizedCorrect === '2') correctAnswer = 'B';
    else if (normalizedCorrect === '3') correctAnswer = 'C';
    else if (normalizedCorrect === '4') correctAnswer = 'D';
    
    if (question && optionA && optionB && optionC && optionD && correctAnswer) {
      questions.push({
        question: question.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
      });
    }
  }
  
  return questions;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const fields: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      fields.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  
  // Add last field
  fields.push(currentField);
  
  return fields;
}
