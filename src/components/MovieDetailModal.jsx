"use client";

import { useEffect, useRef } from "react";
import { CircleCheck, Star, Trash2, X } from "lucide-react";
import {
  formatRuntime,
  getMovieLocalizedTitle,
  getMoviePrimaryTitle,
  isRatingsComplete,
} from "@/helpers/movieHelpers";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import { useTmdbMovieDetails } from "@/hooks/useTmdbMovieDetails";
import CollapsibleSection from "./CollapsibleSection";
import DetailWatchProviders from "./DetailWatchProviders";
import ModalPortal from "./ModalPortal";
import MoviePoster from "./MoviePoster";
import UserRatingPanel from "./UserRatingPanel";
import styles from "@/styles/components.module.scss";

export default function MovieDetailModal({
  movie,
  variant = "pending",
  embedded = false,
  isClosing: isClosingProp = false,
  onClose,
  onOpenMarkWatched,
  onRequestMoveToPending,
  onRequestDeleteFromDetail,
  onDelete,
}) {
  const dialogRef = useRef(null);

  const internalClose = useModalCloseAnimation(Boolean(movie) && !embedded, onClose);
  const isVisible = embedded ? Boolean(movie) : internalClose.isVisible;
  const isClosing = embedded ? isClosingProp : internalClose.isClosing;

  const {
    overview,
    voteAverage,
    runtime,
    watchProviders,
    runtimeLoading,
    watchProvidersLoading,
  } = useTmdbMovieDetails(movie, isVisible);

  const requestClose = (afterClose) => {
    if (embedded) {
      onClose?.(afterClose);
      return;
    }
    internalClose.requestClose(afterClose);
  };

  const displayMovie = movie;
  const showUserRating =
    variant === "watched" && isRatingsComplete(displayMovie?.ratings);

  useEffect(() => {
    if (!isVisible || !displayMovie) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, displayMovie, requestClose]);

  if (!isVisible || !displayMovie) return null;

  const handleMarkWatched = () => {
    onOpenMarkWatched?.(displayMovie.id);
  };

  const handleMoveToPending = () => {
    onRequestMoveToPending?.(displayMovie.id);
  };

  const handleDelete = () => {
    if (variant === "watched") {
      onRequestDeleteFromDetail?.(displayMovie.id);
      return;
    }
    onDelete?.(displayMovie.id);
  };

  const runtimeLabel = formatRuntime(runtime ?? displayMovie.runtime);
  const primaryTitle = getMoviePrimaryTitle(displayMovie);
  const localizedTitle = getMovieLocalizedTitle(displayMovie);

  const dialog = (
    <div
      ref={dialogRef}
      className={`${styles.modalDialog} ${styles.detailModalDialog} ${isClosing ? styles.modalDialogClosing : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="movie-detail-title"
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
          <h2 id="movie-detail-title" className={styles.detailModalTitle}>
            {primaryTitle}
          </h2>
          {localizedTitle && (
            <span className={styles.cardLocalizedTitle}>{localizedTitle}</span>
          )}
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
        {showUserRating && (
          <section className={styles.detailModalSection}>
            <UserRatingPanel ratings={displayMovie.ratings} />
          </section>
        )}

        <CollapsibleSection
          key={`synopsis-${displayMovie.id}-${variant}`}
          title="SINOPSIS"
          defaultOpen={variant === "pending"}
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

      <div className={styles.detailModalActions}>
        <button
          type="button"
          className={`${styles.btnDanger} ${styles.btnIconOnly}`}
          onClick={handleDelete}
          aria-label={`Eliminar ${primaryTitle} de la lista`}
        >
          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
        {variant === "pending" ? (
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleMarkWatched}
          >
            <CircleCheck size={16} strokeWidth={1.5} aria-hidden="true" />
            <span className="sectionLabel">Marcar como vista</span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleMoveToPending}
          >
            Mover a para ver
          </button>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return dialog;
  }

  return (
    <ModalPortal>
      <div
        className={`${styles.modalBackdrop} ${isClosing ? styles.modalBackdropClosing : ""}`}
        onClick={() => requestClose()}
        role="presentation"
      >
        {dialog}
      </div>
    </ModalPortal>
  );
}
