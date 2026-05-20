import Image from "next/image";
import styles from "@/styles/components.module.scss";

export default function AppInitialLoader() {
  return (
    <div className={styles.appInitialLoader} role="status" aria-live="polite">
      <div className={styles.appInitialLoaderLogo}>
        <Image
          src="/logo.webp"
          alt=""
          width={96}
          height={96}
          priority
          className={styles.appInitialLoaderLogoImg}
        />
      </div>
      <p className={styles.appInitialLoaderText}>Cargando tu cartelera…</p>
    </div>
  );
}
