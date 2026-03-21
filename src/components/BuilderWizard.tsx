import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BUILDER_QUESTIONS } from '../data/builderQuestions';

interface Props {
  onComplete: (answers: Record<string, string>) => void;
  onBack: () => void;
}

export default function BuilderWizard({ onComplete, onBack }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [multiSelections, setMultiSelections] = useState<Set<string>>(new Set());
  const question = BUILDER_QUESTIONS[step];
  const total = BUILDER_QUESTIONS.length;

  const select = (optionId: string) => {
    if (question.multi) {
      setMultiSelections(prev => {
        const next = new Set(prev);
        if (next.has(optionId)) next.delete(optionId); else next.add(optionId);
        return next;
      });
    } else {
      const newAnswers = { ...answers, [question.id]: optionId };
      setAnswers(newAnswers);
      if (step < total - 1) {
        setTimeout(() => setStep(s => s + 1), 300);
      } else {
        setTimeout(() => onComplete(newAnswers), 400);
      }
    }
  };

  const confirmMulti = () => {
    if (multiSelections.size === 0) return;
    const newAnswers = { ...answers, [question.id]: Array.from(multiSelections).join(',') };
    setAnswers(newAnswers);
    setMultiSelections(new Set());
    if (step < total - 1) {
      setStep(s => s + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const goBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
      setMultiSelections(new Set());
    } else {
      onBack();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-3">
          <button onClick={goBack} className="text-gray-400 hover:text-white transition font-space text-sm">
            ← {step > 0 ? 'Previous' : 'Back'}
          </button>
          <span className="font-space text-sm text-gray-400">
            Step {step + 1} of {total}
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            animate={{ width: `${((step + 1) / total) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          <h2 className="text-2xl sm:text-3xl font-orbitron font-bold text-center mb-2 gradient-text">
            {question.title}
          </h2>
          <p className="text-gray-400 text-center mb-8 font-space text-sm">
            {question.subtitle}
            {question.multi && <span className="text-primary ml-2">(Select multiple)</span>}
          </p>

          <div className={`grid gap-3 ${question.multi ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
            {question.options.map(opt => {
              const isSelected = question.multi
                ? multiSelections.has(opt.id)
                : answers[question.id] === opt.id;

              return (
                <motion.button
                  key={opt.id}
                  onClick={() => select(opt.id)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative p-4 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary/60 bg-primary/15 shadow-lg shadow-primary/20'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center"
                    >
                      <span className="text-[10px] text-black font-bold">✓</span>
                    </motion.div>
                  )}
                  <div className="text-2xl mb-2">{opt.icon}</div>
                  <div className="font-space font-semibold text-sm text-white">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{opt.description}</div>
                </motion.button>
              );
            })}
          </div>

          {/* Confirm button for multi-select */}
          {question.multi && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <button
                onClick={confirmMulti}
                disabled={multiSelections.size === 0}
                className={`px-8 py-3 rounded-xl font-orbitron font-bold text-sm transition-all ${
                  multiSelections.size > 0
                    ? 'bg-gradient-to-r from-primary to-secondary hover:opacity-90 hover:scale-105 active:scale-95'
                    : 'bg-white/10 text-gray-500 cursor-not-allowed'
                }`}
              >
                {multiSelections.size > 0
                  ? `Confirm ${multiSelections.size} Permission${multiSelections.size > 1 ? 's' : ''} →`
                  : 'Select at least one permission'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
