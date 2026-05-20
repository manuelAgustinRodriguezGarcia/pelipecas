"use client";

import { CircleCheck, SquareArrowLeft, Trash2 } from "lucide-react";
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

  const primaryLabel = variant === "pending" ? "La vimos" : "Mover a para ver";

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
          <SquareArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
        )}
        <span className={variant === "pending" ? "sectionLabel" : undefined}>
          {primaryLabel}
        </span>
      </button>
    </div>
  );
}
