const compressImage = ({ img, type = 'image/webp' }: { img: HTMLImageElement; type?: string }) => {
  // max dimensions
  const maxWidth = 2160;
  const maxHeight = 2160;
  let width = img.width;
  let height = img.height;

  if (width > height && width > maxWidth) {
    // landscape image exceeding max width
    width = maxWidth;
    height = Math.round((maxWidth / img.width) * img.height);
  } else if (height > width && height > maxHeight) {
    // portrait image exceeding max height
    height = maxHeight;
    width = Math.round((maxHeight / img.height) * img.width);
  }

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);

  return canvas.toDataURL(type);
};

export default compressImage;
