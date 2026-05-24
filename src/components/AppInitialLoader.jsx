import Image from "next/image";
import styles from "@/styles/components.module.scss";

const LOADER_LOGO_SIZE = 220;

export default function AppInitialLoader() {
  return (
    <div className={styles.appInitialLoader} role="status" aria-live="polite">
      <div className={styles.appInitialLoaderCenter}>
        <div className={styles.appInitialLoaderLogo}>
          <Image
            src="/icono-app.png"
            alt=""
            width={LOADER_LOGO_SIZE}
            height={LOADER_LOGO_SIZE}
            priority
            sizes={`${LOADER_LOGO_SIZE}px`}
            className={styles.appInitialLoaderLogoImg}
          />
        </div>
      </div>
    </div>
  );
}
