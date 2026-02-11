import{j as c}from"./iframe-Kk7PKd4n.js";import{a as p}from"./token-item-BXFcRQgC.js";import{G as l}from"./LoadingSpinner-ZFGMOT8x.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BQGlFaaR.js";import"./hologram-canvas-BzP0pJ9a.js";import"./chain-icon-BrLPdU3y.js";import"./service-jFVXuHrr.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DJhYogh4.js";import"./address-display-CxyJ9zIP.js";import"./web-BhghXOIa.js";import"./createReactComponent-CDyGl8aX.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BAv9mhc7.js";import"./index-Bn_23nsC.js";import"./IconCheck-CnpzFmaP.js";import"./IconChevronDown-BMYHZkUl.js";import"./IconSettings-By99Zr9j.js";import"./wallet-selector-BYe9zicN.js";import"./wallet-mini-card-BP2WxyrA.js";import"./token-icon-CSEH8XGk.js";import"./amount-display-B9A3VwDo.js";import"./NumberFlow-client-48rw3j0J-B-5GPMPZ.js";import"./animated-number-BupWvh2q.js";import"./time-display-CTjqOchV.js";import"./service-status-alert-EBr-dP6J.js";import"./IconX-idUnWUl_.js";import"./IconAlertTriangle-DXIWb2qC.js";import"./IconLock-BPcg993d.js";import"./item-DV5xUtOH.js";import"./button-B4YvZqLZ.js";import"./useButton-DeeHBbqO.js";import"./useRenderElement-CFtSrzF6.js";import"./dropdown-menu-CvdDPmuH.js";import"./index-C5VmK4Co.js";import"./index-DKcGjq4G.js";import"./composite-CDMymWWq.js";import"./useBaseUiId-xmQiqxmi.js";import"./useCompositeListItem-Dmy3ZY6K.js";import"./useRole-BJOTcYTb.js";import"./user-profile-B9W8YZef.js";import"./avatar-codec-CqakAZD-.js";import"./bioforest-C2Bs00lR.js";import"./web-BMb4K9Ev.js";import"./amount-BQsqQYGO.js";import"./notification-BJ3ETAQl.js";import"./index-0MlDbHp8.js";import"./transaction-meta-C1SzuBQ_.js";import"./IconDots-CWhHuyfe.js";import"./IconShieldCheck-BP5oK3ye.js";import"./IconApps-BBYmf364.js";import"./IconCoins-yuPuQtWm.js";import"./IconSparkles-DRVaP6lL.js";import"./IconTrash-Cd8yDVkk.js";import"./transaction-list-YylfrwKN.js";import"./transaction-item-BLMJMUv2.js";import"./IconRefresh-BRp-RwlG.js";import"./swipeable-tabs-CJZmC3K5.js";import"./swiper-B_oYc_C_.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
