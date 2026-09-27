// 文件类型嗅探：扩展名 + magic bytes 双判（需求书 §5.2），分发到各解析器
const sniff = async (file) => {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) return 'pdf';        // %PDF
  if (head[0] === 0x50 && head[1] === 0x4b) return 'zip-or-ofd';                                        // PK — OFD 或恶意伪装
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47) return 'image';      // PNG
  if (head[0] === 0xff && head[1] === 0xd8) return 'image';                                             // JPEG
  if (head[0] === 0x42 && head[1] === 0x4d) return 'image';                                             // BMP
  return 'text';
};

export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_FILES = 100;

export async function detectAndRoute(file) {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const magic = await sniff(file);

  if (file.size > MAX_FILE_BYTES) throw new Error('文件超过 20MB 限制');
  if (magic === 'text' && ext === 'xml') return { kind: 'xml', parser: () => import('./xml.js') };
  if (magic === 'text') {
    // XML 也可能无扩展名：嗅前 512B 是否 '<'
    const headStr = new TextDecoder().decode(new Uint8Array(await file.slice(0, 512).arrayBuffer())).trim();
    if (headStr.startsWith('<') || headStr.startsWith('<?xml')) return { kind: 'xml', parser: () => import('./xml.js') };
    throw new Error('不支持的文本文件');
  }
  if (magic === 'zip-or-ofd') {
    if (ext === 'ofd') return { kind: 'ofd', parser: () => import('./ofd.js') };
    // 打开 ZIP 验 OFD.xml 条目（jszip 已由 index.html 全局加载）
    const zip = await window.JSZip.loadAsync(file);
    if (zip.file('OFD.xml')) return { kind: 'ofd', parser: () => import('./ofd.js') };
    throw new Error('ZIP 包中未找到 OFD.xml，不是有效 OFD 文件');
  }
  if (magic === 'pdf' || ext === 'pdf') return { kind: 'pdf', parser: () => import('./pdf.js') };
  if (magic === 'image' || ['png', 'jpg', 'jpeg', 'bmp', 'webp'].includes(ext)) return { kind: 'image', parser: () => import('./image.js') };
  throw new Error(`不支持的格式（.${ext || '未知'}）`);
}
