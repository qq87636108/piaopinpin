// 主控制器：上传队列 / 列表 / 拖拽 / 设置 / 示例 / 打印
import { state, newInvoice, totalPages } from '../core/state.js';
import { detectAndRoute, MAX_FILES } from '../core/parsers/dispatch.js';
import { renderPreview, buildPrintPages } from '../core/preview.js';
import { initAds } from '../core/ads.js';

const $ = id => document.getElementById(id);

// ---------- 上传队列（单文件失败不阻塞，需求书 §5.1） ----------
async function processFiles(files) {
  const list = Array.from(files);
  if (state.invoices.length + list.length > MAX_FILES) {
    toast(`单次最多 ${MAX_FILES} 张，超出部分已忽略`); list.splice(MAX_FILES - state.invoices.length);
  }
  for (const f of list) {
    const inv = newInvoice(f);
    state.invoices.push(inv);
    renderAll();
    inv.status = 'parsing';
    let route;
    try {
      route = await detectAndRoute(f);
      inv.fileType = route.kind;
      const mod = await route.parser();
      await (route.kind === 'pdf' ? mod.parsePdf(inv)
        : route.kind === 'image' ? mod.parseImage(inv)
        : route.kind === 'xml' ? mod.parseXml(inv)
        : mod.parseOfd(inv));
      inv.status = 'parsed';
      inv.file = null;                 // C11 闸1：解析完成即释放原始文件引用
    } catch (e) {
      inv.status = 'error';
      inv.errorMessage = e.message || String(e);
      inv.file = null;
    }
    renderAll();
  }
}

// ---------- 列表 ----------
function renderList() {
  const box = $('invoice-list');
  $('invoice-count').textContent = state.invoices.length;
  if (!state.invoices.length) {
    box.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs">暂未上传发票 — 支持 PDF / OFD / XML / PNG / JPG</div>`;
    return;
  }
  box.innerHTML = state.invoices.map((inv, i) => {
    const badge = {
      pending: '<span class="text-slate-400">排队中</span>',
      parsing: '<span class="text-brand-600 animate-pulse">解析中…</span>',
      parsed: `<span class="text-emerald-600">${inv.fileType.toUpperCase()} · 已解析${inv.meta.invoiceNo ? ' №' + esc(inv.meta.invoiceNo.slice(-8)) : ''}</span>`,
      error: `<span class="text-rose-600" title="${esc(inv.errorMessage)}">✕ ${esc(inv.errorMessage.slice(0, 30))}</span>`,
    }[inv.status];
    const thumb = inv.previewUrl ? `<img src="${inv.previewUrl}" class="w-10 h-7 object-cover border border-slate-200 rounded bg-white flex-shrink-0">`
      : inv.previewHtml ? `<div class="w-10 h-7 border border-slate-200 rounded bg-white flex items-center justify-center text-[9px] text-slate-400 flex-shrink-0">XML</div>`
      : `<div class="w-10 h-7 border border-dashed border-slate-300 rounded bg-slate-50 flex-shrink-0"></div>`;
    return `
    <div class="flex items-center justify-between p-2.5 ${inv.status==='error'?'bg-rose-50/50 border-rose-200':'bg-slate-50 border-slate-200'} border rounded-lg text-xs" data-id="${inv.id}">
      <div class="flex items-center space-x-3 overflow-hidden">
        <i class="fa-solid text-slate-300 cursor-grab select-none">⠿</i>
        ${thumb}
        <div class="truncate max-w-[180px]">
          <p class="font-medium text-slate-800 truncate" title="${esc(inv.fileName)}">${esc(inv.fileName)}</p>
          ${badge}
        </div>
      </div>
      <button class="del-btn text-slate-400 hover:text-rose-500 p-1" data-id="${inv.id}">✕</button>
    </div>`;
  }).join('');
}

// ---------- 设置区 ----------
function renderLayoutBtns() {
  $('layout-btns').innerHTML = [1, 2, 3, 4].map(n => `
    <button type="button" data-per="${n}" class="p-2.5 rounded-lg text-center transition-all ${state.settings.perPage === n ? 'border-2 border-brand-600 bg-brand-50/50' : 'border border-slate-200 hover:border-brand-500'}">
      <div class="w-6 h-8 border border-slate-300 rounded mx-auto mb-1 bg-slate-50 grid gap-0.5 p-0.5" style="grid-template-columns:${n===4?'1fr 1fr':'1fr'}">
        ${'<div class="bg-brand-200 rounded-sm"></div>'.repeat(n)}
      </div>
      <span class="text-xs ${state.settings.perPage === n ? 'text-brand-700 font-bold' : 'text-slate-600 font-medium'}">${n} 张/页</span>
    </button>`).join('');
}

function renderAll() { renderList(); renderLayoutBtns(); renderPreview(); }

// ---------- 示例数据（自造假票 SVG，绝不使用真实票面信息） ----------
function demoData() {
  const mk = (t, no, dt) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
      <rect width="600" height="380" fill="#fff" stroke="#3b82f6" stroke-width="4" rx="8"/>
      <text x="300" y="60" font-size="24" font-weight="bold" fill="#b91c1c" text-anchor="middle">电子发票（增值税专用发票）</text>
      <text x="40" y="110" font-size="15" fill="#334155">发票号码：${no}</text>
      <text x="330" y="110" font-size="15" fill="#334155">开票日期：${dt}</text>
      <text x="40" y="150" font-size="15" fill="#334155">购买方：示例科技有限公司</text>
      <text x="40" y="180" font-size="15" fill="#334155">销售方：${esc(t)}</text>
      <rect x="40" y="210" width="520" height="90" fill="#f8fafc" stroke="#e2e8f0"/>
      <text x="60" y="265" font-size="26" font-weight="bold" fill="#2563eb">（示例数据 · 非真实发票）</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
  const rows = [['示例餐饮服务公司','245120000000100001','2026-09-12'],['示例云计算服务公司','245120000000100002','2026-09-15'],['示例出行平台','245120000000100003','2026-09-18'],['示例办公用品公司','245120000000100004','2026-09-20'],['示例酒店管理有限公司','245120000000100005','2026-09-22']];
  state.invoices = rows.map(([t, no, dt], i) => ({
    ...newInvoice({ name: `示例发票${i + 1}.svg`, type: 'image/svg+xml', size: 0 }),
    fileName: `示例-${t}.svg`, fileType: 'image', status: 'parsed',
    previewUrl: mk(t, no, dt), meta: { invoiceNo: no, issueDate: dt }, file: null,
  }));
  state.currentPreviewPage = 1;
  renderAll();
}

// ---------- 打印 ----------
function doPrint() {
  const parsed = state.invoices.filter(i => i.status === 'parsed');
  if (!parsed.length) { toast('还没有可打印的发票'); return; }
  buildPrintPages();
  setTimeout(() => window.print(), 120);
}

// ---------- 杂项 ----------
let toastTimer;
function toast(msg) {
  let el = $('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-sm px-4 py-2 rounded-lg shadow-lg z-50 no-print'; document.body.appendChild(el); }
  el.textContent = msg; el.style.opacity = 1;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.style.opacity = 0, 2600);
}
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

// ---------- 事件绑定 ----------
const dz = $('dropzone'), fi = $('file-input');
dz.addEventListener('click', () => fi.click());
fi.addEventListener('change', e => { processFiles(e.target.files); fi.value = ''; });
dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('border-brand-500', 'bg-brand-50/50'); });
dz.addEventListener('dragleave', () => dz.classList.remove('border-brand-500', 'bg-brand-50/50'));
dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('border-brand-500', 'bg-brand-50/50'); processFiles(e.dataTransfer.files); });

$('invoice-list').addEventListener('click', e => {
  const btn = e.target.closest('.del-btn');
  if (!btn) return;
  state.invoices = state.invoices.filter(i => i.id !== btn.dataset.id);
  renderAll();
});

new Sortable($('invoice-list'), {
  animation: 150,
  onEnd: ({ oldIndex, newIndex }) => {
    const [moved] = state.invoices.splice(oldIndex, 1);
    state.invoices.splice(newIndex, 0, moved);
    renderAll();
  },
});

$('layout-btns').addEventListener('click', e => {
  const b = e.target.closest('[data-per]');
  if (!b) return;
  state.settings.perPage = +b.dataset.per;
  state.currentPreviewPage = 1;
  renderAll();
});
$('margin-input').addEventListener('input', e => { state.settings.margin = +e.target.value; $('margin-val').textContent = e.target.value + 'mm'; renderPreview(); });
$('gap-input').addEventListener('input', e => { state.settings.gap = +e.target.value; $('gap-val').textContent = e.target.value + 'mm'; renderPreview(); });
$('show-cutlines').addEventListener('change', e => { state.settings.showCutLines = e.target.checked; renderPreview(); });
$('btn-prev').addEventListener('click', () => { if (state.currentPreviewPage > 1) { state.currentPreviewPage--; renderPreview(); } });
$('btn-next').addEventListener('click', () => { if (state.currentPreviewPage < totalPages()) { state.currentPreviewPage++; renderPreview(); } });
$('btn-demo').addEventListener('click', demoData);
$('btn-clear').addEventListener('click', () => { state.invoices = []; state.currentPreviewPage = 1; renderAll(); });
$('btn-print').addEventListener('click', doPrint);

renderAll();
initAds();
