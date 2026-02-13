import{j as d}from"./iframe-DiTbX0IW.js";import{W as u}from"./wallet-card-carousel-DcnsMM0e.js";import{f as e}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./swiper-DT0qO8ux.js";import"./wallet-card-C4EhqI9I.js";import"./utils-4perknFd.js";import"./hologram-canvas-f8CDXftB.js";import"./chain-icon-BU3VWqRh.js";import"./service-oKJQN9S1.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Dp6bZnX-.js";import"./address-display-CfH8l4mh.js";import"./web-DCQ-jzzt.js";import"./createReactComponent-CsAWfYOO.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CrBtWVkI.js";import"./index-PxwM-cQl.js";import"./IconCheck-D-zvsvG2.js";import"./IconChevronDown-CqVIs3Wg.js";import"./IconSettings-DjPtxsfk.js";import"./useWalletTheme-0KldSnlT.js";import"./user-profile-CqRd3yoO.js";import"./avatar-codec-Bmh89c4V.js";import"./bioforest-Cs6KeS9H.js";import"./dropdown-menu-CO91eWEY.js";import"./index-DqbLvQvd.js";import"./index-C5BCuv5I.js";import"./composite-CN7r9zdQ.js";import"./useRenderElement-DsnB5a2h.js";import"./useBaseUiId-B7b9C06f.js";import"./useCompositeListItem-BWP5pVQr.js";import"./useRole-DWw1Hdoz.js";import"./useButton-CWLqZqk7.js";import"./IconWallet-CI1MKjhm.js";import"./IconPlus-DDB8p-xJ.js";import"./IconSearch-zKLkJr38.js";const n=(r,h)=>({id:r,name:h,address:`0x${r.padEnd(40,"0")}`,chain:"ethereum",chainAddresses:[{chain:"ethereum",address:`0x${r.padEnd(40,"0")}`,tokens:[]},{chain:"tron",address:`T${r.padEnd(33,"A")}`,tokens:[]}],createdAt:Date.now(),themeHue:323,tokens:[]}),t=[n("wallet1","我的钱包"),n("wallet2","工作钱包"),n("wallet3","储蓄钱包"),n("wallet4","测试钱包")],a={ethereum:"Ethereum",tron:"Tron",bitcoin:"Bitcoin",binance:"BSC",bfmeta:"BFMeta"},Z={title:"Wallet/WalletCardCarousel",component:u,tags:["autodocs"],parameters:{layout:"centered",backgrounds:{default:"gradient",values:[{name:"gradient",value:"linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"},{name:"dark",value:"#1a1a2e"},{name:"light",value:"#f5f5f5"}]}},decorators:[r=>d.jsx("div",{className:"w-[360px] py-8",children:d.jsx(r,{})})]},l={args:{wallets:t,currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},o={args:{wallets:t.slice(0,1),currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},s={args:{wallets:t.slice(0,2),currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},c={args:{wallets:t,currentWalletId:"wallet1",selectedChain:"tron",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},i={args:{wallets:[...t,n("wallet5","钱包五"),n("wallet6","钱包六"),n("wallet7","钱包七")],currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},p={args:{wallets:t,currentWalletId:"wallet3",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()},parameters:{docs:{description:{story:"当前选中的是第三个钱包，轮播会自动定位到该卡片。"}}}},m={args:{wallets:t,currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a},parameters:{docs:{description:{story:'左右滑动切换钱包卡片。点击底部的"X个钱包"按钮可以展开钱包列表。'}}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn()
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets.slice(0, 1),
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn()
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets.slice(0, 2),
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn()
  }
}`,...s.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    selectedChain: 'tron',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn()
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: [...mockWallets, createMockWallet('wallet5', '钱包五'), createMockWallet('wallet6', '钱包六'), createMockWallet('wallet7', '钱包七')],
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn()
  }
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet3',
    selectedChain: 'ethereum',
    chainNames,
    onWalletChange: fn(),
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn(),
    onOpenWalletList: fn()
  },
  parameters: {
    docs: {
      description: {
        story: '当前选中的是第三个钱包，轮播会自动定位到该卡片。'
      }
    }
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet1',
    selectedChain: 'ethereum',
    chainNames
  },
  parameters: {
    docs: {
      description: {
        story: '左右滑动切换钱包卡片。点击底部的"X个钱包"按钮可以展开钱包列表。'
      }
    }
  }
}`,...m.parameters?.docs?.source}}};const ee=["Default","SingleWallet","TwoWallets","TronChain","ManyWallets","StartFromMiddle","Interactive"];export{l as Default,m as Interactive,i as ManyWallets,o as SingleWallet,p as StartFromMiddle,c as TronChain,s as TwoWallets,ee as __namedExportsOrder,Z as default};
