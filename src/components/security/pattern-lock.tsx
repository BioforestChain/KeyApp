import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export interface PatternLockProps {
  /** 当前选中的图案 (节点索引数组, 0-8) */
  value?: number[];
  /** 图案变化回调 */
  onChange?: (pattern: number[]) => void;
  /** 图案完成回调 (松开手指时触发) */
  onComplete?: (pattern: number[]) => void;
  /** 最少需要连接的点数 */
  minPoints?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 错误状态 */
  error?: boolean;
  /** 成功状态 */
  success?: boolean;
  /** 额外的 className */
  className?: string;
  /** 网格大小 (默认 3x3) */
  size?: number;
  /** 测试 ID */
  'data-testid'?: string;
}

interface Point {
  x: number;
  y: number;
  index: number;
}

/**
 * 九宫格图案锁组件
 * 
 * 可访问性设计：
 * - 每个节点本质上是一个 checkbox
 * - 支持键盘导航 (Tab + Space/Enter)
 * - 支持屏幕阅读器
 * - 触摸和鼠标手势用于快速选择
 */
export function PatternLock({
  value,
  onChange,
  onComplete,
  minPoints = 4,
  disabled = false,
  error = false,
  success = false,
  className,
  size = 3,
  'data-testid': testId,
}: PatternLockProps) {
  const { t } = useTranslation('security');
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const baseTestId = testId ?? undefined;
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState<number[]>(() => value ?? []);
  const selectedNodesRef = useRef<number[]>(value ?? []);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  
  // 错误动画状态：error 变为 true 时开始淡出动画，动画结束后清空图案
  const [isErrorAnimating, setIsErrorAnimating] = useState(false);
  const [errorOpacity, setErrorOpacity] = useState(1);
  // 保存动画开始时的节点状态（因为外部可能同时清空 value）
  const [animatingNodes, setAnimatingNodes] = useState<number[]>([]);
  const prevErrorRef = useRef(error);
  // 用于取消动画的标志
  const animationCancelledRef = useRef(false);
  
  const totalNodes = size * size;

  // 同步外部 value
  useEffect(() => {
    if (value !== undefined) {
      setSelectedNodes(value);
      selectedNodesRef.current = value;
    }
  }, [value]);

  // 取消错误动画并重置状态
  const cancelErrorAnimation = useCallback(() => {
    if (isErrorAnimating) {
      animationCancelledRef.current = true;
      setAnimatingNodes([]);
      setIsErrorAnimating(false);
      setErrorOpacity(1);
    }
  }, [isErrorAnimating]);

  // 启动错误淡出动画的函数
  const startErrorAnimation = useCallback((nodes: number[]) => {
    if (nodes.length === 0 || isErrorAnimating) return;
    
    animationCancelledRef.current = false;
    setAnimatingNodes([...nodes]);
    setIsErrorAnimating(true);
    setErrorOpacity(1);
    
    const fadeStart = Date.now();
    const fadeDuration = 800;
    
    const animate = () => {
      // 如果动画被取消，停止继续
      if (animationCancelledRef.current) return;
      
      const elapsed = Date.now() - fadeStart;
      const progress = Math.min(elapsed / fadeDuration, 1);
      const opacity = 1 - progress;
      
      setErrorOpacity(opacity);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatingNodes([]);
        setIsErrorAnimating(false);
        setErrorOpacity(1);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isErrorAnimating]);

  // 处理外部 error 状态变化：开始淡出动画
  useEffect(() => {
    // 检测 error 从 false 变为 true
    if (error && !prevErrorRef.current) {
      // 保存当前节点状态用于动画显示（外部可能同时清空 value）
      const nodesToAnimate = selectedNodesRef.current.length > 0 
        ? [...selectedNodesRef.current] 
        : [...selectedNodes];
      
      startErrorAnimation(nodesToAnimate);
    }
    
    prevErrorRef.current = error;
  }, [error, selectedNodes, startErrorAnimation]);

  // 计算节点位置
  const nodePositions = useMemo(() => {
    const positions: Point[] = [];
    for (let i = 0; i < totalNodes; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      positions.push({
        x: (col + 0.5) / size * 100,
        y: (row + 0.5) / size * 100,
        index: i,
      });
    }
    return positions;
  }, [size, totalNodes]);

  // 获取相对于容器的坐标
  const getRelativeCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  // 查找最近的节点
  // isMoving: 移动过程中使用更小的触发半径，减少误触
  const findNearestNode = useCallback((x: number, y: number, isMoving = false): number | null => {
    // 开始触发时使用较大半径（半个格子），移动中使用较小半径（1/3 格子）
    const threshold = isMoving ? 100 / size / 3 : 100 / size / 2;
    for (const node of nodePositions) {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      if (distance < threshold) {
        return node.index;
      }
    }
    return null;
  }, [nodePositions, size]);

  // 开始绘制
  const handleStart = useCallback((clientX: number, clientY: number) => {
    if (disabled) return;
    
    // 如果正在错误动画中，用户开始新输入时先取消动画
    if (isErrorAnimating) {
      cancelErrorAnimation();
    }
    
    const coords = getRelativeCoords(clientX, clientY);
    if (!coords) return;

    const nodeIndex = findNearestNode(coords.x, coords.y);
    if (nodeIndex !== null) {
      setIsDrawing(true);
      setSelectedNodes([nodeIndex]);
      selectedNodesRef.current = [nodeIndex];
      setCurrentPoint(coords);
      onChange?.([nodeIndex]);
    }
  }, [disabled, isErrorAnimating, cancelErrorAnimation, getRelativeCoords, findNearestNode, onChange]);

  // 移动中
  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDrawing || disabled) return;

    const coords = getRelativeCoords(clientX, clientY);
    if (!coords) return;

    setCurrentPoint(coords);

    // 移动过程中使用更小的触发半径，减少误触
    const nodeIndex = findNearestNode(coords.x, coords.y, true);
    if (nodeIndex !== null && !selectedNodes.includes(nodeIndex)) {
      const newNodes = [...selectedNodes, nodeIndex];
      setSelectedNodes(newNodes);
      selectedNodesRef.current = newNodes;
      onChange?.(newNodes);
    }
  }, [isDrawing, disabled, getRelativeCoords, findNearestNode, selectedNodes, onChange]);

  // 结束绘制
  const handleEnd = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentPoint(null);
      
      const nodes = selectedNodesRef.current;
      
      // 如果点数不足，触发错误动画
      if (nodes.length > 0 && nodes.length < minPoints) {
        startErrorAnimation(nodes);
        // 清空选中状态
        setSelectedNodes([]);
        selectedNodesRef.current = [];
        onChange?.([]);
      } else if (nodes.length >= minPoints) {
        // 点数足够，调用完成回调
        onComplete?.(nodes);
      }
    }
  }, [isDrawing, minPoints, startErrorAnimation, onChange, onComplete]);

  // 鼠标事件
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  const handleMouseLeave = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // 保存最新的处理函数引用，避免在触摸过程中重新绑定事件
  const handleStartRef = useRef(handleStart);
  const handleMoveRef = useRef(handleMove);
  const handleEndRef = useRef(handleEnd);

  useEffect(() => {
    handleStartRef.current = handleStart;
    handleMoveRef.current = handleMove;
    handleEndRef.current = handleEnd;
  }, [handleStart, handleMove, handleEnd]);

  // 触摸事件
  // 使用原生事件监听器来支持 preventDefault（passive: false）
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleStartRef.current(touch.clientX, touch.clientY);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        handleMoveRef.current(touch.clientX, touch.clientY);
      }
    };

    const onTouchEnd = () => {
      handleEndRef.current();
    };

    container.addEventListener('touchstart', onTouchStart, { passive: false });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);

    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
    };
  }, []); // 只在挂载时绑定一次

  // 键盘导航：切换节点选中状态
  const handleNodeKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (disabled) return;
    
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      const isSelected = selectedNodes.includes(index);
      let newNodes: number[];
      
      if (isSelected) {
        // 只能移除最后一个选中的节点
        if (selectedNodes[selectedNodes.length - 1] === index) {
          newNodes = selectedNodes.slice(0, -1);
        } else {
          return;
        }
      } else {
        newNodes = [...selectedNodes, index];
      }
      
      setSelectedNodes(newNodes);
      selectedNodesRef.current = newNodes;
      onChange?.(newNodes);
    }
  }, [disabled, selectedNodes, onChange]);

  // 清空图案
  const handleClear = useCallback(() => {
    setSelectedNodes([]);
    selectedNodesRef.current = [];
    onChange?.([]);
  }, [onChange]);

  // 获取节点状态的颜色
  // - 可用（已选择）: primary
  // - 不可用（未选择）: primary/30 半透明
  // - 错误状态: destructive
  const getNodeColor = useCallback((isSelected: boolean) => {
    if (error || isErrorAnimating) return isSelected ? 'fill-destructive' : 'fill-primary/30';
    if (isSelected) return 'fill-primary';
    return 'fill-primary/30';
  }, [error, isErrorAnimating]);

  // 获取连线颜色
  const lineColor = error || isErrorAnimating ? 'stroke-destructive' : 'stroke-primary';

  // 渲染用的节点列表：动画期间使用 animatingNodes，否则使用 selectedNodes
  const displayNodes = isErrorAnimating ? animatingNodes : selectedNodes;

  // 生成连线路径
  const linePath = useMemo(() => {
    if (displayNodes.length < 2 && !currentPoint) return '';
    
    const points = displayNodes
      .map(index => nodePositions[index])
      .filter((p): p is Point => p !== undefined);
    let d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // 添加到当前手指位置的线（动画期间不显示）
    if (isDrawing && currentPoint && displayNodes.length > 0 && !isErrorAnimating) {
      d += ` L ${currentPoint.x} ${currentPoint.y}`;
    }
    
    return d;
  }, [displayNodes, nodePositions, isDrawing, currentPoint, isErrorAnimating]);

  return (
    <div className={cn('space-y-4', className)} data-testid={baseTestId}>
      {/* 图案绘制区域 */}
      <div
        ref={containerRef}
        className={cn(
          'relative aspect-square w-full max-w-[280px] mx-auto select-none touch-none',
          'rounded-2xl bg-muted/30 p-4',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
        data-testid={baseTestId ? `${baseTestId}-grid` : undefined}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        role="group"
        aria-label={t('patternLock.gridLabel', { size })}
      >
        {/* SVG 连线层 */}
        <svg
          ref={svgRef}
          className="absolute inset-4 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 连线 */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              className={cn(lineColor, 'transition-colors')}
              strokeWidth="3"
              strokeLinecap="round"
              style={isErrorAnimating ? { opacity: errorOpacity } : undefined}
              strokeLinejoin="round"
            />
          )}
          
          {/* 节点 */}
          {nodePositions.map((node) => {
            const isSelected = displayNodes.includes(node.index);
            const orderIndex = displayNodes.indexOf(node.index);
            // 错误动画期间，选中的节点需要淡出
            const nodeOpacity = isErrorAnimating && isSelected ? errorOpacity : 1;
            
            return (
              <g key={node.index} style={nodeOpacity < 1 ? { opacity: nodeOpacity } : undefined}>
                {/* 外圈 (选中时显示) */}
                {isSelected && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="8"
                    className={cn(
                      'transition-all duration-150',
                      error ? 'fill-destructive/20' : 'fill-primary/20',
                    )}
                  />
                )}
                {/* 内圈 */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isSelected ? 5 : 4}
                  className={cn(getNodeColor(isSelected), 'transition-all duration-150')}
                />
                {/* 顺序数字 (屏幕阅读器可见) */}
                {isSelected && (
                  <text
                    x={node.x}
                    y={node.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-primary-foreground text-[6px] font-bold pointer-events-none"
                    aria-hidden="true"
                  >
                    {orderIndex + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* 可访问性: 隐藏的 checkbox 网格 */}
        <div
          className="absolute inset-4 grid gap-0"
          style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}
          aria-hidden="false"
        >
          {nodePositions.map((node) => {
            const isSelected = selectedNodes.includes(node.index);
            const orderIndex = selectedNodes.indexOf(node.index);
            
            return (
              <div key={node.index} className="flex items-center justify-center">
                <input
                  type="checkbox"
                  data-testid={baseTestId ? `${baseTestId}-node-${node.index}` : undefined}
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => {}}
                  onKeyDown={(e) => handleNodeKeyDown(e, node.index)}
                  className="sr-only peer"
                  aria-label={t('patternLock.nodeLabel', { 
                    row: Math.floor(node.index / size) + 1,
                    col: (node.index % size) + 1,
                    order: isSelected ? orderIndex + 1 : undefined,
                  })}
                />
                {/* 焦点指示器 */}
                <div className="absolute size-12 rounded-full peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2" />
              </div>
            );
          })}
        </div>
      </div>

      {/* 状态提示 - 固定高度避免布局抖动 */}
      <div className="text-center h-5">
        {error || isErrorAnimating ? (
          <p className="text-destructive text-sm">
            {t('patternLock.error')}
          </p>
        ) : selectedNodes.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t('patternLock.hint', { min: minPoints })}
          </p>
        ) : selectedNodes.length < minPoints ? (
          <p className="text-muted-foreground text-sm">
            {t('patternLock.needMore', { current: selectedNodes.length, min: minPoints })}
          </p>
        ) : success ? (
          <p className="text-primary text-sm font-medium">
            {t('patternLock.success')}
          </p>
        ) : (
          <p className="text-primary text-sm">
            {t('patternLock.valid', { count: selectedNodes.length })}
          </p>
        )}
      </div>

      {/* 清除按钮 - 固定高度避免布局抖动 */}
      <div className="h-5">
        {selectedNodes.length > 0 && !disabled && !isErrorAnimating && (
          <button
            type="button"
            onClick={handleClear}
            data-testid={baseTestId ? `${baseTestId}-clear` : undefined}
            className="mx-auto block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('patternLock.clear')}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 将图案转换为字符串 (用于加密存储)
 */
export function patternToString(pattern: number[]): string {
  return pattern.join('-');
}

/**
 * 将字符串转换为图案
 */
export function stringToPattern(str: string): number[] {
  if (!str) return [];
  return str.split('-').map(Number).filter(n => !isNaN(n));
}

/**
 * 验证图案是否有效
 */
export function isValidPattern(pattern: number[], minPoints = 4): boolean {
  if (pattern.length < minPoints) return false;
  // 检查是否有重复
  const unique = new Set(pattern);
  if (unique.size !== pattern.length) return false;
  // 检查是否都在有效范围内
  return pattern.every(n => n >= 0 && n <= 8);
}
