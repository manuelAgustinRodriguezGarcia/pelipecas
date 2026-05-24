"use client";

import { useRef } from "react";
import { Check } from "lucide-react";
import CinemaBadge from "./CinemaBadge";
import MovieCardActionMenu from "./MovieCardActionMenu";
import MovieCardActions from "./MovieCardActions";
import MoviePoster from "./MoviePoster";
import styles from "@/styles/components.module.scss";
import {
  formatRuntime,
  formatWatchedDate,
  isRatingsComplete,
} from "@/helpers/movieHelpers";
import { prefetchTmdbMovieDetails } from "@/helpers/tmdbDetailsCache";
import UserRatingPanel from "./UserRatingPanel";

function MovieMeta({ movie, variant }) {
  const runtimeLabel = formatRuntime(movie.runtime);

  return (
    <div className={styles.cardMeta}>
      {variant === "watched" && movie.watchedAt && (
        <span className={styles.cardDate}>
          {formatWatchedDate(movie.watchedAt)}
        </span>
      )}
      {variant === "result" && <CinemaBadge variant="picked">Sorteada</CinemaBadge>}
      {movie.year && <span className={styles.cardYear}>{movie.year}</span>}
      {movie.voteAverage != null && (
        <span className={styles.cardRating}>TMDB {movie.voteAverage.toFixed(1)}</span>
      )}
      {runtimeLabel && (
        <span className={styles.cardRuntime}>{runtimeLabel}</span>
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
  const isCardInteractive = Boolean(onSelect);

  const isMenuInteraction = (target) =>
    target.closest(
      `button, [role="menu"], .${styles.cardMenuPanel}, .${styles.cardMenuOverlay}, .${styles.cardActions}`
    );

  const prefetchDetails = () => {
    if (movie.tmdbId) prefetchTmdbMovieDetails(movie.tmdbId);
  };

  const handleArticleClick = (event) => {
    if (!onSelect || isMenuInteraction(event.target)) return;
    prefetchDetails();
    onSelect(movie);
  };

  if (variant === "result") {
    return (
      <article className={`${styles.movieCard} ${styles.movieCardResult}`}>
        <MoviePoster movie={movie} size="cardVertical" />
        <div className={styles.cardContent}>
          <CinemaBadge variant="picked">Película seleccionada</CinemaBadge>
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
              Elegir otra
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      ref={cardRef}
      className={`${styles.movieCard} ${styles.movieCardResponsive} ${styles.movieCardWithMenu} ${styles.cardBodyWithMenu} ${isCardInteractive ? styles.movieCardClickable : ""}`}
      onClick={isCardInteractive ? handleArticleClick : undefined}
      onPointerEnter={isCardInteractive ? prefetchDetails : undefined}
      onPointerDown={isCardInteractive ? prefetchDetails : undefined}
      aria-label={isCardInteractive ? `Ver detalles de ${movie.title}` : undefined}
    >
      <div className={styles.cardLayout}>
        <div className={styles.cardClickArea}>
          <MoviePoster movie={movie} size="cardVertical" />
          <div className={styles.cardContentMain}>
            <h3 className={styles.cardTitle}>{movie.title}</h3>
            <MovieMeta movie={movie} variant={variant} />
            {variant === "watched" && isRatingsComplete(movie.ratings) && (
              <UserRatingPanel ratings={movie.ratings} compact />
            )}
          </div>
        </div>
        <div className={styles.cardActionsMobile}>
          <MovieCardActionMenu
            cardRef={cardRef}
            movieId={movie.id}
            movieTitle={movie.title}
            variant={variant}
            onSelectMovie={variant === "pending" ? () => onSelect?.(movie) : undefined}
            onMoveToPending={onMoveToPending}
            onDelete={onDelete}
          />
        </div>
      </div>
      <div className={styles.cardFooterDesktop}>
        <MovieCardActions
          movieId={movie.id}
          movieTitle={movie.title}
          variant={variant}
          onSelectMovie={variant === "pending" ? () => onSelect?.(movie) : undefined}
          onMoveToPending={onMoveToPending}
          onDelete={onDelete}
        />
      </div>
    </article>
  );
}
