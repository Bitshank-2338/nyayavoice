import { Clause } from '@/types/document';
import { detectSpokenLanguage, SpokenLanguage } from '@/lib/i18n/languages';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'to', 'of', 'in', 'on', 'for',
  'and', 'or', 'my', 'me', 'i', 'we', 'you', 'your', 'this', 'that', 'it', 'what', 'which',
  'does', 'do', 'can', 'could', 'would', 'should', 'will', 'about', 'with', 'from', 'into',
  'contract', 'agreement', 'document', 'please', 'tell', 'explain', 'kya', 'hai', 'ka',
  'ke', 'ki', 'mein', 'isme', 'kitna', 'batao', 'samjhao', 'simple', 'language', 'hindi',
]);

export interface RetrievedClause {
  clause: Clause;
  score: number;
  reason: string;
}

export function detectLanguage(question: string): SpokenLanguage {
  return detectSpokenLanguage(question);
}

export function tokenizeQuestion(question: string): string[] {
  return question
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function isFollowUpQuestion(question: string): boolean {
  const q = question.toLowerCase().trim();
  if (q.length < 80 && /\b(it|that|this|those|uska|uski|yeh|woh|wahan|there|why|kaise|kyun)\b/i.test(q)) {
    return true;
  }
  if (/what section|which section|koun sa section|kahan likha|samjhao|in simple|hindi mein/i.test(q)) {
    return true;
  }
  return false;
}

export function isOutOfDocumentLegalRequest(question: string): boolean {
  return /ignore (the )?(contract|document|agreement)|tell me what (indian )?law says|what does (the )?law (say|require)|regardless of (the )?(contract|document)/i.test(question);
}

export function resolveQuestionWithHistory(
  question: string,
  history?: Array<{ role: string; text: string; section?: string }>
): string {
  if (!history?.length || !isFollowUpQuestion(question)) return question;
  const lastUser = [...history].reverse().find((t) => t.role === 'user');
  const lastAssistant = [...history].reverse().find((t) => t.role === 'assistant');
  const lastSection = [...history].reverse().find((t) => t.section)?.section;
  const prior = [lastUser?.text, lastAssistant?.text, lastSection].filter(Boolean).join(' ');
  return `${prior} ${question}`.trim();
}

function topicBoosts(question: string, hay: string): { extra: number; reason?: string } {
  const q = question.toLowerCase();
  const checks: Array<{ intent: RegExp; clause: RegExp; extra: number; reason: string }> = [
    { intent: /notice|resign|terminat|chhod|quit|leave (the )?(job|company)|நோட்டீஸ்|నోటీసు|নোটিশ/i, clause: /notice|terminat|resign|garden leave/i, extra: 14, reason: 'Notice / termination language' },
    { intent: /open.?source|side project|github|personal (project|work|code)|intellectual|invention|ip\b|patent|work product/i, clause: /intellectual|invention|work product|patent|assignment|open.?source|github|exhibit/i, extra: 40, reason: 'Intellectual property language' },
    { intent: /non-?compete|competitor|solicit|restrict|dusri company/i, clause: /non-?compete|competitor|solicit|restrictive covenant/i, extra: 12, reason: 'Restrictive covenant language' },
    { intent: /salary|compensation|pay|bonus|fee|paisa|payment|invoice/i, clause: /salary|compensation|bonus|fee|payment|invoice|inr|rs\.?/i, extra: 12, reason: 'Compensation language' },
    { intent: /confidential|nda|secret|disclose/i, clause: /confidential|trade secret|non-disclosure|proprietary/i, extra: 12, reason: 'Confidentiality language' },
    { intent: /liability|indemnif|damages|cap/i, clause: /liability|indemnif|damages|gross negligence/i, extra: 10, reason: 'Liability language' },
    { intent: /dispute|arbitration|governing law|court/i, clause: /dispute|arbitration|governing law|jurisdiction/i, extra: 10, reason: 'Dispute resolution language' },
    { intent: /renew|term of|effective date|duration/i, clause: /renew|term |effective|expir/i, extra: 10, reason: 'Term / renewal language' },
    { intent: /health insurance|medical|pf\b|provident|leave|holiday/i, clause: /health insurance|medical|provident|leave entitlement|holiday/i, extra: 10, reason: 'Benefits language' },
  ];

  for (const check of checks) {
    if (check.intent.test(q) && check.clause.test(hay)) {
      return { extra: check.extra, reason: check.reason };
    }
  }
  return { extra: 0 };
}

export function retrieveRelevantClauses(
  question: string,
  clauses: Clause[],
  limit = 4
): RetrievedClause[] {
  const tokens = tokenizeQuestion(question).slice(0, 24);
  const scored: RetrievedClause[] = clauses.map((clause) => {
    const hay = `${clause.section} ${clause.title} ${clause.category} ${clause.sourceText} ${clause.plainLanguage}`.toLowerCase();
    let score = 0;
    const matched: string[] = [];
    for (const token of tokens) {
      if (hay.includes(token)) {
        score += token.length > 5 ? 3 : 2;
        matched.push(token);
      }
    }
    const boost = topicBoosts(question, hay);
    score += boost.extra;
    const reason = boost.reason || (matched.length ? `Matched: ${matched.slice(0, 6).join(', ')}` : 'Low lexical overlap');
    return { clause, score, reason };
  });

  return scored
    .filter((item) => item.score >= 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function extractNoticePeriodFromText(text: string): string | null {
  const nearNotice = text.match(/(\d+)\s*(?:calendar\s*)?days['’]?\s*(?:prior\s*)?(?:written\s*)?notice/i)
    || text.match(/notice[^\n.]{0,80}?(\d+)\s*(?:calendar\s*)?days/i)
    || text.match(/(\d+)\s*(?:calendar\s*)?days['’]?\s*prior written notice/i);
  if (nearNotice) {
    const days = nearNotice[1];
    return `${days} days`;
  }
  const months = text.match(/(\d+)\s*months['’]?\s*(?:prior\s*)?(?:written\s*)?notice/i);
  if (months) return `${months[1]} months`;
  return null;
}

export function clauseMentions(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some((term) => lower.includes(term.toLowerCase()));
}
