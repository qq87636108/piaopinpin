// OFD 解析：@sharp9/ofdjs(Apache-2.0, 已 vendor 化) 渲染首页 → 裁边 → dataURL
// + CustomTags.xml 点收发票号码/开票日期（学 fapiao-print/发票酱的机制，字段名对数电票标准）
import { readOfd, renderPageToCanvas } from '../../vendor/ofdjs/index.js';
import { findContentBBox, cropCanvas, canvasToJpegDataUrl } from '../crop.js';

const RENDER_DPI = 196; // 2x 于常规 96dpi，保证打印文字锐利

export async function parseOfd(inv) {
  const buf = await inv.file.arrayBuffer();

  // 1) 渲染首页到离屏 canvas
  const ofd = await readOfd(buf);
  const canvas = document.createElement('canvas');
  await renderPageToCanvas(ofd, 0, canvas, { dpi: RENDER_DPI });

  // 2) 智能裁边（R1）
  const bbox = findContentBBox(canvas);
  const cropped = bbox ? cropCanvas(canvas, bbox) : canvas;
  // ⚠️ 第二参是 maxSide 不是 quality；传 0.92 会把 1563px 画布缩成 1px（真票踩坑）
  inv.previewUrl = canvasToJpegDataUrl(cropped);
  inv.renderW = cropped.width; inv.renderH = cropped.height;

  // 3) CustomTags 点收元数据（真票实证机制：CustomTag.xml 存字段→ObjectRef 页面对象ID，
  //    文本在 Doc_0/Tpls/Tpl_0/Content.xml 与 Doc_0/Pages/Page_0/Content.xml 的 TextObject ID 里）
  try {
    const zip = await window.JSZip.loadAsync(buf);
    const tagFile = zip.file(/Tags\/CustomTag\.xml$/)[0];
    if (tagFile) {
      const parser = new DOMParser();
      // ⚠️ 真票 CustomTag.xml 根元素是 <:eInvoice xmlns:=""> —— 非法 XML（冒号开头元素名），
      //    DOMParser 直接 parsererror。先清洗：去空命名空间声明+修正根元素名再解析
      let raw = await tagFile.async('string');
      raw = raw.replace(/<:(\w[\w-]*)/g, '<$1').replace(/xmlns:=""\s*/g, '')
        .replace(/<\/?ofd:/g, m => m.startsWith('</') ? '</' : '<');
      const tagDoc = parser.parseFromString(raw, 'application/xml');
      // ⚠️ 真票 CustomTag.xml 带命名空间前缀（<:eInvoice> 无前缀、<ofd:ObjectRef> 有前缀），
      //    querySelectorAll('InvoiceNo') 匹配不到带命名空间的元素，必须用 getElementsByTagName('*') 取本地名
      const byLocal = (name) => {
        const out = [];
        for (const el of tagDoc.getElementsByTagName('*')) {
          const local = el.localName || el.tagName.replace(/^[^:]*:/, '');
          if (local === name) out.push(el);
        }
        return out;
      };
      const refIds = (field) => byLocal(field).flatMap(f => Array.from(f.getElementsByTagName('*'))
        .filter(e => (e.localName || e.tagName).endsWith('ObjectRef')).map(r => r.textContent.trim()));
      // TextObject ID → 文本 映射表（模板层+页面层）
      const textMap = {};
      for (const entry of ['Doc_0/Tpls/Tpl_0/Content.xml', 'Doc_0/Pages/Page_0/Content.xml']) {
        const f = zip.file(entry); if (!f) continue;
        const doc = parser.parseFromString(await f.async('string'), 'application/xml');
        for (const to of doc.getElementsByTagName('*')) {
          if ((to.localName || to.tagName) !== 'TextObject') continue;
          textMap[to.getAttribute('ID')] = Array.from(to.getElementsByTagName('*'))
            .filter(e => (e.localName || e.tagName) === 'TextCode').map(t => t.textContent).join('');
        }
      }
      const pick = (field) => refIds(field).map(i => (textMap[i] || '').trim()).join('').trim();
      // 真票字段：InvoiceCode=发票代码, InvoiceNo=发票号码, IssueDate=开票日期, SellerName=销售方名称
      inv.meta.invoiceNo = pick('InvoiceNo') || pick('InvoiceCode');
      inv.meta.issueDate = pick('IssueDate');
      inv.meta.sellerName = pick('SellerName');
      inv.meta.buyerName = pick('BuyerName');
    }
  } catch (_) { /* 元数据点收是锦上添花，失败不拦渲染 */ }

  // 4) 文件名兜底（数电票下载文件名常含票号）
  if (!inv.meta.invoiceNo) {
    const m = inv.fileName.match(/(\d{20})/) || inv.fileName.match(/(\d{12})/);
    if (m) inv.meta.invoiceNo = m[1];
  }
  try { inv.meta.pageCount = ofd.document.pages.page.length; } catch (_) {}
  return inv;
}
