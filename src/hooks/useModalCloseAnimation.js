"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const MODAL_CLOSE_MS = 250;

export function useModalCloseAnimation(isOpen, onClose) {
  const [isClosing, setIsClosing] = useState(false);
  const [isPresent, setIsPresent] = useState(Boolean(isOpen));
  const afterCloseRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(isOpen);

  onCloseRef.current = onClose;

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      setIsPresent(true);
      setIsClosing(false);
      return;
    }

    if (!isOpen && isPresent && !isClosing) {
      setIsClosing(true);
    }
  }, [isOpen, isPresent, isClosing]);

  const requestClose = useCallback(
    (afterClose) => {
      if (isClosing || !isPresent) return;
      afterCloseRef.current = typeof afterClose === "function" ? afterClose : null;
      setIsClosing(true);
    },
    [isClosing, isPresent]
  );

  useEffect(() => {
    if (!isClosing) return undefined;

    const timer = window.setTimeout(() => {
      afterCloseRef.current?.();
      afterCloseRef.current = null;
      setIsClosing(false);
      setIsPresent(false);
      onCloseRef.current?.();
    }, MODAL_CLOSE_MS);

    return () => window.clearTimeout(timer);
  }, [isClosing]);

  return {
    isVisible: isPresent,
    isClosing,
    requestClose,
  };
}
