// PDF 解析：首页渲染 + 文字层元数据点收（发票号/日期，无金额 C10）
import { findContentBBox, cropCanvas, canvasToJpegDataUrl } from '../crop.js';

const DPI_SCALE = 2.5; // ≈180dpi 渲染，打印文字锐利（承诺 ≥200dpi 的近似档）

export async function parsePdf(inv) {
  const buf = await inv.file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  inv.pageCount = pdf.numPages;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: DPI_SCALE });
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width; canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;

  inv.rawUrl = canvas.toDataURL('image/jpeg', 0.95);
  const rect = findContentBBox(canvas);
  inv.cropRect = rect;
  inv.previewUrl = canvasToJpegDataUrl(cropCanvas(canvas, rect));

  // 文字层提取（发票号/开票日期 → 列表信息+排序）
  try {
    const text = await page.getTextContent();
    const joined = text.items.map(it => it.str).join(' ');
    const no = joined.match(/发票号码[:：]?\s*(\d{8,20})/);
    const dt = joined.match(/开票日期[:：]?\s*(\d{4}[年-]\d{1,2}[月-]\d{1,2}日?)/);
    if (no) inv.meta.invoiceNo = no[1];
    if (dt) inv.meta.issueDate = dt[1];
  } catch { /* 提取失败不阻塞 */ }

  await pdf.destroy?.();
  return inv;
}
