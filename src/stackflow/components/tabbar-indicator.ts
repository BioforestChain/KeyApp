export function normalizeTabbarProgress(progress: number): number {
  if (!Number.isFinite(progress)) {
    return 0;
  }

  if (progress <= 0) {
    return 0;
  }

  if (progress >= 1) {
    return 1;
  }

  return progress;
}

export function deriveTabbarIconOpacity(input: {
  progress: number;
  pageCount: number;
  index: number;
}): number {
  const { progress, pageCount, index } = input;

  if (pageCount <= 1) {
    return 1;
  }

  const maxIndex = pageCount - 1;
  const indexProgress = normalizeTabbarProgress(progress) * maxIndex;
  const distance = Math.abs(indexProgress - index);
  const opacity = 1 - distance;

  if (!Number.isFinite(opacity)) {
    return 0;
  }

  return Math.max(0, Math.min(1, opacity));
}
