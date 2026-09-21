'use client';

import { SpeechToTextProvider, TextToSpeechProvider, SpeechToTextResult } from './types';

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

  public setLanguage(lang: 'en' | 'hi' | 'hinglish') {
    if (this.recognition) {
      if (lang === 'hi') {
        this.recognition.lang = 'hi-IN';
      } else {
        this.recognition.lang = 'en-IN';
      }
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
      const isHindiOrHinglish = /[\u0900-\u097F]|kya|hai|kitna|batao|samjhao|kaise|mein|isme/i.test(text);

      onResult({
        transcript: text,
        isFinal: Boolean(finalTranscript),
        languageDetected: isHindiOrHinglish ? 'hinglish' : 'en',
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
      language?: 'en' | 'hi' | 'hinglish';
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
    }
  ) {
    if (!this.synth) {
      options?.onError?.('Speech synthesis not supported');
      return;
    }

    // Cancel any previous speech immediately
    this.stop();

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
    const isHindiOrHinglish = options?.language === 'hi' || options?.language === 'hinglish';

    if (isHindiOrHinglish) {
      const hindiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.lang.includes('IN'));
      if (hindiVoice) utterance.voice = hindiVoice;
      utterance.lang = hindiVoice?.lang || 'hi-IN';
    } else {
      const indianEnglish = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india'));
      const englishVoice = indianEnglish || voices.find(v => v.lang.startsWith('en'));
      if (englishVoice) utterance.voice = englishVoice;
      utterance.lang = englishVoice?.lang || 'en-IN';
    }

    utterance.rate = options?.rate || 1.0;
    utterance.pitch = options?.pitch || 1.0;

    utterance.onstart = () => {
      this.speaking = true;
      options?.onStart?.();
    };

    utterance.onend = () => {
      this.speaking = false;
      this.currentUtterance = null;
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.speaking = false;
      this.currentUtterance = null;
      // Speech cancel is not an error
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        options?.onError?.(e);
      }
    };

    this.synth.speak(utterance);
  }

  public stop() {
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
