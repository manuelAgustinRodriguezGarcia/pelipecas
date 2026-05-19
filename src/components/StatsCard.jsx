import { Film } from "lucide-react";
import styles from "@/styles/components.module.scss";

export default function StatsCard({ count, label, icon: Icon = Film }) {
  return (
    <div className={styles.statsCard}>
      <div className={styles.statsIconWrap} aria-hidden="true">
        <Icon size={22} strokeWidth={1.5} />
      </div>
      <div className={styles.statsContent}>
        <span className={styles.statsNumber}>{count}</span>
        <span className={styles.statsLabel}>{label}</span>
      </div>
    </div>
  );
}

