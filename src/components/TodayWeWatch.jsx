"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Clapperboard, Plus, Popcorn } from "lucide-react";
import {
  REVEAL_MOTION_PATTERNS,
  buildIdlePreviewItems,
  buildRevealItems,
  getRevealMotionPattern,
  pickRandomPendingMovie,
} from "@/helpers/revealHelpers";
import { prefetchTmdbMovieDetails } from "@/helpers/tmdbDetailsCache";
import EmptyState from "./EmptyState";
import MovieRevealModal from "./MovieRevealModal";
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
  const [motionPattern, setMotionPattern] = useState(REVEAL_MOTION_PATTERNS[0]);
  const motionPatternIndexRef = useRef(0);

  const advanceMotionPattern = useCallback(() => {
    motionPatternIndexRef.current += 1;
    setMotionPattern(getRevealMotionPattern(motionPatternIndexRef.current));
  }, []);

  const resetReveal = useCallback(() => {
    setIsRolling(false);
    setIsRevealed(false);
    setSelectedMovie(null);
    setRevealItems([]);
    setTargetIndex(0);
    clearPickedMovie?.();
    setIdleShuffleKey((key) => key + 1);
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

  const handleCloseReveal = useCallback(() => {
    setIsRevealed(false);
  }, []);

  const handlePickMovie = useCallback(() => {
    if (pendingMovies.length === 0 || isRolling) return;

    const chosen = pickRandomPendingMovie(pendingMovies);
    if (!chosen) return;

    advanceMotionPattern();
    const { items, targetIndex: index } = buildRevealItems(pendingMovies, chosen);

    clearPickedMovie?.();
    setSelectedMovie(chosen);
    if (chosen.tmdbId) prefetchTmdbMovieDetails(chosen.tmdbId);
    setRevealItems(items);
    setTargetIndex(index);
    setIsRevealed(false);
    setIsRolling(true);
  }, [pendingMovies, isRolling, advanceMotionPattern, clearPickedMovie]);

  const handlePickAgain = useCallback(() => {
    if (pendingMovies.length === 0 || isRolling) return;

    const chosen = pickRandomPendingMovie(pendingMovies);
    if (!chosen) return;

    advanceMotionPattern();
    const { items, targetIndex: index } = buildRevealItems(pendingMovies, chosen);

    clearPickedMovie?.();
    setSelectedMovie(chosen);
    if (chosen.tmdbId) prefetchTmdbMovieDetails(chosen.tmdbId);
    setRevealItems(items);
    setTargetIndex(index);
    setIsRevealed(false);
    setIsRolling(true);
  }, [pendingMovies, isRolling, clearPickedMovie, advanceMotionPattern]);

  const [idleShuffleKey, setIdleShuffleKey] = useState(0);

  const idlePreviewItems = useMemo(
    () => buildIdlePreviewItems(pendingMovies),
    [pendingMovies, idleShuffleKey]
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
        motionPattern={isStripIdle ? null : motionPattern}
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
        <span className="sectionLabel">
          {isRolling ? "Preparando la función…" : "Elegir película"}
        </span>
      </button>

      <MovieRevealModal
        movie={selectedMovie}
        isOpen={showResult}
        onClose={handleCloseReveal}
        onOpenMarkWatched={onOpenMarkWatched}
        onPickAgain={handlePickAgain}
      />
    </>
  );
}
