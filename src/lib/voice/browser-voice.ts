'use client';

import { SpeechToTextProvider, TextToSpeechProvider, SpeechToTextResult } from './types';
import { detectSpokenLanguage, speechLocale, SpokenLanguage } from '@/lib/i18n/languages';

// Browser Web Speech Recognition implementation
export class BrowserSpeechToText implements SpeechToTextProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;
  private listening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        // en-IN recognizes both English and code-mixed Indian phrasing well in Chrome
        this.recognition.lang = 'en-IN';
      }
    }
  }

  public isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public setLanguage(lang: SpokenLanguage) {
    if (this.recognition) {
      this.recognition.lang = speechLocale(lang);
    }
  }

  public startListening(
    onResult: (result: SpeechToTextResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ) {
    if (!this.recognition) {
      onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (this.listening) return;

    this.listening = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const text = finalTranscript || interimTranscript;

      onResult({
        transcript: text,
        isFinal: Boolean(finalTranscript),
        languageDetected: detectSpokenLanguage(text),
      });
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      // Ignore normal aborts
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      onError?.(event.error || 'Speech recognition error');
    };

    this.recognition.onend = () => {
      this.listening = false;
      onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
    }
  }

  public stopListening() {
    if (this.recognition && this.listening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.warn('Speech recognition stop error:', err);
      }
      this.listening = false;
    }
  }

  public isListening(): boolean {
    return this.listening;
  }
}

// Browser Web Speech Synthesis implementation
export class BrowserTextToSpeech implements TextToSpeechProvider {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speaking: boolean = false;
  private speakGeneration = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public isSupported(): boolean {
    return Boolean(this.synth);
  }

  public speak(
    text: string,
    options?: {
      language?: SpokenLanguage;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ) {
    if (!this.synth) {
      options?.onError?.('Speech synthesis not supported');
      options?.onEnd?.();
      return;
    }

    this.stop();
    const generation = this.speakGeneration;

    // Clean text of markdown asterisks or citations
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/\[\^?\d+\]/g, '')
      .replace(/Section\s+(\d+(\.\d+)*)/gi, 'Section $1')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance = utterance;

    // Select suitable voice
    const voices = this.synth.getVoices();
    const locale = speechLocale(options?.language || 'en');
    const prefix = locale.slice(0, 2);
    const matched =
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ||
      voices.find((v) => v.lang === 'en-IN' || v.name.toLowerCase().includes('india')) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (matched) utterance.voice = matched;
    utterance.lang = matched?.lang || locale;

    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;

    utterance.onstart = () => {
      this.speaking = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      if (generation !== this.speakGeneration) return;
      this.speaking = false;
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      if (generation !== this.speakGeneration) return;
      this.speaking = false;
      this.currentUtterance = null;
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        options?.onError?.(e);
      } else {
        options?.onEnd?.();
      }
    };

    this.synth.speak(utterance);
  }

  public stop() {
    this.speakGeneration += 1;
    if (this.synth) {
      this.synth.cancel();
      this.speaking = false;
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? (this.synth.speaking || this.speaking) : false;
  }
}

export const browserSTT = new BrowserSpeechToText();
export const browserTTS = new BrowserTextToSpeech();
