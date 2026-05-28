import { Loader2 } from "lucide-react";
import MovieSearchResultItem from "./MovieSearchResultItem";
import styles from "@/styles/components.module.scss";

export default function MovieSearchResults({
  id,
  results,
  isSearching,
  error,
  query,
  isInPendingList,
  onSelect,
  onViewInList,
  onRemoveInList,
  onAddManual,
}) {
  const trimmed = query.trim();
  const hasMinQuery = trimmed.length >= 2;

  if (!hasMinQuery) return null;

  return (
    <div
      id={id}
      className={styles.searchResults}
      role="listbox"
      aria-label="Resultados de búsqueda"
    >
      {isSearching && (
        <div className={styles.searchStatus} role="status">
          <Loader2 className={styles.searchSpinner} size={16} strokeWidth={1.75} />
          <span>Buscando películas…</span>
        </div>
      )}

      {!isSearching && error && (
        <div className={styles.searchStatus}>
          <p className={styles.searchError}>{error}</p>
          {trimmed.length >= 2 && (
            <button
              type="button"
              className={styles.searchManualLink}
              onClick={() => onAddManual(trimmed)}
            >
              Agregar manualmente
            </button>
          )}
        </div>
      )}

      {!isSearching && !error && results.length === 0 && (
        <div className={styles.searchStatus}>
          <p className={styles.searchEmpty}>No encontramos coincidencias.</p>
          <button
            type="button"
            className={styles.searchManualLink}
            onClick={() => onAddManual(trimmed)}
          >
            Agregar manualmente
          </button>
        </div>
      )}

      {!isSearching &&
        !error &&
        results.map((movie) => (
          <MovieSearchResultItem
            key={movie.tmdbId}
            movie={movie}
            isInPendingList={isInPendingList?.(movie) ?? false}
            onSelect={onSelect}
            onViewInList={onViewInList}
            onRemoveInList={onRemoveInList}
          />
        ))}
    </div>
  );
}
