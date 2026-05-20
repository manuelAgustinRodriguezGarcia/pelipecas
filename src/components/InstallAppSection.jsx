"use client";

import { useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import styles from "@/styles/components.module.scss";

function isIosDevice() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

export default function InstallAppSection() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installFeedback, setInstallFeedback] = useState(null);

  useEffect(() => {
    setIsInstalled(isStandaloneMode());
    setIsIos(isIosDevice());

    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setInstallFeedback("App instalada. Abrila desde tu pantalla de inicio.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setInstallFeedback(null);

    if (!deferredPrompt) {
      setInstallFeedback(
        "Si no ves el aviso, abrí el menú del navegador (⋮) y elegí «Instalar aplicación» o «Agregar a pantalla de inicio»."
      );
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);

    if (outcome === "accepted") {
      setInstallFeedback("Instalación en curso…");
    } else {
      setInstallFeedback("Podés instalarla cuando quieras desde el menú del navegador.");
    }
  };

  if (isInstalled) {
    return (
      <div className={styles.installAppPanel}>
        <p className={styles.installAppTitle}>
          <Download size={18} strokeWidth={1.75} aria-hidden="true" />
          App en tu celular
        </p>
        <p className={styles.installAppText}>
          Pelipecas ya está instalada. Abrila desde el ícono en tu pantalla de
          inicio para usarla sin la barra del navegador.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.installAppPanel}>
      <p className={styles.installAppTitle}>
        <Download size={18} strokeWidth={1.75} aria-hidden="true" />
        Instalar en el celular
      </p>
      <p className={styles.installAppText}>
        Agregá Pelipecas a tu pantalla de inicio y usala como una app, sin la
        barra de búsqueda de Chrome.
      </p>

      {deferredPrompt && (
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={handleInstall}
        >
          <Smartphone size={16} strokeWidth={2} aria-hidden="true" />
          Instalar app
        </button>
      )}

      {isIos && (
        <ol className={styles.installAppSteps}>
          <li>Tocá el botón Compartir en Safari.</li>
          <li>Elegí «Agregar a pantalla de inicio».</li>
          <li>Confirmá con «Agregar».</li>
        </ol>
      )}

      {!isIos && !deferredPrompt && (
        <ol className={styles.installAppSteps}>
          <li>Abrí el menú de Chrome (⋮).</li>
          <li>Tocá «Instalar aplicación» o «Agregar a pantalla de inicio».</li>
          <li>Confirmá la instalación.</li>
        </ol>
      )}

      {installFeedback && (
        <p className={styles.installAppFeedback} role="status">
          {installFeedback}
        </p>
      )}
    </div>
  );
}
