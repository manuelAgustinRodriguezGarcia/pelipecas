"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  createMovie,
  createMovieFromTmdb,
  getPendingMovies,
  getWatchedMovies,
  isDuplicateMovie,
  migrateStoredMovies,
  normalizeMovie,
  normalizeRatings,
} from "@/helpers/movieHelpers";

function loadMoviesFromStorage() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const movies = parsed.map(normalizeMovie).filter(Boolean);
    return migrateStoredMovies(movies);
  } catch {
    return [];
  }
}

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [pickedMovie, setPickedMovie] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    setMovies(loadMoviesFromStorage() ?? []);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  }, [movies, isLoaded]);

  const pendingMovies = useMemo(() => getPendingMovies(movies), [movies]);
  const watchedMovies = useMemo(() => getWatchedMovies(movies), [movies]);

  const addMovieFromTmdb = useCallback((tmdbData) => {
    if (!tmdbData?.tmdbId) {
      return { success: false, error: "invalid" };
    }

    let duplicate = false;
    let createdMovie = null;

    setMovies((current) => {
      if (isDuplicateMovie(current, { tmdbId: tmdbData.tmdbId })) {
        duplicate = true;
        return current;
      }
      createdMovie = createMovieFromTmdb(tmdbData, "pending");
      return [createdMovie, ...current];
    });

    if (duplicate) {
      return { success: false, error: "duplicate" };
    }

    return { success: true, movie: createdMovie };
  }, []);

  const addMovieManually = useCallback((title) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return { success: false, error: "empty" };
    }

    let duplicate = false;
    let createdMovie = null;

    setMovies((current) => {
      if (isDuplicateMovie(current, { title: trimmed, tmdbId: null })) {
        duplicate = true;
        return current;
      }
      createdMovie = createMovie(trimmed, "pending");
      return [createdMovie, ...current];
    });

    if (duplicate) {
      return { success: false, error: "duplicate" };
    }

    return { success: true, movie: createdMovie };
  }, []);

  const markAsWatched = useCallback((id, ratings) => {
    const now = new Date().toISOString();
    setMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              status: "watched",
              watchedAt: now,
              ratings: normalizeRatings(ratings),
            }
          : movie
      )
    );
    setPickedMovie((current) => (current?.id === id ? null : current));
  }, []);

  const moveToPending = useCallback((id) => {
    setMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? {
              ...movie,
              status: "pending",
              watchedAt: null,
              ratings: normalizeRatings(null),
            }
          : movie
      )
    );
    setPickedMovie((current) => (current?.id === id ? null : current));
  }, []);

  const deleteMovie = useCallback((id) => {
    setMovies((current) => current.filter((movie) => movie.id !== id));
    setPickedMovie((current) => (current?.id === id ? null : current));
  }, []);

  const pickRandomMovie = useCallback((movieId) => {
    let selected = null;

    setMovies((current) => {
      const pending = getPendingMovies(current);
      if (pending.length === 0) return current;

      if (movieId) {
        selected = pending.find((movie) => movie.id === movieId) ?? null;
      } else {
        const randomIndex = Math.floor(Math.random() * pending.length);
        selected = pending[randomIndex];
      }

      if (!selected) return current;

      return current.map((movie) =>
        movie.id === selected.id
          ? { ...movie, timesPicked: movie.timesPicked + 1 }
          : movie
      );
    });

    if (selected) {
      const picked = normalizeMovie({
        ...selected,
        timesPicked: selected.timesPicked + 1,
      });
      setPickedMovie(picked);
      return picked;
    }

    return null;
  }, []);

  const clearPickedMovie = useCallback(() => {
    setPickedMovie(null);
  }, []);

  const importMoviesFromShare = useCallback((importedMovies) => {
    const normalized = importedMovies.map(normalizeMovie).filter(Boolean);
    let imported = 0;
    let skipped = 0;

    setMovies((current) => {
      let next = [...current];

      for (const movie of normalized) {
        if (isDuplicateMovie(next, { title: movie.title, tmdbId: movie.tmdbId })) {
          skipped += 1;
        } else {
          next = [movie, ...next];
          imported += 1;
        }
      }

      return next;
    });

    return { imported, skipped };
  }, []);

  return {
    movies,
    pendingMovies,
    watchedMovies,
    addMovieFromTmdb,
    addMovieManually,
    markAsWatched,
    moveToPending,
    deleteMovie,
    pickRandomMovie,
    clearPickedMovie,
    importMoviesFromShare,
    pickedMovie,
    isLoaded,
  };
}
