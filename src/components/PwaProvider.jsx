"use client";

import { useEffect } from "react";

export default function PwaProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;

    navigator.serviceWorker.register("/sw.js").catch(() => {});

    return undefined;
  }, []);

  return null;
}
