"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, Trash2, X } from "lucide-react";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import styles from "@/styles/components.module.scss";

const COPY = {
  moveToPending: {
    title: "¿Mover a para ver?",
    getMessage: (title, hasRatings) => (
      <>
        Vas a mover <strong className={styles.modalMovieTitle}>{title}</strong> a tu
        lista de pendientes.
        {hasRatings ? (
          <>
            {" "}
            Se perderán las calificaciones que realizaste sobre esta película.
          </>
        ) : null}
      </>
    ),
    confirmLabel: "Mover",
    Icon: ArrowLeft,
    iconClass: styles.modalIconWrapNeutral,
    confirmClass: styles.btnDanger,
  },
  delete: {
    title: "¿Eliminar película?",
    getMessage: (title, hasRatings) => (
      <>
        Vas a eliminar <strong className={styles.modalMovieTitle}>{title}</strong> de
        tu cartelera.
        {hasRatings ? (
          <>
            {" "}
            Se perderán las calificaciones que realizaste sobre esta película.
          </>
        ) : (
          <> Esta acción no se puede deshacer.</>
        )}
      </>
    ),
    confirmLabel: "Eliminar",
    Icon: Trash2,
    iconClass: styles.modalIconWrap,
    confirmClass: styles.btnDanger,
  },
};

export default function DetailActionConfirmModal({ confirm, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const { isVisible, isClosing, requestClose } = useModalCloseAnimation(
    Boolean(confirm),
    onCancel
  );

  useEffect(() => {
    if (!isVisible || !confirm) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, confirm, requestClose]);

  if (!isVisible || !confirm) return null;

  const config = COPY[confirm.type];
  const { Icon } = config;

  const handleConfirm = () => {
    requestClose(() => onConfirm?.(confirm));
  };

  return (
    <div
      className={`${styles.modalBackdrop} ${styles.modalBackdropElevated} ${isClosing ? styles.modalBackdropClosing : ""}`}
      onClick={() => requestClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`${styles.modalDialog} ${isClosing ? styles.modalDialogClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-action-modal-title"
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

        <div className={`${config.iconClass}`} aria-hidden="true">
          <Icon size={24} strokeWidth={1.5} />
        </div>

        <h2 id="detail-action-modal-title" className={styles.modalTitle}>
          {config.title}
        </h2>

        <p className={`bodyText ${styles.modalText}`}>
          {config.getMessage(confirm.title, confirm.hasRatings)}
        </p>

        <div className={styles.modalActions}>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => requestClose()}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={config.confirmClass}
            onClick={handleConfirm}
          >
            <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
            {config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
