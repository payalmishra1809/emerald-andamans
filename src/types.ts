export interface Destination {
  id: string;
  name: string;
  island: string;
  locationRegion: string; // e.g., 'Havelock (Swaraj Dweep)', 'Neil (Shaheed Dweep)', 'Port Blair & South Andaman', 'Diglipur & North Andaman', 'Baratang & Middle Andaman', 'Little Andaman', 'Open Sea & Volcano'
  category: 'Beach' | 'Water Activities' | 'Historical' | 'Adventure' | 'Nature' | 'Waterfall';
  rating: number;
  reviewCount: number;
  shortDescription: string;
  detailedDescription: string;
  heroImageUrl: string;
  galleryImages: string[];
  thingsToDo: string[];
  activityTags: string[];
  thingsToCarry: string[];
  importantRequirements: string[];
  travelInfo: string;
  historicalInfo: string;
  didYouKnowFacts: string[];
  nearbyAttractions: string[];
  latitude: number;
  longitude: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  bestTimeToVisit?: string;
}

export type ThemeMode = 'dark-blue' | 'black-white' | 'light-blue' | 'white';

export interface LocationAlbum {
  id: string;
  title: string;
  location: string;
  description: string;
  coverImage: string;
  secondaryImages: string[];
  destinationIds: string[];
  isCurated?: boolean;
  isCustom?: boolean;
  pinCount?: number;
}

export type LocationBoard = LocationAlbum;

export interface IslandActivity {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  duration: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
  rating: number;
  imageUrl: string;
  relatedDestinations: string[];
  bestSeason: string;
  safetyTips: string;
  swimRequired: boolean;
  priceEstimate?: string;
}

export interface Transportation {
  id: string;
  title: string;
  category: 'Ferry' | 'Bus' | 'Local Transport' | 'Boat';
  route: string;
  provider: string;
  scheduleInfo: string;
  bookingOrWebsiteUrl: string;
  tips: string;
  frequency: string;
  isPrivate: boolean;
}

export interface Accommodation {
  id: string;
  name: string;
  location: string;
  island: string;
  type: string;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrl: string;
  priceGuide: string;
  amenities: string[];
  bookingUrl: string;
  nearbyAttractions: string[];
}

export interface DestinationReview {
  id: string;
  destinationId: string;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  timestamp: number;
  isUserCreated?: boolean;
}

export interface ItineraryTimeSlot {
  time: string;
  activity: string;
  location: string;
  description: string;
}

export interface ItineraryDay {
  dayNumber: number;
  island: string;
  dayTheme: string;
  octoSecretTip: string;
  morning: ItineraryTimeSlot;
  afternoon: ItineraryTimeSlot;
  evening: ItineraryTimeSlot;
  diningSpot: string;
  logisticsSummary: string;
}

export interface TripItinerary {
  id?: string;
  title: string;
  tagline: string;
  octoIntro: string;
  totalDays: number;
  estimatedBudgetPerPerson: string;
  bestSeason: string;
  essentialPacking: string[];
  days: ItineraryDay[];
  createdAt?: number;
  isCustom?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'octo';
  text: string;
  timestamp: number;
  quickActions?: Array<{ label: string; action: string; payload?: any }>;
}

export interface TravelPost {
  id: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  islandLocation: string;
  destinationId?: string; // Links directly to a Destination for full details!
  imageUrl: string;
  videoUrl?: string;
  videoDuration?: string;
  caption: string;
  likesCount: number;
  timestamp: number;
  isLikedByMe?: boolean;
  isSavedByMe?: boolean;
  type: 'reel' | 'photo';
  audioTrack?: string;
  tags?: string[];
  viewsCount?: number;
}

export interface IslandStory {
  id: string;
  title: string;
  island: string;
  coverImage: string;
  slides: Array<{
    imageUrl: string;
    caption: string;
    location: string;
    octoTip?: string;
    destinationId?: string;
  }>;
}

export interface UserSession {
  id: string;
  name: string;
  handle: string;
  email: string;
  bio: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  visitedCount: number;
  isLoggedIn: boolean;
}
