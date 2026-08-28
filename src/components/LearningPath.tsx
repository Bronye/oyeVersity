import React from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Play, 
  Sparkles, 
  Star, 
  Compass, 
  AlertCircle,
  ChevronRight,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { SubjectData, LearningModule, SideQuest } from '../types';
import { sounds } from '../utils/audio';

interface LearningPathProps {
  subjects: SubjectData[];
  currentSubject: SubjectData;
  onSelectSubject: (subjectId: string) => void;
  onSelectModule: (module: LearningModule) => void;
  onSelectSideQuest: (sideQuest: SideQuest) => void;
  lowBandwidthMode: boolean;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  subjects,
  currentSubject,
  onSelectSubject,
  onSelectModule,
  onSelectSideQuest,
  lowBandwidthMode
}) => {
  const activeSideQuest = currentSubject.sideQuests.find(sq => sq.status === 'available');

  const handleModuleClick = (mod: LearningModule) => {
    if (mod.status === 'locked') {
      sounds.playTap();
      return;
    }
    sounds.playTap();
    onSelectModule(mod);
  };

  const handleSideQuestClick = (sq: SideQuest) => {
    sounds.playSparkEarned();
    onSelectSideQuest(sq);
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Subject Header & Selector */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Learning Path: {currentSubject.subject_name}
          </h2>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
            {currentSubject.modules.filter(m => m.status === 'completed').length}/{currentSubject.modules.length} Completed
          </span>
        </div>

        {/* Subject Switcher Dropdown */}
        <div className="relative">
          <select
            id="subject-selector"
            value={currentSubject.subject_id}
            onChange={(e) => onSelectSubject(e.target.value)}
            className={`w-full text-xs font-bold pl-3 pr-8 py-2 rounded-xl border appearance-none cursor-pointer focus:outline-none transition-colors ${
              lowBandwidthMode
                ? 'bg-slate-800 text-emerald-400 border-slate-700'
                : 'bg-slate-50 hover:bg-white text-slate-800 border-slate-200 focus:border-emerald-500 shadow-xs'
            }`}
          >
            {subjects.map((sub) => (
              <option key={sub.subject_id} value={sub.subject_id}>
                {sub.subject_name} • {sub.class}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
            ▼
          </div>
        </div>
      </div>

      {/* Side Quest Alert Banner (if available for this subject based on psychometry/quiz gaps) */}
      {activeSideQuest && (
        <div 
          id="banner-active-sidequest"
          onClick={() => handleSideQuestClick(activeSideQuest)}
          className={`w-full mb-4 p-3.5 rounded-xl border transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.99] flex items-center justify-between gap-3 ${
            lowBandwidthMode
              ? 'bg-slate-900 border-orange-500 text-orange-300'
              : 'bg-orange-50/80 border-orange-200 text-orange-950 shadow-sm hover:bg-orange-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-orange-200 text-orange-800">
                  Side Quest
                </span>
                <span className="text-[11px] font-bold text-orange-600">
                  +{activeSideQuest.sparksReward} Sparks
                </span>
              </div>
              <h4 className="font-bold text-xs mt-0.5 line-clamp-1">
                {activeSideQuest.title}
              </h4>
            </div>
          </div>

          <button 
            className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
          >
            Start <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Vertical Stepper Nodes (Exact match to Vibrant Palette Design HTML) */}
      <div className="flex flex-col gap-1 relative my-2">
        {/* Continuous Connecting Track Line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

        {currentSubject.modules.map((module) => {
          const isCompleted = module.status === 'completed';
          const isInProgress = module.status === 'in_progress' || module.status === 'unlocked';
          const isLocked = module.status === 'locked';

          return (
            <div
              key={module.id}
              onClick={() => handleModuleClick(module)}
              className={`flex items-start gap-4 relative z-10 py-2.5 px-2 rounded-xl transition-all cursor-pointer group ${
                isInProgress 
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20' 
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Stepper Node Circle */}
              {isCompleted ? (
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200 dark:shadow-none shrink-0 group-hover:scale-105 transition-transform">
                  <span className="text-white text-base font-black leading-none">✓</span>
                </div>
              ) : isInProgress ? (
                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 border-4 border-emerald-500 flex items-center justify-center shadow-md shadow-emerald-100 shrink-0 group-hover:scale-105 transition-transform">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-transparent flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
              )}

              {/* Module Text & Metadata */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm leading-tight truncate ${
                  isInProgress 
                    ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' 
                    : isCompleted 
                    ? 'text-slate-800 dark:text-slate-200' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {module.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isCompleted && `Completed • ${module.total_steps}/${module.total_steps} Steps`}
                  {isInProgress && `Current • Step ${module.current_step} of ${module.total_steps}`}
                  {isLocked && 'Locked (Complete prior topic)'}
                </p>
              </div>

              {/* Action indicator */}
              {!isLocked && (
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all self-center shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {/* Socio-Context Tip Card at the bottom (Exact match to Vibrant Palette Design HTML) */}
      <div className="mt-auto pt-4">
        <div className="p-4 bg-slate-900 rounded-xl text-white shadow-sm border border-slate-800">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Socio-Context Tip
            </span>
          </div>
          <p className="text-xs leading-relaxed text-slate-300">
            Think of fractions like sharing a <span className="italic font-semibold text-white">loaf of agege bread</span> between four friends or pouring <span className="italic font-semibold text-white">half a jerrycan of water</span>.
          </p>
        </div>
      </div>
    </div>
  );
};
