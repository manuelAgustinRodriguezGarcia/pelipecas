/**
 * Fetches enriched TMDB movie data through the app API (server-side TMDB proxy).
 */
export async function fetchTmdbMovieDetails(tmdbId, signal) {
  if (!tmdbId) return null;

  try {
    const response = await fetch(`/api/tmdb/movie?movieId=${tmdbId}`, {
      signal,
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.movie ?? null;
  } catch {
    return null;
  }
}
