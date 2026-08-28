import React, { useEffect, useState } from 'react';
import { BookOpen, Sparkles, ShieldCheck, Database, Wifi } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [statusText, setStatusText] = useState('Booting offline Dexie.js database...');
  const [progress, setProgress] = useState(15);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setStatusText('Preloading NERDC curriculum paths & study modules...');
      setProgress(50);
    }, 600);

    const t2 = setTimeout(() => {
      setStatusText('Calibrating Socratic guardrails & offline packs...');
      setProgress(85);
    }, 1200);

    const t3 = setTimeout(() => {
      setStatusText('Òyè-versity ready!');
      setProgress(100);
    }, 1800);

    const t4 = setTimeout(() => {
      onComplete();
    }, 2200);

    const tSkip = setTimeout(() => {
      setCanSkip(true);
    }, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(tSkip);
    };
  }, [onComplete]);

  return (
    <div 
      id="loading-screen-overlay"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-white select-none aurora-bg overflow-hidden"
    >
      {/* Decorative floating ambient light spots */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-orange-500/20 blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-sky-500/20 blur-3xl pointer-events-none"></div>

      {/* Center Òyè-versity Emblem Card (faithful to sketch) */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center">
        <div className="w-28 h-28 rounded-3xl bg-slate-900/90 border border-emerald-500/40 shadow-2xl flex flex-col items-center justify-center p-4 backdrop-blur-md relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-500 opacity-60 blur-sm group-hover:opacity-100 transition duration-1000"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Custom stylized Book + Radiant Flame/Crown Emblem */}
            <div className="relative">
              <Sparkles className="w-6 h-6 text-amber-400 absolute -top-3 left-1/2 -translate-x-1/2 animate-bounce" />
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-inner">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="h-1 w-8 bg-amber-400/80 rounded-full mt-1"></div>
          </div>
        </div>

        {/* Title & Yoruba Ethos */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-6 font-heading text-white">
          òyè<span className="text-emerald-400">-versity</span>
        </h1>
        <p className="text-xs sm:text-sm font-medium tracking-wide text-slate-300 mt-1 uppercase">
          Curiosity • Understanding • Growth
        </p>

        <p className="text-xs text-slate-400 mt-3 max-w-xs leading-relaxed">
          AI Education Access Assistant for Underserved Learners
        </p>

        {/* Dynamic Progress Bar */}
        <div className="w-64 mt-8">
          <div className="w-full bg-slate-800/80 rounded-full h-2 p-0.5 border border-slate-700/60 overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-orange-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-emerald-300 font-mono">
            <Database className="w-3.5 h-3.5 animate-spin" />
            <span>{statusText}</span>
          </div>
        </div>

        {/* Low-bandwidth offline badge */}
        <div className="mt-8 flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-700 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 text-emerald-400">
            <Wifi className="w-3.5 h-3.5" /> 3G Ultra-Fast
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-orange-400">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Offline-Ready
          </span>
        </div>

        {canSkip && (
          <button
            onClick={onComplete}
            className="mt-5 text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors"
          >
            Enter Dashboard Now →
          </button>
        )}
      </div>
    </div>
  );
};
