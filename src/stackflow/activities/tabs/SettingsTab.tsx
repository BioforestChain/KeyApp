import { useFlow } from "../../stackflow";
import { Card, CardContent } from "@/components/ui/card";
import { IconWallet, IconBell, IconChevronRight, IconLanguage, IconLock, IconCurrencyDollar, IconLink } from "@tabler/icons-react";
import { useCurrentWallet } from "@/stores";

function truncateAddress(address: string, startChars = 6, endChars = 4): string {
  if (!address || address.length <= startChars + endChars + 3) return address || "---";
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

export function SettingsTab() {
  const { push } = useFlow();
  const currentWallet = useCurrentWallet();
  const walletAddress = currentWallet?.chainAddresses[0]?.address;

  const settingItems = [
    { icon: IconWallet, label: "钱包管理", action: () => push("WalletListActivity", {}) },
    { icon: IconLanguage, label: "语言设置", action: () => push("SettingsLanguageActivity", {}) },
    { icon: IconCurrencyDollar, label: "货币单位", action: () => push("SettingsCurrencyActivity", {}) },
    { icon: IconLink, label: "链配置", action: () => push("SettingsChainsActivity", {}) },
    { icon: IconLock, label: "安全设置", action: () => push("SettingsActivity", {}) },
    { icon: IconBell, label: "通知设置", action: () => push("NotificationsActivity", {}) },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* User Card */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-xl font-bold text-white">
            {currentWallet?.name?.[0] ?? "B"}
          </div>
          <div>
            <h3 className="font-semibold">{currentWallet?.name ?? "BFM 用户"}</h3>
            <p className="font-mono text-sm text-muted-foreground">
              {truncateAddress(walletAddress ?? "")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Setting Items */}
      <Card>
        <CardContent className="divide-y p-0">
          {settingItems.map((item, i) => (
            <button
              key={i}
              className="flex w-full cursor-pointer items-center justify-between p-4 hover:bg-muted"
              onClick={item.action}
            >
              <div className="flex items-center gap-3">
                <item.icon className="size-5 text-muted-foreground" stroke={1.5} />
                <span>{item.label}</span>
              </div>
              <IconChevronRight className="size-4 text-muted-foreground" />
            </button>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">版本 1.0.0</p>
    </div>
  );
}
