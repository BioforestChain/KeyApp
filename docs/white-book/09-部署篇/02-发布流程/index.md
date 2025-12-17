# 第二十七章：发布流程

> Web、DWEB、版本管理

---

## 27.1 版本号规范

```
v{major}.{minor}.{patch}[-{prerelease}]

示例：
v1.0.0        # 正式版
v1.1.0-beta   # 测试版
v1.1.0-rc.1   # 候选版
```

---

## 27.2 发布检查清单

- [ ] 所有测试通过
- [ ] 更新版本号
- [ ] 更新 CHANGELOG
- [ ] 构建成功
- [ ] E2E 截图无异常

---

## 27.3 Web 发布

```bash
# 1. 构建
pnpm build:web

# 2. 部署到 GitHub Pages
# 通过 CI/CD 自动完成
```

---

## 27.4 DWEB 发布

```bash
# 1. 构建
pnpm build:dweb

# 2. 打包为 Plaoc 应用
plaoc build

# 3. 发布到 DWEB 应用商店
plaoc publish
```

---

## 27.5 CI/CD 流程

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build:all
      - uses: peaceiris/actions-gh-pages@v3
        with:
          publish_dir: ./dist-web
```

---

## 本章小结

- 遵循语义化版本号
- 发布前完成所有检查
- CI/CD 自动化部署
