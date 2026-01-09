import{j as m}from"./iframe-Dt-mvS9d.js";import{W as u}from"./wallet-card-carousel-DV45s3yM.js";import{f as e}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./swiper-CH4WLE7V.js";import"./wallet-card-DZC4fYoz.js";import"./utils-CDN07tui.js";import"./hologram-canvas-DrhGhET9.js";import"./chain-icon-BG7izoDN.js";import"./address-display-CY1ujTX_.js";import"./web-CYIEB8v4.js";import"./createReactComponent-Com5XDcP.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Daw7Ix_X.js";import"./index-BYpULzmI.js";import"./IconCheck-MHV0osq3.js";import"./IconChevronDown-BSOZlxWx.js";import"./IconSettings-DevaB5dx.js";import"./useWalletTheme-CryED2iN.js";import"./chain-config-Cy31f5Um.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./index-Bh7Yopym.js";import"./index-D-8PjWAU.js";import"./useOpenInteractionType-DA8R8LcF.js";import"./useRenderElement-BTSWYIRv.js";import"./useBaseUiId-Dek5STcI.js";import"./useButton-RW-KfbzL.js";/* empty css                     */import"./IconWallet-O1xbyw8x.js";import"./IconPlus-Bl-3ZBF3.js";import"./IconSearch-1rfhhCX8.js";const n=(r,h)=>({id:r,name:h,address:`0x${r.padEnd(40,"0")}`,chain:"ethereum",chainAddresses:[{chain:"ethereum",address:`0x${r.padEnd(40,"0")}`,tokens:[]},{chain:"tron",address:`T${r.padEnd(33,"A")}`,tokens:[]}],createdAt:Date.now(),themeHue:323,tokens:[]}),t=[n("wallet1","我的钱包"),n("wallet2","工作钱包"),n("wallet3","储蓄钱包"),n("wallet4","测试钱包")],a={ethereum:"Ethereum",tron:"Tron",bitcoin:"Bitcoin",binance:"BSC",bfmeta:"BFMeta"},Q={title:"Wallet/WalletCardCarousel",component:u,tags:["autodocs"],parameters:{layout:"centered",backgrounds:{default:"gradient",values:[{name:"gradient",value:"linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)"},{name:"dark",value:"#1a1a2e"},{name:"light",value:"#f5f5f5"}]}},decorators:[r=>m.jsx("div",{className:"w-[360px] py-8",children:m.jsx(r,{})})]},l={args:{wallets:t,currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},o={args:{wallets:t.slice(0,1),currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},s={args:{wallets:t.slice(0,2),currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},c={args:{wallets:t,currentWalletId:"wallet1",selectedChain:"tron",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},i={args:{wallets:[...t,n("wallet5","钱包五"),n("wallet6","钱包六"),n("wallet7","钱包七")],currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()}},p={args:{wallets:t,currentWalletId:"wallet3",selectedChain:"ethereum",chainNames:a,onWalletChange:e(),onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e(),onOpenWalletList:e()},parameters:{docs:{description:{story:"当前选中的是第三个钱包，轮播会自动定位到该卡片。"}}}},d={args:{wallets:t,currentWalletId:"wallet1",selectedChain:"ethereum",chainNames:a},parameters:{docs:{description:{story:'左右滑动切换钱包卡片。点击底部的"X个钱包"按钮可以展开钱包列表。'}}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};const U=["Default","SingleWallet","TwoWallets","TronChain","ManyWallets","StartFromMiddle","Interactive"];export{l as Default,d as Interactive,i as ManyWallets,o as SingleWallet,p as StartFromMiddle,c as TronChain,s as TwoWallets,U as __namedExportsOrder,Q as default};
