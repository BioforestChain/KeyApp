import{j as c}from"./iframe-D8HuPklR.js";import{a as p}from"./token-item-DVa5EJn5.js";import{G as l}from"./gradient-button-BoxP_5VQ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-kVfzh3P2.js";import"./hologram-canvas-8qoCKe-D.js";import"./chain-icon-ZTjI2YHg.js";import"./address-display-BLKTwJkl.js";import"./web-DAAeEFIs.js";import"./createReactComponent-DdmPrrAT.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-5HKfA7bW.js";import"./index-D85HYSDi.js";import"./IconCheck-Bm191dgP.js";import"./IconChevronDown-BeDBGQvx.js";import"./IconSettings-CE1p3rdT.js";import"./wallet-selector-qOlIUMVR.js";import"./wallet-mini-card-B6589S7A.js";import"./token-icon-Ca0sc-Eh.js";import"./chain-config-BTy51NxL.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-BpO8vo8u.js";import"./transaction-item-1yNFMmpo.js";import"./loading-spinner-CI59dVg1.js";import"./empty-state-AHA5q4Af.js";import"./skeleton-n7XL7W8x.js";import"./amount-display-xaPhfsQD.js";import"./NumberFlow-client-48rw3j0J-C8Uh9xZE.js";import"./animated-number-B7Ac1SOd.js";import"./time-display-CAOlWQlz.js";import"./qr-code-B4m9ayQ4.js";import"./index-fAcS8NTV.js";import"./icon-circle--K3XnjCB.js";import"./copyable-text-FxibUpBr.js";import"./IconAlertCircle-DmfGovmB.js";import"./IconAlertTriangle-DDmjzwOD.js";import"./IconCircleCheck-D-M2FNtX.js";import"./IconInfoCircle-CxAPThhN.js";import"./button-B8ZysgrZ.js";import"./index-B_jtOnfb.js";import"./useButton-hp5SGEGC.js";import"./useRenderElement-Dtgsp6Pg.js";import"./IconX-CfRcC0S9.js";import"./IconDots-Sxr6XZN3.js";import"./IconShieldCheck-bljxd_qn.js";import"./IconTrash-kwiUrPG-.js";import"./IconCoins-C58B3_g9.js";import"./IconSparkles-CEkQEtKZ.js";import"./web-DSAis8To.js";import"./transaction-list-B8xu9p81.js";import"./swipeable-tabs-CTBIrBXy.js";import"./swiper-DPx5oLr3.js";import"./index-DO3qvWDr.js";const ge={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [],
    loading: true
  }
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [],
    emptyAction: <GradientButton size="sm">转入资产</GradientButton>
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const be=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,be as __namedExportsOrder,ge as default};
