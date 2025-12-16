# Design: Bioforest Base58Check addresses (mpay compatible)

## Context
Peer probe evidence indicates mpay walletapi expects Bioforest addresses encoded as Base58Check with:
- a 1-char `bnid` prefix (e.g. `b`)
- Base58Check applied to the 20-byte `hash160` **excluding** the prefix

## Algorithm
Given a Bioforest public key `publicKey` (32 bytes):
1. `hash160 = ripemd160(sha256(publicKey))` (20 bytes)
2. `payload = hash160` (20 bytes)
3. `checksum = sha256(sha256(payload)).slice(0, 4)`
4. `tail = base58Encode(payload + checksum)`
5. `address = bnidPrefixChar + tail`

## Validation
To validate an address:
1. Assert prefix matches expected `bnidPrefixChar` (e.g. `b`)
2. `decoded = base58Decode(address.slice(1))`
3. Assert `decoded.length === 24`
4. Split: `payload = decoded.slice(0, 20)`, `checksum = decoded.slice(20, 24)`
5. Recompute checksum over payload and compare.

## bnid/prefix mapping (environment dimension)
`bnidPrefixChar` is an environment/network choice, not a per-chain algorithm detail.

Evidence from mpay’s bundled genesis blocks:
- `../legacy-apps/apps/mpay/resources/genesisBlock/*-genesisBlock.prod.json` use `bnid="b"`
- `../legacy-apps/apps/mpay/resources/genesisBlock/*-genesisBlock.dev.json` and `*-genesisBlock.test.json` use `bnid="c"`

This is consistent across BFMeta / CCChain / PMChain / BFChain / ETHMeta. (See `.cccc/work/peerB/2025-12-16/mpay.resources.genesisBlock.matrix.txt`.)

Implication for KeyApp:
- Built-in defaults targeting `walletapi.bfmeta.info` should default `prefix="b"`.
- `prefix="c"` should remain available via subscription/manual chain configs for test/dev networks.

## Legacy handling
KeyApp historically used `c + base58(hash160)` (no checksum/version). This format is not accepted by mpay walletapi. Proposal is to keep legacy support only for display/import, and treat it as incompatible for walletapi-backed operations.
