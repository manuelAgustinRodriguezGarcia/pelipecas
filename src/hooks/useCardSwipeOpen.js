"use client";

import { useEffect, useRef } from "react";

const SWIPE_THRESHOLD_PX = 48;
const SWIPE_MAX_VERTICAL_RATIO = 0.6;

function isTouchMobile() {
  return window.matchMedia("(pointer: coarse)").matches;
}

export function useCardSwipeOpen(cardRef, { onOpen, isOpen }) {
  const touchStartRef = useRef(null);

  useEffect(() => {
    const card = cardRef?.current;
    if (!card) return undefined;

    const handleTouchStart = (event) => {
      if (!isTouchMobile() || isOpen) return;

      const touch = event.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (event) => {
      if (!touchStartRef.current || !isTouchMobile() || isOpen) return;

      const touch = event.changedTouches[0];
      const deltaX = touchStartRef.current.x - touch.clientX;
      const deltaY = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (deltaX < SWIPE_THRESHOLD_PX) return;
      if (Math.abs(deltaY) > Math.abs(deltaX) * SWIPE_MAX_VERTICAL_RATIO) return;

      onOpen?.();
    };

    const handleTouchCancel = () => {
      touchStartRef.current = null;
    };

    card.addEventListener("touchstart", handleTouchStart, { passive: true });
    card.addEventListener("touchend", handleTouchEnd, { passive: true });
    card.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      card.removeEventListener("touchstart", handleTouchStart);
      card.removeEventListener("touchend", handleTouchEnd);
      card.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [cardRef, isOpen, onOpen]);
}
