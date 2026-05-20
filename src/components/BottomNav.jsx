"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, CircleCheck, Settings, Ticket } from "lucide-react";
import { useSectionNavigation } from "@/context/SectionNavigationContext";
import styles from "@/styles/components.module.scss";

const NAV_ITEMS = [
  { href: "/para-ver", label: "Para ver", Icon: Clapperboard },
  { href: "/las-vimos", label: "Las vimos", Icon: CircleCheck },
  { href: "/hoy-vemos", label: "Hoy vemos", Icon: Ticket },
  { href: "/ajustes", label: "Ajustes", Icon: Settings },
];

export default function BottomNav({ className = "" }) {
  const pathname = usePathname();
  const { startSectionTransition } = useSectionNavigation();

  return (
    <nav
      className={`${styles.bottomNav} ${className}`.trim()}
      aria-label="Navegación principal"
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={styles.navItem}
            data-active={isActive}
            aria-current={isActive ? "page" : undefined}
            onClick={() => startSectionTransition(href)}
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
