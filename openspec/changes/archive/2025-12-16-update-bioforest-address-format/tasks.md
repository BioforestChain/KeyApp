## 1. Crypto primitives (Base58Check)
- [x] 1.1 Add Base58Check encode/decode helpers (payload + 4-byte double-SHA256 checksum).
- [x] 1.2 Add unit tests for Base58Check using a known `b*` address sample (Base58Check validates `address.slice(1)` and yields payload length=20).

## 2. Bioforest address derivation + validation
- [x] 2.1 Update `publicKeyToBioforestAddress` to generate walletapi-compatible `prefix + Base58Check(hash160)` addresses for Bioforest chains.
- [x] 2.2 Update `isValidBioforestAddress` to validate Base58Check checksum on `address.slice(1)` (and validate the 1-char prefix separately), and define behavior for legacy `c*` addresses (accept/flag).
- [x] 2.3 Update dependent tests (`src/lib/crypto/bioforest.test.ts`) to reflect the new default prefix and validation rules.

## 3. Defaults alignment (configs)
- [x] 3.1 Update `BIOFOREST_CHAINS` defaults to prefix `b` for Bioforest networks.
- [x] 3.2 Update `public/configs/default-chains.json` prefixes to `b` and align `symbol` to mpay `assetType` where applicable (`BFM/CCC/PMC`).
  - Note: `default-chains.json` is treated as **production walletapi defaults**; dev/test (`prefix=c`) should be added via subscription/manual configs, not hardcoded here.

## 4. Verification (evidence-first)
- [x] 4.1 Run `pnpm test --run src/lib/crypto/bioforest.test.ts` and record a short log in `.cccc/work/peerB/2025-12-16/pnpm-test.bioforest.test.log`.
- [ ] 4.2 (Optional) Add a non-blocking probe script to call walletapi balance endpoint to confirm derived addresses are accepted (kept in `.cccc/work/**`).
