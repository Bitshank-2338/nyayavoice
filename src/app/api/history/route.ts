import { auth, googleAuthConfigured } from '@/auth';
import { listUserDocuments, loadUserDocument, saveUserDocument } from '@/lib/account/user-library';
import { NyayaSession } from '@/lib/session/session-store';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

async function requireUser() {
  if (!googleAuthConfigured()) {
    return { error: Response.json({ error: 'Google sign-in is not configured on this server.' }, { status: 503 }) };
  }
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { error: Response.json({ error: 'Sign in with Google to save history.' }, { status: 401 }) };
  }
  return { email };
}

export async function GET(req: NextRequest) {
  const user = await requireUser();
  if ('error' in user && user.error) return user.error;
  const id = req.nextUrl.searchParams.get('id');
  if (id) {
    const item = await loadUserDocument(user.email, id);
    if (!item) return Response.json({ error: 'Not found' }, { status: 404 });
    return Response.json({ item });
  }
  const items = await listUserDocuments(user.email);
  return Response.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if ('error' in user && user.error) return user.error;
  const body = (await req.json()) as NyayaSession;
  if (!body?.document?.title || !body.document.documentId) {
    return Response.json({ error: 'A document id and title are required.' }, { status: 400 });
  }
  const result = await saveUserDocument(user.email, {
    version: 1,
    document: body.document,
    activeTab: body.activeTab || 'overview',
    highlightedSection: body.highlightedSection,
    conversation: Array.isArray(body.conversation) ? body.conversation : [],
    savedAt: new Date().toISOString(),
  });
  return Response.json({ ok: true, ...result });
}
