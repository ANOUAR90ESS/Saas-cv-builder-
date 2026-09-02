// Saving a generated file from inside the Android shell.
//
// On the web, pdfExport and docxExport hand the browser a blob URL on an
// `<a download>` and let it do the rest. Android's WebView does not implement
// that path: the tap does nothing, no save prompt appears, and the export
// looks to the user like the app has frozen. Writing the bytes to the app's
// cache with Filesystem and passing the resulting file:// URI to the system
// share sheet is the route that actually reaches other apps — mail, Drive,
// the file manager — which is what someone exporting a CV is trying to do.
//
// Both plugins are imported here rather than at the call sites so the web
// build never pulls them in: the exporters load this module only when
// Capacitor reports a native platform.
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

/**
 * Writes base64 file data to the cache directory and offers it to the OS.
 * Cache rather than Documents: the file only has to survive long enough for
 * the share sheet to hand it on, and Android reclaims the space by itself.
 */
export async function saveAndShareFile(filename, base64Data, mimeType) {
  const { uri } = await Filesystem.writeFile({
    path: filename,
    data: base64Data,
    directory: Directory.Cache,
  });
  await Share.share({
    title: filename,
    // Android resolves the handling app from the file itself; the MIME type is
    // passed for the platforms and targets that read it from the intent.
    url: uri,
    dialogTitle: filename,
  });
}

/** Blob → bare base64 (no data: prefix), which is what Filesystem expects. */
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
