import Image from "next/image";
import { generateMovieVisual } from "@/helpers/movieHelpers";
import styles from "@/styles/components.module.scss";

export default function MoviePoster({ movie, size = "default", className = "" }) {
  const visual = generateMovieVisual(movie.title);
  const isLarge = size === "large";
  const sizeClass = isLarge ? styles.posterLarge : "";

  if (movie.posterUrl) {
    return (
      <div
        className={`${styles.poster} ${styles.posterImageWrap} ${sizeClass} ${className}`}
      >
        <Image
          src={movie.posterUrl}
          alt=""
          width={isLarge ? 96 : 56}
          height={isLarge ? 132 : 80}
          className={styles.posterImage}
          sizes={isLarge ? "96px" : "56px"}
        />
      </div>
    );
  }

  return (
    <div
      className={`${styles.poster} ${styles[visual.posterVariant]} ${sizeClass} ${className}`}
      aria-hidden="true"
    >
      <span>{visual.initials}</span>
    </div>
  );
}


