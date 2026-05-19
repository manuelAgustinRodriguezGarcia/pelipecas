"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

export function useTmdbSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const clearSearch = useCallback(() => {
    abortRef.current?.abort();
    setQuery("");
    setResults([]);
    setError(null);
    setIsSearching(false);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      setResults([]);
      setError(null);
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/tmdb/search?query=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        if (controller.signal.aborted) return;

        const data = await response.json();

        if (!response.ok) {
          setResults([]);
          setError(
            data.error || "No pudimos buscar películas en este momento."
          );
          return;
        }

        setResults(data.results ?? []);
        setError(null);
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setResults([]);
        setError("No pudimos buscar películas en este momento.");
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
  };
}
