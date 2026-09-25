import { Clause, ClauseComparison, ContractComparison, DocumentAnalysis } from '@/types/document';
import { extractNoticePeriodFromText } from '@/lib/retrieval/clause-retriever';

function findClause(doc: DocumentAnalysis, predicates: Array<(c: Clause) => boolean>): Clause | undefined {
  for (const predicate of predicates) {
    const found = doc.clauses.find(predicate);
    if (found) return found;
  }
  return undefined;
}

function summarize(text: string, fallback: string): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return fallback;
  return cleaned.length > 140 ? `${cleaned.slice(0, 140)}…` : cleaned;
}

function noticeSummary(clause?: Clause): string {
  if (!clause) return 'Not found in this version.';
  return extractNoticePeriodFromText(clause.sourceText) || summarize(clause.sourceText, clause.title);
}

function compareTopic(opts: {
  category: string;
  topic: string;
  clauseA?: Clause;
  clauseB?: Clause;
  summaryA: string;
  summaryB: string;
  change: string;
}): ClauseComparison | null {
  const { clauseA, clauseB } = opts;
  if (!clauseA && !clauseB) return null;
  const missing = !clauseA ? 'A' : !clauseB ? 'B' : null;
  let meaningfulChange = opts.change;
  if (missing === 'A') meaningfulChange = `Added in Version B (${clauseB?.section}). Not present in Version A.`;
  if (missing === 'B') meaningfulChange = `Present in Version A (${clauseA?.section}) and not found in Version B.`;
  if (clauseA && clauseB && clauseA.sourceText.trim() === clauseB.sourceText.trim()) {
    meaningfulChange = 'No material wording difference detected for this topic.';
  }

  return {
    category: opts.category,
    topic: opts.topic,
    versionA: {
      section: clauseA?.section || 'Not found',
      text: clauseA?.sourceText?.slice(0, 220) || 'This topic was not identified in Version A.',
      summary: opts.summaryA,
    },
    versionB: {
      section: clauseB?.section || 'Not found',
      text: clauseB?.sourceText?.slice(0, 220) || 'This topic was not identified in Version B.',
      summary: opts.summaryB,
    },
    meaningfulChange,
    impact: 'neutral',
    recommendation: 'Review the two excerpts side by side. NyayaVoice does not rank versions as better or worse.',
  };
}

export function compareDocuments(docA: DocumentAnalysis, docB: DocumentAnalysis): ContractComparison {
  const noticeA = findClause(docA, [
    (c) => /notice/i.test(`${c.title} ${c.category} ${c.sourceText}`),
    (c) => c.category.includes('Termination'),
  ]);
  const noticeB = findClause(docB, [
    (c) => /notice/i.test(`${c.title} ${c.category} ${c.sourceText}`),
    (c) => c.category.includes('Termination'),
  ]);

  const ipA = findClause(docA, [
    (c) => /intellectual|invention|work product/i.test(`${c.title} ${c.category} ${c.sourceText}`),
  ]);
  const ipB = findClause(docB, [
    (c) => /intellectual|invention|work product/i.test(`${c.title} ${c.category} ${c.sourceText}`),
  ]);

  const restrictA = findClause(docA, [
    (c) => /non-compete|solicit|restrictive/i.test(`${c.title} ${c.category} ${c.sourceText}`),
  ]);
  const restrictB = findClause(docB, [
    (c) => /non-compete|solicit|restrictive/i.test(`${c.title} ${c.category} ${c.sourceText}`),
  ]);

  const payClauseA = findClause(docA, [(c) => /compensation|salary|payment|fee/i.test(`${c.title} ${c.category} ${c.sourceText}`)]);
  const payClauseB = findClause(docB, [(c) => /compensation|salary|payment|fee/i.test(`${c.title} ${c.category} ${c.sourceText}`)]);

  const noticeDaysA = noticeA ? extractNoticePeriodFromText(noticeA.sourceText) : null;
  const noticeDaysB = noticeB ? extractNoticePeriodFromText(noticeB.sourceText) : null;
  let noticeChange = 'Notice language differs between the two versions.';
  if (noticeDaysA && noticeDaysB && noticeDaysA !== noticeDaysB) {
    noticeChange = `Notice requirement changed from ${noticeDaysA} (Version A) to ${noticeDaysB} (Version B).`;
  }

  const ipChange = (() => {
    const a = ipA?.sourceText.toLowerCase() || '';
    const b = ipB?.sourceText.toLowerCase() || '';
    if (!a || !b) return 'Intellectual property coverage differs or is missing in one version.';
    const aBroad = /all intellectual property|relating directly or indirectly/.test(a);
    const bBroad = /all intellectual property|relating directly or indirectly/.test(b);
    if (aBroad !== bBroad) {
      return bBroad
        ? 'Version B contains broader assignment wording than Version A.'
        : 'Version A contains broader assignment wording than Version B.';
    }
    return 'Compare the assignment scope, carve-outs, and prior-invention exhibits.';
  })();

  const comparisons = [
    compareTopic({
      category: 'Termination & Notice',
      topic: 'Notice Period Requirement',
      clauseA: noticeA,
      clauseB: noticeB,
      summaryA: noticeSummary(noticeA),
      summaryB: noticeSummary(noticeB),
      change: noticeChange,
    }),
    compareTopic({
      category: 'Intellectual Property',
      topic: 'IP ownership / assignment scope',
      clauseA: ipA,
      clauseB: ipB,
      summaryA: ipA ? summarize(ipA.plainLanguage || ipA.sourceText, ipA.title) : 'Not found in Version A.',
      summaryB: ipB ? summarize(ipB.plainLanguage || ipB.sourceText, ipB.title) : 'Not found in Version B.',
      change: ipChange,
    }),
    compareTopic({
      category: 'Restrictive Covenants',
      topic: 'Non-compete / non-solicit',
      clauseA: restrictA,
      clauseB: restrictB,
      summaryA: restrictA ? summarize(restrictA.sourceText, restrictA.title) : 'Not found in Version A.',
      summaryB: restrictB ? summarize(restrictB.sourceText, restrictB.title) : 'Not found in Version B.',
      change: 'Post-engagement restrictions differ or appear in only one version.',
    }),
    compareTopic({
      category: 'Compensation',
      topic: 'Payment / compensation terms',
      clauseA: payClauseA,
      clauseB: payClauseB,
      summaryA: docA.financialTerms[0]?.terms || (payClauseA ? summarize(payClauseA.sourceText, 'Compensation') : 'Not found in Version A.'),
      summaryB: docB.financialTerms[0]?.terms || (payClauseB ? summarize(payClauseB.sourceText, 'Compensation') : 'Not found in Version B.'),
      change: 'Compensation figures or payment timing differ between versions, or appear in only one document.',
    }),
  ].filter((item): item is ClauseComparison => Boolean(item));

  const changed = comparisons.filter((c) => !c.meaningfulChange.startsWith('No material')).length;

  return {
    titleA: docA.title || 'Version A',
    titleB: docB.title || 'Version B',
    summary: `Compared ${comparisons.length} topic groups. ${changed} show a wording or coverage difference. This is a factual clause diff, not a recommendation of which version to sign.`,
    comparisons,
  };
}
