# NyayaVoice Engineering Handoff

## Current State
- Next.js 16 App Router setup with React 19, TypeScript, and Tailwind CSS v4.
- Core project architecture documents initialized (`TODO.md`, `ARCHITECTURE.md`, `HANDOFF.md`, `README.md`, `.env.example`).
- Core dependencies installed: `lucide-react`, `zod`, `clsx`, `tailwind-merge`, `pdf-parse`, `@types/pdf-parse`.
- Commencing Milestone 2 (Document Intelligence Engine & Parser Pipeline).

## Architecture
Modular AI legal document assistant architecture:
- Frontend: Next.js App Router with responsive dark glassmorphic design, dual-panel workspace, live synchronized clause highlighting.
- AI Pipeline: Multi-stage pipeline with Zod validation. Supports Gemini, OpenAI, Groq, plus a built-in deterministic heuristic engine for zero-API-key 100% reliable hackathon demonstrations.
- Voice Pipeline: Abstracted STT and TTS provider interfaces with native Web Speech API default (supporting English, Hindi, and Hinglish with barge-in interruption).
- Workflows: Document Overview, Clause Viewer, Grounded Q&A, Legal Call modal, Legal Action Map, Before I Sign checklist, Contract Comparison, Professional Handoff, and Copilot Mode.

## Completed
- [x] Initialized Next.js 16 with TypeScript and Tailwind CSS
- [x] Configured path aliases and project structure
- [x] Installed `lucide-react`, `zod`, `clsx`, `tailwind-merge`, `pdf-parse`
- [x] Established `TODO.md`, `ARCHITECTURE.md`, `HANDOFF.md`, `README.md`, `.env.example`

## In Progress
- Milestone 2: Document Intelligence Engine & Parser Pipeline
  - Defining `src/types/document.ts` (Zod schemas for all legal entities)
  - Building `src/lib/documents/sample-documents.ts` (Preloaded safe fictional agreements: Employment Agreement with Section 8.2 notice and Section 7.1 IP, Freelance MSA, NDA)
  - Implementing `src/lib/documents/pdf-parser.ts`
  - Implementing `src/lib/ai/heuristic-analyzer.ts` (offline intelligent fallback)
  - Implementing `src/lib/ai/providers.ts` and `src/lib/ai/pipeline.ts`

## Remaining P0
1. PDF text extraction and structural parsing
2. Document intelligence pipeline & Zod schema validation
3. Interactive Document Workspace (Overview, Clause Viewer, Timeline)
4. Document-grounded Q&A with strict clause citations
5. Hero Voice Call interface ("Start Legal Call") with animated orb, dual transcript, interruption, and live document highlighting
6. Multilingual support (English, Hindi, Hinglish)
7. "Before I Sign" checklist
8. Semantic Contract Comparison (Version A vs Version B)
9. Professional Handoff generator
10. Copilot Mode

## Known Issues
- None at this stage.

## Environment Variables
Create a `.env.local` file based on `.env.example`:
```bash
# Optional: Set an LLM provider key if you want live external LLM generation.
# If omitted or empty, NyayaVoice automatically uses its built-in deterministic legal intelligence engine.
GEMINI_API_KEY=""
OPENAI_API_KEY=""
GROQ_API_KEY=""

# Voice configuration (default: browser)
NEXT_PUBLIC_VOICE_PROVIDER="browser"
```

## Important Files
- `src/types/document.ts` - Central TypeScript interfaces and Zod schemas for clauses, obligations, and handoffs
- `src/lib/documents/sample-documents.ts` - Fictional sample contracts for instant 1-click hackathon demo
- `src/lib/documents/pdf-parser.ts` - PDF parsing and text normalization
- `src/lib/ai/pipeline.ts` - Core multi-stage legal analysis pipeline
- `src/lib/ai/heuristic-analyzer.ts` - High-accuracy local legal heuristic analyzer
- `src/lib/voice/browser-voice.ts` - Web Speech API STT and TTS implementation
- `src/components/voice/LegalCallModal.tsx` - Hero voice call interface
- `src/components/document/DocumentWorkspace.tsx` - Main legal workspace container

## Database
Currently using in-memory state and local storage for anonymous, zero-friction hackathon demos. Prepared for Supabase / PostgreSQL schema integration when authentication is enabled.

## AI Providers
- Built-in Heuristic Analyzer: Default offline engine, extracts clauses, obligations, financial terms, dates, and plain-language summaries without any API keys.
- Google Gemini: Activated when `GEMINI_API_KEY` is provided.
- OpenAI: Activated when `OPENAI_API_KEY` is provided.

## Voice Providers
- Native Web Speech API: Built-in zero-dependency speech recognition and synthesis.
- Interface contract: `SpeechToTextProvider`, `TextToSpeechProvider` in `src/lib/voice/types.ts`.

## How To Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## How To Test
```bash
npm run build
npm run lint
```

## Recommended Next Step
Complete Milestone 2 implementation:
1. Create `src/types/document.ts` with Zod validation.
2. Create `src/lib/documents/sample-documents.ts` with the required Employment Agreement (60-day notice in Section 8.2, IP assignment in Section 7.1) and Freelance Contract.
3. Build the heuristic legal analyzer in `src/lib/ai/heuristic-analyzer.ts`.
4. Create the API route `/api/documents/parse`.
