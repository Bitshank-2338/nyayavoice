'use client';

import React, { useState, useEffect } from 'react';
import { GitCompare, ArrowRight, CheckCircle2, AlertTriangle, AlertCircle, FileText, Sparkles } from 'lucide-react';
import { DocumentAnalysis, ContractComparison as ComparisonType } from '@/types/document';
import { SAMPLE_DOCUMENTS } from '@/lib/documents/sample-documents';

interface ContractComparisonProps {
  currentDocument: DocumentAnalysis;
}

export const ContractComparison: React.FC<ContractComparisonProps> = ({
  currentDocument,
}) => {
  const [selectedDocBId, setSelectedDocBId] = useState<string>('sample-employment-2');
  const [comparison, setComparison] = useState<ComparisonType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    runComparison();
  }, [selectedDocBId, currentDocument]);

  const runComparison = async () => {
    setLoading(true);
    try {
      const docB = SAMPLE_DOCUMENTS.find(d => d.id === selectedDocBId)?.precomputedAnalysis;
      if (!docB) return;

      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docA: currentDocument,
          docB,
        }),
      });

      const data = await res.json();
      if (data.success && data.comparison) {
        setComparison(data.comparison);
      }
    } catch (err) {
      console.error('Comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'favorable':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/30">Favorable to You</span>;
      case 'unfavorable':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 font-semibold border border-rose-500/30">Unfavorable to You</span>;
      case 'critical':
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30">Critical Change</span>;
      default:
        return <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">Neutral / Clarification</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-400" />
            <span>Semantic Contract Comparison</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Compare terms semantically rather than raw text diffs (notice period, IP scope, non-compete, salary).
          </p>
        </div>

        {/* Compare Target Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Compare Against:</span>
          <select
            aria-label="Document to compare against"
            value={selectedDocBId}
            onChange={(e) => setSelectedDocBId(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {SAMPLE_DOCUMENTS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800 space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Performing semantic clause comparison...</p>
        </div>
      ) : comparison ? (
        <div className="space-y-6">
          
          {/* Executive Summary Card */}
          <div className="p-5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Executive Comparison Summary
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {comparison.summary}
            </p>
          </div>

          {/* Semantic Comparison Items List */}
          <div className="space-y-4">
            {comparison.comparisons.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition space-y-4"
              >
                {/* Topic Header & Impact */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{item.category}</span>
                    <h3 className="text-base font-bold text-white">{item.topic}</h3>
                  </div>
                  {getImpactBadge(item.impact)}
                </div>

                {/* Side-by-Side Clauses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Version A */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-400">
                        {comparison.titleA} ({item.versionA.section})
                      </span>
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="text-sm font-bold text-slate-100">{item.versionA.summary}</div>
                    <p className="text-xs text-slate-400 font-serif italic line-clamp-3">
                      &ldquo;{item.versionA.text}&rdquo;
                    </p>
                  </div>

                  {/* Version B */}
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400">
                        {comparison.titleB} ({item.versionB.section})
                      </span>
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="text-sm font-bold text-slate-100">{item.versionB.summary}</div>
                    <p className="text-xs text-slate-400 font-serif italic line-clamp-3">
                      &ldquo;{item.versionB.text}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Meaningful Change Breakdown */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="text-xs font-semibold text-amber-300">Meaningful Change:</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.meaningfulChange}</p>
                  {item.recommendation && (
                    <div className="text-xs text-slate-400 pt-1">
                      <span className="text-indigo-400 font-medium">Recommendation: </span>
                      {item.recommendation}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      ) : null}

    </div>
  );
};
