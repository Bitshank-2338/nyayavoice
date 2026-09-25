'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, AlertCircle, Bookmark, MessageSquare, Hand, Keyboard, UserPlus, UserMinus } from 'lucide-react';
import { ConversationTurn, DocumentAnalysis, Clause, GroundedAnswer } from '@/types/document';
import { VoiceOrb } from './VoiceOrb';
import { browserSTT, browserTTS } from '@/lib/voice/browser-voice';
import { LANGUAGE_LABELS, SpokenLanguage, SPOKEN_LANGUAGES } from '@/lib/i18n/languages';
import { CounselPresence, simulatedCounselRemark } from '@/lib/voice/simulated-lawyer';

interface LegalCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentAnalysis;
  onHighlightClause?: (section: string) => void;
  conversation?: ConversationTurn[];
  onConversationTurns?: (turns: ConversationTurn[]) => void;
}

export const LegalCallModal: React.FC<LegalCallModalProps> = ({
  isOpen,
  onClose,
  document,
  onHighlightClause,
  conversation = [],
  onConversationTurns,
}) => {
  const [callState, setCallState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>('');
  const [currentClause, setCurrentClause] = useState<Clause | null>(null);
  const [userTranscript, setUserTranscript] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');
  const [latestAnswer, setLatestAnswer] = useState<GroundedAnswer | null>(null);
  const [languageDetected, setLanguageDetected] = useState<SpokenLanguage>('en');
  const [listenLanguage, setListenLanguage] = useState<SpokenLanguage>('en');
  const [counsel, setCounsel] = useState<CounselPresence>('away');
  const [counselLine, setCounselLine] = useState('');
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryGen = useRef(0);
  const shouldListen = useRef(false);
  const conversationRef = useRef(conversation);
  conversationRef.current = conversation;

  useEffect(() => {
    if (counsel === 'joined') {
      setCounselLine(simulatedCounselRemark(currentSection));
    }
  }, [counsel, currentSection]);

  useEffect(() => {
    if (!isOpen) {
      cleanupCall();
      return;
    }

    const initial = document.clauses[0] || null;
    if (initial) {
      setCurrentClause(initial);
      setCurrentSection(initial.section);
    }

    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    const greeting = `Namaste. I am NyayaVoice. I have reviewed your ${document.documentType}. You can speak or type in English, Hindi, Hinglish, Tamil, Telugu, or Bengali. What would you like to understand first?`;
    setAiTranscript(greeting);
    setCallState('speaking');

    if (!browserSTT.isSupported()) {
      setVoiceNotice('Live speech recognition is not available in this browser. Type your question below.');
    }

    if (browserTTS.isSupported()) {
      browserTTS.speak(greeting, {
        language: 'en',
        onEnd: () => {
          setCallState('listening');
          startListeningForUser();
        },
      });
    } else {
      setVoiceNotice((prev) => prev || 'Spoken playback is unavailable. Answers will appear as text.');
      setCallState('listening');
    }

    return () => {
      cleanupCall();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const cleanupCall = () => {
    shouldListen.current = false;
    queryGen.current += 1;
    browserSTT.stopListening();
    browserTTS.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setCallState('idle');
  };

  const startListeningForUser = () => {
    if (isMuted || !browserSTT.isSupported()) return;
    shouldListen.current = true;

    browserSTT.setLanguage(listenLanguage);
    browserSTT.startListening(
      (result) => {
        setUserTranscript(result.transcript);
        if (result.languageDetected) setLanguageDetected(result.languageDetected);

        if (browserTTS.isSpeaking() && result.transcript.trim().length > 3) {
          handleInterrupt();
        }

        if (result.isFinal && result.transcript.trim().length > 3) {
          handleUserQuery(result.transcript);
        }
      },
      (error) => {
        if (error === 'not-allowed' || error === 'service-not-allowed') {
          setVoiceNotice('Microphone permission was denied. You can still type questions.');
          shouldListen.current = false;
        }
      },
      () => {
        if (shouldListen.current && !isMuted) {
          startListeningForUser();
        }
      }
    );
  };

  const handleInterrupt = () => {
    queryGen.current += 1;
    browserTTS.stop();
    setCallState('interrupted');
    window.setTimeout(() => {
      setCallState('listening');
      startListeningForUser();
    }, 250);
  };

  const handleUserQuery = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;
    const thisQuery = ++queryGen.current;
    browserSTT.stopListening();
    shouldListen.current = false;
    setCallState('thinking');
    setUserTranscript(trimmed);

    const userTurn: ConversationTurn = {
      id: `call_u_${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    try {
      const res = await fetch('/api/chat/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: trimmed,
          analysis: document,
          history: conversationRef.current,
        }),
      });

      const data = await res.json();
      if (thisQuery !== queryGen.current) return;

      if (data.success && data.answer) {
        const answer: GroundedAnswer = data.answer;
        setLatestAnswer(answer);
        setAiTranscript(answer.shortAnswer + ' ' + answer.explanation);
        setLanguageDetected(answer.language || languageDetected);

        const assistantTurn: ConversationTurn = {
          id: `call_a_${Date.now()}`,
          role: 'assistant',
          text: answer.shortAnswer,
          section: answer.sourceClauses[0]?.section,
        };
        onConversationTurns?.([userTurn, assistantTurn]);

        if (answer.sourceClauses.length > 0) {
          const matchedSection = answer.sourceClauses[0].section;
          setCurrentSection(matchedSection);
          const matchedClause = document.clauses.find((c) => c.section === matchedSection) || null;
          setCurrentClause(matchedClause);
          onHighlightClause?.(matchedSection);
        } else {
          setCurrentClause(null);
          setCurrentSection('');
        }

        setCallState('speaking');
        browserTTS.speak(answer.shortAnswer + ' ' + answer.explanation, {
          language: answer.language || languageDetected,
          onEnd: () => {
            if (thisQuery !== queryGen.current) return;
            setCallState('listening');
            startListeningForUser();
          },
        });
      } else {
        setAiTranscript(data.error || 'I could not complete that question. You can type it instead.');
        setCallState('listening');
        startListeningForUser();
      }
    } catch {
      if (thisQuery !== queryGen.current) return;
      setAiTranscript('Network error while answering. Please try again or type your question.');
      setCallState('listening');
      startListeningForUser();
    }
  };

  const triggerPresetQuestion = (question: string) => {
    handleInterrupt();
    setUserTranscript(question);
    handleUserQuery(question);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      startListeningForUser();
    } else {
      setIsMuted(true);
      shouldListen.current = false;
      browserSTT.stopListening();
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-call-title"
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span id="legal-call-title" className="font-semibold text-white tracking-wide text-sm">NYAYAVOICE LEGAL CALL</span>
                <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline">
                  Live Grounded Call
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{document.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-slate-800 rounded-full text-xs font-mono text-slate-300 border border-slate-700">
              {formatTimer(callDuration)}
            </div>
            <button
              onClick={() => {
                cleanupCall();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
              aria-label="Close call"
            >
              <PhoneOff className="w-5 h-5 text-rose-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto p-4 sm:p-6 gap-6">
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <div className="mb-6">
              <VoiceOrb state={callState} size="lg" />
            </div>

            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-widest font-semibold text-indigo-400 mb-1">
                {callState === 'speaking' && 'NyayaVoice is Speaking...'}
                {callState === 'listening' && (isMuted ? 'Microphone Muted' : 'Listening... Speak or type')}
                {callState === 'thinking' && 'Analyzing Document Clauses...'}
                {callState === 'interrupted' && 'Call Interrupted'}
                {callState === 'idle' && 'Call idle'}
              </div>
              <p className="text-xs text-slate-400">
                Currently discussing: <span className="text-amber-300 font-medium">{currentSection || 'Ask a question'}</span>
              </p>
            </div>

            {voiceNotice && (
              <p className="text-[11px] text-amber-200 bg-amber-950/40 border border-amber-700/40 rounded-lg px-3 py-2 mb-4">
                {voiceNotice}
              </p>
            )}

            <label className="w-full mb-4 text-[11px] text-slate-400 flex items-center justify-between gap-2">
              <span>Listening language</span>
              <select
                aria-label="Listening language"
                value={listenLanguage}
                onChange={(e) => {
                  const next = e.target.value as SpokenLanguage;
                  setListenLanguage(next);
                  browserSTT.setLanguage(next);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
              >
                {SPOKEN_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</option>
                ))}
              </select>
            </label>

            <div className="flex items-center gap-3 flex-wrap justify-center">
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-full border transition-all ${
                  isMuted
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                }`}
                aria-pressed={isMuted}
                aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <button
                onClick={handleInterrupt}
                disabled={callState !== 'speaking'}
                className={`px-4 py-2.5 rounded-full border text-xs font-semibold flex items-center gap-2 transition ${
                  callState === 'speaking'
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300 cursor-pointer animate-pulse'
                    : 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                }`}
                aria-label="Interrupt NyayaVoice"
              >
                <Hand className="w-4 h-4" />
                Interrupt
              </button>

              <button
                onClick={() => {
                  if (counsel === 'joined' || counsel === 'joining') {
                    setCounsel('away');
                    setCounselLine('');
                    return;
                  }
                  setCounsel('joining');
                  window.setTimeout(() => {
                    setCounsel('joined');
                    setCounselLine(simulatedCounselRemark(currentSection));
                  }, 1200);
                }}
                className="px-4 py-2.5 rounded-full border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 text-xs font-semibold flex items-center gap-2"
              >
                {counsel === 'away' ? <UserPlus className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                {counsel === 'away' ? 'Invite counsel' : counsel === 'joining' ? 'Counsel joining…' : 'Counsel leave'}
              </button>

              <button
                onClick={() => {
                  cleanupCall();
                  onClose();
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-semibold text-xs flex items-center gap-2 transition shadow-lg shadow-rose-600/30"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </div>

            <form
              className="w-full mt-5 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!typedQuestion.trim()) return;
                const q = typedQuestion.trim();
                setTypedQuestion('');
                handleUserQuery(q);
              }}
            >
              <div className="relative flex-1">
                <Keyboard className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  aria-label="Type a question if the microphone is unavailable"
                  value={typedQuestion}
                  onChange={(e) => setTypedQuestion(e.target.value)}
                  placeholder="Type if mic is unavailable..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <button type="submit" className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold">
                Ask
              </button>
            </form>

            <div className="w-full mt-6 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Demo prompts (also work as typed questions):
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => triggerPresetQuestion('Can I continue working on my personal open-source projects?')}
                  className="text-left text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700/60 transition flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">&quot;Can I work on personal open-source projects?&quot;</span>
                </button>
                <button
                  onClick={() => triggerPresetQuestion('Isme notice period kitna hai aur buyout ho sakta hai?')}
                  className="text-left text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700/60 transition flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">&quot;Isme notice period kitna hai? (Hinglish)&quot;</span>
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col gap-4 min-w-0">
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  YOU (USER)
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono uppercase">
                  Language: {LANGUAGE_LABELS[languageDetected]}
                </span>
              </div>
              <p className="text-sm text-slate-200 min-h-[2.5rem] break-words" aria-live="polite">
                {userTranscript || <span className="text-slate-500 italic">Listening or waiting for typed input...</span>}
              </p>
            </div>

            {counsel !== 'away' && (
              <div className="p-4 bg-violet-950/30 rounded-xl border border-violet-700/40">
                <div className="text-xs font-semibold text-violet-200 mb-1">COUNSEL (SIMULATED)</div>
                <p className="text-sm text-slate-100">
                  {counsel === 'joining' ? 'Waiting for counsel to join this demo call…' : counselLine}
                </p>
                <p className="text-[11px] text-violet-300/80 mt-2">Simulated participant. Not a lawyer and not legal advice.</p>
              </div>
            )}

            <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  NYAYAVOICE TRANSCRIPT
                </span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed min-h-[3.5rem] break-words" aria-live="polite">
                {aiTranscript || <span className="text-slate-500 italic">Waiting for prompt...</span>}
              </p>
            </div>

            <div className="flex-1 p-4 bg-slate-950/40 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Bookmark className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide truncate">
                    SUPPORTING SOURCE CLAUSE: {currentSection || 'None yet'}
                  </span>
                </div>
                {latestAnswer && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 shrink-0">
                    Confidence: {latestAnswer.confidence}
                  </span>
                )}
              </div>

              {currentClause ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-white text-sm break-words">{currentClause.title}</h4>
                    <p className="text-slate-300 mt-1 break-words">{currentClause.plainLanguage}</p>
                  </div>
                  {currentClause.reviewReason && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{currentClause.reviewReason}</span>
                    </div>
                  )}
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">EXACT CLAUSE TEXT:</span>
                    <p className="text-slate-300 font-serif leading-relaxed line-clamp-4 italic break-words">
                      &ldquo;{currentClause.sourceText}&rdquo;
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No active clause highlighted. Ask a question to view supporting evidence.
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-500 text-center">
              NyayaVoice provides legal information and document assistance, not legal advice.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
