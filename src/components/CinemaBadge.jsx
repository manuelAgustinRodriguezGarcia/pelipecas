import { CircleCheck } from "lucide-react";
import styles from "@/styles/components.module.scss";

export default function CinemaBadge({ variant = "pending", children }) {
  const variantClass =
    variant === "picked"
      ? styles.badgePicked
      : variant === "watched"
        ? styles.badgeWatched
        : styles.badgePending;

  return (
    <span className={`sectionLabel ${styles.badge} ${variantClass}`}>
      {variant === "watched" && (
        <CircleCheck size={12} strokeWidth={2} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}
