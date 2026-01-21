/**
 * PermissionRequestJob - 权限请求对话框
 * 用于小程序首次请求权限时显示
 */

import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  IconWallet,
  IconSignature,
  IconCurrencyDollar,
  IconFileText,
  IconShieldCheck,
  IconApps,
} from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';

type PermissionRequestJobParams = {
  /** 小程序名称 */
  appName: string;
  /** 小程序图标 */
  appIcon?: string;
  /** 请求的权限列表 (JSON 字符串) */
  permissions: string;
};

const PERMISSION_ICONS: Record<string, typeof IconWallet> = {
  bio_requestAccounts: IconWallet,
  bio_createTransaction: IconFileText,
  bio_signMessage: IconSignature,
  bio_signTypedData: IconSignature,
  bio_signTransaction: IconSignature,
  bio_sendTransaction: IconCurrencyDollar,
};

function PermissionRequestJobContent() {
  const { t } = useTranslation('permission');
  const { pop } = useFlow();
  const { appName, appIcon, permissions: permissionsJson } = useActivityParams<PermissionRequestJobParams>();

  const permissions: string[] = (() => {
    try {
      return JSON.parse(permissionsJson) as string[];
    } catch {
      return [];
    }
  })();

  const handleApprove = () => {
    const event = new CustomEvent('permission-request', {
      detail: { approved: true, permissions },
    });
    window.dispatchEvent(event);
    pop();
  };

  const handleReject = () => {
    const event = new CustomEvent('permission-request', {
      detail: { approved: false },
    });
    window.dispatchEvent(event);
    pop();
  };

  const getPermissionLabel = (permKey: string): string => {
    const labelKey = `${permKey}.label` as const;
    return t(labelKey as any) as string;
  };

  const getPermissionDescription = (permKey: string): string => {
    const descKey = `${permKey}.description` as const;
    return t(descKey as any) as string;
  };

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="bg-muted h-1 w-10 rounded-full" />
        </div>

        {/* Header */}
        <div className="border-border border-b px-4 pb-4">
          <div className="bg-primary/10 mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl">
            {appIcon ? (
              <img src={appIcon} alt={appName} className="size-10 rounded-xl" />
            ) : (
              <IconApps className="text-primary size-8" />
            )}
          </div>
          <h2 className="text-center text-lg font-semibold">{appName}</h2>
          <p className="text-muted-foreground mt-1 text-center text-sm">{t('requestsPermissions' as any)}</p>
        </div>

        {/* Permissions List */}
        <div className="p-4">
          <div className="space-y-3">
            {permissions.map((permission) => {
              const Icon = PERMISSION_ICONS[permission];
              if (!Icon) return null;

              return (
                <div key={permission} className="bg-muted/50 flex items-center gap-3 rounded-xl p-3">
                  <div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-full">
                    <Icon className="text-primary size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{getPermissionLabel(permission)}</p>
                    <p className="text-muted-foreground text-sm">{getPermissionDescription(permission)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust indicator */}
          <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
            <IconShieldCheck className="size-4" />
            <span>{t('permissionNote' as any)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4">
          <button
            onClick={handleReject}
            className="bg-muted hover:bg-muted/80 flex-1 rounded-xl py-3 font-medium transition-colors"
          >
            {t('reject')}
          </button>
          <button
            onClick={handleApprove}
            className={cn(
              'flex-1 rounded-xl py-3 font-medium transition-colors',
              'bg-primary text-primary-foreground hover:bg-primary/90',
            )}
          >
            {t('approve')}
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
}

export const PermissionRequestJob: ActivityComponentType<PermissionRequestJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <PermissionRequestJobContent />
    </ActivityParamsProvider>
  );
};
