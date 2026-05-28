"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Armchair, Clapperboard, Plus } from "lucide-react";
import { useAppUI } from "@/context/AppUIContext";
import { useMoviesContext } from "@/context/MoviesContext";
import AddMovieForm from "@/components/AddMovieForm";
import MovieSortDropdown from "@/components/MovieSortDropdown";
import MovieList from "@/components/MovieList";
import EmptyState from "@/components/EmptyState";
import {
  DEFAULT_PENDING_SORT,
  sortPendingMovies,
} from "@/helpers/movieSortHelpers";
import appStyles from "@/styles/app.module.scss";

export default function PendingPage() {
  const router = useRouter();
  const { onSelectMovie, onOpenMarkWatched, onDelete } = useAppUI();
  const { pendingMovies, addMovieFromTmdb, addMovieManually, deleteMovie } =
    useMoviesContext();
  const [sortBy, setSortBy] = useState(DEFAULT_PENDING_SORT);

  const sortedPendingMovies = useMemo(
    () => sortPendingMovies(pendingMovies, sortBy),
    [pendingMovies, sortBy]
  );

  const focusAddInput = () => {
    router.push("/para-ver");
    window.requestAnimationFrame(() => {
      const input = document.querySelector('[aria-label="Nombre de la película"]');
      input?.focus();
    });
  };

  return (
    <section className={appStyles.section} aria-label="Para ver">
      <div className={appStyles.pendingStickyBar}>
        <AddMovieForm
          formClassName={appStyles.pendingStickyForm}
          pendingMovies={pendingMovies}
          onSelectMovie={addMovieFromTmdb}
          onViewPendingMovie={onSelectMovie}
          onAddManual={addMovieManually}
          onRemoveFromPending={deleteMovie}
        />

        {pendingMovies.length > 0 && (
          <div className={appStyles.listToolbar}>
            <span className={`sectionLabel ${appStyles.countBadge}`}>
              <Clapperboard size={14} strokeWidth={1.5} aria-hidden="true" />
              {pendingMovies.length}{" "}
              {pendingMovies.length === 1
                ? "película para ver"
                : "películas para ver"}
            </span>
            <MovieSortDropdown
              compact
              value={sortBy}
              onChange={setSortBy}
            />
          </div>
        )}
      </div>

      {pendingMovies.length === 0 ? (
        <EmptyState
          icon={Armchair}
          title="Tu cartelera está vacía"
          text="Agregá una película para empezar tu próxima función."
          ctaLabel="Agregar película"
          ctaIcon={Plus}
          onCtaClick={focusAddInput}
        />
      ) : (
        <MovieList
          movies={sortedPendingMovies}
          variant="pending"
          onSelect={onSelectMovie}
          onOpenMarkWatched={onOpenMarkWatched}
          onDelete={onDelete}
        />
      )}
    </section>
  );
}
