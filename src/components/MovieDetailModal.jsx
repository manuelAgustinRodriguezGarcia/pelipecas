"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Star, Trash2, X } from "lucide-react";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import MoviePoster from "./MoviePoster";
import styles from "@/styles/components.module.scss";

export default function MovieDetailModal({
  movie,
  variant = "pending",
  onClose,
  onOpenMarkWatched,
  onMoveToPending,
  onDelete,
}) {
  const dialogRef = useRef(null);
  const [displayMovie, setDisplayMovie] = useState(movie);
  const [overview, setOverview] = useState(movie?.overview ?? null);
  const [voteAverage, setVoteAverage] = useState(movie?.voteAverage ?? null);

  const { isVisible, isClosing, requestClose } = useModalCloseAnimation(
    Boolean(movie),
    onClose
  );

  useEffect(() => {
    if (!movie) return;
    setDisplayMovie(movie);
    setOverview(movie.overview ?? null);
    setVoteAverage(movie.voteAverage ?? null);
  }, [movie]);

  useEffect(() => {
    if (!isVisible || !displayMovie) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, displayMovie, requestClose]);

  useEffect(() => {
    if (!displayMovie?.tmdbId) return undefined;
    if (displayMovie.overview && displayMovie.voteAverage != null) return undefined;

    let cancelled = false;
    const controller = new AbortController();

    async function loadTmdbDetails() {
      try {
        const response = await fetch(
          `/api/tmdb/movie?movieId=${displayMovie.tmdbId}`,
          { signal: controller.signal }
        );
        if (cancelled || !response.ok) return;

        const detailData = await response.json();
        if (detailData.movie?.overview) {
          setOverview(detailData.movie.overview);
        }
        if (detailData.movie?.voteAverage != null) {
          setVoteAverage(detailData.movie.voteAverage);
        }
      } catch {
        // Keep local data on fetch failure
      }
    }

    loadTmdbDetails();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [displayMovie]);

  if (!isVisible || !displayMovie) return null;

  const handleMarkWatched = () => {
    const id = displayMovie.id;
    requestClose(() => onOpenMarkWatched?.(id));
  };

  const handleMoveToPending = () => {
    const id = displayMovie.id;
    requestClose(() => onMoveToPending?.(id));
  };

  const handleDelete = () => {
    const id = displayMovie.id;
    requestClose(() => onDelete?.(id));
  };

  return (
    <div
      className={`${styles.modalBackdrop} ${isClosing ? styles.modalBackdropClosing : ""}`}
      onClick={() => requestClose()}
      role="presentation"
    >
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
            </div>
          </div>
        </div>

        <div className={styles.detailModalBody}>
          <section className={styles.detailModalSection}>
            <h3 className={styles.detailSectionTitle}>Sinopsis</h3>
            <p className={styles.detailOverview}>
              {overview || "Sin descripción disponible."}
            </p>
          </section>
        </div>

        <div className={styles.detailModalActions}>
          <button
            type="button"
            className={`${styles.btnDanger} ${styles.btnIconOnly}`}
            onClick={handleDelete}
            aria-label={`Eliminar ${displayMovie.title} de la lista`}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          {variant === "pending" ? (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleMarkWatched}
            >
              <Check size={16} strokeWidth={2.5} aria-hidden="true" />
              Marcar como vista
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
    </div>
  );
}
