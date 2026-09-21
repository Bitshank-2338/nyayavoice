'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff, Volume2, Sparkles, AlertCircle, Bookmark, MessageSquare, Hand } from 'lucide-react';
import { DocumentAnalysis, Clause, GroundedAnswer } from '@/types/document';
import { VoiceOrb } from './VoiceOrb';
import { browserSTT, browserTTS } from '@/lib/voice/browser-voice';

interface LegalCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentAnalysis;
  onHighlightClause?: (section: string) => void;
}

export const LegalCallModal: React.FC<LegalCallModalProps> = ({
  isOpen,
  onClose,
  document,
  onHighlightClause,
}) => {
  const [callState, setCallState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [currentSection, setCurrentSection] = useState<string>('Section 8.2');
  const [currentClause, setCurrentClause] = useState<Clause | null>(null);

  // Transcript state
  const [userTranscript, setUserTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');
  const [latestAnswer, setLatestAnswer] = useState<GroundedAnswer | null>(null);
  const [languageDetected, setLanguageDetected] = useState<'en' | 'hi' | 'hinglish'>('en');

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize on open
  useEffect(() => {
    if (!isOpen) {
      cleanupCall();
      return;
    }

    // Find default initial clause (Section 8.2 or first clause)
    const initial = document.clauses.find(c => c.section.includes('8.2')) || document.clauses[0];
    if (initial) {
      setCurrentClause(initial);
      setCurrentSection(initial.section);
      onHighlightClause?.(initial.section);
    }

    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Initial greeting from NyayaVoice
    const greeting = `Namaste. I am NyayaVoice. I have reviewed your ${document.documentType}. You can speak to me in English, Hindi, or Hinglish. What would you like to understand first?`;
    setAiTranscript(greeting);
    setCallState('speaking');

    browserTTS.speak(greeting, {
      language: 'en',
      onEnd: () => {
        setCallState('listening');
        startListeningForUser();
      },
    });

    return () => {
      cleanupCall();
    };
  }, [isOpen]);

  const cleanupCall = () => {
    browserSTT.stopListening();
    browserTTS.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setCallState('idle');
  };

  const startListeningForUser = () => {
    if (isMuted) return;

    browserSTT.startListening(
      (result) => {
        setUserTranscript(result.transcript);
        if (result.languageDetected) {
          setLanguageDetected(result.languageDetected);
        }

        // If user interrupts while AI is speaking
        if (browserTTS.isSpeaking() && result.transcript.trim().length > 3) {
          handleInterrupt();
        }

        if (result.isFinal && result.transcript.trim().length > 3) {
          handleUserQuery(result.transcript);
        }
      },
      (error) => {
        console.warn('Voice error:', error);
      }
    );
  };

  const handleInterrupt = () => {
    browserTTS.stop();
    setCallState('interrupted');
    setTimeout(() => {
      setCallState('listening');
    }, 300);
  };

  const handleUserQuery = async (queryText: string) => {
    browserSTT.stopListening();
    setCallState('thinking');

    try {
      const res = await fetch('/api/chat/grounded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: queryText,
          analysis: document,
        }),
      });

      const data = await res.json();
      if (data.success && data.answer) {
        const answer: GroundedAnswer = data.answer;
        setLatestAnswer(answer);
        setAiTranscript(answer.shortAnswer + ' ' + answer.explanation);

        // Highlight matching section
        if (answer.sourceClauses.length > 0) {
          const matchedSection = answer.sourceClauses[0].section;
          setCurrentSection(matchedSection);
          const matchedClause = document.clauses.find(c => c.section === matchedSection) || null;
          setCurrentClause(matchedClause);
          onHighlightClause?.(matchedSection);
        }

        // Spoken output
        setCallState('speaking');
        browserTTS.speak(answer.shortAnswer + ' ' + answer.explanation, {
          language: answer.language || languageDetected,
          onEnd: () => {
            setCallState('listening');
            startListeningForUser();
          },
        });
      }
    } catch (err) {
      console.error('Call query error:', err);
      setCallState('listening');
      startListeningForUser();
    }
  };

  // Quick preset suggestions for instant demo clicking
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white tracking-wide text-sm">NYAYAVOICE LEGAL CALL</span>
                <span className="px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Live Grounded Call
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-md">{document.title}</p>
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
              title="Close Call"
            >
              <PhoneOff className="w-5 h-5 text-rose-400" />
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto p-6 gap-6">
          
          {/* Left Column: Voice Orb & Call State */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-2xl border border-slate-800/80">
            <div className="mb-6">
              <VoiceOrb state={callState} size="lg" />
            </div>

            {/* Status indicator */}
            <div className="text-center mb-6">
              <div className="text-xs uppercase tracking-widest font-semibold text-indigo-400 mb-1">
                {callState === 'speaking' && 'NyayaVoice is Speaking...'}
                {callState === 'listening' && (isMuted ? 'Microphone Muted' : 'Listening... Speak naturally in EN/HI')}
                {callState === 'thinking' && 'Analyzing Document Clauses...'}
                {callState === 'interrupted' && 'Call Interrupted'}
              </div>
              <p className="text-xs text-slate-400">
                Currently discussing: <span className="text-amber-300 font-medium">{currentSection}</span>
              </p>
            </div>

            {/* Call Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-full border transition-all ${
                  isMuted
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
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
                title="Interrupt NyayaVoice"
              >
                <Hand className="w-4 h-4" />
                Interrupt
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

            {/* Quick Demo Prompts */}
            <div className="w-full mt-6 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Click to simulate live voice prompt:
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

                <button
                  onClick={() => triggerPresetQuestion('What are my major obligations before signing this contract?')}
                  className="text-left text-xs bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white p-2 rounded-lg border border-slate-700/60 transition flex items-center gap-2"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">&quot;What are my major obligations?&quot;</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Dual Transcripts & Synchronized Grounding */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* User Transcript Card */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-emerald-400" />
                  YOU (USER)
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono uppercase">
                  Language: {languageDetected}
                </span>
              </div>
              <p className="text-sm text-slate-200 min-h-[2.5rem]">
                {userTranscript || <span className="text-slate-500 italic">Listening for your voice... speak now</span>}
              </p>
            </div>

            {/* AI Transcript Card */}
            <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-800/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  NYAYAVOICE TRANSCRIPT
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                  Verified Grounded
                </span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed min-h-[3.5rem]">
                {aiTranscript || <span className="text-slate-500 italic">Waiting for prompt...</span>}
              </p>
            </div>

            {/* Synchronized Clause Highlight Card */}
            <div className="flex-1 p-4 bg-slate-950/40 rounded-xl border border-amber-500/30">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                    SUPPORTING SOURCE CLAUSE: {currentSection}
                  </span>
                </div>
                {latestAnswer && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                    Confidence: {latestAnswer.confidence}
                  </span>
                )}
              </div>

              {currentClause ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{currentClause.title}</h4>
                    <p className="text-slate-300 mt-1">{currentClause.plainLanguage}</p>
                  </div>

                  {currentClause.reviewReason && (
                    <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{currentClause.reviewReason}</span>
                    </div>
                  )}

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">EXACT CLAUSE TEXT:</span>
                    <p className="text-slate-300 font-serif leading-relaxed line-clamp-4 italic">
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

            {/* Safety Disclaimer */}
            <div className="text-[11px] text-slate-500 text-center">
              NyayaVoice provides legal information and document assistance, not legal advice.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
