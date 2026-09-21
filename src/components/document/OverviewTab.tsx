'use client';

import React from 'react';
import { FileText, Users, Calendar, AlertTriangle, CheckCircle2, ShieldAlert, PhoneCall, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { DocumentAnalysis } from '@/types/document';

interface OverviewTabProps {
  document: DocumentAnalysis;
  onNavigateTab: (tab: string) => void;
  onOpenCall: () => void;
  onHighlightClause?: (section: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  document,
  onNavigateTab,
  onOpenCall,
  onHighlightClause,
}) => {
  const reviewCount = document.potentialAmbiguities.length + document.clauses.filter(c => c.reviewReason).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              Document Analysis Complete
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {document.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {document.summary}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={onOpenCall}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <PhoneCall className="w-4 h-4" />
              Start Legal Call
            </button>
            <button
              onClick={() => onNavigateTab('before-i-sign')}
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              Before I Sign
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Structured Overview KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Document Type Card */}
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Document
          </div>
          <div className="text-lg font-bold text-white truncate">
            {document.documentType}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {document.pageCount} page(s) analyzed
          </div>
        </div>

        {/* Parties Card */}
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Parties
          </div>
          <div className="text-lg font-bold text-white truncate">
            {document.parties[0]?.name || 'Party 1'}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            &amp; {document.parties[1]?.name || 'Party 2'}
          </div>
        </div>

        {/* Effective Date Card */}
        <div className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            Effective Date
          </div>
          <div className="text-lg font-bold text-amber-300 truncate">
            {document.effectiveDate || 'Not specified'}
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {document.governingLaw || 'Laws of India'}
          </div>
        </div>

        {/* Clauses Detected Card */}
        <div 
          onClick={() => onNavigateTab('clauses')}
          className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-indigo-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Detected</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-400">
            {document.clauses.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Clauses &amp; Sections
          </div>
        </div>

        {/* User Obligations Card */}
        <div
          onClick={() => onNavigateTab('obligations')}
          className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-emerald-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              User Obligations
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {document.userObligations.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Commitments required by you
          </div>
        </div>

        {/* Counterparty Obligations Card */}
        <div
          onClick={() => onNavigateTab('obligations')}
          className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-slate-700 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Company Obligations
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-200">
            {document.otherPartyObligations.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Duties of the counterparty
          </div>
        </div>

        {/* Important Dates Card */}
        <div
          onClick={() => onNavigateTab('timeline')}
          className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800/80 hover:border-amber-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Important Dates
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {document.importantDates.length}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Deadlines &amp; notice windows
          </div>
        </div>

        {/* Items Worth Reviewing Card */}
        <div
          onClick={() => onNavigateTab('before-i-sign')}
          className="p-5 bg-amber-950/20 rounded-2xl border border-amber-600/40 hover:border-amber-500 cursor-pointer transition"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Worth Reviewing
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300">
            {reviewCount}
          </div>
          <div className="text-xs text-amber-200/80 mt-1">
            Ambiguities &amp; attention items
          </div>
        </div>

      </div>

      {/* Priority Spotlight: Areas Requiring Attention */}
      <div className="bg-slate-900/40 rounded-3xl border border-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Key Attention Items Identified</h3>
          </div>
          <button
            onClick={() => onNavigateTab('before-i-sign')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 transition"
          >
            Open Full &quot;Before I Sign&quot; Review &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {document.potentialAmbiguities.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/90 hover:border-slate-700 transition space-y-2 cursor-pointer"
              onClick={() => {
                onHighlightClause?.(item.section);
                onNavigateTab('clauses');
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 uppercase">{item.section}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Needs Clarification
                </span>
              </div>
              <h4 className="text-sm font-semibold text-white">{item.issue}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{item.whyItMatters}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product-Level Thoughtful Legal Notice */}
      <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 text-center">
        <p className="text-xs text-slate-400">
          NyayaVoice helps you understand legal information and prepare for professional conversations. It is not a substitute for qualified legal advice.
        </p>
      </div>

    </div>
  );
};
