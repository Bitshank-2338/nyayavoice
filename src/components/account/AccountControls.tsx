'use client';

import React, { useEffect, useState } from 'react';
import { Bell, History, LogIn, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { AppNotification, SavedDocumentSummary } from '@/lib/account/notifications';

interface AccountControlsProps {
  notifications: AppNotification[];
  onOpenHistoryItem: (id: string) => void;
  onOpenTab?: (tab: string) => void;
}

export function AccountControls({ notifications, onOpenHistoryItem, onOpenTab }: AccountControlsProps) {
  const { data: session, status } = useSession();
  const [googleReady, setGoogleReady] = useState(false);
  const [open, setOpen] = useState<'history' | 'notes' | null>(null);
  const [history, setHistory] = useState<SavedDocumentSummary[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/auth/ready')
      .then((res) => res.json())
      .then((data) => setGoogleReady(Boolean(data.google)))
      .catch(() => setGoogleReady(false));
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem('nyayavoice.notice.read');
    if (raw) setReadIds(JSON.parse(raw) as string[]);
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || open !== 'history') {
      return;
    }
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => setHistory(Array.isArray(data.items) ? data.items : []))
      .catch(() => setHistory([]));
  }, [status, open]);

  const unread = notifications.filter((item) => !readIds.includes(item.id));

  const markRead = (id: string) => {
    const next = Array.from(new Set([...readIds, id]));
    setReadIds(next);
    window.localStorage.setItem('nyayavoice.notice.read', JSON.stringify(next));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-expanded={open === 'notes'}
        aria-label={`Notifications, ${unread.length} unread`}
        onClick={() => setOpen(open === 'notes' ? null : 'notes')}
        className="relative p-2 rounded-full bg-[#f6f4fb] text-[#161616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4451c7]"
      >
        <Bell className="w-4 h-4" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#df3d46] text-white text-[10px] leading-4">
            {unread.length}
          </span>
        )}
      </button>

      <button
        type="button"
        aria-expanded={open === 'history'}
        aria-label="Saved document history"
        onClick={() => setOpen(open === 'history' ? null : 'history')}
        className="p-2 rounded-full bg-[#f6f4fb] text-[#161616] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4451c7]"
      >
        <History className="w-4 h-4" />
      </button>

      {status === 'authenticated' ? (
        <button
          type="button"
          onClick={() => signOut()}
          className="px-3 py-2 rounded-full bg-[#161616] text-white text-xs font-semibold inline-flex items-center gap-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4451c7]"
        >
          {session.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="w-4 h-4 rounded-full" />
          ) : null}
          <span className="max-w-[8rem] truncate">{session.user?.name || 'Account'}</span>
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      ) : (
        <button
          type="button"
          disabled={!googleReady || status === 'loading'}
          onClick={() => signIn('google')}
          title={googleReady ? 'Sign in with Google' : 'Google sign-in is not configured on this server yet'}
          className="px-3 py-2 rounded-full bg-[#4451c7] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#161616]"
        >
          <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
          Sign in with Google
        </button>
      )}

      {open && (
        <div className="absolute right-4 top-16 z-50 w-[min(100vw-2rem,22rem)] rounded-3xl border border-[#ece7f2] bg-white p-4 shadow-xl">
          {open === 'notes' ? (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Important notices</h2>
              {notifications.length === 0 && <p className="text-xs text-[#5e595d]">No notices yet.</p>}
              {notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    markRead(item.id);
                    if (item.hrefTab) onOpenTab?.(item.hrefTab);
                    setOpen(null);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-[#f6f4fb]"
                >
                  <span className="block text-xs font-semibold">{item.title}</span>
                  <span className="block text-xs text-[#5e595d] mt-1">{item.body}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <h2 className="text-sm font-semibold">Your saved documents</h2>
              {status !== 'authenticated' && (
                <p className="text-xs text-[#5e595d]">Sign in with Google to keep a private history of agreements and questions.</p>
              )}
              {status === 'authenticated' && history.length === 0 && (
                <p className="text-xs text-[#5e595d]">Nothing saved yet. Open a document and it will be stored on your account.</p>
              )}
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onOpenHistoryItem(item.id);
                    setOpen(null);
                  }}
                  className="w-full text-left p-3 rounded-2xl bg-[#f6f4fb]"
                >
                  <span className="block text-xs font-semibold">{item.title}</span>
                  <span className="block text-[11px] text-[#5e595d] mt-1">{item.documentType} · {item.clauseCount} clauses</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
