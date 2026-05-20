"use client";

import { useState } from "react";
import { ClipboardPaste, Share2 } from "lucide-react";
import { useMoviesContext } from "@/context/MoviesContext";
import CopyToast from "@/components/CopyToast";
import InstallAppSection from "@/components/InstallAppSection";
import {
  IMPORT_ERROR_MESSAGES,
  buildExportMessage,
  parseImportMessage,
} from "@/helpers/listShareHelpers";
import appStyles from "@/styles/app.module.scss";
import styles from "@/styles/components.module.scss";

export default function ConfigPage() {
  const { pendingMovies, watchedMovies, importMoviesFromShare } =
    useMoviesContext();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("Copiado correctamente");
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importFeedback, setImportFeedback] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(false);
    window.requestAnimationFrame(() => setToastVisible(true));
  };

  const handleExport = async () => {
    const message = buildExportMessage(pendingMovies, watchedMovies);

    try {
      await navigator.clipboard.writeText(message);
      showToast("Copiado correctamente");
    } catch {
      showToast("No se pudo copiar. Intentá de nuevo.");
    }
  };

  const handleImport = () => {
    setImportFeedback(null);
    const result = parseImportMessage(importText);

    if (!result.success) {
      setImportFeedback({
        type: "error",
        text: IMPORT_ERROR_MESSAGES[result.error] ?? IMPORT_ERROR_MESSAGES.invalid_data,
      });
      return;
    }

    const { imported, skipped } = importMoviesFromShare(result.movies);

    if (imported === 0 && skipped > 0) {
      setImportFeedback({
        type: "info",
        text: "Todas las películas del mensaje ya estaban en tu lista.",
      });
      return;
    }

    const parts = [`${imported} película${imported === 1 ? "" : "s"} importada${imported === 1 ? "" : "s"}`];
    if (skipped > 0) {
      parts.push(`${skipped} duplicada${skipped === 1 ? "" : "s"} omitida${skipped === 1 ? "" : "s"}`);
    }

    setImportFeedback({ type: "success", text: parts.join(". ") + "." });
    setImportText("");
  };

  const toggleImport = () => {
    setImportOpen((open) => !open);
    setImportFeedback(null);
  };

  return (
    <section className={appStyles.section} aria-label="Ajustes">
      <div className={appStyles.sectionHeader}>
        <h2 className={appStyles.sectionTitle}>Ajustes</h2>
        <p className={`bodyText ${appStyles.sectionSubtitle}`}>
          Copiá o importá tu cartelera para compartirla por WhatsApp.
        </p>
      </div>

      <InstallAppSection />

      <div className={styles.configCardGrid}>
        <button
          type="button"
          className={styles.configCard}
          onClick={handleExport}
        >
          <span className={styles.configCardIcon} aria-hidden="true">
            <Share2 size={22} strokeWidth={1.75} />
          </span>
          <span className={styles.configCardTitle}>Copiar lista</span>
          <span className={styles.configCardText}>
            Generá el mensaje para compartir por WhatsApp.
          </span>
        </button>
        <button
          type="button"
          className={`${styles.configCard} ${importOpen ? styles.configCardActive : ""}`}
          onClick={toggleImport}
          aria-expanded={importOpen}
        >
          <span className={styles.configCardIcon} aria-hidden="true">
            <ClipboardPaste size={22} strokeWidth={1.75} />
          </span>
          <span className={styles.configCardTitle}>Importar lista</span>
          <span className={styles.configCardText}>
            Pegá un mensaje exportado para recuperar películas.
          </span>
        </button>
      </div>

      {importOpen && (
        <div className={styles.configImportPanel}>
          <label className={styles.configImportLabel} htmlFor="import-message">
            Pegá aquí el mensaje completo que exportaste
          </label>
          <textarea
            id="import-message"
            className={styles.configImportTextarea}
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder="Incluí las listas, el enlace y la sección «Datos para la app»…"
            rows={10}
            spellCheck={false}
          />
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleImport}
            disabled={!importText.trim()}
          >
            Confirmar importación
          </button>
          {importFeedback && (
            <p
              className={
                importFeedback.type === "error"
                  ? styles.formError
                  : styles.configImportFeedback
              }
              role={importFeedback.type === "error" ? "alert" : "status"}
            >
              {importFeedback.text}
            </p>
          )}
        </div>
      )}

      <CopyToast
        message={toastMessage}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </section>
  );
}
