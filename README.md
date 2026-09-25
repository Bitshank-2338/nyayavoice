# NyayaVoice — AI for Legal Assistance & Access

**Vertical:** AI for Legal Assistance & Access.  
**Persona:** A person in India who has a contract and needs to understand it before signing or speaking with a lawyer. NyayaVoice is legal information and consultation preparation. It is not a lawyer and does not give legal advice.

## Approach and logic

1. Load a sample agreement or an uploaded PDF.
2. Extract clauses, obligations, dates, and review items with a deterministic engine so the demo works with no API key.
3. If `GEMINI_API_KEY` is set, Google Gemini answers from retrieved clauses only. If Gemini is missing or fails, the same local engine answers.
4. Every answer cites a section from the uploaded document, or says the point was not found.
5. Voice, text, Tamil / Telugu / Bengali / Hindi / Hinglish, a pre-sign checklist, contract comparison, a downloadable handoff PDF, and a simulated counsel lane all use that same grounded result.
6. The last document and questions stay in this browser (`localStorage`). There is no Supabase or other third-party database.

## How to test locally

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Choose **Start Legal Call (Live Demo)**. Ask about the notice period or personal projects, open **Professional Handoff**, and use **Download PDF**. Refresh the page: the same document and tab should return. **Switch Document** clears the saved session.

`GET /api/health` returns `{ "ok": true }` for Cloud Run.

## Google Cloud Run

Remote intelligence is **Google Gemini** only (`GEMINI_API_KEY`). Voice stays in the browser. Persistence stays in the browser. The container is ready for Cloud Run (port `8080`, standalone Next.js server).

Antigravity, or any Cloud Run deploy, can build this `Dockerfile` and set:

- `GEMINI_API_KEY` (optional; the offline engine still runs if it is empty)
- `PORT=8080` (Cloud Run sets this itself)

Do not commit `.env.local`. The repository must stay public, on one branch, and under 10 MB.

## Accessibility

The interface is built for keyboard and screen-reader use, not only for a mouse.

- The first control is a “Skip to content” link. Tab moves through controls. Enter activates them.
- The header is a banner. The workspace sections are tabs with `aria-selected`. The legal call is a dialog.
- File upload, clause search, questions, language choice, and comparison all have visible or screen-reader labels.
- Icon-only buttons have accessible names. Call transcripts use live regions.
- Text contrast stays at least WCAG AA on the light LawAI background. Focus is a visible indigo outline.
- Motion from pulses and transitions is removed when the user prefers reduced motion.
- Answers can be read on screen if speech recognition or spoken playback is unavailable.

## Assumptions

- Sample contracts are fictional and safe to demo.
- Browser speech quality depends on the installed voices for Tamil, Telugu, and Bengali.
- The handoff PDF is Latin-text. Use **Copy Dossier** when the text includes Indian scripts.
- A joined “counsel” participant is a simulation, labeled as such, and is not legal advice.

---

# NyayaVoice — Real-Time Multilingual AI Legal Assistant

> **Understand legal documents by talking to them.**
> Upload an agreement, policy, notice, or contract and have a natural conversation about what it means, what matters, and what you may want to ask next.

---

## 🌟 What is NyayaVoice?
NyayaVoice is an India-first, real-time multilingual AI legal-information assistant. It bridges the gap between complex legalese and everyday understanding without pretending to replace a lawyer.

**Core Philosophy:**
> Document → Evidence → Understanding → Conversation → Action → Professional Handoff

### 🚀 Hero Experience: **Start Legal Call**
Instead of a generic text chat, NyayaVoice features a live interactive audio phone call with your document. Ask naturally in **English**, **Hindi**, or **Hinglish** (*"Isme notice period kitna hai?"*), hear spoken answers grounded in exact clauses, watch Section 8.2 highlight in real time, and interrupt at any moment.

---

## ✨ Features
1. **Instant Document Extraction**: Upload PDFs or select safe fictional agreements (Employment, Freelance, NDA).
2. **Modular Legal Intelligence**: Extracts clauses, parties, user obligations ("YOU"), company obligations, financial terms, and critical dates.
3. **Interactive Legal Call**: Animated audio orb, dual-channel live transcript, interruptible barge-in, and auto-scrolling live clause highlighting.
4. **Natural Multilingual Code-Switching**: Speaks English, Hindi, and natural colloquial Hinglish.
5. **Strict Grounded Citations**: Answers backed by verified section citations, source text snippets, and confidence ratings.
6. **Interactive Legal Action Map**: Visual tree mapping your obligations, rights, and potential questions.
7. **"Before I Sign" Checklist**: High-stakes pre-signing review of obligations, restrictions, financial terms, and ambiguities.
8. **Semantic Contract Comparison**: Version A vs Version B clause-level semantic diff (e.g., notice period changed from 30 to 90 days).
9. **Structured Professional Handoff**: Formatted consultation dossier ready to share with your legal counsel.
10. **Consultation Copilot Mode**: Live note-taking and clause-retrieval interface during actual lawyer sessions.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS v4, Lucide Icons, Glassmorphic UI tokens
- **Parsing**: `pdf-parse` server-side parser with structured section extraction
- **AI Engine**: Pluggable architecture (Google Gemini, OpenAI, Groq) + deterministic offline heuristic engine
- **Voice Engine**: Provider-agnostic abstraction with native Web Speech API default (English + Hindi/Hinglish)
- **Validation**: Zod schema validation on all analytical outputs

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env.local
```
*Note: NyayaVoice runs with zero API keys out of the box using its built-in legal intelligence engine!*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎭 Target Demo Flow
1. **Scene 1**: Select "Employment Agreement (ABC Technologies)" sample or upload a PDF.
2. **Scene 2**: Explore the structured overview: 14 clauses, 7 user obligations, 3 dates, 4 review items.
3. **Scene 3**: Click **Start Legal Call** and ask: *"Can I continue working on my personal open-source projects?"* $\rightarrow$ Section 7.1 highlights live with spoken guidance.
4. **Scene 4**: Ask in Hindi/Hinglish: *"Isme notice period kitna hai?"* $\rightarrow$ AI responds in natural Hinglish citing Section 8.2 (60 days).
5. **Scene 5**: Click **Before I Sign** to review commitments, restrictions, and questions for counsel.
6. **Scene 6**: Switch to **Compare** to review changes between Version 1 and Version 2.
7. **Scene 7**: Generate **Professional Handoff** and export the consultation brief.

---

## ⚖️ Legal Safety Notice
NyayaVoice provides legal information, document navigation, and consultation preparation assistance. It is **not** a lawyer and does **not** provide qualified legal advice.
