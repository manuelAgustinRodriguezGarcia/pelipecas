"use client";

import { useEffect, useRef } from "react";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import MoviePoster from "./MoviePoster";
import StarDisplay from "./StarDisplay";
import styles from "@/styles/components.module.scss";

export default function MarkWatchedSuccessModal({
  success,
  embedded = false,
  swapIn = false,
  isClosing: isClosingProp = false,
  onClose,
}) {
  const dialogRef = useRef(null);
  const internalClose = useModalCloseAnimation(Boolean(success) && !embedded, onClose);
  const isVisible = embedded ? Boolean(success) : internalClose.isVisible;
  const isClosing = embedded ? isClosingProp : internalClose.isClosing;
  const requestClose = embedded ? onClose : internalClose.requestClose;

  useEffect(() => {
    if (!isVisible || !success) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, success, requestClose]);

  if (!isVisible || !success) return null;

  const averageRating =
    success.averageRating != null ? Number(success.averageRating) : null;

  const dialog = (
    <div
      ref={dialogRef}
      className={`${styles.modalDialog} ${styles.modalDialogSuccess} ${swapIn ? styles.modalDialogSwapIn : ""} ${isClosing ? styles.modalDialogClosing : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mark-watched-success-title"
      tabIndex={-1}
      onClick={(event) => event.stopPropagation()}
    >
      <MoviePoster
        movie={{
          title: success.title,
          posterPath: success.posterPath,
          posterUrl: success.posterUrl,
        }}
        size="successModal"
      />

      <p className={styles.markWatchedSuccessLabel}>Hoy vimos:</p>
      <h2 id="mark-watched-success-title" className={styles.markWatchedSuccessMovie}>
        {success.title}
      </h2>

      {averageRating != null && (
        <>
          <p className={styles.markWatchedSuccessLabel}>Y nos pareció:</p>
          <div className={styles.markWatchedSuccessRating}>
            <span className={styles.markWatchedSuccessScore}>
              {averageRating.toFixed(1)}
            </span>
            <StarDisplay value={averageRating} size={22} />
          </div>
        </>
      )}

      <div className={styles.modalActions}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => requestClose()}
        >
          Cerrar
        </button>
      </div>
    </div>
  );

  if (embedded) {
    return dialog;
  }

  return (
    <div
      className={`${styles.modalBackdrop} ${styles.modalBackdropElevated} ${isClosing ? styles.modalBackdropClosing : ""}`}
      onClick={() => requestClose()}
      role="presentation"
    >
      {dialog}
    </div>
  );
}
