import { useState, useEffect } from 'react';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { AnimeMedia } from '@/types';
import { getTrendingAnime, getPopularAnime, getTopRatedAnime, getTopAiringAnime } from '@/services/api';
import { storage } from '@/services/storage';
import { DEMO_ANIME } from '@/data/demo';
import AnimeCarousel from '@/components/AnimeCarousel';
import { AnimeCarouselSkeleton, HeroSkeleton } from '@/components/Skeletons';

interface HomePageProps {
  tab?: string;
}

export default function HomePage({ tab }: HomePageProps) {
  const [trending, setTrending] = useState<AnimeMedia[]>([]);
  const [popular, setPopular] = useState<AnimeMedia[]>([]);
  const [topRated, setTopRated] = useState<AnimeMedia[]>([]);
  const [topAiring, setTopAiring] = useState<AnimeMedia[]>([]);
  const [continueWatching, setContinueWatching] = useState<ReturnType<typeof storage.getContinueWatching>>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Show demo data immediately for instant render
    setTrending(DEMO_ANIME);
    setPopular(DEMO_ANIME.slice().reverse());
    setTopRated(DEMO_ANIME.slice().sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0)));
    setTopAiring(DEMO_ANIME.filter((a) => a.status === 'RELEASING'));
    setContinueWatching(storage.getContinueWatching());

    Promise.all([
      getTrendingAnime(1, 15),
      getPopularAnime(1, 15),
      getTopRatedAnime(1, 15),
      getTopAiringAnime(1, 15),
    ])
      .then(([t, p, tr, ta]) => {
        if (cancelled) return;
        if (t.length) setTrending(t);
        if (p.length) setPopular(p);
        if (tr.length) setTopRated(tr);
        if (ta.length) setTopAiring(ta);
      })
      .catch(() => {
        // Keep demo data on error
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab]);

  // Auto-rotate hero
  useEffect(() => {
    if (!trending.length) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % Math.min(trending.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trending]);

  const heroAnime = trending[heroIndex];

  const progressMap = continueWatching.reduce((acc, item) => {
    acc[`${item.animeId}-${item.episodeNumber}`] = item;
    return acc;
  }, {} as Record<string, ReturnType<typeof storage.getContinueWatching>[0]>);

  const scrollHero = (dir: 'left' | 'right') => {
    setHeroIndex((prev) => {
      const max = Math.min(trending.length, 5);
      if (dir === 'left') return (prev - 1 + max) % max;
      return (prev + 1) % max;
    });
  };

  return (
    <div className="min-h-screen pb-20 pt-16 lg:pt-0">
      {/* Hero Section */}
      {loading ? (
        <div className="px-4 lg:px-6 pt-4">
          <HeroSkeleton />
        </div>
      ) : heroAnime ? (
        <section className="relative w-full aspect-[16/9] md:aspect-[21/9] max-h-[600px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroAnime.bannerImage || heroAnime.coverImage.extraLarge || '/hero-fallback.jpg'}
              alt={heroAnime.title.english || heroAnime.title.romaji}
              className="w-full h-full object-cover transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/80 via-transparent to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-16">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#f43f5e] text-white text-xs font-bold px-2 py-1 rounded">
                  FEATURED
                </span>
                {heroAnime.format && (
                  <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded">
                    {heroAnime.format}
                  </span>
                )}
                {heroAnime.averageScore && (
                  <span className="bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    {(heroAnime.averageScore / 10).toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
                {heroAnime.title.english || heroAnime.title.romaji}
              </h1>

              <p className="text-sm md:text-base text-[#94a3b8] line-clamp-2 md:line-clamp-3 mb-5 max-w-xl">
                {heroAnime.description?.replace(/<[^>]*>/g, '').slice(0, 200)}...
              </p>

              <div className="flex items-center gap-3">
                <a
                  href={`/anime/${heroAnime.id}`}
                  className="flex items-center gap-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Play className="w-5 h-5 fill-white" />
                  Watch Now
                </a>
                <a
                  href={`/anime/${heroAnime.id}`}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Info className="w-5 h-5" />
                  Details
                </a>
              </div>
            </div>
          </div>

          {/* Hero navigation dots */}
          {trending.length > 1 && (
            <>
              <div className="absolute bottom-6 right-6 md:right-10 flex items-center gap-2">
                <button
                  onClick={() => scrollHero('left')}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-1.5">
                  {trending.slice(0, 5).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === heroIndex ? 'w-6 bg-[#f43f5e]' : 'w-1.5 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => scrollHero('right')}
                  className="p-2 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </section>
      ) : null}

      <div className="pt-4">
        {/* Continue Watching */}
        {!loading && continueWatching.length > 0 && (
          <AnimeCarousel
            title="Continue Watching"
            animeList={continueWatching.map((p) => ({
              id: p.animeId,
              title: { romaji: p.animeTitle, english: p.animeTitle, native: p.animeTitle },
              coverImage: { large: p.coverImage, extraLarge: p.coverImage, medium: p.coverImage },
              bannerImage: null,
              description: null,
              genres: [],
              studios: { edges: [] },
              format: 'TV',
              status: 'RELEASING',
              episodes: null,
              duration: null,
              averageScore: null,
              meanScore: null,
              popularity: 0,
              season: null,
              seasonYear: null,
              startDate: { year: null, month: null, day: null },
              nextAiringEpisode: null,
              trailer: null,
              isAdult: false,
              source: null,
              type: 'ANIME',
              characters: { edges: [] },
              relations: { edges: [] },
            }))}
            showProgress
            progressMap={progressMap}
            size="md"
          />
        )}

        {loading ? (
          <>
            <AnimeCarouselSkeleton />
            <AnimeCarouselSkeleton />
            <AnimeCarouselSkeleton />
            <AnimeCarouselSkeleton />
          </>
        ) : (
          <>
            <AnimeCarousel title="Trending Now" animeList={trending} />
            <AnimeCarousel title="Top Rated" animeList={topRated} rankStart={1} />
            <AnimeCarousel title="Top Airing" animeList={topAiring} />
            <AnimeCarousel title="Popular" animeList={popular} />
          </>
        )}
      </div>
    </div>
  );
}
