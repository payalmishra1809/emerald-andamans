import React from 'react';
import { X, Bookmark, Trash2, ArrowRight, Star } from 'lucide-react';
import { Destination, TripItinerary } from '../types';

interface SavedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedDestinations: Destination[];
  onRemoveDestination: (id: string) => void;
  onSelectDestination: (destination: Destination) => void;
  savedItineraries: TripItinerary[];
  onRemoveItinerary: (title: string) => void;
  onSelectItinerary: (itinerary: TripItinerary) => void;
}

export const SavedDrawer: React.FC<SavedDrawerProps> = ({
  isOpen,
  onClose,
  savedDestinations,
  onRemoveDestination,
  onSelectDestination,
  savedItineraries,
  onRemoveItinerary,
  onSelectItinerary,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#052440] w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-[#0d3b61]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-[#0d3b61] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-500 fill-current" />
            <h2 className="text-base sm:text-lg font-bold font-['Outfit'] text-slate-900 dark:text-white">
              My Saved Bookmarks
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#021526] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* Saved Destinations Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Places ({savedDestinations.length})
            </h3>
            {savedDestinations.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#021526] text-xs text-slate-500 text-center">
                Tap the bookmark icon on any beach or reef card to save it here!
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedDestinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200 dark:border-[#0d3b61] group"
                  >
                    <img
                      src={dest.heroImageUrl}
                      alt={dest.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 cursor-pointer"
                      onClick={() => {
                        onSelectDestination(dest);
                        onClose();
                      }}
                    />
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        onSelectDestination(dest);
                        onClose();
                      }}
                    >
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-teal-600 transition-colors">
                        {dest.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">{dest.island}</p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{dest.rating}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveDestination(dest.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Itineraries Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Saved Itineraries ({savedItineraries.length})
            </h3>
            {savedItineraries.length === 0 ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#021526] text-xs text-slate-500 text-center">
                No itineraries saved yet. Use the <strong>Save Itinerary</strong> button in the planner!
              </div>
            ) : (
              <div className="space-y-3">
                {savedItineraries.map((itin, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200 dark:border-[#0d3b61] space-y-2 hover:border-teal-500 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-[#052440] px-2 py-0.5 rounded-md">
                          {itin.totalDays} Days
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {itin.title}
                        </h4>
                      </div>
                      <button
                        onClick={() => onRemoveItinerary(itin.title)}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Delete saved itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        onSelectItinerary(itin);
                        onClose();
                      }}
                      className="w-full py-1.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Load in Planner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] flex items-center justify-between text-xs text-slate-500">
          <span>Saved on your device</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-[#052440] text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
