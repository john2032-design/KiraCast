import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, SlidersHorizontal, Loader2 } from 'lucide-react';
import type { AnimeMedia, SearchFilters, SortOption } from '@/types';
import { searchAnime, getGenres } from '@/services/api';
import { storage } from '@/services/storage';
import AnimeCard from '@/components/AnimeCard';
import { AnimeCardSkeleton } from '@/components/Skeletons';

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Popularity', value: 'POPULARITY_DESC' },
  { label: 'Trending', value: 'TRENDING_DESC' },
  { label: 'Top Rated', value: 'SCORE_DESC' },
  { label: 'Newest', value: 'START_DATE_DESC' },
  { label: 'Most Favorited', value: 'FAVOURITES_DESC' },
];

const FORMAT_OPTIONS = ['TV', 'TV_SHORT', 'MOVIE', 'OVA', 'ONA', 'SPECIAL'];
const STATUS_OPTIONS = [
  { label: 'Airing', value: 'RELEASING' },
  { label: 'Finished', value: 'FINISHED' },
  { label: 'Not Yet Aired', value: 'NOT_YET_RELEASED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];
const SEASON_OPTIONS = ['WINTER', 'SPRING', 'SUMMER', 'FALL'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [genres, setGenres] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getGenres().then(setGenres).catch(() => setGenres([]));
    setSearchHistory(storage.getSearchHistory());
  }, []);

  const performSearch = useCallback(
    async (pageNum: number, newSearch = false) => {
      if (!query.trim()) return;
      setLoading(true);
      try {
        const data = await searchAnime(query.trim(), filters, pageNum, 24);
        if (newSearch) {
          setResults(data.media);
        } else {
          setResults((prev) => [...prev, ...data.media]);
        }
        setHasMore(data.pageInfo.hasNextPage);
        storage.addSearchQuery(query.trim());
        setSearchHistory(storage.getSearchHistory());
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [query, filters]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        setPage(1);
        performSearch(1, true);
      } else {
        setResults([]);
        setHasMore(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, filters]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    performSearch(next);
  };

  const updateFilter = (key: keyof SearchFilters, value: string | number | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen pt-20 lg:pt-6 pb-20 px-4 lg:px-6">
      {/* Search Header */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anime, movies, OVAs..."
            className="w-full bg-[#0f172a] border border-[#1e293b] rounded-xl pl-12 pr-12 py-3.5 text-[#f8fafc] placeholder-[#64748b] focus:outline-none focus:border-[#f43f5e] focus:ring-1 focus:ring-[#f43f5e] transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[#1e293b] text-[#94a3b8]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
              activeFilterCount > 0
                ? 'bg-[#f43f5e]/20 text-[#f43f5e]'
                : 'hover:bg-[#1e293b] text-[#94a3b8]'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f43f5e] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Search History */}
        {!query && searchHistory.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-[#94a3b8] font-semibold">Recent Searches</span>
              <button
                onClick={() => {
                  storage.clearSearchHistory();
                  setSearchHistory([]);
                }}
                className="text-xs text-[#f43f5e] hover:underline"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-3 py-1.5 bg-[#0f172a] hover:bg-[#1e293b] rounded-lg text-sm text-[#94a3b8] hover:text-[#f8fafc] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {filtersOpen && (
          <div className="mt-4 p-4 bg-[#0f172a] border border-[#1e293b] rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#f8fafc]">Filters</span>
              <button onClick={clearFilters} className="text-xs text-[#f43f5e] hover:underline">
                Reset all
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Genre */}
              <div>
                <label className="text-xs text-[#94a3b8] mb-1 block">Genre</label>
                <select
                  value={filters.genre || ''}
                  onChange={(e) => updateFilter('genre', e.target.value || undefined)}
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#f43f5e]"
                >
                  <option value="">Any</option>
                  {genres.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-xs text-[#94a3b8] mb-1 block">Sort By</label>
                <select
                  value={filters.sort || 'POPULARITY_DESC'}
                  onChange={(e) => updateFilter('sort', e.target.value as SortOption)}
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#f43f5e]"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label className="text-xs text-[#94a3b8] mb-1 block">Format</label>
                <select
                  value={filters.format || ''}
                  onChange={(e) => updateFilter('format', e.target.value || undefined)}
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#f43f5e]"
                >
                  <option value="">Any</option>
                  {FORMAT_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs text-[#94a3b8] mb-1 block">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => updateFilter('status', e.target.value || undefined)}
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#f43f5e]"
                >
                  <option value="">Any</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Season */}
              <div>
                <label className="text-xs text-[#94a3b8] mb-1 block">Season</label>
                <select
                  value={filters.season || ''}
                  onChange={(e) => updateFilter('season', e.target.value || undefined)}
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#f43f5e]"
                >
                  <option value="">Any</option>
                  {SEASON_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s[0] + s.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="text-xs text-[#94a3b8] mb-1 block">Year</label>
                <select
                  value={filters.year || ''}
                  onChange={(e) => updateFilter('year', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full bg-[#030712] border border-[#1e293b] rounded-lg px-3 py-2 text-sm text-[#f8fafc] focus:outline-none focus:border-[#f43f5e]"
                >
                  <option value="">Any</option>
                  {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto">
        {loading && results.length === 0 && (
          <div className="flex flex-wrap gap-3 md:gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <AnimeCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-[#1e293b] mx-auto mb-4" />
            <p className="text-[#94a3b8] text-lg">No results found for &quot;{query}&quot;</p>
            <p className="text-[#64748b] text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {!query.trim() && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-[#1e293b] mx-auto mb-4" />
            <p className="text-[#94a3b8] text-lg">Start typing to search anime</p>
          </div>
        )}

        {results.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#94a3b8]">
                {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:gap-4">
              {results.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2.5 bg-[#0f172a] hover:bg-[#1e293b] border border-[#1e293b] rounded-lg text-sm text-[#f8fafc] font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
