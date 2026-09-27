// 广告位（C8/C9，docs/03）：ads-config.js 本站自托管配置驱动；关/未配置=零请求零痕迹
export function initAds() {
  const cfg = window.ADS_CONFIG;
  const slot = document.getElementById('ad-slot');
  if (!cfg) { slot.remove(); return; }           // 配置缺失：静默移除，不留空洞
  if (!cfg.enableAds || !/^ca-pub-\d{16}$/.test(cfg.adClient || '')) {
    if (cfg.debug) {
      slot.classList.remove('hidden');
      slot.innerHTML = '<p class="text-xs text-slate-400">广告位（未启用）— enableAds=' + !!cfg.enableAds + ', adClient 未配置或不合法</p>';
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
