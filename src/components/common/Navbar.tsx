'use client';

import React from 'react';
import { Scale, PhoneCall, FileText } from 'lucide-react';
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
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#ece7f2] bg-white/80 backdrop-blur-xl" role="banner">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button type="button" className="flex items-center gap-3" onClick={onSelectNewDocument} aria-label="LawAI home, NyayaVoice">
          <span className="w-10 h-10 rounded-2xl bg-[#161616] text-white flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </span>
          <span className="text-left">
            <span className="block text-lg font-semibold tracking-tight text-[#161616]">LawAI</span>
            <span className="block text-[11px] text-[#5e595d]">NyayaVoice</span>
          </span>
        </button>

        {document && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f6f4fb] text-xs text-[#5e595d]">
            <FileText className="w-3.5 h-3.5 text-[#4451c7]" />
            <span className="text-[#161616] font-medium truncate max-w-xs">{document.title}</span>
            <span>{document.clauses.length} clauses</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {document && (
            <button
              type="button"
              onClick={onSelectNewDocument}
              className="text-xs font-medium text-[#5e595d] hover:text-[#161616] px-3 py-2 rounded-full hover:bg-[#f6f4fb]"
            >
              Switch
            </button>
          )}
          {document ? (
            <button
              type="button"
              onClick={onOpenCall}
              className="px-4 py-2 rounded-full bg-[#161616] text-white text-xs font-semibold flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              Start call
            </button>
          ) : (
            <span className="text-xs text-[#5e595d] px-3 py-1 rounded-full bg-[#f6f4fb]">Personal legal companion</span>
          )}
        </div>
      </div>
    </header>
  );
};
