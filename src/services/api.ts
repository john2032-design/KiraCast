import type { AnimeMedia, AiringScheduleItem, SearchFilters } from '@/types';

const ANILIST_ENDPOINT = 'https://graphql.anilist.co';

function fetchAniList(query: string, variables?: Record<string, unknown>) {
  return fetch(ANILIST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  }).then((res) => {
    if (!res.ok) throw new Error(`AniList error: ${res.status}`);
    return res.json();
  });
}

const MEDIA_FIELDS = `
  id
  title { romaji english native }
  coverImage { large extraLarge medium }
  bannerImage
  description
  genres
  studios { edges { node { name } } }
  format
  status
  episodes
  duration
  averageScore
  meanScore
  popularity
  season
  seasonYear
  startDate { year month day }
  nextAiringEpisode { airingAt episode }
  trailer { id site thumbnail }
  isAdult
  source
  type
  characters(sort: FAVOURITES_DESC, page: 1, perPage: 6) {
    edges {
      node { id name { full } image { medium } }
      voiceActors(language: JAPANESE, page: 1, perPage: 1) {
        name { full }
        image { medium }
        language
      }
    }
  }
  relations {
    edges {
      relationType
      node {
        id
        title { romaji english }
        coverImage { large }
        format
        type
      }
    }
  }
`;

export function getTrendingAnime(page = 1, perPage = 25) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return fetchAniList(query, { page, perPage })
    .then((data) => data.data?.Page?.media || []) as Promise<AnimeMedia[]>;
}

export function getPopularAnime(page = 1, perPage = 25) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return fetchAniList(query, { page, perPage })
    .then((data) => data.data?.Page?.media || []) as Promise<AnimeMedia[]>;
}

export function getTopRatedAnime(page = 1, perPage = 25) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return fetchAniList(query, { page, perPage })
    .then((data) => data.data?.Page?.media || []) as Promise<AnimeMedia[]>;
}

export function getTopAiringAnime(page = 1, perPage = 25) {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, status: RELEASING, sort: POPULARITY_DESC, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return fetchAniList(query, { page, perPage })
    .then((data) => data.data?.Page?.media || []) as Promise<AnimeMedia[]>;
}

export function getAnimeById(id: number) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FIELDS}
      }
    }
  `;
  return fetchAniList(query, { id })
    .then((data) => data.data?.Media || null) as Promise<AnimeMedia | null>;
}

export function searchAnime(
  search: string,
  filters?: SearchFilters,
  page = 1,
  perPage = 25
) {
  const query = `
    query ($search: String, $page: Int, $perPage: Int, $genre: String, $year: Int, $season: MediaSeason, $format: MediaFormat, $status: MediaStatus, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { total currentPage hasNextPage }
        media(type: ANIME, search: $search, genre: $genre, seasonYear: $year, season: $season, format: $format, status: $status, sort: $sort, isAdult: false) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  const variables: Record<string, unknown> = { search, page, perPage };
  if (filters?.genre) variables.genre = filters.genre;
  if (filters?.year) variables.year = filters.year;
  if (filters?.season) variables.season = filters.season;
  if (filters?.format) variables.format = filters.format;
  if (filters?.status) variables.status = filters.status;
  if (filters?.sort) variables.sort = [filters.sort];
  else variables.sort = ['POPULARITY_DESC'];

  return fetchAniList(query, variables)
    .then((data) => ({
      media: data.data?.Page?.media || [],
      pageInfo: data.data?.Page?.pageInfo || { hasNextPage: false },
    })) as Promise<{ media: AnimeMedia[]; pageInfo: { hasNextPage: boolean } }>;
}

export function getAiringSchedule(page = 1, perPage = 50, airingAtGreater?: number, airingAtLesser?: number) {
  const query = `
    query ($page: Int, $perPage: Int, $airingAtGreater: Int, $airingAtLesser: Int) {
      Page(page: $page, perPage: $perPage) {
        airingSchedules(airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser) {
          id
          episode
          airingAt
          media {
            id
            title { romaji english }
            coverImage { large }
            format
          }
        }
      }
    }
  `;
  const variables: Record<string, unknown> = { page, perPage };
  if (airingAtGreater) variables.airingAtGreater = airingAtGreater;
  if (airingAtLesser) variables.airingAtLesser = airingAtLesser;

  return fetchAniList(query, variables)
    .then((data) => data.data?.Page?.airingSchedules || []) as Promise<AiringScheduleItem[]>;
}

export function getSeasonalAnime(year: number, season: string, page = 1, perPage = 25) {
  const query = `
    query ($year: Int, $season: MediaSeason, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, seasonYear: $year, season: $season, isAdult: false, sort: POPULARITY_DESC) {
          ${MEDIA_FIELDS}
        }
      }
    }
  `;
  return fetchAniList(query, { year, season, page, perPage })
    .then((data) => data.data?.Page?.media || []) as Promise<AnimeMedia[]>;
}

export function getGenres() {
  const query = `
    query {
      GenreCollection
    }
  `;
  return fetchAniList(query)
    .then((data) => data.data?.GenreCollection || []) as Promise<string[]>;
}

export const JIKAN_API = {
  getTopAnime: async (page = 1, limit = 25) => {
    const res = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  },
  getAnimeById: async (id: number) => {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
    if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
    const data = await res.json();
    return data.data || null;
  },
  searchAnime: async (q: string, page = 1, limit = 25) => {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  },
  getSeasonal: async (year: number, season: string, page = 1, limit = 25) => {
    const res = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  },
  getSchedule: async (day?: string) => {
    const url = day
      ? `https://api.jikan.moe/v4/schedules?filter=${day}`
      : 'https://api.jikan.moe/v4/schedules';
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Jikan error: ${res.status}`);
    const data = await res.json();
    return data.data || [];
  },
};
