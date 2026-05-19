"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STORAGE_KEY,
  createMovie,
  createMovieFromTmdb,
  getPendingMovies,
  getSeedMovies,
  getWatchedMovies,
  isDuplicateMovie,
  normalizeMovie,
} from "@/helpers/movieHelpers";

function loadMoviesFromStorage() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getSeedMovies().map(normalizeMovie).filter(Boolean);
    }

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getSeedMovies().map(normalizeMovie).filter(Boolean);
    }

    return parsed.map(normalizeMovie).filter(Boolean);
  } catch {
    return getSeedMovies().map(normalizeMovie).filter(Boolean);
  }
}

export function useMovies() {
  const [movies, setMovies] = useState([]);
  const [pickedMovie, setPickedMovie] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loaded = loadMoviesFromStorage();
    setMovies(loaded);
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
    setMovies((current) => {
      if (isDuplicateMovie(current, { tmdbId: tmdbData.tmdbId })) {
        duplicate = true;
        return current;
      }
      return [createMovieFromTmdb(tmdbData, "pending"), ...current];
    });

    if (duplicate) {
      return { success: false, error: "duplicate" };
    }

    return { success: true };
  }, []);

  const addMovieManually = useCallback((title) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return { success: false, error: "empty" };
    }

    let duplicate = false;
    setMovies((current) => {
      if (isDuplicateMovie(current, { title: trimmed, tmdbId: null })) {
        duplicate = true;
        return current;
      }
      return [createMovie(trimmed, "pending"), ...current];
    });

    if (duplicate) {
      return { success: false, error: "duplicate" };
    }

    return { success: true };
  }, []);

  const markAsWatched = useCallback((id) => {
    const now = new Date().toISOString();
    setMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? { ...movie, status: "watched", watchedAt: now }
          : movie
      )
    );
    setPickedMovie((current) => (current?.id === id ? null : current));
  }, []);

  const moveToPending = useCallback((id) => {
    setMovies((current) =>
      current.map((movie) =>
        movie.id === id
          ? { ...movie, status: "pending", watchedAt: null }
          : movie
      )
    );
    setPickedMovie((current) => (current?.id === id ? null : current));
  }, []);

  const deleteMovie = useCallback((id) => {
    setMovies((current) => current.filter((movie) => movie.id !== id));
    setPickedMovie((current) => (current?.id === id ? null : current));
  }, []);

  const pickRandomMovie = useCallback(() => {
    let selected = null;

    setMovies((current) => {
      const pending = getPendingMovies(current);
      if (pending.length === 0) return current;

      const randomIndex = Math.floor(Math.random() * pending.length);
      selected = pending[randomIndex];

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
    pickedMovie,
    isLoaded,
  };
}
