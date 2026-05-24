export const REVEAL_CARD_GAP = 12;
export const REVEAL_MIN_ITEMS = 28;
export const REVEAL_MIN_DURATION_MS = 3000;
export const REVEAL_ROLL_MS = 3600;

/** Cuatro patrones de giro: distancia, velocidad, curva y sentido del deslizamiento. */
export const REVEAL_MOTION_PATTERNS = [
  {
    id: "long-cruise",
    travelItems: 14,
    durationMs: 4200,
    easing: "cubic-bezier(0.08, 0.72, 0.12, 1)",
    direction: "fromRight",
  },
  {
    id: "quick-snap",
    travelItems: 6,
    durationMs: 3200,
    easing: "cubic-bezier(0.33, 1, 0.68, 1)",
    direction: "fromRight",
  },
  {
    id: "wide-sweep",
    travelItems: 18,
    durationMs: 3800,
    easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
    direction: "fromLeft",
  },
  {
    id: "dramatic-drift",
    travelItems: 11,
    durationMs: 4800,
    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
    direction: "fromLeft",
  },
];

export function getRevealMotionPattern(index) {
  const safeIndex =
    ((index % REVEAL_MOTION_PATTERNS.length) + REVEAL_MOTION_PATTERNS.length) %
    REVEAL_MOTION_PATTERNS.length;
  const pattern = REVEAL_MOTION_PATTERNS[safeIndex];

  return {
    ...pattern,
    durationMs: Math.max(REVEAL_MIN_DURATION_MS, pattern.durationMs),
  };
}

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

  const shuffledPool = shuffleArray(pendingMovies);
  const repeated = [];

  while (repeated.length < REVEAL_MIN_ITEMS) {
    repeated.push(...shuffleArray(shuffledPool));
  }

  const minTarget = Math.max(8, Math.floor(repeated.length * 0.32));
  const maxTarget = Math.min(repeated.length - 6, Math.floor(repeated.length * 0.72));
  const targetIndex =
    minTarget +
    Math.floor(Math.random() * Math.max(1, maxTarget - minTarget + 1));

  repeated[targetIndex] = selectedMovie;

  return { items: repeated, targetIndex };
}

export function buildIdlePreviewItems(pendingMovies, count = 10) {
  if (pendingMovies.length === 0) return [];

  const shuffled = shuffleArray(pendingMovies);
  const items = [];

  while (items.length < count) {
    items.push(...shuffleArray(shuffled));
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
  gap = REVEAL_CARD_GAP,
  motionPattern = REVEAL_MOTION_PATTERNS[0]
) {
  const stride = getRevealStride(cardWidth, gap);
  const containerCenter = containerWidth / 2;
  const targetCenter = targetIndex * stride + cardWidth / 2;
  const finalOffset = containerCenter - targetCenter;
  const travelItems = motionPattern?.travelItems ?? 10;
  const travel = travelItems * stride;
  const initialOffset =
    motionPattern?.direction === "fromLeft"
      ? finalOffset - travel
      : finalOffset + travel;

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
