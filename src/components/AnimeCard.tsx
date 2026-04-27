import { useState } from 'react';
import { Play, Clock, Star, Bookmark, BookmarkCheck } from 'lucide-react';
import type { AnimeMedia, WatchProgress } from '@/types';
import { storage } from '@/services/storage';

interface AnimeCardProps {
  anime: AnimeMedia;
  showProgress?: boolean;
  progress?: WatchProgress | null;
  rank?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function AnimeCard({ anime, showProgress, progress, rank, size = 'sm' }: AnimeCardProps) {
  const [bookmarked, setBookmarked] = useState(() => storage.isBookmarked(anime.id));
  const [imageLoaded, setImageLoaded] = useState(false);

  const title = anime.title.english || anime.title.romaji;
  const cover = anime.coverImage.large || anime.coverImage.medium;

  const aspectClass = size === 'lg' ? 'aspect-video' : 'aspect-[3/4]';
  const cardWidth = size === 'lg' ? 'w-[280px] md:w-[320px]' : size === 'md' ? 'w-[160px] md:w-[180px]' : 'w-[140px] md:w-[160px]';

  const progressPercent = progress && progress.duration > 0
    ? Math.min((progress.currentTime / progress.duration) * 100, 100)
    : 0;

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bookmarked) {
      storage.removeBookmark(anime.id);
    } else {
      storage.addBookmark(anime.id);
    }
    setBookmarked(!bookmarked);
  };

  return (
    <a
      href={`/anime/${anime.id}`}
      className={`${cardWidth} flex-shrink-0 group cursor-pointer block`}
    >
      <div className={`relative ${aspectClass} rounded-lg overflow-hidden bg-[#0f172a] mb-2`}>
        {!imageLoaded && <div className="absolute inset-0 skeleton" />}
        <img
          src={cover}
          alt={title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Play icon on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-[#f43f5e]/90 flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Rank badge */}
        {rank && (
          <div className="absolute top-2 left-2 bg-[#f43f5e] text-white text-xs font-bold px-2 py-0.5 rounded">
            #{rank}
          </div>
        )}

        {/* Score badge */}
        {anime.averageScore && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-1.5 py-0.5 rounded flex items-center gap-1">
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            {(anime.averageScore / 10).toFixed(1)}
          </div>
        )}

        {/* Bookmark button */}
        <button
          onClick={toggleBookmark}
          className="absolute bottom-2 right-2 p-1.5 rounded-md bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[#f43f5e]"
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4 text-white" />
          ) : (
            <Bookmark className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Progress bar */}
        {showProgress && progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-[#f43f5e] progress-glow"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Format badge */}
        {anime.format && (
          <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
            {anime.format}
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-[#f8fafc] line-clamp-2 leading-tight group-hover:text-[#f43f5e] transition-colors">
        {title}
      </h3>

      {/* Meta */}
      <div className="flex items-center gap-1.5 mt-1 text-xs text-[#94a3b8]">
        {anime.status && (
          <span className={`${anime.status === 'RELEASING' ? 'text-[#22c55e]' : ''}`}>
            {anime.status === 'RELEASING' ? 'Airing' : anime.status === 'FINISHED' ? 'Completed' : anime.status}
          </span>
        )}
        {anime.episodes && (
          <>
            <span>·</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-3 h-3" />
              {anime.episodes} eps
            </span>
          </>
        )}
      </div>

      {showProgress && progress && (
        <p className="text-xs text-[#94a3b8] mt-1">
          EP {progress.episodeNumber} · {formatTime(progress.currentTime)} / {formatTime(progress.duration)}
        </p>
      )}
    </a>
  );
}

function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    return `${h}:${String(m % 60).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}
