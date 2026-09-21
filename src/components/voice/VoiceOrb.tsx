'use client';

import React from 'react';

interface VoiceOrbProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted';
  size?: 'sm' | 'md' | 'lg';
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({ state, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
  }[size];

  const stateColors = {
    idle: 'from-slate-600 via-slate-500 to-indigo-900 shadow-indigo-900/30',
    listening: 'from-emerald-500 via-teal-400 to-cyan-600 shadow-emerald-500/40 ring-4 ring-emerald-500/30',
    thinking: 'from-amber-500 via-orange-400 to-indigo-600 shadow-amber-500/40 animate-pulse',
    speaking: 'from-indigo-500 via-violet-500 to-purple-600 shadow-indigo-500/50',
    interrupted: 'from-rose-500 via-pink-500 to-amber-600 shadow-rose-500/40',
  }[state];

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer Pulse Rings */}
      {(state === 'listening' || state === 'speaking') && (
        <>
          <div
            className={`absolute ${sizeClasses} rounded-full bg-gradient-to-r ${stateColors} opacity-20 animate-ping`}
            style={{ animationDuration: state === 'speaking' ? '1.8s' : '2.4s' }}
          />
          <div
            className={`absolute w-64 h-64 rounded-full bg-gradient-to-r ${stateColors} opacity-10 animate-pulse`}
          />
        </>
      )}

      {/* Main Glowing Sphere */}
      <div
        className={`relative ${sizeClasses} rounded-full bg-gradient-to-tr ${stateColors} shadow-2xl flex items-center justify-center transition-all duration-500 border border-white/20`}
      >
        {/* Inner Glass Flare */}
        <div className="absolute top-4 left-6 w-12 h-6 bg-white/25 rounded-full blur-[2px] transform -rotate-45" />

        {/* Dynamic Center Waves */}
        <div className="flex items-center gap-1.5 h-12">
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-1.5 bg-white/90 rounded-full transition-all duration-200"
              style={{
                height:
                  state === 'speaking'
                    ? `${20 + Math.sin(Date.now() / 200 + i) * 24}px`
                    : state === 'listening'
                    ? `${16 + (i % 2 === 0 ? 14 : 6)}px`
                    : state === 'thinking'
                    ? '8px'
                    : '6px',
                animation: state === 'speaking' || state === 'listening' ? `pulse 1.2s infinite ease-in-out ${i * 0.15}s` : 'none',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
