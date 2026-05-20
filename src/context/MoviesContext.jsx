"use client";

import { createContext, useContext } from "react";
import { useMovies } from "@/hooks/useMovies";

const MoviesContext = createContext(null);

export function MoviesProvider({ children }) {
  const value = useMovies();
  return (
    <MoviesContext.Provider value={value}>{children}</MoviesContext.Provider>
  );
}

export function useMoviesContext() {
  const context = useContext(MoviesContext);
  if (!context) {
    throw new Error("useMoviesContext debe usarse dentro de MoviesProvider");
  }
  return context;
}
