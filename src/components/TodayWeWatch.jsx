"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clapperboard, Popcorn, Plus } from "lucide-react";
import {
  buildIdlePreviewItems,
  buildRevealItems,
  pickRandomPendingMovie,
} from "@/helpers/revealHelpers";
import EmptyState from "./EmptyState";
import MovieRevealResult from "./MovieRevealResult";
import MovieRevealStrip from "./MovieRevealStrip";
import styles from "@/styles/components.module.scss";

export default function TodayWeWatch({
  pendingMovies,
  pickRandomMovie,
  clearPickedMovie,
  onOpenMarkWatched,
  onFocusAdd,
}) {
  const [isRolling, setIsRolling] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [revealItems, setRevealItems] = useState([]);
  const [targetIndex, setTargetIndex] = useState(0);
  const resultRef = useRef(null);

  const resetReveal = useCallback(() => {
    setIsRolling(false);
    setIsRevealed(false);
    setSelectedMovie(null);
    setRevealItems([]);
    setTargetIndex(0);
    clearPickedMovie?.();
  }, [clearPickedMovie]);

  useEffect(() => {
    if (!selectedMovie) return;
    const stillPending = pendingMovies.some(
      (movie) => movie.id === selectedMovie.id
    );
    if (!stillPending) {
      resetReveal();
    }
  }, [pendingMovies, selectedMovie, resetReveal]);

  const handleRollComplete = useCallback(() => {
    setIsRolling(false);
    setIsRevealed(true);
    if (selectedMovie) {
      pickRandomMovie?.(selectedMovie.id);
    }
  }, [selectedMovie, pickRandomMovie]);

  useEffect(() => {
    if (!isRevealed || !selectedMovie) return undefined;

    const timer = window.setTimeout(() => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      resultRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
    }, 480);

    return () => window.clearTimeout(timer);
  }, [isRevealed, selectedMovie]);

  const handlePickMovie = useCallback(() => {
    if (pendingMovies.length === 0 || isRolling) return;

    const chosen = pickRandomPendingMovie(pendingMovies);
    if (!chosen) return;

    const { items, targetIndex: index } = buildRevealItems(
      pendingMovies,
      chosen
    );

    clearPickedMovie?.();
    setSelectedMovie(chosen);
    setRevealItems(items);
    setTargetIndex(index);
    setIsRevealed(false);
    setIsRolling(true);
  }, [pendingMovies, isRolling, resetReveal]);

  const handlePickAgain = useCallback(() => {
    setIsRevealed(false);
    setIsRolling(false);
    setSelectedMovie(null);
    setRevealItems([]);
    setTargetIndex(0);
    clearPickedMovie?.();

    window.requestAnimationFrame(() => {
      if (pendingMovies.length === 0) return;

      const chosen = pickRandomPendingMovie(pendingMovies);
      if (!chosen) return;

      const { items, targetIndex: index } = buildRevealItems(
        pendingMovies,
        chosen
      );

      setSelectedMovie(chosen);
      setRevealItems(items);
      setTargetIndex(index);
      setIsRevealed(false);
      setIsRolling(true);
    });
  }, [pendingMovies, clearPickedMovie]);

  const idlePreviewItems = useMemo(
    () => buildIdlePreviewItems(pendingMovies),
    [pendingMovies]
  );

  const isStripIdle = revealItems.length === 0;
  const stripItems = isStripIdle ? idlePreviewItems : revealItems;
  const stripTargetIndex = isStripIdle
    ? Math.floor(idlePreviewItems.length / 2)
    : targetIndex;
  const showResult = isRevealed && selectedMovie;

  if (pendingMovies.length === 0) {
    return (
      <EmptyState
        icon={Clapperboard}
        title="No hay películas para elegir"
        text="Agregá películas a tu cartelera para que Pelipecas pueda elegir una."
        ctaLabel="Agregar película"
        ctaIcon={Plus}
        onCtaClick={onFocusAdd}
      />
    );
  }

  return (
    <>
      <MovieRevealStrip
        items={stripItems}
        targetIndex={stripTargetIndex}
        isRolling={isRolling}
        isRevealed={isRevealed}
        isIdle={isStripIdle}
        onRollComplete={handleRollComplete}
      />

      <button
        type="button"
        className={styles.revealPickButton}
        onClick={handlePickMovie}
        disabled={isRolling}
      >
        <Popcorn size={18} strokeWidth={1.75} aria-hidden="true" />
        {isRolling ? "Preparando la función…" : "Elegir película"}
      </button>

      {isRolling && (
        <p className={styles.revealRollingText} aria-live="polite">
          Preparando la función…
        </p>
      )}

      {showResult && (
        <div ref={resultRef}>
          <MovieRevealResult
            movie={selectedMovie}
            onOpenMarkWatched={onOpenMarkWatched}
            onPickAgain={handlePickAgain}
          />
        </div>
      )}
    </>
  );
}
