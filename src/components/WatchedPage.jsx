"use client";

import { useMemo, useState } from "react";
import { CircleCheck, Film } from "lucide-react";
import { useAppUI } from "@/context/AppUIContext";
import { useMoviesContext } from "@/context/MoviesContext";
import MovieList from "@/components/MovieList";
import MovieSortDropdown, { MOVIE_SORT_ICONS } from "@/components/MovieSortDropdown";
import EmptyState from "@/components/EmptyState";
import {
  DEFAULT_WATCHED_SORT,
  WATCHED_SORT_OPTIONS,
  getWatchedSortOption,
  sortWatchedMovies,
} from "@/helpers/movieSortHelpers";
import appStyles from "@/styles/app.module.scss";

export default function WatchedPage() {
  const { onSelectMovie, onMoveToPending, onDelete } = useAppUI();
  const { watchedMovies } = useMoviesContext();
  const [sortBy, setSortBy] = useState(DEFAULT_WATCHED_SORT);

  const sortedWatchedMovies = useMemo(
    () => sortWatchedMovies(watchedMovies, sortBy),
    [watchedMovies, sortBy]
  );

  return (
    <section className={appStyles.section} aria-label="Las vimos">
      <div className={appStyles.sectionHeader}>
        <h2 className={appStyles.sectionTitle}>Las vimos</h2>
        <p className={`bodyText ${appStyles.sectionSubtitle}`}>
          Películas que ya vimos con sus calificaciones.
        </p>
      </div>

      {watchedMovies.length > 0 && (
        <div className={appStyles.listToolbar}>
          <span className={`sectionLabel ${appStyles.countBadge}`}>
            <CircleCheck size={14} strokeWidth={1.5} aria-hidden="true" />
            {watchedMovies.length}{" "}
            {watchedMovies.length === 1 ? "película vista" : "películas vistas"}
          </span>
          <MovieSortDropdown
            compact
            value={sortBy}
            onChange={setSortBy}
            options={WATCHED_SORT_OPTIONS}
            sortIcons={MOVIE_SORT_ICONS}
            getOption={getWatchedSortOption}
          />
        </div>
      )}

      {watchedMovies.length === 0 ? (
        <EmptyState
          icon={Film}
          title="Todavía no hay películas vistas"
          text="Cuando marques una película como vista, va a aparecer en esta sección."
        />
      ) : (
        <MovieList
          movies={sortedWatchedMovies}
          variant="watched"
          onSelect={onSelectMovie}
          onMoveToPending={onMoveToPending}
          onDelete={onDelete}
        />
      )}
    </section>
  );
}
