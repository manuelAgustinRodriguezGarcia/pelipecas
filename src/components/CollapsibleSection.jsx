"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "@/styles/components.module.scss";

function stopPropagation(event) {
  event.stopPropagation();
}

export default function CollapsibleSection({
  title,
  titleClassName = "",
  children,
  defaultOpen = false,
  onToggle,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = (event) => {
    stopPropagation(event);
    const next = !isOpen;
    setIsOpen(next);
    onToggle?.(next);
  };

  return (
    <section className={styles.collapsibleSection} onClick={stopPropagation}>
      <button
        type="button"
        className={styles.collapsibleTrigger}
        onClick={handleToggle}
        aria-expanded={isOpen}
      >
        <span className={titleClassName || styles.detailSectionTitle}>{title}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          aria-hidden="true"
          className={`${styles.collapsibleChevron} ${isOpen ? styles.collapsibleChevronOpen : ""}`}
        />
      </button>
      <div
        className={`${styles.collapsiblePanel} ${isOpen ? styles.collapsiblePanelOpen : ""}`}
      >
        <div className={styles.collapsiblePanelInner}>{children}</div>
      </div>
    </section>
  );
}
