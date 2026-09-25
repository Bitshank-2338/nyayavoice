'use client';

import React, { useState } from 'react';
import { Send, Sparkles, Bookmark, CheckCircle, HelpCircle, PhoneCall, Globe, AlertCircle } from 'lucide-react';
import { ConversationTurn, DocumentAnalysis, GroundedAnswer } from '@/types/document';

interface DocumentQAProps {
  document: DocumentAnalysis;
  conversation?: ConversationTurn[];
  onConversationTurns?: (turns: ConversationTurn[]) => void;
  onOpenCall: () => void;
  onSelectClause: (section: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  groundedAnswer?: GroundedAnswer;
  timestamp: string;
}

export const DocumentQA: React.FC<DocumentQAProps> = ({
  document,
  conversation = [],
  onConversationTurns,
  onOpenCall,
  onSelectClause,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'ai',
      text: `Namaste. I have analyzed your ${document.documentType}. Ask in English, Hindi, Hinglish, Tamil, Telugu, or Bengali. Answers stay tied to clauses in this document.`,
      timestamp: 'Just now',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const userQ = inputQuestion.trim();
    setInputQuestion('');

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: userQ,
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, newMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQ,
          analysis: document,
          history: conversation,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        const answer: GroundedAnswer = data.answer;
        onConversationTurns?.([
          { id: `qa_u_${Date.now()}`, role: 'user', text: userQ },
          {
            id: `qa_a_${Date.now()}`,
            role: 'assistant',
            text: answer.shortAnswer,
            section: answer.sourceClauses[0]?.section,
          },
        ]);
        setMessages(prev => [
          ...prev,
          {
            id: `msg_${Date.now() + 1}`,
            sender: 'ai',
            text: answer.shortAnswer + '\n\n' + answer.explanation,
            groundedAnswer: answer,
            timestamp: 'Just now',
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (prompt: string) => {
    setInputQuestion(prompt);
  };

  return (
    <div className="flex flex-col h-[760px] bg-slate-900/60 rounded-3xl border border-slate-800 overflow-hidden animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Document-Grounded Q&amp;A</h3>
            <p className="text-[11px] text-slate-400">
              Strictly grounded answers with exact section citations and distinction of facts vs inference.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCall}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Switch to Voice Call</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-5 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20 text-sm'
                  : 'bg-slate-950/80 border border-slate-800 text-slate-100 rounded-bl-none shadow-md space-y-3 text-sm'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed font-sans">
                {msg.text}
              </div>

              {/* Grounded Citation Box (if AI response) */}
              {msg.groundedAnswer && msg.groundedAnswer.sourceClauses.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                      GROUNDED CITATIONS
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/20">
                      Confidence: {msg.groundedAnswer.confidence}
                    </span>
                  </div>

                  {msg.groundedAnswer.sourceClauses.map((sc, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => onSelectClause(sc.section)}
                          className="font-bold text-amber-300 hover:underline flex items-center gap-1"
                        >
                          {sc.section} — {sc.title}
                        </button>
                      </div>
                      <p className="text-slate-400 font-serif italic line-clamp-3">
                        &ldquo;{sc.snippet}&rdquo;
                      </p>
                    </div>
                  ))}

                  {/* Fact vs Inference Distinction */}
                  {msg.groundedAnswer.distinction && (
                    <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800 text-[11px] space-y-1">
                      {msg.groundedAnswer.distinction.explicitlyStated && (
                        <p className="text-slate-300">
                          <span className="text-emerald-400 font-semibold">Explicitly Stated: </span>
                          {msg.groundedAnswer.distinction.explicitlyStated}
                        </p>
                      )}
                      {msg.groundedAnswer.distinction.inference && (
                        <p className="text-slate-300">
                          <span className="text-amber-400 font-semibold">Inference: </span>
                          {msg.groundedAnswer.distinction.inference}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Things to verify */}
                  {msg.groundedAnswer.thingsToVerify && msg.groundedAnswer.thingsToVerify.length > 0 && (
                    <div className="text-[11px] text-slate-400 pt-1">
                      <span className="text-indigo-400 font-semibold">Things to verify: </span>
                      {msg.groundedAnswer.thingsToVerify.join(' ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-4 bg-slate-950/60 rounded-2xl border border-slate-800 w-fit text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Reviewing clauses and synthesizing grounded response...</span>
          </div>
        )}
      </div>

      {/* Preset Suggestions */}
      <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 shrink-0">Try asking:</span>
        <button
          onClick={() => handleSuggestion('Can I continue working on my personal open-source projects?')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition"
        >
          &quot;Can I work on personal open-source projects?&quot;
        </button>
        <button
          onClick={() => handleSuggestion('Isme notice period kitna hai aur kya buyout allowed hai?')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 whitespace-nowrap transition"
        >
          &quot;Isme notice period kitna hai? (Hinglish)&quot;
        </button>
        <button
          onClick={() => handleSuggestion('Is the non-compete clause enforceable in India?')}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap transition"
        >
          &quot;Is the non-compete enforceable?&quot;
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-3">
        <label htmlFor="nyaya-question" className="sr-only">Ask a question about this document</label>
        <input
          id="nyaya-question"
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="Ask in English, Hindi, Hinglish, Tamil, Telugu, or Bengali..."
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          aria-label="Send question"
          disabled={!inputQuestion.trim() || loading}
          className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
};
