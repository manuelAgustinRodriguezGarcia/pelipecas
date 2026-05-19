import { Clapperboard } from "lucide-react";
import styles from "@/styles/components.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon} aria-hidden="true">
            <Clapperboard size={22} strokeWidth={1.5} />
          </div>
          <h1 className="logo">Pelipecas</h1>
        </div>
        <p className={`bodyText ${styles.subtitle}`}>
          Tu cartelera personal de películas.
        </p>
      </div>
    </header>
  );
}

