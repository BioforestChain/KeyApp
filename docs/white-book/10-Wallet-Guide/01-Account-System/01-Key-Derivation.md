# 01. 密钥派生 (Key Derivation)

Code: `src/services/chain-adapter/derive-wallet-chain-addresses.ts`

KeyApp 使用 **BIP-44** 标准进行多链确定性推导。

## 派生路径 (Derivation Paths)

| 链 | 算法 | 路径示例 | 说明 |
| :--- | :--- | :--- | :--- |
| **Ethereum** | secp256k1 | `m/44'/60'/0'/0/0` | 标准以太坊路径 |
| **Tron** | secp256k1 | `m/44'/195'/0'/0/0` | Tron 路径 |
| **Bitcoin** | secp256k1 | `m/84'/0'/0'/0/0` | Native Segwit (Bech32) |
| **BioChain** | ed25519 | `m/44'/...` | 自定义派生 |

## 流程

1.  用户输入 Mnemonic。
2.  生成 Seed。
3.  根据 `chain-config` 中的配置，遍历所有启用的链。
4.  为每条链生成对应的私钥和公钥。
5.  从公钥生成地址。

所有派生都在本地完成，私钥永远不会离开设备内存（且仅在签名时短暂存在）。
