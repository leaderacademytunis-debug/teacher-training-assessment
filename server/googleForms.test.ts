import { describe, it, expect } from 'vitest';
import { parseGoogleFormsCSV } from './questionParser';
import { readFileSync } from 'fs';

describe('Google Forms CSV Parser', () => {
  it('should parse the real Google Forms file', () => {
    const content = readFileSync('/home/ubuntu/upload/google_form_questions.csv', 'utf-8');
    const questions = parseGoogleFormsCSV(content);
    
    console.log(`Parsed ${questions.length} questions`);
    questions.forEach((q, i) => {
      console.log(`\nQuestion ${i + 1}:`);
      console.log(`Q: ${q.question}`);
      console.log(`A: ${q.optionA}`);
      console.log(`B: ${q.optionB}`);
      console.log(`C: ${q.optionC}`);
      console.log(`D: ${q.optionD}`);
      console.log(`Correct: ${q.correctAnswer}`);
    });
    
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0].question).toBeTruthy();
    expect(questions[0].optionA).toBeTruthy();
    expect(questions[0].optionB).toBeTruthy();
    expect(questions[0].optionC).toBeTruthy();
    expect(questions[0].optionD).toBeTruthy();
  });
});
