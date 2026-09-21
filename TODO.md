# NyayaVoice Project Tracker

## P0 — MUST WORK (Core MVP)
- [x] Milestone 1: Foundation & Scaffolding
  - [x] Next.js 16 App Router + TypeScript + Tailwind CSS
  - [x] Project architecture documentation (TODO.md, ARCHITECTURE.md, HANDOFF.md, README.md, .env.example)
  - [x] Design system, typography & responsive layout shell
- [~] Milestone 2: Document Intelligence Engine & Parser Pipeline
  - [ ] Type definitions & Zod schemas for legal documents (`src/types/document.ts`)
  - [ ] Server-side PDF extraction with `pdf-parse` (`src/lib/documents/pdf-parser.ts`)
  - [ ] Safe fictional sample documents (Employment Agreement with Section 8.2 notice, Section 7.1 IP, Freelance MSA, NDA)
  - [ ] Multi-stage AI pipeline (Classification, Clause Detection, Metadata, Obligations, Dates, Plain-Language Explainer, Ambiguity Detector)
  - [ ] Multi-provider LLM connector (Gemini, OpenAI, Groq + Deterministic heuristic fallback engine for offline reliability)
  - [ ] Document parse & analyze API route (`/api/documents/parse`)
- [ ] Milestone 3: Grounded Conversation & Document Workspace
  - [ ] Document Workspace shell with persistent state & navigation tabs
  - [ ] Overview KPI dashboard (Parties, Clauses, Obligations, Important Dates, Items to Review)
  - [ ] Interactive Clause Viewer (Plain-language explanations, "What this requires", "Things worth understanding", Questions to ask, Raw text)
  - [ ] Grounded Q&A engine with direct clause citations & retrieval
- [ ] Milestone 4: Voice Pipeline & "Start Legal Call" Hero Experience
  - [ ] Voice provider abstraction (`SpeechToTextProvider`, `TextToSpeechProvider`)
  - [ ] Browser Web Speech API implementation (STT + TTS) supporting English, Hindi, and Hinglish (`hi-IN`, `en-IN`)
  - [ ] Hero Legal Call modal with animated pulsing orb, dual live transcript, call timer, mute & interrupt controls
  - [ ] Live synchronized document highlighting (scrolling and highlighting the discussed section live)
- [ ] Milestone 5: Action Workflows
  - [ ] "Before I Sign" pre-signing checklist & risk analysis
  - [ ] Interactive Legal Action Map (tree/node visualization of rights, obligations, and conditions)
  - [ ] Semantic Contract Comparison (Version A vs Version B clause-level diff)
  - [ ] Professional Handoff Generator (client dossier, discussed points, unresolved questions, exportable summary)

## P1 — HIGH PRIORITY
- [ ] Conversation memory across voice & text sessions
- [ ] Interruptible barge-in voice response detection
- [ ] Session history in local storage
- [ ] Copilot Mode for live lawyer consultations

## P2 — POST-CORE
- [ ] Real-time lawyer join simulation
- [ ] PDF export of handoff package
- [ ] Additional Indian languages (Tamil, Telugu, Bengali)
- [ ] Authentication & cloud sync
