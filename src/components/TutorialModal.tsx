import React, { useState } from 'react';
import {
  Compass,
  Film,
  Bookmark,
  CalendarCheck,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Grid,
} from 'lucide-react';
import { OctoAvatar } from './OctoAvatar';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreReels?: () => void;
  onOpenPlanner?: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({
  isOpen,
  onClose,
  onExploreReels,
  onOpenPlanner,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to EMERALD ANDAMAN',
      subtitle: 'Your ultimate island travel companion & AI guide',
      description:
        'Discover the best of the Andaman archipelago with verified catamaran timings, living coral sanctuaries, sunset spots, and Octo—your witty AI octopus assistant!',
      icon: (
        <div className="relative">
          <OctoAvatar size={72} mood="waving" showHiBubble={true} />
        </div>
      ),
      highlight: 'Look out for Octo circled at the bottom of every page waving hello!',
      badge: 'Step 1 of 5',
    },
    {
      title: '2x2 Island Reels Grid',
      subtitle: 'Browse 4 immersive travel reels per page',
      description:
        'Browse island moments in a tidy 2x2 grid format. Tap any reel to watch it full-screen. Tap the Details button on any reel to instantly open the complete destination guide with safety rules and how-to-reach tips!',
      icon: (
        <div className="w-16 h-16 rounded-3xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
          <Grid className="w-9 h-9" />
        </div>
      ),
      highlight: 'No spam comments—just tap "Details" for insider facts!',
      badge: 'Step 2 of 5',
    },
    {
      title: 'Pinterest-Style Location Boards',
      subtitle: 'Organized by Andaman islands & secret bays',
      description:
        'Visit your Profile to explore Pinterest-style boards categorized by locations: Havelock (Swaraj Dweep), Neil Island (Shaheed Dweep), Port Blair, Diglipur, Baratang, Little Andaman, and more. Save your favorite pins to each board!',
      icon: (
        <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
          <Bookmark className="w-9 h-9" />
        </div>
      ),
      highlight: 'Create custom boards or browse curated island collections.',
      badge: 'Step 3 of 5',
    },
    {
      title: 'AI Catamaran Ferry Planner',
      subtitle: 'Realistic logistics, tides, and timings',
      description:
        'Generate custom day-by-day itineraries tailored to your pace. Octo calculates Nautika and Makruzz ferry connections, low-tide windows for the Natural Bridge, and sunset schedules so you never get stranded!',
      icon: (
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <CalendarCheck className="w-9 h-9" />
        </div>
      ),
      highlight: 'Save multiple itineraries and view them offline anytime.',
      badge: 'Step 4 of 5',
    },
    {
      title: 'Octo AI Always Ready at the Bottom',
      subtitle: 'Ask about cash rules, scuba, permits & tides',
      description:
        'You don’t have to switch away from what you’re viewing. Tap the circled Octo waving at the bottom of any page to ask about ATM warnings on Neil, scuba requirements, or ferry baggage limits!',
      icon: (
        <div className="relative">
          <OctoAvatar size={68} mood="excited" />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
        </div>
      ),
      highlight: 'Ready to embark on your Andaman adventure?',
      badge: 'Step 5 of 5',
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = () => {
    try {
      localStorage.setItem('emerald_tutorial_completed', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-[#052440] rounded-3xl border border-teal-100 dark:border-[#0d3b61] shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Top Progress & Close Button */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-[#0d3b61]/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-[#021526] px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-[#0d3b61]">
              {current.badge}
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Skip Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6 text-center space-y-4">
          {/* Centered Graphic */}
          <div className="flex justify-center py-2">{current.icon}</div>

          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              {current.title}
            </h3>
            <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
              {current.subtitle}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xs mx-auto">
            {current.description}
          </p>

          <div className="p-3 rounded-2xl bg-teal-50/80 dark:bg-[#021526] border border-teal-200/80 dark:border-[#0d3b61] text-xs text-teal-900 dark:text-teal-200 font-medium">
            💡 {current.highlight}
          </div>
        </div>

        {/* Step Indicator Dots */}
        <div className="flex justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? 'w-6 bg-teal-600'
                  : 'w-1.5 bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-[#0d3b61]/80 bg-slate-50/60 dark:bg-[#021526] flex items-center justify-between gap-3">
          {currentStep > 0 ? (
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Skip
            </button>
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 ml-auto"
          >
            <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
