// 票拼拼广告配置（真实现场文件；开源发布时以 ads-config.example.js 代替，真实文件不进公开仓库）
const ADS_CONFIG = {
  enableAds: false,                      // 总开关：过审拿钱后再 true（分档挂站铁律）
  adClient: "ca-pub-XXXXXXXXXXXXXXXX",   // 待填：统一 AdSense 账号 pub-id
  adSlot: "",                            // 待填：本站左栏广告单元 ID
  adFormat: "auto",
  debug: false                           // true=占位区显示诊断
};
if (typeof window !== 'undefined') window.ADS_CONFIG = ADS_CONFIG;
