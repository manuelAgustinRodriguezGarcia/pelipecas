"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CircleCheck, Clapperboard, EllipsisVertical, Trash2 } from "lucide-react";
import { useCardSwipeOpen } from "@/hooks/useCardSwipeOpen";
import styles from "@/styles/components.module.scss";

const MENU_ANIMATION_MS = 220;

function stopCardClick(event) {
  event.stopPropagation();
}

export default function MovieCardActionMenu({
  cardRef,
  movieId,
  movieTitle,
  variant,
  onSelectMovie,
  onMoveToPending,
  onDelete,
  onSwipeOpen,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const isVisible = isOpen || isClosing;

  const openMenu = useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
    onSwipeOpen?.();
  }, [onSwipeOpen]);

  const closeMenu = useCallback(() => {
    if (!isOpen || isClosing) return;
    setIsClosing(true);
  }, [isOpen, isClosing]);

  useCardSwipeOpen(cardRef, { onOpen: openMenu, isOpen: isVisible });

  useEffect(() => {
    if (!isClosing) return undefined;

    const timer = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, MENU_ANIMATION_MS);

    return () => window.clearTimeout(timer);
  }, [isClosing]);

  useEffect(() => {
    if (!isVisible) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeMenu();
    };

    const handlePointerDown = (event) => {
      const target = event.target;
      if (
        panelRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      closeMenu();

      const card = triggerRef.current?.closest("article");
      if (card?.contains(target)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [isVisible, closeMenu]);

  const handlePrimaryAction = (event) => {
    stopCardClick(event);
    if (variant === "pending") {
      onSelectMovie?.();
    } else {
      onMoveToPending?.(movieId);
    }
    closeMenu();
  };

  const handleDelete = (event) => {
    stopCardClick(event);
    onDelete?.(movieId);
    closeMenu();
  };

  const primaryLabel =
    variant === "pending"
      ? `La vimos: ${movieTitle}`
      : `Mover ${movieTitle} a para ver`;

  return (
    <>
      <div className={styles.cardActions}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.cardMenuTrigger}
          onClick={(event) => {
            stopCardClick(event);
            if (isOpen) closeMenu();
            else openMenu();
          }}
          aria-label={`Acciones para ${movieTitle}`}
          aria-expanded={isOpen && !isClosing}
          aria-haspopup="true"
        >
          <EllipsisVertical size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {isVisible && (
        <>
          <button
            type="button"
            className={`${styles.cardMenuOverlay} ${isClosing ? styles.cardMenuOverlayClosing : ""}`}
            onClick={(event) => {
              stopCardClick(event);
              closeMenu();
            }}
            aria-label="Cerrar menú"
          />
          <div
            ref={panelRef}
            className={`${styles.cardMenuPanel} ${isClosing ? styles.cardMenuPanelClosing : ""}`}
            role="menu"
            onClick={stopCardClick}
          >
            <button
              type="button"
              className={styles.cardMenuActionDanger}
              role="menuitem"
              onClick={handleDelete}
              aria-label={`Eliminar ${movieTitle}`}
            >
              <Trash2 size={20} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={styles.cardMenuActionGold}
              role="menuitem"
              onClick={handlePrimaryAction}
              aria-label={primaryLabel}
            >
              {variant === "pending" ? (
                <CircleCheck size={20} strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Clapperboard size={20} strokeWidth={1.75} aria-hidden="true" />
              )}
            </button>
          </div>
        </>
      )}
    </>
  );
}
