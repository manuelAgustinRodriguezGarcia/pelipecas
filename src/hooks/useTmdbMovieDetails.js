"use client";

import { useEffect, useRef, useState } from "react";
import {
  getCachedTmdbDetails,
  mergeTmdbDetailsIntoMovie,
  prefetchTmdbMovieDetails,
  setCachedTmdbDetails,
} from "@/helpers/tmdbDetailsCache";

function readDetailState(movie) {
  const cached = movie?.tmdbId ? getCachedTmdbDetails(movie.tmdbId) : null;
  const merged = cached ? mergeTmdbDetailsIntoMovie(movie, cached) : movie;

  return {
    overview: merged?.overview ?? null,
    voteAverage: merged?.voteAverage ?? null,
    runtime: merged?.runtime ?? null,
    watchProviders: merged?.watchProviders ?? undefined,
  };
}

export function useTmdbMovieDetails(movie, isVisible) {
  const loadedForRef = useRef(null);
  const [overview, setOverview] = useState(() => readDetailState(movie).overview);
  const [voteAverage, setVoteAverage] = useState(
    () => readDetailState(movie).voteAverage
  );
  const [runtime, setRuntime] = useState(() => readDetailState(movie).runtime);
  const [watchProviders, setWatchProviders] = useState(
    () => readDetailState(movie).watchProviders
  );
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  useEffect(() => {
    if (!movie) return;
    const next = readDetailState(movie);
    setOverview(next.overview);
    setVoteAverage(next.voteAverage);
    setRuntime(next.runtime);
    setWatchProviders(next.watchProviders);
    loadedForRef.current = null;
  }, [movie]);

  useEffect(() => {
    if (!isVisible || !movie?.tmdbId) {
      setIsDetailsLoading(false);
      return undefined;
    }

    const needsRuntime = movie.runtime == null && runtime == null;
    const needsProviders = watchProviders === undefined;

    if (!needsRuntime && !needsProviders) {
      setIsDetailsLoading(false);
      loadedForRef.current = movie.id;
      return undefined;
    }

    if (loadedForRef.current === movie.id) {
      return undefined;
    }

    const cached = getCachedTmdbDetails(movie.tmdbId);
    if (cached) {
      if (cached.overview) setOverview((current) => current || cached.overview);
      if (cached.voteAverage != null) setVoteAverage(cached.voteAverage);
      if (cached.runtime != null) setRuntime(cached.runtime);
      setWatchProviders((current) => {
        if (current !== undefined) return current;
        return Array.isArray(cached.watchProviders) ? cached.watchProviders : [];
      });
      loadedForRef.current = movie.id;
      setIsDetailsLoading(false);
      return undefined;
    }

    let cancelled = false;
    setIsDetailsLoading(true);

    async function load() {
      const detail = await prefetchTmdbMovieDetails(movie.tmdbId);
      if (cancelled) return;

      loadedForRef.current = movie.id;
      setIsDetailsLoading(false);

      if (!detail) {
        setWatchProviders((current) =>
          current === undefined ? [] : current
        );
        return;
      }

      setCachedTmdbDetails(movie.tmdbId, detail);

      if (detail.overview) {
        setOverview((current) => current || detail.overview);
      }
      if (detail.voteAverage != null) {
        setVoteAverage(detail.voteAverage);
      }
      if (detail.runtime != null) {
        setRuntime(detail.runtime);
      }
      setWatchProviders((current) => {
        if (current !== undefined) return current;
        return Array.isArray(detail.watchProviders) ? detail.watchProviders : [];
      });
    }

    load();

    return () => {
      cancelled = true;
      setIsDetailsLoading(false);
    };
  }, [isVisible, movie?.id, movie?.tmdbId, movie?.runtime, runtime, watchProviders]);

  const runtimeLoading =
    Boolean(movie?.tmdbId) && runtime == null && isDetailsLoading;
  const watchProvidersLoading =
    Boolean(movie?.tmdbId) && watchProviders === undefined;

  return {
    overview,
    voteAverage,
    runtime,
    watchProviders,
    runtimeLoading,
    watchProvidersLoading,
  };
}
