import { useEffect, useState, Activity } from "react";
import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";
import { SwiperSyncProvider } from "@/components/common/swiper-sync-context";
import { TabBar, type TabId } from "../components/TabBar";
import { WalletTab } from "./tabs/WalletTab";
import { EcosystemTab } from "./tabs/EcosystemTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { useFlow } from "../stackflow";
import type { BioAccount, BioSignedTransaction, TransferParams } from "@/services/ecosystem";
import {
  getBridge,
  initBioProvider,
  setGetAccounts,
  setSigningDialog,
  setSignTransactionDialog,
  setTransferDialog,
  setWalletPicker,
} from "@/services/ecosystem";
import { walletSelectors, walletStore, type ChainAddress } from "@/stores";
import { miniappRuntimeStore } from "@/services/miniapp-runtime";

type MainTabsParams = {
  tab?: TabId;
};

export const MainTabsActivity: ActivityComponentType<MainTabsParams> = ({ params }) => {
  const { push } = useFlow();
  const [activeTab, setActiveTab] = useState<TabId>(params.tab || "wallet");

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
          chainName: "bioforest",
        });
      });
    });

    setTransferDialog(async (params: TransferParams & { app: { name: string; icon?: string } }) => {
      return new Promise<{ txHash: string } | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 60_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as { confirmed?: boolean; txHash?: string } | undefined;
          if (detail?.confirmed && detail.txHash) {
            resolve({ txHash: detail.txHash });
            return;
          }
          resolve(null);
        };

        window.addEventListener("miniapp-transfer-confirm", handleResult, { once: true });
        push("MiniappTransferConfirmJob", {
          appName: params.app.name,
          appIcon: params.app.icon ?? "",
          from: params.from,
          to: params.to,
          amount: params.amount,
          chain: params.chain,
          ...(params.asset ? { asset: params.asset } : {}),
        });
      });
    });

    setSignTransactionDialog(async (params) => {
      return new Promise<BioSignedTransaction | null>((resolve) => {
        const timeout = window.setTimeout(() => resolve(null), 60_000);

        const handleResult = (e: Event) => {
          window.clearTimeout(timeout);
          const detail = (e as CustomEvent).detail as
            | { confirmed?: boolean; signedTx?: BioSignedTransaction }
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
          unsignedTx: JSON.stringify(params.unsignedTx),
        });
      });
    });

    return () => {
      getBridge().setPermissionRequestCallback(null);
      setWalletPicker(null);
      setGetAccounts(null);
      setSigningDialog(null);
      setTransferDialog(null);
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
          <Activity mode={activeTab === "ecosystem" ? "visible" : "hidden"}>
            <EcosystemTab />
          </Activity>
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
