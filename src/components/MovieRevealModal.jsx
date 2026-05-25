"use client";

import { useEffect, useRef } from "react";
import { CircleCheck, Star, X } from "lucide-react";
import { formatRuntime } from "@/helpers/movieHelpers";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import { useTmdbMovieDetails } from "@/hooks/useTmdbMovieDetails";
import CollapsibleSection from "./CollapsibleSection";
import DetailWatchProviders from "./DetailWatchProviders";
import ModalPortal from "./ModalPortal";
import MoviePoster from "./MoviePoster";
import styles from "@/styles/components.module.scss";

export default function MovieRevealModal({
  movie,
  isOpen,
  onClose,
  onOpenMarkWatched,
  onPickAgain,
}) {
  const dialogRef = useRef(null);

  const { isVisible, isClosing, requestClose } = useModalCloseAnimation(
    isOpen,
    onClose
  );

  useLockBodyScroll(isVisible);

  const {
    overview,
    voteAverage,
    runtime,
    watchProviders,
    runtimeLoading,
    watchProvidersLoading,
  } = useTmdbMovieDetails(movie, isVisible);

  useEffect(() => {
    if (!isVisible || !movie) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, movie, requestClose]);

  if (!isVisible || !movie) return null;

  const displayMovie = movie;

  const handleMarkWatched = () => {
    requestClose(() => onOpenMarkWatched?.(displayMovie.id));
  };

  const handlePickAgain = () => {
    onPickAgain?.();
    requestClose();
  };

  const runtimeLabel = formatRuntime(runtime ?? displayMovie.runtime);

  return (
    <ModalPortal>
    <div
      className={`${styles.modalBackdrop} ${styles.modalBackdropHost} ${isClosing ? styles.modalBackdropClosing : ""}`}
      onClick={() => requestClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`${styles.modalDialog} ${styles.detailModalDialog} ${isClosing ? styles.modalDialogClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="movie-reveal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={() => requestClose()}
          aria-label="Cerrar"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className={styles.detailModalHero}>
          <MoviePoster movie={displayMovie} size="fullWidth" />
          <div className={styles.detailModalHeader}>
            <p className={styles.revealSelectionLabel}>Selección</p>
            <h2 id="movie-reveal-title" className={styles.detailModalTitle}>
              {displayMovie.title}
            </h2>
            <div className={styles.detailModalMeta}>
              {displayMovie.year && (
                <span className={styles.detailModalYear}>{displayMovie.year}</span>
              )}
              {voteAverage != null && (
                <span className={styles.detailModalRating}>
                  <Star size={14} strokeWidth={2} aria-hidden="true" />
                  TMDB {voteAverage.toFixed(1)}
                </span>
              )}
              {runtimeLoading ? (
                <span
                  className={styles.detailModalRuntimeShimmer}
                  aria-hidden="true"
                />
              ) : (
                runtimeLabel && (
                  <span className={styles.detailModalRuntime}>{runtimeLabel}</span>
                )
              )}
            </div>
          </div>
        </div>

        <div className={styles.detailModalBody}>
          <CollapsibleSection
            key={`synopsis-reveal-${displayMovie.id}`}
            title="SINOPSIS"
            defaultOpen
          >
            <p className={styles.detailOverview}>
              {overview || "Sin descripción disponible."}
            </p>
          </CollapsibleSection>

          {displayMovie.tmdbId && (
            <DetailWatchProviders
              providers={watchProviders}
              isLoading={watchProvidersLoading}
            />
          )}
        </div>

        <div
          className={`${styles.detailModalActions} ${styles.detailModalActionsReveal}`}
        >
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handlePickAgain}
          >
            Elegir otra
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleMarkWatched}
          >
            <CircleCheck size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="sectionLabel">Marcar como vista</span>
          </button>
        </div>
      </div>
    </div>
    </ModalPortal>
  );
}
