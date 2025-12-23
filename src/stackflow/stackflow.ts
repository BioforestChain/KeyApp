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
import { ChainSelectorJob, WalletRenameJob, WalletDeleteJob, PasswordConfirmJob, PayPasswordConfirmJob, SetPayPasswordJob, MnemonicOptionsJob, ContactEditJob, WalletAddJob, SecurityWarningJob, TransferConfirmJob } from "./activities/sheets";

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
        ChainSelectorJob: "/job/chain-selector",
        WalletRenameJob: "/job/wallet-rename/:walletId",
        WalletDeleteJob: "/job/wallet-delete/:walletId",
        PasswordConfirmJob: "/job/password-confirm",
        PayPasswordConfirmJob: "/job/pay-password-confirm",
        SetPayPasswordJob: "/job/set-pay-password",
        MnemonicOptionsJob: "/job/mnemonic-options",
        ContactEditJob: "/job/contact-edit",
        WalletAddJob: "/job/wallet-add",
        SecurityWarningJob: "/job/security-warning",
        TransferConfirmJob: "/job/transfer-confirm",
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
    ChainSelectorJob,
    WalletRenameJob,
    WalletDeleteJob,
    PasswordConfirmJob,
    PayPasswordConfirmJob,
    SetPayPasswordJob,
    MnemonicOptionsJob,
    ContactEditJob,
    WalletAddJob,
    SecurityWarningJob,
    TransferConfirmJob,
  },
  // Note: Don't set initialActivity when using historySyncPlugin
  // The plugin will determine the initial activity based on the URL
  // and use fallbackActivity when no route matches
});

export type ActivityName = keyof typeof activities;
