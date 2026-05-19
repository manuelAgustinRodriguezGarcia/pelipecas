import { Ticket } from "lucide-react";
import MovieCard from "./MovieCard";
import styles from "@/styles/components.module.scss";

export default function RouletteResult({
  movie,
  onMarkWatched,
  onSpinAgain,
}) {
  if (!movie) return null;

  return (
    <section className={styles.resultSection} aria-live="polite">
      <h3 className={styles.resultHeading}>
        <Ticket size={20} strokeWidth={1.5} aria-hidden="true" />
        Película seleccionada
      </h3>
      <MovieCard
        movie={movie}
        variant="result"
        onMarkWatched={onMarkWatched}
        onSpinAgain={onSpinAgain}
      />
    </section>
  );
}
