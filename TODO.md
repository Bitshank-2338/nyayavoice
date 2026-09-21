# NyayaVoice Project Tracker

## P0 — MUST WORK (Core MVP)
- [x] Milestone 1: Foundation & Scaffolding
  - [x] Next.js 16 App Router + TypeScript + Tailwind CSS
  - [x] Project architecture documentation (TODO.md, ARCHITECTURE.md, HANDOFF.md, README.md, .env.example)
  - [x] Design system, typography & responsive layout shell
- [x] Milestone 2: Document Intelligence Engine & Parser Pipeline
  - [x] Type definitions & Zod schemas for legal documents (`src/types/document.ts`)
  - [x] Server-side PDF extraction with `pdf-parse` (`src/lib/documents/pdf-parser.ts`)
  - [x] Safe fictional sample documents (Employment Agreement with Section 8.2 notice, Section 7.1 IP, Freelance MSA, NDA)
  - [x] Multi-stage AI pipeline (Classification, Clause Detection, Metadata, Obligations, Dates, Plain-Language Explainer, Ambiguity Detector)
  - [x] Multi-provider LLM connector (Gemini, OpenAI, Groq + Deterministic heuristic fallback engine for offline reliability)
  - [x] Document parse & analyze API route (`/api/documents/parse`)
- [x] Milestone 3: Grounded Conversation & Document Workspace
  - [x] Document Workspace shell with persistent state & navigation tabs (`DocumentWorkspace.tsx`)
  - [x] Overview KPI dashboard (Parties, Clauses, Obligations, Important Dates, Items to Review) (`OverviewTab.tsx`)
  - [x] Interactive Clause Viewer (Plain-language explanations, "What this requires", "Things worth understanding", Questions to ask, Raw text) (`ClauseViewer.tsx`)
  - [x] Grounded Q&A engine with direct clause citations & retrieval (`DocumentQA.tsx`, `/api/chat/grounded`)
- [x] Milestone 4: Voice Pipeline & "Start Legal Call" Hero Experience
  - [x] Voice provider abstraction (`SpeechToTextProvider`, `TextToSpeechProvider` in `src/lib/voice/types.ts`)
  - [x] Browser Web Speech API implementation (STT + TTS) supporting English, Hindi, and Hinglish (`hi-IN`, `en-IN` in `browser-voice.ts`)
  - [x] Hero Legal Call modal with animated pulsing orb, dual live transcript, call timer, mute & interrupt controls (`LegalCallModal.tsx`, `VoiceOrb.tsx`)
  - [x] Live synchronized document highlighting (scrolling and highlighting the discussed section live)
- [x] Milestone 5: Action Workflows
  - [x] "Before I Sign" pre-signing checklist & risk analysis (`BeforeISign.tsx`)
  - [x] Interactive Legal Action Map (tree/node visualization of rights, obligations, and conditions) (`LegalActionMap.tsx`)
  - [x] Semantic Contract Comparison (Version A vs Version B clause-level diff) (`ContractComparison.tsx`, `/api/compare`)
  - [x] Professional Handoff Generator (client dossier, discussed points, unresolved questions, exportable summary) (`ProfessionalHandoff.tsx`)
  - [x] Consultation Copilot Mode (`CopilotMode.tsx`)
- [x] Milestone 6: Verification & End-to-End Testing
  - [x] Automated E2E verification test suite (`scripts/test-e2e.ts`, `npm test`)
  - [x] Verified English & Hinglish grounded Q&A with direct Section 8.2 & 7.1 citations
  - [x] Verified full Next.js production build (`npm run build`)

## P1 — HIGH PRIORITY
- [x] Conversation memory & session grounding
- [x] Interruptible barge-in voice response detection & stop control
- [x] Session state management & preloaded demo agreements
- [x] Copilot Mode for live lawyer consultations

## P2 — POST-CORE (Future Enhancements)
- [ ] Real-time lawyer join WebRTC simulation
- [ ] Direct PDF file download of handoff package
- [ ] Additional Indian regional languages (Tamil, Telugu, Bengali)
- [ ] Cloud sync & Supabase PostgreSQL pgvector database persistence
