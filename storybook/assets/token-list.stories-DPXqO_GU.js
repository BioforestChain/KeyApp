import{j as c}from"./iframe-Cd1kewla.js";import{a as p}from"./token-item-DDy4UZPH.js";import{G as l}from"./LoadingSpinner-LptAbqd6.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-pnshdwwW.js";import"./hologram-canvas-BDJdFE5P.js";import"./chain-icon-DyZLxnGT.js";import"./service-DEDe-FPR.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C7zok9CF.js";import"./address-display-Cbk8XVLk.js";import"./web-KFzE8mwj.js";import"./createReactComponent-DE2d0GlP.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BEYE2zBY.js";import"./index-DC4Hx_HQ.js";import"./IconCheck-Do5gMhwk.js";import"./IconChevronDown-DK2ga0eK.js";import"./IconSettings-rUGstddB.js";import"./wallet-selector-Bn0Ybt_t.js";import"./wallet-mini-card-B-fWeAv5.js";import"./token-icon-g82RY6dA.js";import"./amount-display-DUMKR089.js";import"./NumberFlow-client-48rw3j0J-CQSvsoJ7.js";import"./animated-number-Cn323t_z.js";import"./time-display-TTOaanEO.js";import"./service-status-alert-CVGymN48.js";import"./IconX-bU4nCkLv.js";import"./IconAlertTriangle-DeRWT6_I.js";import"./IconLock-BURiWEzT.js";import"./item-66urTrNy.js";import"./button-DKtPsAVZ.js";import"./useButton-DZGOlRym.js";import"./useRenderElement-5kjXJKMh.js";import"./dropdown-menu-Bai5yN5T.js";import"./index-ke5Xtp9c.js";import"./index-BzZRDoXb.js";import"./composite-DRPQE7Ix.js";import"./useBaseUiId-CLJeLJ2W.js";import"./useCompositeListItem-DTtrQYxC.js";import"./useRole-DI2Xw9tk.js";import"./user-profile-ibjEKeq2.js";import"./avatar-codec-ChRQlV51.js";import"./bioforest-CDknNeKp.js";import"./web-CsboBngD.js";import"./amount-BQsqQYGO.js";import"./notification-YE6ue0rj.js";import"./index-ispdZvV6.js";import"./transaction-meta-enKsQYOp.js";import"./IconDots-ecvXomS6.js";import"./IconShieldCheck-D0ngpGBk.js";import"./IconApps-CgZECHSR.js";import"./IconCoins-S-R9EVS9.js";import"./IconSparkles-331_zKOV.js";import"./IconTrash-Dwqf7K-8.js";import"./transaction-list-Dhd_DAKO.js";import"./transaction-item-DMNH4Ila.js";import"./IconRefresh-fuhmiywO.js";import"./swipeable-tabs-B9LdRDR9.js";import"./swiper-Dbszp4fc.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
