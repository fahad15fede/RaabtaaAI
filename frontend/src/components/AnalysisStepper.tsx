import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, CircleDashed, Loader2 } from 'lucide-react';

interface AnalysisStepperProps {
  onComplete?: () => void;
}

export const AnalysisStepper: React.FC<AnalysisStepperProps> = ({ onComplete }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    t('stepper.step1'),
    t('stepper.step2'),
    t('stepper.step3'),
    t('stepper.step4'),
    t('stepper.step5'),
    t('stepper.step6')
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="civic-card p-6 sm:p-8 max-w-md mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#006600] flex items-center justify-center mx-auto">
          <Loader2 className="w-6 h-6 animate-spin text-[#006600]" />
        </div>
        <h3 className="font-bold text-lg text-[#1F2937]">
          {t('report.analyzing')}
        </h3>
        <p className="text-xs text-gray-500">
          RabtaaAI AI is orchestrating municipal routing
        </p>
      </div>

      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 text-sm transition-all duration-300 ${
                isDone
                  ? 'text-emerald-700 font-medium'
                  : isCurrent
                  ? 'text-[#006600] font-semibold scale-[1.02]'
                  : 'text-gray-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[#006600] flex-shrink-0 animate-in zoom-in" />
              ) : isCurrent ? (
                <Loader2 className="w-5 h-5 text-[#006600] animate-spin flex-shrink-0" />
              ) : (
                <CircleDashed className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
