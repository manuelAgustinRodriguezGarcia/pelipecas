import {
  buildLogoUrl,
  buildPosterUrl,
  extractYear,
} from "@/helpers/tmdbHelpers";

export const STORAGE_KEY = "pelipecas_movies";
export const LEGACY_SEED_MIGRATION_KEY = "pelipecas_seed_removed_v1";

/** Películas de ejemplo del MVP inicial; se eliminan en la migración. */
const LEGACY_SEED_TITLES = [
  "Interestelar",
  "La La Land",
  "Spider-Man: Sin Camino a Casa",
  "Parásitos",
  "El Padrino",
  "El Señor de los Anillos",
  "Joker",
  "El Viaje de Chihiro",
];

const POSTER_VARIANTS = [
  "posterNoir",
  "posterCharcoal",
  "posterGoldFrame",
  "posterMuted",
  "posterDeep",
  "posterElegant",
];

const TMDB_DEFAULTS = {
  tmdbId: null,
  originalTitle: null,
  originalLanguage: null,
  overview: null,
  releaseDate: null,
  year: null,
  posterPath: null,
  posterUrl: null,
  voteAverage: null,
  runtime: null,
  watchProviders: undefined,
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
    if (typeof value === "number" && value >= 1 && value <= 5) {
      empty[category.key] = value;
    }
  }

  return empty;
}

export function isRatingsComplete(ratings) {
  return RATING_CATEGORIES.every((category) => {
    const value = ratings?.[category.key];
    return typeof value === "number" && value >= 1 && value <= 5;
  });
}

export function getUserAverageRating(ratings) {
  if (!isRatingsComplete(ratings)) return null;

  const sum = RATING_CATEGORIES.reduce(
    (total, category) => total + ratings[category.key],
    0
  );

  return sum / RATING_CATEGORIES.length;
}

export function getDisplayStarRating(average) {
  if (average == null) return 0;
  return Math.round(average * 2) / 2;
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

/** Año de estreno (publicación TMDB), no fecha de alta en la lista. */
export function coerceMovieYear(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.slice(0, 4), 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatRuntime(runtime) {
  if (runtime == null) return null;
  const minutes = Math.round(Number(runtime));
  if (!Number.isFinite(minutes) || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function normalizeWatchProviders(watchProviders) {
  if (!Array.isArray(watchProviders)) return undefined;
  return watchProviders
    .map((provider) => {
      if (!provider || typeof provider !== "object") return null;
      const providerId = provider.providerId ?? provider.provider_id;
      if (providerId == null) return null;
      const logoPath = provider.logoPath ?? provider.logo_path ?? null;
      return {
        providerId,
        providerName:
          provider.providerName ?? provider.provider_name ?? "Proveedor",
        logoPath,
        logoUrl: provider.logoUrl ?? buildLogoUrl(logoPath),
      };
    })
    .filter(Boolean);
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
    originalLanguage: movie.originalLanguage ?? null,
    overview: movie.overview ?? null,
    releaseDate,
    year: coerceMovieYear(movie.year) ?? extractYear(releaseDate),
    posterPath,
    posterUrl: movie.posterUrl ?? buildPosterUrl(posterPath),
    voteAverage: movie.voteAverage ?? null,
    runtime:
      typeof movie.runtime === "number" && movie.runtime > 0
        ? Math.round(movie.runtime)
        : null,
    watchProviders: normalizeWatchProviders(movie.watchProviders),
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
    originalLanguage: tmdbData.originalLanguage ?? null,
    overview: tmdbData.overview,
    releaseDate: tmdbData.releaseDate,
    year: tmdbData.year,
    posterPath: tmdbData.posterPath,
    posterUrl: tmdbData.posterUrl,
    voteAverage: tmdbData.voteAverage,
    runtime: tmdbData.runtime ?? null,
    watchProviders: tmdbData.watchProviders,
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

export function findPendingMovieMatch(pendingMovies, { title, tmdbId }) {
  if (!Array.isArray(pendingMovies) || pendingMovies.length === 0) {
    return null;
  }

  if (tmdbId != null) {
    const byId = pendingMovies.find((movie) => movie.tmdbId === tmdbId);
    if (byId) return byId;
  }

  const normalized = normalizeTitle(title ?? "");
  if (!normalized) return null;

  return (
    pendingMovies.find((movie) => normalizeTitle(movie.title) === normalized) ??
    null
  );
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

const legacySeedTitleSet = new Set(
  LEGACY_SEED_TITLES.map((title) => normalizeTitle(title))
);

/** Quita películas mock del seed original (sin datos TMDB). */
export function removeLegacySeedMovies(movies) {
  return movies.filter((movie) => {
    if (movie.tmdbId != null) return true;
    return !legacySeedTitleSet.has(normalizeTitle(movie.title));
  });
}

export function migrateStoredMovies(rawMovies) {
  if (typeof window === "undefined") return rawMovies;

  if (window.localStorage.getItem(LEGACY_SEED_MIGRATION_KEY) === "1") {
    return rawMovies;
  }

  const cleaned = removeLegacySeedMovies(rawMovies);
  window.localStorage.setItem(LEGACY_SEED_MIGRATION_KEY, "1");
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));

  return cleaned;
}

export function getRouletteSegments(pendingMovies, maxVisible = 8) {
  if (pendingMovies.length === 0) return [];
  if (pendingMovies.length <= maxVisible) return pendingMovies;

  const step = pendingMovies.length / maxVisible;
  const segments = [];

  for (let i = 0; i < maxVisible; i += 1) {
    const index = Math.floor(i * step);
    segments.push(pendingMovies[index]);
  }

  return segments;
}

