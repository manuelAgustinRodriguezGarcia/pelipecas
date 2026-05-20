"use client";

import { useState } from "react";
import Image from "next/image";
import { Film } from "lucide-react";
import { generateMovieVisual } from "@/helpers/movieHelpers";
import styles from "@/styles/components.module.scss";

export default function MovieSearchResultItem({ movie, onSelect }) {
  const [imageError, setImageError] = useState(false);
  const visual = generateMovieVisual(movie.title);
  const showOriginal =
    movie.originalTitle &&
    movie.originalTitle.toLowerCase() !== movie.title.toLowerCase();
  const showPoster = movie.posterUrl && !imageError;

  return (
    <button
      type="button"
      className={styles.searchResultItem}
      onClick={() => onSelect(movie)}
      aria-label={`Agregar ${movie.title}`}
    >
      <div className={styles.searchResultPoster}>
        {showPoster ? (
          <Image
            src={movie.posterUrl}
            alt=""
            width={42}
            height={64}
            className={styles.searchResultPosterImage}
            sizes="42px"
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div
            className={`${styles.searchResultPosterPlaceholder} ${styles[visual.posterVariant]}`}
            aria-hidden="true"
          >
            <Film size={18} strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className={styles.searchResultBody}>
        <div className={styles.searchResultTitleRow}>
          <span className={styles.searchResultTitle}>{movie.title}</span>
          {movie.year && (
            <span className={styles.searchResultYear}>{movie.year}</span>
          )}
        </div>
        {showOriginal && (
          <span className={styles.searchResultOriginal}>{movie.originalTitle}</span>
        )}
        {movie.overview && (
          <p className={styles.searchResultOverview}>{movie.overview}</p>
        )}
      </div>
    </button>
  );
}
