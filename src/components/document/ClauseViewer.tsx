'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, AlertCircle, ChevronDown, ChevronUp, FileText, CheckCircle2, HelpCircle, PhoneCall } from 'lucide-react';
import { DocumentAnalysis, Clause } from '@/types/document';

interface ClauseViewerProps {
  document: DocumentAnalysis;
  highlightedSection?: string;
  onOpenCall?: () => void;
}

export const ClauseViewer: React.FC<ClauseViewerProps> = ({
  document,
  highlightedSection,
  onOpenCall,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedOriginal, setExpandedOriginal] = useState<Record<string, boolean>>({});

  // Clause container refs for scrolling
  const clauseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(document.clauses.map(c => c.category)))];

  // Auto-scroll when highlightedSection changes
  useEffect(() => {
    if (highlightedSection) {
      const target = document.clauses.find(c => c.section.toLowerCase() === highlightedSection.toLowerCase());
      if (target && clauseRefs.current[target.id]) {
        clauseRefs.current[target.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedSection, document.clauses]);

  const toggleOriginal = (clauseId: string) => {
    setExpandedOriginal(prev => ({ ...prev, [clauseId]: !prev[clauseId] }));
  };

  const filteredClauses = document.clauses.filter(clause => {
    const matchesCategory = selectedCategory === 'All' || clause.category === selectedCategory;
    const matchesSearch =
      clause.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.plainLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clause.sourceText.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by clause title, section (e.g. 8.2), or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1 shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* Clauses List */}
      <div className="space-y-4">
        {filteredClauses.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/30 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-sm">No clauses matching your filter criteria.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-2 text-xs text-indigo-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredClauses.map((clause) => {
            const isHighlighted = highlightedSection && clause.section.toLowerCase() === highlightedSection.toLowerCase();
            const isExpanded = expandedOriginal[clause.id];

            return (
              <div
                key={clause.id}
                ref={(el) => { clauseRefs.current[clause.id] = el; }}
                className={`p-6 rounded-2xl transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-slate-900 border-2 border-amber-400 shadow-xl shadow-amber-500/15 ring-2 ring-amber-400/20'
                    : 'bg-slate-900/60 border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 text-amber-300 font-mono text-xs font-bold border border-slate-700">
                      {clause.section}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {clause.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                      {clause.category}
                    </span>
                    {clause.reviewReason && (
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-medium border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        Needs Clarification
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="mt-4 space-y-4">
                  
                  {/* Plain Language Explanation */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Plain-Language Explanation
                    </h4>
                    <p className="text-sm text-slate-200 leading-relaxed font-sans">
                      {clause.plainLanguage}
                    </p>
                  </div>

                  {/* What this requires (Obligations) */}
                  {clause.obligations && clause.obligations.length > 0 && (
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/60">
                      <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        What This Requires
                      </h4>
                      <ul className="space-y-1">
                        {clause.obligations.map((ob, i) => (
                          <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">&bull;</span>
                            <span>{ob}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Things worth understanding / Review reason */}
                  {clause.reviewReason && (
                    <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/30">
                      <h4 className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                        Things Worth Understanding
                      </h4>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {clause.reviewReason}
                      </p>
                    </div>
                  )}

                  {/* Questions you may want to ask */}
                  {clause.questionsToConsider && clause.questionsToConsider.length > 0 && (
                    <div className="p-3 bg-indigo-950/20 rounded-xl border border-indigo-500/20">
                      <h4 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        Questions You May Want to Ask
                      </h4>
                      <ul className="space-y-1">
                        {clause.questionsToConsider.map((q, i) => (
                          <li key={i} className="text-xs text-indigo-200/80 flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">?</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Original Text Expandable Accordion */}
                  <div className="pt-2">
                    <button
                      onClick={() => toggleOriginal(clause.id)}
                      className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isExpanded ? 'Hide' : 'View'} Original Contract Text</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-2.5 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-serif text-slate-300 leading-relaxed italic animate-in fade-in duration-150">
                        &ldquo;{clause.sourceText}&rdquo;
                      </div>
                    )}
                  </div>

                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
