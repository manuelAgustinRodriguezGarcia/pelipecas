"use client";

import { useState } from "react";
import Image from "next/image";
import { generateMovieVisual } from "@/helpers/movieHelpers";
import { buildPosterUrl } from "@/helpers/tmdbHelpers";
import styles from "@/styles/components.module.scss";

export default function MoviePoster({ movie, size = "default", className = "" }) {
  const [imageError, setImageError] = useState(false);
  const visual = generateMovieVisual(movie.title);
  const isLarge = size === "large";
  const isCardVertical = size === "cardVertical";
  const isFullWidth = size === "fullWidth";
  const isWidePoster = isFullWidth || isCardVertical;

  const posterSrc = isWidePoster
    ? buildPosterUrl(movie.posterPath, isCardVertical ? "w342" : "w500") ??
      movie.posterUrl
    : movie.posterUrl;

  if (isCardVertical) {
    const altText = `Poster de ${movie.title}`;

    if (posterSrc && !imageError) {
      return (
        <div className={`${styles.cardVerticalPoster} ${className}`.trim()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc}
            alt={altText}
            className={styles.cardVerticalPosterImg}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <div
        className={`${styles.cardVerticalPoster} ${styles.cardVerticalPosterFallback} ${styles[visual.posterVariant]} ${className}`.trim()}
        role="img"
        aria-label={altText}
      >
        <span>{visual.initials}</span>
      </div>
    );
  }

  if (isFullWidth) {
    if (posterSrc && !imageError) {
      return (
        <div className={`${styles.detailModalPoster} ${className}`.trim()}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={posterSrc}
            alt=""
            className={styles.detailModalPosterImg}
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    return (
      <div
        className={`${styles.detailModalPoster} ${styles.detailModalPosterFallback} ${styles[visual.posterVariant]} ${className}`.trim()}
        aria-hidden="true"
      >
        <span>{visual.initials}</span>
      </div>
    );
  }

  const sizeClass = isLarge ? styles.posterLarge : "";

  if (posterSrc && !imageError) {
    return (
      <div
        className={`${styles.poster} ${styles.posterImageWrap} ${sizeClass} ${className}`.trim()}
      >
        <Image
          src={posterSrc}
          alt=""
          width={isLarge ? 96 : 56}
          height={isLarge ? 132 : 80}
          className={styles.posterImage}
          sizes={isLarge ? "96px" : "56px"}
          unoptimized
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.poster} ${styles[visual.posterVariant]} ${sizeClass} ${className}`.trim()}
      aria-hidden="true"
    >
      <span>{visual.initials}</span>
    </div>
  );
}
