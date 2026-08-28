import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  Flame, 
  RotateCcw,
  Target,
  Bot
} from 'lucide-react';
import { Quiz, QuizQuestion, KnowledgeGap } from '../types';
import { sounds } from '../utils/audio';
import { fireConfetti } from '../utils/confetti';
import { useGamificationStore } from '../store/useGamificationStore';
import { savePendingQuizResult } from '../db/dexie';

interface QuizzesModalProps {
  quizzes: Quiz[];
  subjectName: string;
  onClose: () => void;
  onQuizCompleted: (score: number, total: number, sparksEarned: number, xpEarned: number) => void;
  onNewKnowledgeGapDetected: (gap: KnowledgeGap) => void;
  lowBandwidthMode: boolean;
}

export const QuizzesModal: React.FC<QuizzesModalProps> = ({
  quizzes,
  subjectName,
  onClose,
  onQuizCompleted,
  onNewKnowledgeGapDetected,
  lowBandwidthMode
}) => {
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(quizzes.length > 0 ? 0 : null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<QuizQuestion[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [isAnalyzingGap, setIsAnalyzingGap] = useState(false);
  const [diagnosticFeedback, setDiagnosticFeedback] = useState<any | null>(null);

  const activeQuiz = selectedQuizIndex !== null ? quizzes[selectedQuizIndex] : null;
  const curQuestion: QuizQuestion | undefined = activeQuiz?.questions[currentQIndex];

  const handleSelectOption = (idx: number) => {
    if (hasAnswered || !curQuestion) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = idx === curQuestion.correctIndex;
    if (isCorrect) {
      setScore(prev => prev + 1);
      sounds.playCorrectAnswer();
    } else {
      setMissedQuestions(prev => [...prev, curQuestion]);
      sounds.playTap();
    }
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;

    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!activeQuiz) return;
    setIsFinished(true);
    const finalScore = score + (selectedOption === curQuestion?.correctIndex ? 1 : 0);
    const total = activeQuiz.questions.length;
    const accuracy = Math.round((finalScore / total) * 100);

    const earnedSparks = Math.round((finalScore / total) * activeQuiz.sparksReward);
    const earnedXp = Math.round((finalScore / total) * activeQuiz.xpReward);

    if (accuracy >= 60) {
      sounds.playSparkEarned();
      fireConfetti();
    }

    // Trigger Zustand gamification store for XP and badge evaluations
    try {
      useGamificationStore.getState().recordQuizCompleted(finalScore, total, activeQuiz.title);
    } catch (e) {}

    onQuizCompleted(finalScore, total, earnedSparks, earnedXp);

    // If there were missed questions, trigger Pillar 3 Knowledge Gap Diagnostic Engine
    const errors = [...missedQuestions];
    if (curQuestion && selectedOption !== curQuestion.correctIndex && !errors.includes(curQuestion)) {
      errors.push(curQuestion);
    }

    if (errors.length > 0) {
      setIsAnalyzingGap(true);
      let detected: any = null;

      try {
        if (navigator.onLine) {
          const response = await fetch('/api/gemini/diagnose-gap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              missedQuestions: errors,
              subjectName
            })
          });

          if (response.ok) {
            const data = await response.json();
            detected = data.detectedGap;
          }
        }
      } catch (err) {
        console.warn('Network gap diagnosis unavailable, queuing offline:', err);
      }

      // If offline or network unavailable, queue in offline database and use local diagnostic
      if (!detected) {
        try {
          await savePendingQuizResult({
            quizId: activeQuiz.id,
            quizTitle: activeQuiz.title,
            subjectId: activeQuiz.subjectId,
            subjectName,
            score: finalScore,
            totalQuestions: total,
            missedQuestions: errors,
            timestamp: Date.now()
          });
        } catch (qErr) {
          console.warn('Failed to queue quiz result:', qErr);
        }

        const fallbackTopic = errors[0]?.gapTopic || `${subjectName} Concept`;
        detected = {
          topic: fallbackTopic,
          diagnosticNote: `You had difficulty with: "${errors[0]?.question}". Reviewing the underlying everyday connection will solidify this for tests.`,
          everydayAnalogyFix: errors[0]?.everydayAnalogy || 'Like balancing a scale evenly before weighing provisions.',
          isOfflineQueued: true
        };
      }

      if (detected) {
        setDiagnosticFeedback(detected);
        const newGap: KnowledgeGap = {
          id: `gap-${Date.now()}`,
          subjectId: activeQuiz.subjectId,
          subjectName,
          topic: detected.topic || errors[0].gapTopic,
          missedCount: errors.length,
          diagnosticNote: detected.diagnosticNote,
          everydayAnalogyFix: detected.everydayAnalogyFix,
          status: 'active',
          detectedAt: new Date().toISOString().split('T')[0]
        };
        onNewKnowledgeGapDetected(newGap);
      }
      setIsAnalyzingGap(false);
    }
  };

  const handleRestart = () => {
    setCurrentQIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setMissedQuestions([]);
    setIsFinished(false);
    setDiagnosticFeedback(null);
  };

  return (
    <div 
      id="quizzes-modal-overlay"
      className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-md">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider">
                Practice Arena • {subjectName}
              </span>
              <h2 className="font-heading font-extrabold text-base sm:text-lg leading-tight text-slate-900 dark:text-white">
                {activeQuiz ? activeQuiz.title : 'Select a Quiz'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {!activeQuiz ? (
            <div className="text-center py-10">
              <p className="text-slate-500">No quizzes currently found for this subject.</p>
            </div>
          ) : isFinished ? (
            /* Quiz Completed Results & Diagnostic Gap Engine Report */
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center p-4">
                <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 mx-auto flex items-center justify-center shadow-inner">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white mt-3">
                  Quiz Completed!
                </h3>
                <p className="text-sm text-slate-500">
                  You scored <strong className="text-emerald-600">{score}</strong> out of {activeQuiz.questions.length} ({Math.round((score / activeQuiz.questions.length) * 100)}%)
                </p>
              </div>

              {/* Pillar 3: Knowledge Gap Diagnostic Card */}
              {isAnalyzingGap ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>Knowledge Gap Diagnostic Engine analyzing incorrect responses...</span>
                </div>
              ) : diagnosticFeedback ? (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span>Pillar 3: Diagnostic Gap Identified</span>
                  </div>
                  <h4 className="font-heading font-extrabold text-sm sm:text-base text-amber-950 dark:text-amber-200">
                    Focus Area: {diagnosticFeedback.topic}
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {diagnosticFeedback.diagnosticNote}
                  </p>
                  
                  {/* Everyday Fix */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-amber-200 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <Flame className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-orange-600">Everyday Mental Model:</strong> {diagnosticFeedback.everydayAnalogyFix}
                    </div>
                  </div>

                  {diagnosticFeedback.isOfflineQueued && (
                    <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 p-2 rounded-lg flex items-center gap-1.5">
                      <span>⚡</span>
                      <span><strong>Offline Mode:</strong> Quiz results & missed questions are saved in your offline queue. Deep AI diagnostics will sync automatically when you are online!</span>
                    </div>
                  )}

                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 p-2 rounded-lg">
                    ✨ A new <strong>Side-Quest</strong> has been generated and pinned to your Learning Path to help you master this!
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium text-center">
                  🌟 Flawless understanding! No knowledge gaps detected in this session.
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : curQuestion ? (
            /* Active Question Card */
            <div className="space-y-4">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                <span>Question {currentQIndex + 1} of {activeQuiz.questions.length}</span>
                <span className="text-orange-600">Score: {score}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQIndex + 1) / activeQuiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Text */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p className="font-heading font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                  {curQuestion.question}
                </p>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {curQuestion.options.map((opt, oIdx) => {
                  const isSelected = selectedOption === oIdx;
                  const isCorrect = oIdx === curQuestion.correctIndex;

                  let style = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-orange-400';

                  if (hasAnswered) {
                    if (isCorrect) {
                      style = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-100 font-bold';
                    } else if (isSelected) {
                      style = 'bg-red-100 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-100';
                    } else {
                      style = 'opacity-50 border-slate-200 dark:border-slate-700';
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      onClick={() => handleSelectOption(oIdx)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm font-medium transition-all flex items-center justify-between shadow-sm ${style}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Instant Everyday Explanation */}
              {hasAnswered && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1 animate-in fade-in">
                  <div className="font-bold flex items-center gap-1 text-orange-600">
                    <Flame className="w-3.5 h-3.5 fill-orange-500" />
                    <span>Everyday Mental Model:</span>
                  </div>
                  <p>{curQuestion.everydayAnalogy}</p>
                  <p className="opacity-80 pt-1 text-[11px]">{curQuestion.explanation}</p>
                </div>
              )}
            </div>
          ) : null}

        </div>

        {/* Footer */}
        {!isFinished && activeQuiz && (
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
            >
              Exit Arena
            </button>

            {hasAnswered && (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-1.5 transition-colors"
              >
                <span>{currentQIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
