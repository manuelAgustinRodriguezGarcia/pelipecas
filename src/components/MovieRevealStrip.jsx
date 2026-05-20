"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  REVEAL_ROLL_MS,
  calculateRevealOffsets,
  measureRevealStripMetrics,
} from "@/helpers/revealHelpers";
import RevealPosterCard from "./RevealPosterCard";
import styles from "@/styles/components.module.scss";

export default function MovieRevealStrip({
  items,
  targetIndex,
  motionPattern,
  isRolling,
  isRevealed,
  isIdle = false,
  onRollComplete,
}) {
  const viewportRef = useRef(null);
  const stripRef = useRef(null);
  const hasStartedRef = useRef(false);
  const lockedOffsetRef = useRef(null);

  const applyMotionStyle = useCallback(() => {
    const strip = stripRef.current;
    if (!strip || !motionPattern) return;
    strip.style.setProperty("--reveal-duration", `${motionPattern.durationMs}ms`);
    strip.style.setProperty("--reveal-easing", motionPattern.easing);
    strip.dataset.motion = motionPattern.id;
  }, [motionPattern]);

  const applyOffset = useCallback((offsetPx, withTransition) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.style.setProperty("--reveal-offset", `${offsetPx}px`);
    strip.dataset.transitioning = withTransition ? "true" : "false";
  }, []);

  const startRoll = useCallback(() => {
    const strip = stripRef.current;
    if (!strip || items.length === 0) return;

    const metrics = measureRevealStripMetrics(strip, 0);
    if (!metrics) return;

    hasStartedRef.current = true;
    applyMotionStyle();
    const { initialOffset, finalOffset } = calculateRevealOffsets(
      metrics.containerWidth,
      targetIndex,
      metrics.cardWidth,
      metrics.gap,
      motionPattern
    );

    applyOffset(initialOffset, false);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        applyOffset(finalOffset, true);
      });
    });
  }, [items.length, targetIndex, motionPattern, applyMotionStyle, applyOffset]);

  useEffect(() => {
    if (!isRolling) {
      hasStartedRef.current = false;
      return undefined;
    }

    lockedOffsetRef.current = null;

    if (items.length === 0 || hasStartedRef.current) return undefined;

    const timer = window.setTimeout(startRoll, 50);

    return () => window.clearTimeout(timer);
  }, [isRolling, items.length, startRoll]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !isRolling) return undefined;

    const handleTransitionEnd = (event) => {
      if (event.target !== strip) return;
      if (event.propertyName !== "transform") return;
      if (strip.dataset.transitioning !== "true") return;

      const metrics = measureRevealStripMetrics(strip, targetIndex);
      if (metrics) {
        const { finalOffset } = calculateRevealOffsets(
          metrics.containerWidth,
          targetIndex,
          metrics.cardWidth,
          metrics.gap,
          motionPattern
        );
        lockedOffsetRef.current = finalOffset;
        applyOffset(finalOffset, false);
      }

      strip.dataset.transitioning = "false";
      onRollComplete?.();
    };

    strip.addEventListener("transitionend", handleTransitionEnd);
    return () => strip.removeEventListener("transitionend", handleTransitionEnd);
  }, [isRolling, onRollComplete, targetIndex, motionPattern, applyOffset]);

  useEffect(() => {
    if (!isRevealed || lockedOffsetRef.current == null) return undefined;
    applyOffset(lockedOffsetRef.current, false);
    return undefined;
  }, [isRevealed, applyOffset]);

  useEffect(() => {
    if (!isIdle || items.length === 0 || isRolling || isRevealed) return undefined;

    const strip = stripRef.current;
    if (!strip) return undefined;

    const timer = window.setTimeout(() => {
      const metrics = measureRevealStripMetrics(strip, targetIndex);
      if (!metrics) return;

      const { finalOffset } = calculateRevealOffsets(
        metrics.containerWidth,
        targetIndex,
        metrics.cardWidth,
        metrics.gap
      );
      applyOffset(finalOffset, false);
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isIdle, items.length, targetIndex, isRolling, isRevealed, applyOffset]);

  if (items.length === 0) {
    return (
      <div className={styles.revealStage}>
        <p className={styles.revealSelectionLabel}>Selección</p>
        <div className={`${styles.revealViewport} ${styles.revealViewportEmpty}`} />
      </div>
    );
  }

  return (
    <div className={styles.revealStage}>
      <p className={styles.revealSelectionLabel}>Selección</p>
      <div className={styles.revealViewport} ref={viewportRef}>
        <div className={styles.revealCenterIndicator} aria-hidden="true">
          <span className={styles.revealCenterLine} />
        </div>
        <div
          className={`${styles.revealCover} ${isRevealed || isIdle ? styles.revealCoverHidden : ""}`}
          aria-hidden="true"
        />
        <div
          ref={stripRef}
          className={styles.revealStrip}
          data-transitioning="false"
        >
          {items.map((movie, index) => (
            <RevealPosterCard
              key={`${movie.id}-${index}`}
              movie={movie}
              isHighlighted={isRevealed && index === targetIndex}
              isBlurred={!isRevealed || index !== targetIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
