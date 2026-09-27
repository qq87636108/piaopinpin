// 预览渲染：把 layout.js 坐标表画到屏幕 A4（1mm = PX_PER_MM px）
import { state, totalPages } from './state.js';
import { computePages, pageSize, cutLines } from './layout.js';

const PX_PER_MM = 2.6; // 595px/210mm ≈ 2.83 的近似，屏幕观感优先

export function renderPreview() {
  const canvas = document.getElementById('a4-canvas');
  const { w, h } = pageSize();
  const { settings, invoices } = state;
  const total = totalPages();
  if (state.currentPreviewPage > total) state.currentPreviewPage = total;

  canvas.style.width = `${w * PX_PER_MM}px`;
  canvas.style.height = `${h * PX_PER_MM}px`;
  canvas.style.aspectRatio = 'auto';

  document.getElementById('page-count-badge').textContent = `第 ${state.currentPreviewPage} / ${total} 页`;
  document.getElementById('page-indicator').textContent = `${state.currentPreviewPage} / ${total}`;
  document.getElementById('btn-prev').disabled = state.currentPreviewPage === 1;
  document.getElementById('btn-next').disabled = state.currentPreviewPage === total;

  const parsed = invoices.filter(i => i.status === 'parsed');
  if (!parsed.length) {
    canvas.innerHTML = `
      <div class="w-full h-full flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-xl">
        <p class="text-base font-medium text-slate-400">A4 页面拼版预览区</p>
        <p class="text-xs text-slate-400 mt-1">上传发票开始拼版</p>
      </div>`;
    return;
  }

  const pages = computePages();
  const page = pages[state.currentPreviewPage - 1];
  const S = PX_PER_MM;
  // [票拼拼补丁] 裁切线：从 cutLines() 获取分割线坐标，画全页虚线（不是每张票描边框）
  const cl = cutLines(page);
  let html = '';
  for (const slot of page.slots) {
    const inv = slot.invoice;
    const inner = inv.previewHtml
      ? `<div class="absolute inset-0 overflow-hidden bg-white"><div class="origin-top-left" style="transform:scale(${(slot.w * S) / 620});width:620px">${inv.previewHtml}</div></div>`
      : `<img src="${inv.previewUrl}" class="max-w-full max-h-full object-contain" alt="">`;
    html += `
      <div class="absolute bg-white" style="left:${slot.x * S}px;top:${slot.y * S}px;width:${slot.w * S}px;height:${slot.h * S}px">
        <div class="w-full h-full flex items-center justify-center overflow-hidden p-1">${inner}</div>
      </div>`;
  }
  if (state.settings.showCutLines) {
    for (const y of cl.h) {
      html += `<div class="absolute" style="left:0;right:0;top:${y * S}px;border-top:1px dashed #94a3b8;"></div>`;
    }
    for (const x of cl.v) {
      html += `<div class="absolute" style="top:0;bottom:0;left:${x * S}px;border-left:1px dashed #94a3b8;"></div>`;
    }
  }
  canvas.innerHTML = html;
}

// 打印页生成：与预览同源坐标 → 隐藏 print-area 的 N 张 A4（@page 210mm）
export function buildPrintPages() {
  const area = document.getElementById('print-area');
  area.innerHTML = '';
  const pages = computePages();
  for (const page of pages) {
    const div = document.createElement('div');
    div.className = 'print-a4';
    let html = '';
    for (const slot of page.slots) {
      const inv = slot.invoice;
      const inner = inv.previewHtml
        ? `<div class="print-xml-card-wrap">${inv.previewHtml}</div>`
        : `<img src="${inv.previewUrl}" class="print-img" alt="">`;
      html += `<div class="print-slot" style="left:${slot.x}mm;top:${slot.y}mm;width:${slot.w}mm;height:${slot.h}mm">${inner}</div>`;
    }
    // [票拼拼补丁] 打印时裁切线（与预览同源）
    if (state.settings.showCutLines) {
      const cl = cutLines(page);
      for (const y of cl.h) {
        html += `<div class="print-cut-h" style="top:${y}mm"></div>`;
      }
      for (const x of cl.v) {
        html += `<div class="print-cut-v" style="left:${x}mm"></div>`;
      }
    }
    div.innerHTML = html;
    area.appendChild(div);
  }
}
