"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart } from "lucide-react";
import LoveNoteModal from "./LoveNoteModal";
import styles from "@/styles/components.module.scss";

export default function Header() {
  const [loveNoteOpen, setLoveNoteOpen] = useState(false);

  return (
    <>
      <header className={styles.header} aria-label="Pelipecas">
        <div className={styles.headerContent}>
          <div className={styles.headerLogo} aria-hidden="true">
            <Image
              src="/logo.webp"
              alt=""
              width={71}
              height={71}
              priority
              className={styles.headerLogoImg}
            />
          </div>
          <div className={styles.headerText}>
            <h1 className="logo">Pelipecas</h1>
            <p className={`bodyText ${styles.subtitle}`}>
              Tu cartelera personal de películas.
            </p>
          </div>
          <button
            type="button"
            className={styles.headerHeartButton}
            onClick={() => setLoveNoteOpen(true)}
            aria-label="Para Pecas — Te amo"
          >
            <Heart size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className={`sectionLabel ${styles.headerHeartLabel}`}>
              Te amo
            </span>
          </button>
        </div>
      </header>

      <LoveNoteModal
        isOpen={loveNoteOpen}
        onClose={() => setLoveNoteOpen(false)}
      />
    </>
  );
}
