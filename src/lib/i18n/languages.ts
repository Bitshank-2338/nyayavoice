export const SPOKEN_LANGUAGES = ['en', 'hi', 'hinglish', 'ta', 'te', 'bn'] as const;

export type SpokenLanguage = (typeof SPOKEN_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SpokenLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  hinglish: 'Hinglish',
  ta: 'Tamil',
  te: 'Telugu',
  bn: 'Bengali',
};

export function detectSpokenLanguage(question: string): SpokenLanguage {
  if (/[\u0B80-\u0BFF]/.test(question)) return 'ta';
  if (/[\u0C00-\u0C7F]/.test(question)) return 'te';
  if (/[\u0980-\u09FF]/.test(question)) return 'bn';
  if (/[\u0900-\u097F]/.test(question)) return 'hi';
  if (
    /kya|hai|kitna|batao|samjhao|kaise|mein|isme|kuch|chahiye|hoga|apne|sakta|hoon/i.test(question) &&
    /[a-z]/i.test(question) &&
    /(kya|hai|kitna|batao|samjhao|kaise|mein|isme|apne|sakta|hoon|kar)/i.test(question)
  ) {
    return 'hinglish';
  }
  return 'en';
}

export function speechLocale(lang: SpokenLanguage): string {
  switch (lang) {
    case 'hi':
      return 'hi-IN';
    case 'ta':
      return 'ta-IN';
    case 'te':
      return 'te-IN';
    case 'bn':
      return 'bn-IN';
    default:
      return 'en-IN';
  }
}

export function regionalLead(lang: SpokenLanguage): string | null {
  if (lang === 'ta') return 'ஆவணத்தின் அடிப்படையில்: ';
  if (lang === 'te') return 'పత్రం ప్రకారం: ';
  if (lang === 'bn') return 'নথি অনুসারে: ';
  return null;
}

export function notFoundCopy(lang: SpokenLanguage, question: string): { shortAnswer: string; explanation: string } {
  if (lang === 'hi' || lang === 'hinglish') {
    return {
      shortAnswer: 'Mujhe ye baat uploaded document mein nahi mili.',
      explanation: `Aapne poocha: "${question}". Document ke analyzed clauses mein is claim ka seedha evidence nahi hai. NyayaVoice document ke bahar assume nahi karta.`,
    };
  }
  if (lang === 'ta') {
    return {
      shortAnswer: 'பதிவேற்றிய ஆவணத்தில் இதைக் காணவில்லை.',
      explanation: `கேள்வி: "${question}". பகுப்பாய்வு செய்யப்பட்ட பிரிவுகளில் இதற்கான நேரடி சான்று இல்லை. NyayaVoice ஆவணத்திற்கு வெளியே உரிமைகளை உருவாக்காது.`,
    };
  }
  if (lang === 'te') {
    return {
      shortAnswer: 'అప్‌లోడ్ చేసిన పత్రంలో ఇది కనిపించలేదు.',
      explanation: `ప్రశ్న: "${question}". విశ్లేషించిన నిబంధనల్లో దీనికి ప్రత్యక్ష ఆధారం లేదు. NyayaVoice పత్రానికి బయట హక్కులను కల్పించదు.`,
    };
  }
  if (lang === 'bn') {
    return {
      shortAnswer: 'আপলোড করা নথিতে এটি পাওয়া যায়নি।',
      explanation: `প্রশ্ন: "${question}"। বিশ্লেষিত ধারায় এর সরাসরি প্রমাণ নেই। NyayaVoice নথির বাইরে কোনো অধিকার তৈরি করে না।`,
    };
  }
  return {
    shortAnswer: "I couldn't find this in the uploaded document.",
    explanation: `Nothing in the analyzed clauses states an answer to: "${question}". NyayaVoice will not invent a contractual right or obligation that is not in the uploaded text.`,
  };
}
