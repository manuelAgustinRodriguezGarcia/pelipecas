import styles from "@/styles/components.module.scss";

export default function IconButton({ label, icon, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={`${styles.iconButton} ${className}`}
      onClick={onClick}
      aria-label={label}
    >
      {icon}
    </button>
  );
}
