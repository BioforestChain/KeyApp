#!/bin/bash
# Self-hosted Runner 环境检查脚本
#
# 检查项:
#   1. 必要工具: Node.js, pnpm, bun, Playwright
#   2. gh CLI 安装和登录状态
#   3. gh 对仓库的权限

set -e

# 从 git remote 获取仓库信息（支持 fork）
get_repo_from_git() {
    local remote_url=$(git remote get-url origin 2>/dev/null)
    if [ -n "$remote_url" ]; then
        echo "$remote_url" | sed -E 's#.*github.com[:/]([^/]+/[^/]+?)(\.git)?$#\1#' | sed 's/\.git$//'
    fi
}

REPO=${GITHUB_REPOSITORY:-$(get_repo_from_git)}
if [ -z "$REPO" ]; then
    echo "警告: 无法获取仓库信息，部分检查将跳过"
    REPO="unknown/repo"
fi

echo "=========================================="
echo "  Self-hosted Runner 环境检查"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# 检查函数
check_command() {
    local cmd=$1
    local name=$2
    local required=${3:-true}
    
    if command -v "$cmd" &> /dev/null; then
        VERSION=$("$cmd" --version 2>/dev/null | head -1)
        echo "  ✓ $name: $VERSION"
        return 0
    else
        if [ "$required" = "true" ]; then
            echo "  ✗ $name: 未安装"
            ((ERRORS++))
        else
            echo "  △ $name: 未安装 (可选)"
            ((WARNINGS++))
        fi
        return 1
    fi
}

# 1. 检查必要工具
echo "【1/4】检查必要工具"
echo ""
check_command "node" "Node.js"
check_command "pnpm" "pnpm"
check_command "bun" "Bun"
check_command "gh" "GitHub CLI"
echo ""

# 2. 检查 Playwright
echo "【2/4】检查 Playwright"
echo ""
if command -v playwright &> /dev/null; then
    VERSION=$(playwright --version 2>/dev/null || echo "已安装")
    echo "  ✓ Playwright: $VERSION"
elif [ -d "$HOME/.cache/ms-playwright" ]; then
    BROWSERS=$(ls "$HOME/.cache/ms-playwright" 2>/dev/null | wc -l | tr -d ' ')
    echo "  ✓ Playwright browsers: $BROWSERS 个"
else
    echo "  △ Playwright: 未检测到浏览器缓存"
    echo "    运行: pnpm exec playwright install chromium"
    ((WARNINGS++))
fi
echo ""

# 3. 检查 gh CLI 状态
echo "【3/4】检查 GitHub CLI 状态"
echo ""
if command -v gh &> /dev/null; then
    # 检查登录状态
    if gh auth status &> /dev/null; then
        USER=$(gh api user --jq '.login' 2>/dev/null || echo "unknown")
        echo "  ✓ 已登录: $USER"
        
        # 检查仓库权限
        echo ""
        echo "【4/4】检查仓库权限 ($REPO)"
        echo ""
        
        # 检查读取权限
        if gh repo view "$REPO" &> /dev/null; then
            echo "  ✓ 仓库访问: 可读"
        else
            echo "  ✗ 仓库访问: 无权限"
            ((ERRORS++))
        fi
        
        # 检查 variables 权限
        if gh variable list --repo "$REPO" &> /dev/null; then
            echo "  ✓ Variables: 可读写"
            
            # 检查 USE_SELF_HOSTED 变量
            CURRENT=$(gh variable get USE_SELF_HOSTED --repo "$REPO" 2>/dev/null || echo "未设置")
            echo "  ✓ USE_SELF_HOSTED: $CURRENT"
        else
            echo "  ✗ Variables: 无权限"
            echo "    需要 repo 或 admin:repo_hook 权限"
            ((ERRORS++))
        fi
        
        # 检查 Actions 权限
        if gh api "repos/$REPO/actions/runners" &> /dev/null; then
            RUNNERS=$(gh api "repos/$REPO/actions/runners" --jq '.total_count' 2>/dev/null || echo "0")
            echo "  ✓ Actions Runners: $RUNNERS 个已注册"
        else
            echo "  △ Actions API: 无法访问"
            ((WARNINGS++))
        fi
    else
        echo "  ✗ 未登录"
        echo "    运行: gh auth login"
        ((ERRORS++))
        echo ""
        echo "【4/4】跳过仓库权限检查 (需要先登录)"
    fi
else
    echo "  ✗ gh CLI 未安装"
    echo ""
    echo "【4/4】跳过仓库权限检查 (需要先安装 gh)"
fi

echo ""
echo "=========================================="
echo "  检查结果"
echo "=========================================="
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "  ✗ 发现 $ERRORS 个错误"
    echo ""
    echo "修复建议:"
    echo "  1. 运行 ./scripts/self-hosted/env-setup.sh 安装依赖"
    echo "  2. 运行 gh auth login 登录 GitHub"
    echo ""
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "  △ 发现 $WARNINGS 个警告，但可以运行"
    echo ""
    exit 0
else
    echo "  ✓ 所有检查通过！"
    echo ""
    exit 0
fi
