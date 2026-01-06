import{j as c}from"./iframe-Cctxta_P.js";import{a as p}from"./token-item-JMOiWq81.js";import{G as l}from"./gradient-button-CI0i7sXk.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-DUvztJIp.js";import"./hologram-canvas-B-4TSu35.js";import"./chain-icon-DZMbM4Yp.js";import"./address-display-Dtq1ht35.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Cyi9axMr.js";import"./index-ECTMCtyo.js";import"./IconCheck-BUbIsnVA.js";import"./createReactComponent-BokZZTcn.js";import"./IconCopy-XrsQyI7S.js";import"./IconChevronDown-BNgXvKMn.js";import"./IconSettings-BW6CvsVM.js";import"./wallet-selector-Bl24-a4p.js";import"./wallet-mini-card-C-JPi8da.js";import"./token-icon-DtvtRadC.js";import"./amount-BQsqQYGO.js";import"./index-Ar-6A-5n.js";import"./chain-config-DqVXGLIz.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-B6DGk-oU.js";import"./loading-spinner-CQ_N_PP1.js";import"./empty-state-QlYsD_4V.js";import"./skeleton-dMQmJuYw.js";import"./amount-display-lh-aDGFD.js";import"./NumberFlow-client-48rw3j0J-D-9LcztC.js";import"./animated-number-uR3fQozJ.js";import"./time-display-DtS7YJCT.js";import"./qr-code-CY_2OM_C.js";import"./index-C069iInY.js";import"./icon-circle-DAEhXiJ_.js";import"./error-boundary-DnCREgnV.js";import"./IconAlertCircle-BEx518Hp.js";import"./IconAlertTriangle-D1gPId_I.js";import"./IconCircleCheck-B3YbjWQ1.js";import"./IconInfoCircle-Cpbyhs8C.js";import"./button-sjDKCcea.js";import"./index-B_jtOnfb.js";import"./useButton-BiCET3WI.js";import"./useRenderElement-qlaWX--Y.js";import"./IconDots-BSGCpCPI.js";import"./IconShieldCheck-DQW5fnOn.js";import"./IconTrash-B0njLt7H.js";import"./IconCoins-B8xpaPYW.js";import"./IconSparkles-B5YMY-mG.js";import"./web-DnZPwNCZ.js";import"./transaction-list-X9g1OvtJ.js";import"./swipeable-tabs-BaNw0YM4.js";import"./swiper-DvJCME9U.js";import"./index-CYflX4oo.js";const ge={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
