import{j as i}from"./iframe-d96jbflr.js";import{f as g}from"./index-BjIXEP53.js";import{W as w}from"./wallet-list-Dk3NgIXQ.js";import{W}from"./useWalletTheme-BAbHEJ-j.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-mini-card-CV5hUdi_.js";import"./hologram-canvas-DwlTXWKB.js";import"./useTranslation-ClTwWhs-.js";import"./index-eCgcuFC8.js";import"./address-display-BADrBbmO.js";import"./web-DJqIBczy.js";import"./createReactComponent-B3jwCrnC.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-Ds77auM7.js";import"./IconPlus-BoDf2o5_.js";import"./user-profile-D9guGjlg.js";import"./index-D0E7N0oa.js";import"./derivation-BBuk2SYe.js";import"./avatar-codec-C4-7ZIsO.js";import"./service-C5fu61FZ.js";import"./bioforest-CBPxOKcQ.js";const p={bfmeta:"/icons/bfmeta/chain.svg",ethereum:"/icons/ethereum/chain.svg",bitcoin:"/icons/bitcoin/chain.svg"},u=[{id:"wallet-1",name:"主钱包 (BFMeta)",address:"0x742d35Cc6634C0532925a3b844Bc9e7595f00000",themeHue:323,chainIconUrl:p.bfmeta},{id:"wallet-2",name:"以太坊账户",address:"0xA1B2C3D4E5F6789012345678901234567890ABCD",themeHue:250,chainIconUrl:p.ethereum},{id:"wallet-3",name:"比特币储蓄",address:"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",themeHue:40,chainIconUrl:p.bitcoin}],M={title:"Wallet/WalletList",component:w,tags:["autodocs"],args:{onSelect:g(),onAddWallet:g()},decorators:[e=>i.jsx("div",{className:"w-full max-w-md rounded-xl bg-background p-4",children:i.jsx(e,{})})]},t={args:{wallets:u,currentWalletId:"wallet-1"}},r={args:{wallets:u,currentWalletId:null}},l={args:{wallets:[u[0]],currentWalletId:"wallet-1"}},s={args:{wallets:[],currentWalletId:null}},n={args:{wallets:[],currentWalletId:null,showAddButton:!1}},o={args:{wallets:u,currentWalletId:"wallet-2",showAddButton:!1}},d={args:{wallets:W.map((e,a)=>({id:`wallet-${a}`,name:e.name,address:`0x${a.toString().padStart(40,"0")}`,themeHue:e.hue})),currentWalletId:"wallet-0"}},c={args:{wallets:[{id:"wallet-1",name:"这是一个非常长的钱包名称用于测试截断显示",address:"0x742d35Cc6634C0532925a3b844Bc9e7595f00000",themeHue:323},{id:"wallet-2",name:"Very Long Wallet Name For Testing Truncation",address:"0xA1B2C3D4E5F6789012345678901234567890ABCD",themeHue:250}],currentWalletId:"wallet-1"}},m={args:{wallets:Array.from({length:10},(e,a)=>({id:`wallet-${a}`,name:`钱包 ${a+1}`,address:`0x${a.toString().padStart(40,"0")}`,themeHue:a*36%360})),currentWalletId:"wallet-3"},decorators:[e=>i.jsx("div",{className:"max-h-[400px] w-full max-w-md overflow-y-auto rounded-xl bg-background p-4",children:i.jsx(e,{})})]};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet-1'
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    currentWalletId: null
  }
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: [mockWallets[0]!],
    currentWalletId: 'wallet-1'
  }
}`,...l.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: [],
    currentWalletId: null
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: [],
    currentWalletId: null,
    showAddButton: false
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    currentWalletId: 'wallet-2',
    showAddButton: false
  }
}`,...o.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: WALLET_THEME_COLORS.map((color, idx) => ({
      id: \`wallet-\${idx}\`,
      name: color.name,
      address: \`0x\${idx.toString().padStart(40, '0')}\`,
      themeHue: color.hue
    })),
    currentWalletId: 'wallet-0'
  }
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: [{
      id: 'wallet-1',
      name: '这是一个非常长的钱包名称用于测试截断显示',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f00000',
      themeHue: 323
    }, {
      id: 'wallet-2',
      name: 'Very Long Wallet Name For Testing Truncation',
      address: '0xA1B2C3D4E5F6789012345678901234567890ABCD',
      themeHue: 250
    }],
    currentWalletId: 'wallet-1'
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: Array.from({
      length: 10
    }, (_, idx) => ({
      id: \`wallet-\${idx}\`,
      name: \`钱包 \${idx + 1}\`,
      address: \`0x\${idx.toString().padStart(40, '0')}\`,
      themeHue: idx * 36 % 360
    })),
    currentWalletId: 'wallet-3'
  },
  decorators: [Story => <div className="max-h-[400px] w-full max-w-md overflow-y-auto rounded-xl bg-background p-4">
        <Story />
      </div>]
}`,...m.parameters?.docs?.source}}};const q=["Default","NoCurrentWallet","SingleWallet","EmptyList","EmptyListWithoutAddButton","WithoutAddButton","AllThemeColors","LongWalletNames","ManyWallets"];export{d as AllThemeColors,t as Default,s as EmptyList,n as EmptyListWithoutAddButton,c as LongWalletNames,m as ManyWallets,r as NoCurrentWallet,l as SingleWallet,o as WithoutAddButton,q as __namedExportsOrder,M as default};
