// 票拼拼广告配置示例
// 复制本文件为 ads-config.js 并填入你的 AdSense 配置
const ADS_CONFIG = {
  enableAds: false,                      // 总开关：过审拿钱后再 true
  adClient: "ca-pub-XXXXXXXXXXXXXXXX",   // 你的 AdSense pub-id
  adSlot: "",                            // 你的广告单元 ID
  adFormat: "auto",
  debug: false                           // 生产环境设为 false
};
if (typeof window !== 'undefined') window.ADS_CONFIG = ADS_CONFIG;
