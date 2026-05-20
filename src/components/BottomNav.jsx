"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, CircleCheck, Popcorn } from "lucide-react";
import styles from "@/styles/components.module.scss";

const NAV_ITEMS = [
  { href: "/para-ver", label: "Para ver", Icon: Clapperboard },
  { href: "/vistas", label: "Vistas", Icon: CircleCheck },
  { href: "/hoy-vemos", label: "Hoy vemos", Icon: Popcorn },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.bottomNav} aria-label="Navegación principal">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={styles.navItem}
            data-active={isActive}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={styles.navIcon} aria-hidden="true">
              <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
            </span>
            <span className={`sectionLabel ${styles.navLabel}`}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
