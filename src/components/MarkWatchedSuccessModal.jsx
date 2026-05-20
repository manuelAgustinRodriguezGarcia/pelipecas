"use client";

import { useEffect, useRef } from "react";
import { CircleCheck, X } from "lucide-react";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import styles from "@/styles/components.module.scss";

export default function MarkWatchedSuccessModal({ success, onClose }) {
  const dialogRef = useRef(null);
  const { isVisible, isClosing, requestClose } = useModalCloseAnimation(
    Boolean(success),
    onClose
  );

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

  return (
    <div
      className={`${styles.modalBackdrop} ${styles.modalBackdropElevated} ${isClosing ? styles.modalBackdropClosing : ""}`}
      onClick={() => requestClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`${styles.modalDialog} ${styles.modalDialogSuccess} ${isClosing ? styles.modalDialogClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mark-watched-success-title"
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

        <div className={styles.modalIconWrapSuccess} aria-hidden="true">
          <CircleCheck size={24} strokeWidth={1.5} />
        </div>

        <h2 id="mark-watched-success-title" className={styles.modalTitle}>
          ¡Listo!
        </h2>

        <p className={`bodyText ${styles.modalText}`}>
          Guardamos las calificaciones de{" "}
          <strong className={styles.modalMovieTitle}>{success.title}</strong> en
          Las vimos.
        </p>

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
    </div>
  );
}
