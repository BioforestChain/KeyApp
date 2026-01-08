# 02. 部署机制 (Deployment)

Code: `.github/workflows/cd.yml`

KeyApp 采用基于 `gh-pages` 分支的自动化部署方案。

## 部署流程

1.  **触发**: 代码合并到 `main` 分支。
2.  **构建**: GitHub Actions 启动构建任务，生成 `dist/` 产物。
3.  **Force Push**:
    *   Action 脚本会初始化一个新的 git 仓库。
    *   将 `dist/` 内容作为唯一的 commit。
    *   强制推送 (`git push -f`) 到 `gh-pages` 分支。

## 为什么 Force Push?

*   **减小体积**: 部署分支不需要保留历史记录，强制推送避免了 `.git` 目录无限膨胀。
*   **原子更新**: 每次部署都是全新的状态，避免了增量更新可能导致的文件残留问题。

## 环境配置

需要在 GitHub 仓库设置中：
*   Settings -> Pages -> Source: 选择 **Deploy from a branch**。
*   Branch: 选择 **gh-pages** / **root**。
