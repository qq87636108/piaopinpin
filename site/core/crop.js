// 智能裁边（R1 + fapiao-print 吸收参数）：扫描非白内容包围盒，留边可调
// 白色阈值 245、留边默认 3px（竞品量产值），失败静默回退整页
export const WHITE_THRESHOLD = 245;

export function findContentBBox(canvas, pad = 3) {
  const { width: w, height: h } = canvas;
  const ctx = canvas.getContext('2d');
  const data = ctx.getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = -1, maxY = -1;
  // 每行采样步长：大图降采样加速（4px 步长足够报销票识别，最坏损失 4px 边）
  const step = w > 2000 ? 2 : 1;
  for (let y = 0; y < h; y += step) {
    const row = y * w * 4;
    for (let x = 0; x < w; x += step) {
      const i = row + x * 4;
      const a = data[i + 3];
      if (a < 10) continue; // 透明像素忽略
      if (data[i] < WHITE_THRESHOLD || data[i + 1] < WHITE_THRESHOLD || data[i + 2] < WHITE_THRESHOLD) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;                       // 全白：不裁
  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  if (bw > w * 0.98 && bh > h * 0.98) return null; // 内容几乎占满：不裁
  return {
    x: Math.max(0, minX - pad),
    y: Math.max(0, minY - pad),
    w: Math.min(w - Math.max(0, minX - pad), bw + pad * 2),
    h: Math.min(h - Math.max(0, minY - pad), bh + pad * 2),
  };
}

export function cropCanvas(sourceCanvas, rect) {
  if (!rect) return sourceCanvas;
  const out = document.createElement('canvas');
  out.width = rect.w; out.height = rect.h;
  out.getContext('2d').drawImage(sourceCanvas, rect.x, rect.y, rect.w, rect.h, 0, 0, rect.w, rect.h);
  return out;
}

// 成品图统一压 JPEG（白底）控制体积：版面/打印/导出共用这一张
// ⚠️ 必须无条件铺白底：OFD 渲染画布是透明的，不铺白 → JPEG 透明区变黑（真票踩坑）
export function canvasToJpegDataUrl(canvas, maxSide = 2200, quality = 0.92) {
  let c = canvas;
  const scale = Math.min(1, maxSide / Math.max(canvas.width, canvas.height));
  if (scale < 1) {
    c = document.createElement('canvas');
    c.width = Math.round(canvas.width * scale);
    c.height = Math.round(canvas.height * scale);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(canvas, 0, 0, c.width, c.height);
  }
  const out = document.createElement('canvas');
  out.width = c.width; out.height = c.height;
  const octx = out.getContext('2d');
  octx.fillStyle = '#fff'; octx.fillRect(0, 0, out.width, out.height);
  octx.drawImage(c, 0, 0);
  return out.toDataURL('image/jpeg', quality);
}
