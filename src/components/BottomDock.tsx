import React from 'react';
import { 
  ShoppingBag, 
  Award, 
  Bot, 
  Layers, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface BottomDockProps {
  activeView: string | null;
  onOpenMarket: () => void;
  onOpenRewards: () => void;
  onOpenAskAmoye: () => void;
  onOpenFlashcards: () => void;
  onOpenQuizzes: () => void;
  lowBandwidthMode: boolean;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  activeView,
  onOpenMarket,
  onOpenRewards,
  onOpenAskAmoye,
  onOpenFlashcards,
  onOpenQuizzes,
  lowBandwidthMode
}) => {
  return (
    <nav 
      id="bottom-navigation-dock"
      aria-label="Main Navigation Dock"
      className={`fixed bottom-0 left-0 right-0 z-30 transition-colors lg:hidden ${
        lowBandwidthMode
          ? 'bg-slate-900 border-t border-slate-800 text-white'
          : 'bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg text-slate-700'
      }`}
    >
      <div className="max-w-md mx-auto px-4 py-1.5 flex items-center justify-between relative">
        {/* Button 1: Market */}
        <button
          id="dock-btn-market"
          onClick={() => { sounds.playTap(); onOpenMarket(); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeView === 'market' 
              ? 'text-emerald-600 font-bold' 
              : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Market</span>
        </button>

        {/* Button 2: Rewards */}
        <button
          id="dock-btn-rewards"
          onClick={() => { sounds.playTap(); onOpenRewards(); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeView === 'rewards' 
              ? 'text-orange-500 font-bold' 
              : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Rewards</span>
        </button>

        {/* CENTER PROMINENT BUTTON: ASK AMOYE */}
        <div className="flex flex-col items-center justify-center -mt-5">
          <button
            id="dock-btn-ask-amoye"
            onClick={() => { sounds.playSparkEarned(); onOpenAskAmoye(); }}
            className={`group relative flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all transform active:scale-95 focus:outline-none ${
              lowBandwidthMode
                ? 'bg-slate-900 border-2 border-emerald-400 text-emerald-400'
                : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105 border-4 border-white'
            }`}
            title="Ask Amoye - Socratic AI Learning Companion"
          >
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Bot className="w-5 h-5 drop-shadow" />
              <span className="text-[8px] font-black tracking-wider uppercase leading-none mt-0.5">
                AMOYE
              </span>
            </div>
          </button>
          <span className={`text-[10px] font-bold mt-0.5 tracking-tight ${
            lowBandwidthMode ? 'text-emerald-400' : 'text-emerald-700'
          }`}>
            Ask Amoye
          </span>
        </div>

        {/* Button 4: Flashcards */}
        <button
          id="dock-btn-flashcards"
          onClick={() => { sounds.playTap(); onOpenFlashcards(); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeView === 'flashcards' 
              ? 'text-emerald-600 font-bold' 
              : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Flashcards</span>
        </button>

        {/* Button 5: Quizzes */}
        <button
          id="dock-btn-quizzes"
          onClick={() => { sounds.playTap(); onOpenQuizzes(); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
            activeView === 'quizzes' 
              ? 'text-orange-500 font-bold' 
              : 'hover:text-slate-900 text-slate-500'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Quizzes</span>
        </button>
      </div>
    </nav>
  );
};
