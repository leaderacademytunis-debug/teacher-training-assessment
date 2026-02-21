import { describe, it, expect } from 'vitest';
import { parseCSVQuestions } from './questionParser';
import { readFileSync } from 'fs';

describe('True/False Questions Parser (2 options)', () => {
  it('should parse questions with 2 options and add options C and D automatically', () => {
    const content = readFileSync('/home/ubuntu/test_true_false.csv', 'utf-8');
    const questions = parseCSVQuestions(content);
    
    console.log(`Parsed ${questions.length} questions`);
    
    // Should have parsed 5 questions
    expect(questions.length).toBe(5);
    
    // Check first question
    const firstQuestion = questions[0];
    expect(firstQuestion.question).toBe('الأرض كروية الشكل');
    expect(firstQuestion.optionA).toBe('صح');
    expect(firstQuestion.optionB).toBe('خطأ');
    expect(firstQuestion.optionC).toBe('غير متأكد'); // Auto-added 3rd option
    expect(firstQuestion.optionD).toBe('لا شيء مما سبق'); // Auto-added 4th option
    expect(firstQuestion.correctAnswer).toBe('A'); // Points=1 should convert to A
    
    console.log('First question:', firstQuestion);
    
    // Check second question (correct answer should be B)
    const secondQuestion = questions[1];
    expect(secondQuestion.question).toBe('الشمس تدور حول الأرض');
    expect(secondQuestion.correctAnswer).toBe('B'); // Points=2 should convert to B (false)
    
    console.log('Second question:', secondQuestion);
    
    // Verify all questions have 4 options
    questions.forEach((q, index) => {
      expect(q.optionA).toBeTruthy();
      expect(q.optionB).toBeTruthy();
      expect(q.optionC).toBe('غير متأكد');
      expect(q.optionD).toBe('لا شيء مما سبق');
      console.log(`Question ${index + 1}: ${q.question} - Correct: ${q.correctAnswer}`);
    });
  });
  
  it('should handle mixed format CSV with 2, 3, and 4 options', () => {
    const mixedContent = `Question,Option 1,Option 2,Option 3,Option 4,Points
السؤال الأول بخيارين,صح,خطأ,,,1
السؤال الثاني بثلاثة خيارات,الخيار أ,الخيار ب,الخيار ج,,2
السؤال الثالث بأربعة خيارات,الخيار أ,الخيار ب,الخيار ج,الخيار د,3`;
    
    console.log('Mixed content:', mixedContent);
    
    const questions = parseCSVQuestions(mixedContent);
    
    console.log(`Parsed ${questions.length} mixed questions`);
    console.log('All parsed questions:', JSON.stringify(questions, null, 2));
    
    // Should parse all 3 questions
    expect(questions.length).toBe(3);
    
    // First question (2 options)
    expect(questions[0].optionA).toBe('صح');
    expect(questions[0].optionB).toBe('خطأ');
    expect(questions[0].optionC).toBe('غير متأكد');
    expect(questions[0].optionD).toBe('لا شيء مما سبق');
    
    // Second question (3 options)
    expect(questions[1].optionA).toBe('الخيار أ');
    expect(questions[1].optionB).toBe('الخيار ب');
    expect(questions[1].optionC).toBe('الخيار ج');
    expect(questions[1].optionD).toBe('لا شيء مما سبق');
    
    // Third question (4 options)
    expect(questions[2].optionA).toBe('الخيار أ');
    expect(questions[2].optionB).toBe('الخيار ب');
    expect(questions[2].optionC).toBe('الخيار ج');
    expect(questions[2].optionD).toBe('الخيار د');
    
    questions.forEach((q, index) => {
      console.log(`Mixed Question ${index + 1}:`, {
        question: q.question.substring(0, 30),
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correct: q.correctAnswer
      });
    });
  });
});
