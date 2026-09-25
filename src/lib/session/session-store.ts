import { ConversationTurn, DocumentAnalysis } from '@/types/document';

const STORAGE_KEY = 'nyayavoice.session.v1';

export interface NyayaSession {
  version: 1;
  document: DocumentAnalysis;
  activeTab: string;
  highlightedSection?: string;
  conversation: ConversationTurn[];
  savedAt: string;
}

export function loadSession(): NyayaSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NyayaSession;
    if (parsed.version !== 1 || !parsed.document?.documentId || !parsed.document.title) return null;
    return {
      ...parsed,
      conversation: Array.isArray(parsed.conversation) ? parsed.conversation : [],
      activeTab: parsed.activeTab || 'overview',
    };
  } catch {
    return null;
  }
}

export function saveSession(input: {
  document: DocumentAnalysis;
  activeTab: string;
  highlightedSection?: string;
  conversation: ConversationTurn[];
}) {
  if (typeof window === 'undefined') return;
  const document = { ...input.document };
  delete document.rawText;
  const payload: NyayaSession = {
    version: 1,
    document,
    activeTab: input.activeTab,
    highlightedSection: input.highlightedSection,
    conversation: input.conversation.slice(-40),
    savedAt: new Date().toISOString(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota or private mode: the in-memory workspace still works for this visit.
  }
}

export function clearSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
