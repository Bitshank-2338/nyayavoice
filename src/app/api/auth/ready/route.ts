import { googleAuthConfigured } from '@/auth';

export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json({ google: googleAuthConfigured() });
}
