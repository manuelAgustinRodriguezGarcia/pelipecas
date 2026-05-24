"use client";

import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import styles from "@/styles/components.module.scss";

export default function RemoveFromPendingConfirmModal({
  movie,
  onCancel,
  onConfirm,
}) {
  const dialogRef = useRef(null);
  const { isVisible, isClosing, requestClose } = useModalCloseAnimation(
    Boolean(movie),
    onCancel
  );

  useEffect(() => {
    if (!isVisible || !movie) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, movie, requestClose]);

  if (!isVisible || !movie) return null;

  const handleConfirm = () => {
    requestClose(() => onConfirm?.());
  };

  return (
    <div
      className={`${styles.modalBackdrop} ${isClosing ? styles.modalBackdropClosing : ""}`}
      onClick={() => requestClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`${styles.modalDialog} ${isClosing ? styles.modalDialogClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-pending-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={() => requestClose()}
          aria-label="Cerrar"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className={styles.modalIconWrap} aria-hidden="true">
          <Trash2 size={24} strokeWidth={1.5} />
        </div>

        <h2 id="remove-pending-modal-title" className={styles.modalTitle}>
          ¿Eliminar de para ver?
        </h2>

        <p className={`bodyText ${styles.modalText}`}>
          Vas a eliminar{" "}
          <strong className={styles.modalMovieTitle}>{movie.title}</strong> de tu
          lista para ver. Esta acción no se puede deshacer.
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => requestClose()}
          >
            Cancelar
          </button>
          <button type="button" className={styles.btnDanger} onClick={handleConfirm}>
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
