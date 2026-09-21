# NyayaVoice System Architecture

## Overview
NyayaVoice is a real-time multilingual AI legal-information assistant built to help ordinary users understand legal documents through natural voice conversations, structured visual intelligence, grounded clause citations, and structured professional handoffs.

**Core Philosophy:**
> Document → Evidence → Understanding → Conversation → Action → Professional Handoff

---

## High-Level Architecture

```
                               ┌─────────────────────────┐
                               │  Browser / Client App   │
                               │ Next.js 16 (React 19)   │
                               └───────────┬─────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
       ┌─────────────────────────┐                   ┌─────────────────────────┐
       │   Voice Call Engine     │                   │   Document Workspace    │
       │  • Web Speech API       │                   │  • Overview & KPI Cards │
       │  • STT (English/Hindi)  │                   │  • Clause Viewer        │
       │  • TTS (English/Hindi)  │                   │  • Legal Action Map     │
       │  • Interruption Manager │                   │  • Before I Sign        │
       │  • Live Clause Synch    │                   │  • Contract Comparison  │
       └────────────┬────────────┘                   │  • Professional Handoff │
                    │                                └────────────┬────────────┘
                    └──────────────────────┬──────────────────────┘
                                           │
                                           ▼
                               ┌─────────────────────────┐
                               │  Next.js API Handlers   │
                               │  • /api/documents/parse │
                               │  • /api/chat/grounded   │
                               │  • /api/compare         │
                               └───────────┬─────────────┘
                                           │
         ┌─────────────────────────────────┴─────────────────────────────────┐
         ▼                                                                   ▼
┌─────────────────────────────────┐                         ┌─────────────────────────────────┐
│     Document Extraction         │                         │        AI Pipeline Engine       │
│  • PDF Parser (pdf-parse)       │                         │  • Classifier                   │
│  • Structural Normalizer        │                         │  • Clause Detector              │
│  • Section Chunking             │                         │  • Metadata & Party Extractor   │
│  • Sample Document Repository   │                         │  • Obligation & Date Extractor  │
└─────────────────────────────────┘                         │  • Plain-Language Explainer     │
                                                            │  • Ambiguity Detector           │
                                                            │  • Grounded Retrieval & Q&A     │
                                                            │  • Citation Validator           │
                                                            └────────────────┬────────────────┘
                                                                             │
                                                            ┌────────────────┴────────────────┐
                                                            ▼                                 ▼
                                                 ┌─────────────────────┐           ┌─────────────────────┐
                                                 │ LLM Providers (API) │           │ Local Deterministic │
                                                 │ • Google Gemini     │           │ Heuristic Engine    │
                                                 │ • OpenAI / Groq     │           │ (Offline/Fallback)  │
                                                 └─────────────────────┘           └─────────────────────┘
```

---

## Directory Structure

```text
src/
  app/
    api/
      chat/grounded/route.ts
      compare/route.ts
      documents/parse/route.ts
    layout.tsx
    page.tsx
    workspace/page.tsx
  components/
    common/
      Badge.tsx
      Button.tsx
      Modal.tsx
      Navbar.tsx
    document/
      ClauseViewer.tsx
      DocumentUpload.tsx
      DocumentWorkspace.tsx
      OverviewTab.tsx
      TimelineTab.tsx
    handoff/
      CopilotMode.tsx
      ProfessionalHandoff.tsx
    legal/
      BeforeISign.tsx
      ContractComparison.tsx
      DocumentQA.tsx
      LegalActionMap.tsx
    voice/
      LegalCallModal.tsx
      VoiceOrb.tsx
  lib/
    ai/
      citation-validator.ts
      heuristic-analyzer.ts
      pipeline.ts
      providers.ts
    documents/
      pdf-parser.ts
      sample-documents.ts
    retrieval/
      clause-retriever.ts
    voice/
      browser-voice.ts
      types.ts
  types/
    document.ts
    voice.ts
```

---

## Document Intelligence Pipeline
Every uploaded or selected legal document passes through our modular analysis pipeline:
1. **Document Classifier**: Identifies legal genre (Employment, NDA, Freelance, Rental, Service, Policy).
2. **Structural Parser**: Breaks raw text into numbered sections, clauses, and sub-clauses.
3. **Metadata Extractor**: Identifies parties, effective dates, governing laws, and term durations.
4. **Obligation Extractor**: Splits duties into `userObligations` ("YOU") vs `otherPartyObligations` ("COMPANY").
5. **Important Date Extractor**: Extracts deadlines, notice periods, renewals, and expiration milestones.
6. **Plain-Language Explainer**: Produces an objective, non-jargon explanation of each clause.
7. **Ambiguity & Review Detector**: Identifies clauses that benefit from review or clarification without using alarming or definitive legal advice terms ("Review Needed", "Potential Ambiguity", "Check Definition").
8. **Professional Question Generator**: Suggests specific questions for a legal professional to verify.

---

## Grounded Q&A & Citation System
When a question is asked (via voice or text):
1. Relevant clauses are identified via semantic/keyword scoring.
2. The model answers using **only** the retrieved clauses.
3. Explicit section citations (e.g. `Section 8.2`, `Section 7.1`) are extracted and verified against actual document clauses.
4. If an inference is made or information is absent, the system explicitly indicates:
   - "Stated directly in document"
   - "Reasonable inference"
   - "Not found in document"
5. Spoken answers trigger synchronized UI events to auto-scroll and highlight the corresponding clause card in the workspace.

---

## Voice Pipeline Abstraction
Voice interfaces are decoupled from specific vendors via `SpeechToTextProvider` and `TextToSpeechProvider`.
- **Default**: Native Browser Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) with zero API key dependencies and native Indian accent / Hindi support (`hi-IN`, `en-IN`).
- **Pluggable**: Easy substitution for Sarvam Streaming STT, Rumik OSS, or ElevenLabs via environment configuration.
- **Barge-in**: The voice call hook monitors voice activity and immediately aborts the active speech synthesizer when the user speaks, maintaining conversation state and answering seamlessly.
