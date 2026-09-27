import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Share2,
  Bookmark,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Navigation,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Destination, DestinationReview } from '../types';

interface DestinationModalProps {
  destination: Destination | null;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (destination: Destination) => void;
  onAskOcto: (prompt: string) => void;
  userReviews: DestinationReview[];
  onAddReview: (review: Omit<DestinationReview, 'id' | 'timestamp'>) => void;
}

export const DestinationModal: React.FC<DestinationModalProps> = ({
  destination,
  onClose,
  isSaved,
  onToggleSave,
  onAskOcto,
  userReviews,
  onAddReview,
}) => {
  if (!destination) return null;

  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [factIndex, setFactIndex] = useState<number>(0);
  // Review Form
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [reviewerName, setReviewerName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const allImages = [destination.heroImageUrl, ...destination.galleryImages];
  const currentImage = allImages[activeImageIndex] || destination.heroImageUrl;

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNextFact = () => {
    if (destination.didYouKnowFacts.length > 0) {
      setFactIndex((prev) => (prev + 1) % destination.didYouKnowFacts.length);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onAddReview({
      destinationId: destination.id,
      userName: reviewerName.trim() || 'Andaman Traveler',
      rating,
      comment: comment.trim(),
    });
    setComment('');
    setShowReviewForm(false);
  };

  const handleOpenMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: `Check out ${destination.name} on ${destination.island} in the Andaman Islands!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const reviewsForThisSpot = userReviews.filter((r) => r.destinationId === destination.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-[#052440] rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto border border-teal-100 dark:border-[#0d3b61] shadow-2xl relative">
        {/* Sticky Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-slate-900/70 hover:bg-slate-900/90 text-white backdrop-blur-md transition-colors"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image Section with Carousel Arrows */}
        <div className="relative h-64 sm:h-84 md:h-96 w-full overflow-hidden bg-slate-950 group">
          <img
            src={currentImage}
            alt={destination.name}
            className="w-full h-full object-cover object-center transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/30" />

          {/* Image Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                title="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors"
                title="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              {/* Photo counter */}
              <div className="absolute top-4 right-16 z-20 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
                {activeImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}

          {/* Top Tag & Actions */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="bg-teal-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {destination.category}
            </span>
            {destination.isFeatured && (
              <span className="bg-amber-500/90 backdrop-blur-md text-slate-950 text-xs font-bold px-3 py-1 rounded-full">
                Must Visit
              </span>
            )}
          </div>

          {/* Hero Bottom Bar */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-1.5 text-teal-300 text-xs font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{destination.island}</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight">
                {destination.name}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSave(destination)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md border transition-all ${
                  isSaved
                    ? 'bg-amber-400 text-slate-950 border-amber-300'
                    : 'bg-white/20 text-white border-white/30 hover:bg-white/30'
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
                <span>{isSaved ? 'Saved' : 'Save Location'}</span>
              </button>
              <button
                onClick={handleShare}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/30 transition-all"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails Carousel */}
        {allImages.length > 1 && (
          <div className="flex gap-2 p-3 bg-slate-100 dark:bg-[#021526] overflow-x-auto border-b border-slate-200 dark:border-[#0d3b61]">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-teal-500 scale-105 ring-2 ring-teal-400/50'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`photo ${idx + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* Key Facts / Rating Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200 dark:border-[#0d3b61]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {destination.rating}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({destination.reviewCount + reviewsForThisSpot.length} recommendations)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleOpenMaps}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onAskOcto(`Tell me about visiting ${destination.name} on ${destination.island}, best timings, and how to reach!`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Octo</span>
              </button>
            </div>
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              About {destination.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {destination.detailedDescription}
            </p>
          </div>

          {/* "Did You Know?" Fact Card */}
          {destination.didYouKnowFacts.length > 0 && (
            <div className="p-4 rounded-2xl bg-teal-50/80 dark:bg-[#021526] border border-teal-200/80 dark:border-[#0d3b61] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                    Did You Know?
                  </span>
                </div>
                {destination.didYouKnowFacts.length > 1 && (
                  <button
                    onClick={handleNextFact}
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Next Fact</span>
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed">
                "{destination.didYouKnowFacts[factIndex]}"
              </p>
            </div>
          )}

          {/* Highlights & Things to Do */}
          <div className="space-y-2.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
              Highlights & Experiences
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {destination.thingsToDo.map((todo, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#021526] border border-slate-200/80 dark:border-[#0d3b61] text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <span>{todo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Things to Carry & Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Things to Carry */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200 dark:border-[#0d3b61] space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                🎒 Things to Carry
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {destination.thingsToCarry.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Important Requirements */}
            <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-900/40 space-y-2">
              <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>Important Rules & Advisories</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                {destination.importantRequirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-600 font-bold">!</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* How to Reach & Historical Heritage */}
          <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200 dark:border-[#0d3b61] text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                🚢 How to Reach & Logistics:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {destination.travelInfo}
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                🏛️ Heritage & History:
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {destination.historicalInfo}
              </p>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-[#0d3b61]">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                Traveler Reviews ({reviewsForThisSpot.length})
              </h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
              >
                {showReviewForm ? 'Cancel' : '+ Write Review'}
              </button>
            </div>

            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#021526] space-y-2.5">
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  placeholder="Your Name (e.g. Payal)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-[#0d3b61] bg-white dark:bg-[#052440] text-slate-900 dark:text-white"
                />
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your tips, coral sightings, or sunset advice..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-[#0d3b61] bg-white dark:bg-[#052440] text-slate-900 dark:text-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                >
                  Submit Review
                </button>
              </form>
            )}

            <div className="space-y-2">
              {reviewsForThisSpot.map((rev) => (
                <div
                  key={rev.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-[#021526] border border-slate-200/80 dark:border-[#0d3b61] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{rev.userName}</span>
                    <div className="flex text-amber-500 text-xs">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
