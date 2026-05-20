const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function buildPosterUrl(posterPath, size = "w185") {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function extractYear(releaseDate) {
  if (!releaseDate || releaseDate.length < 4) return null;
  return releaseDate.slice(0, 4);
}

export function mapTmdbMovie(movie) {
  const posterPath = movie.poster_path ?? null;

  return {
    tmdbId: movie.id,
    title: movie.title ?? movie.original_title ?? "Sin título",
    originalTitle: movie.original_title ?? null,
    overview: movie.overview ?? null,
    releaseDate: movie.release_date ?? null,
    year: extractYear(movie.release_date),
    posterPath,
    posterUrl: buildPosterUrl(posterPath),
    voteAverage:
      typeof movie.vote_average === "number" ? movie.vote_average : null,
  };
}
