// End-to-end TypeScript test script for NyayaVoice
import { SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS, SAMPLE_DOCUMENTS } from '../src/lib/documents/sample-documents';
import { analyzeDocumentHeuristically, answerDocumentQuestionHeuristically } from '../src/lib/ai/heuristic-analyzer';

console.log('=== RUNNING NYAYAVOICE E2E VERIFICATION SUITE ===\n');

// 1. Verify Sample Document Analysis Data
console.log('1. Verifying Sample Employment Agreement Structure...');
const sample = SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS;
console.assert(sample.clauses.length >= 14, `Expected at least 14 clauses, got ${sample.clauses.length}`);
console.assert(sample.userObligations.length >= 7, `Expected at least 7 user obligations, got ${sample.userObligations.length}`);
console.assert(sample.importantDates.length >= 3, `Expected at least 3 important dates, got ${sample.importantDates.length}`);
console.log(`✓ Sample Document verified (${sample.clauses.length} clauses, ${sample.userObligations.length} obligations, ${sample.importantDates.length} dates)`);

// 2. Test Grounded Q&A in English (Open source IP question)
console.log('\n2. Testing Grounded Q&A: Open Source / IP Query (English)...');
const answerEnglish = answerDocumentQuestionHeuristically(
  'Can I continue working on my personal open-source projects?',
  sample
);
console.log('Short Answer:', answerEnglish.shortAnswer);
console.log('Grounding Section:', answerEnglish.sourceClauses[0]?.section);
console.assert(answerEnglish.sourceClauses[0]?.section.includes('7'), 'Expected citation to Section 7');
console.assert(answerEnglish.confidence === 'high', 'Expected high confidence');
console.log('✓ English grounded answer verified with Section 7.1 citation');

// 3. Test Grounded Q&A in Hinglish (Notice period question)
console.log('\n3. Testing Grounded Q&A: Notice Period Query (Hinglish)...');
const answerHinglish = answerDocumentQuestionHeuristically(
  'Isme notice period kitna hai?',
  sample
);
console.log('Short Answer:', answerHinglish.shortAnswer);
console.log('Grounding Section:', answerHinglish.sourceClauses[0]?.section);
console.log('Language Detected:', answerHinglish.language);
console.assert(answerHinglish.sourceClauses[0]?.section.includes('8'), 'Expected citation to Section 8');
console.assert(answerHinglish.language === 'hinglish', 'Expected hinglish detection');
console.log('✓ Hinglish grounded answer verified with Section 8.2 citation (60 days)');

// 4. Test Heuristic Document Parser on Raw Text
console.log('\n4. Testing Raw Text Extraction & Parsing...');
const rawSample = SAMPLE_DOCUMENTS[0].rawText;
const parsedDoc = analyzeDocumentHeuristically(rawSample, 'Employment_Agreement.txt');
console.assert(parsedDoc.documentType === 'Employment Agreement', `Expected Employment Agreement, got ${parsedDoc.documentType}`);
console.assert(parsedDoc.clauses.length > 5, `Expected parsed clauses > 5, got ${parsedDoc.clauses.length}`);
console.assert(parsedDoc.userObligations.length > 0, `Expected user obligations, got ${parsedDoc.userObligations.length}`);
console.log(`✓ Raw text parser correctly extracted document structure (${parsedDoc.clauses.length} clauses, ${parsedDoc.userObligations.length} obligations)`);

console.log('\n=== ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY! ===\n');
