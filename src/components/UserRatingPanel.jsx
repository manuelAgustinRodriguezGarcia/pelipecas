"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  RATING_CATEGORIES,
  getUserAverageRating,
  isRatingsComplete,
} from "@/helpers/movieHelpers";
import StarDisplay from "./StarDisplay";
import styles from "@/styles/components.module.scss";

function stopPropagation(event) {
  event.stopPropagation();
}

export default function UserRatingPanel({ ratings, compact = false }) {
  const [detailOpen, setDetailOpen] = useState(false);

  if (!isRatingsComplete(ratings)) return null;

  const average = getUserAverageRating(ratings);
  if (average == null) return null;

  const starSize = compact ? 14 : 16;

  return (
    <div
      className={`${styles.userRatingPanel} ${compact ? styles.userRatingPanelCompact : ""}`}
      onClick={stopPropagation}
      onKeyDown={stopPropagation}
    >
      <div className={styles.userRatingHighlight}>
        <span className={styles.userRatingLabel}>Calificación</span>
        <span className={styles.userRatingScore}>{average.toFixed(1)}</span>
      </div>
      <StarDisplay value={average} size={starSize} />
      <button
        type="button"
        className={styles.userRatingDetailToggle}
        onClick={(event) => {
          stopPropagation(event);
          setDetailOpen((open) => !open);
        }}
        aria-expanded={detailOpen}
      >
        <span>Ver calificación detallada</span>
        <ChevronDown
          size={16}
          strokeWidth={1.75}
          aria-hidden="true"
          className={`${styles.collapsibleChevron} ${detailOpen ? styles.collapsibleChevronOpen : ""}`}
        />
      </button>
      <div
        className={`${styles.collapsiblePanel} ${detailOpen ? styles.collapsiblePanelOpen : ""}`}
      >
        <div className={styles.collapsiblePanelInner}>
          <ul className={styles.userRatingDetailList}>
            {RATING_CATEGORIES.map((category) => (
              <li key={category.key} className={styles.userRatingDetailItem}>
                <span className={styles.userRatingDetailLabel}>{category.label}</span>
                <StarDisplay value={ratings[category.key]} size={starSize} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
