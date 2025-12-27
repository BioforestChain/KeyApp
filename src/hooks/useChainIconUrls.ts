import { useMemo } from 'react';
import { useChainConfigs } from '@/stores';

/**
 * 获取链图标 URL 映射
 * 用于钱包卡片的防伪水印
 */
export function useChainIconUrls(): Record<string, string> {
  const chainConfigs = useChainConfigs();

  return useMemo(() => {
    const map: Record<string, string> = {};
    for (const config of chainConfigs) {
      if (config.icon) {
        map[config.id] = config.icon;
      }
    }
    return map;
  }, [chainConfigs]);
}
