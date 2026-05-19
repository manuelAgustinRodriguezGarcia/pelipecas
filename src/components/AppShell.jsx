"use client";

import { useCallback, useState } from "react";
import {
  Armchair,
  Clapperboard,
  Disc3,
  Film,
  Plus,
  Ticket,
} from "lucide-react";
import { useMovies } from "@/hooks/useMovies";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import AddMovieForm from "@/components/AddMovieForm";
import MovieList from "@/components/MovieList";
import EmptyState from "@/components/EmptyState";
import StatsCard from "@/components/StatsCard";
import RouletteWheel, { useRouletteSpin } from "@/components/RouletteWheel";
import RouletteResult from "@/components/RouletteResult";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import appStyles from "@/styles/app.module.scss";
import styles from "@/styles/components.module.scss";

export default function AppShell() {
  const [activeTab, setActiveTab] = useState("pending");
  const [showResult, setShowResult] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const {
    movies,
    pendingMovies,
    watchedMovies,
    addMovieFromTmdb,
    addMovieManually,
    markAsWatched,
    moveToPending,
    deleteMovie,
    pickRandomMovie,
    clearPickedMovie,
    pickedMovie,
    isLoaded,
  } = useMovies();

  const handleSpinComplete = useCallback(() => {
    pickRandomMovie();
    setShowResult(true);
  }, [pickRandomMovie]);

  const { isSpinning, rotation, spin } = useRouletteSpin(
    pendingMovies,
    handleSpinComplete
  );

  const handleSpin = () => {
    if (pendingMovies.length === 0) return;
    setShowResult(false);
    clearPickedMovie();
    spin();
  };

  const handleSpinAgain = () => {
    setShowResult(false);
    clearPickedMovie();
    handleSpin();
  };

  const handleMarkWatchedFromRoulette = (id) => {
    markAsWatched(id);
    setShowResult(false);
    clearPickedMovie();
  };

  const focusAddInput = () => {
    setActiveTab("pending");
    window.requestAnimationFrame(() => {
      const input = document.querySelector('[aria-label="Nombre de la película"]');
      input?.focus();
    });
  };

  const handleDeleteRequest = useCallback(
    (id) => {
      const movie = movies.find((item) => item.id === id);
      if (movie) {
        setDeleteTarget({ id: movie.id, title: movie.title });
      }
    },
    [movies]
  );

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMovie(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMovie]);

  if (!isLoaded) {
    return (
      <div className={appStyles.desktopBackdrop}>
        <div className={appStyles.appShell}>
          <div className={styles.loadingShell}>Cargando tu carteleraâ€¦</div>
        </div>
      </div>
    );
  }

  return (
    <div className={appStyles.desktopBackdrop}>
      <div className={appStyles.appShell}>
        <Header />
        <main className={appStyles.main}>
          {activeTab === "pending" && (
            <section className={appStyles.section} aria-label="Para ver">
              <div className={appStyles.sectionHeader}>
                <h2 className={appStyles.sectionTitle}>Para ver</h2>
                <p className={`bodyText ${appStyles.sectionSubtitle}`}>
                  Películas pendientes para tu próxima función.
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
                    {pendingMovies.length === 1 ? "película" : "películas"} en cola
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
                  onMarkWatched={markAsWatched}
                  onDelete={handleDeleteRequest}
                />
              )}
            </section>
          )}

          {activeTab === "watched" && (
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
                  onMoveToPending={moveToPending}
                  onDelete={handleDeleteRequest}
                />
              )}
            </section>
          )}

          {activeTab === "roulette" && (
            <section
              className={`${appStyles.section} ${styles.rouletteSection}`}
              aria-label="Ruleta"
            >
              <div className={appStyles.sectionHeader}>
                <h2 className={appStyles.sectionTitle}>Ruleta</h2>
                <p className={`bodyText ${appStyles.sectionSubtitle}`}>
                  Dejá que Pelipecas elija la próxima función.
                </p>
              </div>

              {pendingMovies.length === 0 ? (
                <EmptyState
                  icon={Clapperboard}
                  title="No hay películas para sortear"
                  text="Agregá películas a tu cartelera para usar la ruleta."
                  ctaLabel="Agregar película"
                  ctaIcon={Plus}
                  onCtaClick={focusAddInput}
                />
              ) : (
                <>
                  <RouletteWheel
                    pendingMovies={pendingMovies}
                    isSpinning={isSpinning}
                    rotation={rotation}
                  />

                  <button
                    type="button"
                    className={styles.spinButton}
                    onClick={handleSpin}
                    disabled={isSpinning}
                  >
                    <Disc3 size={18} strokeWidth={1.75} aria-hidden="true" />
                    {isSpinning ? "Seleccionando…" : "Sortear película"}
                  </button>

                  {isSpinning && (
                    <p className={styles.spinningText}>Seleccionando película…</p>
                  )}

                  {showResult && pickedMovie && !isSpinning && (
                    <RouletteResult
                      movie={pickedMovie}
                      onMarkWatched={handleMarkWatchedFromRoulette}
                      onSpinAgain={handleSpinAgain}
                    />
                  )}
                </>
              )}
            </section>
          )}
        </main>

        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        <DeleteConfirmModal
          movie={deleteTarget}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}


