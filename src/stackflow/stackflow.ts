import { stackflow } from "@stackflow/react";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { basicUIPlugin } from "@stackflow/plugin-basic-ui";
import { historySyncPlugin } from "@stackflow/plugin-history-sync";

import { MainTabsActivity } from "./activities/MainTabsActivity";
import { WalletListActivity } from "./activities/WalletListActivity";
import { WalletConfigActivity } from "./activities/WalletConfigActivity";
import { WalletCreateActivity } from "./activities/WalletCreateActivity";

import { SendActivity } from "./activities/SendActivity";
import { ReceiveActivity } from "./activities/ReceiveActivity";
import { SettingsActivity } from "./activities/SettingsActivity";
import { SettingsLanguageActivity } from "./activities/SettingsLanguageActivity";
import { SettingsCurrencyActivity } from "./activities/SettingsCurrencyActivity";
import { SettingsChainsActivity } from "./activities/SettingsChainsActivity";
import { SettingsMnemonicActivity } from "./activities/SettingsMnemonicActivity";
import { SettingsWalletLockActivity } from "./activities/SettingsWalletLockActivity";
import { HistoryActivity } from "./activities/HistoryActivity";
import { TransactionDetailActivity } from "./activities/TransactionDetailActivity";
import { ScannerActivity } from "./activities/ScannerActivity";
import { AuthorizeAddressActivity } from "./activities/AuthorizeAddressActivity";
import { AuthorizeSignatureActivity } from "./activities/AuthorizeSignatureActivity";
import { OnboardingRecoverActivity } from "./activities/OnboardingRecoverActivity";
import { TokenDetailActivity } from "./activities/TokenDetailActivity";
import { AddressBookActivity } from "./activities/AddressBookActivity";
import { NotificationsActivity } from "./activities/NotificationsActivity";
import { StakingActivity } from "./activities/StakingActivity";
import { WelcomeActivity } from "./activities/WelcomeActivity";
import { SettingsWalletChainsActivity } from "./activities/SettingsWalletChainsActivity";
import { SettingsStorageActivity } from "./activities/SettingsStorageActivity";
import { MiniappActivity } from "./activities/MiniappActivity";
import { ChainSelectorJob, WalletRenameJob, WalletDeleteJob, WalletLockConfirmJob, TwoStepSecretConfirmJob, SetTwoStepSecretJob, MnemonicOptionsJob, ContactEditJob, ContactPickerJob, WalletAddJob, WalletListJob, SecurityWarningJob, TransferConfirmJob, TransferWalletLockJob, FeeEditJob, ScannerJob, ContactAddConfirmJob, ContactShareJob, ClearDataConfirmJob } from "./activities/sheets";

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
        WalletConfigActivity: "/wallet/:walletId",
        WalletCreateActivity: "/wallet/create",
        SendActivity: "/send",
        ReceiveActivity: "/receive",
        SettingsActivity: "/settings",
        SettingsLanguageActivity: "/settings/language",
        SettingsCurrencyActivity: "/settings/currency",
        SettingsChainsActivity: "/settings/chains",
        SettingsMnemonicActivity: "/settings/mnemonic",
        SettingsWalletLockActivity: "/settings/wallet-lock",
        SettingsWalletChainsActivity: "/settings/wallet-chains",
        SettingsStorageActivity: "/settings/storage",
        HistoryActivity: "/history",
        TransactionDetailActivity: "/transaction/:txId",
        ScannerActivity: "/scanner",
        AuthorizeAddressActivity: "/authorize/address/:id",
        AuthorizeSignatureActivity: "/authorize/signature/:id",
        OnboardingRecoverActivity: "/onboarding/recover",
        TokenDetailActivity: "/token/:tokenId",
        AddressBookActivity: "/address-book",
        NotificationsActivity: "/notifications",
        StakingActivity: "/staking",
        WelcomeActivity: "/welcome",
        MiniappActivity: "/miniapp/:appId",
        ChainSelectorJob: "/job/chain-selector",
        WalletRenameJob: "/job/wallet-rename/:walletId",
        WalletDeleteJob: "/job/wallet-delete/:walletId",
        WalletLockConfirmJob: "/job/wallet-lock-confirm",
        TwoStepSecretConfirmJob: "/job/two-step-secret-confirm",
        SetTwoStepSecretJob: "/job/set-two-step-secret",
        MnemonicOptionsJob: "/job/mnemonic-options",
        ContactEditJob: "/job/contact-edit",
        ContactPickerJob: "/job/contact-picker",
        WalletAddJob: "/job/wallet-add",
        WalletListJob: "/job/wallet-list",
        SecurityWarningJob: "/job/security-warning",
        TransferConfirmJob: "/job/transfer-confirm",
        TransferWalletLockJob: "/job/transfer-wallet-lock",
        FeeEditJob: "/job/fee-edit",
        ScannerJob: "/job/scanner",
        ContactAddConfirmJob: "/job/contact-add-confirm",
        ContactShareJob: "/job/contact-share",
        ClearDataConfirmJob: "/job/clear-data-confirm",
      },
      fallbackActivity: () => "MainTabsActivity",
      useHash: true,
    }),
  ],
  activities: {
    MainTabsActivity,
    WalletListActivity,
    WalletConfigActivity,
    WalletCreateActivity,
    SendActivity,
    ReceiveActivity,
    SettingsActivity,
    SettingsLanguageActivity,
    SettingsCurrencyActivity,
    SettingsChainsActivity,
    SettingsMnemonicActivity,
    SettingsWalletLockActivity,
    SettingsWalletChainsActivity,
    SettingsStorageActivity,
    HistoryActivity,
    TransactionDetailActivity,
    ScannerActivity,
    AuthorizeAddressActivity,
    AuthorizeSignatureActivity,
    OnboardingRecoverActivity,
    TokenDetailActivity,
    AddressBookActivity,
    NotificationsActivity,
    StakingActivity,
    WelcomeActivity,
    MiniappActivity,
    ChainSelectorJob,
    WalletRenameJob,
    WalletDeleteJob,
    WalletLockConfirmJob,
    TwoStepSecretConfirmJob,
    SetTwoStepSecretJob,
    MnemonicOptionsJob,
    ContactEditJob,
    ContactPickerJob,
    WalletAddJob,
    WalletListJob,
    SecurityWarningJob,
    TransferConfirmJob,
    TransferWalletLockJob,
    FeeEditJob,
    ScannerJob,
    ContactAddConfirmJob,
    ContactShareJob,
    ClearDataConfirmJob,
  },
  // Note: Don't set initialActivity when using historySyncPlugin
  // The plugin will determine the initial activity based on the URL
  // and use fallbackActivity when no route matches
});

export type ActivityName = keyof typeof activities;
