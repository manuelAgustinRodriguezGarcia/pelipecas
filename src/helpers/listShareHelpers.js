import { RATING_CATEGORIES, normalizeMovie } from "@/helpers/movieHelpers";

export const PELIPECAS_APP_URL = "https://pelipecas.vercel.app/para-ver";

const DATA_MARKER_START = "-----PELISPECAS_DATA-----";
const DATA_MARKER_END = "-----END_PELISPECAS-----";
const EXPORT_VERSION = 2;

function toBase64Utf8(text) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(text, "utf-8").toString("base64");
  }
  return btoa(unescape(encodeURIComponent(text)));
}

function fromBase64Utf8(base64) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(base64)));
}

function ratingsToCompactArray(ratings) {
  if (!ratings || typeof ratings !== "object") return null;
  const arr = RATING_CATEGORIES.map((category) => {
    const value = ratings[category.key];
    return typeof value === "number" && value >= 1 && value <= 5 ? value : 0;
  });
  return arr.some((value) => value > 0) ? arr : null;
}

function ratingsFromCompactArray(arr) {
  if (!Array.isArray(arr)) return null;
  const ratings = {};
  RATING_CATEGORIES.forEach((category, index) => {
    const value = arr[index];
    ratings[category.key] =
      typeof value === "number" && value >= 1 && value <= 5 ? value : null;
  });
  return ratings;
}

/**
 * Shape mínimo v2 con claves de 1 letra:
 *   t: tmdbId, T: title, y: year, i: posterPath,
 *   s: 0|1 (pending/watched), w: watchedAt (ISO),
 *   r: [n,n,n,n,n] (orden RATING_CATEGORIES), p: timesPicked
 * Campos opcionales se omiten cuando son neutros.
 */
function serializeMovieForExportV2(movie) {
  const compact = { s: movie.status === "watched" ? 1 : 0 };

  if (movie.tmdbId != null) compact.t = movie.tmdbId;
  if (movie.title) compact.T = movie.title;
  if (movie.year != null) compact.y = movie.year;
  if (movie.posterPath) compact.i = movie.posterPath;
  if (movie.status === "watched" && movie.watchedAt) compact.w = movie.watchedAt;

  const ratingsArr = ratingsToCompactArray(movie.ratings);
  if (ratingsArr) compact.r = ratingsArr;

  if (typeof movie.timesPicked === "number" && movie.timesPicked > 0) {
    compact.p = movie.timesPicked;
  }

  return compact;
}

function deserializeMovieFromExportV2(compact, statusOverride = null) {
  if (!compact || typeof compact !== "object") return null;

  const status =
    statusOverride ?? (compact.s === 1 ? "watched" : "pending");

  return {
    tmdbId: typeof compact.t === "number" ? compact.t : null,
    title: typeof compact.T === "string" ? compact.T : "Sin título",
    year: typeof compact.y === "number" ? compact.y : null,
    posterPath: typeof compact.i === "string" ? compact.i : null,
    status,
    watchedAt:
      status === "watched" && typeof compact.w === "string" ? compact.w : null,
    timesPicked: typeof compact.p === "number" ? compact.p : 0,
    ratings: ratingsFromCompactArray(compact.r),
  };
}

function formatMovieLine(movie, emoji) {
  const yearSuffix = movie.year ? ` (${movie.year})` : "";
  return `${emoji} ${movie.title}${yearSuffix}`;
}

export function buildExportMessage(pendingMovies, watchedMovies) {
  const lines = [
    "🎬 Pelipecas — Mi cartelera 🍿",
    "",
    `📋 Para ver (${pendingMovies.length}):`,
  ];

  if (pendingMovies.length === 0) {
    lines.push("🎭 (sin películas)");
  } else {
    pendingMovies.forEach((movie) => {
      lines.push(formatMovieLine(movie, "🎞️"));
    });
  }

  lines.push("", `✅ Las vimos (${watchedMovies.length}):`);

  if (watchedMovies.length === 0) {
    lines.push("🎭 (sin películas)");
  } else {
    watchedMovies.forEach((movie) => {
      lines.push(formatMovieLine(movie, "⭐"));
    });
  }

  lines.push("", `🔗 ${PELIPECAS_APP_URL}`, "", "Datos para la app:", DATA_MARKER_START);

  const payload = {
    v: EXPORT_VERSION,
    m: [
      ...pendingMovies.map(serializeMovieForExportV2),
      ...watchedMovies.map(serializeMovieForExportV2),
    ],
  };

  lines.push(toBase64Utf8(JSON.stringify(payload)), DATA_MARKER_END);

  return lines.join("\n");
}

export function downloadExportMessage(pendingMovies, watchedMovies) {
  const message = buildExportMessage(pendingMovies, watchedMovies);
  const blob = new Blob([message], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);

  link.href = url;
  link.download = `pelipecas-cartelera-${date}.txt`;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function decodePayload(base64Block) {
  const jsonText = fromBase64Utf8(base64Block.trim());
  const payload = JSON.parse(jsonText);

  if (!payload || typeof payload !== "object") {
    throw new Error("invalid_payload");
  }

  const version = typeof payload.v === "number" ? payload.v : 1;

  let normalizedInput = [];

  if (version >= 2) {
    const items = Array.isArray(payload.m) ? payload.m : [];
    normalizedInput = items.map((item) => deserializeMovieFromExportV2(item));
  } else {
    const pending = Array.isArray(payload.pending) ? payload.pending : [];
    const watched = Array.isArray(payload.watched) ? payload.watched : [];
    normalizedInput = [
      ...pending.map((movie) => ({ ...movie, status: "pending" })),
      ...watched.map((movie) => ({ ...movie, status: "watched" })),
    ];
  }

  const movies = normalizedInput
    .map((movie) => normalizeMovie(movie))
    .filter(Boolean);

  if (movies.length === 0) {
    throw new Error("empty_lists");
  }

  return movies;
}

export function parseImportMessage(text) {
  const trimmed = (text ?? "").trim();
  if (!trimmed) {
    return { success: false, error: "empty" };
  }

  const startIdx = trimmed.indexOf(DATA_MARKER_START);
  const endIdx = trimmed.indexOf(DATA_MARKER_END);

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    return { success: false, error: "no_data_block" };
  }

  const base64Block = trimmed.slice(
    startIdx + DATA_MARKER_START.length,
    endIdx
  );

  try {
    const movies = decodePayload(base64Block);
    return { success: true, movies };
  } catch {
    return { success: false, error: "invalid_data" };
  }
}

export const IMPORT_ERROR_MESSAGES = {
  empty: "Pegá el mensaje completo que exportaste.",
  no_data_block:
    "No encontramos los datos de la app. Copiá el mensaje entero, incluida la sección «Datos para la app».",
  invalid_data:
    "Los datos de importación no son válidos. Verificá que el mensaje no esté recortado.",
};
