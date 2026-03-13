'use client'

import { useEffect, useState } from 'react';

const SAFETY_TIMEOUT = 30000; // 30 seconds

const LoadingOverlay = ({ visible, message = 'Please wait...' }) => {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!visible) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setTimedOut(true), SAFETY_TIMEOUT);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible && !timedOut) return null;

  if (timedOut) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0f]/70 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/[0.08] bg-[#0f0f1a]/90 px-10 py-8 shadow-2xl backdrop-blur-xl">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-white/[0.06]" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
        </div>
        <p className="text-sm font-medium text-slate-300">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
