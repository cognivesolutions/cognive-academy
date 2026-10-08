const tempVideoOne = new URL("../../assets/videos/temp-1.mp4", import.meta.url).href;
const tempVideoTwo = new URL("../../assets/videos/temp-2.mp4", import.meta.url).href;
const tempVideoThree = new URL("../../assets/videos/temp-3.mp4", import.meta.url).href;
const tempVideoFour = new URL("../../assets/videos/temp-4.mp4", import.meta.url).href;

const TEMP_VIDEO_LIBRARY = [
  tempVideoOne,
  tempVideoTwo,
  tempVideoThree,
  tempVideoFour,
] as const;

function hashSeed(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function isPlaceholderVideoUrl(value?: string | null) {
  if (!value) return true;

  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;

  return (
    normalized.includes("example.com") ||
    normalized.includes("dummy") ||
    normalized.includes("placeholder") ||
    normalized.includes("your-video") ||
    normalized.includes("test-video") ||
    normalized.includes("hls/undefined") ||
    normalized.includes("localhost:3000")
  );
}

export function resolveLectureVideoUrl(
  preferredVideoUrl?: string | null,
  lecture?: { id?: string; title?: string }
) {
  const normalizedPreferred = preferredVideoUrl?.trim();
  if (normalizedPreferred && !isPlaceholderVideoUrl(normalizedPreferred)) {
    return normalizedPreferred;
  }

  const seed = lecture?.id ?? lecture?.title ?? "default-lecture";
  const index = hashSeed(seed) % TEMP_VIDEO_LIBRARY.length;
  return TEMP_VIDEO_LIBRARY[index];
}
