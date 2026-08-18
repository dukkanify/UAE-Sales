const MAX_VIDEO_BYTES = 12 * 1024 * 1024;

export async function persistVideoFile(file: File): Promise<string> {
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("VIDEO_TOO_LARGE");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("VIDEO_READ_FAILED"));
    };
    reader.onerror = () => reject(new Error("VIDEO_READ_FAILED"));
    reader.readAsDataURL(file);
  });
}
