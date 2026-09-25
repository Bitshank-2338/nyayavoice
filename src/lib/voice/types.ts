import { SpokenLanguage } from '@/lib/i18n/languages';

export interface SpeechToTextResult {
  transcript: string;
  isFinal: boolean;
  languageDetected?: SpokenLanguage;
  confidence?: number;
}

export interface SpeechToTextProvider {
  startListening: (
    onResult: (result: SpeechToTextResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ) => void;
  stopListening: () => void;
  isListening: () => boolean;
}

export interface TextToSpeechProvider {
  speak: (
    text: string,
    options?: {
      language?: SpokenLanguage;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ) => void;
  stop: () => void;
  isSpeaking: () => boolean;
}

export interface RealtimeVoiceSession {
  sessionId: string;
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted';
  activeClauseId?: string;
  activeSection?: string;
}

/** Future streaming vendors (Sarvam, Rumik, ElevenLabs) should implement this. */
export interface RealtimeVoiceProvider {
  connect: (opts: { language?: SpokenLanguage }) => Promise<void>;
  disconnect: () => Promise<void>;
  sendAudio?: (chunk: ArrayBuffer) => void;
  onTranscript?: (text: string, isFinal: boolean) => void;
}
