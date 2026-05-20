import { buildPosterUrl, extractYear } from "@/helpers/tmdbHelpers";

export const STORAGE_KEY = "pelipecas_movies";

const POSTER_VARIANTS = [
  "posterNoir",
  "posterCharcoal",
  "posterGoldFrame",
  "posterMuted",
  "posterDeep",
  "posterElegant",
];

const SEED_MOVIES = [
  { title: "Interestelar", status: "pending" },
  { title: "La La Land", status: "pending" },
  { title: "Spider-Man: Sin Camino a Casa", status: "pending" },
  { title: "Parásitos", status: "pending" },
  { title: "El Padrino", status: "pending" },
  { title: "El Señor de los Anillos", status: "watched" },
  { title: "Joker", status: "watched" },
  { title: "El Viaje de Chihiro", status: "watched" },
];

const TMDB_DEFAULTS = {
  tmdbId: null,
  originalTitle: null,
  overview: null,
  releaseDate: null,
  year: null,
  posterPath: null,
  posterUrl: null,
  voteAverage: null,
};

export const RATING_CATEGORIES = [
  { key: "specialEffects", label: "Efectos Especiales" },
  { key: "music", label: "Música" },
  { key: "acting", label: "Actuación" },
  { key: "characters", label: "Personajes" },
  { key: "story", label: "Historia" },
];

export function createEmptyRatings() {
  return {
    specialEffects: null,
    music: null,
    acting: null,
    characters: null,
    story: null,
  };
}

export function normalizeRatings(ratings) {
  const empty = createEmptyRatings();
  if (!ratings || typeof ratings !== "object") return empty;

  for (const category of RATING_CATEGORIES) {
    const value = ratings[category.key];
    if (typeof value === "number" && value >= 0 && value <= 5) {
      empty[category.key] = value;
    }
  }

  return empty;
}

export function isRatingsComplete(ratings) {
  return RATING_CATEGORIES.every((category) => {
    const value = ratings?.[category.key];
    return typeof value === "number" && value >= 0 && value <= 5;
  });
}

function hashTitle(title) {
  let hash = 0;
  for (let i = 0; i < title.length; i += 1) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getMovieInitials(title) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function generatePosterVariant(title) {
  const index = hashTitle(title) % POSTER_VARIANTS.length;
  return POSTER_VARIANTS[index];
}

export function generateMovieVisual(title) {
  return {
    initials: getMovieInitials(title),
    posterVariant: generatePosterVariant(title),
  };
}

export function normalizeMovie(movie) {
  if (!movie || typeof movie !== "object") return null;

  const posterPath = movie.posterPath ?? null;
  const releaseDate = movie.releaseDate ?? null;

  return {
    id: movie.id || crypto.randomUUID(),
    title: (movie.title ?? "").trim() || "Sin título",
    status: movie.status === "watched" ? "watched" : "pending",
    createdAt: movie.createdAt || new Date().toISOString(),
    watchedAt: movie.watchedAt ?? null,
    timesPicked:
      typeof movie.timesPicked === "number" ? movie.timesPicked : 0,
    tmdbId: movie.tmdbId ?? null,
    originalTitle: movie.originalTitle ?? null,
    overview: movie.overview ?? null,
    releaseDate,
    year: movie.year ?? extractYear(releaseDate),
    posterPath,
    posterUrl: movie.posterUrl ?? buildPosterUrl(posterPath),
    voteAverage: movie.voteAverage ?? null,
    ratings: normalizeRatings(movie.ratings),
  };
}

export function createMovie(title, status = "pending") {
  const now = new Date().toISOString();
  return normalizeMovie({
    id: crypto.randomUUID(),
    title: title.trim(),
    status,
    createdAt: now,
    watchedAt: status === "watched" ? now : null,
    timesPicked: 0,
    ...TMDB_DEFAULTS,
  });
}

export function createMovieFromTmdb(tmdbData, status = "pending") {
  const now = new Date().toISOString();
  return normalizeMovie({
    id: crypto.randomUUID(),
    title: tmdbData.title,
    status,
    createdAt: now,
    watchedAt: null,
    timesPicked: 0,
    tmdbId: tmdbData.tmdbId,
    originalTitle: tmdbData.originalTitle,
    overview: tmdbData.overview,
    releaseDate: tmdbData.releaseDate,
    year: tmdbData.year,
    posterPath: tmdbData.posterPath,
    posterUrl: tmdbData.posterUrl,
    voteAverage: tmdbData.voteAverage,
  });
}

export function getPendingMovies(movies) {
  return movies.filter((movie) => movie.status === "pending");
}

export function getWatchedMovies(movies) {
  return movies.filter((movie) => movie.status === "watched");
}

export function normalizeTitle(title) {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isDuplicateTitle(movies, title) {
  const normalized = normalizeTitle(title);
  return movies.some((movie) => normalizeTitle(movie.title) === normalized);
}

export function isDuplicateTmdbId(movies, tmdbId) {
  if (tmdbId == null) return false;
  return movies.some((movie) => movie.tmdbId === tmdbId);
}

export function isDuplicateMovie(movies, { title, tmdbId }) {
  if (tmdbId != null) {
    return isDuplicateTmdbId(movies, tmdbId);
  }
  return isDuplicateTitle(movies, title);
}

export function getSeedMovies() {
  return SEED_MOVIES.map((seed) => createMovie(seed.title, seed.status));
}

export function formatWatchedDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getShortTitle(title, maxLength = 12) {
  if (title.length <= maxLength) return title;
  return `${title.slice(0, maxLength - 1)}…`;
}

