import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Bookmark, PlusCircle, Waves, Palette, Check } from 'lucide-react';
import { ThemeMode } from '../types';

interface InstagramTopBarProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  savedCount?: number;
  onOpenSaved?: () => void;
  onCreatePost?: () => void;
  onOpenTutorial?: () => void;
}

export const InstagramTopBar: React.FC<InstagramTopBarProps> = ({
  currentTheme,
  onSelectTheme,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themeOptions: Array<{
    id: ThemeMode;
    label: string;
    description: string;
    swatch: string;
    icon: string;
  }> = [
    {
      id: 'dark-blue',
      label: 'Deep Abyss Blue',
      description: 'Default darkest ocean blue & vibrant turquoise',
      swatch: 'bg-[#021526] border-[#14b8a6]',
      icon: '🌊',
    },
    {
      id: 'black-white',
      label: 'OLED Pitch Black',
      description: 'Pure high-contrast monochrome black & white',
      swatch: 'bg-[#000000] border-white',
      icon: '🌌',
    },
    {
      id: 'light-blue',
      label: 'Sky & Lagoon Blue',
      description: 'Lighter blue hues with breezy ocean vibes',
      swatch: 'bg-[#e0f2fe] border-[#0284c7]',
      icon: '🐬',
    },
    {
      id: 'white',
      label: 'Clean Crisp White',
      description: 'Pure bright white with emerald accents',
      swatch: 'bg-white border-slate-300',
      icon: '🏖️',
    },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-[#021526]/95 backdrop-blur-md border-b border-teal-100/70 dark:border-[#0d3b61] transition-colors shadow-xs">
      <div className="max-w-2xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo & Title: EMERALD ANDAMAN in one clean line in a professional font */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-400/25 shrink-0">
            <Waves className="w-4 h-4" />
          </div>
          <h1 className="font-black text-lg sm:text-xl tracking-[0.14em] uppercase text-slate-900 dark:text-white font-['Outfit'] truncate select-none">
            Emerald Andaman
          </h1>
        </div>

        {/* Right Actions: ONLY THEME PICKER BUTTON as requested! */}
        <div className="flex items-center">
          <div className="relative" ref={menuRef}>
            <button
              id="tour-theme-btn"
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-[#052440] border border-transparent hover:border-teal-200 dark:hover:border-[#0d3b61] transition-all focus:outline-none flex items-center gap-1.5"
              title="Theme Settings (Deep Blue, OLED Black/White, Sky Lagoon, Crisp White)"
              aria-label="Theme settings"
            >
              <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </button>

            {/* Theme Dropdown Menu */}
            {isThemeMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#052440] border border-teal-100 dark:border-[#0d3b61] shadow-2xl p-2 z-50 animate-fadeIn space-y-1">
                <div className="px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Select Theme Palette
                </div>
                {themeOptions.map((opt) => {
                  const isSelected = currentTheme === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onSelectTheme(opt.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-[#021526] font-bold text-teal-900 dark:text-teal-200 ring-1 ring-teal-500'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#083256]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[10px] ${opt.swatch}`}
                      >
                        {opt.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {opt.description}
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
