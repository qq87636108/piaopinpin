// 全局状态与 Invoice 数据模型（docs/02 §3；C10=无任何金额字段）
export const state = {
  invoices: [],            // Invoice[]
  settings: {
    perPage: 2,            // 1 | 2 | 3 | 4
    margin: 10,            // mm 页边距 5-25
    gap: 8,                // mm 卡片间距 2-20
    showCutLines: true,    // 剪切虚线
    orientation: 'portrait', // portrait | landscape（P1 暂固定纵向）
  },
  currentPreviewPage: 1,
};

let seq = 0;
export function newInvoice(file) {
  return {
    id: 'inv_' + Date.now() + '_' + (seq++),
    file,                        // 解析完成后由队列置 null 释放引用（C11 闸1）
    fileName: file.name,
    fileType: 'unknown',         // pdf | ofd | xml | image（dispatch 判定）
    mimeType: file.type || '',
    size: file.size,
    previewUrl: '',              // 裁边后的成品图 dataURL（版面/打印/导出共用）
    rawUrl: '',                  // 裁边前整页图（重裁时用），clearRaw 后清空
    thumbUrl: '',                // 列表小图
    cropRect: null,              // {x,y,w,h} px，在 raw 图上坐标系
    pageCount: 0,
    status: 'pending',           // pending | parsing | parsed | error
    errorMessage: '',
    meta: { invoiceNo: '', issueDate: '' },  // 仅用于列表展示与排序；无 amount（C10）
  };
}

export function totalPages() {
  return Math.max(1, Math.ceil(state.invoices.length / state.settings.perPage));
}
