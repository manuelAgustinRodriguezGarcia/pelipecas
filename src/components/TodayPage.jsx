"use client";

import { useRouter } from "next/navigation";
import { useAppUI } from "@/context/AppUIContext";
import { useMoviesContext } from "@/context/MoviesContext";
import TodayWeWatch from "@/components/TodayWeWatch";
import appStyles from "@/styles/app.module.scss";
import styles from "@/styles/components.module.scss";

export default function TodayPage() {
  const router = useRouter();
  const { onOpenMarkWatched } = useAppUI();
  const { pendingMovies, pickRandomMovie, clearPickedMovie } = useMoviesContext();

  const focusAddInput = () => {
    router.push("/para-ver");
    window.requestAnimationFrame(() => {
      const input = document.querySelector('[aria-label="Nombre de la película"]');
      input?.focus();
    });
  };

  return (
    <section
      className={`${appStyles.section} ${styles.todaySection}`}
      aria-label="Hoy vemos"
    >
      <div className={appStyles.sectionHeader}>
        <h2 className={appStyles.sectionTitle}>Hoy vemos</h2>
        <p className={`bodyText ${appStyles.sectionSubtitle}`}>
          Dejá que Pelipecas elija la próxima función.
        </p>
      </div>

      <TodayWeWatch
        pendingMovies={pendingMovies}
        pickRandomMovie={pickRandomMovie}
        clearPickedMovie={clearPickedMovie}
        onOpenMarkWatched={onOpenMarkWatched}
        onFocusAdd={focusAddInput}
      />
    </section>
  );
}
