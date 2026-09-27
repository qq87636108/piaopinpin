// OFD 解析桩（WP3 真票实测接入）——当前给出明确降级提示，不假装支持
export async function parseOfd(inv) {
  throw new Error('OFD 解析器即将上线（正在用真实发票做兼容性验证）。当前请提供该发票的 PDF 或截图。');
}
