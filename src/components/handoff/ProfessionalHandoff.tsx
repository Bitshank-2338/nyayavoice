'use client';

import React, { useMemo, useState } from 'react';
import { Briefcase, Copy, Check, Printer, Download, AlertCircle, ArrowRight } from 'lucide-react';
import { ConversationTurn, DocumentAnalysis } from '@/types/document';
import { buildProfessionalHandoff, formatDossierText } from '@/lib/handoff/build-handoff';
import { downloadHandoffPdf } from '@/lib/handoff/handoff-pdf';

interface ProfessionalHandoffProps {
  document: DocumentAnalysis;
  conversation?: ConversationTurn[];
  onEnterCopilotMode?: () => void;
}

export const ProfessionalHandoff: React.FC<ProfessionalHandoffProps> = ({
  document,
  conversation = [],
  onEnterCopilotMode,
}) => {
  const [copied, setCopied] = useState(false);
  const handoffData = useMemo(
    () => buildProfessionalHandoff(document, conversation),
    [document, conversation]
  );
  const formattedDossierText = useMemo(() => formatDossierText(handoffData), [handoffData]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedDossierText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Action Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            Lawyer Consultation Preparation
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Prepare Professional Handoff
          </h2>
          <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">
            Synthesizes all discussed clauses, obligations, ambiguities, and prioritized questions into a clean consultation dossier to share directly with your advocate or legal counsel.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Dossier'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={() => downloadHandoffPdf(formattedDossierText, 'nyayavoice-handoff.pdf')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          {onEnterCopilotMode && (
            <button
              onClick={onEnterCopilotMode}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition"
            >
              <span>Switch to Copilot Mode</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Structured Dossier Document Card */}
      <div className="p-8 rounded-3xl bg-slate-950/80 border border-slate-800 font-sans space-y-8 shadow-2xl">
        
        {/* Document Header & Metadata */}
        <div className="border-b border-slate-800 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">DOCUMENT</span>
            <h3 className="text-base font-bold text-white mt-1">{handoffData.documentTitle}</h3>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">CLIENT ROLE</span>
            <div className="text-sm font-semibold text-indigo-300 mt-1">{handoffData.userRole}</div>
          </div>

          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider font-mono">PREPARED DATE</span>
            <div className="text-sm font-semibold text-slate-300 mt-1">{handoffData.generatedAt}</div>
          </div>
        </div>

        {/* Client Objective */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">USER OBJECTIVE</span>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-200 leading-relaxed">
            {handoffData.userObjective}
          </div>
        </div>

        {/* Topics Discussed */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">DISCUSSED WITH NYAYAVOICE</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {handoffData.discussedTopics.map((topic, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                <span className="text-emerald-400 font-bold">&check;</span>
                <span>{topic}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Professional Review */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">NEEDS PROFESSIONAL LEGAL REVIEW</span>
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            {handoffData.needsProfessionalReview.map((item, i) => (
              <div key={i} className="text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Relevant Clauses */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">RELEVANT SUPPORTING CLAUSES</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {handoffData.relevantClauses.map((clause, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 font-mono">{clause.section}</span>
                  <span className="text-xs text-white font-medium">{clause.title}</span>
                </div>
                <p className="text-xs text-slate-400">{clause.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Questions for the Lawyer */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider font-mono">PREPARED QUESTIONS FOR COUNSEL</span>
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
            {handoffData.questionsForLawyer.map((q, i) => (
              <div key={i} className="text-xs text-indigo-100 flex items-start gap-2.5">
                <span className="font-bold text-indigo-400 shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{q}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
