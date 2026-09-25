import { ConversationTurn, DocumentAnalysis } from '@/types/document';

export interface SavedDocumentSummary {
  id: string;
  title: string;
  documentType: string;
  clauseCount: number;
  savedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  level: 'info' | 'important';
  hrefTab?: string;
}

export function notificationsForDocument(document: DocumentAnalysis | null, conversation: ConversationTurn[]): AppNotification[] {
  if (!document) {
    return [{
      id: 'welcome',
      title: 'Sign in to keep your work',
      body: 'Google sign-in saves each agreement, question, and review item to your account.',
      level: 'info',
    }];
  }

  const items: AppNotification[] = [];
  const dates = document.importantDates;
  const dateLimit = Math.min(4, dates.length);
  for (let index = 0; index < dateLimit; index += 1) {
    const date = dates[index];
    items.push({
      id: `date_${index}_${date.label}`,
      title: date.label,
      body: `${date.dateOrPeriod}${date.section ? ` · ${date.section}` : ''}`,
      level: 'important',
      hrefTab: 'timeline',
    });
  }

  const reviews = document.potentialAmbiguities;
  const reviewLimit = Math.min(3, reviews.length);
  for (let index = 0; index < reviewLimit; index += 1) {
    const item = reviews[index];
    items.push({
      id: `review_${index}_${item.section}`,
      title: `Review ${item.section}`,
      body: item.issue,
      level: 'important',
      hrefTab: 'before-i-sign',
    });
  }

  if (conversation.length > 0) {
    let questions = 0;
    for (const turn of conversation) {
      if (turn.role === 'user') questions += 1;
    }
    items.push({
      id: 'chat',
      title: 'Questions saved with this document',
      body: `${questions} question(s) stay in your history.`,
      level: 'info',
      hrefTab: 'ask',
    });
  }

  return items;
}
