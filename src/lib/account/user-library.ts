import { NyayaSession } from '@/lib/session/session-store';
import { SavedDocumentSummary } from '@/lib/account/notifications';

export type { AppNotification, SavedDocumentSummary } from '@/lib/account/notifications';
export { notificationsForDocument } from '@/lib/account/notifications';

const memory = new Map<string, NyayaSession[]>();

function userKey(email: string) {
  return email.trim().toLowerCase();
}

function slim(session: NyayaSession): NyayaSession {
  const document = { ...session.document };
  delete document.rawText;
  return {
    ...session,
    document,
    conversation: session.conversation.slice(-40),
    savedAt: session.savedAt || new Date().toISOString(),
  };
}

function projectId() {
  return process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || '';
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function accessToken() {
  if (process.env.FIRESTORE_ACCESS_TOKEN) return process.env.FIRESTORE_ACCESS_TOKEN;
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  const res = await fetch(
    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
    { headers: { 'Metadata-Flavor': 'Google' } },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;
  const seconds = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  cachedToken = { value: data.access_token, expiresAt: Date.now() + Math.max(60, seconds - 120) * 1000 };
  return data.access_token;
}

function docUrl(email: string, id?: string) {
  const base = `https://firestore.googleapis.com/v1/projects/${projectId()}/databases/(default)/documents/nyayaUsers/${encodeURIComponent(userKey(email))}/documents`;
  return id ? `${base}/${encodeURIComponent(id)}` : base;
}

async function firestoreWrite(email: string, session: NyayaSession) {
  const token = await accessToken();
  if (!token) return false;
  const id = session.document.documentId;
  const body = JSON.stringify({
    fields: {
      payload: { stringValue: JSON.stringify(session) },
      savedAt: { stringValue: session.savedAt },
    },
  });
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const updated = await fetch(`${docUrl(email, id)}?updateMask.fieldPaths=payload&updateMask.fieldPaths=savedAt`, {
    method: 'PATCH',
    headers,
    body,
  });
  if (updated.ok) return true;
  if (updated.status !== 404) return false;
  const created = await fetch(`${docUrl(email)}?documentId=${encodeURIComponent(id)}`, {
    method: 'POST',
    headers,
    body,
  });
  return created.ok;
}

function readPayload(fields: { payload?: { stringValue?: string } } | undefined) {
  const raw = fields?.payload?.stringValue;
  if (!raw) return null;
  return JSON.parse(raw) as NyayaSession;
}

export async function saveUserDocument(email: string, session: NyayaSession): Promise<{ persisted: 'cloud' | 'memory' }> {
  const key = userKey(email);
  const next = slim(session);
  const id = next.document.documentId || `doc_${Date.now()}`;
  next.document.documentId = id;

  const local = memory.get(key) || [];
  const without = local.filter((item) => item.document.documentId !== id);
  memory.set(key, [next, ...without].slice(0, 20));

  if (!projectId()) return { persisted: 'memory' };
  try {
    const ok = await firestoreWrite(email, next);
    return { persisted: ok ? 'cloud' : 'memory' };
  } catch (err) {
    console.warn('Firestore save failed; keeping this server memory copy', err);
    return { persisted: 'memory' };
  }
}

export async function listUserDocuments(email: string): Promise<SavedDocumentSummary[]> {
  const key = userKey(email);
  if (projectId()) {
    try {
      const token = await accessToken();
      if (token) {
        const res = await fetch(`${docUrl(email)}?pageSize=20&orderBy=savedAt%20desc`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { documents?: Array<{ fields?: { payload?: { stringValue?: string } } }> };
          const items = (data.documents || [])
            .map((doc) => readPayload(doc.fields))
            .filter((item): item is NyayaSession => Boolean(item))
            .map((item) => ({
              id: item.document.documentId,
              title: item.document.title,
              documentType: item.document.documentType,
              clauseCount: item.document.clauses?.length || 0,
              savedAt: item.savedAt,
            }));
          if (items.length) return items;
        }
      }
    } catch (err) {
      console.warn('Firestore list failed', err);
    }
  }

  return (memory.get(key) || []).map((item) => ({
    id: item.document.documentId,
    title: item.document.title,
    documentType: item.document.documentType,
    clauseCount: item.document.clauses.length,
    savedAt: item.savedAt,
  }));
}

export async function loadUserDocument(email: string, id: string): Promise<NyayaSession | null> {
  const key = userKey(email);
  if (projectId()) {
    try {
      const token = await accessToken();
      if (token) {
        const res = await fetch(docUrl(email, id), { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = (await res.json()) as { fields?: { payload?: { stringValue?: string } } };
          const item = readPayload(data.fields);
          if (item) return item;
        }
      }
    } catch (err) {
      console.warn('Firestore load failed', err);
    }
  }
  return (memory.get(key) || []).find((item) => item.document.documentId === id) || null;
}

