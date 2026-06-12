"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMovieLocalizedTitle,
  getMoviePrimaryTitle,
} from "@/helpers/movieHelpers";
import MoviePoster from "./MoviePoster";
import styles from "@/styles/components.module.scss";

const TOAST_DURATION_MS = 4000;
const EXIT_DURATION_MS = 500;

export default function AddedMovieToast({
  movie,
  visible,
  onDismiss,
  onOpen,
}) {
  const [entered, setEntered] = useState(false);
  const dismissingRef = useRef(false);
  const dismissTimerRef = useRef(null);

  const clearDismissTimer = useCallback(() => {
    if (dismissTimerRef.current) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }
  }, []);

  const requestDismiss = useCallback(
    (afterDismiss) => {
      if (dismissingRef.current) return;

      dismissingRef.current = true;
      setEntered(false);

      dismissTimerRef.current = window.setTimeout(() => {
        dismissTimerRef.current = null;
        dismissingRef.current = false;
        onDismiss?.();
        afterDismiss?.();
      }, EXIT_DURATION_MS);
    },
    [onDismiss]
  );

  useEffect(() => {
    if (!visible || !movie) {
      setEntered(false);
      dismissingRef.current = false;
      clearDismissTimer();
      return undefined;
    }

    let enterFrame2 = 0;
    const enterFrame1 = window.requestAnimationFrame(() => {
      enterFrame2 = window.requestAnimationFrame(() => setEntered(true));
    });

    const autoDismissTimer = window.setTimeout(() => {
      requestDismiss();
    }, TOAST_DURATION_MS);

    return () => {
      window.cancelAnimationFrame(enterFrame1);
      window.cancelAnimationFrame(enterFrame2);
      window.clearTimeout(autoDismissTimer);
      clearDismissTimer();
    };
  }, [visible, movie, requestDismiss, clearDismissTimer]);

  if (!movie) return null;

  const primaryTitle = getMoviePrimaryTitle(movie);
  const localizedTitle = getMovieLocalizedTitle(movie);

  const handleOpen = () => {
    requestDismiss(() => onOpen?.(movie));
  };

  return (
    <div
      className={`${styles.addedMovieToastHost} ${entered ? styles.addedMovieToastHostVisible : ""}`}
      aria-live="polite"
    >
      <button
        type="button"
        className={styles.addedMovieToast}
        onClick={handleOpen}
        aria-label={`Ver detalles de ${primaryTitle}`}
      >
        <div className={styles.addedMovieToastLayout}>
          <MoviePoster movie={movie} size="cardVertical" />
          <div className={styles.addedMovieToastContent}>
            <span className={styles.addedMovieToastLabel}>Recién agregada</span>
            <div className={styles.addedMovieToastTitleRow}>
              <span className={styles.addedMovieToastTitle}>{primaryTitle}</span>
              {movie.year != null && (
                <span className={styles.cardYear}>{movie.year}</span>
              )}
            </div>
            {localizedTitle && (
              <span className={styles.cardLocalizedTitle}>{localizedTitle}</span>
            )}
          </div>
        </div>
        <span className={styles.addedMovieToastProgress} aria-hidden="true">
          <span
            className={styles.addedMovieToastProgressFill}
            style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
          />
        </span>
      </button>
    </div>
  );
}
