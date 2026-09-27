// 图片解析：直接读图 → 裁边（票根照片通常自带背景，裁边收益大）
import { findContentBBox, cropCanvas, canvasToJpegDataUrl } from '../crop.js';

export async function parseImage(inv) {
  const url = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result); r.onerror = () => rej(new Error('图片读取失败'));
    r.readAsDataURL(inv.file);
  });
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i); i.onerror = () => rej(new Error('图片解码失败（可能损坏或格式不支持）'));
    i.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  canvas.getContext('2d').drawImage(img, 0, 0);

  inv.rawUrl = url;
  // 照片类不做激进裁边：仅裁掉四周 ≥15% 的纯白边才动手（避免把票紧贴边缘的照片裁伤）
  const rect = findContentBBox(canvas);
  if (rect && (rect.w < canvas.width * 0.85 || rect.h < canvas.height * 0.85)) {
    inv.cropRect = rect;
    inv.previewUrl = canvasToJpegDataUrl(cropCanvas(canvas, rect));
  } else {
    inv.previewUrl = canvasToJpegDataUrl(canvas);
  }
  return inv;
}
