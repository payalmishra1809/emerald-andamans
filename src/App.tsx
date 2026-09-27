import React, { useState, useEffect } from 'react';
import { InstagramTopBar } from './components/InstagramTopBar';
import { BottomNavBar, TabType } from './components/BottomNavBar';
import { HomeFeedView } from './components/HomeFeedView';
import { ExploreReelsView } from './components/ExploreReelsView';
import { ItineraryPlanner } from './components/ItineraryPlanner';
import { ProfileView } from './components/ProfileView';
import { OctoAssistantDrawer } from './components/OctoAssistantDrawer';
import { DestinationModal } from './components/DestinationModal';
import { StoryViewerModal } from './components/StoryViewerModal';
import { CreatePostModal } from './components/CreatePostModal';
import { AuthModal } from './components/AuthModal';
import { SavedDrawer } from './components/SavedDrawer';
import { FeatureTourGuide } from './components/FeatureTourGuide';
import {
  Destination,
  TripItinerary,
  DestinationReview,
  TravelPost,
  IslandStory,
  UserSession,
  ThemeMode,
  IslandActivity,
} from './types';
import {
  DESTINATIONS,
  SAMPLE_REVIEWS,
  PRESET_ITINERARIES,
  REEL_POSTS,
  DEFAULT_USER,
  ACTIVITIES,
} from './data/andamanData';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');

  // Multi-Theme: 'dark-blue' | 'black-white' | 'light-blue' | 'white'
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('emerald_theme_mode');
      if (saved && ['dark-blue', 'black-white', 'light-blue', 'white'].includes(saved)) {
        return saved as ThemeMode;
      }
    } catch {}
    return 'dark-blue'; // Default to deep abyss blue & turquoise
  });

  useEffect(() => {
    try {
      localStorage.setItem('emerald_theme_mode', currentTheme);
    } catch {}

    const root = document.documentElement;
    const body = document.body;

    // Reset all theme classes
    root.classList.remove('theme-dark-blue', 'theme-black-white', 'theme-light-blue', 'theme-white', 'dark');
    body.classList.remove('theme-dark-blue', 'theme-black-white', 'theme-light-blue', 'theme-white', 'dark');

    // Apply active theme class
    root.classList.add(`theme-${currentTheme}`);
    body.classList.add(`theme-${currentTheme}`);

    // If it's a dark variant, also add 'dark' for Tailwind standard dark styles
    if (currentTheme === 'dark-blue' || currentTheme === 'black-white') {
      root.classList.add('dark');
      body.classList.add('dark');
    }
  }, [currentTheme]);

  const handleSelectTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
  };

  // User Session
  const [user, setUser] = useState<UserSession>(() => {
    try {
      const stored = localStorage.getItem('emerald_user_session');
      return stored ? JSON.parse(stored) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('emerald_user_session', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Travel Posts (2x2 Reels)
  const [posts, setPosts] = useState<TravelPost[]>(() => {
    try {
      const stored = localStorage.getItem('emerald_travel_posts');
      return stored ? JSON.parse(stored) : REEL_POSTS;
    } catch {
      return REEL_POSTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('emerald_travel_posts', JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  // Saved Locations (Bookmarks)
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('emerald_saved_destinations');
      return stored
        ? JSON.parse(stored)
        : ['radhanagar_beach', 'elephant_beach', 'neil_natural_bridge', 'ross_smith_islands'];
    } catch {
      return ['radhanagar_beach', 'elephant_beach', 'neil_natural_bridge', 'ross_smith_islands'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('emerald_saved_destinations', JSON.stringify(savedDestinationIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedDestinationIds]);

  // Saved Activities (Requested: "add one more- saved activites")
  const [savedActivityIds, setSavedActivityIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('emerald_saved_activities');
      return stored
        ? JSON.parse(stored)
        : ['scuba_diving_havelock', 'bioluminescent_kayaking', 'sea_walk_north_bay'];
    } catch {
      return ['scuba_diving_havelock', 'bioluminescent_kayaking', 'sea_walk_north_bay'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('emerald_saved_activities', JSON.stringify(savedActivityIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedActivityIds]);

  // Saved Itineraries
  const [savedItineraries, setSavedItineraries] = useState<TripItinerary[]>(() => {
    try {
      const stored = localStorage.getItem('emerald_saved_itineraries');
      return stored ? JSON.parse(stored) : [PRESET_ITINERARIES[0]];
    } catch {
      return [PRESET_ITINERARIES[0]];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('emerald_saved_itineraries', JSON.stringify(savedItineraries));
    } catch (e) {
      console.error(e);
    }
  }, [savedItineraries]);

  // User Reviews
  const [userReviews, setUserReviews] = useState<DestinationReview[]>(() => {
    try {
      const stored = localStorage.getItem('emerald_user_reviews');
      return stored ? JSON.parse(stored) : SAMPLE_REVIEWS;
    } catch {
      return SAMPLE_REVIEWS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('emerald_user_reviews', JSON.stringify(userReviews));
    } catch (e) {
      console.error(e);
    }
  }, [userReviews]);

  // HOVERING FEATURE SPOTLIGHT TOUR (Launches automatically when used for first time)
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('emerald_tour_completed') === null;
    } catch {
      return true;
    }
  });

  // Ensure tour mounts smoothly after DOM is ready on first time usage
  useEffect(() => {
    try {
      const completed = localStorage.getItem('emerald_tour_completed');
      if (!completed) {
        const timer = setTimeout(() => {
          setIsTourOpen(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsTourOpen(true);
    }
  }, []);

  // OCTO ASSISTANT DRAWER (Permanently available at bottom of every page)
  const [isOctoDrawerOpen, setIsOctoDrawerOpen] = useState<boolean>(false);
  const [octoInitialPrompt, setOctoInitialPrompt] = useState<string | null>(null);

  const handleAskOcto = (prompt: string) => {
    setOctoInitialPrompt(prompt);
    setIsOctoDrawerOpen(true);
  };

  // Modals state
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [activeStory, setActiveStory] = useState<IslandStory | null>(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);

  // Handle open details by destination ID or name
  const handleOpenDetails = (destinationIdOrName: string) => {
    const found = DESTINATIONS.find(
      (d) =>
        d.id === destinationIdOrName ||
        d.name.toLowerCase().includes(destinationIdOrName.toLowerCase()) ||
        destinationIdOrName.toLowerCase().includes(d.id.toLowerCase()) ||
        destinationIdOrName.toLowerCase().includes(d.name.toLowerCase())
    );
    if (found) {
      setSelectedDestination(found);
    } else {
      setSelectedDestination(DESTINATIONS[0]);
    }
  };

  const handleToggleSaveDestination = (dest: Destination) => {
    setSavedDestinationIds((prev) => {
      if (prev.includes(dest.id)) {
        return prev.filter((id) => id !== dest.id);
      } else {
        return [...prev, dest.id];
      }
    });
  };

  const handleRemoveSavedActivity = (id: string) => {
    setSavedActivityIds((prev) => prev.filter((actId) => actId !== id));
  };

  const handleSaveItinerary = (itinerary: TripItinerary) => {
    setSavedItineraries((prev) => {
      const exists = prev.some((i) => i.title === itinerary.title);
      if (exists) {
        return prev.filter((i) => i.title !== itinerary.title);
      } else {
        return [itinerary, ...prev];
      }
    });
  };

  const isItinerarySaved = (title: string) => {
    return savedItineraries.some((i) => i.title === title);
  };

  const handleAddReview = (newRev: Omit<DestinationReview, 'id' | 'timestamp'>) => {
    const reviewWithMeta: DestinationReview = {
      ...newRev,
      id: `rev_${Date.now()}`,
      timestamp: Date.now(),
      isUserCreated: true,
    };
    setUserReviews((prev) => [reviewWithMeta, ...prev]);
  };

  const handleToggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newLiked = !p.isLikedByMe;
          return {
            ...p,
            isLikedByMe: newLiked,
            likesCount: newLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  const handleToggleSavePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isSavedByMe: !p.isSavedByMe } : p))
    );
  };

  const handleCreatePost = (
    newPostData: Omit<TravelPost, 'id' | 'timestamp' | 'likesCount' | 'commentsCount'>
  ) => {
    const post: TravelPost = {
      ...newPostData,
      id: `reel_${Date.now()}`,
      timestamp: Date.now(),
      likesCount: 1,
      isLikedByMe: true,
      viewsCount: 1,
    };
    setPosts((prev) => [post, ...prev]);
  };

  const handleUpdateBio = (newBio: string) => {
    setUser((prev) => ({ ...prev, bio: newBio }));
  };

  const handleLogout = () => {
    setUser((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
  };

  const savedDestinationsList = DESTINATIONS.filter((d) =>
    savedDestinationIds.includes(d.id)
  );

  const savedActivitiesList = ACTIVITIES.filter((a) =>
    savedActivityIds.includes(a.id)
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        currentTheme === 'dark-blue'
          ? 'bg-[#021526] text-[#f8fafc]'
          : currentTheme === 'black-white'
          ? 'bg-[#000000] text-[#ffffff]'
          : currentTheme === 'light-blue'
          ? 'bg-[#e0f2fe] text-[#082f49]'
          : 'bg-[#ffffff] text-[#0f172a]'
      }`}
    >
      {/* Top Bar: only Heading and Theme setting button */}
      <InstagramTopBar
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Main Tab Views */}
      <main className="w-full">
        {/* TAB 1: HOME FEED */}
        {activeTab === 'home' && (
          <HomeFeedView
            onSelectDestination={(dest) => setSelectedDestination(dest)}
            savedIds={savedDestinationIds}
            onToggleSave={handleToggleSaveDestination}
            onOpenPlanner={() => setActiveTab('planner')}
            onAskOcto={handleAskOcto}
            onSelectStory={(story) => setActiveStory(story)}
          />
        )}

        {/* TAB 2: 2x2 REELS GRID (4 reels in one page, click opens up, Details icon) */}
        {activeTab === 'explore' && (
          <ExploreReelsView
            posts={posts}
            onToggleLikePost={handleToggleLikePost}
            onToggleSavePost={handleToggleSavePost}
            onOpenDetails={handleOpenDetails}
            onOpenCreatePost={() => setIsCreatePostOpen(true)}
            onAskOcto={handleAskOcto}
          />
        )}

        {/* TAB 3: ITINERARY PLANNER (Multiple demonstrated routes) */}
        {activeTab === 'planner' && (
          <div className="pb-24">
            <ItineraryPlanner
              onOpenDestination={handleOpenDetails}
              onSaveItinerary={handleSaveItinerary}
              isSaved={isItinerarySaved}
              onRequestChatWithPrompt={handleAskOcto}
            />
          </div>
        )}

        {/* TAB 4: PINTEREST ALBUMS & SAVED LOCATIONS & SAVED ACTIVITIES */}
        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            onUpdateBio={handleUpdateBio}
            savedDestinations={savedDestinationsList}
            onRemoveSavedDestination={(id) =>
              setSavedDestinationIds((prev) => prev.filter((item) => item !== id))
            }
            onSelectDestination={(dest) => setSelectedDestination(dest)}
            savedActivities={savedActivitiesList}
            onRemoveSavedActivity={handleRemoveSavedActivity}
            savedItineraries={savedItineraries}
            onSelectItinerary={() => setActiveTab('planner')}
            onRemoveItinerary={(title) =>
              setSavedItineraries((prev) => prev.filter((itin) => itin.title !== title))
            }
            onOpenAskOcto={handleAskOcto}
          />
        )}
      </main>

      {/* Bottom Navigation with circled Octo Assistant waving hello on every page */}
      <BottomNavBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenOctoAssistant={() => setIsOctoDrawerOpen(true)}
        isOctoOpen={isOctoDrawerOpen}
        savedCount={savedDestinationIds.length + savedItineraries.length}
      />

      {/* OCTO ASSISTANT DRAWER (Opens on every page down circled as assistant) */}
      <OctoAssistantDrawer
        isOpen={isOctoDrawerOpen}
        onClose={() => setIsOctoDrawerOpen(false)}
        onOpenItineraryPlanner={() => {
          setIsOctoDrawerOpen(false);
          setActiveTab('planner');
        }}
        onOpenDestination={(id) => {
          setIsOctoDrawerOpen(false);
          handleOpenDetails(id);
        }}
        initialPrompt={octoInitialPrompt}
        onClearInitialPrompt={() => setOctoInitialPrompt(null)}
      />

      {/* HOVERING FEATURE SPOTLIGHT TOUR (Pointing with hovering popovers across all pages) */}
      <FeatureTourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        currentTab={activeTab}
      />

      {/* Full-Screen Story Viewer */}
      {activeStory && (
        <StoryViewerModal
          story={activeStory}
          onClose={() => setActiveStory(null)}
          onAskOcto={handleAskOcto}
          onOpenDestination={(id) => {
            setActiveStory(null);
            handleOpenDetails(id);
          }}
        />
      )}

      {/* Create Reel Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        currentUser={user}
        onSubmitPost={handleCreatePost}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
      />

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <DestinationModal
          destination={selectedDestination}
          onClose={() => setSelectedDestination(null)}
          isSaved={savedDestinationIds.includes(selectedDestination.id)}
          onToggleSave={handleToggleSaveDestination}
          onAskOcto={handleAskOcto}
          userReviews={userReviews}
          onAddReview={handleAddReview}
        />
      )}

      {/* Saved Bookmarks Drawer */}
      <SavedDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedDestinations={savedDestinationsList}
        onRemoveDestination={(id) =>
          setSavedDestinationIds((prev) => prev.filter((item) => item !== id))
        }
        onSelectDestination={(dest) => setSelectedDestination(dest)}
        savedItineraries={savedItineraries}
        onRemoveItinerary={(title) =>
          setSavedItineraries((prev) => prev.filter((itin) => itin.title !== title))
        }
        onSelectItinerary={() => setActiveTab('planner')}
      />
    </div>
  );
}
