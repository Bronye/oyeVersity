import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  Volume2,
  Plus
} from 'lucide-react';
import { Flashcard } from '../types';
import { sounds, speakText } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';

interface FlashcardsModalProps {
  flashcards: Flashcard[];
  subjectName: string;
  onClose: () => void;
  onUpdateCardStatus: (cardId: string, mastered: boolean) => void;
  onAddCard: (card: Flashcard) => void;
  lowBandwidthMode: boolean;
}

export const FlashcardsModal: React.FC<FlashcardsModalProps> = ({
  flashcards,
  subjectName,
  onClose,
  onUpdateCardStatus,
  onAddCard,
  lowBandwidthMode
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New card form state
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newAnalogy, setNewAnalogy] = useState('');

  const currentCard: Flashcard | undefined = flashcards[currentIndex];

  const handleFlip = () => {
    sounds.playTap();
    setIsFlipped(!isFlipped);
  };

  const handleMarkMastered = () => {
    if (!currentCard) return;
    sounds.playCorrectAnswer();
    fireConfetti();
    onUpdateCardStatus(currentCard.id, true);
    nextCard();
  };

  const handleMarkReview = () => {
    if (!currentCard) return;
    sounds.playTap();
    onUpdateCardStatus(currentCard.id, false);
    nextCard();
  };

  const nextCard = () => {
    setIsFlipped(false);
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleCreateNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newCard: Flashcard = {
      id: `fc-custom-${Date.now()}`,
      subjectId: currentCard?.subjectId || 'custom',
      front: newFront.trim(),
      back: newBack.trim(),
      analogy: newAnalogy.trim() || 'A familiar everyday mental picture from your community.',
      mastered: false,
      reviewCount: 0
    };

    onAddCard(newCard);
    sounds.playSparkEarned();
    setNewFront('');
    setNewBack('');
    setNewAnalogy('');
    setShowAddForm(false);
  };

  return (
    <div 
      id="flashcards-modal-overlay"
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider">
                Digital Flashcards Deck • {subjectName}
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight text-slate-900 dark:text-white">
                Sparks Memory Arena
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 border border-purple-200"
              title="Add a custom study flashcard"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Card</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center">
          
          {showAddForm ? (
            /* Add Custom Flashcard Form */
            <form onSubmit={handleCreateNewCard} className="w-full space-y-3.5 animate-in fade-in">
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Create an Offline Study Flashcard
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Front (Question or Term):
                </label>
                <input 
                  type="text" 
                  value={newFront} 
                  onChange={e => setNewFront(e.target.value)}
                  placeholder="e.g. What is Density?" 
                  className="w-full px-3 py-2 rounded-xl border text-xs sm:text-sm bg-slate-50 dark:bg-slate-800"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Back (Concise Definition):
                </label>
                <textarea 
                  value={newBack} 
                  onChange={e => setNewBack(e.target.value)}
                  placeholder="e.g. Mass per unit volume (Density = Mass / Volume)" 
                  className="w-full px-3 py-2 rounded-xl border text-xs sm:text-sm bg-slate-50 dark:bg-slate-800"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Everyday Analogy (Mental Picture):
                </label>
                <input 
                  type="text" 
                  value={newAnalogy} 
                  onChange={e => setNewAnalogy(e.target.value)}
                  placeholder="e.g. A metal bolt sinking in water vs a dry calabash floating" 
                  className="w-full px-3 py-2 rounded-xl border text-xs sm:text-sm bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-xl border text-xs font-semibold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                >
                  Save to Offline Deck
                </button>
              </div>
            </form>
          ) : !currentCard ? (
            <div className="text-center py-10">
              <p className="text-slate-500">No flashcards in this deck yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold"
              >
                Create First Card
              </button>
            </div>
          ) : (
            /* Interactive Flip Card */
            <div className="w-full flex flex-col items-center">
              
              {/* Card Stepper info */}
              <div className="w-full flex items-center justify-between text-xs text-slate-500 font-semibold mb-3">
                <span>Card {currentIndex + 1} of {flashcards.length}</span>
                {currentCard.mastered ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Mastered
                  </span>
                ) : (
                  <span className="text-amber-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Needs Review
                  </span>
                )}
              </div>

              {/* 3D Flip Card Container */}
              <div 
                onClick={handleFlip}
                className="w-full h-72 sm:h-80 rounded-3xl cursor-pointer perspective-1000 select-none"
              >
                <div 
                  className={`w-full h-full relative rounded-3xl transition-transform duration-500 transform-style-3d shadow-lg border-2 ${
                    isFlipped 
                      ? 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border-purple-300 dark:border-purple-700' 
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  } p-6 sm:p-8 flex flex-col items-center justify-between text-center`}
                >
                  {/* Top Badge */}
                  <div className="w-full flex items-center justify-between text-xs text-slate-400">
                    <span className="uppercase tracking-wider font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700">
                      {isFlipped ? 'Answer & Analogy' : 'Question / Concept'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(isFlipped ? `${currentCard.back}. ${currentCard.analogy}` : currentCard.front);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-purple-600"
                      title="Read aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Text */}
                  <div className="my-auto">
                    {!isFlipped ? (
                      <h3 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white leading-snug">
                        {currentCard.front}
                      </h3>
                    ) : (
                      <div className="space-y-3">
                        <p className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-relaxed">
                          {currentCard.back}
                        </p>
                        
                        {/* Everyday Analogy pill */}
                        {currentCard.analogy && (
                          <div className="p-3 rounded-2xl bg-amber-100/80 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-xs text-amber-950 dark:text-amber-200 font-medium text-left flex items-start gap-2">
                            <Flame className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                            <span>
                              <strong>Mental Model:</strong> {currentCard.analogy}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom hint */}
                  <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1">
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Tap card to {isFlipped ? 'see question' : 'flip answer'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Need Review vs Mastered */}
              <div className="w-full flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={handleMarkReview}
                  className="flex-1 py-2.5 rounded-2xl border-2 border-orange-300 bg-orange-50 dark:bg-slate-800 text-orange-700 dark:text-orange-300 font-bold text-xs sm:text-sm hover:bg-orange-100 flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Need Review</span>
                </button>

                <button
                  onClick={handleMarkMastered}
                  className="flex-1 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mastered (+10 Sparks)</span>
                </button>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={prevCard}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs text-slate-400 font-mono">
                  {currentIndex + 1} / {flashcards.length}
                </span>
                <button
                  onClick={nextCard}
                  disabled={currentIndex === flashcards.length - 1}
                  className="p-2 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
