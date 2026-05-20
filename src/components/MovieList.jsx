import MovieCard from "./MovieCard";
import styles from "@/styles/components.module.scss";

export default function MovieList({
  movies,
  variant,
  onSelect,
  onOpenMarkWatched,
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
            onSelect={onSelect}
            onOpenMarkWatched={onOpenMarkWatched}
            onMoveToPending={onMoveToPending}
            onDelete={onDelete}
          />
        </li>
      ))}
    </ul>
  );
}
