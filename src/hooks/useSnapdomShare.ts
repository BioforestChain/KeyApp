/**
 * useSnapdomShare - 截图分享 hook
 * 
 * 封装 snapdom 的下载和分享逻辑，供 ContactCard 相关页面复用
 */

import { useCallback, useState, type RefObject } from 'react';

export interface UseSnapdomShareOptions {
    /** 下载/分享的文件名（不含扩展名） */
    filename: string;
    /** 分享时的标题 */
    shareTitle?: string;
    /** 分享时的描述文本 */
    shareText?: string;
}

export interface UseSnapdomShareResult {
    /** 是否正在处理（下载或分享中） */
    isProcessing: boolean;
    /** 下载为 PNG 图片 */
    download: () => Promise<void>;
    /** 使用系统分享功能 */
    share: () => Promise<void>;
    /** 浏览器是否支持分享 */
    canShare: boolean;
}

/**
 * 截图分享 hook
 * @param cardRef 需要截图的元素引用
 * @param options 配置选项
 */
export function useSnapdomShare(
    cardRef: RefObject<HTMLElement | null>,
    options: UseSnapdomShareOptions
): UseSnapdomShareResult {
    const [isProcessing, setIsProcessing] = useState(false);
    const { filename, shareTitle, shareText } = options;

    const download = useCallback(async () => {
        const element = cardRef.current;
        if (!element || isProcessing) return;

        setIsProcessing(true);
        try {
            const { snapdom } = await import('@zumer/snapdom');
            await snapdom.download(element, {
                type: 'png',
                filename: `${filename}.png`,
                scale: 2,
                quality: 1,
            });
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [cardRef, filename, isProcessing]);

    const share = useCallback(async () => {
        const element = cardRef.current;
        if (!element || !navigator.share || isProcessing) return;

        setIsProcessing(true);
        try {
            const { snapdom } = await import('@zumer/snapdom');
            const result = await snapdom(element, { scale: 2 });
            const blob = await result.toBlob();
            const file = new File([blob], `${filename}.png`, { type: 'image/png' });

            await navigator.share({
                title: shareTitle,
                text: shareText,
                files: [file],
            });
        } catch {
            // User cancelled or share failed
        } finally {
            setIsProcessing(false);
        }
    }, [cardRef, filename, shareTitle, shareText, isProcessing]);

    return {
        isProcessing,
        download,
        share,
        canShare: typeof navigator !== 'undefined' && 'share' in navigator,
    };
}
