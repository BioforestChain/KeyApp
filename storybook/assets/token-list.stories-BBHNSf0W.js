import{j as c}from"./iframe-CJpTPnNI.js";import{a as p}from"./token-item-CGxB5lVg.js";import{G as l}from"./gradient-button-WUoG9QqF.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-sn_akng3.js";import"./hologram-canvas-CO0bFt0z.js";import"./chain-icon-ao6YL0QW.js";import"./address-display-BewaP61y.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-B6RbLzit.js";import"./index-CllyeN4y.js";import"./IconCheck-Br1586__.js";import"./createReactComponent-DiopHDoT.js";import"./IconCopy-CNsa4--3.js";import"./IconChevronDown-B2x_GYvW.js";import"./IconSettings-Bhnyh3sa.js";import"./wallet-selector-CS5Dmk7p.js";import"./wallet-mini-card-DoDBeEdD.js";import"./token-icon-C4yEx6_v.js";import"./amount-BQsqQYGO.js";import"./index-DxVYZOB2.js";import"./chain-config-DG5VSGct.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-DyjwoM8W.js";import"./loading-spinner-BHFMxiCX.js";import"./empty-state-CYj05h1C.js";import"./skeleton-BoASDR21.js";import"./amount-display-oUIkkG1O.js";import"./NumberFlow-client-48rw3j0J-CoNjnbWe.js";import"./animated-number-D8ft1ipC.js";import"./time-display-BqW6FLB5.js";import"./qr-code-C2Yb-ANj.js";import"./index-6CQ18jak.js";import"./icon-circle-6ouslsgQ.js";import"./error-boundary-DceKJLMP.js";import"./IconAlertCircle-BHrbNzHj.js";import"./IconAlertTriangle-rm2kPBw9.js";import"./IconCircleCheck-CmmoD_IB.js";import"./IconInfoCircle-BtRDlUfR.js";import"./button-C9OFjL0U.js";import"./index-B_jtOnfb.js";import"./useButton-BAme-r7q.js";import"./useRenderElement-CRMvYRht.js";import"./IconDots-vbXjfyP8.js";import"./IconShieldCheck-CFIq47qH.js";import"./IconTrash-Brp1mZml.js";import"./IconCoins-CTF_9g0v.js";import"./IconSparkles-BGU0sqjx.js";import"./web-BIhcrt-B.js";import"./transaction-list-Dhc-JML6.js";import"./swipeable-tabs-Ce9leze8.js";import"./swiper-BrqzJ7J4.js";import"./index-BHTpyBc-.js";const ge={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
