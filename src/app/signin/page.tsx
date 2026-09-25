'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Scale } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.replace('/');
  }, [status, router]);

  useEffect(() => {
    fetch('/api/auth/ready')
      .then((res) => res.json())
      .then((data) => setGoogleReady(Boolean(data.google)))
      .catch(() => setGoogleReady(false));
  }, []);

  const continueWithGoogle = () => {
    setStarting(true);
    void signIn('google', { callbackUrl: '/' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main id="main" className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-[2rem] bg-white border border-[#ece7f2] shadow-sm p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#161616] text-white flex items-center justify-center">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold tracking-tight">LawAI</span>
              <span className="block text-[11px] text-[#5e595d]">NyayaVoice</span>
            </span>
          </div>

          <p className="mt-8 text-sm font-medium text-[#6b4c78]">Sign in to continue</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight leading-tight">
            Your documents stay with your account
          </h1>
          <p className="mt-3 text-sm text-[#5e595d] leading-relaxed">
            Google sign-in is required before you can open an agreement, ask a question, or see saved notices.
          </p>

          <button
            type="button"
            onClick={continueWithGoogle}
            disabled={googleReady !== true || starting || status === 'loading'}
            className="mt-8 w-full px-5 py-3 rounded-full bg-[#4451c7] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#161616]"
          >
            <span className="w-5 h-5 rounded-full bg-white text-[#4451c7] text-xs font-bold inline-flex items-center justify-center" aria-hidden="true">
              G
            </span>
            {starting ? 'Opening Google…' : 'Sign in with Google'}
          </button>

          {googleReady === false && (
            <p role="alert" className="mt-4 text-xs text-[#df3d46]">
              Google sign-in is not configured on this server yet.
            </p>
          )}

          <p className="mt-6 text-xs text-[#5e595d] leading-relaxed">
            NyayaVoice explains documents. It is not a lawyer and does not give legal advice.
          </p>
        </div>
      </main>
    </div>
  );
}
