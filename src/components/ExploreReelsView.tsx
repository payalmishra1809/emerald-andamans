import React, { useState } from 'react';
import {
  Heart,
  Bookmark,
  MapPin,
  Play,
  Pause,
  Music,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Camera,
} from 'lucide-react';
import { TravelPost } from '../types';

interface ExploreReelsViewProps {
  posts: TravelPost[];
  onToggleLikePost: (postId: string) => void;
  onToggleSavePost: (postId: string) => void;
  onOpenDetails: (destinationIdOrName: string) => void;
  onOpenCreatePost: () => void;
  onAskOcto: (prompt: string) => void;
}

export const ExploreReelsView: React.FC<ExploreReelsViewProps> = ({
  posts,
  onToggleLikePost,
  onToggleSavePost,
  onOpenDetails,
  onOpenCreatePost,
  onAskOcto,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [activeReelModal, setActiveReelModal] = useState<TravelPost | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Filter reels
  const allReels = posts.filter((p) => p.type === 'reel');
  const filteredReels = selectedTag === 'All'
    ? allReels
    : allReels.filter((r) => r.tags?.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase())) ||
                             r.islandLocation.toLowerCase().includes(selectedTag.toLowerCase()));

  // 2x2 Grid: 4 reels per page
  const REELS_PER_PAGE = 4;
  const totalPages = Math.ceil(filteredReels.length / REELS_PER_PAGE) || 1;
  const safeCurrentPage = Math.min(currentPage, totalPages - 1);
  const currentReels = filteredReels.slice(
    safeCurrentPage * REELS_PER_PAGE,
    safeCurrentPage * REELS_PER_PAGE + REELS_PER_PAGE
  );

  const handleNextPage = () => {
    if (safeCurrentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (safeCurrentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleOpenReel = (reel: TravelPost) => {
    setActiveReelModal(reel);
    setIsPlaying(true);
  };

  const handleDetailsClick = (e: React.MouseEvent, reel: TravelPost) => {
    e.stopPropagation();
    if (reel.destinationId) {
      onOpenDetails(reel.destinationId);
    } else {
      onOpenDetails(reel.islandLocation);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-3 sm:px-4 space-y-4 animate-fadeIn">
      {/* Top Header & Tag Filters */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Island Reels
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              4 reels per page in 2x2 grid • Tap reel to watch, tap Details for guide
            </p>
          </div>
          <button
            onClick={onOpenCreatePost}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Post Reel</span>
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {['All', 'Havelock', 'Neil', 'Scuba', 'Volcano', 'Sunset', 'Sandbar'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setCurrentPage(0);
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTag === tag
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-white dark:bg-[#052440] text-slate-600 dark:text-slate-300 border border-teal-100 dark:border-[#0d3b61] hover:border-teal-400'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* 2x2 GRID FORMAT (Four reels in one page) */}
      <div id="tour-reels-grid" className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
        {currentReels.map((reel, index) => {
          return (
            <div
              key={reel.id}
              onClick={() => handleOpenReel(reel)}
              className="group relative aspect-[9/14] sm:aspect-[9/13] rounded-2xl overflow-hidden bg-slate-950 cursor-pointer shadow-md border border-teal-100/60 dark:border-[#0d3b61] flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
            >
              {/* Thumbnail / Video Simulation */}
              <img
                src={reel.imageUrl}
                alt={reel.caption}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-black/25 to-black/40" />

              {/* Top Bar on Card: Location & Duration */}
              <div className="relative z-10 p-2.5 flex items-center justify-between text-white">
                <span className="text-[10px] sm:text-xs font-bold bg-black/55 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 truncate max-w-[70%]">
                  <MapPin className="w-2.5 h-2.5 text-teal-300 shrink-0" />
                  <span className="truncate">{reel.islandLocation.split(',')[0]}</span>
                </span>
                <span className="text-[10px] font-semibold bg-black/60 px-1.5 py-0.5 rounded-md">
                  {reel.videoDuration || '0:30'}
                </span>
              </div>

              {/* Center Play Button Overlay */}
              <div className="relative z-10 self-center opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-500/80 backdrop-blur-md flex items-center justify-center text-white shadow-lg border border-white/30">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Bottom Card Content: Creator, Likes & DETAILS BUTTON */}
              <div className="relative z-10 p-2.5 space-y-1.5 text-white">
                <div className="flex items-center gap-1.5">
                  <img
                    src={reel.authorAvatar}
                    alt={reel.authorName}
                    className="w-5 h-5 rounded-full object-cover border border-teal-400"
                  />
                  <span className="text-[11px] font-bold truncate drop-shadow">
                    {reel.authorHandle}
                  </span>
                </div>

                <p className="text-[10px] sm:text-xs text-slate-200 line-clamp-1 leading-snug drop-shadow">
                  {reel.caption}
                </p>

                {/* Engagement Icons Row: Likes, DETAILS (replaces comments), Save */}
                <div className="pt-1 flex items-center justify-between border-t border-white/20">
                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleLikePost(reel.id);
                    }}
                    className="flex items-center gap-1 text-[11px] hover:text-rose-400 transition-colors"
                    title="Like Reel"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        reel.isLikedByMe ? 'text-rose-500 fill-rose-500' : 'text-white'
                      }`}
                    />
                    <span>{reel.likesCount}</span>
                  </button>

                  {/* DETAILS ICON BUTTON (Replaced comment icon!) */}
                  <button
                    id={index === 0 ? 'tour-reels-details' : undefined}
                    onClick={(e) => handleDetailsClick(e, reel)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-teal-600/90 hover:bg-teal-500 text-white text-[11px] font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="View Destination Details"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-300" />
                    <span>Details</span>
                  </button>

                  {/* Save Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSavePost(reel.id);
                    }}
                    className="p-1 text-white hover:text-amber-400 transition-colors"
                    title="Save Reel"
                  >
                    <Bookmark
                      className={`w-3.5 h-3.5 ${
                        reel.isSavedByMe ? 'text-amber-400 fill-amber-400' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2x2 Page Pagination Navigation */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#052440] border border-teal-100 dark:border-[#0d3b61] shadow-sm">
        <button
          onClick={handlePrevPage}
          disabled={safeCurrentPage === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#021526] hover:bg-teal-50 dark:hover:bg-[#083256] text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-['Outfit']">
            Page {safeCurrentPage + 1} of {totalPages}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  safeCurrentPage === idx
                    ? 'w-5 bg-teal-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
                title={`Page ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleNextPage}
          disabled={safeCurrentPage >= totalPages - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#021526] hover:bg-teal-50 dark:hover:bg-[#083256] text-slate-700 dark:text-slate-200 disabled:opacity-40 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* FULL SCREEN / EXPANDED REEL MODAL (Opened on click!) */}
      {activeReelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
          {/* Close Modal Button */}
          <button
            onClick={() => setActiveReelModal(null)}
            className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors"
            title="Close Reel"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Reel Container (Portrait 9:16) */}
          <div className="relative w-full max-w-sm h-[85vh] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            {/* Visual Media */}
            <img
              src={activeReelModal.imageUrl}
              alt={activeReelModal.caption}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60" />

            {/* Top Bar inside modal */}
            <div className="relative z-10 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <img
                  src={activeReelModal.authorAvatar}
                  alt={activeReelModal.authorName}
                  className="w-8 h-8 rounded-full object-cover border-2 border-teal-400"
                />
                <div>
                  <h4 className="text-xs sm:text-sm font-bold leading-tight">
                    {activeReelModal.authorName}
                  </h4>
                  <span className="text-[11px] text-teal-300">
                    {activeReelModal.authorHandle}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Play/Pause Center Tap Area */}
            <div
              onClick={() => setIsPlaying(!isPlaying)}
              className="relative z-10 flex-1 flex items-center justify-center cursor-pointer"
            >
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
              )}
            </div>

            {/* Bottom Section inside modal */}
            <div className="relative z-10 p-4 space-y-3 text-white">
              {/* Location Badge */}
              <div className="flex items-center gap-1.5 text-xs text-teal-300 font-semibold bg-black/40 backdrop-blur-md px-3 py-1 rounded-full self-start w-fit">
                <MapPin className="w-3.5 h-3.5" />
                <span>{activeReelModal.islandLocation}</span>
              </div>

              {/* Caption */}
              <p className="text-xs sm:text-sm leading-relaxed text-slate-100">
                {activeReelModal.caption}
              </p>

              {/* Audio Track */}
              {activeReelModal.audioTrack && (
                <div className="flex items-center gap-2 text-[11px] text-teal-200">
                  <Music className="w-3 h-3 animate-spin" />
                  <span className="truncate">{activeReelModal.audioTrack}</span>
                </div>
              )}

              {/* Modal Actions: Like, Save, DETAILS BUTTON */}
              <div className="pt-2 flex items-center justify-between border-t border-white/20">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleLikePost(activeReelModal.id)}
                    className="flex items-center gap-1.5 text-xs font-bold"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        activeReelModal.isLikedByMe
                          ? 'text-rose-500 fill-rose-500'
                          : 'text-white'
                      }`}
                    />
                    <span>{activeReelModal.likesCount}</span>
                  </button>
                  <button
                    onClick={() => onToggleSavePost(activeReelModal.id)}
                    className="p-1 text-white hover:text-amber-400"
                  >
                    <Bookmark
                      className={`w-5 h-5 ${
                        activeReelModal.isSavedByMe
                          ? 'text-amber-400 fill-amber-400'
                          : ''
                      }`}
                    />
                  </button>
                </div>

                {/* DETAILS BUTTON (Opens spot details) */}
                <button
                  onClick={(e) => {
                    setActiveReelModal(null);
                    handleDetailsClick(e, activeReelModal);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-extrabold text-xs shadow-lg transition-transform active:scale-95"
                >
                  <Info className="w-4 h-4" />
                  <span>Spot Details & Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
