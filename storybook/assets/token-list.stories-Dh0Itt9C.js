import{j as c}from"./iframe-D83HRxja.js";import{a as p}from"./token-item-D4rVa4rQ.js";import{G as l}from"./gradient-button-BMU4sITt.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-CV2xWVxX.js";import"./hologram-canvas-CWw662CY.js";import"./chain-icon-CPMMABXZ.js";import"./address-display-DMBPWyK8.js";import"./web-f237CAb2.js";import"./createReactComponent-D7OhYMh1.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-DO0JxAAY.js";import"./index-npW09g6C.js";import"./IconCheck-BSghpyhq.js";import"./IconChevronDown-BZp6kFlt.js";import"./IconSettings-Y9exJ1wq.js";import"./wallet-selector-BgmnXH-G.js";import"./wallet-mini-card-BrH-8AOB.js";import"./token-icon-DhHQv1yP.js";import"./chain-config-Bk_G759X.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-B4txTayA.js";import"./transaction-item-D4E_Ffwz.js";import"./loading-spinner-Bz27mwkU.js";import"./empty-state-DaZr51ss.js";import"./skeleton-CrEiQn3s.js";import"./amount-display-BcyyGRSk.js";import"./NumberFlow-client-48rw3j0J-BGcghRho.js";import"./animated-number-Dpvp6Z0Y.js";import"./time-display-O2nBreqk.js";import"./qr-code-D5l_HpWg.js";import"./index-ySv_Lraw.js";import"./icon-circle-B4y7N1Rv.js";import"./error-boundary-B2WqwxYa.js";import"./IconAlertCircle-DVbL7mU0.js";import"./IconAlertTriangle-Dgg3x20_.js";import"./IconCircleCheck-CAcXJ-EA.js";import"./IconInfoCircle-0_SBzl_3.js";import"./button-Dy8qyJWI.js";import"./index-B_jtOnfb.js";import"./useButton-B8xhICYR.js";import"./useRenderElement-Dbc4X9rA.js";import"./IconDots-wYRLlhLO.js";import"./IconShieldCheck-CgQ5L5l9.js";import"./IconTrash-COXgeTCe.js";import"./IconCoins-BS6ube4a.js";import"./IconSparkles-B5APTupF.js";import"./web-DC3fJ1nC.js";import"./transaction-list-BuYGXwvn.js";import"./swipeable-tabs-COfZlsMW.js";import"./swiper-C99ydrCt.js";import"./index-DZxl4Jsp.js";const de={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ge=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ge as __namedExportsOrder,de as default};
