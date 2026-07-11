const MAX_EDGE = 960;
const JPEG_QUALITY = 0.72;
const MAX_IMAGES = 6;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    image.src = src;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

async function fileToDataUrl(file: File): Promise<string> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_EDGE / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("تعذر معالجة الصورة");
    }
    context.drawImage(image, 0, 0, width, height);
    return canvasToDataUrl(canvas);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function persistImageFiles(files: File[]): Promise<string[]> {
  const selected = files.slice(0, MAX_IMAGES);
  return Promise.all(selected.map((file) => fileToDataUrl(file)));
}
