"use client";

import Image from "next/image";
import { useSectionNavigation } from "@/context/SectionNavigationContext";
import styles from "@/styles/components.module.scss";

export default function SectionTransitionOverlay() {
  const { isNavigating } = useSectionNavigation();

  return (
    <div
      className={styles.sectionTransitionOverlay}
      data-visible={isNavigating}
      aria-hidden={!isNavigating}
      aria-live="polite"
    >
      <div className={styles.sectionTransitionLogo}>
        <Image
          src="/logo.webp"
          alt=""
          width={120}
          height={120}
          priority
          className={styles.sectionTransitionLogoImg}
        />
      </div>
    </div>
  );
}
