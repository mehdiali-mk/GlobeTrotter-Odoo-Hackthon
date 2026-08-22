// The dataset stores image file names. This file is the single place that maps
// those names to real assets, so swapping in the team's final images is easy.
import paris from "../assets/paris.jpg";
import tokyo from "../assets/tokyo.jpg";
import eiffel from "../assets/eiffel.jpg";
import euroTrip from "../assets/euro_trip.jpg";
import hero from "../assets/hero-globetrotter.jpg";

const imageFiles = {
  "paris.jpg": paris,
  "tokyo.jpg": tokyo,
  "eiffel.jpg": eiffel,
  "euro_trip.jpg": euroTrip,
  "hero-globetrotter.jpg": hero,
};

export const heroImage = hero;

// Returns null when the asset is not available yet, so the UI can show a
// neutral placeholder instead of an unrelated picture. Uploaded photos arrive
// as data URLs and remote images as links, so both are passed through as-is.
export function getImageUrl(fileName) {
  if (!fileName) return null;
  if (fileName.startsWith("data:") || fileName.startsWith("http")) return fileName;
  return imageFiles[fileName] || null;
}
