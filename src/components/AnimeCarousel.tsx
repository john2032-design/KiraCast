import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { AnimeMedia, WatchProgress } from '@/types';
import AnimeCard from './AnimeCard';

interface AnimeCarouselProps {
  title: string;
  animeList: AnimeMedia[];
  showProgress?: boolean;
  progressMap?: Record<string, WatchProgress>;
  size?: 'sm' | 'md' | 'lg';
  rankStart?: number;
}

export default function AnimeCarousel({ title, animeList, showProgress, progressMap, size = 'sm', rankStart }: AnimeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -400 : 400;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (!animeList.length) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4 lg:px-6">
        <h2 className="text-sm md:text-base font-bold uppercase tracking-wider text-[#f8fafc]">
          {title}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-md bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-md bg-[#0f172a] hover:bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 md:gap-4 overflow-x-auto hide-scrollbar px-4 lg:px-6 pb-2"
      >
        {animeList.map((anime, idx) => (
          <AnimeCard
            key={anime.id}
            anime={anime}
            size={size}
            rank={rankStart ? rankStart + idx : undefined}
            showProgress={showProgress}
            progress={progressMap ? progressMap[`${anime.id}-1`] || null : null}
          />
        ))}
      </div>
    </section>
  );
}
