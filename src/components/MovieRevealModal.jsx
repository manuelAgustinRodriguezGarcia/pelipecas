"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheck, Star, X } from "lucide-react";
import { fetchTmdbMovieDetails } from "@/helpers/fetchTmdbMovieDetails";
import { formatRuntime } from "@/helpers/movieHelpers";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import CollapsibleSection from "./CollapsibleSection";
import DetailWatchProviders from "./DetailWatchProviders";
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
  const detailsLoadedForRef = useRef(null);
  const [displayMovie, setDisplayMovie] = useState(movie);
  const [overview, setOverview] = useState(movie?.overview ?? null);
  const [voteAverage, setVoteAverage] = useState(movie?.voteAverage ?? null);
  const [runtime, setRuntime] = useState(movie?.runtime ?? null);
  const [watchProviders, setWatchProviders] = useState(
    movie?.watchProviders ?? undefined
  );

  const { isVisible, isClosing, requestClose } = useModalCloseAnimation(
    isOpen,
    onClose
  );

  useLockBodyScroll(isVisible);

  useEffect(() => {
    if (!movie) return;
    setDisplayMovie(movie);
    setOverview(movie.overview ?? null);
    setVoteAverage(movie.voteAverage ?? null);
    setRuntime(movie.runtime ?? null);
    setWatchProviders(movie.watchProviders ?? undefined);
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
    detailsLoadedForRef.current = null;
  }, [movie?.id]);

  useEffect(() => {
    if (!isVisible || !displayMovie?.tmdbId) return undefined;
    if (detailsLoadedForRef.current === displayMovie.id) return undefined;

    let cancelled = false;
    const controller = new AbortController();

    async function loadTmdbDetails() {
      const detail = await fetchTmdbMovieDetails(
        displayMovie.tmdbId,
        controller.signal
      );
      if (cancelled) return;

      detailsLoadedForRef.current = displayMovie.id;

      if (!detail) {
        setWatchProviders((current) =>
          current === undefined ? [] : current
        );
        return;
      }

      if (detail.overview) {
        setOverview(detail.overview);
      }
      if (detail.voteAverage != null) {
        setVoteAverage(detail.voteAverage);
      }
      if (detail.runtime != null) {
        setRuntime(detail.runtime);
      }
      setWatchProviders((current) => {
        if (current !== undefined) return current;
        return Array.isArray(detail.watchProviders) ? detail.watchProviders : [];
      });
    }

    loadTmdbDetails();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isVisible, displayMovie?.id, displayMovie?.tmdbId]);

  if (!isVisible || !displayMovie) return null;

  const handleMarkWatched = () => {
    requestClose(() => onOpenMarkWatched?.(displayMovie.id));
  };

  const handlePickAgain = () => {
    onPickAgain?.();
    requestClose();
  };

  const runtimeLabel = formatRuntime(runtime ?? displayMovie.runtime);

  return (
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
              {runtimeLabel && (
                <span className={styles.detailModalRuntime}>{runtimeLabel}</span>
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

          {displayMovie.tmdbId && watchProviders !== undefined && (
            <DetailWatchProviders providers={watchProviders} />
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
  );
}
