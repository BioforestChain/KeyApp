import{j as c}from"./iframe-BePrFnKO.js";import{a as p}from"./token-item-CmEuxkgm.js";import{G as l}from"./LoadingSpinner-DQJtaIWz.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-NkeT2snb.js";import"./hologram-canvas-CHW2F9V-.js";import"./chain-icon-B2ujfOZS.js";import"./service-B1moYL-R.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C-vexf_V.js";import"./address-display-psv-gEtR.js";import"./web-OB-vqYjo.js";import"./createReactComponent-CmqpjX0V.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-D9XbQBKB.js";import"./index-BJuw1I98.js";import"./IconCheck-CYAaQpkh.js";import"./IconChevronDown-kE3V8AKX.js";import"./IconSettings-C_-YrFyH.js";import"./wallet-selector-n8AYOGnP.js";import"./wallet-mini-card-m5EzmzM9.js";import"./token-icon-DAGZBCSY.js";import"./amount-display-CQqhnos9.js";import"./NumberFlow-client-48rw3j0J-BisWWt1z.js";import"./animated-number-D03l_NUj.js";import"./time-display-Qu-jl1jp.js";import"./service-status-alert-B88agYTj.js";import"./IconX-CWUE3Lk2.js";import"./IconAlertTriangle-CChD3DE5.js";import"./IconLock-ChhXWbaa.js";import"./item-Dy0maWYA.js";import"./button-DFE_hoQU.js";import"./useButton-BBo5S0-9.js";import"./useRenderElement-BXxsHRMI.js";import"./dropdown-menu-D6osc0TB.js";import"./index-llgO6eF-.js";import"./index-CwvDAzmQ.js";import"./composite-DDf5PTDk.js";import"./useBaseUiId-DRGhhyq0.js";import"./useCompositeListItem-CJ9ajAlN.js";import"./useRole-GGmRRI-G.js";import"./user-profile-BuJAr0zx.js";import"./avatar-codec-EtiSMgAL.js";import"./bioforest-CLIupf7w.js";import"./web-C_D6gYKC.js";import"./amount-BQsqQYGO.js";import"./notification-COgA3WUO.js";import"./index-C_mQ6ej2.js";import"./transaction-meta-DQGL4EFf.js";import"./IconDots-f4wdtApJ.js";import"./IconShieldCheck-76nZVQY_.js";import"./IconApps-DqN_Zhy_.js";import"./IconCoins-CDZQUog8.js";import"./IconSparkles-B5k2-xDm.js";import"./IconTrash-Cr_XBpNz.js";import"./transaction-list-GSf1-Elk.js";import"./transaction-item-COl6_UHL.js";import"./IconRefresh-Bw76VdQd.js";import"./swipeable-tabs-ebHmYrn2.js";import"./swiper-CTSxTJVT.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: mockTokens,
    onTokenClick: token => alert(\`Clicked \${token.symbol}\`)
  }
}`,...o.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: mockTokens,
    showChange: true,
    onTokenClick: token => alert(\`Clicked \${token.symbol}\`)
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [],
    loading: true
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [],
    emptyAction: <GradientButton size="sm">转入资产</GradientButton>
  }
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [],
    emptyTitle: '没有找到代币',
    emptyDescription: '尝试添加新的代币到您的钱包',
    emptyAction: <button className="text-primary text-sm font-medium">
        添加代币
      </button>
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [mockTokens[0]!],
    onTokenClick: token => alert(\`Clicked \${token.symbol}\`)
  }
}`,...s.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [...mockTokens, {
      symbol: 'BNB',
      name: 'Binance Coin',
      balance: '10',
      fiatValue: '3,000',
      chain: 'bsc' as const,
      change24h: 3.1
    }, {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '500',
      fiatValue: '500',
      chain: 'ethereum' as const,
      change24h: 0
    }],
    showChange: true,
    onTokenClick: token => alert(\`Clicked \${token.symbol}\`)
  }
}`,...m.parameters?.docs?.source}}};const fe=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,n as Empty,r as Loading,m as ManyTokens,s as SingleToken,t as WithChange,fe as __namedExportsOrder,Te as default};
