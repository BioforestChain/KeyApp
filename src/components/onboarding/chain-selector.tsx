import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  IconSearch as Search,
  IconChevronDown as ChevronDown,
  IconChevronRight as ChevronRight,
  IconStar as Star,
  IconStarFilled as StarFilled,
} from '@tabler/icons-react';
import type { ChainConfig } from '@/services/chain-config';

export interface ChainGroup {
  id: string;
  name: string;
  description?: string | undefined;
  chains: ChainConfig[];
}

export interface ChainSelectorProps {
  /** 所有可用的链配置 */
  chains: ChainConfig[];
  /** 已选择的链 ID 列表 */
  selectedChains: string[];
  /** 选择变化回调 */
  onSelectionChange: (chainIds: string[]) => void;
  /** 收藏的链 ID 列表 (可选) */
  favoriteChains?: string[];
  /** 收藏变化回调 (可选) */
  onFavoriteChange?: (chainIds: string[]) => void;
  /** 是否显示搜索框 */
  showSearch?: boolean;
  /** 额外的 className */
  className?: string;
  /** 测试 ID */
  'data-testid'?: string;
}

/** 链类型分组配置（基于 chainKind） - 返回翻译键 */
const getChainKindConfig = (kind: string, t: (key: string) => string): { name: string; description: string } => ({
  name: t(`common:chainKind.${kind}.name`),
  description: t(`common:chainKind.${kind}.description`),
});

/**
 * 区块链网络选择器
 *
 * 二级结构：
 * - 第一级：技术类型（生物链林、EVM、BIP39）
 * - 第二级：具体网络
 */
export function ChainSelector({
  chains,
  selectedChains,
  onSelectionChange,
  favoriteChains = [],
  onFavoriteChange,
  showSearch = true,
  className,
  'data-testid': testId,
}: ChainSelectorProps) {
  const { t } = useTranslation(['onboarding', 'common']);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['bioforest']));
  const baseTestId = testId ?? undefined;

  // 按 chainKind 分组
  const chainGroups = useMemo<ChainGroup[]>(() => {
    const grouped = new Map<string, ChainConfig[]>();

    for (const chain of chains) {
      const kind = chain.chainKind || 'custom';
      if (!grouped.has(kind)) {
        grouped.set(kind, []);
      }
      grouped.get(kind)!.push(chain);
    }

    // 按预定义顺序返回
    const orderedKinds = ['bioforest', 'evm', 'bitcoin', 'tron', 'custom'];
    return orderedKinds
      .filter((kind) => grouped.has(kind))
      .map((kind) => {
        const config = getChainKindConfig(kind, t);
        return {
          id: kind,
          name: config.name || kind,
          description: config.description,
          chains: grouped.get(kind)!,
        };
      });
  }, [chains, t]);

  // 过滤搜索结果
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return chainGroups;

    const query = searchQuery.toLowerCase();
    return chainGroups
      .map((group) => ({
        ...group,
        chains: group.chains.filter(
          (chain) =>
            chain.name.toLowerCase().includes(query) ||
            chain.symbol.toLowerCase().includes(query) ||
            chain.id.toLowerCase().includes(query),
        ),
      }))
      .filter((group) => group.chains.length > 0);
  }, [chainGroups, searchQuery]);

  const favoriteSet = useMemo(() => new Set(favoriteChains), [favoriteChains]);

  const sortedGroups = useMemo(() => {
    return filteredGroups.map((group) => ({
      ...group,
      chains: [...group.chains].toSorted((a, b) => {
        const aFav = favoriteSet.has(a.id);
        const bFav = favoriteSet.has(b.id);
        if (aFav !== bFav) return aFav ? -1 : 1;
        return a.name.localeCompare(b.name);
      }),
    }));
  }, [filteredGroups, favoriteSet]);

  // 切换组展开/折叠
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // 选择/取消选择单个链
  const toggleChain = useCallback(
    (chainId: string) => {
      const isSelected = selectedChains.includes(chainId);
      if (isSelected) {
        onSelectionChange(selectedChains.filter((id) => id !== chainId));
      } else {
        onSelectionChange([...selectedChains, chainId]);
      }
    },
    [selectedChains, onSelectionChange],
  );

  // 选择/取消选择整个组
  const toggleGroup选择 = useCallback(
    (group: ChainGroup) => {
      const groupChainIds = group.chains.map((c) => c.id);
      const allSelected = groupChainIds.every((id) => selectedChains.includes(id));

      if (allSelected) {
        // 取消选择整个组
        onSelectionChange(selectedChains.filter((id) => !groupChainIds.includes(id)));
      } else {
        // 选择整个组
        const newSelection = new Set(selectedChains);
        groupChainIds.forEach((id) => newSelection.add(id));
        onSelectionChange(Array.from(newSelection));
      }
    },
    [selectedChains, onSelectionChange],
  );

  // 切换收藏
  const toggleFavorite = useCallback(
    (chainId: string) => {
      if (!onFavoriteChange) return;

      const isFavorite = favoriteChains.includes(chainId);
      if (isFavorite) {
        onFavoriteChange(favoriteChains.filter((id) => id !== chainId));
      } else {
        onFavoriteChange([...favoriteChains, chainId]);
      }
    },
    [favoriteChains, onFavoriteChange],
  );

  // 检查组的选择状态
  const getGroupSelectionState = useCallback(
    (group: ChainGroup) => {
      const groupChainIds = group.chains.map((c) => c.id);
      const selectedCount = groupChainIds.filter((id) => selectedChains.includes(id)).length;

      if (selectedCount === 0) return 'none';
      if (selectedCount === groupChainIds.length) return 'all';
      return 'partial';
    },
    [selectedChains],
  );

  return (
    <div className={cn('space-y-4', className)} data-testid={baseTestId}>
      {/* 搜索框 */}
      {showSearch && (
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('chainSelector.searchPlaceholder')}
            className="pl-9"
            data-testid={baseTestId ? `${baseTestId}-search` : undefined}
          />
        </div>
      )}

      {/* 链组列表 */}
      <div className="space-y-2">
        {sortedGroups.map((group) => {
          const isExpanded = searchQuery.trim().length > 0 ? true : expandedGroups.has(group.id);
          const selectionState = getGroupSelectionState(group);

          return (
            <div
              key={group.id}
              className="overflow-hidden rounded-lg border"
              data-testid={baseTestId ? `${baseTestId}-group-${group.id}` : undefined}
            >
              {/* 组标题 */}
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left',
                  'hover:bg-muted/50 transition-colors',
                )}
                aria-expanded={isExpanded}
                data-testid={baseTestId ? `${baseTestId}-group-toggle-${group.id}` : undefined}
              >
                {/* 展开/折叠图标 */}
                {isExpanded ? (
                  <ChevronDown className="text-muted-foreground size-4" />
                ) : (
                  <ChevronRight className="text-muted-foreground size-4" />
                )}

                {/* 组复选框 */}
                <Checkbox
                  checked={selectionState === 'all'}
                  indeterminate={selectionState === 'partial'}
                  onCheckedChange={() => toggleGroup选择(group)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={t('chainSelector.selectAll')}
                  data-testid={baseTestId ? `${baseTestId}-group-checkbox-${group.id}` : undefined}
                />

                {/* 组信息 */}
                <div className="flex-1">
                  <div className="font-medium">{group.name}</div>
                  {group.description && <div className="text-muted-foreground text-xs">{group.description}</div>}
                </div>

                {/* 选择计数 */}
                <span className="text-muted-foreground text-sm">
                  {group.chains.filter((c) => selectedChains.includes(c.id)).length}/{group.chains.length}
                </span>
              </button>

              {/* 组内链列表 */}
              {isExpanded && (
                <div
                  className="border-t"
                  data-testid={baseTestId ? `${baseTestId}-group-content-${group.id}` : undefined}
                >
                  {group.chains.map((chain) => {
                    const isSelected = selectedChains.includes(chain.id);
                    const isFavorite = favoriteChains.includes(chain.id);

                    return (
                      <div
                        key={chain.id}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 pl-11',
                          'hover:bg-muted/30 transition-colors',
                          isSelected && 'bg-primary/5',
                        )}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleChain(chain.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleChain(chain.id);
                          }
                        }}
                        data-testid={baseTestId ? `${baseTestId}-chain-${chain.id}` : undefined}
                      >
                        {/* 链复选框 */}
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleChain(chain.id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={chain.name}
                          data-testid={baseTestId ? `${baseTestId}-chain-checkbox-${chain.id}` : undefined}
                        />

                        {/* 链图标 (placeholder) */}
                        <div className="bg-muted flex size-8 items-center justify-center rounded-full text-xs font-bold">
                          {chain.symbol.slice(0, 2)}
                        </div>

                        {/* 链信息 */}
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{chain.name}</div>
                          <div className="text-muted-foreground text-xs">{chain.symbol}</div>
                        </div>

                        {/* 收藏按钮 */}
                        {onFavoriteChange && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(chain.id);
                            }}
                            className="hover:bg-muted rounded p-1 transition-colors"
                            aria-label={isFavorite ? t('common:unfavorite') : t('common:favorite')}
                            data-testid={baseTestId ? `${baseTestId}-favorite-${chain.id}` : undefined}
                          >
                            {isFavorite ? (
                              <StarFilled className="size-4 text-yellow-500" />
                            ) : (
                              <Star className="text-muted-foreground size-4" />
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {sortedGroups.length === 0 && (
        <div
          className="text-muted-foreground py-8 text-center"
          data-testid={baseTestId ? `${baseTestId}-empty` : undefined}
        >
          {t('chainSelector.noResults')}
        </div>
      )}
    </div>
  );
}

/**
 * 获取默认选择的链（全选）
 */
export function getDefaultSelectedChains(chains: ChainConfig[]): string[] {
  return chains.map((chain) => chain.id);
}
