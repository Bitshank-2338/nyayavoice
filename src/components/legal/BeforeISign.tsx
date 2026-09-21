'use client';

import React from 'react';
import { ShieldAlert, CheckCircle, Clock, DollarSign, Lock, AlertTriangle, HelpCircle, PhoneCall, ArrowRight, ExternalLink } from 'lucide-react';
import { DocumentAnalysis } from '@/types/document';

interface BeforeISignProps {
  document: DocumentAnalysis;
  onOpenCall: () => void;
  onSelectClause: (section: string) => void;
  onGenerateHandoff: () => void;
}

export const BeforeISign: React.FC<BeforeISignProps> = ({
  document,
  onOpenCall,
  onSelectClause,
  onGenerateHandoff,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/30 border border-amber-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              Pre-Signing Critical Review Checklist
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Before I Sign
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              A comprehensive risk, obligation, and financial assessment before affixing your signature to this document.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenCall}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:scale-[1.02] transition"
            >
              <PhoneCall className="w-4 h-4" />
              Discuss in Legal Call
            </button>
            <button
              onClick={onGenerateHandoff}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              Prepare Lawyer Handoff
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 1. Commitments You're Making */}
      <section className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">Commitments You&apos;re Making (User Obligations)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {document.userObligations.map((ob, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3">
              <div className="text-xs text-slate-200 leading-relaxed font-sans">
                <span className="font-semibold text-emerald-400 mr-1.5">{idx + 1}.</span>
                {ob.text}
              </div>
              {ob.section && (
                <button
                  onClick={() => onSelectClause(ob.section!)}
                  className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-amber-300 hover:text-white shrink-0 border border-slate-700"
                >
                  {ob.section}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Critical Dates & Deadlines */}
      <section className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Important Dates &amp; Timelines</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {document.importantDates.map((dateItem, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{dateItem.label}</span>
                {dateItem.section && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                    {dateItem.section}
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-amber-300">{dateItem.dateOrPeriod}</div>
              {dateItem.consequence && (
                <p className="text-[11px] text-slate-400 leading-snug">{dateItem.consequence}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. Financial Terms & Compensation */}
      <section className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Financial Terms &amp; Compensation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {document.financialTerms.map((ft, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{ft.title}</span>
              <div className="text-base font-bold text-white">{ft.terms}</div>
              {ft.notes && <p className="text-xs text-slate-400">{ft.notes}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* 4. Restrictions & Covenants */}
      <section className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-rose-400" />
          <h3 className="text-lg font-bold text-white">Restrictions &amp; Non-Competes</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {document.restrictions.map((r, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">{r.title}</h4>
                {r.durationOrScope && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    {r.durationOrScope}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{r.description}</p>
              {r.section && (
                <button
                  onClick={() => onSelectClause(r.section!)}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Review {r.section}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Items That May Need Clarification */}
      <section className="p-6 bg-amber-950/20 rounded-3xl border border-amber-600/40">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-amber-300">Items That May Need Clarification</h3>
        </div>
        <div className="space-y-3">
          {document.potentialAmbiguities.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 font-mono">{item.section}</span>
                <span className="text-[10px] px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/30">
                  Ambiguity / Scope
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{item.issue}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{item.whyItMatters}</p>
              <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200">
                <span className="font-semibold text-indigo-300">Recommended Clarification: </span>
                {item.suggestedClarification}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Questions for a Legal Professional */}
      <section className="p-6 bg-slate-900/60 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Questions for a Legal Professional</h3>
          </div>
          <button
            onClick={onGenerateHandoff}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            Export to Consultation Dossier &rarr;
          </button>
        </div>
        <div className="space-y-3">
          {document.questionsForProfessional.map((q, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-400">{q.category}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300">
                  {q.relevantSection}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-100">&ldquo;{q.question}&rdquo;</p>
              <p className="text-xs text-slate-400">Context: {q.context}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
