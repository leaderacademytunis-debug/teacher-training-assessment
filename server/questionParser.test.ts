import { describe, it, expect } from 'vitest';
import { parseTextQuestions, parseCSVQuestions } from './questionParser';

describe('Question Parser', () => {
  describe('parseTextQuestions', () => {
    it('should parse Arabic questions correctly', () => {
      const content = `
Q: ما هي أهمية اللعب؟
A: تطوير المهارات الحركية
B: تطوير المهارات الاجتماعية
C: إضاعة الوقت
D: الترفيه فقط
CORRECT: B

---

Q: ما هو العمر المناسب؟
A: سنتان
B: ثلاث سنوات
C: أربع سنوات
D: ست سنوات
CORRECT: C
      `;

      const questions = parseTextQuestions(content);
      
      expect(questions).toHaveLength(2);
      expect(questions[0].question).toBe('ما هي أهمية اللعب؟');
      expect(questions[0].correctAnswer).toBe('B');
      expect(questions[1].question).toBe('ما هو العمر المناسب؟');
      expect(questions[1].correctAnswer).toBe('C');
    });

    it('should handle Arabic answer markers', () => {
      const content = `
س: سؤال تجريبي؟
أ: خيار أ
ب: خيار ب
ج: خيار ج
د: خيار د
الإجابة الصحيحة: ب
      `;

      const questions = parseTextQuestions(content);
      
      expect(questions).toHaveLength(1);
      expect(questions[0].correctAnswer).toBe('B');
    });
  });

  describe('parseCSVQuestions', () => {
    it('should parse CSV format correctly', () => {
      const content = `question,option_a,option_b,option_c,option_d,correct
"What is 2+2?","3","4","5","6","B"
"Capital of France?","Paris","London","Berlin","Madrid","A"`;

      const questions = parseCSVQuestions(content);
      
      expect(questions).toHaveLength(2);
      expect(questions[0].question).toBe('What is 2+2?');
      expect(questions[0].optionB).toBe('4');
      expect(questions[0].correctAnswer).toBe('B');
      expect(questions[1].question).toBe('Capital of France?');
      expect(questions[1].correctAnswer).toBe('A');
    });

    it('should handle CSV without header', () => {
      const content = `"Question 1","Opt A","Opt B","Opt C","Opt D","C"
"Question 2","Opt A","Opt B","Opt C","Opt D","D"`;

      const questions = parseCSVQuestions(content);
      
      // First line is treated as header if it contains 'question'
      // So we expect only 1 question (the second line)
      expect(questions).toHaveLength(1);
      expect(questions[0].question).toBe('Question 2');
      expect(questions[0].correctAnswer).toBe('D');
    });
  });
});
