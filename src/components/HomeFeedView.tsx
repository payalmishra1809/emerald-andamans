import React, { useState } from 'react';
import {
  Heart,
  Bookmark,
  Share2,
  MapPin,
  Star,
  Compass,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Destination, IslandStory } from '../types';
import { DESTINATIONS, ISLAND_STORIES } from '../data/andamanData';

interface HomeFeedViewProps {
  onSelectDestination: (dest: Destination) => void;
  savedIds: string[];
  onToggleSave: (dest: Destination) => void;
  onOpenPlanner: () => void;
  onAskOcto: (prompt: string) => void;
  onSelectStory: (story: IslandStory) => void;
}

export const HomeFeedView: React.FC<HomeFeedViewProps> = ({
  onSelectDestination,
  savedIds,
  onToggleSave,
  onOpenPlanner,
  onAskOcto,
  onSelectStory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [likedCardIds, setLikedCardIds] = useState<Record<string, boolean>>({});

  const categories = [
    { id: 'All', label: 'All Curated' },
    { id: 'Beach', label: '🏖️ Beaches' },
    { id: 'Water Activities', label: '🤿 Scuba & Corals' },
    { id: 'Historical', label: '🏛️ Heritage' },
    { id: 'Adventure', label: '🌋 Volcanic & Sea' },
    { id: 'Nature', label: '🏝️ Twin Sandbars & Lagoons' },
    { id: 'Waterfall', label: '🌊 Surfing & Waterfalls' },
  ];

  const handleToggleLike = (id: string) => {
    setLikedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = (dest: Destination) => {
    if (navigator.share) {
      navigator
        .share({
          title: dest.name,
          text: `Check out ${dest.name} on ${dest.island} in the Andaman Islands!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const filteredDestinations = DESTINATIONS.filter((d) => {
    if (selectedCategory === 'All') return true;
    return d.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="max-w-xl mx-auto pb-24 space-y-4 sm:space-y-5 animate-fadeIn">
      {/* 1. Instagram Stories Carousel */}
      <div
        id="tour-home-stories"
        className="w-full py-3 sm:py-3.5 overflow-x-auto scrollbar-none border-b border-teal-100/80 dark:border-[#0d3b61] bg-white/90 dark:bg-[#021526]/90 backdrop-blur-md transition-colors"
      >
        <div className="px-4 flex items-center gap-3.5 sm:gap-4">
          {ISLAND_STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => onSelectStory(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 group focus:outline-none cursor-pointer"
            >
              <div className="relative p-[2.5px] rounded-full story-ring transition-transform group-hover:scale-105 shadow-sm">
                <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full p-[2px] bg-white dark:bg-[#052440] transition-colors">
                  <div className="w-full h-full rounded-full overflow-hidden bg-teal-50 dark:bg-[#021526]">
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 tracking-tight max-w-[68px] truncate">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="px-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#052440] text-slate-600 dark:text-slate-300 border border-teal-100/80 dark:border-[#0d3b61] hover:border-teal-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Balanced Card Feed */}
      <div className="px-3 sm:px-4 space-y-6 sm:space-y-8">
        {filteredDestinations.map((dest, idx) => {
          const isSaved = savedIds.includes(dest.id);
          const isLiked = !!likedCardIds[dest.id];
          const displayLikes = dest.reviewCount + (isLiked ? 1 : 0);

          return (
            <article
              key={dest.id}
              className="bg-white dark:bg-[#052440] rounded-3xl overflow-hidden border border-teal-100/70 dark:border-[#0d3b61] shadow-sm hover:shadow-md transition-all group"
            >
              {/* Instagram-Style Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div
                  onClick={() => onSelectDestination(dest)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-teal-200 dark:border-[#0d3b61] shrink-0">
                    <img
                      src={dest.galleryImages[0] || dest.heroImageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white tracking-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      {dest.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-300 font-medium">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{dest.island}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {dest.category}
                </span>
              </div>

              {/* Card Photo (Framed without cutting off landmarks) */}
              <div
                onClick={() => onSelectDestination(dest)}
                className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden cursor-pointer bg-slate-950"
              >
                <img
                  src={dest.heroImageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-current" />
                  <span>{dest.rating}</span>
                </div>

                {/* Multi-Photo Indicator */}
                {dest.galleryImages.length > 0 && (
                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                    1/{dest.galleryImages.length + 1} Photos
                  </div>
                )}
              </div>

              {/* Action Icons Row */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-slate-700 dark:text-slate-200">
                    <button
                      onClick={() => handleToggleLike(dest.id)}
                      className="focus:outline-none transition-transform active:scale-125"
                      title="Like"
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          isLiked
                            ? 'text-rose-500 fill-rose-500'
                            : 'hover:text-rose-500'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => onSelectDestination(dest)}
                      className="flex items-center gap-1 text-xs font-bold hover:text-teal-600 dark:text-teal-400 transition-colors"
                      title="View Details"
                    >
                      <Info className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => handleShare(dest)}
                      className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleSave(dest)}
                    className="focus:outline-none transition-colors"
                    title={isSaved ? 'Remove from Saved Locations' : 'Save Location'}
                  >
                    <Bookmark
                      className={`w-6 h-6 ${
                        isSaved
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-700 dark:text-slate-200 hover:text-amber-500'
                      }`}
                    />
                  </button>
                </div>

                {/* Likes Counter */}
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {displayLikes.toLocaleString()} travelers recommend
                </div>

                {/* Caption Prose */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white mr-1.5">
                    {dest.name}
                  </span>
                  {dest.shortDescription}
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dest.activityTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-[#021526] px-2 py-0.5 rounded-md border border-teal-100 dark:border-[#0d3b61]"
                    >
                      #{tag.replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>

                {/* Footer Quick Action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#0d3b61]/60 text-xs">
                  <button
                    onClick={() => onSelectDestination(dest)}
                    className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Full Guide & Facts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      onAskOcto(`How can I include ${dest.name} into my Andaman trip? What are the timings?`)
                    }
                    className="text-slate-500 dark:text-slate-400 hover:text-teal-600 flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ask Octo AI</span>
                  </button>
                </div>
              </div>

              {/* Archipelago Travel Advisory */}
              {idx === 1 && (
                <div className="mx-4 mb-4 p-4 rounded-2xl bg-teal-50/80 dark:bg-[#021526] border border-teal-200/80 dark:border-[#0d3b61] flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-100 dark:bg-[#052440] text-teal-700 dark:text-teal-300 shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-teal-800 dark:text-teal-300 block mb-0.5">
                      Catamaran Check-In Rule:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      "Always report to Phoenix Bay Jetty (Port Blair) or Havelock Jetty 45 minutes before departure. High-speed catamarans (Nautika & Makruzz) close boarding gates promptly."
                    </p>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
