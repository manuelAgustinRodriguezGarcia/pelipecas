"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";
import styles from "@/styles/components.module.scss";

export default function CopyToast({ message, visible, onDismiss }) {
  useEffect(() => {
    if (!visible) return undefined;

    const timer = window.setTimeout(() => {
      onDismiss?.();
    }, 2800);

    return () => window.clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <div
      className={`${styles.copyToast} ${visible ? styles.copyToastVisible : ""}`}
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
    >
      <Check size={16} strokeWidth={2.5} aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
