# 下载安装

选择适合您的版本下载使用。

## Web 应用

无需安装，直接在浏览器中使用。

<div class="download-grid">
  <div class="download-card">
    <div class="card-header stable">
      <span class="badge">Stable</span>
      <h3>Web 稳定版</h3>
    </div>
    <p>经过充分测试的稳定版本，推荐日常使用。</p>
    <a href="./webapp/" class="download-btn">打开 Web 应用</a>
  </div>
  
  <div class="download-card">
    <div class="card-header beta">
      <span class="badge">Beta</span>
      <h3>Web 测试版</h3>
    </div>
    <p>包含最新功能，每次代码更新自动发布。</p>
    <a href="./webapp-dev/" class="download-btn secondary">打开 Beta 版</a>
  </div>
</div>

## DWEB 应用

运行在 DWEB 浏览器中的原生应用，提供更好的安全性和用户体验。

::: tip 前置要求
使用 DWEB 版本需要先安装 [DWEB 浏览器](https://dweb.waterbang.top)
:::

<div class="download-grid">
  <div class="download-card">
    <div class="card-header stable">
      <span class="badge">Stable</span>
      <h3>DWEB 稳定版</h3>
    </div>
    <p>经过充分测试的稳定版本，推荐日常使用。</p>
    <a href="dweb://install?url=https://github.com/BioforestChain/KeyApp/releases/latest/download/bfmpay-dweb.zip" class="download-btn">安装到 DWEB</a>
    <a href="https://github.com/BioforestChain/KeyApp/releases/latest/download/bfmpay-dweb.zip" class="download-link">下载 ZIP 文件</a>
  </div>
  
  <div class="download-card">
    <div class="card-header beta">
      <span class="badge">Beta</span>
      <h3>DWEB 测试版</h3>
    </div>
    <p>包含最新功能，每次代码更新自动发布。</p>
    <a href="dweb://install?url=https://github.com/BioforestChain/KeyApp/releases/download/beta/bfmpay-dweb-beta.zip" class="download-btn secondary">安装 Beta 版</a>
    <a href="https://github.com/BioforestChain/KeyApp/releases/download/beta/bfmpay-dweb-beta.zip" class="download-link">下载 ZIP 文件</a>
  </div>
</div>

## 版本说明

| 版本 | 更新频率 | 稳定性 | 适用场景 |
|------|----------|--------|----------|
| **Stable** | 手动发布 | 高 | 日常使用 |
| **Beta** | 每次 push main | 中 | 尝鲜新功能 |

## DWEB vs Web

| 特性 | Web 应用 | DWEB 应用 |
|------|----------|-----------|
| 安装方式 | 无需安装 | 需安装 DWEB 浏览器 |
| 私钥存储 | 浏览器 LocalStorage | 系统级安全存储 |
| 离线支持 | 有限 | 完整支持 |
| 推送通知 | 不支持 | 支持 |
| 性能 | 良好 | 更优 |

<style>
.download-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin: 24px 0;
}

.download-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
}

.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.card-header.stable .badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.card-header.beta .badge {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.download-card p {
  color: var(--vp-c-text-2);
  margin: 0 0 16px 0;
  font-size: 14px;
}

.download-btn {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white !important;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none !important;
  font-weight: 600;
  font-size: 14px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.download-btn.secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
}

.download-btn.secondary:hover {
  box-shadow: 0 8px 24px rgba(107, 114, 128, 0.4);
}

.download-link {
  display: block;
  margin-top: 12px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}
</style>
