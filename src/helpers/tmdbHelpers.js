const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const WATCH_PROVIDER_CATEGORIES = ["flatrate", "rent", "buy", "ads", "free"];

export function buildPosterUrl(posterPath, size = "w185") {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function buildLogoUrl(logoPath, size = "w45") {
  if (!logoPath) return null;
  return `${TMDB_IMAGE_BASE}/${size}${logoPath}`;
}

export function extractYear(releaseDate) {
  if (!releaseDate || String(releaseDate).length < 4) return null;
  const parsed = Number.parseInt(String(releaseDate).slice(0, 4), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeTmdbPoster(poster) {
  if (!poster || typeof poster !== "object") return null;
  const path = poster.file_path ?? poster.poster_path ?? null;
  if (!path) return null;
  return {
    filePath: path,
    iso6391: poster.iso_639_1 ?? null,
    voteAverage:
      typeof poster.vote_average === "number" ? poster.vote_average : 0,
  };
}

/**
 * Prefer poster in the movie's original language, then language-neutral, then fallback path.
 */
export function getBestOriginalLanguagePoster(
  posters,
  originalLanguage,
  fallbackPosterPath = null
) {
  const normalized = (Array.isArray(posters) ? posters : [])
    .map(normalizeTmdbPoster)
    .filter(Boolean);

  if (normalized.length === 0) {
    return fallbackPosterPath ?? null;
  }

  const lang = originalLanguage?.toLowerCase?.() ?? null;

  const pickBest = (list) => {
    if (list.length === 0) return null;
    const sorted = [...list].sort(
      (a, b) => (b.voteAverage ?? 0) - (a.voteAverage ?? 0)
    );
    return sorted[0].filePath;
  };

  if (lang) {
    const inOriginal = normalized.filter((p) => p.iso6391 === lang);
    const fromOriginal = pickBest(inOriginal);
    if (fromOriginal) return fromOriginal;
  }

  const neutral = normalized.filter(
    (p) => p.iso6391 == null || p.iso6391 === ""
  );
  const fromNeutral = pickBest(neutral);
  if (fromNeutral) return fromNeutral;

  return fallbackPosterPath ?? pickBest(normalized);
}

export function normalizeArgentinaWatchProviders(watchProvidersPayload) {
  const ar = watchProvidersPayload?.results?.AR;
  if (!ar || typeof ar !== "object") return [];

  const seen = new Set();
  const providers = [];

  for (const category of WATCH_PROVIDER_CATEGORIES) {
    const list = ar[category];
    if (!Array.isArray(list)) continue;

    for (const provider of list) {
      const id = provider?.provider_id;
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      const logoPath = provider.logo_path ?? null;
      providers.push({
        providerId: id,
        providerName: provider.provider_name ?? "Proveedor",
        logoPath,
        logoUrl: buildLogoUrl(logoPath),
      });
    }
  }

  return providers;
}

export function coerceRuntime(runtime) {
  if (typeof runtime !== "number" || !Number.isFinite(runtime) || runtime <= 0) {
    return null;
  }
  return Math.round(runtime);
}

/** Película con producción u origen en Argentina (TMDB). */
export function isArgentineMovie(movie) {
  if (!movie || typeof movie !== "object") return false;

  const originCountry = movie.origin_country ?? movie.originCountry;
  if (Array.isArray(originCountry) && originCountry.includes("AR")) {
    return true;
  }

  const productionCountries =
    movie.production_countries ?? movie.productionCountries;
  if (Array.isArray(productionCountries)) {
    return productionCountries.some((entry) => {
      if (typeof entry === "string") return entry === "AR";
      return entry?.iso_3166_1 === "AR";
    });
  }

  return false;
}

/**
 * Título visible: películas argentinas usan original_title (idioma original);
 * el resto mantiene el título localizado (prioridad es-AR en búsqueda).
 */
export function resolveMovieDisplayTitle(movie, localizedTitle) {
  const originalTitle = (
    movie?.original_title ??
    movie?.originalTitle ??
    ""
  ).trim();
  const localized = (localizedTitle ?? movie?.title ?? "").trim();

  if (isArgentineMovie(movie) && originalTitle) {
    return originalTitle;
  }

  return localized || originalTitle || "Sin título";
}

function resolveSearchTitleWithoutArgentina(arMovie, mxMovie, fallback) {
  if (arMovie) {
    return resolveMovieDisplayTitle(arMovie);
  }

  const originalTitle = fallback?.original_title?.trim() ?? "";
  const mxTitle = mxMovie?.title?.trim() ?? "";

  // Sin ficha es-AR: no mostrar título mexicano si difiere del original (ej. Metegol / Futbolín)
  if (originalTitle && mxTitle && mxTitle !== originalTitle) {
    return originalTitle;
  }

  return fallback?.title?.trim() || originalTitle || "Sin título";
}

export function mapTmdbMovie(movie, options = {}) {
  const originalLanguage = movie.original_language ?? options.originalLanguage ?? null;
  const posters = options.posters ?? movie.images?.posters ?? null;
  const posterPath = getBestOriginalLanguagePoster(
    posters,
    originalLanguage,
    movie.poster_path ?? null
  );

  return {
    tmdbId: movie.id,
    title: resolveMovieDisplayTitle(movie, options.localizedTitle),
    originalTitle: movie.original_title ?? null,
    originalLanguage,
    overview: movie.overview ?? null,
    releaseDate: movie.release_date ?? null,
    year: extractYear(movie.release_date),
    posterPath,
    posterUrl: buildPosterUrl(posterPath),
    voteAverage:
      typeof movie.vote_average === "number" ? movie.vote_average : null,
    runtime: coerceRuntime(movie.runtime),
    watchProviders: options.watchProviders ?? undefined,
  };
}

export function mapTmdbMovieDetails(movie, imagesPayload, watchProvidersPayload) {
  const posters = imagesPayload?.posters ?? [];
  const watchProviders = normalizeArgentinaWatchProviders(watchProvidersPayload);

  return {
    ...mapTmdbMovie(movie, { posters }),
    watchProviders,
  };
}

/**
 * Merge TMDB search results from multiple locales; prefer es-AR display titles.
 */
export function mergeMultiLocaleSearchResults(localeResults) {
  const arMoviesById = new Map();
  const mxMoviesById = new Map();
  const mergedRaw = new Map();

  for (const { locale, results } of localeResults) {
    for (const movie of results) {
      if (!movie?.id) continue;
      if (locale === "es-AR") {
        arMoviesById.set(movie.id, movie);
      }
      if (locale === "es-MX") {
        mxMoviesById.set(movie.id, movie);
      }
      if (!mergedRaw.has(movie.id)) {
        mergedRaw.set(movie.id, movie);
      }
    }
  }

  const merged = [];

  for (const [id, fallback] of mergedRaw) {
    const arMovie = arMoviesById.get(id);
    const mxMovie = mxMoviesById.get(id);
    const source = arMovie ?? fallback;
    const mapped = mapTmdbMovie(source);
    mapped.title = resolveSearchTitleWithoutArgentina(arMovie, mxMovie, fallback);
    merged.push(mapped);
  }

  return merged.slice(0, 10);
}

/**
 * Ajusta títulos de películas argentinas tras obtener production_countries / origin_country.
 */
export async function enrichArgentineMovieTitles(results, fetchMovieById) {
  if (!Array.isArray(results) || results.length === 0 || !fetchMovieById) {
    return results;
  }

  return Promise.all(
    results.map(async (item) => {
      if (!item?.tmdbId) return item;

      try {
        const data = await fetchMovieById(item.tmdbId);
        if (!data || !isArgentineMovie(data)) return item;

        const title =
          data.original_title?.trim() ||
          item.originalTitle?.trim() ||
          item.title;

        return {
          ...item,
          title,
          originalTitle: data.original_title ?? item.originalTitle,
          originalLanguage: data.original_language ?? item.originalLanguage,
        };
      } catch {
        return item;
      }
    })
  );
}
