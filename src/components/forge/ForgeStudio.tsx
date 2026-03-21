import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForgeStore } from '@/stores/forgeStore';
import StepBaseModel from './StepBaseModel';
import StepDataset from './StepDataset';
import StepConfig from './StepConfig';
import StepHardware from './StepHardware';
import StepTraining from './StepTraining';

const STEPS = [
  { num: 1, title: 'Base Model', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
  { num: 2, title: 'Training Data', icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12' },
  { num: 3, title: 'Configure', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06' },
  { num: 4, title: 'Hardware', icon: 'M22 12H2M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89' },
  { num: 5, title: 'Training', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8' },
];

export default function ForgeStudio() {
  const { currentStep, loadTrainableModels } = useForgeStore();

  useEffect(() => {
    loadTrainableModels();
  }, [loadTrainableModels]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8 px-4">
        {STEPS.map((step, i) => {
          const isActive = currentStep === step.num;
          const isComplete = currentStep > step.num;
          return (
            <div key={step.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all
                    ${isActive
                      ? 'bg-gradient-to-br from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/20'
                      : isComplete
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}
                >
                  {isComplete ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span className={`text-[10px] mt-1.5 ${isActive ? 'text-cyan-400' : 'text-white/20'}`}>
                  {step.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-12 md:w-20 h-0.5 mx-2 rounded ${isComplete ? 'bg-green-500/30' : 'bg-white/5'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          {currentStep === 1 && <StepBaseModel />}
          {currentStep === 2 && <StepDataset />}
          {currentStep === 3 && <StepConfig />}
          {currentStep === 4 && <StepHardware />}
          {currentStep === 5 && <StepTraining />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}