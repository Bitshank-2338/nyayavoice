import { DocumentAnalysis, GroundedAnswer } from '@/types/document';
import { analyzeDocumentHeuristically, answerDocumentQuestionHeuristically } from './heuristic-analyzer';

export interface AIProviderConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  groqApiKey?: string;
}

export class AIProviderService {
  private geminiKey?: string;
  private openaiKey?: string;

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
  }

  public hasExternalKey(): boolean {
    return Boolean(this.geminiKey || this.openaiKey);
  }

  /**
   * Analyzes document text using Gemini/OpenAI if available, falling back smoothly to local heuristic analyzer.
   */
  public async analyzeDocument(rawText: string, filename?: string): Promise<DocumentAnalysis> {
    if (this.geminiKey) {
      try {
        const result = await this.callGeminiForAnalysis(rawText, filename);
        if (result) return result;
      } catch (err) {
        console.warn('Gemini API call encountered an issue, gracefully falling back to local engine:', err);
      }
    }

    // Default guaranteed offline heuristic engine
    return analyzeDocumentHeuristically(rawText, filename);
  }

  /**
   * Answers questions grounded in document clauses
   */
  public async answerQuestion(
    question: string,
    analysis: DocumentAnalysis
  ): Promise<GroundedAnswer> {
    if (this.geminiKey) {
      try {
        const result = await this.callGeminiForGroundedAnswer(question, analysis);
        if (result) return result;
      } catch (err) {
        console.warn('Gemini Q&A call encountered an issue, gracefully falling back to local engine:', err);
      }
    }

    return answerDocumentQuestionHeuristically(question, analysis);
  }

  private async callGeminiForAnalysis(rawText: string, filename?: string): Promise<DocumentAnalysis | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;
    
    const prompt = `You are NyayaVoice, an expert legal-information assistant.
Analyze this legal document text and output a valid JSON adhering exactly to this schema:
{
  "documentType": string,
  "title": string,
  "parties": [{"name": string, "role": string, "jurisdictionOrAddress": string}],
  "effectiveDate": string | null,
  "expirationDate": string | null,
  "governingLaw": string | null,
  "summary": string,
  "clauses": [
    {
      "id": string,
      "section": string,
      "title": string,
      "category": string,
      "sourceText": string,
      "plainLanguage": string,
      "obligations": [string],
      "importantDates": [string],
      "questionsToConsider": [string],
      "reviewReason": string | null,
      "reviewSeverity": "info" | "review" | "caution"
    }
  ],
  "importantDates": [{"label": string, "dateOrPeriod": string, "section": string, "type": "deadline"|"noticePeriod"|"effectiveDate"|"milestone"}],
  "userObligations": [{"id": string, "who": "user", "text": string, "section": string, "priority": "high"|"medium"|"low"}],
  "otherPartyObligations": [{"id": string, "who": "otherParty", "text": string, "section": string, "priority": "high"|"medium"|"low"}],
  "financialTerms": [{"title": string, "terms": string, "section": string, "notes": string}],
  "restrictions": [{"title": string, "description": string, "section": string, "durationOrScope": string}],
  "potentialAmbiguities": [{"section": string, "issue": string, "whyItMatters": string, "suggestedClarification": string}],
  "questionsForProfessional": [{"category": string, "question": string, "relevantSection": string, "context": string}]
}

DOCUMENT TEXT:
${rawText.slice(0, 18000)}
`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      ...parsed,
      documentId: `doc_${Date.now()}`,
      rawText,
      pageCount: Math.max(1, Math.ceil(rawText.length / 2800)),
      uploadedAt: new Date().toISOString(),
    };
  }

  private async callGeminiForGroundedAnswer(
    question: string,
    analysis: DocumentAnalysis
  ): Promise<GroundedAnswer | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`;

    const prompt = `You are NyayaVoice, a real-time multilingual AI legal assistant.
Answer the user's question grounded STRICTLY in these document clauses.
Support English, Hindi, or natural conversational Hinglish depending on the question's phrasing.
NEVER fabricate a clause or section. Quote exact sections where available.

DOCUMENT SUMMARY: ${analysis.summary}
DOCUMENT CLAUSES:
${analysis.clauses.map(c => `[${c.section}: ${c.title}]\n${c.sourceText}`).join('\n\n')}

USER QUESTION: "${question}"

Respond in valid JSON with schema:
{
  "shortAnswer": string,
  "explanation": string,
  "sourceClauses": [{"section": string, "title": string, "snippet": string, "relevance": string}],
  "thingsToVerify": [string],
  "suggestedQuestions": [string],
  "confidence": "high" | "medium" | "low",
  "language": "en" | "hi" | "hinglish",
  "distinction": {
    "explicitlyStated": string,
    "inference": string,
    "notInDocument": string
  }
}
`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) return null;
    return JSON.parse(content);
  }
}

export const aiProviderService = new AIProviderService();
