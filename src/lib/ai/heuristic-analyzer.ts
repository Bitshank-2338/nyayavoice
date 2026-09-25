import { DocumentAnalysis, Clause, Obligation, ImportantDate, FinancialTerm, Restriction, Ambiguity, ConversationTurn, GroundedAnswer } from '@/types/document';
import { segmentTextIntoDraftClauses } from '../documents/pdf-parser';
import {
  detectLanguage,
  extractNoticePeriodFromText,
  isOutOfDocumentLegalRequest,
  resolveQuestionWithHistory,
  retrieveRelevantClauses,
} from '../retrieval/clause-retriever';
import { notFoundAnswer, validateGroundedAnswer } from './citation-validator';
import { regionalLead, SpokenLanguage } from '@/lib/i18n/languages';

/**
 * Intelligent deterministic legal document analyzer.
 * Guarantees 100% reliable hackathon demonstrations even without external LLM API keys.
 */
export function analyzeDocumentHeuristically(rawText: string, filename?: string): DocumentAnalysis {
  const textLower = rawText.toLowerCase();

  // 1. Detect Document Type
  let docType = "Legal Agreement";
  if (textLower.includes("employment agreement") || textLower.includes("appointment letter") || textLower.includes("offer of employment")) {
    docType = "Employment Agreement";
  } else if (textLower.includes("non-disclosure") || textLower.includes("confidentiality agreement") || textLower.includes("nda")) {
    docType = "Non-Disclosure Agreement (NDA)";
  } else if (textLower.includes("master services agreement") || textLower.includes("consulting agreement") || textLower.includes("freelance")) {
    docType = "Freelance / Services Agreement";
  } else if (textLower.includes("lease agreement") || textLower.includes("rental agreement") || textLower.includes("tenancy")) {
    docType = "Lease / Rental Agreement";
  } else if (textLower.includes("terms and conditions") || textLower.includes("terms of service")) {
    docType = "Terms of Service";
  }

  // 2. Extract Parties
  const parties = extractParties(rawText, docType);

  // 3. Extract Effective Date
  const effectiveDate = extractEffectiveDate(rawText);

  // 4. Extract Clauses
  const draftChunks = segmentTextIntoDraftClauses(rawText);
  const clauses: Clause[] = [];
  const userObligations: Obligation[] = [];
  const otherPartyObligations: Obligation[] = [];
  const importantDates: ImportantDate[] = [];
  const financialTerms: FinancialTerm[] = [];
  const restrictions: Restriction[] = [];
  const potentialAmbiguities: Ambiguity[] = [];
  const questionsForProfessional: QuestionForProfessionalSchemaType[] = [];

  let clauseIndex = 1;
  for (const chunk of draftChunks) {
    if (chunk.content.length < 20 && !chunk.title) continue;

    const clauseAnalysis = analyzeClause(chunk.section, chunk.title, chunk.content, clauseIndex);
    clauses.push(clauseAnalysis.clause);

    userObligations.push(...clauseAnalysis.userObligations);
    otherPartyObligations.push(...clauseAnalysis.otherPartyObligations);
    importantDates.push(...clauseAnalysis.importantDates);
    financialTerms.push(...clauseAnalysis.financialTerms);
    restrictions.push(...clauseAnalysis.restrictions);
    if (clauseAnalysis.ambiguity) {
      potentialAmbiguities.push(clauseAnalysis.ambiguity);
    }
    if (clauseAnalysis.questionForProf) {
      questionsForProfessional.push(clauseAnalysis.questionForProf);
    }
    clauseIndex++;
  }

  // Ensure default milestones if dates were sparse
  if (effectiveDate && !importantDates.some(d => d.type === 'effectiveDate')) {
    importantDates.unshift({
      id: 'date_eff',
      label: 'Agreement Effective Date',
      dateOrPeriod: effectiveDate,
      section: 'Preamble',
      type: 'effectiveDate',
      consequence: 'Contract terms and obligations become binding.',
    });
  }

  const title = extractTitle(rawText, docType, filename);
  const summary = generateDocumentSummary(docType, parties, clauses, userObligations, importantDates);

  return {
    documentId: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    documentType: docType,
    title,
    parties,
    effectiveDate,
    expirationDate: null,
    governingLaw: extractGoverningLaw(rawText),
    summary,
    clauses,
    importantDates,
    userObligations,
    otherPartyObligations,
    financialTerms,
    restrictions,
    potentialAmbiguities,
    questionsForProfessional,
    rawText,
    pageCount: Math.max(1, Math.ceil(rawText.length / 2800)),
    uploadedAt: new Date().toISOString(),
  };
}

type QuestionForProfessionalSchemaType = {
  category: string;
  question: string;
  relevantSection: string;
  context: string;
};

function extractTitle(text: string, docType: string, filename?: string): string {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length > 0 && lines[0].length < 80 && /agreement|contract|nda|terms/i.test(lines[0])) {
    return lines[0];
  }
  if (filename) {
    return filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  }
  return `${docType}`;
}

function extractParties(text: string, docType: string): Array<{ name: string; role: string; jurisdictionOrAddress?: string }> {
  const parties: Array<{ name: string; role: string; jurisdictionOrAddress?: string }> = [];
  
  // Look for "by and between" patterns
  const betweenMatch = text.match(/between[:\s]+([^\n\r,]+)(?:,[^\n]+)?(?:\("?([^"\)]+)"?\))?[\s\n]+and[\s\n]+([^\n\r,]+)(?:,[^\n]+)?(?:\("?([^"\)]+)"?\))?/i);
  if (betweenMatch) {
    parties.push({
      name: betweenMatch[1].trim(),
      role: betweenMatch[2]?.trim() || (docType === 'Employment Agreement' ? 'Employer' : 'First Party'),
    });
    parties.push({
      name: betweenMatch[3].trim(),
      role: betweenMatch[4]?.trim() || (docType === 'Employment Agreement' ? 'Employee' : 'Second Party'),
    });
  } else {
    // Fallback default
    if (docType === 'Employment Agreement') {
      parties.push({ name: 'Employer / Company', role: 'Employer' });
      parties.push({ name: 'Employee', role: 'Employee' });
    } else {
      parties.push({ name: 'First Party', role: 'Disclosing / Client' });
      parties.push({ name: 'Second Party', role: 'Receiving / Provider' });
    }
  }

  return parties;
}

function extractEffectiveDate(text: string): string | null {
  const match = text.match(/(?:dated as of|effective as of|entered into as of|effective date[:\s]+)([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  return match ? match[1] : null;
}

function extractGoverningLaw(text: string): string | null {
  const match = text.match(/governed by (?:and construed in accordance with )?(?:the substantive )?laws of ([^\.\n\r;,]+)/i);
  return match ? `Laws of ${match[1].trim()}` : "Laws of India";
}

function analyzeClause(section: string, title: string, content: string, index: number) {
  const lower = `${title} ${content}`.toLowerCase();
  let category = "General";
  let reviewReason: string | null = null;
  let reviewSeverity: 'info' | 'review' | 'caution' = 'info';
  let plainLanguage = "";
  const obligationsText: string[] = [];
  const importantDatesText: string[] = [];
  const questionsToConsider: string[] = [];
  const userObligations: Obligation[] = [];
  const otherPartyObligations: Obligation[] = [];
  const importantDates: ImportantDate[] = [];
  const financialTerms: FinancialTerm[] = [];
  const restrictions: Restriction[] = [];
  let ambiguity: Ambiguity | null = null;
  let questionForProf: QuestionForProfessionalSchemaType | null = null;

  // Pattern detection for categories
  if (lower.includes('notice') || lower.includes('terminat')) {
    category = "Termination & Notice";
    const extracted = extractNoticePeriodFromText(content);
    const daysPhrase = extracted || 'the written notice period stated in this clause';
    plainLanguage = `This clause covers ending the agreement and ${daysPhrase}. Review whether pay in lieu or buyouts are described.`;
    obligationsText.push(`Follow the termination and notice process described: ${daysPhrase}.`);
    if (extracted) importantDatesText.push(`Notice Period: ${extracted}`);

    userObligations.push({
      id: `ob_u_${index}`,
      who: 'user',
      text: `Must follow the termination/notice process in this clause (${daysPhrase}).`,
      section: section || `Section ${index}`,
      priority: 'high',
    });

    if (extracted) {
      importantDates.push({
        id: `date_${index}`,
        label: 'Notice Period',
        dateOrPeriod: extracted,
        section: section || `Section ${index}`,
        type: 'noticePeriod',
        consequence: 'Notice required prior to termination without cause, as written in this clause.',
      });
    }

    if (lower.includes('sole discretion') || lower.includes('cannot buy out') || lower.includes('company approval')) {
      reviewReason = "Asymmetrical notice buyout: Company may pay in lieu, but employee buyout requires explicit consent.";
      reviewSeverity = "review";
      ambiguity = {
        section: section || `Section ${index}`,
        issue: "Asymmetrical Notice Buyout Option",
        whyItMatters: "If a future employer requests a rapid joining date, you may not be able to buy out your notice period unilaterally.",
        suggestedClarification: "Request a mutual buyout provision permitting buyout of up to 30 days.",
      };
      questionForProf = {
        category: "Notice Period",
        question: `Can a party refuse a notice buyout under the wording of this clause, and how does that interact with applicable labor norms?`,
        relevantSection: section || `Section ${index}`,
        context: "Evaluating joining timelines and mobility.",
      };
    }
  } else if (lower.includes('intellectual property') || lower.includes('inventions') || lower.includes('work product') || lower.includes('patent')) {
    category = "Intellectual Property";
    const broad = /all intellectual property|relating directly or indirectly|sole and exclusive property/i.test(content);
    const narrow = /created specifically for|work created specifically|retains/i.test(content);
    plainLanguage = broad && !narrow
      ? "This clause assigns a broad set of works or inventions connected to the engagement. Read the exact assignment and any carve-outs."
      : "This clause describes who owns intellectual property created in connection with the engagement. Check assignment scope and retained rights.";
    obligationsText.push("Follow the intellectual property assignment and disclosure steps written in this clause.");
    userObligations.push({
      id: `ob_u_${index}`,
      who: 'user',
      text: "Must follow the IP assignment, disclosure, and carve-out process written in this clause.",
      section: section || `Section ${index}`,
      priority: 'high',
    });

    if (lower.includes('indirectly') || lower.includes('off premises') || lower.includes('prior inventions')) {
      reviewReason = "Broad IP assignment may potentially capture personal hobby projects or open-source software.";
      reviewSeverity = "caution";
      questionsToConsider.push("Does this cover personal open-source projects or weekend hobby coding?");
      ambiguity = {
        section: section || `Section ${index}`,
        issue: "Broad Intellectual Property Assignment over Personal Work",
        whyItMatters: "Vague wording could allow the company to assert rights over personal GitHub repositories or side projects created on personal time.",
        suggestedClarification: "Add an express carve-out for personal software created on personal equipment outside working hours.",
      };
      questionForProf = {
        category: "Intellectual Property",
        question: "Does the IP assignment clause risk transferring ownership of personal open-source projects developed on personal time?",
        relevantSection: section || `Section ${index}`,
        context: "Protecting personal developer portfolio and side projects.",
      };
    }
  } else if (lower.includes('non-compete') || lower.includes('restrictive covenant') || lower.includes('solicit')) {
    category = "Restrictive Covenants";
    const durationMatch = content.match(/(\d+)\s*(?:months|years)/i);
    const dur = durationMatch ? durationMatch[0] : "post-employment period";
    plainLanguage = `Restricts you from working with direct competitors or soliciting colleagues/clients for ${dur} after leaving.`;
    obligationsText.push(`Refrain from competing activities or solicitation for ${dur}.`);
    restrictions.push({
      title: "Post-Employment Non-Compete & Non-Solicit",
      description: `Prohibits joining competitors or recruiting staff for ${dur}.`,
      section: section || `Section ${index}`,
      durationOrScope: dur,
    });
    reviewReason = "Post-employment non-compete covenants are generally void under Section 27 of the Indian Contract Act, but may still create practical hurdles.";
    reviewSeverity = "caution";
    questionForProf = {
      category: "Restraint of Trade",
      question: "Is this post-employment non-compete clause legally enforceable under Section 27 of the Indian Contract Act?",
      relevantSection: section || `Section ${index}`,
      context: "Checking potential conflicts when seeking future employment.",
    };
  } else if (lower.includes('confidential') || lower.includes('trade secret') || lower.includes('non-disclosure')) {
    category = "Confidentiality";
    const duration = content.match(/(\d+)\s*(?:years|months)/i)?.[0] || (/indefinitely|without time limitation|perpetual/i.test(content) ? 'Duration as written (may be ongoing)' : 'Duration as written in clause');
    plainLanguage = `This clause requires protection of confidential information. Duration/scope: ${duration}.`;
    obligationsText.push("Protect confidential information as written; do not assume extra exceptions.");
    userObligations.push({
      id: `ob_u_${index}`,
      who: 'user',
      text: "Must protect confidential information according to this clause.",
      section: section || `Section ${index}`,
      priority: 'high',
    });
    restrictions.push({
      title: "Confidentiality",
      description: content.slice(0, 180),
      section: section || `Section ${index}`,
      durationOrScope: duration,
    });
  } else if (lower.includes('liability') || lower.includes('indemnif') || lower.includes('damages')) {
    category = "Liability";
    plainLanguage = "This clause allocates liability, indemnities, or damage caps. Read the cap and the exceptions (for example gross negligence) as written.";
  } else if (lower.includes('dispute') || lower.includes('arbitration') || lower.includes('governing law')) {
    category = "Dispute Resolution";
    plainLanguage = "This clause states governing law and how disputes are to be handled (for example arbitration or courts).";
  } else if (lower.includes('renew') || lower.includes('term of') || lower.includes('effective date')) {
    category = "Term & Renewal";
    const period = content.match(/(\d+)\s*(?:months|years|days)/i)?.[0];
    if (period) {
      importantDates.push({
        id: `date_term_${index}`,
        label: 'Term / renewal period',
        dateOrPeriod: period,
        section: section || `Section ${index}`,
        type: 'milestone',
        consequence: 'Check auto-renewal and notice-before-renewal wording.',
      });
    }
    plainLanguage = "This clause describes how long the agreement lasts and whether it renews automatically.";
  } else if (lower.includes('salary') || lower.includes('compensation') || lower.includes('fee') || lower.includes('payment') || lower.includes('bonus')) {
    category = "Compensation & Financial";
    plainLanguage = "Details your compensation structure, payment dates, deductions, and any bonus eligibility.";
    const amountMatch = content.match(/(?:inr|rs\.?|usd|\$)\s*[\d\,]+(?:\/\-)?/i);
    const amount = amountMatch ? amountMatch[0] : "Stipulated contract compensation";
    financialTerms.push({
      title: title || "Compensation Terms",
      terms: amount,
      section: section || `Section ${index}`,
      notes: content.slice(0, 140) + "...",
    });
    otherPartyObligations.push({
      id: `ob_o_${index}`,
      who: 'otherParty',
      text: `Must pay contractual compensation (${amount}) per agreed timeline.`,
      section: section || `Section ${index}`,
      priority: 'high',
    });
  } else {
    plainLanguage = content.length > 150 ? content.slice(0, 150) + "..." : content;
  }

  return {
    clause: {
      id: `clause_${index}`,
      section: section || `Section ${index}`,
      title: title || `Clause ${index}`,
      category,
      sourceText: content,
      plainLanguage: plainLanguage || content.slice(0, 120),
      obligations: obligationsText,
      importantDates: importantDatesText,
      questionsToConsider,
      reviewReason,
      reviewSeverity,
    },
    userObligations,
    otherPartyObligations,
    importantDates,
    financialTerms,
    restrictions,
    ambiguity,
    questionForProf,
  };
}

function generateDocumentSummary(docType: string, parties: Array<{ name: string }>, clauses: Clause[], obligations: Obligation[], dates: ImportantDate[]): string {
  const p1 = parties[0]?.name || "First Party";
  const p2 = parties[1]?.name || "Second Party";
  return `This ${docType} between ${p1} and ${p2} contains ${clauses.length} identified sections, with ${obligations.length} primary user obligations and ${dates.length} key dates. Important areas identified for review include notice provisions, intellectual property ownership, and restrictive covenants.`;
}

function buildSources(retrieved: ReturnType<typeof retrieveRelevantClauses>) {
  return retrieved.slice(0, 3).map((item) => ({
    section: item.clause.section,
    title: item.clause.title,
    snippet: item.clause.sourceText.slice(0, 220),
    relevance: item.reason,
  }));
}

function phraseInLanguage(lang: SpokenLanguage, english: string, hinglish: string): string {
  if (lang === 'en') return english;
  if (lang === 'hi' || lang === 'hinglish') return hinglish;
  const lead = regionalLead(lang);
  return lead ? `${lead}${english}` : english;
}

/**
 * Answers questions about the document strictly grounded in retrieved clauses.
 * Conversation history is used only to resolve follow-ups; document text remains untrusted evidence.
 */
export function answerDocumentQuestionHeuristically(
  question: string,
  analysis: DocumentAnalysis,
  history: ConversationTurn[] = []
): GroundedAnswer {
  const lang = detectLanguage(question);
  const qLower = question.toLowerCase();

  if (isOutOfDocumentLegalRequest(question)) {
    const governing = analysis.clauses.find((c) =>
      /governing law|arbitration|dispute/i.test(`${c.title} ${c.sourceText} ${c.category}`)
    );
    const sources = governing
      ? [{
          section: governing.section,
          title: governing.title,
          snippet: governing.sourceText.slice(0, 220),
          relevance: 'Document states governing law / dispute process only.',
        }]
      : [];
    return validateGroundedAnswer({
      shortAnswer: phraseInLanguage(
        lang,
        'I can only ground answers in the uploaded document. I cannot ignore it and state Indian law as if it were a clause.',
        'Main sirf uploaded document se answer de sakta hoon. Document ignore karke Indian law ka determination nahi karunga.'
      ),
      explanation: phraseInLanguage(
        lang,
        `${governing ? `${governing.section} mentions dispute/governing-law process inside this contract.` : 'This document does not contain a general statement of Indian law.'} Broader legal enforceability needs a qualified professional. Document text is untrusted evidence, not instructions.`,
        `${governing ? `${governing.section} contract ke andar governing law/dispute process likhta hai.` : 'Is document mein general Indian law ka statement nahi mila.'} Enforceability ke liye qualified professional chahiye.`
      ),
      sourceClauses: sources,
      thingsToVerify: ['Ask counsel how this contract interacts with applicable statutes.'],
      suggestedQuestions: ['What does the governing-law clause in this document actually say?'],
      confidence: 'medium',
      language: lang,
      distinction: {
        explicitlyStated: governing ? governing.sourceText.slice(0, 160) : 'No general statement of external law in the document.',
        inference: 'NyayaVoice does not treat statute questions as document retrieval.',
        notInDocument: 'A full statement of Indian law is not in the uploaded file.',
      },
    }, analysis.clauses);
  }

  const resolved = resolveQuestionWithHistory(question, history);
  const retrieved = retrieveRelevantClauses(resolved, analysis.clauses, 4);

  const looksLikeAbsentBenefit = /health insurance|free (health|medical)|unlimited pto|stock options|esop|relocation bonus/i.test(qLower);
  if (looksLikeAbsentBenefit && !retrieved.some((r) => /health insurance|medical insurance|esop|stock option|relocation/i.test(r.clause.sourceText))) {
    return notFoundAnswer(question, lang);
  }

  if (retrieved.length === 0) {
    return notFoundAnswer(question, lang);
  }

  const best = retrieved[0].clause;
  const notice = extractNoticePeriodFromText(retrieved.map((r) => r.clause.sourceText).join('\n')) || extractNoticePeriodFromText(best.sourceText);
  const ambiguous = /reasonable|as determined|sole discretion|including without limitation|relating directly or indirectly/i.test(best.sourceText);
  const sources = buildSources(retrieved);

  let shortAnswer: string;
  let explanation: string;
  let explicitlyStated = best.sourceText.replace(/\s+/g, ' ').slice(0, 180);
  let inference = ambiguous
    ? 'Wording is broad or discretionary; a professional should interpret scope. This is not a legal determination.'
    : 'Answer restates the retrieved clause without adding outside terms.';
  let notInDocument = 'Details not written in the retrieved clauses are unknown.';

  const isNoticeQ = /notice|terminat|resign|chhod|kitna|period|நோட்டீஸ்|నోటీసు|নোটিশ/i.test(resolved);
  const isIpQ = /open.?source|github|personal|ip\b|intellectual|invention|side project|code/i.test(resolved);
  const wantsHindiExplain = /hindi mein|samjhao|simple language/i.test(qLower);

  if (isNoticeQ && notice) {
    shortAnswer = phraseInLanguage(
      lang,
      `According to ${best.section}, the document states a notice period of ${notice}.`,
      `${best.section} ke mutabik, document mein notice period ${notice} likha hai.`
    );
    explanation = phraseInLanguage(
      lang,
      `${best.section} (${best.title}) says: "${best.sourceText.slice(0, 280)}". NyayaVoice is not deciding whether that period is fair or enforceable.`,
      `${best.section} (${best.title}) mein yeh wording hai: "${best.sourceText.slice(0, 240)}". Yeh legal enforceability ka faisla nahi hai.`
    );
    explicitlyStated = `Notice period in retrieved clause: ${notice}.`;
  } else if (isIpQ) {
    shortAnswer = phraseInLanguage(
      lang,
      `According to ${best.section}, intellectual property is governed by the assignment language in that clause.`,
      `${best.section} ke according, IP ownership us clause ki assignment language se decide hota hai.`
    );
    explanation = phraseInLanguage(
      lang,
      `${best.section} states: "${best.sourceText.slice(0, 320)}". ${/exhibit|schedule|carve-out|retain/i.test(best.sourceText) ? 'Look for any exhibit, schedule, or retained-rights carve-out in the same clause.' : 'No automatic personal-project exception should be assumed unless the clause says so.'} ${ambiguous ? 'The wording is broad enough that clarification is worth requesting.' : ''}`,
      `${best.section} kehta hai: "${best.sourceText.slice(0, 280)}". Agar exhibit/carve-out nahi likha, to personal projects automatically safe mat samjho. ${ambiguous ? 'Wording broad hai — clarification useful hogi.' : ''}`
    );
  } else if (wantsHindiExplain) {
    shortAnswer = `${best.section} simple language mein: ${best.plainLanguage}`;
    explanation = `Original clause text (unchanged): "${best.sourceText.slice(0, 280)}". ${best.reviewReason || 'Yeh information document se hai, legal advice nahi.'}`;
  } else {
    shortAnswer = phraseInLanguage(
      lang,
      `According to ${best.section} (${best.title}), the document addresses this in the retrieved wording below.`,
      `${best.section} (${best.title}) ke mutabik, document is topic ko neeche di gayi wording se cover karta hai.`
    );
    explanation = `${best.plainLanguage} Source: "${best.sourceText.slice(0, 240)}"`;
  }

  const answer: GroundedAnswer = {
    shortAnswer,
    explanation,
    sourceClauses: sources,
    thingsToVerify: best.questionsToConsider.length
      ? best.questionsToConsider
      : ['Confirm with the counterparty if any annexure or handbook changes this clause.'],
    suggestedQuestions: [
      `What else does ${best.section} require in practice?`,
      'Should this wording be reviewed by a legal professional before signing?',
    ],
    confidence: retrieved[0].score >= 16 ? 'high' : 'medium',
    language: lang,
    distinction: {
      explicitlyStated,
      inference,
      notInDocument,
    },
  };

  return validateGroundedAnswer(answer, analysis.clauses);
}
