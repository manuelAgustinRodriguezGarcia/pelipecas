import { coerceMovieYear, getUserAverageRating } from "@/helpers/movieHelpers";

export const PENDING_SORT_OPTIONS = [
  { value: "year-asc", label: "Año: más antiguas" },
  { value: "year-desc", label: "Año: más recientes" },
  { value: "title-asc", label: "A - Z" },
  { value: "title-desc", label: "Z - A" },
];

export const WATCHED_SORT_OPTIONS = [
  ...PENDING_SORT_OPTIONS,
  { value: "rating-desc", label: "Calificación: más alta" },
  { value: "rating-asc", label: "Calificación: más baja" },
];

export const DEFAULT_PENDING_SORT = "year-desc";
export const DEFAULT_WATCHED_SORT = "year-desc";

function compareTitle(a, b) {
  return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
}

function getSortYear(movie) {
  return coerceMovieYear(movie.year) ?? coerceMovieYear(movie.releaseDate);
}

function getSortRating(movie) {
  return getUserAverageRating(movie.ratings);
}

function compareByYear(list, direction) {
  return list.sort((a, b) => {
    const yearA =
      getSortYear(a) ?? (direction === "asc" ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER);
    const yearB =
      getSortYear(b) ?? (direction === "asc" ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER);
    if (yearA !== yearB) return direction === "asc" ? yearA - yearB : yearB - yearA;
    return compareTitle(a, b);
  });
}

function compareByRating(list, direction) {
  return list.sort((a, b) => {
    const ratingA = getSortRating(a);
    const ratingB = getSortRating(b);

    if (ratingA == null && ratingB == null) return compareTitle(a, b);
    if (ratingA == null) return 1;
    if (ratingB == null) return -1;
    if (ratingA !== ratingB) {
      return direction === "asc" ? ratingA - ratingB : ratingB - ratingA;
    }
    return compareTitle(a, b);
  });
}

function sortMovies(movies, sortBy) {
  const list = [...movies];

  switch (sortBy) {
    case "year-asc":
      return compareByYear(list, "asc");
    case "year-desc":
      return compareByYear(list, "desc");
    case "title-asc":
      return list.sort(compareTitle);
    case "title-desc":
      return list.sort((a, b) => compareTitle(b, a));
    case "rating-asc":
      return compareByRating(list, "asc");
    case "rating-desc":
      return compareByRating(list, "desc");
    default:
      return list;
  }
}

export function sortPendingMovies(movies, sortBy) {
  return sortMovies(movies, sortBy);
}

export function sortWatchedMovies(movies, sortBy) {
  return sortMovies(movies, sortBy);
}

export function getSortOption(options, sortBy, defaultSort) {
  return (
    options.find((option) => option.value === sortBy) ??
    options.find((option) => option.value === defaultSort)
  );
}

export function getPendingSortOption(sortBy) {
  return getSortOption(PENDING_SORT_OPTIONS, sortBy, DEFAULT_PENDING_SORT);
}

export function getWatchedSortOption(sortBy) {
  return getSortOption(WATCHED_SORT_OPTIONS, sortBy, DEFAULT_WATCHED_SORT);
}
