# Change: Bioforest address format aligns with mpay/walletapi

## Why
KeyApp currently derives Bioforest-chain addresses as `prefix + base58(hash160(publicKey))` (no checksum), but mpay's `walletapi.bfmeta.info` expects `bnid-prefix-char + Base58Check(hash160(publicKey))` (checksum over the 20-byte hash160, **excluding** the 1-char prefix). This mismatch blocks real backend integration for balance/transfer/tx-history (core acceptance criteria).

## What Changes
- Switch Bioforest address derivation/validation to mpay-compatible `prefix + Base58Check(hash160)` for Bioforest-chain networks.
- Update built-in defaults and `public/configs/default-chains.json` for Bioforest chains to use prefix `b`.
- Align default Bioforest chain `symbol` values with mpay `assetType` where applicable (e.g. `BFM/CCC/PMC`).
- Document a minimal migration stance: wallets created with legacy `c*` addresses are not compatible with walletapi-backed operations without re-deriving addresses.

## bnid (prefix) is an environment choice
`prefix` in KeyApp maps to mpay’s `bnid` (the 1-char address prefix).

Evidence (mpay genesis blocks):
- `*-genesisBlock.prod.json` → `bnid="b"`
- `*-genesisBlock.dev.json` / `*-genesisBlock.test.json` → `bnid="c"`

So `b*` is the correct default for production walletapi (`walletapi.bfmeta.info`), while `c*` remains valid for test/dev networks via subscription/manual configs.

## Impact
- Affected specs: new capability `bioforest-address`
- Affected code: `src/lib/crypto/bioforest.ts`, `src/lib/crypto/bioforest.test.ts`, `public/configs/default-chains.json`
- Risks: existing locally-created wallets that stored `c*` Bioforest addresses will remain invalid against walletapi until re-derived.
