import { Clause, GroundedAnswer } from '@/types/document';
import { notFoundCopy } from '@/lib/i18n/languages';

function normalizeSection(section: string): string {
  return section.toLowerCase().replace(/\s+/g, ' ').trim();
}

function findMatchingClause(section: string, clauses: Clause[]): Clause | undefined {
  const target = normalizeSection(section);
  return clauses.find((c) => {
    const candidate = normalizeSection(c.section);
    return candidate === target
      || candidate.includes(target)
      || target.includes(candidate)
      || target.replace(/^section\s+/, '') === candidate.replace(/^section\s+/, '');
  });
}

function snippetExistsInClause(snippet: string, clause: Clause): boolean {
  if (!snippet || snippet.length < 12) return true;
  const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const hay = normalize(`${clause.sourceText} ${clause.plainLanguage}`);
  const needle = normalize(snippet).slice(0, 80);
  return hay.includes(needle) || needle.split(' ').slice(0, 8).every((w) => w.length < 3 || hay.includes(w));
}

/**
 * Drops invented citations and rewrites snippets from actual clause text.
 */
export function validateGroundedAnswer(answer: GroundedAnswer, clauses: Clause[]): GroundedAnswer {
  const validSources = (answer.sourceClauses || [])
    .map((source) => {
      const match = findMatchingClause(source.section, clauses);
      if (!match) return null;
      const snippet = snippetExistsInClause(source.snippet, match)
        ? source.snippet
        : match.sourceText.slice(0, 220);
      return {
        section: match.section,
        title: match.title,
        snippet,
        relevance: source.relevance || 'Retrieved from document',
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (validSources.length === 0 && answer.confidence !== 'low') {
    return {
      ...answer,
      sourceClauses: [],
      confidence: 'low',
      distinction: {
        ...answer.distinction,
        notInDocument: answer.distinction?.notInDocument
          || 'No verified clause citation could be attached to this answer.',
      },
    };
  }

  return {
    ...answer,
    sourceClauses: validSources,
  };
}

export function notFoundAnswer(question: string, language: GroundedAnswer['language']): GroundedAnswer {
  const copy = notFoundCopy(language, question);
  return {
    shortAnswer: copy.shortAnswer,
    explanation: copy.explanation,
    sourceClauses: [],
    thingsToVerify: ['Ask the counterparty or counsel whether this topic is covered in a separate policy or annexure.'],
    suggestedQuestions: ['Which clause, if any, should cover this topic?'],
    confidence: 'low',
    language,
    distinction: {
      explicitlyStated: 'Not stated in the uploaded document.',
      inference: 'No inference is made from silence.',
      notInDocument: 'The requested term or benefit is not found in the analyzed clauses.',
    },
  };
}
