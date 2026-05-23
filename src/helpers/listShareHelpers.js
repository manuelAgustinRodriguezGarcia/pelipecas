import { normalizeMovie } from "@/helpers/movieHelpers";

export const PELIPECAS_APP_URL = "https://pelipecas.vercel.app/para-ver";

const DATA_MARKER_START = "-----PELISPECAS_DATA-----";
const DATA_MARKER_END = "-----END_PELISPECAS-----";
const EXPORT_VERSION = 1;

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

function serializeMovieForExport(movie) {
  return {
    id: movie.id,
    title: movie.title,
    status: movie.status,
    createdAt: movie.createdAt,
    watchedAt: movie.watchedAt,
    timesPicked: movie.timesPicked,
    tmdbId: movie.tmdbId,
    originalTitle: movie.originalTitle,
    overview: movie.overview,
    releaseDate: movie.releaseDate,
    year: movie.year,
    posterPath: movie.posterPath,
    posterUrl: movie.posterUrl,
    voteAverage: movie.voteAverage,
    originalLanguage: movie.originalLanguage ?? null,
    runtime: movie.runtime ?? null,
    watchProviders: movie.watchProviders,
    ratings: movie.ratings,
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
    pending: pendingMovies.map(serializeMovieForExport),
    watched: watchedMovies.map(serializeMovieForExport),
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

  const pending = Array.isArray(payload.pending) ? payload.pending : [];
  const watched = Array.isArray(payload.watched) ? payload.watched : [];

  const movies = [
    ...pending.map((movie) => normalizeMovie({ ...movie, status: "pending" })),
    ...watched.map((movie) => normalizeMovie({ ...movie, status: "watched" })),
  ].filter(Boolean);

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
