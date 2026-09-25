import { z } from 'zod';

export const ObligationSchema = z.object({
  id: z.string(),
  who: z.enum(['user', 'otherParty', 'mutual']),
  text: z.string(),
  section: z.string().optional(),
  clauseId: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
});

export const ImportantDateSchema = z.object({
  id: z.string().optional(),
  label: z.string(),
  dateOrPeriod: z.string(),
  section: z.string().optional(),
  consequence: z.string().optional(),
  type: z.enum(['deadline', 'effectiveDate', 'noticePeriod', 'expiration', 'milestone', 'other']).default('other'),
});

export const ClauseSchema = z.object({
  id: z.string(),
  section: z.string(),
  title: z.string(),
  category: z.string(),
  sourceText: z.string(),
  plainLanguage: z.string(),
  obligations: z.array(z.string()).default([]),
  importantDates: z.array(z.string()).default([]),
  questionsToConsider: z.array(z.string()).default([]),
  reviewReason: z.string().nullable().default(null),
  reviewSeverity: z.enum(['info', 'review', 'caution']).default('info'),
});

export const FinancialTermSchema = z.object({
  title: z.string(),
  terms: z.string(),
  section: z.string().optional(),
  notes: z.string().optional(),
});

export const RestrictionSchema = z.object({
  title: z.string(),
  description: z.string(),
  section: z.string().optional(),
  durationOrScope: z.string().optional(),
});

export const AmbiguitySchema = z.object({
  section: z.string(),
  issue: z.string(),
  whyItMatters: z.string(),
  suggestedClarification: z.string(),
});

export const QuestionForProfessionalSchema = z.object({
  category: z.string(),
  question: z.string(),
  relevantSection: z.string(),
  context: z.string(),
});

export const PartySchema = z.object({
  name: z.string(),
  role: z.string(),
  jurisdictionOrAddress: z.string().optional(),
});

export const DocumentAnalysisSchema = z.object({
  documentId: z.string(),
  documentType: z.string(),
  title: z.string(),
  parties: z.array(PartySchema).default([]),
  effectiveDate: z.string().nullable().default(null),
  expirationDate: z.string().nullable().default(null),
  governingLaw: z.string().nullable().default(null),
  summary: z.string(),
  clauses: z.array(ClauseSchema).default([]),
  importantDates: z.array(ImportantDateSchema).default([]),
  userObligations: z.array(ObligationSchema).default([]),
  otherPartyObligations: z.array(ObligationSchema).default([]),
  financialTerms: z.array(FinancialTermSchema).default([]),
  restrictions: z.array(RestrictionSchema).default([]),
  potentialAmbiguities: z.array(AmbiguitySchema).default([]),
  questionsForProfessional: z.array(QuestionForProfessionalSchema).default([]),
  rawText: z.string().optional(),
  uploadedAt: z.string().optional(),
  pageCount: z.number().default(1),
});

export type Obligation = z.infer<typeof ObligationSchema>;
export type ImportantDate = z.infer<typeof ImportantDateSchema>;
export type Clause = z.infer<typeof ClauseSchema>;
export type FinancialTerm = z.infer<typeof FinancialTermSchema>;
export type Restriction = z.infer<typeof RestrictionSchema>;
export type Ambiguity = z.infer<typeof AmbiguitySchema>;
export type QuestionForProfessional = z.infer<typeof QuestionForProfessionalSchema>;
export type Party = z.infer<typeof PartySchema>;
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

// Grounded Q&A Answer Schema
export const GroundedAnswerSchema = z.object({
  shortAnswer: z.string(),
  explanation: z.string(),
  sourceClauses: z.array(
    z.object({
      section: z.string(),
      title: z.string(),
      snippet: z.string(),
      relevance: z.string(),
    })
  ).default([]),
  thingsToVerify: z.array(z.string()).default([]),
  suggestedQuestions: z.array(z.string()).default([]),
  confidence: z.enum(['high', 'medium', 'low']).default('high'),
  language: z.enum(['en', 'hi', 'hinglish', 'ta', 'te', 'bn']).default('en'),
  distinction: z.object({
    explicitlyStated: z.string().optional(),
    inference: z.string().optional(),
    notInDocument: z.string().optional(),
  }).optional(),
});

export type GroundedAnswer = z.infer<typeof GroundedAnswerSchema>;

// Semantic Contract Comparison Schema
export const ClauseComparisonSchema = z.object({
  category: z.string(),
  topic: z.string(),
  versionA: z.object({
    section: z.string(),
    text: z.string(),
    summary: z.string(),
  }),
  versionB: z.object({
    section: z.string(),
    text: z.string(),
    summary: z.string(),
  }),
  meaningfulChange: z.string(),
  impact: z.enum(['favorable', 'unfavorable', 'neutral', 'critical']).default('neutral'),
  recommendation: z.string().optional(),
});

export const ContractComparisonSchema = z.object({
  titleA: z.string(),
  titleB: z.string(),
  summary: z.string(),
  comparisons: z.array(ClauseComparisonSchema),
});

export type ClauseComparison = z.infer<typeof ClauseComparisonSchema>;
export type ContractComparison = z.infer<typeof ContractComparisonSchema>;

// Professional Handoff Schema
export const ProfessionalHandoffSchema = z.object({
  documentTitle: z.string(),
  documentType: z.string(),
  userRole: z.string(),
  userObjective: z.string(),
  discussedTopics: z.array(z.string()),
  needsProfessionalReview: z.array(z.string()),
  relevantClauses: z.array(
    z.object({
      section: z.string(),
      title: z.string(),
      reason: z.string(),
    })
  ),
  questionsForLawyer: z.array(z.string()),
  generatedAt: z.string(),
});

export type ProfessionalHandoff = z.infer<typeof ProfessionalHandoffSchema>;

export const ConversationTurnSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant']),
  text: z.string(),
  section: z.string().optional(),
});

export type ConversationTurn = z.infer<typeof ConversationTurnSchema>;
