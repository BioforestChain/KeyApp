import{j as c}from"./iframe-CFpGkAjA.js";import{a as p}from"./token-item-BbuV6aEB.js";import{G as l}from"./gradient-button-BKnqpZTJ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-jFYZ5D3a.js";import"./hologram-canvas-CbGt9xsU.js";import"./chain-icon-BZM7j_No.js";import"./address-display-qd-NVj1v.js";import"./web-DtjOFHbD.js";import"./createReactComponent-Betra0kq.js";import"./breakpoint-BtpSOnE_.js";import"./schemas-jh0dXz-I.js";import"./useTranslation-CDZKQa2p.js";import"./index-Slj_T9xx.js";import"./IconCheck-Dh4QVP6f.js";import"./IconChevronDown-DXPJMV_w.js";import"./IconSettings-DY52EQHR.js";import"./wallet-selector-zjjbk2An.js";import"./wallet-mini-card-CaeGhx4l.js";import"./token-icon-FucWKfSH.js";import"./address-book-C3tEszDR.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-C5urSFKc.js";import"./transaction-item-B_fmcGf9.js";import"./loading-spinner-efZLewvE.js";import"./empty-state-BOKhZfpO.js";import"./skeleton-DdfhkAAr.js";import"./amount-display-xrl_L3xI.js";import"./animated-number-CdvtBMz3.js";import"./time-display-BQl0mpsc.js";import"./qr-code-BaIhanpY.js";import"./index-D_k49hOT.js";import"./icon-circle-CS9B9w32.js";import"./copyable-text-Nuk-EDvM.js";import"./IconAlertCircle-Ca1EqWpa.js";import"./IconAlertTriangle-T4nWkjb3.js";import"./IconCircleCheck-Ba0FshAm.js";import"./IconInfoCircle-Cg8NZ49V.js";import"./button-BesopRSp.js";import"./index-B_jtOnfb.js";import"./useButton-BkynlJIp.js";import"./useRenderElement-CxuenlXE.js";import"./IconX-CcL_Nguo.js";import"./IconDots-BHLLO-yx.js";import"./IconShieldCheck-g8HJFHZe.js";import"./IconTrash-BwQbcbDv.js";import"./IconCoins-BAYhE_ed.js";import"./IconSparkles-CYvSgR_S.js";import"./web-BQE0kU4e.js";import"./dropdown-menu-CCG5lmjW.js";import"./index-VioGDbtO.js";import"./index-SoxwFb86.js";import"./composite-DTVORTdH.js";import"./useBaseUiId-CB9N3xnp.js";import"./useCompositeListItem-Cd2SjJG_.js";import"./useRole-BVGrerk4.js";import"./transaction-list-OdGPHrq0.js";import"./swipeable-tabs-CJwmL2Q5.js";import"./swiper-ltDC8nFE.js";import"./index-CPqdIq6z.js";const Se={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},m={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},s={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [mockTokens[0]!],
    onTokenClick: token => alert(\`Clicked \${token.symbol}\`)
  }
}`,...m.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const Be=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,n as Empty,r as Loading,s as ManyTokens,m as SingleToken,t as WithChange,Be as __namedExportsOrder,Se as default};
