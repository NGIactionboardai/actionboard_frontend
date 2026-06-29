export const LOGO_MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2MB, matches backend limit
export const LOGO_MAX_SOURCE_SIZE_BYTES = 15 * 1024 * 1024; // raw upload cap before we even try to process it
export const LOGO_TARGET_DIMENSION = 512; // px — logos are downscaled to fit this, never upscaled
export const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the selected image. Please try a different file.'));
    };
    img.src = url;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to process image.'))),
      type,
      quality
    );
  });

/**
 * Resizes an image file down to fit within LOGO_TARGET_DIMENSION (never upscales),
 * then letterboxes it onto a square canvas — long/wide logos get padding instead of
 * being cropped, since the logo renders inside a circle (object-cover would cut them off).
 * Re-encodes at decreasing quality until it's under LOGO_MAX_SIZE_BYTES.
 * Returns a File ready to upload.
 */
async function resizeImageFile(file) {
  const img = await loadImage(file);
  const { naturalWidth: width, naturalHeight: height } = img;

  const scale = Math.min(1, LOGO_TARGET_DIMENSION / Math.max(width, height));
  const targetWidth = Math.round(width * scale);
  const targetHeight = Math.round(height * scale);
  const squareSize = Math.max(targetWidth, targetHeight);

  const canvas = document.createElement('canvas');
  canvas.width = squareSize;
  canvas.height = squareSize;
  const ctx = canvas.getContext('2d');

  // PNG can't be re-encoded at lower quality to shrink size — fall back to JPEG if needed
  const outputType = file.type === 'image/png' || file.type === 'image/webp' ? file.type : 'image/jpeg';

  // JPEG has no alpha channel — pad with white instead of leaving (black) transparency
  if (outputType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, squareSize, squareSize);
  }

  const offsetX = Math.round((squareSize - targetWidth) / 2);
  const offsetY = Math.round((squareSize - targetHeight) / 2);
  ctx.drawImage(img, offsetX, offsetY, targetWidth, targetHeight);
  const qualities = [0.92, 0.8, 0.65, 0.5];

  let blob = null;
  for (const quality of qualities) {
    blob = await canvasToBlob(canvas, outputType, quality);
    if (blob.size <= LOGO_MAX_SIZE_BYTES) break;
  }

  if (blob.size > LOGO_MAX_SIZE_BYTES) {
    throw new Error(`Logo is still too large after resizing. Try a smaller or simpler image.`);
  }

  const ext = outputType.split('/')[1];
  return new File([blob], `logo.${ext}`, { type: outputType });
}

/**
 * Validates basic constraints and resizes the image to a sane logo size client-side.
 * Returns { file: File, error: null } or { file: null, error: string }.
 */
export async function prepareLogoFile(file) {
  if (!file) {
    return { file: null, error: 'No file selected.' };
  }

  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return { file: null, error: 'Unsupported file type. Use PNG, JPEG, WEBP, or SVG.' };
  }

  if (file.size > LOGO_MAX_SOURCE_SIZE_BYTES) {
    return { file: null, error: `That file is too large (max ${LOGO_MAX_SOURCE_SIZE_BYTES / (1024 * 1024)}MB). Please choose a smaller image.` };
  }

  // SVGs are scalable and tiny — upload as-is
  if (file.type === 'image/svg+xml') {
    return { file, error: null };
  }

  try {
    const resized = await resizeImageFile(file);
    return { file: resized, error: null };
  } catch (err) {
    return { file: null, error: err.message || 'Could not process the selected image.' };
  }
}
