"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useMoviesContext } from "@/context/MoviesContext";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import MarkWatchedModal from "@/components/MarkWatchedModal";
import MovieDetailModal from "@/components/MovieDetailModal";

const AppUIContext = createContext(null);

export function AppUIProvider({ children }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailMovie, setDetailMovie] = useState(null);
  const [markWatchedTarget, setMarkWatchedTarget] = useState(null);

  useLockBodyScroll(Boolean(detailMovie || deleteTarget || markWatchedTarget));

  const { movies, markAsWatched, moveToPending, deleteMovie, clearPickedMovie } =
    useMoviesContext();

  const handleOpenMarkWatched = useCallback(
    (id) => {
      const movie = movies.find((item) => item.id === id);
      if (movie) {
        setMarkWatchedTarget(movie);
        setDetailMovie(null);
      }
    },
    [movies]
  );

  const handleCloseMarkWatched = useCallback(() => {
    setMarkWatchedTarget(null);
  }, []);

  const handleConfirmMarkWatched = useCallback(
    (id, ratings) => {
      markAsWatched(id, ratings);
      setMarkWatchedTarget(null);
      clearPickedMovie();
    },
    [markAsWatched, clearPickedMovie]
  );

  const handleDeleteRequest = useCallback(
    (id) => {
      const movie = movies.find((item) => item.id === id);
      if (movie) {
        setDeleteTarget({ id: movie.id, title: movie.title });
      }
    },
    [movies]
  );

  const handleCancelDelete = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMovie(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteMovie]);

  const handleSelectMovie = useCallback((movie) => {
    setDetailMovie(movie);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailMovie(null);
  }, []);

  const handleDeleteFromDetail = useCallback(
    (id) => {
      deleteMovie(id);
      setDetailMovie(null);
    },
    [deleteMovie]
  );

  const value = {
    onSelectMovie: handleSelectMovie,
    onOpenMarkWatched: handleOpenMarkWatched,
    onDelete: handleDeleteRequest,
    onMoveToPending: moveToPending,
  };

  return (
    <AppUIContext.Provider value={value}>
      {children}
      <DeleteConfirmModal
        movie={deleteTarget}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
      <MovieDetailModal
        movie={detailMovie}
        variant={detailMovie?.status === "watched" ? "watched" : "pending"}
        onClose={handleCloseDetail}
        onOpenMarkWatched={handleOpenMarkWatched}
        onMoveToPending={moveToPending}
        onDelete={handleDeleteFromDetail}
      />
      <MarkWatchedModal
        movie={markWatchedTarget}
        onClose={handleCloseMarkWatched}
        onConfirm={handleConfirmMarkWatched}
      />
    </AppUIContext.Provider>
  );
}

export function useAppUI() {
  const context = useContext(AppUIContext);
  if (!context) {
    throw new Error("useAppUI debe usarse dentro de AppUIProvider");
  }
  return context;
}
