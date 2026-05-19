"use client";

import { Clapperboard, CircleCheck, Disc3 } from "lucide-react";
import styles from "@/styles/components.module.scss";

const NAV_ITEMS = [
  { id: "pending", label: "Para ver", Icon: Clapperboard },
  { id: "watched", label: "Vistas", Icon: CircleCheck },
  { id: "roulette", label: "Ruleta", Icon: Disc3 },
];

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className={styles.bottomNav} aria-label="Navegación principal">
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            className={styles.navItem}
            data-active={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange(id)}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            </span>
            <span className={`sectionLabel ${styles.navLabel}`}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
