import { describe, it, expect } from 'vitest';
import { parseCSVQuestions } from './questionParser';
import { readFileSync } from 'fs';

describe('Arabic CSV Parser', () => {
  it('should parse Arabic questions with Points format', () => {
    const content = readFileSync('/home/ubuntu/upload/google_form_questions_arabic.csv', 'utf-8');
    const questions = parseCSVQuestions(content);
    
    console.log(`Parsed ${questions.length} questions`);
    
    // Should have parsed 22 questions (excluding 2 personal data lines)
    expect(questions.length).toBeGreaterThan(15);
    
    // Check first question
    const firstQuestion = questions[0];
    expect(firstQuestion.question).toContain('الطرائق المعتمدة');
    expect(firstQuestion.optionA).toBeTruthy();
    expect(firstQuestion.optionB).toBeTruthy();
    expect(firstQuestion.optionC).toBeTruthy();
    expect(firstQuestion.optionD).toBeTruthy();
    expect(firstQuestion.correctAnswer).toBe('A'); // Points=1 should convert to A
    
    console.log('First question:', firstQuestion);
  });
});
