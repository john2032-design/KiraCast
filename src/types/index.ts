export interface AnimeMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
  };
  coverImage: {
    large: string;
    extraLarge: string;
    medium: string;
  };
  bannerImage: string | null;
  description: string | null;
  genres: string[];
  studios: {
    edges: {
      node: {
        name: string;
      };
    }[];
  };
  format: string;
  status: string;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  meanScore: number | null;
  popularity: number;
  season: string | null;
  seasonYear: number | null;
  startDate: {
    year: number | null;
    month: number | null;
    day: number | null;
  };
  nextAiringEpisode: {
    airingAt: number;
    episode: number;
  } | null;
  trailer: {
    id: string;
    site: string;
    thumbnail: string;
  } | null;
  isAdult: boolean;
  source: string | null;
  type: string;
  characters: {
    edges: {
      node: {
        id: number;
        name: {
          full: string;
        };
        image: {
          medium: string;
        };
      };
      voiceActors: {
        name: {
          full: string;
        };
        image: {
          medium: string;
        };
        language: string;
      }[];
    }[];
  };
  relations: {
    edges: {
      relationType: string;
      node: {
        id: number;
        title: {
          romaji: string;
          english: string | null;
        };
        coverImage: {
          large: string;
        };
        format: string;
        type: string;
      };
    }[];
  };
}

export interface WatchProgress {
  animeId: number;
  episodeNumber: number;
  currentTime: number;
  duration: number;
  updatedAt: number;
  animeTitle: string;
  coverImage: string;
}

export interface WatchHistoryItem extends WatchProgress {
  id: string;
}

export interface UserSettings {
  autoplayNext: boolean;
  autoSkipIntro: boolean;
  defaultQuality: string;
  preferredLanguage: 'sub' | 'dub';
  showSpoilers: boolean;
  compactEpisodeList: boolean;
  theme: 'dark' | 'darker';
}

export const DEFAULT_SETTINGS: UserSettings = {
  autoplayNext: true,
  autoSkipIntro: false,
  defaultQuality: '1080p',
  preferredLanguage: 'sub',
  showSpoilers: false,
  compactEpisodeList: false,
  theme: 'dark',
};

export interface AiringScheduleItem {
  id: number;
  episode: number;
  airingAt: number;
  media: {
    id: number;
    title: {
      romaji: string;
      english: string | null;
    };
    coverImage: {
      large: string;
    };
    format: string;
  };
}

export interface Episode {
  id: string;
  number: number;
  title: string | null;
  image: string | null;
  description: string | null;
}

export interface Genre {
  id: string;
  name: string;
}

export type SortOption = 'POPULARITY_DESC' | 'TRENDING_DESC' | 'SCORE_DESC' | 'START_DATE_DESC' | 'FAVOURITES_DESC';

export interface SearchFilters {
  genre?: string;
  year?: number;
  season?: string;
  format?: string;
  status?: string;
  sort?: SortOption;
}
