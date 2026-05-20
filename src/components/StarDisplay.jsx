import { Star, StarHalf } from "lucide-react";
import { getDisplayStarRating } from "@/helpers/movieHelpers";
import styles from "@/styles/components.module.scss";

export default function StarDisplay({ value, size = 16, className = "" }) {
  const displayValue = getDisplayStarRating(value);
  const fullStars = Math.floor(displayValue);
  const hasHalf = displayValue % 1 === 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const starProps = {
    size,
    strokeWidth: 1.75,
    "aria-hidden": true,
  };

  return (
    <div
      className={`${styles.starDisplay} ${className}`.trim()}
      role="img"
      aria-label={`${displayValue} de 5 estrellas`}
    >
      {Array.from({ length: fullStars }, (_, index) => (
        <Star key={`full-${index}`} {...starProps} fill="currentColor" />
      ))}
      {hasHalf && <StarHalf {...starProps} fill="currentColor" />}
      {Array.from({ length: emptyStars }, (_, index) => (
        <Star key={`empty-${index}`} {...starProps} fill="none" />
      ))}
    </div>
  );
}
