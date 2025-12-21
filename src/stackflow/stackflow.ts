import { stackflow } from "@stackflow/react";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { basicUIPlugin } from "@stackflow/plugin-basic-ui";
import { historySyncPlugin } from "@stackflow/plugin-history-sync";

import { MainTabsActivity } from "./activities/MainTabsActivity";
import { WalletListActivity } from "./activities/WalletListActivity";
import { WalletDetailActivity } from "./activities/WalletDetailActivity";
import { WalletCreateActivity } from "./activities/WalletCreateActivity";
import { WalletImportActivity } from "./activities/WalletImportActivity";
import { SendActivity } from "./activities/SendActivity";
import { ReceiveActivity } from "./activities/ReceiveActivity";
import { SettingsActivity } from "./activities/SettingsActivity";
import { SettingsLanguageActivity } from "./activities/SettingsLanguageActivity";
import { SettingsCurrencyActivity } from "./activities/SettingsCurrencyActivity";
import { SettingsChainsActivity } from "./activities/SettingsChainsActivity";
import { SettingsMnemonicActivity } from "./activities/SettingsMnemonicActivity";
import { SettingsPasswordActivity } from "./activities/SettingsPasswordActivity";
import { HistoryActivity } from "./activities/HistoryActivity";
import { TransactionDetailActivity } from "./activities/TransactionDetailActivity";
import { ScannerActivity } from "./activities/ScannerActivity";
import { AuthorizeAddressActivity } from "./activities/AuthorizeAddressActivity";
import { AuthorizeSignatureActivity } from "./activities/AuthorizeSignatureActivity";
import { OnboardingCreateActivity } from "./activities/OnboardingCreateActivity";
import { OnboardingRecoverActivity } from "./activities/OnboardingRecoverActivity";
import { TokenDetailActivity } from "./activities/TokenDetailActivity";
import { AddressBookActivity } from "./activities/AddressBookActivity";
import { NotificationsActivity } from "./activities/NotificationsActivity";
import { StakingActivity } from "./activities/StakingActivity";
import { WelcomeActivity } from "./activities/WelcomeActivity";
import { ChainSelectorSheetActivity, WalletRenameSheetActivity, WalletDeleteSheetActivity, PasswordConfirmSheetActivity, MnemonicOptionsSheetActivity, ContactEditSheetActivity, WalletAddSheetActivity, SecurityWarningSheetActivity } from "./activities/sheets";

export const { Stack, useFlow, useStepFlow, activities } = stackflow({
  transitionDuration: 350,
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({
      theme: "cupertino",
    }),
    historySyncPlugin({
      routes: {
        MainTabsActivity: "/",
        WalletListActivity: "/wallet/list",
        WalletDetailActivity: "/wallet/:walletId",
        WalletCreateActivity: "/wallet/create",
        WalletImportActivity: "/wallet/import",
        SendActivity: "/send",
        ReceiveActivity: "/receive",
        SettingsActivity: "/settings",
        SettingsLanguageActivity: "/settings/language",
        SettingsCurrencyActivity: "/settings/currency",
        SettingsChainsActivity: "/settings/chains",
        SettingsMnemonicActivity: "/settings/mnemonic",
        SettingsPasswordActivity: "/settings/password",
        HistoryActivity: "/history",
        TransactionDetailActivity: "/transaction/:txId",
        ScannerActivity: "/scanner",
        AuthorizeAddressActivity: "/authorize/address/:id",
        AuthorizeSignatureActivity: "/authorize/signature/:id",
        OnboardingCreateActivity: "/onboarding/create",
        OnboardingRecoverActivity: "/onboarding/recover",
        TokenDetailActivity: "/token/:tokenId",
        AddressBookActivity: "/address-book",
        NotificationsActivity: "/notifications",
        StakingActivity: "/staking",
        WelcomeActivity: "/welcome",
        ChainSelectorSheetActivity: "/sheet/chain-selector",
        WalletRenameSheetActivity: "/sheet/wallet-rename/:walletId",
        WalletDeleteSheetActivity: "/sheet/wallet-delete/:walletId",
        PasswordConfirmSheetActivity: "/sheet/password-confirm",
        MnemonicOptionsSheetActivity: "/sheet/mnemonic-options",
        ContactEditSheetActivity: "/sheet/contact-edit",
        WalletAddSheetActivity: "/sheet/wallet-add",
        SecurityWarningSheetActivity: "/sheet/security-warning",
      },
      fallbackActivity: () => "MainTabsActivity",
      useHash: true,
    }),
  ],
  activities: {
    MainTabsActivity,
    WalletListActivity,
    WalletDetailActivity,
    WalletCreateActivity,
    WalletImportActivity,
    SendActivity,
    ReceiveActivity,
    SettingsActivity,
    SettingsLanguageActivity,
    SettingsCurrencyActivity,
    SettingsChainsActivity,
    SettingsMnemonicActivity,
    SettingsPasswordActivity,
    HistoryActivity,
    TransactionDetailActivity,
    ScannerActivity,
    AuthorizeAddressActivity,
    AuthorizeSignatureActivity,
    OnboardingCreateActivity,
    OnboardingRecoverActivity,
    TokenDetailActivity,
    AddressBookActivity,
    NotificationsActivity,
    StakingActivity,
    WelcomeActivity,
    ChainSelectorSheetActivity,
    WalletRenameSheetActivity,
    WalletDeleteSheetActivity,
    PasswordConfirmSheetActivity,
    MnemonicOptionsSheetActivity,
    ContactEditSheetActivity,
    WalletAddSheetActivity,
    SecurityWarningSheetActivity,
  },
  initialActivity: () => "MainTabsActivity",
});

export type ActivityName = keyof typeof activities;
