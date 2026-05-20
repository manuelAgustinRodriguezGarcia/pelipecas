"use client";

import { useState } from "react";
import { generateMovieVisual } from "@/helpers/movieHelpers";
import styles from "@/styles/components.module.scss";

export default function RevealPosterCard({
  movie,
  isHighlighted = false,
  isBlurred = false,
}) {
  const [imageError, setImageError] = useState(false);
  const visual = generateMovieVisual(movie.title);
  const altText = `Poster de ${movie.title}`;
  const hasPoster = Boolean(movie.posterUrl) && !imageError;

  return (
    <article
      className={`${styles.revealPosterCard} ${isHighlighted ? styles.revealPosterCardHighlighted : ""} ${isBlurred ? styles.revealPosterCardBlurred : ""}`}
      aria-hidden={!isHighlighted}
    >
      {hasPoster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={movie.posterUrl}
          alt={altText}
          className={styles.revealPosterImg}
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className={`${styles.revealPosterFallback} ${styles[visual.posterVariant]}`}
          role="img"
          aria-label={altText}
        >
          <span>{visual.initials}</span>
        </div>
      )}
    </article>
  );
}
