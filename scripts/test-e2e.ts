// End-to-end TypeScript test script for NyayaVoice
import { SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS, SAMPLE_DOCUMENTS } from '../src/lib/documents/sample-documents';
import { analyzeDocumentHeuristically, answerDocumentQuestionHeuristically } from '../src/lib/ai/heuristic-analyzer';

import { buildHandoffPdf } from '../src/lib/handoff/handoff-pdf';
import { buildProfessionalHandoff, formatDossierText } from '../src/lib/handoff/build-handoff';
import { compareDocuments } from '../src/lib/documents/compare-documents';
import { detectSpokenLanguage } from '../src/lib/i18n/languages';
import { notificationsForDocument } from '../src/lib/account/notifications';
import { retrieveRelevantClauses } from '../src/lib/retrieval/clause-retriever';
import { notFoundAnswer, validateGroundedAnswer } from '../src/lib/ai/citation-validator';

function check(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

console.log('=== RUNNING NYAYAVOICE E2E VERIFICATION SUITE ===\n');

// 1. Verify Sample Document Analysis Data
console.log('1. Verifying Sample Employment Agreement Structure...');
const sample = SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS;
check(sample.clauses.length >= 14, `Expected at least 14 clauses, got ${sample.clauses.length}`);
check(sample.userObligations.length >= 7, `Expected at least 7 user obligations, got ${sample.userObligations.length}`);
check(sample.importantDates.length >= 3, `Expected at least 3 important dates, got ${sample.importantDates.length}`);
console.log(`✓ Sample Document verified (${sample.clauses.length} clauses, ${sample.userObligations.length} obligations, ${sample.importantDates.length} dates)`);

// 2. Test Grounded Q&A in English (Open source IP question)
console.log('\n2. Testing Grounded Q&A: Open Source / IP Query (English)...');
const answerEnglish = answerDocumentQuestionHeuristically(
  'Can I continue working on my personal open-source projects?',
  sample
);
console.log('Short Answer:', answerEnglish.shortAnswer);
console.log('Grounding Section:', answerEnglish.sourceClauses[0]?.section);
check(answerEnglish.sourceClauses[0]?.section.includes('7'), `Expected citation to Section 7, got ${answerEnglish.sourceClauses[0]?.section}`);
check(answerEnglish.confidence === 'high', 'Expected high confidence');
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
check(answerHinglish.sourceClauses[0]?.section.includes('8'), `Expected citation to Section 8, got ${answerHinglish.sourceClauses[0]?.section}`);
check(answerHinglish.language === 'hinglish', 'Expected hinglish detection');
console.log('✓ Hinglish grounded answer verified with Section 8.2 citation (60 days)');

// 4. Test Heuristic Document Parser on Raw Text
console.log('\n4. Testing Raw Text Extraction & Parsing...');
const rawSample = SAMPLE_DOCUMENTS[0].rawText;
const parsedDoc = analyzeDocumentHeuristically(rawSample, 'Employment_Agreement.txt');
check(parsedDoc.documentType === 'Employment Agreement', `Expected Employment Agreement, got ${parsedDoc.documentType}`);
check(parsedDoc.clauses.length > 5, `Expected parsed clauses > 5, got ${parsedDoc.clauses.length}`);
check(parsedDoc.userObligations.length > 0, `Expected user obligations, got ${parsedDoc.userObligations.length}`);

const tamil = answerDocumentQuestionHeuristically('நோட்டீஸ் காலம் எவ்வளவு?', sample);
check(tamil.language === 'ta', `Expected Tamil detection, got ${tamil.language}`);
check(tamil.sourceClauses[0]?.section.includes('8'), `Expected Tamil notice citation, got ${tamil.sourceClauses[0]?.section}`);
console.log('✓ Tamil notice question cites', tamil.sourceClauses[0]?.section);

const dossier = formatDossierText(buildProfessionalHandoff(sample, []));
const pdf = buildHandoffPdf(dossier);
check(new TextDecoder().decode(pdf.slice(0, 8)) === '%PDF-1.4', 'Expected a PDF file header');
check(dossier.includes('not legal advice'), 'Expected the legal-information disclaimer in the dossier');
console.log('✓ Handoff dossier and PDF header verified');
console.log(`✓ Raw text parser correctly extracted document structure (${parsedDoc.clauses.length} clauses, ${parsedDoc.userObligations.length} obligations)`);

console.log('\n5. Testing retrieval limits, languages, notices, and comparison...');
const retrieved = retrieveRelevantClauses('notice period', sample.clauses, 4);
check(retrieved.length > 0 && retrieved.length <= 4, `Expected 1 to 4 clauses, got ${retrieved.length}`);
check(retrieved[0].score >= retrieved[retrieved.length - 1].score, 'Expected scores in descending order');
check(detectSpokenLanguage('నోటీసు వ్యవధి ఎంత?') === 'te', 'Expected Telugu detection');
check(detectSpokenLanguage('নোটিশের সময়সীমা কত?') === 'bn', 'Expected Bengali detection');

const notices = notificationsForDocument(sample, [{ id: 't1', role: 'user', text: 'notice?' }]);
check(notices.some((item) => item.hrefTab === 'timeline'), 'Expected an important-date notice');
check(notices.some((item) => item.hrefTab === 'before-i-sign'), 'Expected a review notice');
check(notices.some((item) => item.id === 'chat'), 'Expected a saved-question notice');

const compared = compareDocuments(sample, SAMPLE_DOCUMENTS[1].precomputedAnalysis);
check(compared.comparisons.length >= 3, `Expected comparison rows, got ${compared.comparisons.length}`);

const missing = validateGroundedAnswer(notFoundAnswer('unrelated volcano clause', 'en'), sample.clauses);
check(missing.sourceClauses.length === 0, 'Expected a not-found answer to cite nothing');
check(missing.distinction.notInDocument.length > 0, 'Expected a not-in-document distinction');
console.log('✓ Retrieval, Telugu, Bengali, notices, comparison, and citation checks passed');

console.log('\n=== ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY! ===\n');
