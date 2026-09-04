import QRCode from "qrcode";

/**
 * Generates PNG data URL and SVG string for QR Code
 */
export async function generateQrCode(text, { size = 300, darkColor = "#111827", lightColor = "#ffffff", margin = 2 } = {}) {
  if (!text) {
    throw new Error("Text or URL is required to generate QR code.");
  }

  const pngDataUrl = await QRCode.toDataURL(text, {
    width: size,
    margin,
    color: {
      dark: darkColor,
      light: lightColor
    }
  });

  const svgString = await QRCode.toString(text, {
    type: "svg",
    width: size,
    margin,
    color: {
      dark: darkColor,
      light: lightColor
    }
  });

  const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  return {
    pngDataUrl,
    svgString,
    svgUrl
  };
}
