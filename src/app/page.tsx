'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/common/Navbar';
import { DocumentUpload } from '@/components/document/DocumentUpload';
import { DocumentWorkspace } from '@/components/document/DocumentWorkspace';
import { ConversationTurn, DocumentAnalysis } from '@/types/document';
import { SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS } from '@/lib/documents/sample-documents';
import { notificationsForDocument } from '@/lib/account/notifications';
import { clearSession, loadSession, NyayaSession, saveSession } from '@/lib/session/session-store';
import { Scale, ArrowRight } from 'lucide-react';

export default function Home() {
  const [hydrated, setHydrated] = useState(false);
  const [activeDocument, setActiveDocument] = useState<DocumentAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [highlightedSection, setHighlightedSection] = useState<string | undefined>('Section 8.2');
  const [conversation, setConversation] = useState<ConversationTurn[]>([]);
  const [isCallOpen, setIsCallOpen] = useState(false);
  const [accountNote, setAccountNote] = useState('');
  const [mounted, setMounted] = useState(false);
  const lastCloudSave = useRef('');
  const router = useRouter();
  const { status } = useSession();
  const notifications = useMemo(
    () => notificationsForDocument(activeDocument, conversation),
    [activeDocument, conversation],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === 'unauthenticated') router.replace('/signin');
  }, [mounted, status, router]);

  useEffect(() => {
    const saved = loadSession();
    if (saved) {
      setActiveDocument(saved.document);
      setActiveTab(saved.activeTab);
      setHighlightedSection(saved.highlightedSection);
      setConversation(saved.conversation);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!activeDocument) {
      clearSession();
      return;
    }
    saveSession({
      document: activeDocument,
      activeTab,
      highlightedSection,
      conversation,
    });
  }, [hydrated, activeDocument, activeTab, highlightedSection, conversation]);

  useEffect(() => {
    if (!hydrated || !activeDocument || status !== 'authenticated') return;
    const fingerprint = `${activeDocument.documentId}|${activeTab}|${highlightedSection || ''}|${conversation.length}|${conversation[conversation.length - 1]?.text || ''}`;
    if (lastCloudSave.current === fingerprint) return;
    lastCloudSave.current = fingerprint;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          version: 1,
          document: activeDocument,
          activeTab,
          highlightedSection,
          conversation,
          savedAt: new Date().toISOString(),
        } satisfies NyayaSession),
      })
        .then(async (res) => {
          if (!res.ok) return;
          const data = (await res.json()) as { persisted?: string };
          setAccountNote(
            data.persisted === 'cloud'
              ? 'Saved to your Google account.'
              : 'Saved on this server for your signed-in account.',
          );
        })
        .catch(() => undefined);
    }, 900);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [hydrated, status, activeDocument, activeTab, highlightedSection, conversation]);

  const openHistoryItem = async (id: string) => {
    const res = await fetch(`/api/history?id=${encodeURIComponent(id)}`);
    if (!res.ok) return;
    const data = (await res.json()) as { item?: NyayaSession };
    if (!data.item?.document) return;
    setActiveDocument(data.item.document);
    setActiveTab(data.item.activeTab || 'overview');
    setHighlightedSection(data.item.highlightedSection);
    setConversation(data.item.conversation || []);
    setAccountNote('Opened a document from your account history.');
  };

  const startFreshDocument = (document: DocumentAnalysis) => {
    setConversation([]);
    setActiveTab('overview');
    setHighlightedSection(document.clauses[0]?.section);
    setActiveDocument(document);
  };

  // Load sample on 1-click
  const handleLoadSample = () => {
    startFreshDocument(SAMPLE_EMPLOYMENT_AGREEMENT_ANALYSIS);
  };

  if (!mounted || status !== 'authenticated') {
    return (
      <main id="main" className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-[#5e595d]">Taking you to sign in…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-[#161616] flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        document={activeDocument}
        onOpenCall={() => setIsCallOpen(true)}
        onSelectNewDocument={() => {
          setConversation([]);
          setActiveDocument(null);
        }}
        notifications={notifications}
        onOpenHistoryItem={openHistoryItem}
        onOpenTab={setActiveTab}
      />
      {accountNote && (
        <p role="status" className="max-w-6xl mx-auto px-4 sm:px-6 pt-3 text-xs text-[#4451c7]">
          {accountNote}
        </p>
      )}

      <main id="main" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {!hydrated ? (
          <p className="text-sm text-slate-400">Restoring your last session…</p>
        ) : activeDocument ? (
          <DocumentWorkspace
            document={activeDocument}
            onOpenCall={() => setIsCallOpen(true)}
            isCallOpen={isCallOpen}
            onCloseCall={() => setIsCallOpen(false)}
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            highlightedSection={highlightedSection}
            onHighlightedSectionChange={setHighlightedSection}
            conversation={conversation}
            onConversationTurns={(turns) => setConversation((prev) => [...prev, ...turns].slice(-40))}
          />
        ) : (
          <div className="space-y-16">
            
            {/* Hero Section */}
            <div className="max-w-3xl mx-auto text-center space-y-6 pt-6">
              <p className="text-4xl sm:text-6xl font-light italic text-[#6b4c78]">AI-Powered</p>
              <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-[#161616] leading-[1.05]">
                Legal advice at your fingertips
              </h1>
              <p className="text-base text-[#5e595d] max-w-xl mx-auto">
                A personal legal companion for agreements, notices, and contracts. Ask in English, Hindi, Hinglish, Tamil, Telugu, or Bengali.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-6 py-3 rounded-full bg-white border border-[#ece7f2] shadow-sm text-sm font-semibold text-[#161616] inline-flex items-center gap-2"
                >
                  <Scale className="w-4 h-4 text-[#4451c7]" />
                  Lets Start
                  <ArrowRight className="w-4 h-4" />
                </button>
                <a href="#upload-zone" className="text-sm font-medium text-[#4451c7]">
                  Or upload your own document
                </a>
              </div>
            </div>

            {/* Document Upload & Sample Selector Zone */}
            <div id="upload-zone" className="pt-4">
              <DocumentUpload onDocumentLoaded={(doc) => startFreshDocument(doc)} />
            </div>

            {/* Supported Document Types Showcase */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { title: 'Employment', desc: 'Notice, IP, non-compete' },
                { title: 'Rental', desc: 'Deposit, lock-in, escalation' },
                { title: 'NDA', desc: 'Confidentiality and exclusions' },
                { title: 'Freelance', desc: 'Deliverables and ownership' },
                { title: 'Policies', desc: 'Arbitration and privacy' },
                { title: 'Notices', desc: 'Deadlines and next steps' },
              ].map((item) => (
                <div key={item.title} className="p-4 rounded-3xl bg-white border border-[#ece7f2] text-left">
                  <h4 className="text-sm font-semibold text-[#161616]">{item.title}</h4>
                  <p className="text-xs text-[#5e595d] mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-[#5e595d]">
              NyayaVoice explains documents. It is not a substitute for a lawyer.
            </p>

          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#5e595d]">
        LawAI by NyayaVoice · legal information, not legal advice. Use Tab to move and Enter to activate. A skip link is the first control on the page.
      </footer>

    </div>
  );
}
