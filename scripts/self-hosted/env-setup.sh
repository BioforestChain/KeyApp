#!/bin/bash
# Self-hosted Runner 环境配置脚本
# 在 macOS (M1/M2) 上配置 CI 所需的所有环境
#
# 使用方法:
#   chmod +x scripts/self-hosted/env-setup.sh
#   ./scripts/self-hosted/env-setup.sh
#
# 此脚本会安装:
#   - Node.js 24+ (via volta)
#   - pnpm (via corepack)
#   - bun
#   - Playwright chromium

set -e

echo "=========================================="
echo "  Self-hosted Runner 环境配置"
echo "=========================================="
echo ""

# 颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} $1 已安装: $($1 --version 2>&1 | head -1)"
        return 0
    else
        echo -e "${RED}✗${NC} $1 未安装"
        return 1
    fi
}

# ==================== 检查当前环境 ====================
echo "检查当前环境..."
echo ""

check_command node || NODE_MISSING=1
check_command pnpm || PNPM_MISSING=1
check_command bun || BUN_MISSING=1

echo ""

# ==================== 安装 Volta (Node.js 版本管理) ====================
if [ "$NODE_MISSING" = "1" ] || ! command -v volta &> /dev/null; then
    echo "安装 Volta (Node.js 版本管理)..."
    curl https://get.volta.sh | bash
    export VOLTA_HOME="$HOME/.volta"
    export PATH="$VOLTA_HOME/bin:$PATH"
    echo ""
fi

# ==================== 安装 Node.js 24 ====================
if [ "$NODE_MISSING" = "1" ]; then
    echo "安装 Node.js 24..."
    if command -v volta &> /dev/null; then
        volta install node@24
    elif command -v fnm &> /dev/null; then
        fnm install 24
        fnm use 24
    elif command -v nvm &> /dev/null; then
        nvm install 24
        nvm use 24
    else
        echo -e "${YELLOW}警告: 请手动安装 Node.js 24${NC}"
        echo "  推荐使用 volta: https://volta.sh"
    fi
    echo ""
fi

# ==================== 启用 corepack 并安装 pnpm ====================
if [ "$PNPM_MISSING" = "1" ]; then
    echo "启用 corepack 并安装 pnpm..."
    corepack enable
    corepack prepare pnpm@latest --activate
    echo ""
fi

# ==================== 安装 Bun ====================
if [ "$BUN_MISSING" = "1" ]; then
    echo "安装 Bun..."
    curl -fsSL https://bun.sh/install | bash
    export BUN_INSTALL="$HOME/.bun"
    export PATH="$BUN_INSTALL/bin:$PATH"
    echo ""
fi

# ==================== 安装项目依赖 ====================
echo "安装项目依赖..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"
pnpm install
echo ""

# ==================== 安装 Playwright ====================
echo "安装 Playwright chromium..."
pnpm exec playwright install chromium
echo ""

# ==================== 验证安装 ====================
echo "=========================================="
echo "  验证安装结果"
echo "=========================================="
echo ""

check_command node
check_command pnpm
check_command bun

echo ""
echo "检查 Playwright..."
if [ -d "$HOME/.cache/ms-playwright" ] || [ -d "$HOME/Library/Caches/ms-playwright" ]; then
    echo -e "${GREEN}✓${NC} Playwright 浏览器已安装"
else
    echo -e "${YELLOW}⚠${NC} Playwright 浏览器可能未安装，请运行: pnpm exec playwright install chromium"
fi

echo ""
echo "=========================================="
echo -e "  ${GREEN}环境配置完成！${NC}"
echo "=========================================="
echo ""
echo "下一步: 配置 GitHub Actions Runner"
echo "  ./scripts/self-hosted/setup-runners.sh <runner数量> <github-token>"
echo ""
