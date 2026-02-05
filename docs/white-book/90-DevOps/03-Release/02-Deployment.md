# 02. 部署机制 (Deployment)

Code: `.github/workflows/cd.yml`

KeyApp 采用基于 `gh-pages` 分支的自动化部署方案。

## 发布命令

- `pnpm release`: 完整发布流程（构建、上传、版本更新、推送、触发 stable workflow）。
- `pnpm release:resume`: 恢复流程（自动检测发布进度，衔接 PR/触发 stable workflow）。

发布流程会在主分支保护时自动走 PR 模式，并通过状态检测确保 `gh-pages/dweb/metadata.json` 与目标版本一致。

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
