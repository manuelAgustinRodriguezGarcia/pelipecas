"use client";

import { useMoviesContext } from "@/context/MoviesContext";
import { AppUIProvider } from "@/context/AppUIContext";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import appStyles from "@/styles/app.module.scss";
import styles from "@/styles/components.module.scss";

export default function AppLayout({ children }) {
  const { isLoaded } = useMoviesContext();

  if (!isLoaded) {
    return (
      <div className={appStyles.desktopBackdrop}>
        <div className={appStyles.appShell}>
          <div className={styles.loadingShell}>Cargando tu cartelera…</div>
        </div>
      </div>
    );
  }

  return (
    <AppUIProvider>
      <div className={appStyles.desktopBackdrop}>
        <div className={appStyles.appShell}>
          <Header />
          <main className={appStyles.main}>{children}</main>
          <BottomNav />
        </div>
      </div>
    </AppUIProvider>
  );
}
