// Photos for the Condition tab: shrinking uploads so they fit in browser storage,
// the list of rooms, and three illustrated sample "before photos" for the demo house.

export const ROOMS = ["Kitchen", "Bathroom", "Living Room", "Bedroom", "Hallway", "Other"];

/** Resize a photo to at most `max` pixels wide and return it as a JPEG data URL. */
export async function compressPhoto(file: File, max = 1400, quality = 0.75) {
  const image = await createImageBitmap(file);
  const scale = Math.min(1, max / image.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

const svg = (body: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">${body}</svg>`)}`;

// A dashed red ring marks the damage in each sample photo, like an annotated move-in photo
const ring = (cx: number, cy: number, rx: number, ry: number) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#E5484D" stroke-width="6" stroke-dasharray="16 10"/>`;

const tiles = (y0: number, y1: number, size: number, fill: string, grout: string) => {
  let out = "";
  for (let y = y0; y < y1; y += size) for (let x = 0; x < 640; x += size) out += `<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" stroke="${grout}" stroke-width="3"/>`;
  return out;
};

export const SAMPLE_PHOTOS = {
  // A scratch across the kitchen counter
  kitchen: svg(
    `<rect width="640" height="480" fill="#E9E2D6"/>${tiles(20, 220, 50, "#F4EFE7", "#D8CFC1")}` +
      `<rect y="220" width="640" height="260" fill="#C9C1B4"/><rect y="220" width="640" height="20" fill="#B3AA9C"/>` +
      `<rect x="470" y="262" width="62" height="74" rx="10" fill="#FFFFFF"/><path d="M532 280h14a14 14 0 0 1 0 28h-14" fill="none" stroke="#FFFFFF" stroke-width="8"/>` +
      `<path d="M215 330 300 346 335 353 420 374" fill="none" stroke="#5E554B" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M240 341 292 352" stroke="#7D7366" stroke-width="3" stroke-linecap="round"/>${ring(318, 352, 135, 50)}`,
  ),
  // A stain on the living room carpet, in front of the sofa
  carpet: svg(
    `<rect width="640" height="480" fill="#BBA88F"/>` +
      Array.from({ length: 24 }, (_, i) => `<path d="M0 ${150 + i * 14}h640" stroke="#B19D84" stroke-width="2"/>`).join("") +
      `<rect x="60" y="0" width="520" height="120" rx="14" fill="#6C7A89"/><rect x="60" y="90" width="520" height="40" rx="10" fill="#5D6A78"/>` +
      `<rect x="90" y="130" width="18" height="26" fill="#3E3328"/><rect x="532" y="130" width="18" height="26" fill="#3E3328"/>` +
      `<ellipse cx="330" cy="320" rx="70" ry="38" fill="#7A5C3E" opacity="0.75"/><ellipse cx="365" cy="335" rx="30" ry="16" fill="#7A5C3E" opacity="0.6"/>` +
      ring(338, 324, 125, 70),
  ),
  // A chipped tile next to the shower
  tile: svg(
    `<rect width="640" height="480" fill="#F5F7F8"/>${tiles(0, 480, 80, "#F5F7F8", "#CBD2D6")}` +
      `<rect x="0" y="0" width="120" height="480" fill="#CFE3EC" opacity="0.55"/><rect x="116" y="0" width="8" height="480" fill="#AEB8BF"/>` +
      `<path d="M320 240h40l-12 18 10 14-38 8z" fill="#9AA5AB"/><path d="M322 242l30 2-10 14" fill="none" stroke="#7E8A90" stroke-width="2"/>` +
      ring(340, 262, 70, 52),
  ),
};
