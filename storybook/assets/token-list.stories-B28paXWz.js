import{j as c}from"./iframe-Dt8wZwjo.js";import{a as p}from"./token-item-yQ5oRS7a.js";import{G as l}from"./LoadingSpinner-C2l8LZ79.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B52nvTyW.js";import"./hologram-canvas-DyF5pQY3.js";import"./chain-icon-D3MBpYXR.js";import"./service-BC0gkQFu.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C83xHGyB.js";import"./address-display-mQ3Y3XYv.js";import"./web-BAU47KQt.js";import"./createReactComponent-BDIgNuTp.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-Br48bveG.js";import"./index-Dfw9gGKV.js";import"./IconCheck-USSEt4uX.js";import"./IconChevronDown-Dp37T5Ai.js";import"./IconSettings-yj1Bi40R.js";import"./wallet-selector-nYwaMLgf.js";import"./wallet-mini-card-Cxnyn2hr.js";import"./token-icon-de4jd_f2.js";import"./amount-display-BQR-FVr2.js";import"./NumberFlow-client-48rw3j0J-Ct2rS8pX.js";import"./animated-number-dSc8u9RY.js";import"./time-display-C46oP4S7.js";import"./service-status-alert-Jd_yI-IU.js";import"./IconX-BMRcMVLs.js";import"./IconAlertTriangle-DNhEIuep.js";import"./IconLock-Dgy9iOnO.js";import"./item-CImQ9nfw.js";import"./button-1p66Js1j.js";import"./useButton-CdLwvVYf.js";import"./useRenderElement-D_lHscCc.js";import"./dropdown-menu-BMJk2wEd.js";import"./index-CdqI_8sU.js";import"./index-D7D0WxTK.js";import"./composite-DPoRaMak.js";import"./useBaseUiId-Bk33Hj1D.js";import"./useCompositeListItem-BK39sBcw.js";import"./useRole-1rN812y8.js";import"./user-profile-CFs3-A_r.js";import"./avatar-codec-qOpqRNDZ.js";import"./bioforest-C2-FpCP_.js";import"./web-CwEypqL6.js";import"./amount-BQsqQYGO.js";import"./notification-Co4MJ0FR.js";import"./index-DqfWNcG6.js";import"./transaction-meta-C0fC4A8j.js";import"./IconDots-BbiIX58H.js";import"./IconShieldCheck-BrdP5y_A.js";import"./IconApps-Cg0RoDT5.js";import"./IconCoins-CcJm1zIM.js";import"./IconSparkles-Cp5-Y3fR.js";import"./IconTrash-Cuz4NQYa.js";import"./transaction-list-DJpxq4wv.js";import"./transaction-item-BoHYwyHq.js";import"./IconRefresh-DoLFby2Y.js";import"./swipeable-tabs-DoHRlluG.js";import"./swiper-CPJL4tIU.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
