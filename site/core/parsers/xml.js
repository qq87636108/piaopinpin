// XML 数电票解析（P1）：DOMParser + 字段映射；纯数据格式生成统一发票卡片（需求书 §5.2.4）
// 字段名对齐数电票标准（EInvoice 结构，参考 fapiao-print 实践）
export async function parseXml(inv) {
  let text = await inv.file.text();
  // 数电 XML 可能 GBK/带 BOM：XMLReader 编码由声明决定，File.text() 用 utf-8 先试
  let doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) {
    // 回退：数电票部分平台导出 GBK 编码
    const bytes = await inv.file.arrayBuffer();
    const gbk = new TextDecoder('gbk').decode(bytes);
    doc = new DOMParser().parseFromString(gbk, 'application/xml');
    if (doc.querySelector('parsererror')) throw new Error('XML 解析失败：文件可能损坏或编码不支持');
  }
  return buildCard(inv, doc);
}

function pick(root, names) {
  for (const n of names) {
    const el = Array.from(root.getElementsByTagName('*')).find(e => e.localName === n);
    if (el?.textContent?.trim()) return el.textContent.trim();
  }
  return '';
}

function buildCard(inv, doc) {
  inv.meta.invoiceNo = pick(doc, ['InvoiceNumber', '发票号码']);
  inv.meta.issueDate = pick(doc, ['IssueTime', 'IssueDate', '开票日期']);
  const buyer  = pick(doc, ['BuyerName', '购买方名称']);
  const seller = pick(doc, ['SellerName', '销售方名称']);
  const title  = pick(doc, ['InvoiceType', 'EInvoiceType']) || '电子发票';
  // 统一卡片模板：票面版式文字（含"价税合计"）属文件内容渲染，非工具金额功能（C10 边界）
  const totalTxt = pick(doc, ['TotalTaxWithAmount', 'TaxInclusiveTotalAmount', '价税合计']);
  const html = `
    <div class="w-[600px] text-[22px] text-slate-800" style="font-family:'SimSun','Songti SC',serif">
      <div class="border-4 border-red-600 p-6">
        <div class="text-center text-[34px] tracking-[12px] text-red-600 font-bold pb-2">电子发票（${esc(title)}）</div>
        <div class="flex justify-between text-[20px] border-b-2 border-red-600 pb-3 mb-3">
          <span>发票号码：<b>${esc(inv.meta.invoiceNo || '—')}</b></span>
          <span>开票日期：<b>${esc(inv.meta.issueDate || '—')}</b></span>
        </div>
        <table class="w-full text-[19px] border-collapse">
          <tr><td class="border border-slate-400 px-3 py-2 bg-slate-50">购买方</td><td class="border border-slate-400 px-3 py-2">${esc(buyer || '—')}</td></tr>
          <tr><td class="border border-slate-400 px-3 py-2 bg-slate-50">销售方</td><td class="border border-slate-400 px-3 py-2">${esc(seller || '—')}</td></tr>
        </table>
        <div class="border border-slate-400 mt-[-1px] px-3 py-2 text-[19px]">
          价税合计（大写）：<span class="text-[21px] font-bold">${esc(totalTxt || '（详见原件）')}</span>
        </div>
        <div class="text-center text-[15px] text-slate-500 mt-6">— 本卡片由发票 XML 数据生成 · 打印报销请以原件为准 —</div>
      </div>
    </div>`;
  inv.previewHtml = html;   // 预览走 DOM 卡片；WP4 导出 PDF 时 html2canvas 栅格化
  inv.previewUrl = '';      // XML 无位图 previewUrl
  return inv;
}
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
