# Bio 生态系统

> 本章节介绍 Bio 小程序生态系统的架构设计和开发指南。

## 概述

Bio 生态是一个基于 iframe 的小程序平台，为第三方开发者提供类似 Web3 DApp 的开发体验。小程序通过 `window.bio` SDK 与 KeyApp 钱包进行通信。

## 核心组件

| 组件 | 路径 | 说明 |
|------|------|------|
| Bio SDK | `packages/bio-sdk/` | 小程序客户端 SDK |
| Provider | `src/services/ecosystem/` | KeyApp 宿主端服务 |
| 小程序 | `miniapps/` | 内置小程序 |
| 订阅源 | `public/ecosystem.json` | 小程序注册表 |

## 目录

- [01-架构设计](./01-架构设计.md)
- [02-BioSDK开发指南](./02-BioSDK开发指南.md)
- [03-小程序开发](./03-小程序开发.md)
- [04-订阅系统](./04-订阅系统.md)
