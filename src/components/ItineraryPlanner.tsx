import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  Utensils,
  Backpack,
  Printer,
  Bookmark,
  Share2,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { TripItinerary } from '../types';
import { PRESET_ITINERARIES } from '../data/andamanData';

interface ItineraryPlannerProps {
  onOpenDestination?: (destinationNameOrId: string) => void;
  onSaveItinerary?: (itinerary: TripItinerary) => void;
  isSaved?: (title: string) => boolean;
  onRequestChatWithPrompt?: (prompt: string) => void;
}

export const ItineraryPlanner: React.FC<ItineraryPlannerProps> = ({
  onSaveItinerary,
  isSaved,
  onRequestChatWithPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'view' | 'create' | 'presets'>('view');
  const [currentItinerary, setCurrentItinerary] = useState<TripItinerary>(PRESET_ITINERARIES[0]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | 'all'>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // AI Generator Form State
  const [days, setDays] = useState<number>(5);
  const [travelStyle, setTravelStyle] = useState<string>('Balanced Explorer');
  const [selectedIslands, setSelectedIslands] = useState<string[]>([
    'Havelock Island (Swaraj Dweep)',
    'Neil Island (Shaheed Dweep)',
    'Port Blair',
  ]);
  const [budgetTier, setBudgetTier] = useState<string>('Comfort Standard (₹4,000 - ₹6,500/day)');
  const [travelersGroup, setTravelersGroup] = useState<string>('Couple');

  // Day customization prompt state
  const [customizingDay, setCustomizingDay] = useState<number | null>(null);
  const [tweakRequest, setTweakRequest] = useState<string>('');
  const [isTweaking, setIsTweaking] = useState<boolean>(false);

  const travelStyles = [
    { label: 'Balanced Explorer', desc: 'Beaches, heritage & top highlights' },
    { label: 'Romantic Honeymoon', desc: 'Secluded sunsets & seaside dining' },
    { label: 'Adrenaline & Scuba', desc: 'Deep diving, sea walks, night kayak' },
    { label: 'Relaxed Beach Bum', desc: 'Unrushed mornings, hammocks & cafes' },
    { label: 'Family with Kids', desc: 'Calm lagoons, glass-bottom boats' },
    { label: 'Heritage & Nature', desc: 'Cellular Jail, Ross Island, Chidiya Tapu' },
  ];

  const availableIslands = [
    'Havelock Island (Swaraj Dweep)',
    'Neil Island (Shaheed Dweep)',
    'Port Blair',
    'Diglipur (Ross & Smith)',
    'Baratang Island (Caves)',
  ];

  const handleToggleIsland = (island: string) => {
    if (selectedIslands.includes(island)) {
      if (selectedIslands.length > 1) {
        setSelectedIslands(selectedIslands.filter((i) => i !== island));
      }
    } else {
      setSelectedIslands([...selectedIslands, island]);
    }
  };

  const handleGenerateAiItinerary = async () => {
    setIsGenerating(true);
    setGenerationStep('Analyzing high-speed catamaran schedules (Nautika & Makruzz)...');

    try {
      const stepTimer1 = setTimeout(() => {
        setGenerationStep('Selecting best sunset spots and reef-safe adventure routes...');
      }, 1200);

      const stepTimer2 = setTimeout(() => {
        setGenerationStep('Building day-by-day schedule with realistic island transit times...');
      }, 2500);

      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days,
          travelStyle,
          islands: selectedIslands,
          budget: budgetTier,
          travelers: travelersGroup,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        throw new Error('Failed to generate itinerary');
      }

      const data = await response.json();
      if (data.itinerary) {
        const fullItinerary: TripItinerary = {
          ...data.itinerary,
          id: `custom_${Date.now()}`,
          isCustom: true,
          createdAt: Date.now(),
        };
        setCurrentItinerary(fullItinerary);
        setActiveTab('view');
        setSelectedDayIndex('all');
      }
    } catch (err) {
      console.error('Error generating itinerary:', err);
      // Fallback
      const matchingPreset = PRESET_ITINERARIES.find((p) => p.totalDays === days) || PRESET_ITINERARIES[0];
      setCurrentItinerary(matchingPreset);
      setActiveTab('view');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleApplyTweakToDay = async (dayNumber: number) => {
    if (!tweakRequest.trim()) return;
    setIsTweaking(true);
    try {
      const prompt = `I am reviewing Day ${dayNumber} in my Andaman itinerary on ${currentItinerary.days[dayNumber - 1]?.island}. Please tweak it: "${tweakRequest}". Provide specific suggestions for morning, afternoon, and evening.`;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      });
      const data = await res.json();
      if (data.reply) {
        const updatedDays = [...currentItinerary.days];
        const dayIdx = dayNumber - 1;
        if (updatedDays[dayIdx]) {
          updatedDays[dayIdx] = {
            ...updatedDays[dayIdx],
            octoSecretTip: `💡 *Customized for "${tweakRequest.trim()}":*\n${data.reply.slice(0, 280)}...`,
          };
          setCurrentItinerary({
            ...currentItinerary,
            days: updatedDays,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTweaking(false);
      setCustomizingDay(null);
      setTweakRequest('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentItinerary.title,
        text: `${currentItinerary.title} - ${currentItinerary.tagline} on EMERALD ANDAMAN`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Itinerary link copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div
        id="tour-plan-card"
        className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white relative overflow-hidden shadow-xl border border-teal-800/40"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center shrink-0 text-teal-300">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[11px] uppercase tracking-wider font-extrabold text-teal-300">
                  Archipelago Logistics
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-bold px-2 py-0.2 rounded-full border border-teal-500/30">
                  AI Powered
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] tracking-tight">
                Andaman Itinerary Planner
              </h1>
              <p className="text-slate-300 text-xs mt-0.5">
                Real catamaran ferries (Nautika/Makruzz), tide windows, and sunset timings.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-2xl border border-slate-700/80 w-full sm:w-auto overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('view')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === 'view' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Current Plan
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === 'create' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>AI Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === 'presets' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Curated Routes
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AI GENERATOR */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-[#052440] rounded-3xl p-5 sm:p-7 shadow-sm border border-teal-100 dark:border-[#0d3b61] space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Build Your Custom Andaman Trip
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specify days, travel style, and islands. Octo will arrange high-speed catamarans and low-tide walks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration & Style */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Duration: {days} Days / {days - 1} Nights
                  </label>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  Travel Vibe
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {travelStyles.map((style) => (
                    <button
                      key={style.label}
                      type="button"
                      onClick={() => setTravelStyle(style.label)}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        travelStyle === style.label
                          ? 'border-teal-600 bg-teal-50 dark:bg-[#021526] text-teal-900 dark:text-teal-200 font-bold ring-1 ring-teal-500'
                          : 'border-slate-200 dark:border-[#0d3b61] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold">{style.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Who is Traveling?
                </label>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['Solo', 'Couple / Honeymoon', 'Family with Kids', 'Friends Group'].map((grp) => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => setTravelersGroup(grp)}
                      className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                        travelersGroup === grp
                          ? 'bg-teal-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-[#021526] text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {grp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Islands & Action */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                  Islands to Include
                </label>
                <div className="space-y-1.5">
                  {availableIslands.map((island) => {
                    const isChecked = selectedIslands.includes(island);
                    return (
                      <div
                        key={island}
                        onClick={() => handleToggleIsland(island)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                          isChecked
                            ? 'border-teal-500 bg-teal-50/50 dark:bg-[#021526] text-teal-900 dark:text-teal-200 font-bold'
                            : 'border-slate-200 dark:border-[#0d3b61] text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isChecked
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : 'border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                          <span>{island}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Target Budget
                </label>
                <select
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-800 dark:text-slate-200"
                >
                  <option value="Budget Explorer (₹2,500 - ₹3,500/day)">
                    Budget Explorer (~₹2,500 - ₹3,500 / day)
                  </option>
                  <option value="Comfort Standard (₹4,000 - ₹6,500/day)">
                    Comfort Standard (~₹4,000 - ₹6,500 / day)
                  </option>
                  <option value="Luxury Eco-Resorts (₹9,000+ /day)">
                    Luxury Eco-Resorts (~₹9,000+ / day)
                  </option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGenerateAiItinerary}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate AI Itinerary</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isGenerating && (
            <div className="p-4 bg-teal-50 dark:bg-[#021526] rounded-2xl border border-teal-200 dark:border-[#0d3b61] text-center space-y-2 animate-pulse">
              <Sparkles className="w-8 h-8 text-teal-500 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                {generationStep}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESET ITINERARIES */}
      {activeTab === 'presets' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Curated Andaman Routes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tested routes that minimize jetty buffer times and maximize beach magic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_ITINERARIES.map((preset) => (
              <div
                key={preset.id}
                className="bg-white dark:bg-[#052440] rounded-3xl p-5 border border-teal-100 dark:border-[#0d3b61] shadow-sm flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-[#021526] px-2.5 py-0.5 rounded-full">
                      {preset.totalDays} Days
                    </span>
                    <span className="text-xs text-slate-500">{preset.estimatedBudgetPerPerson}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.tagline}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setCurrentItinerary(preset);
                    setActiveTab('view');
                    setSelectedDayIndex('all');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-[#021526] hover:bg-teal-600 hover:text-white text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Load This Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CURRENT ITINERARY TIMELINE VIEW */}
      {activeTab === 'view' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Card */}
          <div className="bg-white dark:bg-[#052440] rounded-3xl p-5 sm:p-7 shadow-sm border border-teal-100 dark:border-[#0d3b61] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#0d3b61]">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-teal-100 dark:bg-[#021526] text-teal-800 dark:text-teal-300 px-2.5 py-0.5 rounded-full font-bold">
                    {currentItinerary.totalDays} Days
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Est: {currentItinerary.estimatedBudgetPerPerson}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  {currentItinerary.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentItinerary.tagline}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSaveItinerary && onSaveItinerary(currentItinerary)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    isSaved && isSaved(currentItinerary.title)
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'border-slate-300 dark:border-[#0d3b61] text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  <span>{isSaved && isSaved(currentItinerary.title) ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-xl border border-slate-300 dark:border-[#0d3b61] text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  title="Print / PDF"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl border border-slate-300 dark:border-[#0d3b61] text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Octo's Route Overview */}
            <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-[#021526] border border-teal-200/80 dark:border-[#0d3b61] text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
              "{currentItinerary.octoIntro}"
            </div>

            {/* Essential Packing Tags */}
            {currentItinerary.essentialPacking && currentItinerary.essentialPacking.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  <Backpack className="w-3.5 h-3.5 text-teal-600" />
                  <span>Packing Essentials:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentItinerary.essentialPacking.map((packItem) => (
                    <span
                      key={packItem}
                      className="text-[11px] bg-slate-100 dark:bg-[#021526] text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-[#0d3b61]"
                    >
                      {packItem}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DAY FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedDayIndex('all')}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                selectedDayIndex === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-white dark:bg-[#052440] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#0d3b61]'
              }`}
            >
              All {currentItinerary.days.length} Days
            </button>
            {currentItinerary.days.map((day) => (
              <button
                key={day.dayNumber}
                onClick={() => setSelectedDayIndex(day.dayNumber)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedDayIndex === day.dayNumber
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-white dark:bg-[#052440] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#0d3b61]'
                }`}
              >
                Day {day.dayNumber}: {day.island.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {/* DAY TIMELINE CARDS */}
          <div className="space-y-5">
            {currentItinerary.days
              .filter((day) => selectedDayIndex === 'all' || selectedDayIndex === day.dayNumber)
              .map((day) => (
                <div
                  key={day.dayNumber}
                  className="bg-white dark:bg-[#052440] rounded-3xl p-5 sm:p-6 shadow-sm border border-teal-100 dark:border-[#0d3b61] space-y-4"
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#0d3b61]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-teal-600 text-white font-extrabold flex items-center justify-center text-sm font-['Outfit']">
                        {day.dayNumber}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                          {day.island}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {day.dayTheme}
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => setCustomizingDay(customizingDay === day.dayNumber ? null : day.dayNumber)}
                      className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-[#021526] px-2.5 py-1 rounded-lg border border-teal-200 dark:border-[#0d3b61] flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Tweak Day</span>
                    </button>
                  </div>

                  {/* Tweak Prompt Input */}
                  {customizingDay === day.dayNumber && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200 dark:border-[#0d3b61] flex gap-2">
                      <input
                        type="text"
                        value={tweakRequest}
                        onChange={(e) => setTweakRequest(e.target.value)}
                        placeholder="e.g. Swap afternoon for snorkeling or add cafe time..."
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-[#0d3b61] bg-white dark:bg-[#052440] text-slate-900 dark:text-white"
                      />
                      <button
                        disabled={isTweaking || !tweakRequest.trim()}
                        onClick={() => handleApplyTweakToDay(day.dayNumber)}
                        className="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold disabled:opacity-40"
                      >
                        {isTweaking ? 'Updating...' : 'Tweak'}
                      </button>
                    </div>
                  )}

                  {/* Secret Tip */}
                  <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-[#021526] border border-amber-200/70 dark:border-[#0d3b61] text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{day.octoSecretTip}</span>
                  </div>

                  {/* 3 Slots */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Morning */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200/80 dark:border-[#0d3b61] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-[#052440] px-2 py-0.5 rounded text-[10px]">
                          Morning
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{day.morning.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{day.morning.activity}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        {day.morning.description}
                      </p>
                    </div>

                    {/* Afternoon */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200/80 dark:border-[#0d3b61] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-700 dark:text-cyan-400 bg-cyan-100 dark:bg-[#052440] px-2 py-0.5 rounded text-[10px]">
                          Afternoon
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{day.afternoon.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{day.afternoon.activity}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        {day.afternoon.description}
                      </p>
                    </div>

                    {/* Evening */}
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200/80 dark:border-[#0d3b61] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-[#052440] px-2 py-0.5 rounded text-[10px]">
                          Sunset & Eve
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{day.evening.time}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{day.evening.activity}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                        {day.evening.description}
                      </p>
                    </div>
                  </div>

                  {/* Dining & Logistics Footer */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#0d3b61] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">
                        <strong>Dining:</strong> {day.diningSpot}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                      <span className="truncate">
                        <strong>Logistics:</strong> {day.logisticsSummary}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
