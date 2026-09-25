import { ConversationTurn, DocumentAnalysis, ProfessionalHandoff } from '@/types/document';

export function buildProfessionalHandoff(
  document: DocumentAnalysis,
  conversation: ConversationTurn[] = []
): ProfessionalHandoff {
  const userTurns = conversation.filter((t) => t.role === 'user');
  const assistantTurns = conversation.filter((t) => t.role === 'assistant');
  const discussedFromChat = userTurns.map((turn, index) => {
    const reply = assistantTurns[index];
    const section = reply?.section || turn.section;
    return section ? `${section} — ${turn.text}` : turn.text;
  });

  const discussedTopics = discussedFromChat.length
    ? discussedFromChat.slice(0, 12)
    : document.clauses
        .filter((c) => c.reviewReason)
        .slice(0, 6)
        .map((c) => `${c.section} — ${c.title} (flagged in automated review; no conversation yet)`);

  const needsProfessionalReview = document.potentialAmbiguities.slice(0, 8).map((a) => `${a.section}: ${a.issue}`);
  const reviewClauses = document.clauses.filter((c) => c.reviewReason).slice(0, 8);

  const relevantClauses = (reviewClauses.length ? reviewClauses : document.clauses.slice(0, 6)).map((c) => ({
    section: c.section,
    title: c.title,
    reason: c.reviewReason || c.plainLanguage.slice(0, 160),
  }));

  const userObjective = userTurns[0]?.text
    ? `User asked NyayaVoice to help understand: "${userTurns[0].text}". Later questions: ${userTurns.slice(1, 4).map((t) => t.text).join('; ') || 'none yet'}.`
    : 'No conversation yet. Dossier is based only on automated document analysis.';

  return {
    documentTitle: document.title,
    documentType: document.documentType,
    userRole: document.parties[1]?.role || document.parties[1]?.name || 'Document party (role not confirmed)',
    userObjective,
    discussedTopics: discussedTopics.length ? discussedTopics : ['No topics discussed yet.'],
    needsProfessionalReview: needsProfessionalReview.length
      ? needsProfessionalReview
      : ['No automated ambiguities were flagged. Counsel may still want a full read of the original.'],
    relevantClauses,
    questionsForLawyer: document.questionsForProfessional.map((q) => q.question),
    generatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  };
}

export function formatDossierText(handoff: ProfessionalHandoff): string {
  return `
NYAYAVOICE — PROFESSIONAL CONSULTATION HANDOFF DOSSIER
Generated: ${handoff.generatedAt}
Notice: Prepared by NyayaVoice for consultation preparation assistance (not legal advice).

DOCUMENT: ${handoff.documentTitle}
TYPE: ${handoff.documentType}
CLIENT ROLE: ${handoff.userRole}

CLIENT OBJECTIVE:
${handoff.userObjective}

TOPICS DISCUSSED & ANALYZED:
${handoff.discussedTopics.map((t) => `• ${t}`).join('\n')}

ITEMS IDENTIFIED REQUIRING PROFESSIONAL LEGAL REVIEW:
${handoff.needsProfessionalReview.map((r) => `• ${r}`).join('\n')}

KEY SUPPORTING CLAUSES:
${handoff.relevantClauses.map((c) => `• ${c.section} (${c.title}): ${c.reason}`).join('\n')}

RECOMMENDED QUESTIONS FOR COUNSEL:
${handoff.questionsForLawyer.map((q, idx) => `${idx + 1}. ${q}`).join('\n')}
`.trim();
}
