# Activities (Pages)

> **Code Source**: [`src/stackflow/activities`](https://github.com/BioforestChain/KeyApp/tree/main/src/stackflow/activities)

## Overview

An "Activity" in Stackflow corresponds to a screen or page in the application.

## Core Activities

### MainTabsActivity
The application entry point. Contains the `TabBar` and switches between sub-views:
- **WalletTab**: Main asset dashboard.
- **EcosystemTab**: DApp browser / launcher.
- **SettingsTab**: Global preferences.

### WalletConfigActivity
Details for a specific wallet instance.
- **Route**: `/wallet/:walletId`
- **Features**: Rename, Backup, Delete, View Private Key.

### SendActivity / ReceiveActivity
Core financial operations.
- **Send**: Address input -> Amount input -> Confirmation (Job).
- **Receive**: QR Code display -> Share/Copy.

### MiniappDetailActivity
The container for running third-party Miniapps.
- **Route**: `/miniapp/:appId/detail`
- **Logic**: Initializes the `IframeManager` and sets up the `PostMessageBridge`.

## Sheets (Jobs)

Located in `src/stackflow/activities/sheets`. These are modal activities that slide up from the bottom.

- **ScannerJob**: Full-screen camera view for QR scanning.
- **SigningConfirmJob**: Secure prompt for transaction authorization. Critical security boundary.
