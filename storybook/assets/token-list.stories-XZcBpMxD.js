import{j as c}from"./iframe-BJgN3E0_.js";import{a as p}from"./token-item-JwEMM4Ve.js";import{G as l}from"./LoadingSpinner-C0y08R3F.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B1jmOeSf.js";import"./hologram-canvas-6LaTKHHH.js";import"./chain-icon-nnA350U9.js";import"./service-5bbNlk9X.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CT5H8PXH.js";import"./address-display-BMuj8SYc.js";import"./web-Dy1DU2Dg.js";import"./createReactComponent-BPs_Exgf.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BA-yisZJ.js";import"./index-mS2T2Imm.js";import"./IconCheck-BUPYeoq8.js";import"./IconChevronDown-CT1kh5ck.js";import"./IconSettings-B1FxeLlK.js";import"./wallet-selector-wgVpzF5l.js";import"./wallet-mini-card-3xYe8S5Z.js";import"./token-icon-DLU8YGGN.js";import"./amount-display-ByYkB6HL.js";import"./NumberFlow-client-48rw3j0J-aXRQZR3q.js";import"./animated-number-2PW5hiBY.js";import"./time-display-AqjuKmlo.js";import"./service-status-alert-B9Quc1RW.js";import"./IconX-CsFVgG7H.js";import"./IconAlertTriangle-CVFWKvTR.js";import"./IconLock-fwF3wF6m.js";import"./item-BJPa0huG.js";import"./button-DI21DV3e.js";import"./useButton-kGvBe4pw.js";import"./useRenderElement-DsRqdjfH.js";import"./dropdown-menu-Y7FGDMJp.js";import"./index-DEKqW7vc.js";import"./index-DriTtBBk.js";import"./composite-QinTEPYT.js";import"./useBaseUiId-mi4DG-Ya.js";import"./useCompositeListItem-DLf7fKYW.js";import"./useRole-DitLT1jv.js";import"./user-profile-BmJvRYpv.js";import"./avatar-codec-CTRdn_Nu.js";import"./bioforest-B79RCWOc.js";import"./web-DhtphWP-.js";import"./amount-BQsqQYGO.js";import"./notification-kXHC4VWQ.js";import"./index-OwjSdtpc.js";import"./transaction-meta-Bo--zfIS.js";import"./IconDots-Dosd84mM.js";import"./IconShieldCheck-BMtks_8q.js";import"./IconApps-Dfxba8DL.js";import"./IconCoins-BXKB0B5f.js";import"./IconSparkles-ikpRsofA.js";import"./IconTrash-CXRVeQ9Z.js";import"./transaction-list-DD-ibpap.js";import"./transaction-item-CqDxBU6l.js";import"./IconRefresh-BWwtUu7X.js";import"./swipeable-tabs-D8NNUssf.js";import"./swiper-CIf1UMKF.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
