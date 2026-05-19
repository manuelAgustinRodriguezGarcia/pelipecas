import styles from "@/styles/components.module.scss";

export default function EmptyState({ icon: Icon, title, text, ctaLabel, onCtaClick, ctaIcon: CtaIcon }) {
  return (
    <div className={styles.emptyState}>
      {Icon && (
        <div className={styles.emptyIconWrap} aria-hidden="true">
          <Icon size={28} strokeWidth={1.25} />
        </div>
      )}
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={`bodyText ${styles.emptyText}`}>{text}</p>
      {ctaLabel && onCtaClick && (
        <button type="button" className={styles.emptyCta} onClick={onCtaClick}>
          {CtaIcon && <CtaIcon size={16} strokeWidth={2} aria-hidden="true" />}
          <span>{ctaLabel}</span>
        </button>
      )}
    </div>
  );
}

