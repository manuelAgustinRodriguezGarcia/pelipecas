"use client";

import { useCallback, useRef, useState } from "react";
import { fetchTmdbMovieDetails } from "@/helpers/fetchTmdbMovieDetails";
import {
  findPendingMovieMatch,
  isDuplicateMovie,
} from "@/helpers/movieHelpers";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useTmdbSearch } from "@/hooks/useTmdbSearch";
import MovieSearchResults from "./MovieSearchResults";
import RemoveFromPendingConfirmModal from "./RemoveFromPendingConfirmModal";
import styles from "@/styles/components.module.scss";

const DUPLICATE_MESSAGE = "Esta película ya está en tu lista.";

export default function AddMovieForm({
  formClassName = "",
  pendingMovies = [],
  onSelectMovie,
  onViewPendingMovie,
  onAddManual,
  onRemoveFromPending,
  sortControl = null,
}) {
  const [validationError, setValidationError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const inputRef = useRef(null);
  const {
    query,
    setQuery,
    results,
    isSearching,
    error: searchError,
    clearSearch,
  } = useTmdbSearch();

  useLockBodyScroll(Boolean(removeTarget));

  const handleClear = useCallback(() => {
    setValidationError("");
    clearSearch();
    inputRef.current?.focus();
  }, [clearSearch]);

  const handleConfirmRemove = useCallback(() => {
    if (!removeTarget) return;
    onRemoveFromPending?.(removeTarget.id);
    setRemoveTarget(null);
    handleClear();
  }, [removeTarget, onRemoveFromPending, handleClear]);

  const findExistingPending = useCallback(
    (tmdbMovie) =>
      findPendingMovieMatch(pendingMovies, {
        title: tmdbMovie.title,
        tmdbId: tmdbMovie.tmdbId,
      }),
    [pendingMovies]
  );

  const handleViewInList = useCallback(
    (tmdbMovie) => {
      const existing = findExistingPending(tmdbMovie);
      if (!existing) return;

      setValidationError("");
      handleClear();
      onViewPendingMovie?.(existing);
    },
    [findExistingPending, handleClear, onViewPendingMovie]
  );

  const handleRemoveInList = useCallback(
    (tmdbMovie) => {
      const existing = findExistingPending(tmdbMovie);
      if (!existing) return;

      setValidationError("");
      setRemoveTarget({ id: existing.id, title: existing.title });
    },
    [findExistingPending]
  );

  const handleSelect = useCallback(
    async (tmdbMovie) => {
      if (isAdding) return;

      if (findExistingPending(tmdbMovie)) {
        handleViewInList(tmdbMovie);
        return;
      }

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
    [findExistingPending, handleViewInList, onSelectMovie, handleClear, isAdding]
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

  const isInPendingList = useCallback(
    (movie) =>
      isDuplicateMovie(pendingMovies, {
        title: movie.title,
        tmdbId: movie.tmdbId,
      }),
    [pendingMovies]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (results.length > 0 && !isSearching && !isAdding) {
      const first = results[0];
      if (isInPendingList(first)) {
        handleViewInList(first);
      } else {
        await handleSelect(first);
      }
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
      className={`${styles.addForm} ${formClassName}`.trim()}
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
              type="search"
              name="pelipecas-movie-search"
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
              autoCorrect="off"
              autoCapitalize="sentences"
              spellCheck={false}
              inputMode="search"
              enterKeyHint="search"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              disabled={isAdding}
            />
            <MovieSearchResults
              id="movie-search-results"
              results={results}
              isSearching={isSearching}
              error={searchError}
              query={query}
              isInPendingList={isInPendingList}
              onSelect={handleSelect}
              onViewInList={handleViewInList}
              onRemoveInList={handleRemoveInList}
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

      <RemoveFromPendingConfirmModal
        movie={removeTarget}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleConfirmRemove}
      />
    </form>
  );
}


