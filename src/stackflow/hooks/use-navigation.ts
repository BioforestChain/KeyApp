import { useFlow } from "../stackflow";
import type { ActivityName } from "../stackflow";

// Route path to Activity name mapping
const routeToActivityMap: Record<string, ActivityName> = {
  "/": "MainTabsActivity",
  "/wallet/list": "WalletListActivity",
  "/wallet/create": "WalletCreateActivity",
  "/send": "SendActivity",
  "/receive": "ReceiveActivity",
  "/settings": "SettingsActivity",
  "/settings/language": "SettingsLanguageActivity",
  "/settings/currency": "SettingsCurrencyActivity",
  "/settings/chains": "SettingsChainsActivity",
  "/settings/mnemonic": "SettingsMnemonicActivity",
  "/settings/wallet-lock": "SettingsWalletLockActivity",
  "/settings/wallet-chains": "SettingsWalletChainsActivity",
  "/settings/storage": "SettingsStorageActivity",
  "/settings/sources": "SettingsSourcesActivity",
  "/history": "HistoryActivity",
  "/scanner": "ScannerActivity",
  "/onboarding/recover": "OnboardingRecoverActivity",
  "/address-book": "AddressBookActivity",
  "/my-card": "MyCardActivity",
  "/notifications": "NotificationsActivity",
  "/staking": "StakingActivity",
  "/welcome": "WelcomeActivity",
};

// Dynamic route patterns
const dynamicRoutePatterns: Array<{
  pattern: RegExp;
  activity: ActivityName;
  paramExtractor: (match: RegExpMatchArray) => Record<string, string>;
}> = [
    {
      pattern: /^\/wallet\/([^/]+)$/,
      activity: "WalletConfigActivity",
      paramExtractor: (match) => ({ walletId: match[1] ?? "" }),
    },
    {
      pattern: /^\/transaction\/([^/]+)$/,
      activity: "TransactionDetailActivity",
      paramExtractor: (match) => ({ txId: match[1] ?? "" }),
    },
    {
      pattern: /^\/authorize\/address\/([^/]+)$/,
      activity: "AuthorizeAddressActivity",
      paramExtractor: (match) => ({ id: match[1] ?? "" }),
    },
    {
      pattern: /^\/authorize\/signature\/([^/]+)$/,
      activity: "AuthorizeSignatureActivity",
      paramExtractor: (match) => ({ id: match[1] ?? "" }),
    },
    {
      pattern: /^\/token\/([^/]+)$/,
      activity: "TokenDetailActivity",
      paramExtractor: (match) => ({ tokenId: match[1] ?? "" }),
    },
  ];

function resolveRoute(
  to: string
): { activity: ActivityName; params: Record<string, unknown> } | null {
  // Check static routes first
  if (routeToActivityMap[to]) {
    return { activity: routeToActivityMap[to], params: {} };
  }

  // Check dynamic routes
  for (const { pattern, activity, paramExtractor } of dynamicRoutePatterns) {
    const match = to.match(pattern);
    if (match) {
      return { activity, params: paramExtractor(match) };
    }
  }

  return null;
}

interface NavigateOptions {
  to: string;
  search?: Record<string, unknown>;
  replace?: boolean;
}

/**
 * Navigation hook compatible with TanStack Router's useNavigate
 * Replaces useNavigate() from TanStack Router
 */
export function useNavigation() {
  const flow = useFlow();

  const navigate = (opts: NavigateOptions | string) => {
    const options = typeof opts === "string" ? { to: opts } : opts;
    const resolved = resolveRoute(options.to);

    if (!resolved) {

      return;
    }

    const params = { ...resolved.params, ...options.search };

    if (options.replace) {
      flow.replace(resolved.activity, params, { animate: true });
    } else {
      flow.push(resolved.activity, params, { animate: true });
    }
  };

  const goBack = () => {
    flow.pop();
  };

  return { navigate, goBack };
}
