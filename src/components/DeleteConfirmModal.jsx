"use client";

import { useEffect, useRef } from "react";
import { Trash2, X } from "lucide-react";
import styles from "@/styles/components.module.scss";

export default function DeleteConfirmModal({ movie, onCancel, onConfirm }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!movie) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [movie, onCancel]);

  if (!movie) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={onCancel}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className={styles.modalClose}
          onClick={onCancel}
          aria-label="Cerrar"
        >
          <X size={18} strokeWidth={1.75} />
        </button>

        <div className={styles.modalIconWrap} aria-hidden="true">
          <Trash2 size={24} strokeWidth={1.5} />
        </div>

        <h2 id="delete-modal-title" className={styles.modalTitle}>
          ¿Eliminar película?
        </h2>

        <p className={`bodyText ${styles.modalText}`}>
          Vas a eliminar{" "}
          <strong className={styles.modalMovieTitle}>{movie.title}</strong> de
          tu cartelera. Esta acción no se puede deshacer.
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={onConfirm}
          >
            <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
