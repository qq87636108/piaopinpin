// 广告位（C8/C9，docs/03）：ads-config.js 本站自托管配置驱动；关/未配置=零请求零痕迹
export function initAds() {
  const cfg = window.ADS_CONFIG;
  const slot = document.getElementById('ad-slot');
  if (!cfg) { slot.remove(); return; }           // 配置缺失：静默移除，不留空洞
  if (!cfg.enableAds || !/^ca-pub-\d{13,16}$/.test(cfg.adClient || '')) {
    if (cfg.debug) {
      // 调试占位框：模拟 AdSense 自适应单位的观感（虚线灰底+标尺文案），验收布局用
      slot.classList.remove('hidden');
      slot.innerHTML = '<div class="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center" style="min-height:250px">'
        + '<div class="text-center"><p class="text-sm font-medium text-slate-400">Google AdSense 广告位（预览占位）</p>'
        + '<p class="text-xs text-slate-400 mt-1">宽=栏宽自适应 · 格式 ' + (cfg.adFormat || 'auto') + ' · enableAds=' + !!cfg.enableAds + ' · 正式广告上线前不加载外部脚本</p></div></div>';
    } else slot.remove();
    return;
  }
  slot.classList.remove('hidden');
  const ins = document.createElement('ins');
  ins.className = 'adsbygoogle';
  ins.style.display = 'block';
  ins.dataset.adClient = cfg.adClient;
  ins.dataset.adSlot = cfg.adSlot;
  ins.dataset.adFormat = cfg.adFormat || 'auto';
  ins.dataset.adLayout = 'fluid';
  slot.appendChild(ins);

  const s = document.createElement('script');
  s.async = true;
  s.crossOrigin = 'anonymous';
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${cfg.adClient}`;
  s.onerror = () => slot.remove();               // 加载失败收起容器，布局不跳
  document.head.appendChild(s);
  (window.adsbygoogle = window.adsbygoogle || []).push({});
}
