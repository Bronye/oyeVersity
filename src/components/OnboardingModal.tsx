import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  BookOpen, 
  User, 
  HelpCircle, 
  Flame, 
  Target,
  GraduationCap
} from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (updatedProfile: UserProfile) => void;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
  onClose
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState(initialProfile.name || 'Amara Okafor');
  const [age, setAge] = useState(initialProfile.age || 12);
  const [classLevel, setClassLevel] = useState(initialProfile.classLevel || 'JSS 1');
  const [avatar, setAvatar] = useState(initialProfile.avatar || 'cap-student');
  const [cognitiveChoice, setCognitiveChoice] = useState<'visual-story' | 'step-by-step' | 'everyday-analogy'>('everyday-analogy');
  
  // Baseline psychometry responses
  const [q2Answer, setQ2Answer] = useState<number | null>(null);
  const [q3Answer, setQ3Answer] = useState<number | null>(null);

  const avatars = [
    { id: 'cap-student', icon: '🎓', label: 'Scholar' },
    { id: 'flame-scholar', icon: '🔥', label: 'Curious Flame' },
    { id: 'star-learner', icon: '⭐', label: 'Star Explorer' },
    { id: 'lantern-learner', icon: '🏮', label: 'Night Lantern' }
  ];

  const classLevels = [
    'Primary 6',
    'JSS 1',
    'JSS 2',
    'JSS 3',
    'SSS 1',
    'SSS 2',
    'SSS 3'
  ];

  const handleNextStep = () => {
    sounds.playTap();
    if (step === 1) {
      if (!name.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    sounds.playSparkEarned();
    fireConfetti();

    const updated: UserProfile = {
      ...initialProfile,
      name: name.trim(),
      age: Number(age),
      classLevel,
      avatar,
      cognitiveStyle: cognitiveChoice,
      isOnboarded: true,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    onComplete(updated);
  };

  return (
    <div 
      id="onboarding-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
        
        {/* Top Stepper Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200">
                Step {step} of 3 • Learner Onboarding
              </span>
              <h2 className="font-heading font-extrabold text-base leading-tight">
                Welcome to Òyè-versity
              </h2>
            </div>
          </div>

          {onClose && initialProfile.isOnboarded && (
            <button
              onClick={onClose}
              className="text-xs font-semibold text-white/80 hover:text-white underline"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          
          {step === 1 && (
            /* Step 1: Identity & Class Level */
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Tell us about yourself
                </h3>
                <p className="text-xs text-slate-500">
                  Amoye customizes vocabulary and explanation depth to your exact age and class.
                </p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Full or Nickname:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amara Okafor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {/* Age & Class Level Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Age ({age} years old):
                  </label>
                  <input
                    type="range"
                    min="9"
                    max="18"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer mt-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Class Level:
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-bold"
                  >
                    {classLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  Pick your Scholar Avatar:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {avatars.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setAvatar(av.id)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1 ${
                        avatar === av.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 ring-2 ring-emerald-400'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">{av.icon}</span>
                      <span className="text-[10px] font-bold">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            /* Step 2: Cognitive Style Selection */
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  How do you learn best?
                </h3>
                <p className="text-xs text-slate-500">
                  Amoye will adapt its teaching explanations to match your natural thinking style.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setCognitiveChoice('everyday-analogy')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    cognitiveChoice === 'everyday-analogy'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 ring-2 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl p-1">⚖️</span>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      Everyday Community Analogies
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Connect concepts to market scales, jerrycans, danfo buses, and kitchen cooking.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCognitiveChoice('visual-story')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    cognitiveChoice === 'visual-story'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 ring-2 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl p-1">📖</span>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      Story Cards & Folklore
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Learn through cultural narratives, character dilemmas, and illustrated scenes.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCognitiveChoice('step-by-step')}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    cognitiveChoice === 'step-by-step'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 ring-2 ring-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl p-1">🔢</span>
                  <div>
                    <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                      Step-by-Step Logic & Formulas
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sequential breakdowns, step numbers, and clear rule hierarchies.
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            /* Step 3: Rapid Baseline Psychometry & Diagnostic (Matching sketch note on psychometry) */
            <div className="space-y-4 animate-in fade-in">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 bg-orange-100 px-2 py-0.5 rounded-md">
                  Rapid Telemetry
                </span>
                <h3 className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mt-1">
                  2 Quick Baseline Checks
                </h3>
                <p className="text-xs text-slate-500">
                  This calibrates your starting Learning Path and configures your first Side-Quest!
                </p>
              </div>

              {/* Check 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  1. You have 1/2 of an Agege bread loaf and cut that portion in half. What fraction of the original loaf do you have?
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['1/2', '1/4', '2/4'].map((choice, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setQ2Answer(cIdx)}
                      className={`py-2 rounded-xl border text-center font-bold transition-colors ${
                        q2Answer === cIdx
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white dark:bg-slate-700 border-slate-300'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  2. Why does a roadside market seller use cast iron weights on a two-pan balance?
                </p>
                <div className="space-y-1.5 text-xs">
                  {[
                    'To make one side intentionally heavier',
                    'To balance equal gravitational downward pull on both pans',
                    'To decorate the market stall'
                  ].map((choice, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => setQ3Answer(cIdx)}
                      className={`w-full text-left p-2 rounded-xl border font-medium transition-colors ${
                        q3Answer === cIdx
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : 'bg-white dark:bg-slate-700 border-slate-300'
                      }`}
                    >
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
            >
              Back
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNextStep}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-colors"
          >
            <span>{step === 3 ? 'Launch Òyè-versity!' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
