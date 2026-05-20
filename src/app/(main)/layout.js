import { MoviesProvider } from "@/context/MoviesContext";
import AppLayout from "@/components/AppLayout";

export default function MainLayout({ children }) {
  return (
    <MoviesProvider>
      <AppLayout>{children}</AppLayout>
    </MoviesProvider>
  );
}
