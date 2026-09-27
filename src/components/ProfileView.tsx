import React, { useState } from 'react';
import {
  Grid,
  Bookmark,
  CalendarCheck,
  Plus,
  MapPin,
  Star,
  Trash2,
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Waves,
  Clock,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { UserSession, Destination, TripItinerary, LocationAlbum, IslandActivity } from '../types';
import { INITIAL_ALBUMS, DESTINATIONS, ACTIVITIES } from '../data/andamanData';

interface ProfileViewProps {
  user: UserSession;
  onUpdateBio: (newBio: string) => void;
  savedDestinations: Destination[];
  onRemoveSavedDestination: (id: string) => void;
  onSelectDestination: (dest: Destination) => void;
  savedActivities: IslandActivity[];
  onRemoveSavedActivity: (id: string) => void;
  savedItineraries: TripItinerary[];
  onSelectItinerary: (itin: TripItinerary) => void;
  onRemoveItinerary: (title: string) => void;
  onOpenTutorial?: () => void;
  onOpenAskOcto?: (prompt: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateBio,
  savedDestinations,
  onRemoveSavedDestination,
  onSelectDestination,
  savedActivities,
  onRemoveSavedActivity,
  savedItineraries,
  onSelectItinerary,
  onRemoveItinerary,
  onOpenAskOcto,
}) => {
  // Tabs: Albums, Saved Locations, Saved Activities, Saved Itineraries
  const [activeTab, setActiveTab] = useState<'albums' | 'locations' | 'activities' | 'itineraries'>('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<LocationAlbum | null>(null);

  const [albums, setAlbums] = useState<LocationAlbum[]>(() => {
    try {
      const stored = localStorage.getItem('emerald_location_albums');
      return stored ? JSON.parse(stored) : INITIAL_ALBUMS;
    } catch {
      return INITIAL_ALBUMS;
    }
  });

  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [bioInput, setBioInput] = useState<string>(user.bio);
  const [isCreateAlbumOpen, setIsCreateAlbumOpen] = useState<boolean>(false);
  const [newAlbumTitle, setNewAlbumTitle] = useState<string>('');
  const [newAlbumLocation, setNewAlbumLocation] = useState<string>('Havelock Island (Swaraj Dweep)');
  const [newAlbumDesc, setNewAlbumDesc] = useState<string>('');

  const saveAlbumsToStorage = (updatedAlbums: LocationAlbum[]) => {
    setAlbums(updatedAlbums);
    try {
      localStorage.setItem('emerald_location_albums', JSON.stringify(updatedAlbums));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBio(bioInput);
    setIsEditingBio(false);
  };

  const handleCreateAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    const matchedDest =
      DESTINATIONS.find((d) => d.locationRegion.includes(newAlbumLocation)) || DESTINATIONS[0];
    const newAlbum: LocationAlbum = {
      id: `album_${Date.now()}`,
      title: newAlbumTitle.trim(),
      location: newAlbumLocation,
      description: newAlbumDesc.trim() || `Saved locations & highlights for ${newAlbumLocation}`,
      coverImage: matchedDest.heroImageUrl,
      secondaryImages: matchedDest.galleryImages.slice(0, 2),
      destinationIds: [matchedDest.id],
      isCustom: true,
    };

    saveAlbumsToStorage([newAlbum, ...albums]);
    setNewAlbumTitle('');
    setNewAlbumDesc('');
    setIsCreateAlbumOpen(false);
  };

  const handleDeleteAlbum = (albumId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this album?')) {
      const filtered = albums.filter((b) => b.id !== albumId);
      saveAlbumsToStorage(filtered);
      if (selectedAlbum?.id === albumId) {
        setSelectedAlbum(null);
      }
    }
  };

  // Resolve destinations inside an album
  const getDestinationsForAlbum = (album: LocationAlbum): Destination[] => {
    const list: Destination[] = [];
    album.destinationIds.forEach((id) => {
      const found = DESTINATIONS.find((d) => d.id === id);
      if (found) list.push(found);
    });
    // Also include any user-saved destinations matching this location region
    savedDestinations.forEach((sd) => {
      if (
        (sd.locationRegion.toLowerCase().includes(album.location.toLowerCase()) ||
          album.title.toLowerCase().includes(sd.island.toLowerCase())) &&
        !list.some((existing) => existing.id === sd.id)
      ) {
        list.push(sd);
      }
    });
    return list;
  };

  return (
    <div className="max-w-2xl mx-auto pb-24 px-3 sm:px-4 space-y-5 animate-fadeIn">
      {/* PINTEREST PROFILE HEADER */}
      <div className="pt-3 space-y-4">
        {/* User Info & Stats */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar with Story Glow */}
          <div className="relative p-[3px] rounded-full story-ring shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white dark:border-[#021526]">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                {user.name}
              </h2>
              <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                {user.handle}
              </div>
            </div>

            {/* Bio */}
            {isEditingBio ? (
              <form onSubmit={handleSaveBio} className="space-y-2 pt-1">
                <textarea
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-[#0d3b61] bg-white dark:bg-[#052440] text-slate-900 dark:text-white"
                  rows={2}
                />
                <div className="flex gap-2 justify-center sm:justify-start">
                  <button
                    type="submit"
                    className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold"
                  >
                    Save Bio
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(false)}
                    className="px-3 py-1 bg-slate-200 dark:bg-slate-700 text-xs rounded-lg font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
                {user.bio}
              </p>
            )}

            {/* Stats Counters */}
            <div className="flex items-center justify-center sm:justify-start gap-5 pt-1">
              <div>
                <span className="block font-extrabold text-base text-slate-900 dark:text-white">
                  {albums.length}
                </span>
                <span className="text-[11px] text-slate-400">Albums</span>
              </div>
              <div>
                <span className="block font-extrabold text-base text-slate-900 dark:text-white">
                  {savedDestinations.length}
                </span>
                <span className="text-[11px] text-slate-400">Locations</span>
              </div>
              <div>
                <span className="block font-extrabold text-base text-slate-900 dark:text-white">
                  {savedActivities.length}
                </span>
                <span className="text-[11px] text-slate-400">Activities</span>
              </div>
              <div>
                <span className="block font-extrabold text-base text-slate-900 dark:text-white">
                  {savedItineraries.length}
                </span>
                <span className="text-[11px] text-slate-400">Itineraries</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls (No theme button here!) */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setIsEditingBio(!isEditingBio)}
            className="flex-1 py-2 px-3 bg-slate-100 dark:bg-[#052440] hover:bg-slate-200 dark:hover:bg-[#083256] text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-[#0d3b61] transition-colors cursor-pointer"
          >
            Edit Bio
          </button>
          <button
            onClick={() => setIsCreateAlbumOpen(true)}
            className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Album</span>
          </button>
        </div>
      </div>

      {/* 4 TABS: Albums, Saved Locations, Saved Activities, Saved Itineraries */}
      <div
        id="tour-profile-tabs"
        className="border-t border-b border-slate-200 dark:border-[#0d3b61] py-1.5"
      >
        <div className="flex items-center justify-around gap-1 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => {
              setActiveTab('albums');
              setSelectedAlbum(null);
            }}
            className={`flex items-center gap-1 py-1.5 px-3 rounded-full font-bold whitespace-nowrap transition-all ${
              activeTab === 'albums' && !selectedAlbum
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Albums ({albums.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('locations');
              setSelectedAlbum(null);
            }}
            className={`flex items-center gap-1 py-1.5 px-3 rounded-full font-bold whitespace-nowrap transition-all ${
              activeTab === 'locations'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Locations ({savedDestinations.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('activities');
              setSelectedAlbum(null);
            }}
            className={`flex items-center gap-1 py-1.5 px-3 rounded-full font-bold whitespace-nowrap transition-all ${
              activeTab === 'activities'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Saved Activities ({savedActivities.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('itineraries');
              setSelectedAlbum(null);
            }}
            className={`flex items-center gap-1 py-1.5 px-3 rounded-full font-bold whitespace-nowrap transition-all ${
              activeTab === 'itineraries'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Itineraries ({savedItineraries.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: SINGLE ALBUM DETAIL VIEW */}
      {selectedAlbum ? (
        <div className="space-y-4 animate-fadeIn">
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#052440] border border-teal-100 dark:border-[#0d3b61] space-y-3 shadow-sm">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to all albums</span>
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{selectedAlbum.location}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  {selectedAlbum.title}
                </h3>
              </div>

              <span className="text-xs font-bold bg-teal-50 dark:bg-[#021526] text-teal-800 dark:text-teal-300 px-3 py-1 rounded-full border border-teal-200 dark:border-[#0d3b61] self-start sm:self-auto">
                {getDestinationsForAlbum(selectedAlbum).length} Locations in Album
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {selectedAlbum.description}
            </p>
          </div>

          {/* Locations inside this album */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {getDestinationsForAlbum(selectedAlbum).map((dest) => (
              <div
                key={dest.id}
                onClick={() => onSelectDestination(dest)}
                className="bg-white dark:bg-[#052440] rounded-2xl overflow-hidden border border-teal-100 dark:border-[#0d3b61] shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <img
                    src={dest.heroImageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {dest.category}
                  </span>
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{dest.rating}</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors leading-tight">
                      {dest.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {dest.shortDescription}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-[#0d3b61] flex items-center justify-between text-xs">
                    <span className="text-teal-600 dark:text-teal-400 font-bold flex items-center gap-1 text-[11px]">
                      <Info className="w-3.5 h-3.5" />
                      <span>Full Guide</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {dest.island.split('(')[0]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'albums' ? (
        /* VIEW 2: PINTEREST ALBUMS GRID */
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Andaman Location Albums
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Tap any album to explore saved locations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {albums.map((album) => {
              const albumLocations = getDestinationsForAlbum(album);
              return (
                <div
                  key={album.id}
                  onClick={() => setSelectedAlbum(album)}
                  className="bg-white dark:bg-[#052440] rounded-3xl p-3 border border-teal-100 dark:border-[#0d3b61] shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col justify-between"
                >
                  {/* Pinterest Mosaic Collage with proper framing (no cutoff) */}
                  <div className="grid grid-cols-3 gap-1.5 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#021526]">
                    <div className="col-span-2 h-full overflow-hidden">
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="col-span-1 flex flex-col gap-1.5 h-full">
                      <div className="flex-1 overflow-hidden">
                        <img
                          src={album.secondaryImages[0] || album.coverImage}
                          alt="thumbnail 1"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <img
                          src={album.secondaryImages[1] || album.coverImage}
                          alt="thumbnail 2"
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Album Info */}
                  <div className="pt-3 px-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white font-['Outfit'] group-hover:text-teal-600 transition-colors">
                        {album.title}
                      </h3>
                      {album.isCustom && (
                        <button
                          onClick={(e) => handleDeleteAlbum(album.id, e)}
                          className="p-1 text-slate-400 hover:text-rose-500"
                          title="Delete custom album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                        <MapPin className="w-3 h-3" />
                        <span>{album.location}</span>
                      </span>
                      <span className="font-bold text-[11px]">
                        {albumLocations.length} locations
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'locations' ? (
        /* VIEW 3: SAVED LOCATIONS */
        <div className="space-y-4 animate-fadeIn">
          {savedDestinations.length === 0 ? (
            <div className="text-center py-14 space-y-2 bg-white dark:bg-[#052440] rounded-3xl border border-teal-100 dark:border-[#0d3b61] p-6">
              <Bookmark className="w-10 h-10 mx-auto text-slate-400 stroke-[1.5]" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                No saved locations yet
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore the Home feed or 2x2 Reels and tap the bookmark icon on any beach or island spot to save it here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {savedDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white dark:bg-[#052440] rounded-2xl overflow-hidden border border-teal-100 dark:border-[#0d3b61] shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div
                    onClick={() => onSelectDestination(dest)}
                    className="relative aspect-[16/10] w-full overflow-hidden cursor-pointer"
                  >
                    <img
                      src={dest.heroImageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      {dest.category}
                    </div>
                  </div>
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div
                        onClick={() => onSelectDestination(dest)}
                        className="cursor-pointer"
                      >
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 hover:text-teal-600 transition-colors">
                          {dest.name}
                        </h4>
                        <span className="text-[11px] text-teal-600 dark:text-teal-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{dest.island}</span>
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveSavedDestination(dest.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Remove location"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-[#0d3b61] flex items-center justify-between text-xs">
                      <button
                        onClick={() => onSelectDestination(dest)}
                        className="font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Info className="w-3 h-3" />
                        <span>View Guide</span>
                      </button>
                      <div className="flex items-center text-amber-500 font-bold text-[11px]">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="ml-1">{dest.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'activities' ? (
        /* VIEW 4: SAVED ACTIVITIES (Requested!) */
        <div className="space-y-4 animate-fadeIn">
          {savedActivities.length === 0 ? (
            <div className="text-center py-14 space-y-2 bg-white dark:bg-[#052440] rounded-3xl border border-teal-100 dark:border-[#0d3b61] p-6">
              <Waves className="w-10 h-10 mx-auto text-teal-400 stroke-[1.5]" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                No saved activities yet
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Discover scuba dives, mangrove night kayaking, and sea walks in our curated activities and save them here!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-3.5 rounded-2xl bg-white dark:bg-[#052440] border border-teal-100 dark:border-[#0d3b61] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={act.imageUrl}
                      alt={act.name}
                      className="w-16 h-16 rounded-xl object-cover object-center shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-50 dark:bg-[#021526] text-teal-800 dark:text-teal-300">
                          {act.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {act.duration}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {act.name}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400">
                        <MapPin className="w-3 h-3" />
                        <span>{act.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      {act.priceEstimate}
                    </span>
                    <button
                      onClick={() => onRemoveSavedActivity(act.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove activity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 5: SAVED ITINERARIES */
        <div className="space-y-3 animate-fadeIn">
          {savedItineraries.length === 0 ? (
            <div className="text-center py-14 space-y-2 bg-white dark:bg-[#052440] rounded-3xl border border-teal-100 dark:border-[#0d3b61] p-6">
              <CalendarCheck className="w-10 h-10 mx-auto text-slate-400 stroke-[1.5]" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                No saved itineraries yet
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Use the Plan tab to customize your Andaman trip with catamaran timings, then tap "Save Itinerary" to store it here.
              </p>
            </div>
          ) : (
            savedItineraries.map((itin, idx) => (
              <div
                key={idx}
                className="p-4 rounded-3xl bg-white dark:bg-[#052440] border border-teal-100 dark:border-[#0d3b61] space-y-2.5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-[#021526] text-teal-800 dark:text-teal-300">
                      {itin.totalDays} Days Archipelago Route
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {itin.title}
                    </h4>
                  </div>
                  <button
                    onClick={() => onRemoveItinerary(itin.title)}
                    className="p-1.5 text-slate-400 hover:text-rose-500"
                    title="Remove itinerary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {itin.tagline}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-[#0d3b61] text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Est: {itin.estimatedBudgetPerPerson}
                  </span>
                  <button
                    onClick={() => onSelectItinerary(itin)}
                    className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Open in Planner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: CREATE PINTEREST LOCATION ALBUM */}
      {isCreateAlbumOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#052440] rounded-3xl max-w-sm w-full p-5 space-y-4 border border-teal-100 dark:border-[#0d3b61] shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#0d3b61] pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-['Outfit']">
                Create Location Album
              </h3>
              <button
                onClick={() => setIsCreateAlbumOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Album Name
                </label>
                <input
                  type="text"
                  required
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="e.g. Havelock Coral Paradise"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Island / Location
                </label>
                <select
                  value={newAlbumLocation}
                  onChange={(e) => setNewAlbumLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
                >
                  <option value="Havelock Island (Swaraj Dweep)">Havelock Island (Swaraj Dweep)</option>
                  <option value="Neil Island (Shaheed Dweep)">Neil Island (Shaheed Dweep)</option>
                  <option value="Port Blair & South Andaman">Port Blair & South Andaman</option>
                  <option value="Diglipur & North Andaman">Diglipur & North Andaman</option>
                  <option value="Baratang & Middle Andaman">Baratang & Middle Andaman</option>
                  <option value="Little Andaman Surfing & Waterfalls">Little Andaman</option>
                  <option value="Barren Island & Deep Sea Volcano">Barren Island Volcano</option>
                  <option value="Mahatma Gandhi Marine Sanctuary">Mahatma Gandhi Marine Park</option>
                  <option value="Offbeat Long Island & Secret Bays">Long Island & Lalaji Bay</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={newAlbumDesc}
                  onChange={(e) => setNewAlbumDesc(e.target.value)}
                  placeholder="Add notes about ferry routes, sunset spots, or dive spots..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#0d3b61] bg-slate-50 dark:bg-[#021526] text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Create Album
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
