import { parseCSVQuestions } from './server/questionParser.ts';
import { readFileSync } from 'fs';

const content = readFileSync('/home/ubuntu/test_google_form.csv', 'utf-8');
console.log('Content:', content);
console.log('\n---\n');

const questions = parseCSVQuestions(content);
console.log('Parsed questions:', JSON.stringify(questions, null, 2));
console.log(`\nTotal: ${questions.length} questions`);
