"use client";

import { Check, Ticket } from "lucide-react";
import MoviePoster from "./MoviePoster";
import CinemaBadge from "./CinemaBadge";
import styles from "@/styles/components.module.scss";

export default function MovieRevealResult({
  movie,
  onOpenMarkWatched,
  onPickAgain,
}) {
  if (!movie) return null;

  return (
    <section
      className={styles.revealResultSection}
      aria-live="polite"
      aria-label="Película seleccionada"
    >
      <h3 className={styles.revealResultTitle}>Hoy vemos</h3>
      <article className={styles.revealResultCard}>
        <CinemaBadge variant="picked">Película seleccionada</CinemaBadge>
        <MoviePoster movie={movie} size="revealResult" />
        <h4 className={styles.revealResultMovieTitle}>{movie.title}</h4>
        <div className={styles.revealResultMeta}>
          {movie.year && (
            <span className={styles.cardYear}>{movie.year}</span>
          )}
          {movie.voteAverage != null && (
            <span className={styles.cardRating}>
              TMDB {movie.voteAverage.toFixed(1)}
            </span>
          )}
        </div>
        <div className={styles.revealResultActions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => onOpenMarkWatched?.(movie.id)}
          >
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            Marcar como vista
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onPickAgain}
          >
            <Ticket size={16} strokeWidth={1.75} aria-hidden="true" />
            Elegir otra
          </button>
        </div>
      </article>
    </section>
  );
}
