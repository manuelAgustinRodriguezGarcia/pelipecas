"use client";

import { Film } from "lucide-react";
import { useAppUI } from "@/context/AppUIContext";
import { useMoviesContext } from "@/context/MoviesContext";
import MovieList from "@/components/MovieList";
import EmptyState from "@/components/EmptyState";
import StatsCard from "@/components/StatsCard";
import appStyles from "@/styles/app.module.scss";

export default function WatchedPage() {
  const { onSelectMovie, onMoveToPending, onDelete } = useAppUI();
  const { watchedMovies } = useMoviesContext();

  return (
    <section className={appStyles.section} aria-label="Vistas">
      <div className={appStyles.sectionHeader}>
        <h2 className={appStyles.sectionTitle}>Vistas</h2>
        <p className={`bodyText ${appStyles.sectionSubtitle}`}>
          Películas que ya formaron parte de tu colección.
        </p>
      </div>

      <StatsCard count={watchedMovies.length} label="Películas vistas" />

      {watchedMovies.length === 0 ? (
        <EmptyState
          icon={Film}
          title="Todavía no hay películas vistas"
          text="Cuando marques una película como vista, va a aparecer en esta sección."
        />
      ) : (
        <MovieList
          movies={watchedMovies}
          variant="watched"
          onSelect={onSelectMovie}
          onMoveToPending={onMoveToPending}
          onDelete={onDelete}
        />
      )}
    </section>
  );
}
