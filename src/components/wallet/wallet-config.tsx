import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { WALLET_THEME_COLORS } from '@/hooks/useWalletTheme';
import { useChainIconUrls } from '@/hooks/useChainIconUrls';
import { WalletCard } from '@/components/wallet/wallet-card';
import { Button } from '@/components/ui/button';
import { useWallets, useSelectedChain, walletActions, type ChainType, useLanguage } from '@/stores';
import { getRandomWalletWord } from '@/lib/wallet-utils';
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupButton } from '@/components/ui/input-group';
import { useFlow } from '@/stackflow';
import {
  IconCheck,
  IconCircleKey as KeyRound,
  IconTrash as Trash2,
  IconPencilMinus as Edit3,
  IconDice5 as Dice,
} from '@tabler/icons-react';

/**
 * 计算两个色相之间的距离（0-180）
 */
function hueDistance(h1: number, h2: number): number {
  const diff = Math.abs(h1 - h2);
  return Math.min(diff, 360 - diff);
}

/**
 * 计算趋避权重
 */
function calculateAvoidanceWeight(hue: number, existingHues: number[], minDistance = 30): number {
  if (existingHues.length === 0) return 1;
  let minDist = 180;
  for (const existingHue of existingHues) {
    const dist = hueDistance(hue, existingHue);
    if (dist < minDist) minDist = dist;
  }
  if (minDist < minDistance) {
    return minDist / minDistance;
  }
  return 1;
}

/**
 * 生成带趋避权重的预设颜色
 */
function getWeightedPresetColors(existingHues: number[]) {
  return WALLET_THEME_COLORS.map((color) => ({
    ...color,
    weight: calculateAvoidanceWeight(color.hue, existingHues),
  }));
}

type WalletConfigMode = 'edit-only' | 'default' | 'edit';

const WALLET_CONFIG_PREVIEW_NAME_TEST_ID = 'wallet-config-preview-name';

interface WalletConfigProps {
  mode: WalletConfigMode;
  walletId: string;
  onEditOnlyComplete?: () => void;
  className?: string;
}

/**
 * 统一的钱包配置组件
 * - default: 钱包详情页，显示卡片+功能按钮，可切换到 edit
 * - edit: 从 default 切换来，编辑完成后切回 default
 * - edit-only: 创建/导入最后一步，编辑完成后触发 onEditOnlyComplete
 */
export function WalletConfig({ mode, walletId, onEditOnlyComplete, className }: WalletConfigProps) {
  const { t } = useTranslation(['wallet', 'onboarding', 'common']);
  const { push } = useFlow();
  const wallets = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);
  const selectedChain = useSelectedChain();
  const chainIconUrls = useChainIconUrls();
  const currentLanguage = useLanguage();

  // 内部模式状态（default 和 edit 可以互相切换）
  const [internalMode, setInternalMode] = useState<'default' | 'edit'>(mode === 'edit-only' ? 'edit' : mode);

  // 编辑状态
  const [editName, setEditName] = useState('');
  const [editThemeHue, setEditThemeHue] = useState(0);

  // 色条拖拽
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 排除当前钱包的色相
  const existingHues = useMemo(
    () => wallets.filter((w) => w.id !== walletId).map((w) => w.themeHue),
    [wallets, walletId],
  );
  const weightedColors = useMemo(() => getWeightedPresetColors(existingHues), [existingHues]);

  // 初始化编辑值
  useEffect(() => {
    if (wallet) {
      setEditName(wallet.name);
      setEditThemeHue(wallet.themeHue);
    }
  }, [wallet]);

  // 当前显示的链（使用全局选中的链）
  const currentChainAddr = useMemo(
    () => wallet?.chainAddresses.find((ca) => ca.chain === selectedChain) ?? wallet?.chainAddresses[0],
    [wallet, selectedChain],
  );

  // 色条拖拽处理
  const updateHueFromPosition = useCallback((clientX: number) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    const newHue = Math.round(ratio * 3600) / 10;
    setEditThemeHue(newHue);
  }, []);

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    updateHueFromPosition(e.clientX);
  };

  const handleSliderTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    if (e.touches[0]) {
      updateHueFromPosition(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => updateHueFromPosition(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) updateHueFromPosition(e.touches[0].clientX);
    };
    const handleEnd = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, updateHueFromPosition]);

  // 打开链选择器
  const handleOpenChainSelector = useCallback(() => {
    push('ChainSelectorJob', {});
  }, [push]);

  // 切换到编辑模式
  const handleStartEdit = useCallback(() => {
    if (wallet) {
      setEditName(wallet.name);
      setEditThemeHue(wallet.themeHue);
    }
    setInternalMode('edit');
  }, [wallet]);

  // 保存编辑（edit 模式）
  const handleSave = useCallback(async () => {
    if (!wallet) return;
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== wallet.name) {
      await walletActions.updateWalletName(wallet.id, trimmedName);
    }
    if (editThemeHue !== wallet.themeHue) {
      await walletActions.updateWalletThemeHue(wallet.id, editThemeHue);
    }
    setInternalMode('default');
  }, [wallet, editName, editThemeHue]);

  // 取消编辑（edit 模式）
  const handleCancel = useCallback(() => {
    if (wallet) {
      setEditName(wallet.name);
      setEditThemeHue(wallet.themeHue);
    }
    setInternalMode('default');
  }, [wallet]);

  // 确认（edit-only 模式）
  const handleConfirm = useCallback(async () => {
    if (!wallet) return;
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== wallet.name) {
      await walletActions.updateWalletName(wallet.id, trimmedName);
    }
    if (editThemeHue !== wallet.themeHue) {
      await walletActions.updateWalletThemeHue(wallet.id, editThemeHue);
    }
    onEditOnlyComplete?.();
  }, [wallet, editName, editThemeHue, onEditOnlyComplete]);

  // 查看助记词
  const handleExportMnemonic = useCallback(async () => {
    if (!wallet) return;
    await walletActions.setCurrentWallet(wallet.id);
    push('SettingsMnemonicActivity', {});
  }, [wallet, push]);

  // 删除钱包
  const handleDelete = useCallback(() => {
    if (!wallet) return;
    push('WalletDeleteJob', { walletId: wallet.id });
  }, [wallet, push]);

  if (!wallet) {
    return <div className={cn('text-muted-foreground p-4 text-center', className)}>{t('wallet:detail.notFound')}</div>;
  }

  // 当前显示的主题色
  const displayThemeHue = internalMode === 'edit' || mode === 'edit-only' ? editThemeHue : wallet.themeHue;
  const isEditMode = internalMode === 'edit' || mode === 'edit-only';

  return (
    <div className={cn('space-y-6', className)}>
      {/* 卡片预览 */}
      <div className="flex justify-center px-4">
        <div className="aspect-[1.6/1] w-full max-w-[360px]">
          <WalletCard
            wallet={{ ...wallet, name: isEditMode ? editName : wallet.name, themeHue: displayThemeHue }}
            themeHue={displayThemeHue}
            walletNameTestId={WALLET_CONFIG_PREVIEW_NAME_TEST_ID}
            chain={currentChainAddr?.chain as ChainType}
            chainName={currentChainAddr?.chain || ''}
            address={currentChainAddr?.address || wallet.address}
            chainIconUrl={chainIconUrls[currentChainAddr?.chain ?? '']}
            onOpenChainSelector={handleOpenChainSelector}
          />
        </div>
      </div>

      {isEditMode ? (
        <>
          {/* 名称输入 */}
          <div className="space-y-2">
            <label className="text-muted-foreground text-sm">{t('onboarding:theme.walletName')}</label>
            <InputGroup>
              <InputGroupInput
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder={t('wallet:defaultName')}
                maxLength={20}
                className="text-center"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => setEditName(t('onboarding:create.generatedNamePattern', {
                    word: getRandomWalletWord(currentLanguage),
                    suffix: t('onboarding:create.walletSuffix'),
                  }))}
                  title={t('wallet:randomName')}
                >
                  <Dice className="size-4" />
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </div>

          {/* 主题色选择 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('onboarding:theme.customColor')}</span>
                <span className="text-muted-foreground font-mono">{editThemeHue.toFixed(1)}°</span>
              </div>
              <div
                ref={sliderRef}
                className="relative h-8 cursor-pointer touch-none rounded-full"
                style={{
                  background:
                    'linear-gradient(to right, oklch(0.6 0.25 0), oklch(0.6 0.25 60), oklch(0.6 0.25 120), oklch(0.6 0.25 180), oklch(0.6 0.25 240), oklch(0.6 0.25 300), oklch(0.6 0.25 360))',
                }}
                onMouseDown={handleSliderMouseDown}
                onTouchStart={handleSliderTouchStart}
              >
                {existingHues.map((hue, idx) => (
                  <div
                    key={idx}
                    className="absolute top-0 h-full w-0.5 bg-black/30"
                    style={{ left: `${(hue / 360) * 100}%` }}
                    title={t('onboarding:theme.usedColor')}
                  />
                ))}
                <div
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(editThemeHue / 360) * 100}%` }}
                >
                  <div
                    className="size-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: `oklch(0.6 0.25 ${editThemeHue})` }}
                  />
                </div>
              </div>
            </div>

            {/* 预设颜色 */}
            <div className="flex flex-wrap justify-center gap-3">
              {weightedColors.map((color) => {
                const isSelected = Math.abs(editThemeHue - color.hue) < 0.5;
                const isLowWeight = color.weight < 0.5;
                return (
                  <button
                    key={color.hue}
                    type="button"
                    onClick={() => setEditThemeHue(color.hue)}
                    className={cn(
                      'relative size-10 rounded-full transition-all',
                      'ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                      isSelected && 'ring-primary ring-2 ring-offset-2',
                      isLowWeight && 'opacity-50',
                    )}
                    style={{ backgroundColor: color.color }}
                    title={t(color.nameKey)}
                  >
                    {isSelected && <IconCheck className="absolute inset-0 m-auto size-5 text-white drop-shadow-md" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 操作按钮 */}
          {mode === 'edit-only' ? (
            <Button
              className="w-full"
              onClick={handleConfirm}
              disabled={!editName.trim()}
              data-testid="theme-complete-button"
              style={
                {
                  '--primary-hue': editThemeHue,
                  '--primary': `oklch(var(--primary-lightness) var(--primary-saturation) ${editThemeHue})`,
                } as React.CSSProperties
              }
            >
              {t('common:confirm')}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                {t('common:cancel')}
              </Button>
              <Button
                className="flex-1"
                onClick={handleSave}
                disabled={!editName.trim()}
                style={
                  {
                    '--primary-hue': editThemeHue,
                    '--primary': `oklch(var(--primary-lightness) var(--primary-saturation) ${editThemeHue})`,
                  } as React.CSSProperties
                }
              >
                {t('common:save')}
              </Button>
            </div>
          )}
        </>
      ) : (
        /* default 模式：功能按钮 */
        <div className="flex justify-center gap-8">
          <button onClick={handleStartEdit} className="group flex flex-col items-center gap-1.5">
            <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex size-12 items-center justify-center rounded-full transition-all active:scale-95">
              <Edit3 className="size-5" />
            </div>
            <span className="text-xs font-medium">{t('wallet:detail.editName')}</span>
          </button>
          <button onClick={handleExportMnemonic} className="group flex flex-col items-center gap-1.5">
            <div className="bg-primary/10 text-primary group-hover:bg-primary/20 flex size-12 items-center justify-center rounded-full transition-all active:scale-95">
              <KeyRound className="size-5" />
            </div>
            <span className="text-xs font-medium">{t('wallet:detail.exportMnemonic')}</span>
          </button>
          <button onClick={handleDelete} className="group flex flex-col items-center gap-1.5">
            <div className="bg-destructive/10 text-destructive group-hover:bg-destructive/20 flex size-12 items-center justify-center rounded-full transition-all active:scale-95">
              <Trash2 className="size-5" />
            </div>
            <span className="text-destructive text-xs font-medium">{t('wallet:detail.deleteWallet')}</span>
          </button>
        </div>
      )}
    </div>
  );
}
