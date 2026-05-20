import { useRef } from "react";
import { Check } from "lucide-react";
import CinemaBadge from "./CinemaBadge";
import MovieCardActionMenu from "./MovieCardActionMenu";
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
  onSelect,
  onOpenMarkWatched,
  onMoveToPending,
  onDelete,
  onSpinAgain,
}) {
  const cardRef = useRef(null);
  const suppressClickRef = useRef(false);

  const handleCardClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onSelect?.(movie);
  };

  const handleCardKeyDown = (event) => {
    if (!onSelect) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(movie);
    }
  };

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
            onClick={() => onOpenMarkWatched?.(movie.id)}
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
    <article
      ref={cardRef}
      className={`${styles.movieCard} ${styles.movieCardWithMenu} ${onSelect ? styles.movieCardClickable : ""}`}
      onClick={onSelect ? handleCardClick : undefined}
      onKeyDown={onSelect ? handleCardKeyDown : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <MoviePoster movie={movie} />
      <div className={`${styles.cardBody} ${styles.cardBodyWithMenu}`}>
        <div className={styles.cardBodyMain}>
          <h3 className={styles.cardTitle}>{movie.title}</h3>
          <MovieMeta movie={movie} variant={variant} />
        </div>
        <MovieCardActionMenu
          cardRef={cardRef}
          movieId={movie.id}
          movieTitle={movie.title}
          variant={variant}
          onOpenMarkWatched={onOpenMarkWatched}
          onMoveToPending={onMoveToPending}
          onDelete={onDelete}
          onSwipeOpen={() => {
            suppressClickRef.current = true;
          }}
        />
      </div>
    </article>
  );
}
