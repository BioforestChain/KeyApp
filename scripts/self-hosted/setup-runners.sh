#!/bin/bash
# GitHub Actions Self-hosted Runner 批量配置脚本
#
# 使用方法:
#   ./scripts/self-hosted/setup-runners.sh <runner数量> <github-token>
#
# 获取 token:
#   gh api -X POST repos/OWNER/REPO/actions/runners/registration-token --jq '.token'
#
# 示例:
#   ./scripts/self-hosted/setup-runners.sh 4 AXXXX...

set -e

NUM_RUNNERS=${1:-4}
GITHUB_TOKEN=${2:-}
RUNNER_VERSION="2.321.0"  # https://github.com/actions/runner/releases
RUNNER_BASE_DIR="$HOME/actions-runners"

# 从 git remote 获取仓库信息（支持 fork）
get_repo_from_git() {
    local remote_url=$(git remote get-url origin 2>/dev/null)
    if [ -n "$remote_url" ]; then
        # 支持 https://github.com/owner/repo.git 和 git@github.com:owner/repo.git
        echo "$remote_url" | sed -E 's#.*github.com[:/]([^/]+/[^/]+?)(\.git)?$#\1#' | sed 's/\.git$//'
    fi
}

REPO=${GITHUB_REPOSITORY:-$(get_repo_from_git)}
if [ -z "$REPO" ]; then
    echo "错误: 无法获取仓库信息"
    echo "请在 git 仓库目录中运行，或设置 GITHUB_REPOSITORY 环境变量"
    exit 1
fi

echo "=========================================="
echo "  GitHub Actions Self-hosted Runner 配置"
echo "=========================================="
echo ""
echo "Runner 数量: $NUM_RUNNERS"
echo "仓库: $REPO"
echo "安装目录: $RUNNER_BASE_DIR"
echo ""

# 检查 token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "请提供 GitHub token 作为第二个参数"
    echo ""
    echo "获取 token 的方法:"
    echo ""
    echo "  方法 1 - 使用 gh CLI:"
    echo "    gh api -X POST repos/$REPO/actions/runners/registration-token --jq '.token'"
    echo ""
    echo "  方法 2 - GitHub 网页:"
    echo "    https://github.com/$REPO/settings/actions/runners/new"
    echo "    复制页面上显示的 token"
    echo ""
    exit 1
fi

# 检测系统架构
ARCH=$(uname -m)
OS=$(uname -s | tr '[:upper:]' '[:lower:]')

case "$ARCH" in
    arm64|aarch64)
        RUNNER_ARCH="arm64"
        ;;
    x86_64)
        RUNNER_ARCH="x64"
        ;;
    *)
        echo "不支持的架构: $ARCH"
        exit 1
        ;;
esac

case "$OS" in
    darwin)
        RUNNER_OS="osx"
        ;;
    linux)
        RUNNER_OS="linux"
        ;;
    *)
        echo "不支持的操作系统: $OS"
        exit 1
        ;;
esac

RUNNER_TAR="actions-runner-${RUNNER_OS}-${RUNNER_ARCH}-${RUNNER_VERSION}.tar.gz"
RUNNER_URL="https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/${RUNNER_TAR}"

echo "Runner 包: $RUNNER_TAR"
echo ""

# 创建基础目录
mkdir -p "$RUNNER_BASE_DIR"
cd "$RUNNER_BASE_DIR"

# 下载 runner
if [ ! -f "$RUNNER_TAR" ]; then
    echo "下载 GitHub Actions Runner v${RUNNER_VERSION}..."
    curl -o "$RUNNER_TAR" -L "$RUNNER_URL"
    echo ""
fi

# 配置每个 runner
for i in $(seq 1 $NUM_RUNNERS); do
    RUNNER_DIR="$RUNNER_BASE_DIR/runner-$i"
    RUNNER_NAME="$(hostname)-runner-$i"
    
    echo "=========================================="
    echo "  配置 Runner $i: $RUNNER_NAME"
    echo "=========================================="
    
    # 如果已存在且已配置，跳过
    if [ -d "$RUNNER_DIR" ] && [ -f "$RUNNER_DIR/.runner" ]; then
        echo "Runner $i 已配置，跳过"
        continue
    fi
    
    # 创建目录并解压
    mkdir -p "$RUNNER_DIR"
    tar xzf "$RUNNER_TAR" -C "$RUNNER_DIR"
    
    # 配置 runner
    cd "$RUNNER_DIR"
    ./config.sh \
        --url "https://github.com/$REPO" \
        --token "$GITHUB_TOKEN" \
        --name "$RUNNER_NAME" \
        --labels "self-hosted,${RUNNER_OS},${RUNNER_ARCH}" \
        --work "_work" \
        --unattended \
        --replace
    
    cd "$RUNNER_BASE_DIR"
    echo ""
done

# 生成管理脚本
echo "生成管理脚本..."

# start-all.sh
cat > "$RUNNER_BASE_DIR/start-all.sh" << SCRIPT
#!/bin/bash
SCRIPT_DIR="\$(cd "\$(dirname "\$0")" && pwd)"
REPO="$REPO"

echo "启动所有 runners..."
for dir in "\$SCRIPT_DIR"/runner-*; do
    if [ -d "\$dir" ] && [ -f "\$dir/run.sh" ]; then
        NAME=\$(basename "\$dir")
        if pgrep -f "\$dir/bin/Runner.Listener" > /dev/null; then
            echo "  \$NAME: 已在运行"
        else
            echo "  \$NAME: 启动中..."
            cd "\$dir"
            nohup ./run.sh > runner.log 2>&1 &
            echo "  \$NAME: PID \$!"
        fi
    fi
done

# 设置 GitHub 变量启用 self-hosted
echo ""
echo "设置 USE_SELF_HOSTED=true..."
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    gh variable set USE_SELF_HOSTED --body "true" --repo "\$REPO" 2>/dev/null && \
        echo "  ✓ CI 已切换到 self-hosted 模式" || \
        echo "  △ 无法设置变量，请手动设置"
else
    echo "  △ gh CLI 未登录，请手动设置 USE_SELF_HOSTED=true"
fi

echo ""
echo "查看日志: tail -f \$SCRIPT_DIR/runner-*/runner.log"
SCRIPT
chmod +x "$RUNNER_BASE_DIR/start-all.sh"

# stop-all.sh
cat > "$RUNNER_BASE_DIR/stop-all.sh" << SCRIPT
#!/bin/bash
REPO="$REPO"

echo "停止所有 runners..."
pkill -f "Runner.Listener" 2>/dev/null || true
pkill -f "Runner.Worker" 2>/dev/null || true

# 设置 GitHub 变量禁用 self-hosted
echo ""
echo "设置 USE_SELF_HOSTED=false..."
if command -v gh &> /dev/null && gh auth status &> /dev/null; then
    gh variable set USE_SELF_HOSTED --body "false" --repo "\$REPO" 2>/dev/null && \
        echo "  ✓ CI 已切换到 github-hosted 模式" || \
        echo "  △ 无法设置变量，请手动设置"
else
    echo "  △ gh CLI 未登录，请手动设置 USE_SELF_HOSTED=false"
fi

echo ""
echo "完成"
SCRIPT
chmod +x "$RUNNER_BASE_DIR/stop-all.sh"

# status.sh
cat > "$RUNNER_BASE_DIR/status.sh" << 'SCRIPT'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Runner 状态:"
echo ""
for dir in "$SCRIPT_DIR"/runner-*; do
    if [ -d "$dir" ]; then
        NAME=$(basename "$dir")
        if pgrep -f "$dir/bin/Runner.Listener" > /dev/null; then
            PID=$(pgrep -f "$dir/bin/Runner.Listener")
            echo "  ✓ $NAME: 运行中 (PID: $PID)"
        else
            echo "  ✗ $NAME: 已停止"
        fi
    fi
done
SCRIPT
chmod +x "$RUNNER_BASE_DIR/status.sh"

# restart-all.sh
cat > "$RUNNER_BASE_DIR/restart-all.sh" << 'SCRIPT'
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
"$SCRIPT_DIR/stop-all.sh"
sleep 2
"$SCRIPT_DIR/start-all.sh"
SCRIPT
chmod +x "$RUNNER_BASE_DIR/restart-all.sh"

echo ""
echo "=========================================="
echo "  配置完成！"
echo "=========================================="
echo ""
echo "管理脚本:"
echo "  $RUNNER_BASE_DIR/start-all.sh   - 启动所有 runners"
echo "  $RUNNER_BASE_DIR/stop-all.sh    - 停止所有 runners"
echo "  $RUNNER_BASE_DIR/status.sh      - 查看状态"
echo "  $RUNNER_BASE_DIR/restart-all.sh - 重启所有 runners"
echo ""
echo "现在执行:"
echo "  $RUNNER_BASE_DIR/start-all.sh"
echo ""
