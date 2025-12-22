import type { ActivityComponentType } from "@stackflow/react";
import { BottomSheet } from "@stackflow/plugin-basic-ui";
import { useTranslation } from "react-i18next";
import { IconCheck } from "@tabler/icons-react";
import { ChainIcon } from "@/components/wallet/chain-icon";
import { useCurrentWallet, useSelectedChain, useAvailableChains, walletActions, type ChainType } from "@/stores";
import { useFlow } from "../../stackflow";

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: "Ethereum",
  bitcoin: "Bitcoin",
  tron: "Tron",
  binance: "BSC",
  bfmeta: "BFMeta",
  ccchain: "CCChain",
  pmchain: "PMChain",
  bfchainv2: "BFChain V2",
  btgmeta: "BTGMeta",
  biwmeta: "BIWMeta",
  ethmeta: "ETHMeta",
  malibu: "Malibu",
};

function truncateAddress(address: string, startChars = 10, endChars = 8): string {
  if (address.length <= startChars + endChars + 3) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export const ChainSelectorSheetActivity: ActivityComponentType = () => {
  const { t } = useTranslation(["home", "common"]);
  const { pop } = useFlow();
  const currentWallet = useCurrentWallet();
  const selectedChain = useSelectedChain();
  const availableChains = useAvailableChains();

  const handleSelectChain = (chain: ChainType) => {
    walletActions.setSelectedChain(chain);
    pop();
  };

  return (
    <BottomSheet>
      <div className="bg-background rounded-t-2xl">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Title */}
        <div className="border-b border-border px-4 pb-4">
          <h2 className="text-center text-lg font-semibold">{t("home:wallet.selectNetwork")}</h2>
        </div>

        {/* Chain List - scrollable with max height */}
        <div data-testid="chain-sheet" className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
          {availableChains.map((chain) => {
            const chainAddr = currentWallet?.chainAddresses.find((ca) => ca.chain === chain);
            return (
              <button
                key={chain}
                onClick={() => handleSelectChain(chain)}
                className={`flex w-full items-center gap-3 rounded-xl p-4 transition-colors ${
                  chain === selectedChain
                    ? "bg-primary/10 ring-1 ring-primary"
                    : "bg-muted/50 hover:bg-muted"
                }`}
              >
                <ChainIcon chain={chain} size="md" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{CHAIN_NAMES[chain] ?? chain}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {chainAddr?.address ? truncateAddress(chainAddr.address) : "---"}
                  </div>
                </div>
                {chain === selectedChain && <IconCheck className="size-5 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* Safe area */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </BottomSheet>
  );
};
