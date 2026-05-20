"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Star, X } from "lucide-react";
import {
  RATING_CATEGORIES,
  createEmptyRatings,
  isRatingsComplete,
} from "@/helpers/movieHelpers";
import MoviePoster from "./MoviePoster";
import StarRatingRow from "./StarRatingRow";
import styles from "@/styles/components.module.scss";

export default function MarkWatchedModal({ movie, onClose, onConfirm }) {
  const dialogRef = useRef(null);
  const [voteAverage, setVoteAverage] = useState(movie?.voteAverage ?? null);
  const [ratings, setRatings] = useState(createEmptyRatings);

  const allRated = isRatingsComplete(ratings);

  useEffect(() => {
    if (!movie) return undefined;

    setVoteAverage(movie.voteAverage ?? null);
    setRatings(createEmptyRatings());

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [movie, onClose]);

  useEffect(() => {
    if (!movie?.tmdbId || movie.voteAverage != null) return undefined;

    let cancelled = false;
    const controller = new AbortController();

    async function loadTmdbDetails() {
      try {
        const response = await fetch(`/api/tmdb/movie?movieId=${movie.tmdbId}`, {
          signal: controller.signal,
        });
        if (cancelled || !response.ok) return;

        const detailData = await response.json();
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
  }, [movie]);

  if (!movie) return null;

  const handleRatingChange = (key, value) => {
    setRatings((current) => ({ ...current, [key]: value }));
  };

  const handleConfirm = () => {
    if (!allRated) return;
    onConfirm?.(movie.id, ratings);
    onClose();
  };

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`${styles.modalDialog} ${styles.detailModalDialog} ${styles.markWatchedModalDialog}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-watched-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className={styles.detailModalHero}>
          <MoviePoster movie={movie} size="fullWidth" />
          <div className={styles.detailModalHeader}>
            <h2 id="mark-watched-title" className={styles.detailModalTitle}>
              {movie.title}
            </h2>
            <div className={styles.detailModalMeta}>
              {movie.year && (
                <span className={styles.detailModalYear}>{movie.year}</span>
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

        <div className={styles.markWatchedRatings}>
          {RATING_CATEGORIES.map((category) => (
            <StarRatingRow
              key={category.key}
              label={category.label}
              value={ratings[category.key]}
              onChange={(value) => handleRatingChange(category.key, value)}
            />
          ))}
        </div>

        <div className={styles.detailModalActions}>
          <button
            type="button"
            className={`${styles.btnMuted} ${styles.btnIconOnly}`}
            onClick={onClose}
            aria-label="Cancelar"
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleConfirm}
            disabled={!allRated}
          >
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            Marcar como vista
          </button>
        </div>
      </div>
    </div>
  );
}
