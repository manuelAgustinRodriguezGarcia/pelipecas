"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import styles from "@/styles/components.module.scss";

/** Sube este número al reemplazar public/pelipecas-mascots.webp en producción. */
const MASCOTS_IMAGE_VERSION = 2;

export default function LoveNoteModal({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  const [mascotsSrc, setMascotsSrc] = useState("/pelipecas-mascots.webp");
  const { isVisible, isClosing, requestClose } = useModalCloseAnimation(
    isOpen,
    onClose
  );

  useLockBodyScroll(isVisible);

  useEffect(() => {
    if (!isVisible) return;
    const version =
      process.env.NODE_ENV === "development"
        ? Date.now()
        : MASCOTS_IMAGE_VERSION;
    setMascotsSrc(`/pelipecas-mascots.webp?v=${version}`);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") requestClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    dialogRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, requestClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`${styles.modalBackdrop} ${styles.modalBackdropHost} ${isClosing ? styles.modalBackdropClosing : ""}`}
      onClick={() => requestClose()}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`${styles.modalDialog} ${styles.loveNoteModalDialog} ${isClosing ? styles.modalDialogClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="love-note-title"
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

        <div className={styles.loveNoteImageWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mascotsSrc}
            alt="Mascotas de Pelipecas"
            width={280}
            height={280}
            className={styles.loveNoteImage}
            decoding="async"
            loading="eager"
          />
        </div>

        <h2 id="love-note-title" className={styles.loveNoteTitle}>
          Para Pecas
        </h2>

        <p className={styles.loveNoteMessage}>
          Pelipecas fue creada para poder anotar las películas que quiero ver con
          el <span className={styles.loveNoteGold}>amor de mi vida</span>. Fue
          hecha con mucho amor y para poder compartir mil películas más juntos.
        </p>

        <p className={styles.loveNoteClosing}>
          <span className={styles.loveNoteClosingText}>Te amo con todo</span>
        </p>
      </div>
    </div>
  );
}
