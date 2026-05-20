"use client";

import { useRouter } from "next/navigation";
import { Armchair, Plus, Ticket } from "lucide-react";
import { useAppUI } from "@/context/AppUIContext";
import { useMoviesContext } from "@/context/MoviesContext";
import AddMovieForm from "@/components/AddMovieForm";
import MovieList from "@/components/MovieList";
import EmptyState from "@/components/EmptyState";
import appStyles from "@/styles/app.module.scss";

export default function PendingPage() {
  const router = useRouter();
  const { onSelectMovie, onOpenMarkWatched, onDelete } = useAppUI();
  const { pendingMovies, addMovieFromTmdb, addMovieManually } = useMoviesContext();

  const focusAddInput = () => {
    router.push("/para-ver");
    window.requestAnimationFrame(() => {
      const input = document.querySelector('[aria-label="Nombre de la película"]');
      input?.focus();
    });
  };

  return (
    <section className={appStyles.section} aria-label="Para ver">
      <div className={appStyles.sectionHeader}>
        <h2 className={appStyles.sectionTitle}>Para ver</h2>
        <p className={`bodyText ${appStyles.sectionSubtitle}`}>
          Anotá las películas que tenés ganas de ver.
        </p>
      </div>

      <AddMovieForm
        onSelectMovie={addMovieFromTmdb}
        onAddManual={addMovieManually}
      />

      {pendingMovies.length > 0 && (
        <div className={appStyles.countRow}>
          <span className={`sectionLabel ${appStyles.countBadge}`}>
            <Ticket size={14} strokeWidth={1.5} aria-hidden="true" />
            {pendingMovies.length}{" "}
            {pendingMovies.length === 1
              ? "película para ver"
              : "películas para ver"}
          </span>
        </div>
      )}

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
          movies={pendingMovies}
          variant="pending"
          onSelect={onSelectMovie}
          onOpenMarkWatched={onOpenMarkWatched}
          onDelete={onDelete}
        />
      )}
    </section>
  );
}
