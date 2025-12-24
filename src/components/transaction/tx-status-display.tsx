/**
 * 交易状态显示组件
 * 用于显示交易广播和上链状态，可复用于：
 * - 设置安全密码
 * - 转账
 * - 其他签名交易
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import {
  IconCheck as Check,
  IconLoader2 as Loader,
  IconAlertCircle as AlertCircle,
} from "@tabler/icons-react";

export type TxStatus = "broadcasting" | "broadcasted" | "confirming" | "confirmed" | "failed";

export interface TxStatusDisplayProps {
  /** 当前状态 */
  status: TxStatus;
  /** 交易哈希 */
  txHash?: string | undefined;
  /** 自定义标题 */
  title?: {
    broadcasting?: string;
    broadcasted?: string;
    confirming?: string;
    confirmed?: string;
    failed?: string;
  };
  /** 自定义描述 */
  description?: {
    broadcasting?: string;
    broadcasted?: string;
    confirming?: string;
    confirmed?: string;
    failed?: string;
  };
  /** 错误信息 */
  errorMessage?: string | undefined;
  /** 检查上链的回调 */
  checkConfirmed?: (() => Promise<boolean>) | undefined;
  /** 状态变化回调 */
  onStatusChange?: (status: TxStatus) => void;
  /** 点击完成按钮 */
  onDone?: () => void;
  /** 点击重试按钮 */
  onRetry?: () => void;
  /** 点击查看详情按钮 */
  onViewDetails?: () => void;
  /** 点击分享按钮（目前复制链接） */
  onShare?: () => void;
  /** 轮询间隔（毫秒） */
  pollInterval?: number;
  /** 最大轮询次数 */
  maxPollAttempts?: number;
  /** 额外内容（显示在状态下方） */
  children?: React.ReactNode;
}

export function TxStatusDisplay({
  status,
  txHash,
  title,
  description,
  errorMessage,
  checkConfirmed,
  onStatusChange,
  onDone,
  onRetry,
  onViewDetails,
  onShare,
  pollInterval = 10000,
  maxPollAttempts = 18,
  children,
}: TxStatusDisplayProps) {
  const { t } = useTranslation(["transaction", "common"]);
  const [internalStatus, setInternalStatus] = useState(status);

  // 同步外部状态
  useEffect(() => {
    setInternalStatus(status);
  }, [status]);

  // 广播成功后轮询检查上链
  useEffect(() => {
    if (internalStatus !== "broadcasted" || !checkConfirmed) return;

    let cancelled = false;
    let attempts = 0;

    const checkStatus = async () => {
      if (cancelled || attempts >= maxPollAttempts) return;
      attempts++;
      
      // 切换到 confirming 状态
      if (attempts === 1) {
        setInternalStatus("confirming");
        onStatusChange?.("confirming");
      }

      try {
        const confirmed = await checkConfirmed();
        if (confirmed && !cancelled) {
          setInternalStatus("confirmed");
          onStatusChange?.("confirmed");
        } else if (!cancelled && attempts < maxPollAttempts) {
          setTimeout(checkStatus, pollInterval);
        }
      } catch {
        if (!cancelled && attempts < maxPollAttempts) {
          setTimeout(checkStatus, pollInterval);
        }
      }
    };

    // 首次检查延迟 3 秒
    const timer = setTimeout(checkStatus, 3000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [internalStatus, checkConfirmed, onStatusChange, pollInterval, maxPollAttempts]);

  const getTitle = () => {
    switch (internalStatus) {
      case "broadcasting":
        return title?.broadcasting ?? t("transaction:txStatus.broadcasting");
      case "broadcasted":
        return title?.broadcasted ?? t("transaction:txStatus.broadcasted");
      case "confirming":
        return title?.confirming ?? t("transaction:txStatus.confirming");
      case "confirmed":
        return title?.confirmed ?? t("transaction:txStatus.confirmed");
      case "failed":
        return title?.failed ?? t("transaction:txStatus.failed");
    }
  };

  const getDescription = () => {
    if (internalStatus === "failed" && errorMessage) {
      return errorMessage;
    }
    switch (internalStatus) {
      case "broadcasting":
        return description?.broadcasting ?? t("transaction:txStatus.broadcastingDesc");
      case "broadcasted":
        return description?.broadcasted ?? t("transaction:txStatus.broadcastedDesc");
      case "confirming":
        return description?.confirming ?? t("transaction:txStatus.confirmingDesc");
      case "confirmed":
        return description?.confirmed ?? t("transaction:txStatus.confirmedDesc");
      case "failed":
        return description?.failed ?? t("transaction:txStatus.failedDesc");
    }
  };

  const getIcon = () => {
    switch (internalStatus) {
      case "broadcasting":
      case "confirming":
        return <Loader className="size-8 animate-spin" />;
      case "broadcasted":
        return <Check className="size-8" />;
      case "confirmed":
        return <Check className="size-8" />;
      case "failed":
        return <AlertCircle className="size-8" />;
    }
  };

  const getIconStyle = () => {
    switch (internalStatus) {
      case "broadcasting":
      case "confirming":
        return "bg-blue-100 text-blue-600";
      case "broadcasted":
        return "bg-blue-100 text-blue-600";
      case "confirmed":
        return "bg-green-100 text-green-600";
      case "failed":
        return "bg-red-100 text-red-600";
    }
  };

  // 广播成功后就可以关闭，不需要等待上链确认
  const showDoneButton = internalStatus === "confirmed" || internalStatus === "broadcasted" || internalStatus === "confirming";
  const showRetryButton = internalStatus === "failed" && onRetry;

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <div className={cn("flex size-16 items-center justify-center rounded-full", getIconStyle())}>
        {getIcon()}
      </div>
      
      <h2 className="text-lg font-semibold">{getTitle()}</h2>
      
      <p className="text-center text-sm text-muted-foreground">
        {getDescription()}
      </p>

      {txHash && (
        <p className="text-xs text-muted-foreground font-mono truncate max-w-full px-4">
          {txHash.slice(0, 16)}...{txHash.slice(-16)}
        </p>
      )}

      {children}

      {showDoneButton && (
        <div className="flex w-full max-w-xs flex-col gap-2">
          {onDone && (
            <button
              type="button"
              onClick={onDone}
              data-testid="tx-status-done-button"
              className={cn(
                "w-full rounded-full py-3 font-medium text-white transition-colors",
                "bg-primary hover:bg-primary/90"
              )}
            >
              {t("common:done")}
            </button>
          )}
          
          <div className="flex gap-2">
            {onViewDetails && (
              <button
                type="button"
                onClick={onViewDetails}
                data-testid="tx-status-view-details-button"
                className="flex-1 rounded-full border border-border py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t("transaction:txStatus.viewDetails")}
              </button>
            )}
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                data-testid="tx-status-share-button"
                className="flex-1 rounded-full border border-border py-2 text-sm font-medium transition-colors hover:bg-muted"
              >
                {t("common:share")}
              </button>
            )}
          </div>
        </div>
      )}

      {showRetryButton && (
        <button
          type="button"
          onClick={onRetry}
          data-testid="tx-status-retry-button"
          className={cn(
            "w-full max-w-xs rounded-full py-3 font-medium text-white transition-colors",
            "bg-primary hover:bg-primary/90"
          )}
        >
          {t("common:retry")}
        </button>
      )}
    </div>
  );
}
