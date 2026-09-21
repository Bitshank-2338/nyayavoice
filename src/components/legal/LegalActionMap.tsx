'use client';

import React, { useState } from 'react';
import { User, Building, ArrowRight, HelpCircle, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { DocumentAnalysis } from '@/types/document';

interface LegalActionMapProps {
  document: DocumentAnalysis;
  onSelectClause: (section: string) => void;
}

export const LegalActionMap: React.FC<LegalActionMapProps> = ({
  document,
  onSelectClause,
}) => {
  const [selectedParty, setSelectedParty] = useState<'user' | 'otherParty'>('user');

  const userPartyName = document.parties[1]?.name || 'You (Employee / Contractor)';
  const companyPartyName = document.parties[0]?.name || 'Company / Counterparty';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Legal Action Map</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Interactive Relationship Tree
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual tree of contractual commitments, conditional dependencies, and questions to verify.
          </p>
        </div>

        {/* Party Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedParty('user')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              selectedParty === 'user'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>YOU ({document.userObligations.length})</span>
          </button>

          <button
            onClick={() => setSelectedParty('otherParty')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
              selectedParty === 'otherParty'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>COMPANY ({document.otherPartyObligations.length})</span>
          </button>
        </div>
      </div>

      {/* Visual Tree Display */}
      <div className="p-8 rounded-3xl bg-slate-950/60 border border-slate-800/80 font-mono text-xs">
        
        {/* Root Node */}
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 text-indigo-200 font-bold text-sm shadow-lg shadow-indigo-950/30 mb-6">
          {selectedParty === 'user' ? (
            <>
              <User className="w-4 h-4 text-emerald-400" />
              <span>{userPartyName.toUpperCase()} — YOUR CONTRACTUAL COMMITMENTS</span>
            </>
          ) : (
            <>
              <Building className="w-4 h-4 text-amber-400" />
              <span>{companyPartyName.toUpperCase()} — COUNTERPARTY OBLIGATIONS</span>
            </>
          )}
        </div>

        {/* Tree Branches */}
        <div className="space-y-6 pl-4 border-l-2 border-slate-800 ml-5">
          {selectedParty === 'user' ? (
            <>
              {document.userObligations.map((ob, idx) => {
                const section = ob.section || 'General';
                // Check if there are associated questions or ambiguities
                const relatedAmbiguity = document.potentialAmbiguities.find(a => a.section === section);
                const relatedQuestion = document.questionsForProfessional.find(q => q.relevantSection === section);

                return (
                  <div key={ob.id || idx} className="relative group">
                    {/* Horizontal Connector Line */}
                    <div className="absolute -left-4 top-4 w-4 h-0.5 bg-slate-800 group-hover:bg-indigo-500 transition" />

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 group-hover:border-indigo-500/50 transition">
                      
                      {/* Main Obligation Line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start gap-2 font-sans text-sm text-slate-200">
                          <span className="text-indigo-400 font-bold mt-0.5">&bull;</span>
                          <span>{ob.text}</span>
                        </div>

                        {ob.section && (
                          <button
                            onClick={() => onSelectClause(ob.section!)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-slate-700 transition shrink-0 self-start sm:self-auto"
                            title="Jump to source clause"
                          >
                            <span>{ob.section}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Sub-branch: Potential Ambiguity / Attention Item */}
                      {relatedAmbiguity && (
                        <div className="mt-3 ml-4 pl-3 border-l-2 border-amber-500/40 space-y-1 font-sans">
                          <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                            <span>Potential Ambiguity: {relatedAmbiguity.issue}</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {relatedAmbiguity.whyItMatters}
                          </p>
                        </div>
                      )}

                      {/* Sub-branch: Question to Consider */}
                      {relatedQuestion && (
                        <div className="mt-2 ml-4 pl-3 border-l-2 border-indigo-500/40 space-y-1 font-sans">
                          <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold">
                            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Question for Review: {relatedQuestion.question}</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <>
              {document.otherPartyObligations.map((ob, idx) => (
                <div key={ob.id || idx} className="relative group">
                  <div className="absolute -left-4 top-4 w-4 h-0.5 bg-slate-800 group-hover:bg-amber-500 transition" />

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 group-hover:border-amber-500/50 transition">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-2 font-sans text-sm text-slate-200">
                        <span className="text-amber-400 font-bold mt-0.5">&bull;</span>
                        <span>{ob.text}</span>
                      </div>

                      {ob.section && (
                        <button
                          onClick={() => onSelectClause(ob.section!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-slate-700 transition shrink-0 self-start sm:self-auto"
                        >
                          <span>{ob.section}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

      </div>

    </div>
  );
};
