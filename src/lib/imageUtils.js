/**
 * Client-side image manipulation utilities for DexaCV
 * Operates strictly locally in the browser with Canvas API
 */

export function loadImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image file."));
    };
    img.src = url;
  });
}

/**
 * Compress an image file using Canvas API
 */
export async function compressImage(file, { quality = 0.8, maxWidth = 1920, maxHeight = 1920, targetSizeKB = null } = {}) {
  const originalSize = file.size;
  const img = await loadImage(file);

  let { width, height } = img;

  // Scale down if dimensions exceed bounds
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // Fill white for transparent images if converting to JPEG
  const mimeType = file.type === "image/png" && !targetSizeKB ? "image/png" : "image/jpeg";
  if (mimeType === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(img, 0, 0, width, height);

  let currentQuality = quality;
  let blob = await new Promise((res) => canvas.toBlob(res, mimeType, currentQuality));

  // If user requested target size, iteratively reduce quality
  if (targetSizeKB && blob.size > targetSizeKB * 1024) {
    for (let q = currentQuality - 0.15; q >= 0.2; q -= 0.15) {
      const candidateBlob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", q));
      blob = candidateBlob;
      currentQuality = q;
      if (blob.size <= targetSizeKB * 1024) break;
    }
  }

  const compressedSize = blob.size;
  const savedBytes = Math.max(0, originalSize - compressedSize);
  const savedPercent = originalSize > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

  return {
    blob,
    url: URL.createObjectURL(blob),
    originalSize,
    compressedSize,
    savedBytes,
    savedPercent,
    width,
    height,
    quality: Math.round(currentQuality * 100)
  };
}

/**
 * Resize image with preset or custom dimensions
 */
export async function resizeImage(file, { width, height, maintainAspect = true, format = "image/jpeg", quality = 0.9 } = {}) {
  const img = await loadImage(file);
  let targetWidth = parseInt(width, 10);
  let targetHeight = parseInt(height, 10);

  if (maintainAspect) {
    const origRatio = img.width / img.height;
    if (targetWidth && !targetHeight) {
      targetHeight = Math.round(targetWidth / origRatio);
    } else if (targetHeight && !targetWidth) {
      targetWidth = Math.round(targetHeight * origRatio);
    } else if (targetWidth && targetHeight) {
      // Pick the dimension that fits best
      const widthRatio = targetWidth / img.width;
      const heightRatio = targetHeight / img.height;
      const scale = Math.min(widthRatio, heightRatio);
      targetWidth = Math.round(img.width * scale);
      targetHeight = Math.round(img.height * scale);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");

  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  // Smooth resampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const blob = await new Promise((res) => canvas.toBlob(res, format, quality));
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: targetWidth,
    height: targetHeight,
    size: blob.size
  };
}

/**
 * Convert Image between JPG, PNG, WEBP
 */
export async function convertImage(file, targetFormat = "image/jpeg", quality = 0.92) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");

  if (targetFormat === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const blob = await new Promise((res) => canvas.toBlob(res, targetFormat, quality));
  let ext = "jpg";
  if (targetFormat === "image/png") ext = "png";
  if (targetFormat === "image/webp") ext = "webp";

  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size,
    extension: ext
  };
}

/**
 * Crop image to specific bounding box { x, y, width, height }
 */
export async function cropImage(file, cropRect, format = "image/png") {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = cropRect.width;
  canvas.height = cropRect.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    img,
    cropRect.x,
    cropRect.y,
    cropRect.width,
    cropRect.height,
    0,
    0,
    cropRect.width,
    cropRect.height
  );

  const blob = await new Promise((res) => canvas.toBlob(res, format, 0.95));
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: cropRect.width,
    height: cropRect.height,
    size: blob.size
  };
}

/**
 * Signature Image Cleaner:
 * Takes a photo of a pen signature on paper, strips the gray paper background
 * and shadows, and outputs a crisp transparent PNG signature.
 */
export async function cleanSignature(file, { threshold = 160, makePureBlack = true } = {}) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Process pixels
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Luminance formula
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum > threshold) {
      // Paper background -> transparent
      data[i + 3] = 0;
    } else {
      // Ink pixel
      // Smooth alpha transition near threshold
      const alpha = Math.min(255, Math.round(((threshold - lum) / 40) * 255));
      data[i + 3] = alpha;

      if (makePureBlack) {
        data[i] = 18;     // Deep ink blue-black
        data[i + 1] = 24;
        data[i + 2] = 38;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
  return {
    blob,
    url: URL.createObjectURL(blob),
    width: canvas.width,
    height: canvas.height,
    size: blob.size
  };
}

/**
 * Remove or Replace Image Background (Profile Photo or Object)
 * Color difference thresholding with soft edge feathering
 */
export async function removeImageBackground(file, { tolerance = 35, targetColor = "transparent" } = {}) {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Sample corner background color (top-left, top-right, bottom-left)
  const sampleR = Math.round((data[0] + data[(canvas.width - 1) * 4] + data[(canvas.height - 1) * canvas.width * 4]) / 3);
  const sampleG = Math.round((data[1] + data[(canvas.width - 1) * 4 + 1] + data[(canvas.height - 1) * canvas.width * 4 + 1]) / 3);
  const sampleB = Math.round((data[2] + data[(canvas.width - 1) * 4 + 2] + data[(canvas.height - 1) * canvas.width * 4 + 2]) / 3);

  const distSqMax = (tolerance * 2.55) ** 2;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - sampleR;
    const dg = data[i + 1] - sampleG;
    const db = data[i + 2] - sampleB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq < distSqMax) {
      if (targetColor === "transparent") {
        data[i + 3] = 0;
      } else if (targetColor === "white") {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      } else if (targetColor === "blue") {
        data[i] = 240;
        data[i + 1] = 244;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const format = targetColor === "transparent" ? "image/png" : "image/jpeg";
  const blob = await new Promise((res) => canvas.toBlob(res, format, 0.95));

  return {
    blob,
    url: URL.createObjectURL(blob),
    size: blob.size,
    width: canvas.width,
    height: canvas.height
  };
}
