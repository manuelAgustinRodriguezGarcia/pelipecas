export const REVEAL_CARD_GAP = 12;
export const REVEAL_MIN_ITEMS = 28;
export const REVEAL_TARGET_INDEX = 22;
export const REVEAL_ROLL_MS = 3600;

export function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function buildRevealItems(pendingMovies, selectedMovie) {
  if (pendingMovies.length === 0) {
    return { items: [], targetIndex: 0 };
  }

  const repeated = [];
  while (repeated.length < REVEAL_MIN_ITEMS) {
    repeated.push(...shuffleArray(pendingMovies));
  }

  const targetIndex = Math.min(
    repeated.length - 6,
    Math.max(REVEAL_TARGET_INDEX, Math.floor(repeated.length / 2))
  );
  repeated[targetIndex] = selectedMovie;

  return { items: repeated, targetIndex };
}

export function buildIdlePreviewItems(pendingMovies, count = 10) {
  if (pendingMovies.length === 0) return [];

  const items = [];
  while (items.length < count) {
    items.push(...pendingMovies);
  }

  return items.slice(0, count);
}

export function pickRandomPendingMovie(pendingMovies) {
  if (pendingMovies.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * pendingMovies.length);
  return pendingMovies[randomIndex];
}

export function getRevealStride(cardWidth, gap = REVEAL_CARD_GAP) {
  return cardWidth + gap;
}

export function calculateRevealOffsets(
  containerWidth,
  targetIndex,
  cardWidth,
  gap = REVEAL_CARD_GAP
) {
  const stride = getRevealStride(cardWidth, gap);
  const containerCenter = containerWidth / 2;
  const targetCenter = targetIndex * stride + cardWidth / 2;
  const finalOffset = containerCenter - targetCenter;
  const travelItems = 10;
  const initialOffset = finalOffset + travelItems * stride;

  return { initialOffset, finalOffset };
}

export function measureRevealStripMetrics(strip, targetIndex = 0) {
  if (!strip?.children?.length) return null;

  const viewport = strip.parentElement;
  if (!viewport) return null;

  const targetCard = strip.children[targetIndex] ?? strip.children[0];
  const cardWidth = targetCard.getBoundingClientRect().width;
  const styles = window.getComputedStyle(strip);
  const gap = Number.parseFloat(styles.columnGap || styles.gap) || REVEAL_CARD_GAP;

  return {
    containerWidth: viewport.getBoundingClientRect().width,
    cardWidth,
    gap,
  };
}
