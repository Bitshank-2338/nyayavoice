export interface SpeechToTextResult {
  transcript: string;
  isFinal: boolean;
  languageDetected?: 'en' | 'hi' | 'hinglish';
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
      language?: 'en' | 'hi' | 'hinglish';
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
