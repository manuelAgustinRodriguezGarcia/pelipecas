import { Check, RotateCcw, Trash2 } from "lucide-react";
import CinemaBadge from "./CinemaBadge";
import MoviePoster from "./MoviePoster";
import styles from "@/styles/components.module.scss";
import { formatWatchedDate } from "@/helpers/movieHelpers";

function MovieMeta({ movie, variant }) {
  return (
    <div className={styles.cardMeta}>
      {variant === "pending" && <CinemaBadge variant="pending">Para ver</CinemaBadge>}
      {variant === "watched" && (
        <>
          <CinemaBadge variant="watched">Vista</CinemaBadge>
          {movie.watchedAt && (
            <span className={styles.cardDate}>
              {formatWatchedDate(movie.watchedAt)}
            </span>
          )}
        </>
      )}
      {variant === "result" && <CinemaBadge variant="picked">Sorteada</CinemaBadge>}
      {movie.year && <span className={styles.cardYear}>{movie.year}</span>}
      {movie.voteAverage != null && (
        <span className={styles.cardRating}>TMDB {movie.voteAverage.toFixed(1)}</span>
      )}
    </div>
  );
}

export default function MovieCard({
  movie,
  variant = "pending",
  onMarkWatched,
  onMoveToPending,
  onDelete,
  onSpinAgain,
}) {
  if (variant === "result") {
    return (
      <article className={`${styles.movieCard} ${styles.movieCardResult}`}>
        <MoviePoster movie={movie} size="large" />
        <h3 className={styles.cardTitle}>{movie.title}</h3>
        <MovieMeta movie={movie} variant="result" />
        <div className={styles.resultActions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => onMarkWatched?.(movie.id)}
          >
            <Check size={16} strokeWidth={2.5} aria-hidden="true" />
            Marcar como vista
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onSpinAgain}
          >
            Volver a sortear
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.movieCard}>
      <MoviePoster movie={movie} />
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{movie.title}</h3>
        <MovieMeta movie={movie} variant={variant} />
        <div className={styles.cardActions}>
          {variant === "pending" ? (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={() => onMarkWatched?.(movie.id)}
            >
              <Check size={16} strokeWidth={2.5} aria-hidden="true" />
              Marcar como vista
            </button>
          ) : (
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => onMoveToPending?.(movie.id)}
            >
              <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
              Mover a para ver
            </button>
          )}
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => onDelete?.(movie.id)}
            aria-label={`Eliminar ${movie.title}`}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}

