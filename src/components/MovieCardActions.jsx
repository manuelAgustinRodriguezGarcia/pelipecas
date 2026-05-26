"use client";

import { CircleCheck, Clapperboard, Trash2 } from "lucide-react";
import styles from "@/styles/components.module.scss";

function stopCardClick(event) {
  event.stopPropagation();
}

export default function MovieCardActions({
  movieId,
  movieTitle,
  variant,
  onSelectMovie,
  onMoveToPending,
  onDelete,
}) {
  const handlePrimary = (event) => {
    stopCardClick(event);
    if (variant === "pending") {
      onSelectMovie?.();
    } else {
      onMoveToPending?.(movieId);
    }
  };

  const handleDelete = (event) => {
    stopCardClick(event);
    onDelete?.(movieId);
  };

  const primaryLabel = variant === "pending" ? "La vimos" : "Para ver";

  return (
    <div className={styles.cardActionsRow} onClick={stopCardClick}>
      <button
        type="button"
        className={`${styles.btnDanger} ${styles.btnIconOnly}`}
        onClick={handleDelete}
        aria-label={`Eliminar ${movieTitle}`}
      >
        <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
      <button
        type="button"
        className={styles.btnPrimary}
        onClick={handlePrimary}
      >
        {variant === "pending" ? (
          <CircleCheck size={16} strokeWidth={1.5} aria-hidden="true" />
        ) : (
          <Clapperboard size={16} strokeWidth={1.75} aria-hidden="true" />
        )}
        <span className="sectionLabel">{primaryLabel}</span>
      </button>
    </div>
  );
}
