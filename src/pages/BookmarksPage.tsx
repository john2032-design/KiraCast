import { useState, useEffect } from 'react';
import { Bookmark, Loader2, Trash2 } from 'lucide-react';
import type { AnimeMedia } from '@/types';
import { getAnimeById } from '@/services/api';
import { storage } from '@/services/storage';
import AnimeCard from '@/components/AnimeCard';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [animeList, setAnimeList] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = storage.getBookmarks();
    setBookmarks(ids);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    Promise.all(ids.map((id) => getAnimeById(id).catch(() => null)))
      .then((results) => {
        const valid = results.filter((a): a is AnimeMedia => a !== null);
        setAnimeList(valid);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleRemove = (id: number) => {
    storage.removeBookmark(id);
    setBookmarks((prev) => prev.filter((bid) => bid !== id));
    setAnimeList((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen pt-20 lg:pt-6 pb-20 px-4 lg:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-[#f43f5e]" />
            <h1 className="text-2xl font-bold text-[#f8fafc]">My List</h1>
          </div>
          {bookmarks.length > 0 && (
            <span className="text-sm text-[#94a3b8]">{bookmarks.length} anime</span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#f43f5e] animate-spin" />
          </div>
        ) : animeList.length === 0 ? (
          <div className="text-center py-20">
            <Bookmark className="w-12 h-12 text-[#1e293b] mx-auto mb-4" />
            <p className="text-[#94a3b8]">Your list is empty</p>
            <p className="text-[#64748b] text-sm mt-1">Bookmark anime to add them here</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3 md:gap-4">
            {animeList.map((anime) => (
              <div key={anime.id} className="relative group">
                <AnimeCard anime={anime} />
                <button
                  onClick={() => handleRemove(anime.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
