import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Play,
  Plus,
  Check,
  Star,
  Clock,
  Calendar,
  Building2,
  Tv,
  Film,
  BookOpen,
  Users,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import type { AnimeMedia } from '@/types';
import { getAnimeById } from '@/services/api';
import { storage } from '@/services/storage';
import { DEMO_ANIME } from '@/data/demo';
import AnimeCard from '@/components/AnimeCard';

export default function AnimeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [anime, setAnime] = useState<AnimeMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeTab, setActiveTab] = useState<'episodes' | 'characters' | 'related'>('episodes');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const demo = DEMO_ANIME.find((a) => a.id === parseInt(id));
    if (demo) {
      setAnime(demo);
      setBookmarked(storage.isBookmarked(demo.id));
      setLoading(false);
    }
    getAnimeById(parseInt(id))
      .then((data) => {
        if (data) {
          setAnime(data);
          setBookmarked(storage.isBookmarked(data.id));
        }
      })
      .catch(() => {
        if (!demo) setAnime(null);
      })
      .finally(() => {
        if (!demo) setLoading(false);
      });
  }, [id]);

  const toggleBookmark = () => {
    if (!anime) return;
    if (bookmarked) {
      storage.removeBookmark(anime.id);
    } else {
      storage.addBookmark(anime.id);
    }
    setBookmarked(!bookmarked);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 lg:pt-0">
        <Loader2 className="w-8 h-8 text-[#f43f5e] animate-spin" />
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16 lg:pt-0">
        <div className="text-center">
          <p className="text-[#94a3b8] text-lg">Anime not found</p>
          <a href="#/" className="text-[#f43f5e] hover:underline mt-2 inline-block">
            Go home
          </a>
        </div>
      </div>
    );
  }

  const title = anime.title.english || anime.title.romaji;
  const description = anime.description?.replace(/<[^>]*>/g, '') || 'No description available.';
  const studio = anime.studios?.edges?.[0]?.node?.name;
  const episodes = anime.episodes || 12;

  // Generate mock episodes since streaming APIs don't provide episode metadata
  const episodeList = Array.from({ length: Math.min(episodes, 100) }, (_, i) => {
    const epNum = i + 1;
    const progress = storage.getProgressForEpisode(anime.id, epNum);
    return {
      number: epNum,
      title: `Episode ${epNum}`,
      thumbnail: anime.coverImage.large,
      duration: anime.duration || 24,
      progress,
    };
  });

  const relatedAnime = anime.relations?.edges
    ?.filter((e) => e.node.type === 'ANIME')
    .slice(0, 10)
    .map((e) => ({
      ...e.node,
      bannerImage: null,
      coverImage: { large: e.node.coverImage.large, extraLarge: e.node.coverImage.large, medium: e.node.coverImage.large },
      description: null,
      genres: [],
      studios: { edges: [] },
      status: 'FINISHED' as const,
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
      type: 'ANIME' as const,
      characters: { edges: [] },
      relations: { edges: [] },
      title: { romaji: e.node.title.romaji, english: e.node.title.english, native: null },
    })) || [];

  return (
    <div className="min-h-screen pb-20">
      {/* Banner */}
      <div className="relative w-full aspect-[21/9] max-h-[400px] overflow-hidden">
        <img
          src={anime.bannerImage || anime.coverImage.extraLarge || '/hero-fallback.jpg'}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/60 via-transparent to-transparent" />
      </div>

      <div className="px-4 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          {/* Poster */}
          <div className="flex-shrink-0 mx-auto md:mx-0">
            <div className="w-[180px] md:w-[220px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl shadow-black/50 bg-[#0f172a]">
              <img
                src={anime.coverImage.large}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#f8fafc] mb-2">
              {title}
            </h1>
            <h2 className="text-sm md:text-base text-[#94a3b8] mb-4">
              {anime.title.native}
            </h2>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {anime.averageScore && (
                <div className="flex items-center gap-1 bg-[#0f172a] px-2.5 py-1 rounded-lg text-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-[#f8fafc] font-semibold">{(anime.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              {anime.format && (
                <div className="flex items-center gap-1 bg-[#0f172a] px-2.5 py-1 rounded-lg text-sm text-[#94a3b8]">
                  <Tv className="w-4 h-4" />
                  {anime.format}
                </div>
              )}
              {anime.episodes && (
                <div className="flex items-center gap-1 bg-[#0f172a] px-2.5 py-1 rounded-lg text-sm text-[#94a3b8]">
                  <Film className="w-4 h-4" />
                  {anime.episodes} eps
                </div>
              )}
              {anime.duration && (
                <div className="flex items-center gap-1 bg-[#0f172a] px-2.5 py-1 rounded-lg text-sm text-[#94a3b8]">
                  <Clock className="w-4 h-4" />
                  {anime.duration}m
                </div>
              )}
              {anime.status && (
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-medium ${
                    anime.status === 'RELEASING'
                      ? 'bg-[#22c55e]/10 text-[#22c55e]'
                      : 'bg-[#0f172a] text-[#94a3b8]'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${anime.status === 'RELEASING' ? 'bg-[#22c55e] animate-pulse' : 'bg-[#94a3b8]'}`} />
                  {anime.status === 'RELEASING' ? 'Airing' : anime.status === 'FINISHED' ? 'Completed' : anime.status}
                </div>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-5">
              {anime.genres?.map((genre) => (
                <a
                  key={genre}
                  href={`/search?genre=${genre}`}
                  className="px-3 py-1 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] rounded-lg text-xs text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                >
                  {genre}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-6">
              <a
                href={`/watch/${anime.id}/${selectedEpisode}`}
                className="flex items-center gap-2 bg-[#f43f5e] hover:bg-[#e11d48] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5 fill-white" />
                Watch Now
              </a>
              <button
                onClick={toggleBookmark}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors border ${
                  bookmarked
                    ? 'bg-[#f43f5e]/10 border-[#f43f5e]/30 text-[#f43f5e]'
                    : 'bg-[#0f172a] border-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] hover:border-[#334155]'
                }`}
              >
                {bookmarked ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {bookmarked ? 'In List' : 'Add to List'}
              </button>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className={`text-sm text-[#94a3b8] leading-relaxed ${descExpanded ? '' : 'line-clamp-3'}`}>
                {description}
              </p>
              {description.length > 200 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-[#f43f5e] text-sm mt-1 hover:underline flex items-center gap-1"
                >
                  {descExpanded ? (
                    <>
                      Show Less <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {studio && (
                <div className="bg-[#0f172a] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs mb-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Studio
                  </div>
                  <p className="text-sm text-[#f8fafc] font-medium">{studio}</p>
                </div>
              )}
              {anime.seasonYear && (
                <div className="bg-[#0f172a] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Season
                  </div>
                  <p className="text-sm text-[#f8fafc] font-medium">
                    {anime.season} {anime.seasonYear}
                  </p>
                </div>
              )}
              {anime.source && (
                <div className="bg-[#0f172a] rounded-lg p-3">
                  <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs mb-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Source
                  </div>
                  <p className="text-sm text-[#f8fafc] font-medium capitalize">{anime.source.toLowerCase()}</p>
                </div>
              )}
              <div className="bg-[#0f172a] rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-[#94a3b8] text-xs mb-1">
                  <Users className="w-3.5 h-3.5" />
                  Popularity
                </div>
                <p className="text-sm text-[#f8fafc] font-medium">{anime.popularity?.toLocaleString() || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-[#1e293b]">
          <div className="flex items-center gap-1">
            {[
              { key: 'episodes' as const, label: 'Episodes', icon: Play },
              { key: 'characters' as const, label: 'Characters', icon: Users },
              { key: 'related' as const, label: 'Related', icon: Tv },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-[#f43f5e] border-[#f43f5e]'
                    : 'text-[#94a3b8] border-transparent hover:text-[#f8fafc]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'episodes' && (
            <div className="space-y-2">
              {episodeList.map((ep) => (
                <a
                  key={ep.number}
                  href={`/watch/${anime.id}/${ep.number}`}
                  onClick={() => setSelectedEpisode(ep.number)}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-colors group ${
                    selectedEpisode === ep.number
                      ? 'bg-[#f43f5e]/10 border border-[#f43f5e]/20'
                      : 'bg-[#0f172a] hover:bg-[#1e293b] border border-transparent'
                  }`}
                >
                  <div className="relative w-[120px] md:w-[160px] aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-[#030712]">
                    <img
                      src={ep.thumbnail}
                      alt={ep.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-[#f43f5e]/90 flex items-center justify-center">
                        <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {ep.duration}m
                    </div>
                    {/* Progress overlay */}
                    {ep.progress && ep.progress.duration > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div
                          className="h-full bg-[#f43f5e]"
                          style={{ width: `${Math.min((ep.progress.currentTime / ep.progress.duration) * 100, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-[#94a3b8]">EP {ep.number}</span>
                      {ep.progress && ep.progress.currentTime > 0 && (
                        <span className="text-xs text-[#f43f5e]">
                          {Math.round((ep.progress.currentTime / ep.progress.duration) * 100)}% watched
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-[#f8fafc] group-hover:text-[#f43f5e] transition-colors">
                      {ep.title}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {anime.characters?.edges?.map((char) => (
                <div key={char.node.id} className="bg-[#0f172a] rounded-xl overflow-hidden">
                  <div className="aspect-square">
                    <img
                      src={char.node.image.medium}
                      alt={char.node.name.full}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-medium text-[#f8fafc] line-clamp-1">{char.node.name.full}</p>
                    {char.voiceActors?.[0] && (
                      <p className="text-xs text-[#94a3b8] mt-1 line-clamp-1">
                        {char.voiceActors[0].name.full}
                      </p>
                    )}
                  </div>
                </div>
              )) || (
                <p className="text-[#94a3b8] col-span-full text-center py-10">No character data available.</p>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div className="flex flex-wrap gap-3 md:gap-4">
              {relatedAnime.length > 0 ? (
                relatedAnime.map((rel) => <AnimeCard key={rel.id} anime={rel} />)
              ) : (
                <p className="text-[#94a3b8] text-center py-10 w-full">No related anime found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
