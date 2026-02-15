import { useEffect, useRef, useState, Activity } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { SwiperSyncProvider } from "@/components/common/swiper-sync-context";
import { TabBar, type TabId } from "../components/TabBar";
import { WalletTab } from "./tabs/WalletTab";
import { EcosystemTab } from "./tabs/EcosystemTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { useFlow } from "../stackflow";
import { superjson } from "@biochain/chain-effect";
import type { BioAccount, EcosystemDestroyParams, EcosystemTransferParams, SignedTransaction } from "@/services/ecosystem";
import {
  getBridge,
  initBioProvider,
  setChainSwitchConfirm,
  setCryptoAuthorizeDialog,
  setDestroyDialog,
  setEvmSigningDialog,
  setEvmTransactionDialog,
  setEvmWalletPicker,
  setGetAccounts,
  setSigningDialog,
  setSignTransactionDialog,
  setTronWalletPicker,
  setTransferDialog,
  setWalletPicker,
} from "@/services/ecosystem";
import { getKeyAppChainId } from "@biochain/bio-sdk";
import { walletSelectors, walletStore, type ChainAddress } from "@/stores";
import { miniappRuntimeStore } from "@/services/miniapp-runtime";

type MainTabsParams = {
  tab?: TabId;
};

export const MainTabsActivity: ActivityComponentType<MainTabsParams> = ({ params }) => {
  const { push } = useFlow();
  const [activeTab, setActiveTab] = useState<TabId>(params.tab || "wallet");

  const transferSheetTailRef = useRef<Promise<void>>(Promise.resolve());
  const transferSheetSeqRef = useRef(0);

  useEffect(() => {
    initBioProvider();

    getBridge().setPermissionRequestCallback(async (appId, appName, permissions) => {
      const appIcon = miniappRuntimeStore.state.apps.get(appId)?.manifest.icon;

      return new Promise<boolean>((resolve) => {
        const timeout = window.setTimeout(() => resolve(false), 30_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as { approved?: boolean } | undefined;
          resolve(detail?.approved === true);
        };

        window.addEventListener("permission-request", handleResult, { once: true });

        push("PermissionRequestJob", {
          appName,
          appIcon,
          permissions: JSON.stringify(permissions),
        });
      });
    });

    setWalletPicker(async (opts?: { chain?: string; exclude?: string; app?: { name: string; icon?: string } }) => {
      const appName = opts?.app?.name;
      const appIcon = opts?.app?.icon;

      return new Promise<BioAccount | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 30_000);

        const cleanup = () => {
          window.clearTimeout(timeout);
          window.removeEventListener("wallet-picker-select", handleSelect);
          window.removeEventListener("wallet-picker-cancel", handleCancel);
        };

        const handleSelect = (e: Event) => {
          cleanup();
          const detail = (e as CustomEvent).detail as { address: string; chain: string; name?: string };
          resolve({ address: detail.address, chain: detail.chain, name: detail.name });
        };

        const handleCancel = () => {
          cleanup();
          resolve(null);
        };

        window.addEventListener("wallet-picker-select", handleSelect);
        window.addEventListener("wallet-picker-cancel", handleCancel);

        push("WalletPickerJob", {
          chain: opts?.chain,
          exclude: opts?.exclude,
          ...(appName ? { appName } : {}),
          ...(appIcon ? { appIcon } : {}),
        });
      });
    });

    setGetAccounts((): BioAccount[] => {
      const state = walletStore.state;
      const wallet = walletSelectors.getCurrentWallet(state);
      if (!wallet) return [];

      return wallet.chainAddresses.map((ca: ChainAddress) => ({
        address: ca.address,
        chain: ca.chain,
        name: wallet.name,
      }));
    });

    setSigningDialog(async (params) => {
      return new Promise<{ signature: string; publicKey: string } | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 60_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as
            | { confirmed?: boolean; signature?: string; publicKey?: string }
            | undefined;
          if (detail?.confirmed && detail.signature && detail.publicKey) {
            resolve({ signature: detail.signature, publicKey: detail.publicKey });
            return;
          }
          resolve(null);
        };

        window.addEventListener("signing-confirm", handleResult, { once: true });
        push("SigningConfirmJob", {
          message: params.message,
          address: params.address,
          appName: params.app.name,
          appIcon: params.app.icon ?? "",
          chainName: params.chainName,
        });
      });
    });

    const logTransferSheet = (stage: string, payload: Record<string, unknown>) => {
      console.log('[miniapp-transfer-sheet]', stage, payload);
    };

    const enqueueTransferSheetTask = <T,>(task: () => Promise<T>, meta: { requestId: string; source: 'bio' | 'evm' | 'destroy' }): Promise<T> => {
      logTransferSheet('queue.enqueue', meta);

      const run = transferSheetTailRef.current
        .catch(() => undefined)
        .then(async () => {
          logTransferSheet('queue.start', meta);
          return task();
        });

      transferSheetTailRef.current = run.then(
        () => {
          logTransferSheet('queue.done', meta);
          return undefined;
        },
        (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          logTransferSheet('queue.error', { ...meta, message });
          return undefined;
        },
      );

      return run;
    };

    setTransferDialog(async (params: EcosystemTransferParams & { app: { name: string; icon?: string } }) => {
      const requestId = `transfer-${Date.now()}-${++transferSheetSeqRef.current}`;

      return new Promise<{ txHash: string; txId?: string; transaction?: Record<string, unknown> } | null>((resolveResult) => {
        void enqueueTransferSheetTask(
          () =>
            new Promise<void>((releaseQueue) => {
              let resultSettled = false;
              let queueReleased = false;

              const cleanup = () => {
                window.removeEventListener("miniapp-transfer-confirm", handleResult);
                window.removeEventListener("miniapp-transfer-sheet-closed", handleSheetClosed);
              };

              const resolveResultOnce = (value: { txHash: string; txId?: string; transaction?: Record<string, unknown> } | null) => {
                if (resultSettled) return;
                resultSettled = true;
                resolveResult(value);
                if (queueReleased) {
                  cleanup();
                }
              };

              const releaseQueueOnce = (reason: string) => {
                if (queueReleased) return;
                queueReleased = true;
                logTransferSheet('queue.release', {
                  requestId,
                  source: 'bio',
                  reason,
                  resultSettled,
                });
                releaseQueue();
                if (resultSettled) {
                  cleanup();
                }
              };

              const handleResult = (e: Event) => {
                const detail = (e as CustomEvent).detail as
                  | { requestId?: string; confirmed?: boolean; txHash?: string; txId?: string; transaction?: Record<string, unknown> }
                  | undefined;

                if (detail?.requestId !== requestId) {
                  logTransferSheet('dialog.ignore', { requestId, source: 'bio', incomingRequestId: detail?.requestId ?? 'unknown' });
                  return;
                }

                logTransferSheet('dialog.receive', {
                  requestId,
                  source: 'bio',
                  confirmed: detail?.confirmed === true,
                });

                if (detail?.confirmed && detail.txHash) {
                  resolveResultOnce({
                    txHash: detail.txHash,
                    txId: detail.txId,
                    transaction: detail.transaction,
                  });
                  return;
                }
                resolveResultOnce(null);
              };

              const handleSheetClosed = (e: Event) => {
                const detail = (e as CustomEvent).detail as { requestId?: string; reason?: string } | undefined;
                if (detail?.requestId !== requestId) {
                  return;
                }

                logTransferSheet('dialog.sheet-closed', {
                  requestId,
                  source: 'bio',
                  reason: detail?.reason ?? 'unknown',
                });
                if (!resultSettled) {
                  resolveResultOnce(null);
                }
                releaseQueueOnce(detail?.reason ?? 'sheet-closed');
              };

              window.addEventListener("miniapp-transfer-confirm", handleResult);
              window.addEventListener("miniapp-transfer-sheet-closed", handleSheetClosed);
              logTransferSheet('dialog.push', { requestId, source: 'bio', from: params.from, to: params.to, chain: params.chain });
              push("MiniappTransferConfirmJob", {
                requestId,
                appName: params.app.name,
                appIcon: params.app.icon ?? "",
                from: params.from,
                to: params.to,
                amount: params.amount,
                chain: params.chain,
                ...(params.asset ? { asset: params.asset } : {}),
                ...(params.remark ? { remark: params.remark } : {}),
              });
            }),
          { requestId, source: 'bio' },
        );
      });
    });

    setDestroyDialog(async (params: EcosystemDestroyParams & { app: { name: string; icon?: string } }) => {
      const requestId = `destroy-${Date.now()}-${++transferSheetSeqRef.current}`;

      return new Promise<{ txHash: string; txId?: string; transaction?: Record<string, unknown> } | null>((resolveResult) => {
        void enqueueTransferSheetTask(
          () =>
            new Promise<void>((releaseQueue) => {
              let resultSettled = false;
              let queueReleased = false;

              const cleanup = () => {
                window.removeEventListener("miniapp-destroy-confirm", handleResult);
                window.removeEventListener("miniapp-destroy-sheet-closed", handleSheetClosed);
              };

              const resolveResultOnce = (value: { txHash: string; txId?: string; transaction?: Record<string, unknown> } | null) => {
                if (resultSettled) return;
                resultSettled = true;
                resolveResult(value);
                if (queueReleased) {
                  cleanup();
                }
              };

              const releaseQueueOnce = (reason: string) => {
                if (queueReleased) return;
                queueReleased = true;
                logTransferSheet('queue.release', {
                  requestId,
                  source: 'destroy',
                  reason,
                  resultSettled,
                });
                releaseQueue();
                if (resultSettled) {
                  cleanup();
                }
              };

              const handleResult = (e: Event) => {
                const detail = (e as CustomEvent).detail as
                  | { requestId?: string; confirmed?: boolean; txHash?: string; txId?: string; transaction?: Record<string, unknown> }
                  | undefined;

                if (detail?.requestId !== requestId) {
                  logTransferSheet('dialog.ignore', { requestId, source: 'destroy', incomingRequestId: detail?.requestId ?? 'unknown' });
                  return;
                }

                logTransferSheet('dialog.receive', {
                  requestId,
                  source: 'destroy',
                  confirmed: detail?.confirmed === true,
                });

                if (detail?.confirmed && detail.txHash) {
                  resolveResultOnce({
                    txHash: detail.txHash,
                    txId: detail.txId,
                    transaction: detail.transaction,
                  });
                  return;
                }
                resolveResultOnce(null);
              };

              const handleSheetClosed = (e: Event) => {
                const detail = (e as CustomEvent).detail as { requestId?: string; reason?: string } | undefined;
                if (detail?.requestId !== requestId) {
                  return;
                }

                logTransferSheet('dialog.sheet-closed', {
                  requestId,
                  source: 'destroy',
                  reason: detail?.reason ?? 'unknown',
                });
                if (!resultSettled) {
                  resolveResultOnce(null);
                }
                releaseQueueOnce(detail?.reason ?? 'sheet-closed');
              };

              window.addEventListener("miniapp-destroy-confirm", handleResult);
              window.addEventListener("miniapp-destroy-sheet-closed", handleSheetClosed);
              logTransferSheet('dialog.push', { requestId, source: 'destroy', from: params.from, chain: params.chain, asset: params.asset });
              push("MiniappDestroyConfirmJob", {
                requestId,
                appName: params.app.name,
                appIcon: params.app.icon ?? "",
                from: params.from,
                amount: params.amount,
                chain: params.chain,
                asset: params.asset,
                ...(params.remark ? { remark: params.remark } : {}),
              });
            }),
          { requestId, source: 'destroy' },
        );
      });
    });

    setSignTransactionDialog(async (params) => {
      return new Promise<SignedTransaction | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 60_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as
            | { confirmed?: boolean; signedTx?: SignedTransaction }
            | undefined;
          if (detail?.confirmed && detail.signedTx) {
            resolve(detail.signedTx);
            return;
          }
          resolve(null);
        };

        window.addEventListener("miniapp-sign-transaction-confirm", handleResult, { once: true });
        push("MiniappSignTransactionJob", {
          appName: params.app.name,
          appIcon: params.app.icon ?? "",
          from: params.from,
          chain: params.chain,
          unsignedTx: superjson.stringify(params.unsignedTx),
        });
      });
    });

    setEvmWalletPicker(async (opts) => {
      const appName = opts.app?.name;
      const appIcon = opts.app?.icon;

      return new Promise<BioAccount | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 30_000);

        const cleanup = () => {
          window.clearTimeout(timeout);
          window.removeEventListener("wallet-picker-select", handleSelect);
          window.removeEventListener("wallet-picker-cancel", handleCancel);
        };

        const handleSelect = (e: Event) => {
          cleanup();
          const detail = (e as CustomEvent).detail as { address: string; chain: string; name?: string };
          resolve({ address: detail.address, chain: detail.chain, name: detail.name });
        };

        const handleCancel = () => {
          cleanup();
          resolve(null);
        };

        window.addEventListener("wallet-picker-select", handleSelect);
        window.addEventListener("wallet-picker-cancel", handleCancel);

        push("WalletPickerJob", {
          chain: opts.chainId,
          ...(appName ? { appName } : {}),
          ...(appIcon ? { appIcon } : {}),
        });
      });
    });

    setChainSwitchConfirm(async (opts) => {
      return new Promise<boolean>((resolve) => {
        const timeout = window.setTimeout(() => resolve(false), 30_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as { approved?: boolean } | undefined;
          resolve(detail?.approved === true);
        };

        window.addEventListener("chain-switch-confirm", handleResult, { once: true });

        push("ChainSwitchConfirmJob", {
          fromChainId: opts.fromChainId,
          toChainId: opts.toChainId,
          appName: opts.appName,
          appIcon: opts.appIcon,
        });
      });
    });

    setEvmSigningDialog(async (params) => {
      return new Promise<{ signature: string } | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 60_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as
            | { confirmed?: boolean; signature?: string }
            | undefined;
          if (detail?.confirmed && detail.signature) {
            resolve({ signature: detail.signature });
            return;
          }
          resolve(null);
        };

        window.addEventListener("signing-confirm", handleResult, { once: true });
        push("SigningConfirmJob", {
          message: params.message,
          address: params.address,
          appName: params.appName,
          chainName: "ethereum",
        });
      });
    });

    setEvmTransactionDialog(async (params) => {
      const { from, to, value, chainId } = params.tx;
      if (!from || !to) {
        return null;
      }

      const valueBigInt = BigInt(value ?? "0x0");
      const amount = valueBigInt.toString();
      const keyAppChainId = chainId ? getKeyAppChainId(chainId) : null;
      const requestId = `transfer-${Date.now()}-${++transferSheetSeqRef.current}`;

      return new Promise<{ txHash: string } | null>((resolveResult) => {
        void enqueueTransferSheetTask(
          () =>
            new Promise<void>((releaseQueue) => {
              let resultSettled = false;
              let queueReleased = false;

              const cleanup = () => {
                window.removeEventListener("miniapp-transfer-confirm", handleResult);
                window.removeEventListener("miniapp-transfer-sheet-closed", handleSheetClosed);
              };

              const resolveResultOnce = (value: { txHash: string } | null) => {
                if (resultSettled) return;
                resultSettled = true;
                resolveResult(value);
                if (queueReleased) {
                  cleanup();
                }
              };

              const releaseQueueOnce = (reason: string) => {
                if (queueReleased) return;
                queueReleased = true;
                logTransferSheet('queue.release', {
                  requestId,
                  source: 'evm',
                  reason,
                  resultSettled,
                });
                releaseQueue();
                if (resultSettled) {
                  cleanup();
                }
              };

              const handleResult = (e: Event) => {
                const detail = (e as CustomEvent).detail as { requestId?: string; confirmed?: boolean; txHash?: string } | undefined;

                if (detail?.requestId !== requestId) {
                  logTransferSheet('dialog.ignore', { requestId, source: 'evm', incomingRequestId: detail?.requestId ?? 'unknown' });
                  return;
                }

                logTransferSheet('dialog.receive', {
                  requestId,
                  source: 'evm',
                  confirmed: detail?.confirmed === true,
                });

                if (detail?.confirmed && detail.txHash) {
                  resolveResultOnce({ txHash: detail.txHash });
                  return;
                }
                resolveResultOnce(null);
              };

              const handleSheetClosed = (e: Event) => {
                const detail = (e as CustomEvent).detail as { requestId?: string; reason?: string } | undefined;
                if (detail?.requestId !== requestId) {
                  return;
                }

                logTransferSheet('dialog.sheet-closed', {
                  requestId,
                  source: 'evm',
                  reason: detail?.reason ?? 'unknown',
                });
                if (!resultSettled) {
                  resolveResultOnce(null);
                }
                releaseQueueOnce(detail?.reason ?? 'sheet-closed');
              };

              window.addEventListener("miniapp-transfer-confirm", handleResult);
              window.addEventListener("miniapp-transfer-sheet-closed", handleSheetClosed);
              logTransferSheet('dialog.push', { requestId, source: 'evm', from, to, chain: keyAppChainId ?? 'ethereum' });
              push("MiniappTransferConfirmJob", {
                requestId,
                appName: params.appName,
                from,
                to,
                amount,
                chain: keyAppChainId ?? "ethereum",
              });
            }),
          { requestId, source: 'evm' },
        );
      });
    });

    setTronWalletPicker(async (opts) => {
      const appName = opts?.app?.name;
      const appIcon = opts?.app?.icon;

      return new Promise<BioAccount | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 30_000);

        const cleanup = () => {
          window.clearTimeout(timeout);
          window.removeEventListener("wallet-picker-select", handleSelect);
          window.removeEventListener("wallet-picker-cancel", handleCancel);
        };

        const handleSelect = (e: Event) => {
          cleanup();
          const detail = (e as CustomEvent).detail as { address: string; chain: string; name?: string };
          resolve({ address: detail.address, chain: detail.chain, name: detail.name });
        };

        const handleCancel = () => {
          cleanup();
          resolve(null);
        };

        window.addEventListener("wallet-picker-select", handleSelect);
        window.addEventListener("wallet-picker-cancel", handleCancel);

        push("WalletPickerJob", {
          chain: "tron",
          ...(appName ? { appName } : {}),
          ...(appIcon ? { appIcon } : {}),
        });
      });
    });

    // Crypto 黑盒授权对话框
    setCryptoAuthorizeDialog((_appId: string) => async (params) => {
      return new Promise<{ approved: boolean; patternKey?: string; walletId?: string; selectedDuration?: string }>((resolve) => {
        const timeout = window.setTimeout(() => resolve({ approved: false }), 60_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as
            | { approved?: boolean; patternKey?: string; walletId?: string; selectedDuration?: string }
            | undefined;
          if (detail?.approved && detail.patternKey && detail.walletId) {
            resolve({ approved: true, patternKey: detail.patternKey, walletId: detail.walletId, selectedDuration: detail.selectedDuration });
            return;
          }
          resolve({ approved: false });
        };

        window.addEventListener("crypto-authorize-confirm", handleResult, { once: true });
        push("CryptoAuthorizeJob", {
          actions: superjson.stringify(params.actions),
          duration: params.duration,
          address: params.address,
          chainId: params.chainId,
          appName: params.app.name,
          appIcon: params.app.icon,
        });
      });
    });

    return () => {
      getBridge().setPermissionRequestCallback(null);
      setWalletPicker(null);
      setEvmWalletPicker(null);
      setChainSwitchConfirm(null);
      setEvmSigningDialog(null);
      setEvmTransactionDialog(null);
      setTronWalletPicker(null);
      setCryptoAuthorizeDialog(null);
      setGetAccounts(null);
      setSigningDialog(null);
      setTransferDialog(null);
      setDestroyDialog(null);
      setSignTransactionDialog(null);
    };
  }, [push]);

  return (
    <AppScreen>
      <SwiperSyncProvider>
        <div className="bg-background relative h-dvh">
          {/* Content area - 各 Tab 内部自己管理滚动和 pb */}
          <Activity mode={activeTab === "wallet" ? "visible" : "hidden"}>
            <WalletTab />
          </Activity>
          {/* EcosystemTab 不使用 Activity 包裹，避免 slot 被注销导致小程序窗口问题 */}
          <div style={{ display: activeTab === "ecosystem" ? "contents" : "none" }}>
            <EcosystemTab />
          </div>
          <Activity mode={activeTab === "settings" ? "visible" : "hidden"}>
            <SettingsTab />
          </Activity>

          {/* TabBar - 固定在底部 */}
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </SwiperSyncProvider>
    </AppScreen>
  );
};
