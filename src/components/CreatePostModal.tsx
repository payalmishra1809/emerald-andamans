import React, { useState } from 'react';
import { X, Film, MapPin, Camera } from 'lucide-react';
import { TravelPost, UserSession } from '../types';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession;
  onSubmitPost: (post: Omit<TravelPost, 'id' | 'timestamp' | 'likesCount' | 'commentsCount'>) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmitPost,
}) => {
  if (!isOpen) return null;

  const [caption, setCaption] = useState<string>('');
  const [islandLocation, setIslandLocation] = useState<string>('Radhanagar Beach, Havelock Island');
  const [destinationId, setDestinationId] = useState<string>('radhanagar_beach');
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900'
  );
  const [customImageUrl, setCustomImageUrl] = useState<string>('');

  const photoOptions = [
    { label: 'Radhanagar Sunset', id: 'radhanagar_beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900', loc: 'Radhanagar Beach, Havelock Island' },
    { label: 'Scuba Nemo Reef', id: 'elephant_beach', url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900', loc: 'Nemo Reef, Havelock Island' },
    { label: 'Neil Rock Bridge', id: 'neil_natural_bridge', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900', loc: 'Natural Rock Bridge, Neil Island' },
    { label: 'Ross & Smith Sandbar', id: 'ross_smith_islands', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900', loc: 'Ross & Smith Islands, Diglipur' },
    { label: 'Cellular Jail', id: 'cellular_jail', url: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=900', loc: 'Cellular Jail Memorial, Port Blair' },
    { label: 'Active Volcano', id: 'barren_island', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=900', loc: 'Barren Island Volcano, Open Sea' },
    { label: 'Baratang Caves', id: 'baratang_caves', url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=900', loc: 'Baratang Mangrove Safari & Caves' },
    { label: 'Jolly Buoy Corals', id: 'jolly_buoy_island', url: 'https://images.unsplash.com/photo-1544551763-77ef2d0cf967?w=900', loc: 'Jolly Buoy Island Coral Sanctuary' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim()) return;

    const finalImage = customImageUrl.trim() || selectedImage;
    onSubmitPost({
      authorName: currentUser.name,
      authorHandle: currentUser.handle,
      authorAvatar: currentUser.avatarUrl,
      islandLocation,
      destinationId,
      imageUrl: finalImage,
      caption: caption.trim(),
      type: 'reel',
      videoDuration: '0:35',
      viewsCount: 120,
      audioTrack: '🎵 Andaman Island Waves - Coastal Breeze',
      tags: ['EmeraldAndaman', islandLocation.split(',')[0].replace(/\s+/g, '')],
    });

    setCaption('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#052440] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-teal-100 dark:border-[#0d3b61]">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-[#0d3b61]">
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-['Outfit']">
              Post Island Reel
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Preset Photo Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Pick Andaman Location Visual
            </label>
            <div className="grid grid-cols-4 gap-1.5 max-h-40 overflow-y-auto p-1 border border-slate-100 dark:border-[#0d3b61] rounded-2xl">
              {photoOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.label}
                  onClick={() => {
                    setSelectedImage(opt.url);
                    setIslandLocation(opt.loc);
                    setDestinationId(opt.id);
                    setCustomImageUrl('');
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === opt.url && !customImageUrl
                      ? 'border-teal-500 scale-102 ring-2 ring-teal-400/50'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[8px] py-0.5 text-center truncate px-0.5">
                    {opt.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              placeholder="Or paste an image URL..."
              className="w-full mt-1.5 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
            />
          </div>

          {/* Island Location Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Selected Island Location
            </label>
            <input
              type="text"
              value={islandLocation}
              onChange={(e) => setIslandLocation(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white font-medium"
            />
          </div>

          {/* Caption */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Reel Caption & Story
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe the turquoise surf, coral sightings, or sunset vibes..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={!caption.trim()}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-40 transition-colors shadow-md"
          >
            Publish Reel to 2x2 Feed
          </button>
        </form>
      </div>
    </div>
  );
};
