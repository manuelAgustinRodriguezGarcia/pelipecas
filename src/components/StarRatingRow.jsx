"use client";

import { Star } from "lucide-react";
import styles from "@/styles/components.module.scss";

export default function StarRatingRow({ label, value, onChange }) {
  return (
    <div className={styles.ratingRow}>
      <span className={styles.ratingLabel}>{label}</span>
      <div
        className={styles.ratingStars}
        role="radiogroup"
        aria-label={`${label}: ${value ?? "sin puntuar"}`}
      >
        <button
          type="button"
          className={`${styles.ratingStarBtn} ${styles.ratingZeroBtn} ${value === 0 ? styles.ratingStarBtnActive : ""}`}
          onClick={() => onChange(0)}
          aria-label={`0 estrellas para ${label}`}
          aria-pressed={value === 0}
        >
          0
        </button>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = value != null && star <= value;
          return (
            <button
              key={star}
              type="button"
              className={`${styles.ratingStarBtn} ${isFilled ? styles.ratingStarBtnActive : ""}`}
              onClick={() => onChange(star)}
              aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"} para ${label}`}
              aria-pressed={value === star}
            >
              <Star
                size={22}
                strokeWidth={1.75}
                fill={isFilled ? "currentColor" : "none"}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
