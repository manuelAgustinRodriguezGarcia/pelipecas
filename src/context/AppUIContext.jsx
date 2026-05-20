"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { useModalCloseAnimation } from "@/hooks/useModalCloseAnimation";
import { useMoviesContext } from "@/context/MoviesContext";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import DetailActionConfirmModal from "@/components/DetailActionConfirmModal";
import MarkWatchedModal from "@/components/MarkWatchedModal";
import MarkWatchedSuccessModal from "@/components/MarkWatchedSuccessModal";
import MovieDetailModal from "@/components/MovieDetailModal";
import {
  getUserAverageRating,
  isRatingsComplete,
} from "@/helpers/movieHelpers";
import styles from "@/styles/components.module.scss";

const AppUIContext = createContext(null);

const MARK_WATCHED_SWAP_MS = 300;

export function AppUIProvider({ children }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailMovie, setDetailMovie] = useState(null);
  const [markWatchedTarget, setMarkWatchedTarget] = useState(null);
  const [detailActionConfirm, setDetailActionConfirm] = useState(null);
  const [markWatchedSuccess, setMarkWatchedSuccess] = useState(null);
  const [markWatchedSwapping, setMarkWatchedSwapping] = useState(false);

  const overlayOpen = Boolean(
    detailMovie || markWatchedTarget || markWatchedSuccess
  );
  const {
    isVisible: overlayVisible,
    isClosing: overlayClosing,
    requestClose: requestOverlayClose,
  } = useModalCloseAnimation(overlayOpen, () => {
    setDetailMovie(null);
    setMarkWatchedTarget(null);
    setMarkWatchedSuccess(null);
    setMarkWatchedSwapping(false);
  });

  useLockBodyScroll(
    overlayVisible ||
      Boolean(deleteTarget) ||
      Boolean(detailActionConfirm) ||
      Boolean(markWatchedSuccess)
  );

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

  const handleConfirmMarkWatched = useCallback(
    (id, ratings) => {
      const movie = movies.find((item) => item.id === id);
      if (!movie || markWatchedSwapping) return;

      setMarkWatchedSwapping(true);
      window.setTimeout(() => {
        markAsWatched(id, ratings);
        clearPickedMovie();
        setMarkWatchedTarget(null);
        setMarkWatchedSuccess({
          title: movie.title,
          averageRating: getUserAverageRating(ratings),
          posterPath: movie.posterPath,
          posterUrl: movie.posterUrl,
        });
        setMarkWatchedSwapping(false);
      }, MARK_WATCHED_SWAP_MS);
    },
    [movies, markAsWatched, clearPickedMovie, markWatchedSwapping]
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
  }, [deleteTarget, deleteMovie]);

  const handleSelectMovie = useCallback((movie) => {
    setDetailMovie(movie);
  }, []);

  const handleRequestMoveToPending = useCallback(
    (id) => {
      const movie = movies.find((item) => item.id === id);
      if (!movie) return;
      setDetailActionConfirm({
        type: "moveToPending",
        id: movie.id,
        title: movie.title,
        hasRatings: isRatingsComplete(movie.ratings),
      });
    },
    [movies]
  );

  const handleRequestDeleteFromDetail = useCallback(
    (id) => {
      const movie = movies.find((item) => item.id === id);
      if (!movie) return;
      setDetailActionConfirm({
        type: "delete",
        id: movie.id,
        title: movie.title,
        hasRatings: isRatingsComplete(movie.ratings),
      });
    },
    [movies]
  );

  const handleCancelDetailActionConfirm = useCallback(() => {
    setDetailActionConfirm(null);
  }, []);

  const handleConfirmDetailAction = useCallback(
    (action) => {
      requestOverlayClose(() => {
        if (action.type === "moveToPending") {
          moveToPending(action.id);
        } else {
          deleteMovie(action.id);
        }
      });
    },
    [moveToPending, deleteMovie, requestOverlayClose]
  );

  const handleOverlayBackdropClick = useCallback(() => {
    requestOverlayClose();
  }, [requestOverlayClose]);

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
      <DetailActionConfirmModal
        confirm={detailActionConfirm}
        onCancel={handleCancelDetailActionConfirm}
        onConfirm={handleConfirmDetailAction}
      />
      {overlayVisible && (
        <div
          className={`${styles.modalBackdrop} ${styles.modalBackdropHost} ${markWatchedSwapping ? styles.modalBackdropHostSwapping : ""} ${overlayClosing ? styles.modalBackdropClosing : ""}`}
          onClick={markWatchedSwapping ? undefined : handleOverlayBackdropClick}
          role="presentation"
        >
          {markWatchedSuccess ? (
            <MarkWatchedSuccessModal
              embedded
              swapIn
              isClosing={overlayClosing}
              success={markWatchedSuccess}
              onClose={requestOverlayClose}
            />
          ) : markWatchedTarget ? (
            <MarkWatchedModal
              embedded
              isClosing={overlayClosing || markWatchedSwapping}
              isSwapOut={markWatchedSwapping}
              movie={markWatchedTarget}
              onClose={requestOverlayClose}
              onConfirm={handleConfirmMarkWatched}
            />
          ) : (
            <MovieDetailModal
              embedded
              isClosing={overlayClosing}
              movie={detailMovie}
              variant={detailMovie?.status === "watched" ? "watched" : "pending"}
              onClose={requestOverlayClose}
              onOpenMarkWatched={handleOpenMarkWatched}
              onRequestMoveToPending={handleRequestMoveToPending}
              onRequestDeleteFromDetail={handleRequestDeleteFromDetail}
              onDelete={handleDeleteRequest}
            />
          )}
        </div>
      )}
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
