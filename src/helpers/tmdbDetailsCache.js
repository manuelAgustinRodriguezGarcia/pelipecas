import { fetchTmdbMovieDetails } from "@/helpers/fetchTmdbMovieDetails";

const cache = new Map();
const inflight = new Map();

export function getCachedTmdbDetails(tmdbId) {
  if (!tmdbId) return null;
  return cache.get(tmdbId) ?? null;
}

export function setCachedTmdbDetails(tmdbId, detail) {
  if (!tmdbId || !detail) return;
  cache.set(tmdbId, detail);
}

export function prefetchTmdbMovieDetails(tmdbId) {
  if (!tmdbId) return Promise.resolve(null);

  const cached = cache.get(tmdbId);
  if (cached) return Promise.resolve(cached);

  const pending = inflight.get(tmdbId);
  if (pending) return pending;

  const request = fetchTmdbMovieDetails(tmdbId)
    .then((detail) => {
      if (detail) cache.set(tmdbId, detail);
      inflight.delete(tmdbId);
      return detail;
    })
    .catch(() => {
      inflight.delete(tmdbId);
      return null;
    });

  inflight.set(tmdbId, request);
  return request;
}

export function mergeTmdbDetailsIntoMovie(movie, detail) {
  if (!movie || !detail) return movie;

  return {
    ...movie,
    overview: detail.overview ?? movie.overview,
    voteAverage:
      detail.voteAverage != null ? detail.voteAverage : movie.voteAverage,
    runtime: detail.runtime != null ? detail.runtime : movie.runtime,
    watchProviders:
      movie.watchProviders !== undefined
        ? movie.watchProviders
        : Array.isArray(detail.watchProviders)
          ? detail.watchProviders
          : undefined,
  };
}
