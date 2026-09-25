'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, FileText, CheckSquare, Plus, ArrowLeft, Bookmark, Clock } from 'lucide-react';
import { DocumentAnalysis } from '@/types/document';

interface CopilotModeProps {
  document: DocumentAnalysis;
  onExitCopilot: () => void;
  onSelectClause: (section: string) => void;
}

export const CopilotMode: React.FC<CopilotModeProps> = ({
  document,
  onExitCopilot,
  onSelectClause,
}) => {
  const [activeNotes, setActiveNotes] = useState<string[]>([
    'Lawyer confirmed Section 27 of Indian Contract Act makes post-employment non-compete void in Indian courts.',
    'Advocate recommended adding formal Exhibit A to list active GitHub personal repositories before signing.',
    'Discussed requesting mutual notice buyout clause allowing 30 days buyout.',
  ]);
  const [newNote, setNewNote] = useState('');
  const [quickSectionQuery, setQuickSectionQuery] = useState('');

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setActiveNotes(prev => [...prev, newNote.trim()]);
    setNewNote('');
  };

  const filteredClauses = quickSectionQuery.trim()
    ? document.clauses.filter(c =>
        c.section.toLowerCase().includes(quickSectionQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(quickSectionQuery.toLowerCase())
      )
    : document.clauses.slice(0, 4);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Copilot Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/60 border border-violet-500/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-violet-400 animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base">PROFESSIONAL SESSION COPILOT</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Live Consultation Assistant
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Silent assistive mode: taking notes, pulling up referenced clauses, and tracking questions during your lawyer meeting.
            </p>
          </div>
        </div>

        <button
          onClick={onExitCopilot}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Copilot Mode</span>
        </button>
      </div>

      {/* Grid Layout: Notes & Quick Clause Pullup */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Consultation Notes & Action Items */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-400" />
              <span>Live Consultation Notes</span>
            </h3>

            <div className="space-y-2.5">
              {activeNotes.map((note, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                  <span className="text-violet-400 font-bold">&bull;</span>
                  <span className="leading-relaxed">{note}</span>
                </div>
              ))}
            </div>

            {/* Note Input */}
            <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log notes from your legal counsel..."
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
              <button
                type="submit"
                disabled={!newNote.trim()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Open Questions Checklist */}
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <span>Consultation Questions Checklist</span>
            </h3>
            <div className="space-y-2">
              {document.questionsForProfessional.map((q, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                  <input type="checkbox" aria-label={q.question} className="mt-0.5 rounded border-slate-700 text-violet-600 focus:ring-0" />
                  <div>
                    <span className="font-semibold text-white">{q.question}</span>
                    <span className="ml-2 font-mono text-amber-300 text-[10px]">[{q.relevantSection}]</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Quick Clause Pullup */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Instant Clause Retrieval</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Instantly pull up any contract clause referenced during the meeting.
              </p>
            </div>

            <input
              type="text"
              value={quickSectionQuery}
              onChange={(e) => setQuickSectionQuery(e.target.value)}
              placeholder="Search section (e.g. 7.1, 8.2)..."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="space-y-2.5">
              {filteredClauses.map((clause) => (
                <div
                  key={clause.id}
                  onClick={() => onSelectClause(clause.section)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 font-mono">{clause.section}</span>
                    <span className="text-[10px] text-slate-400">{clause.category}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-white">{clause.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{clause.plainLanguage}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
