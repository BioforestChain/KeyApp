---
layout: home

hero:
  name: BFM Pay
  text: 多链钱包移动应用
  tagline: 安全、便捷的数字资产管理工具
  image:
    src: /logo.svg
    alt: BFM Pay Logo
  actions:
    - theme: brand
      text: 立即使用
      link: ./webapp/
      target: _blank
    - theme: alt
      text: 下载安装
      link: ./download

features:
  - icon: 🔐
    title: 安全可靠
    details: 私钥本地存储，助记词加密保护，多重安全验证机制
  - icon: ⛓️
    title: 多链支持
    details: 支持 Ethereum、BSC、Polygon 等主流区块链网络
  - icon: 📱
    title: 跨平台
    details: 提供 Web 应用和 DWEB 原生应用，随时随地管理资产
  - icon: 🧩
    title: 组件库
    details: 使用 Storybook 构建的现代化 React 组件库
    link: ./storybook/
    target: _self
  - icon: 📚
    title: 开发文档
    details: 完整的软件开发说明书，涵盖产品、设计、架构、服务等
    link: ./white-book/
    linkText: 阅读文档
---

## 快速开始

1. 访问 <a href="./webapp/" target="_blank" rel="noreferrer">Web 应用</a> 或 [下载 DWEB 版本](./download)
2. 创建新钱包或导入已有钱包
3. 开始管理您的数字资产

## 版本选择

| 平台 | 稳定版 | 测试版 |
|------|--------|--------|
| **Web** | <a href="./webapp/" target="_blank" rel="noreferrer">webapp/</a> | <a href="./webapp-dev/" target="_blank" rel="noreferrer">webapp-dev/</a> |
| **DWEB** | [下载页面](./download) | [下载页面](./download) |

查看 [下载页面](./download) 了解更多版本信息。

## 开发文档

[《软件开发说明书》](./white-book/) 是 BFM Pay 的完整技术文档，适合开发者和产品人员阅读。

| 篇章 | 内容 | 推荐读者 |
|------|------|---------|
| [概述](./white-book/00-Manifesto/) | 产品愿景、架构概览、技术栈 | 所有人 |
| [内核参考](./white-book/01-Kernel-Ref/) | 核心进程、窗口管理、沙箱 | 架构师 |
| [驱动参考](./white-book/02-Driver-Ref/) | 链协议、Provider 实现 | 后端开发 |
| [界面参考](./white-book/03-UI-Ref/) | 组件体系、设计规范 | 前端开发 |
| [状态参考](./white-book/05-State-Ref/) | Store、Query 系统 | 前端开发 |
| [服务参考](./white-book/06-Service-Ref/) | 服务架构、链服务接口 | 后端开发 |
| [安全参考](./white-book/08-Security-Ref/) | 密钥管理、身份认证 | 安全工程师 |
