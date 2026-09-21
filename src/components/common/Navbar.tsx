'use client';

import React from 'react';
import { Scale, PhoneCall, FileText, Sparkles } from 'lucide-react';
import { DocumentAnalysis } from '@/types/document';

interface NavbarProps {
  document: DocumentAnalysis | null;
  onOpenCall: () => void;
  onSelectNewDocument: () => void;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  document,
  onOpenCall,
  onSelectNewDocument,
  activeTab,
  onSelectTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onSelectNewDocument}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-violet-600 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white font-sans">
                Nyaya<span className="text-amber-400">Voice</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                India AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Multilingual Legal Information Assistant
            </p>
          </div>
        </div>

        {/* Current Document Pill */}
        {document && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <FileText className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-200 font-medium truncate max-w-xs">{document.title}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-medium">{document.clauses.length} clauses</span>
          </div>
        )}

        {/* Right CTAs */}
        <div className="flex items-center gap-3">
          {document && (
            <button
              onClick={onSelectNewDocument}
              className="text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition"
            >
              Switch Document
            </button>
          )}

          {/* HERO CTA: START LEGAL CALL */}
          {document ? (
            <button
              onClick={onOpenCall}
              className="relative group px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white text-xs font-bold tracking-wide flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              <PhoneCall className="w-4 h-4" />
              <span>START LEGAL CALL</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Document grounded voice assistant</span>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
