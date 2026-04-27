import type { WatchProgress, WatchHistoryItem, UserSettings, AnimeMedia } from '@/types';
import { DEFAULT_SETTINGS } from '@/types';

const STORAGE_KEYS = {
  watchProgress: 'kiracast_watch_progress',
  watchHistory: 'kiracast_watch_history',
  settings: 'kiracast_settings',
  bookmarks: 'kiracast_bookmarks',
  searchHistory: 'kiracast_search_history',
};

export const storage = {
  getWatchProgress(): Record<string, WatchProgress> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.watchProgress);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveWatchProgress(animeId: number, episodeNumber: number, currentTime: number, duration: number, anime: AnimeMedia) {
    const progress = this.getWatchProgress();
    const key = `${animeId}-${episodeNumber}`;
    progress[key] = {
      animeId,
      episodeNumber,
      currentTime,
      duration,
      updatedAt: Date.now(),
      animeTitle: anime.title.english || anime.title.romaji,
      coverImage: anime.coverImage.large,
    };
    localStorage.setItem(STORAGE_KEYS.watchProgress, JSON.stringify(progress));
    this.addToHistory(animeId, episodeNumber, currentTime, duration, anime);
  },

  getProgressForEpisode(animeId: number, episodeNumber: number): WatchProgress | null {
    const progress = this.getWatchProgress();
    return progress[`${animeId}-${episodeNumber}`] || null;
  },

  getContinueWatching(): WatchProgress[] {
    const progress = this.getWatchProgress();
    const items = Object.values(progress);
    // Filter items that are not completed (less than 95% watched)
    return items
      .filter((p) => p.duration > 0 && p.currentTime / p.duration < 0.95)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 20);
  },

  addToHistory(animeId: number, episodeNumber: number, currentTime: number, duration: number, anime: AnimeMedia) {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.watchHistory);
      const history: WatchHistoryItem[] = raw ? JSON.parse(raw) : [];
      const newItem: WatchHistoryItem = {
        id: `${animeId}-${episodeNumber}-${Date.now()}`,
        animeId,
        episodeNumber,
        currentTime,
        duration,
        updatedAt: Date.now(),
        animeTitle: anime.title.english || anime.title.romaji,
        coverImage: anime.coverImage.large,
      };
      // Remove duplicates for same anime/episode
      const filtered = history.filter((h) => !(h.animeId === animeId && h.episodeNumber === episodeNumber));
      filtered.unshift(newItem);
      // Keep only last 200 entries
      const trimmed = filtered.slice(0, 200);
      localStorage.setItem(STORAGE_KEYS.watchHistory, JSON.stringify(trimmed));
    } catch {
      // ignore
    }
  },

  getHistory(): WatchHistoryItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.watchHistory);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.watchHistory);
    localStorage.removeItem(STORAGE_KEYS.watchProgress);
  },

  getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.settings);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings) {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  },

  getBookmarks(): number[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.bookmarks);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addBookmark(animeId: number) {
    const bookmarks = this.getBookmarks();
    if (!bookmarks.includes(animeId)) {
      bookmarks.unshift(animeId);
      localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(bookmarks));
    }
  },

  removeBookmark(animeId: number) {
    const bookmarks = this.getBookmarks();
    const filtered = bookmarks.filter((id) => id !== animeId);
    localStorage.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(filtered));
  },

  isBookmarked(animeId: number): boolean {
    return this.getBookmarks().includes(animeId);
  },

  getSearchHistory(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.searchHistory);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  addSearchQuery(query: string) {
    if (!query.trim()) return;
    const history = this.getSearchHistory();
    const filtered = history.filter((q) => q.toLowerCase() !== query.toLowerCase().trim());
    filtered.unshift(query.trim());
    localStorage.setItem(STORAGE_KEYS.searchHistory, JSON.stringify(filtered.slice(0, 20)));
  },

  clearSearchHistory() {
    localStorage.removeItem(STORAGE_KEYS.searchHistory);
  },
};
