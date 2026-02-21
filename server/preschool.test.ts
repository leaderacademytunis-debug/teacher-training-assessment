import { describe, it, expect } from 'vitest';
import { parseCSVQuestions } from './questionParser';
import { readFileSync } from 'fs';

describe('Preschool CSV Parser (3 options)', () => {
  it('should parse questions with 3 options and add 4th option automatically', () => {
    const content = readFileSync('/home/ubuntu/upload/pre_school_education_test.csv', 'utf-8');
    const questions = parseCSVQuestions(content);
    
    console.log(`Parsed ${questions.length} questions`);
    
    // Should have parsed 13 questions (excluding 3 personal data lines)
    expect(questions.length).toBeGreaterThan(10);
    
    // Check first question
    const firstQuestion = questions[0];
    expect(firstQuestion.question).toContain('منهاج السنة التحضيرية');
    expect(firstQuestion.optionA).toBeTruthy();
    expect(firstQuestion.optionB).toBeTruthy();
    expect(firstQuestion.optionC).toBeTruthy();
    expect(firstQuestion.optionD).toBe('لا شيء مما سبق'); // Auto-added 4th option
    expect(firstQuestion.correctAnswer).toBe('A'); // Points=1 should convert to A
    
    console.log('First question:', firstQuestion);
    
    // Verify all questions have 4 options
    questions.forEach((q, index) => {
      expect(q.optionD).toBe('لا شيء مما سبق');
      console.log(`Question ${index + 1}: ${q.question.substring(0, 50)}... - Option D: ${q.optionD}`);
    });
  });
});
