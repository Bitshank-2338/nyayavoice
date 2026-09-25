'use client';

import React, { useState } from 'react';
import { LayoutDashboard, FileText, CheckCircle2, Clock, ShieldCheck, GitCompare, MessageSquare, Briefcase, PhoneCall, Network, Users } from 'lucide-react';
import { ConversationTurn, DocumentAnalysis } from '@/types/document';
import { OverviewTab } from './OverviewTab';
import { ClauseViewer } from './ClauseViewer';
import { TimelineTab } from './TimelineTab';
import { LegalActionMap } from '../legal/LegalActionMap';
import { BeforeISign } from '../legal/BeforeISign';
import { ContractComparison } from '../legal/ContractComparison';
import { DocumentQA } from '../legal/DocumentQA';
import { ProfessionalHandoff } from '../handoff/ProfessionalHandoff';
import { CopilotMode } from '../handoff/CopilotMode';
import { LegalCallModal } from '../voice/LegalCallModal';

interface DocumentWorkspaceProps {
  document: DocumentAnalysis;
  onOpenCall: () => void;
  isCallOpen: boolean;
  onCloseCall: () => void;
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  highlightedSection?: string;
  onHighlightedSectionChange: (section: string) => void;
  conversation: ConversationTurn[];
  onConversationTurns: (turns: ConversationTurn[]) => void;
}

export const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({
  document,
  onOpenCall,
  isCallOpen,
  onCloseCall,
  activeTab,
  onActiveTabChange,
  highlightedSection,
  onHighlightedSectionChange,
  conversation,
  onConversationTurns,
}) => {
  const [isCopilotMode, setIsCopilotMode] = useState(false);
  const setActiveTab = onActiveTabChange;
  const setHighlightedSection = onHighlightedSectionChange;

  const handleSelectClause = (section: string) => {
    setHighlightedSection(section);
    setActiveTab('clauses');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'clauses', label: 'Clauses', icon: FileText, count: document.clauses.length },
    { id: 'action-map', label: 'Action Map', icon: Network },
    { id: 'timeline', label: 'Timeline', icon: Clock, count: document.importantDates.length },
    { id: 'before-i-sign', label: 'Before I Sign', icon: ShieldCheck, badge: 'High Value' },
    { id: 'compare', label: 'Compare', icon: GitCompare },
    { id: 'ask', label: 'Ask Nyaya', icon: MessageSquare },
    { id: 'handoff', label: 'Professional Handoff', icon: Briefcase },
  ];

  return (
    <div className="space-y-6">
      
      {/* Navigation Tabs Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        <div className="flex items-center gap-1.5 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isCopilotMode;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setIsCopilotMode(false);
                  setActiveTab(item.id);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#161616] text-white'
                    : 'bg-white text-[#5e595d] border border-[#ece7f2]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Start Legal Call Shortcut in Tabs */}
        <button
          onClick={onOpenCall}
          className="shrink-0 px-3.5 py-1.5 rounded-full bg-[#4451c7] text-white text-xs font-bold flex items-center gap-1.5"
        >
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>Legal Call</span>
        </button>
      </div>

      {/* Tab Content Display */}
      <div className="min-h-[600px]">
        {isCopilotMode ? (
          <CopilotMode
            document={document}
            onExitCopilot={() => setIsCopilotMode(false)}
            onSelectClause={handleSelectClause}
          />
        ) : (
          <>
            {activeTab === 'overview' && (
              <OverviewTab
                document={document}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenCall={onOpenCall}
                onHighlightClause={(section) => setHighlightedSection(section)}
              />
            )}

            {activeTab === 'clauses' && (
              <ClauseViewer
                document={document}
                highlightedSection={highlightedSection}
                onOpenCall={onOpenCall}
              />
            )}

            {activeTab === 'action-map' && (
              <LegalActionMap
                document={document}
                onSelectClause={handleSelectClause}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineTab
                document={document}
                onSelectClause={handleSelectClause}
              />
            )}

            {activeTab === 'before-i-sign' && (
              <BeforeISign
                document={document}
                onOpenCall={onOpenCall}
                onSelectClause={handleSelectClause}
                onGenerateHandoff={() => setActiveTab('handoff')}
              />
            )}

            {activeTab === 'compare' && (
              <ContractComparison currentDocument={document} />
            )}

            {activeTab === 'ask' && (
              <DocumentQA
                document={document}
                conversation={conversation}
                onConversationTurns={onConversationTurns}
                onOpenCall={onOpenCall}
                onSelectClause={handleSelectClause}
              />
            )}

            {activeTab === 'handoff' && (
              <ProfessionalHandoff
                document={document}
                conversation={conversation}
                onEnterCopilotMode={() => setIsCopilotMode(true)}
              />
            )}
          </>
        )}
      </div>

      {/* Voice Call Modal */}
      <LegalCallModal
        isOpen={isCallOpen}
        onClose={onCloseCall}
        document={document}
        conversation={conversation}
        onConversationTurns={onConversationTurns}
        onHighlightClause={(section) => {
          setHighlightedSection(section);
        }}
      />

    </div>
  );
};
