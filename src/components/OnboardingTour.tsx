import { useState, useEffect } from 'react';
import { Joyride, STATUS } from 'react-joyride';
import type { Step, EventData } from 'react-joyride';
import { HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const useOnboarding = (tourId: string) => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`tour_${tourId}_completed`);
    if (!hasSeenTour) {
      setRun(true);
    }
  }, [tourId]);

  const startTour = () => {
    setRun(true);
    setStepIndex(0);
  };

  const handleJoyrideCallback = (data: EventData) => {
    const { status, type, index, action } = data;
    
    // Manage stepIndex for controlled mode
    if (['step:after', 'error:target_not_found'].includes(type)) {
      if (action === 'next') setStepIndex(index + 1);
      if (action === 'prev') setStepIndex(index - 1);
    }

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      localStorage.setItem(`tour_${tourId}_completed`, 'true');
    }
  };

  const advanceTour = () => {
    setStepIndex(prev => prev + 1);
  };

  return { run, startTour, handleJoyrideCallback, stepIndex, advanceTour };
};

export const OnboardingTour = ({ run, steps, stepIndex, handleJoyrideCallback }: { run: boolean, steps: Step[], stepIndex?: number, handleJoyrideCallback: (data: EventData) => void }) => {
  const { t } = useTranslation();
  
  return (
    <Joyride
      stepIndex={stepIndex}
      steps={steps.map(s => ({ ...s, skipBeacon: true }))}
      run={run}
      continuous
      onEvent={handleJoyrideCallback}
      locale={{
        back: t('tour.back', 'Atrás'),
        close: t('tour.close', 'Cerrar'),
        last: t('tour.last', 'Finalizar'),
        next: t('tour.next', 'Siguiente'),
        skip: t('tour.skip', 'Omitir'),
      }}
      
    />
  );
};

export const TutorialButton = ({ onClick, className }: { onClick: () => void, className?: string }) => {
  const { t } = useTranslation();
  
  return (
    <button 
      onClick={onClick}
      className={className || "absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 hover:bg-blood-red/20 border border-gray-700 hover:border-blood-red text-gray-400 hover:text-white px-3 py-1.5 rounded-full transition-colors cursor-pointer group"}
      title="Ver Tutorial"
    >
      <HelpCircle size={16} className="group-hover:text-neon-red transition-colors" />
      <span className="font-mono text-[10px] uppercase tracking-widest hidden md:inline">{t('tour.button', 'Tutorial')}</span>
    </button>
  );
};
