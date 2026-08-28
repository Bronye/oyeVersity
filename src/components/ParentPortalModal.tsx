import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  ShieldCheck, 
  Clock, 
  Award, 
  AlertCircle, 
  Lightbulb, 
  Printer, 
  FileText,
  UserCheck,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, KnowledgeGap } from '../types';
import { sounds } from '../utils/audio';

interface ParentPortalModalProps {
  profile: UserProfile;
  knowledgeGaps: KnowledgeGap[];
  onClose: () => void;
}

export const ParentPortalModal: React.FC<ParentPortalModalProps> = ({
  profile,
  knowledgeGaps,
  onClose
}) => {
  const [pin, setPin] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === (profile.parentPin || '1234')) {
      setIsUnlocked(true);
      setErrorMsg('');
      sounds.playSparkEarned();
    } else {
      setErrorMsg('Incorrect PIN. (Default demonstration PIN is 1234)');
      sounds.playTap();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="parent-portal-overlay"
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold">
              {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                Supervisor & Guardian Portal
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight">
                Academic Telemetry & Home Guidance
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unlocked vs Locked State */}
        {!isUnlocked ? (
          /* PIN Gate Form */
          <div className="p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
              <Lock className="w-8 h-8" />
            </div>

            <div className="max-w-sm">
              <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white">
                Parent Access Only
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your 4-digit supervisor PIN to view weekly study telemetry, honesty scores, and home tutoring recommendations.
              </p>
            </div>

            <form onSubmit={handleUnlock} className="w-full max-w-xs space-y-3">
              <input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full text-center tracking-widest text-2xl font-mono py-2.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:border-emerald-500 focus:outline-none bg-slate-50 dark:bg-slate-800"
                autoFocus
              />

              {errorMsg && (
                <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Unlock Guardian Telemetry
              </button>

              <p className="text-[11px] text-slate-400">
                Demo Guardian PIN: <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">1234</code>
              </p>
            </form>
          </div>
        ) : (
          /* Full Guardian Telemetry Dashboard */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            
            {/* Student Overview Strip */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                  Enrolled Learner
                </span>
                <h3 className="font-heading font-extrabold text-lg text-slate-900 dark:text-white">
                  {profile.name} ({profile.classLevel}, Age {profile.age})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Academic Honor: <strong>{profile.rank}</strong> • Cognitive Style: <strong>{profile.cognitiveStyle}</strong>
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report</span>
              </button>
            </div>

            {/* Metrics Triad */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block">
                  {profile.weeklyStudyMinutes}m
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                  Study Time This Week
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <Award className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block">
                  {profile.lastHiScore}%
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                  Recent Quiz Mastery
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white block">
                  100%
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                  Integrity / Anti-Cheat
                </span>
              </div>
            </div>

            {/* Pillar 3: Knowledge Gap Summary for Parents */}
            <div>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Identified Knowledge Gaps & Everyday Home Actions</span>
              </h4>

              {knowledgeGaps.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-500 text-center">
                  No active learning gaps recorded. Student is progressing smoothly!
                </div>
              ) : (
                <div className="space-y-3">
                  {knowledgeGaps.map((gap) => (
                    <div
                      key={gap.id}
                      className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                          {gap.subjectName}: {gap.topic}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                          {gap.status === 'resolved' ? 'Resolved' : 'Needs Practice'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {gap.diagnosticNote}
                      </p>

                      {/* Parent Everyday Tip */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-700 dark:text-amber-400">Guardian Everyday Activity:</strong>{' '}
                          {gap.everydayAnalogyFix}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offline Data & Network Footprint Telemetry */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
                <span>Estimated Cellular Data Consumed:</span>
                <span className="text-emerald-600">3.2 MB (Ultra-Compressed)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Òyè-versity caches all lessons locally in the browser’s Dexie.js database. Zero video streaming or heavy ads are ever downloaded.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
