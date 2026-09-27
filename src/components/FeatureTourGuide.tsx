import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Compass,
  CalendarCheck,
  User,
  Home,
  CheckCircle,
  Film,
  Bookmark,
  Waves,
} from 'lucide-react';
import { OctoAvatar } from './OctoAvatar';

export type TourTabType = 'home' | 'explore' | 'planner' | 'profile';

interface FeatureTourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: TourTabType) => void;
  currentTab?: TourTabType;
}

interface TourStep {
  stepNumber: string;
  tab: TourTabType;
  targetId: string;
  pageLabel: string;
  title: string;
  description: string;
  position: 'bottom' | 'top' | 'center';
  badge: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    stepNumber: 'Step 01',
    tab: 'home',
    targetId: 'tour-theme-btn',
    pageLabel: 'Home',
    title: 'Color Themes & Palettes',
    description:
      'Tap the palette icon to switch between Deep Abyss Blue, OLED Pitch Black, Sky Lagoon Light Blue, or Crisp Clean White across the whole app!',
    position: 'bottom',
    badge: 'Header • Themes',
  },
  {
    stepNumber: 'Step 02',
    tab: 'home',
    targetId: 'tour-home-stories',
    pageLabel: 'Home',
    title: 'Island Stories Carousel',
    description:
      'Tap any circular island story to view full-screen highlights with glowing rings, tips from local travelers, and photo galleries from Havelock to Diglipur.',
    position: 'bottom',
    badge: 'Home Feed',
  },
  {
    stepNumber: 'Step 03',
    tab: 'explore',
    targetId: 'tour-reels-grid',
    pageLabel: 'Reels',
    title: '2x2 Island Reels Grid',
    description:
      'Reels page displays four video reels in a responsive 2x2 grid. Tap any reel to watch full-screen with tropical music, sound toggles, and creator captions.',
    position: 'top',
    badge: 'Reels Page • 2x2 Grid',
  },
  {
    stepNumber: 'Step 04',
    tab: 'explore',
    targetId: 'tour-reels-details',
    pageLabel: 'Reels',
    title: 'One-Tap Spot Details',
    description:
      'Replaced the comment icon with a dedicated "Details" button. Tap it on any reel to immediately open the complete spot guide with dos & don\'ts, facts, and ferry tips!',
    position: 'top',
    badge: 'Reels • Spot Guide',
  },
  {
    stepNumber: 'Step 05',
    tab: 'planner',
    targetId: 'tour-plan-card',
    pageLabel: 'Plan',
    title: 'Catamaran Ferry & Route Planner',
    description:
      'Plan customized 2 to 10 day itineraries with realistic catamaran transit times (Nautika & Makruzz), tide windows, sunset timings, and daily breakdowns!',
    position: 'bottom',
    badge: 'Planner Page',
  },
  {
    stepNumber: 'Step 06',
    tab: 'profile',
    targetId: 'tour-profile-tabs',
    pageLabel: 'Profile',
    title: 'Pinterest Albums, Saved Locations & Activities',
    description:
      'Organize your dream trip into Pinterest-style albums by island (Havelock, Neil, Diglipur, Port Blair) and quickly view your saved locations and saved activities!',
    position: 'bottom',
    badge: 'Profile Page • Albums',
  },
  {
    stepNumber: 'Step 07',
    tab: 'profile',
    targetId: 'tour-nav-octo',
    pageLabel: 'Octo',
    title: 'Octo AI Companion Always Here',
    description:
      'Octo is circled at the bottom of EVERY page waving hello! Tap Octo from anywhere to ask about Neil Island cash rules, dive seasons, and ferry schedules.',
    position: 'top',
    badge: 'Every Page • AI Helper',
  },
];

export const FeatureTourGuide: React.FC<FeatureTourGuideProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentTab,
}) => {
  // Determine starting step based on the page where user triggered the guide
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // When guide opens, jump to step matching current tab if relevant
  useEffect(() => {
    if (isOpen && currentTab) {
      const matchIndex = TOUR_STEPS.findIndex((s) => s.tab === currentTab);
      if (matchIndex !== -1) {
        setCurrentStepIndex(matchIndex);
      }
    }
  }, [isOpen, currentTab]);

  const step = TOUR_STEPS[currentStepIndex];

  // Automatically navigate to the step's page tab when step changes
  useEffect(() => {
    if (!isOpen) return;
    if (step && step.tab && onNavigateTab) {
      onNavigateTab(step.tab);
    }
  }, [isOpen, currentStepIndex, step?.tab]);

  // Measure target element position after rendering
  useEffect(() => {
    if (!isOpen || !step) return;

    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        // Softly bring into view
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    updateRect();
    const t1 = setTimeout(updateRect, 100);
    const t2 = setTimeout(updateRect, 300);
    const t3 = setTimeout(updateRect, 550);

    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [isOpen, currentStepIndex, step?.targetId]);

  if (!isOpen || !step) return null;

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleJumpToStep = (index: number) => {
    setCurrentStepIndex(index);
  };

  const handleComplete = () => {
    try {
      localStorage.setItem('emerald_tour_completed', 'true');
    } catch {}
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto animate-fadeIn">
      {/* Dimmed backdrop with transparent cutout / spotlight */}
      <div
        onClick={handleComplete}
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] transition-all duration-300"
      />

      {/* Target Element Spotlight Ring */}
      {targetRect && (
        <div
          className="absolute border-2 border-amber-400 rounded-2xl pointer-events-none transition-all duration-300 shadow-[0_0_0_9999px_rgba(2,21,38,0.7)] animate-pulse"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        >
          {/* Target Corner Accents */}
          <span className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300" />
          <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300" />
        </div>
      )}

      {/* FLOATING HOVERING POPOVER CARD WITH POINTER ARROW */}
      <div
        className="absolute z-50 w-full max-w-sm px-4 transition-all duration-300"
        style={
          targetRect
            ? step.position === 'bottom'
              ? {
                  top: Math.min(window.innerHeight - 300, targetRect.bottom + 16),
                  left: Math.max(16, Math.min(window.innerWidth - 360, targetRect.left - 40)),
                }
              : {
                  bottom: Math.min(
                    window.innerHeight - 80,
                    window.innerHeight - targetRect.top + 16
                  ),
                  left: Math.max(16, Math.min(window.innerWidth - 360, targetRect.left - 60)),
                }
            : {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
      >
        <div className="relative bg-white dark:bg-[#052440] text-slate-900 dark:text-white rounded-3xl p-4 sm:p-5 border border-teal-200 dark:border-[#0d3b61] shadow-2xl space-y-3">
          {/* Pointer Arrow pointing to target */}
          {targetRect && (
            <div
              className={`absolute left-12 w-3.5 h-3.5 bg-white dark:bg-[#052440] border-teal-200 dark:border-[#0d3b61] rotate-45 ${
                step.position === 'bottom' ? '-top-2 border-t border-l' : '-bottom-2 border-b border-r'
              }`}
            />
          )}

          {/* Quick Page Jump Pills (Home | Reels | Plan | Profile | Octo) */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#0d3b61] pb-2 overflow-x-auto scrollbar-none gap-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pl-0.5">
              Tour Pages:
            </span>
            <div className="flex items-center gap-1">
              {['Home', 'Reels', 'Plan', 'Profile', 'Octo'].map((label) => {
                const targetIdx = TOUR_STEPS.findIndex((s) => s.pageLabel === label);
                const isActive = step.pageLabel === label;
                return (
                  <button
                    key={label}
                    onClick={() => handleJumpToStep(targetIdx)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-[#021526] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleComplete}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 ml-1 cursor-pointer"
              title="Close Guide"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300 bg-amber-100 dark:bg-[#021526] px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-[#0d3b61]">
                {step.stepNumber} of 07
              </span>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 truncate max-w-[170px]">
                {step.badge}
              </span>
            </div>
          </div>

          {/* Body Content */}
          <div className="space-y-1">
            <h4 className="font-extrabold text-base font-['Outfit'] text-slate-900 dark:text-white">
              {step.title}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Dots & Nav Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#0d3b61]">
            <div className="flex gap-1">
              {TOUR_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleJumpToStep(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    i === currentStepIndex
                      ? 'w-4 bg-teal-600'
                      : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-400'
                  }`}
                  title={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Prev</span>
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition-colors flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <span>{currentStepIndex === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
