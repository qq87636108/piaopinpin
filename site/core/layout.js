// ★唯一排版引擎（R4）：(invoices, settings) → 页面槽位坐标表（单位 mm）
// 预览、打印、导出 PDF 三通道全部消费这份坐标，杜绝"预览≠打印"
import { state, totalPages } from './state.js';

export function pageSize() {
  return state.settings.orientation === 'landscape'
    ? { w: 297, h: 210 } : { w: 210, h: 297 };
}

// 网格：1张=1x1；2张=1列2行；3张=1列3行；4张=2x2（需求书 5.5 定稿）
function grid(perPage) {
  if (perPage === 2) return { cols: 1, rows: 2 };
  if (perPage === 3) return { cols: 1, rows: 3 };
  if (perPage === 4) return { cols: 2, rows: 2 };
  return { cols: 1, rows: 1 };
}

export function computePages() {
  const { invoices, settings } = state;
  const { w, h } = pageSize();
  const m = settings.margin, gap = settings.gap, per = settings.perPage;
  const { cols, rows } = grid(per);

  const cellW = (w - 2 * m - (cols - 1) * gap) / cols;
  const cellH = (h - 2 * m - (rows - 1) * gap) / rows;

  const pages = [];
  const list = invoices.filter(i => i.status === 'parsed');
  for (let p = 0; p < totalPages(); p++) {
    const slots = [];
    for (let s = 0; s < per; s++) {
      const inv = list[p * per + s];
      if (!inv) break;
      const col = s % cols, row = Math.floor(s / cols);
      slots.push({
        invoice: inv,
        x: m + col * (cellW + gap),
        y: m + row * (cellH + gap),
        w: cellW, h: cellH,
      });
    }
    pages.push({ pageNo: p + 1, slots });
  }
  return pages;
}

// [票拼拼补丁] 裁切线：在票与票之间画虚线分割线（不是每张票描边框）
// 2张/页=1条居中横线；3张/页=2条横线（两两之间）；4张/页=1横+1竖（十字）；1张=无
export function cutLines(page) {
  const { w, h } = pageSize();
  const { settings } = state;
  const m = settings.margin, gap = settings.gap, per = settings.perPage;
  const { cols, rows } = grid(per);
  const cellW = (w - 2 * m - (cols - 1) * gap) / cols;
  const cellH = (h - 2 * m - (rows - 1) * gap) / rows;
  const lines = { h: [], v: [] }; // h=横向分割线, v=纵向分割线
  for (let r = 1; r < rows; r++) {
    const y = m + r * cellH + (r - 1) * gap + gap / 2;
    lines.h.push(y);
  }
  for (let c = 1; c < cols; c++) {
    const x = m + c * cellW + (c - 1) * gap + gap / 2;
    lines.v.push(x);
  }
  return lines;
}

// 图在槽位内 contain 居中后的实际矩形（导出 PDF / 调试用）
export function fitRect(slot, imgW, imgH) {
  const scale = Math.min(slot.w / imgW, slot.h / imgH);
  const w = imgW * scale, h = imgH * scale;
  return { x: slot.x + (slot.w - w) / 2, y: slot.y + (slot.h - h) / 2, w, h };
}
