"use client";

import { useCallback, useRef, useState } from "react";
import { fetchTmdbMovieDetails } from "@/helpers/fetchTmdbMovieDetails";
import { useTmdbSearch } from "@/hooks/useTmdbSearch";
import MovieSearchResults from "./MovieSearchResults";
import styles from "@/styles/components.module.scss";

const DUPLICATE_MESSAGE = "Esta película ya está en tu lista.";

export default function AddMovieForm({ onSelectMovie, onAddManual, sortControl = null }) {
  const [validationError, setValidationError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef(null);
  const {
    query,
    setQuery,
    results,
    isSearching,
    error: searchError,
    clearSearch,
  } = useTmdbSearch();

  const handleClear = useCallback(() => {
    setValidationError("");
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  const handleSelect = useCallback(
    async (tmdbMovie) => {
      if (isAdding) return;

      setValidationError("");
      setIsAdding(true);

      try {
        let movieData = tmdbMovie;

        if (tmdbMovie?.tmdbId) {
          const enriched = await fetchTmdbMovieDetails(tmdbMovie.tmdbId);
          if (enriched) {
            movieData = { ...tmdbMovie, ...enriched };
          }
        }

        const result = onSelectMovie(movieData);

        if (!result.success) {
          setValidationError(
            result.error === "duplicate"
              ? DUPLICATE_MESSAGE
              : "No se pudo agregar la película."
          );
          return;
        }

        handleClear();
      } finally {
        setIsAdding(false);
      }
    },
    [onSelectMovie, handleClear, isAdding]
  );

  const handleManualAdd = useCallback(
    (title) => {
      const result = onAddManual(title);

      if (!result.success) {
        setValidationError(
          result.error === "duplicate"
            ? DUPLICATE_MESSAGE
            : result.error === "empty"
              ? "Escribí el nombre de una película."
              : "No se pudo agregar la película."
        );
        return;
      }

      handleClear();
    },
    [onAddManual, handleClear]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (results.length > 0 && !isSearching && !isAdding) {
      await handleSelect(results[0]);
      return;
    }

    if (query.trim().length >= 2 && results.length === 0 && !isSearching && !searchError) {
      setValidationError("Seleccioná una película de la lista o usá agregar manualmente.");
      return;
    }

    handleManualAdd(query);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      handleClear();
    }
  };

  return (
    <form
      className={styles.addForm}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className={styles.searchField}>
        <div
          className={`${styles.formRow} ${sortControl ? styles.formRowWithSort : ""}`}
        >
          <div className={styles.inputWrap}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Agregar una película"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                if (validationError) setValidationError("");
              }}
              onKeyDown={handleKeyDown}
              aria-label="Nombre de la película"
              aria-invalid={validationError ? "true" : "false"}
              aria-describedby={
                validationError ? "add-movie-error" : undefined
              }
              aria-expanded={query.trim().length >= 2}
              aria-controls="movie-search-results"
              autoComplete="off"
              disabled={isAdding}
            />
            <MovieSearchResults
              id="movie-search-results"
              results={results}
              isSearching={isSearching}
              error={searchError}
              query={query}
              onSelect={handleSelect}
              onAddManual={handleManualAdd}
            />
          </div>
          {sortControl}
        </div>
      </div>

      {validationError && (
        <p id="add-movie-error" className={styles.validationMessage} role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}


