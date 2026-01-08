# State Management Reference

## Overview

State management in KeyApp is handled by a combination of `TanStack Store` (global client state) and `TanStack Query` (server/async state).

## Architecture

- **Stores (`src/stores`)**: Synchronous client state (Wallet list, Preferences). Persisted to IndexedDB or LocalStorage where appropriate.
- **Queries (`src/queries`)**: Asynchronous server state (Balances, Transactions, Prices). Handles caching, deduplication, and background updates.

## Data Flow

```mermaid
graph TD
    A[UI Component] -->|Read| B[Store / Query Hook]
    A -->|Action| C[Store Actions]
    C -->|Mutate| B
    C -->|Persist| D[Storage Service]
    E[Query Hook] -->|Fetch| F[Chain Adapter]
    F -->|Data| E
```
