import{j as t}from"./iframe-BNKLbH-6.js";import{W as C}from"./wallet-card-A3Q8NDWe.js";import{f as e}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./hologram-canvas-ThySC_-t.js";import"./chain-icon-VM8gZZqe.js";import"./service-lAexD2Wr.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Bhla7qwo.js";import"./address-display-DIjZgmds.js";import"./web-CFPZ225R.js";import"./createReactComponent-DG20OVdZ.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CSaUSbgP.js";import"./index-guW4vevp.js";import"./IconCheck-CLY0g_YK.js";import"./IconChevronDown-DgHyTnxW.js";import"./IconSettings-Cit_1bLX.js";const f={ethereum:"/icons/ethereum/chain.svg",bitcoin:"/icons/bitcoin/chain.svg",tron:"/icons/tron/chain.svg"},r=(a={})=>({id:"wallet-1",name:"我的钱包",address:"0x1234567890abcdef1234567890abcdef12345678",chain:"ethereum",chainAddresses:[{chain:"ethereum",address:"0x1234567890abcdef1234567890abcdef12345678",tokens:[]}],createdAt:Date.now(),themeHue:323,tokens:[],...a}),_={title:"Wallet/WalletCard3D",component:C,tags:["autodocs"],parameters:{layout:"centered",backgrounds:{default:"dark",values:[{name:"dark",value:"#1a1a2e"},{name:"light",value:"#f5f5f5"}]}},argTypes:{themeHue:{control:{type:"range",min:0,max:360,step:1},description:"Theme color hue (oklch)"},chain:{control:"select",options:["ethereum","tron","bitcoin","binance","bfmeta","ccchain"]}},decorators:[a=>t.jsx("div",{className:"w-[320px] p-8",children:t.jsx(a,{})})]},n={args:{wallet:r(),chain:"ethereum",chainName:"Ethereum",address:"0x1234567890abcdef1234567890abcdef12345678",themeHue:323,chainIconUrl:f.ethereum,onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e()}},s={args:{...n.args,themeHue:323}},o={args:{...n.args,themeHue:240}},c={args:{...n.args,themeHue:190}},m={args:{...n.args,themeHue:145}},i={args:{...n.args,themeHue:30}},d={args:{wallet:r({name:"Tron Wallet"}),chain:"tron",chainName:"Tron",address:"TAbcd1234567890abcdef1234567890abcde",themeHue:0,chainIconUrl:f.tron,onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e()}},l={args:{wallet:r({name:"BTC Wallet"}),chain:"bitcoin",chainName:"Bitcoin",address:"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",themeHue:30,chainIconUrl:f.bitcoin,onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e()}},h={args:{wallet:r({name:"这是一个超长的钱包名称用于测试显示效果"}),chain:"ethereum",chainName:"Ethereum",address:"0x1234567890abcdef1234567890abcdef12345678",themeHue:240,onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e()}},p={args:{wallet:r(),chain:"ethereum",chainName:"Ethereum",themeHue:323,onCopyAddress:e(),onOpenChainSelector:e(),onOpenSettings:e()}},u={render:()=>t.jsx("div",{className:"grid grid-cols-2 gap-4",children:[323,240,190,145,60,30,0,350].map(a=>t.jsx(C,{wallet:r({name:`Hue ${a}`}),chain:"ethereum",chainName:"ETH",address:"0x1234...5678",themeHue:a,chainIconUrl:f.ethereum},a))}),decorators:[a=>t.jsx("div",{className:"w-[680px] p-4",children:t.jsx(a,{})})]},g={args:{wallet:r({name:"触摸/移动鼠标查看效果"}),chain:"ethereum",chainName:"Ethereum",address:"0x1234567890abcdef1234567890abcdef12345678",themeHue:323},parameters:{docs:{description:{story:"将鼠标悬停在卡片上并移动，观察3D倾斜和炫光效果。在移动设备上，触摸并拖动卡片。"}}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    wallet: createMockWallet(),
    chain: 'ethereum',
    chainName: 'Ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    themeHue: 323,
    chainIconUrl: CHAIN_ICONS.ethereum,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn()
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    themeHue: 323
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    themeHue: 240
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    themeHue: 190
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    themeHue: 145
  }
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    themeHue: 30
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    wallet: createMockWallet({
      name: 'Tron Wallet'
    }),
    chain: 'tron',
    chainName: 'Tron',
    address: 'TAbcd1234567890abcdef1234567890abcde',
    themeHue: 0,
    chainIconUrl: CHAIN_ICONS.tron,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn()
  }
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    wallet: createMockWallet({
      name: 'BTC Wallet'
    }),
    chain: 'bitcoin',
    chainName: 'Bitcoin',
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    themeHue: 30,
    chainIconUrl: CHAIN_ICONS.bitcoin,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn()
  }
}`,...l.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    wallet: createMockWallet({
      name: '这是一个超长的钱包名称用于测试显示效果'
    }),
    chain: 'ethereum',
    chainName: 'Ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    themeHue: 240,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn()
  }
}`,...h.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    wallet: createMockWallet(),
    chain: 'ethereum',
    chainName: 'Ethereum',
    // address is intentionally omitted to test placeholder state
    themeHue: 323,
    onCopyAddress: fn(),
    onOpenChainSelector: fn(),
    onOpenSettings: fn()
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="grid grid-cols-2 gap-4">
      {[323, 240, 190, 145, 60, 30, 0, 350].map(hue => <WalletCard key={hue} wallet={createMockWallet({
      name: \`Hue \${hue}\`
    })} chain="ethereum" chainName="ETH" address="0x1234...5678" themeHue={hue} chainIconUrl={CHAIN_ICONS.ethereum} />)}
    </div>,
  decorators: [Story => <div className="w-[680px] p-4">
        <Story />
      </div>]
}`,...u.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    wallet: createMockWallet({
      name: '触摸/移动鼠标查看效果'
    }),
    chain: 'ethereum',
    chainName: 'Ethereum',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    themeHue: 323
  },
  parameters: {
    docs: {
      description: {
        story: '将鼠标悬停在卡片上并移动，观察3D倾斜和炫光效果。在移动设备上，触摸并拖动卡片。'
      }
    }
  }
}`,...g.parameters?.docs?.source}}};const q=["Default","PurpleTheme","BlueTheme","CyanTheme","GreenTheme","OrangeTheme","TronChain","BitcoinChain","LongWalletName","NoAddress","AllThemes","Interactive"];export{u as AllThemes,l as BitcoinChain,o as BlueTheme,c as CyanTheme,n as Default,m as GreenTheme,g as Interactive,h as LongWalletName,p as NoAddress,i as OrangeTheme,s as PurpleTheme,d as TronChain,q as __namedExportsOrder,_ as default};
