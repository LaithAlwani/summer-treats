// Compress/resize an image in the browser before upload. Phone photos are
// often 3-8 MB; this shrinks them to a few hundred KB with little visible loss.

export type CompressResult = { blob: Blob; type: string };

export async function compressImage(
  file: File,
  opts?: { maxDim?: number; quality?: number },
): Promise<CompressResult> {
  const maxDim = opts?.maxDim ?? 1400;
  const quality = opts?.quality ?? 0.82;

  // Decode, respecting EXIF orientation so phone photos aren't sideways.
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    bitmap = await createImageBitmap(file);
  }

  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close?.();
    return { blob: file, type: file.type };
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );

  // Fall back to the original if compression failed or didn't help.
  if (!blob || blob.size >= file.size) {
    return { blob: file, type: file.type };
  }
  return { blob, type: "image/jpeg" };
}
