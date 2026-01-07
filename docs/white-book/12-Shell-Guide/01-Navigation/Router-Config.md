# Router Configuration

> **Code Source**: [`src/stackflow/stackflow.ts`](https://github.com/BioforestChain/KeyApp/blob/main/src/stackflow/stackflow.ts)

## Overview

KeyApp uses **Stackflow** for its hybrid navigation system, combining the fluid transitions of a native app with the URL addressability of the Web.

## Plugins

1.  **`basicRendererPlugin`**: Handles DOM rendering.
2.  **`basicUIPlugin`**: Provides iOS-like (Cupertino) transitions and gestures.
3.  **`historySyncPlugin`**: **Critical**. Syncs the internal stack state with the browser's History API (`window.location.hash`).

## Route Map

The application uses Hash Routing (`useHash: true`).

| Activity | Route | Description |
| :--- | :--- | :--- |
| `MainTabsActivity` | `/` | Root page (Tabs) |
| `WalletListActivity` | `/wallet/list` | Manage wallets |
| `SendActivity` | `/send` | Transfer assets |
| `MiniappDetailActivity` | `/miniapp/:appId/detail` | DApp launcher |

## Jobs (Sheets)

"Jobs" are specialized Activities used for modal tasks (Bottom Sheets). They effectively pause the current flow to request user input.

- Prefix: `/job/...`
- Examples:
    - `/job/chain-selector`: Pick a chain.
    - `/job/scanner`: QR Code scanner.
    - `/job/signing-confirm`: Transaction signature request.
