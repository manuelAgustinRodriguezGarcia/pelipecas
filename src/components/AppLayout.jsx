"use client";

import { usePathname } from "next/navigation";
import { useMoviesContext } from "@/context/MoviesContext";
import { AppUIProvider } from "@/context/AppUIContext";
import { SectionNavigationProvider } from "@/context/SectionNavigationContext";
import AppInitialLoader from "@/components/AppInitialLoader";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import SectionTransitionOverlay from "@/components/SectionTransitionOverlay";
import appStyles from "@/styles/app.module.scss";

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const { isLoaded } = useMoviesContext();

  if (!isLoaded) {
    return (
      <div className={appStyles.desktopBackdrop}>
        <AppInitialLoader />
      </div>
    );
  }

  return (
    <SectionNavigationProvider>
      <AppUIProvider>
        <div className={appStyles.desktopBackdrop}>
          <div className={appStyles.appShell}>
            <div className={appStyles.shellHeader}>
              <Header />
            </div>
            <BottomNav className={appStyles.shellNav} />
            <div className={appStyles.appBody}>
              <div className={appStyles.mainWrap}>
                <SectionTransitionOverlay />
                <main className={appStyles.main}>
                  <div key={pathname} className={appStyles.mainContent}>
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </div>
        </div>
      </AppUIProvider>
    </SectionNavigationProvider>
  );
}
