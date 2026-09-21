'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/common/Navbar';
import { DocumentUpload } from '@/components/document/DocumentUpload';
import { DocumentWorkspace } from '@/components/document/DocumentWorkspace';
import { DocumentAnalysis } from '@/types/document';
import { SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS } from '@/lib/documents/sample-documents';
import { Scale, PhoneCall, Sparkles, Shield, ArrowRight, CheckCircle, FileText, Globe2, BookOpen } from 'lucide-react';

export default function Home() {
  const [activeDocument, setActiveDocument] = useState<DocumentAnalysis | null>(null);
  const [isCallOpen, setIsCallOpen] = useState(false);

  // Load sample on 1-click
  const handleLoadSample = () => {
    setActiveDocument(SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        document={activeDocument}
        onOpenCall={() => setIsCallOpen(true)}
        onSelectNewDocument={() => setActiveDocument(null)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeDocument ? (
          <DocumentWorkspace
            document={activeDocument}
            onOpenCall={() => setIsCallOpen(true)}
            isCallOpen={isCallOpen}
            onCloseCall={() => setIsCallOpen(false)}
          />
        ) : (
          <div className="space-y-16">
            
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-6 pt-4 sm:pt-8 animate-in fade-in duration-500">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>India-First Multilingual AI Legal Assistant</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Understand legal documents by{' '}
                <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                  talking to them.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl mx-auto">
                Upload an agreement, policy, notice or contract and have a natural conversation about what it means, what matters, and what you may want to ask next.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleLoadSample}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Start Legal Call (Live Demo)</span>
                </button>

                <a
                  href="#upload-zone"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-800 flex items-center justify-center gap-2 transition"
                >
                  <span>Analyze Your Own Document</span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </a>
              </div>

              {/* Supported Languages Pill */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                <Globe2 className="w-4 h-4 text-indigo-400" />
                <span>Conversational in <strong>English</strong>, <strong>Hindi</strong>, &amp; <strong>Hinglish</strong> (&ldquo;Isme notice period kitna hai?&rdquo;)</span>
              </div>

            </div>

            {/* Document Upload & Sample Selector Zone */}
            <div id="upload-zone" className="pt-4">
              <DocumentUpload onDocumentLoaded={(doc) => setActiveDocument(doc)} />
            </div>

            {/* Supported Document Types Showcase */}
            <div className="pt-8 border-t border-slate-900">
              <div className="text-center mb-8">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Specialized for Indian Legal Contexts &amp; Common Contracts
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { title: 'Employment Contracts', desc: 'Notice periods, IP, non-compete' },
                  { title: 'Rental Agreements', desc: 'Deposit returns, lock-in, escalation' },
                  { title: 'Mutual NDAs', desc: 'Confidentiality terms & exclusions' },
                  { title: 'Freelance & SOWs', desc: 'Deliverables, milestones, IP ownership' },
                  { title: 'Terms & Policies', desc: 'Arbitration, waivers, data privacy' },
                  { title: 'Legal Notices', desc: 'Deadlines, liabilities, action items' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 text-center space-y-1">
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Philosophy & Legal Safety Footer Note */}
            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center max-w-3xl mx-auto space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Our Core Philosophy</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Document &rarr; Evidence &rarr; Understanding &rarr; Conversation &rarr; Action &rarr; Professional Handoff
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                NyayaVoice helps you understand legal information and prepare for professional conversations. It is not a substitute for qualified legal advice.
              </p>
            </div>

          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">NyayaVoice</span>
            <span>&bull;</span>
            <span>Real-time Multilingual Legal Information Assistant</span>
          </div>
          <div>
            Built with Next.js 16, TypeScript, &amp; Pluggable Voice Intelligence
          </div>
        </div>
      </footer>

    </div>
  );
}
