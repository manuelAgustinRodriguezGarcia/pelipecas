import MovieCard from "./MovieCard";
import styles from "@/styles/components.module.scss";

export default function MovieList({
  movies,
  variant,
  onMarkWatched,
  onMoveToPending,
  onDelete,
}) {
  return (
    <ul className={styles.movieList}>
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard
            movie={movie}
            variant={variant}
            onMarkWatched={onMarkWatched}
            onMoveToPending={onMoveToPending}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
