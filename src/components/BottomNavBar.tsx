import React from 'react';
import { Home, Compass, CalendarCheck, User } from 'lucide-react';
import { OctoAvatar } from './OctoAvatar';

export type TabType = 'home' | 'explore' | 'planner' | 'profile';

interface BottomNavBarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenOctoAssistant: () => void;
  isOctoOpen: boolean;
  savedCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenOctoAssistant,
  isOctoOpen,
  savedCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#052440]/95 backdrop-blur-md border-t border-teal-100/70 dark:border-[#0d3b61] shadow-2xl transition-colors">
      <div className="max-w-lg mx-auto px-3 sm:px-6 h-16 flex items-center justify-between relative">
        {/* Tab 1: Home Feed */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-colors ${
            activeTab === 'home' && !isOctoOpen
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' && !isOctoOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
        </button>

        {/* Tab 2: 2x2 Reels */}
        <button
          id="tour-nav-reels"
          onClick={() => onSelectTab('explore')}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-colors ${
            activeTab === 'explore' && !isOctoOpen
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'explore' && !isOctoOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Reels</span>
        </button>

        {/* CIRCLED OCTO ASSISTANT (Center of bottom bar on every page, waving hand as hi symbol) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5 relative z-10">
          <button
            id="tour-nav-octo"
            onClick={onOpenOctoAssistant}
            className={`group relative flex flex-col items-center justify-center p-2 rounded-full transition-all duration-300 transform active:scale-95 focus:outline-none ${
              isOctoOpen
                ? 'bg-gradient-to-tr from-teal-500 to-cyan-400 ring-4 ring-teal-300 dark:ring-teal-700 scale-105 shadow-xl'
                : 'bg-gradient-to-tr from-teal-700 via-teal-600 to-cyan-600 hover:from-teal-600 hover:to-cyan-500 shadow-lg hover:shadow-cyan-500/25 ring-3 ring-white dark:ring-[#052440]'
            }`}
            title="Chat with Octo - Your Andaman AI Companion"
          >
            {/* Cute Hi Bubble Badge */}
            <span className="absolute -top-3.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md border border-white dark:border-slate-900 animate-bounce tracking-tight whitespace-nowrap">
              Hi! 👋
            </span>

            {/* Circled Octo Avatar with Waving Hand */}
            <div className="w-10 h-10 flex items-center justify-center">
              <OctoAvatar size={38} mood="waving" />
            </div>
          </button>
          <span className="text-[10px] mt-0.5 font-bold tracking-tight text-teal-700 dark:text-teal-300">
            Octo AI
          </span>
        </div>

        {/* Tab 3: Planner */}
        <button
          id="tour-nav-plan"
          onClick={() => onSelectTab('planner')}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-colors relative ${
            activeTab === 'planner' && !isOctoOpen
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <CalendarCheck className={`w-5 h-5 ${activeTab === 'planner' && !isOctoOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Plan</span>
        </button>

        {/* Tab 4: Pinterest-Style Profile (Only ONE Profile button as requested!) */}
        <button
          id="tour-nav-profile"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 focus:outline-none transition-colors relative ${
            activeTab === 'profile' && !isOctoOpen
              ? 'text-teal-600 dark:text-teal-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <User className={`w-5 h-5 ${activeTab === 'profile' && !isOctoOpen ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-teal-500 text-white text-[9px] font-bold flex items-center justify-center">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Profile</span>
        </button>
      </div>
    </nav>
  );
};
