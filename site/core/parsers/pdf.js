// PDF 解析：首页渲染 + 文字层元数据点收（发票号/日期，无金额 C10）
// [票拼拼修正] pdfjs-dist 4.10.38（ESM）：3.11.174 渲染真票明细区空白/乱码（CID 字体 bug），
//   4.x 修复。ESM 动态 import，worker 也指向 4.x。
import { findContentBBox, cropCanvas, canvasToJpegDataUrl } from '../crop.js';

const DPI_SCALE = 2.5; // ≈180dpi 渲染，打印文字锐利（承诺 ≥200dpi 的近似档）
let pdfjsPromise = null;
async function getPdfjs() {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = (async () => {
    const mod = await import('../../vendor/pdfjs4/pdf.min.mjs');
    mod.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs4/pdf.worker.min.mjs';
    return mod;
  })();
  return pdfjsPromise;
}

export async function parsePdf(inv) {
  const pdfjs = await getPdfjs();
  const buf = await inv.file.arrayBuffer();
  // [票拼拼修正] CID 字体 PDF（数电票）必须给 cMapUrl/cMapPacked，否则
  //   translateFont 失败 → 全部中文字形渲染空白（"信息全是空的"真因，gs 对比实证）
  const pdf = await pdfjs.getDocument({
    data: buf,
    cMapUrl: 'vendor/pdfjs4/cmaps/',
    cMapPacked: true,
  }).promise;
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
  inv.renderW = rect ? rect.w : canvas.width;
  inv.renderH = rect ? rect.h : canvas.height;

  // 文字层提取（发票号/开票日期 → 列表信息+排序）
  // [票拼拼修正] 数电票 PDF 文字层是「模板标签集中在前、值集中在后」（发票代码:…年 月 日…037002200211 69115604 2023 08 20）
  //   → 不能用 label 后跟值的正则。改为：收集标签序列 + 收集全部数字值，按顺序配对
  try {
    const text = await page.getTextContent();
    const items = text.items.map(it => it.str);
    const joined = items.join(' ');
    // 1) 标签序列（按出现顺序）
    const seq = [];
    const want = [
      { label: '发票代码', key: 'code' },
      { label: '发票号码', key: 'no' },
      { label: '开票日期', key: 'date' },
    ];
    const wanted = want.map(w => w.label);
    for (const s of items) {
      const hit = wanted.findIndex(l => s.includes(l));
      if (hit >= 0 && !seq.some(x => x.key === want[hit].key)) seq.push({ ...want[hit], at: items.indexOf(s) });
    }
    // 2) 数值序列（按出现顺序）
    const nums = [];
    for (const s of items) {
      for (const m of s.matchAll(/\d+/g)) nums.push(m[0]);
    }
    // 3) 配对：发票代码→第1个长数, 发票号码→第2个长数, 开票日期→滑动窗口找 年(4位)+月(1-2位)+日(1-2位)
    const v = {};
    // 长数字 = 代码(12)/号码(8)；短数字(≤6) 留给日期
    const longs = nums.filter(n => n.length >= 8 && n.length <= 12);
    v.code = longs[0] || '';
    v.no = longs[1] || '';
    // 日期：找连续三元组 [4位年, 1-2位月, 1-2位日]，且月 1-12 日 1-31 校验
    for (let i = 0; i < nums.length - 2; i++) {
      const y = nums[i], mo = nums[i + 1], d = nums[i + 2];
      if (/^\d{4}$/.test(y) && /^\d{1,2}$/.test(mo) && /^\d{1,2}$/.test(d)
        && +mo >= 1 && +mo <= 12 && +d >= 1 && +d <= 31 && +y >= 2000 && +y <= 2100) {
        v.date = `${y}年${mo}月${d}日`;
        break;
      }
    }
    if (v.no) inv.meta.invoiceNo = v.no;
    if (v.code) inv.meta.invoiceCode = v.code;
    if (v.date) inv.meta.issueDate = v.date;
    else {
      const d = joined.match(/开票日期[:：]?\s*(\d{4})[年-](\d{1,2})[月-](\d{1,2})日?/);
      if (d) inv.meta.issueDate = `${d[1]}年${d[2]}月${d[3]}日`;
    }
  } catch { /* 提取失败不阻塞 */ }

  await pdf.destroy?.();
  return inv;
}