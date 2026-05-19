"use client";

import { Aperture, Film } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import styles from "@/styles/components.module.scss";
import {
  getMovieInitials,
  getRouletteSegments,
  getShortTitle,
} from "@/helpers/movieHelpers";

export default function RouletteWheel({ pendingMovies, isSpinning, rotation }) {
  const wheelRef = useRef(null);
  const segments = getRouletteSegments(pendingMovies);
  const segmentCount = segments.length;

  useEffect(() => {
    if (wheelRef.current) {
      wheelRef.current.style.setProperty("--wheel-rotation", `${rotation}deg`);
    }
  }, [rotation]);

  if (segmentCount === 0) {
    return (
      <div className={styles.rouletteContainer}>
        <div className={styles.rouletteEmpty} aria-hidden="true">
          <Film size={32} strokeWidth={1.25} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.rouletteContainer}>
      <div className={styles.roulettePointer} aria-hidden="true" />
      <div
        ref={wheelRef}
        className={styles.rouletteWheel}
        data-spinning={isSpinning}
        data-segments={segmentCount}
        role="img"
        aria-label="Selector de películas"
      >
        {segments.map((movie, index) => (
          <div
            key={movie.id}
            className={styles.rouletteSegment}
            data-index={index + 1}
            data-variant={index % 2 === 0 ? "surface" : "elevated"}
          >
            <span className={styles.segmentLabel}>
              {getShortTitle(getMovieInitials(movie.title), 8)}
            </span>
          </div>
        ))}
        <div className={styles.rouletteCenter} aria-hidden="true">
          <Aperture size={22} strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
}

export function useRouletteSpin(pendingMovies, onSpinComplete) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning || pendingMovies.length === 0) return;

    setIsSpinning(true);

    const segments = getRouletteSegments(pendingMovies);
    const segmentAngle = 360 / segments.length;
    const randomSegment = Math.floor(Math.random() * segments.length);
    const extraTurns = 4 + Math.floor(Math.random() * 2);
    const targetAngle =
      extraTurns * 360 + randomSegment * segmentAngle + segmentAngle / 2;

    setRotation((prev) => prev + targetAngle);

    window.setTimeout(() => {
      setIsSpinning(false);
      onSpinComplete?.();
    }, 3200);
  };

  return { isSpinning, rotation, spin };
}

