import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || 'nyayavoice-guest-only-secret',
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  providers: googleClientId && googleClientSecret
    ? [Google({ clientId: googleClientId, clientSecret: googleClientSecret })]
    : [],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = typeof profile.picture === 'string' ? profile.picture : token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email ?? session.user.email;
        session.user.name = token.name ?? session.user.name;
        session.user.image = typeof token.picture === 'string' ? token.picture : session.user.image;
      }
      return session;
    },
  },
});

export function googleAuthConfigured() {
  return Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET && process.env.AUTH_SECRET);
}
