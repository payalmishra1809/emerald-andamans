import React, { useState, useEffect } from 'react';
import { X, MapPin, Sparkles, ArrowRight } from 'lucide-react';
import { IslandStory } from '../types';

interface StoryViewerModalProps {
  story: IslandStory | null;
  onClose: () => void;
  onAskOcto: (prompt: string) => void;
  onOpenDestination?: (destinationId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  story,
  onClose,
  onAskOcto,
  onOpenDestination,
}) => {
  if (!story) return null;

  const [slideIndex, setSlideIndex] = useState<number>(0);
  const totalSlides = story.slides.length;
  const currentSlide = story.slides[slideIndex] || story.slides[0];

  useEffect(() => {
    setSlideIndex(0);
  }, [story]);

  // Auto-advance story after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (slideIndex < totalSlides - 1) {
        setSlideIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [slideIndex, totalSlides, onClose]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slideIndex > 0) setSlideIndex((prev) => prev - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (slideIndex < totalSlides - 1) {
      setSlideIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Story Container (Portrait format) */}
      <div className="relative w-full max-w-sm h-[85vh] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
        {/* Story Progress Bars */}
        <div className="absolute top-3 left-3 right-3 z-20 flex gap-1.5">
          {story.slides.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden bg-white/30"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  i < slideIndex ? 'w-full' : i === slideIndex ? 'w-full animate-pulse' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Story Top Info */}
        <div className="absolute top-6 left-4 right-4 z-20 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-teal-400">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm drop-shadow">{story.title}</div>
              <div className="text-[11px] text-teal-200 drop-shadow flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{currentSlide.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Photo */}
        <img
          src={currentSlide.imageUrl}
          alt={currentSlide.caption}
          className="w-full h-full object-cover"
        />

        {/* Touch Navigation Halves */}
        <div
          onClick={handlePrev}
          className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
        />
        <div
          onClick={handleNext}
          className="absolute inset-y-0 right-0 w-2/3 z-10 cursor-pointer"
        />

        {/* Story Bottom Caption & Local Tip */}
        <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2 pointer-events-auto">
          {currentSlide.octoTip && (
            <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-md border border-teal-500/40 text-teal-200 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span className="font-medium">{currentSlide.octoTip}</span>
            </div>
          )}

          <div className="p-3.5 rounded-2xl bg-black/70 backdrop-blur-md text-white text-xs sm:text-sm leading-relaxed">
            {currentSlide.caption}
          </div>

          <div className="flex gap-2">
            {currentSlide.destinationId && onOpenDestination && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDestination(currentSlide.destinationId!);
                }}
                className="flex-1 py-2 bg-white text-slate-900 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md hover:bg-slate-100"
              >
                <span>View Spot Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onAskOcto(`Tell me more about visiting ${currentSlide.location} on ${story.island}!`);
              }}
              className="flex-1 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Octo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
