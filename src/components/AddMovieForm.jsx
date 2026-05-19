"use client";

import { Plus } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useTmdbSearch } from "@/hooks/useTmdbSearch";
import MovieSearchResults from "./MovieSearchResults";
import styles from "@/styles/components.module.scss";

const DUPLICATE_MESSAGE = "Esta película ya está en tu lista.";

export default function AddMovieForm({ onSelectMovie, onAddManual }) {
  const [validationError, setValidationError] = useState("");
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
    (tmdbMovie) => {
      const result = onSelectMovie(tmdbMovie);

      if (!result.success) {
        setValidationError(
          result.error === "duplicate"
            ? DUPLICATE_MESSAGE
            : "No se pudo agregar la película."
        );
        return;
      }

      handleClear();
    },
    [onSelectMovie, handleClear]
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (results.length > 0 && !isSearching) {
      handleSelect(results[0]);
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
        <div className={styles.formRow}>
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
            />
          </div>
          <button
            type="submit"
            className={styles.addButton}
            aria-label="Agregar película"
          >
            <Plus className={styles.iconSm} strokeWidth={2.5} aria-hidden="true" />
            <span>Agregar</span>
          </button>
        </div>

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

      {validationError && (
        <p id="add-movie-error" className={styles.validationMessage} role="alert">
          {validationError}
        </p>
      )}
    </form>
  );
}


