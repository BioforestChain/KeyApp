import{j as c}from"./iframe-Bu8vBBK2.js";import{a as p}from"./token-item-C8t01zQq.js";import{G as l}from"./LoadingSpinner-DfHaoYBN.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BWtY3Fc6.js";import"./hologram-canvas-DiTnLLSr.js";import"./chain-icon-7U47vHQI.js";import"./service--Mqh_DSQ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BZaKSuyr.js";import"./address-display-BiIwwtiY.js";import"./web-BsJG9fyC.js";import"./createReactComponent-B3fyDuOV.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DSO3RflT.js";import"./index-B0frnpMB.js";import"./IconCheck-BcbRkREA.js";import"./IconChevronDown-Dqhk_rAy.js";import"./IconSettings-BXr0MRGd.js";import"./wallet-selector-B2bhyGaf.js";import"./wallet-mini-card-B5QzJtxc.js";import"./token-icon-CltFdT0v.js";import"./amount-display-8DMr2mX2.js";import"./NumberFlow-client-48rw3j0J-DaB1gdlH.js";import"./animated-number-LTL9mJSy.js";import"./time-display-11679yk4.js";import"./service-status-alert-DCVo_2qu.js";import"./IconX-CnPfztf2.js";import"./IconAlertTriangle-COxsPMPM.js";import"./IconLock-COMhNNj1.js";import"./item-CX6cFyF3.js";import"./button-pYIUVeot.js";import"./useButton-Bf_sKxnR.js";import"./useRenderElement-C1Qv1Ytg.js";import"./dropdown-menu-C7KPROeA.js";import"./index-Cm8W-1JC.js";import"./index-js5TxTrX.js";import"./composite-6RRYBQOo.js";import"./useBaseUiId-B2u4fsuq.js";import"./useCompositeListItem-1aD8xPiH.js";import"./useRole-BOlUUFFS.js";import"./user-profile-DTWKadOg.js";import"./avatar-codec-DCNIENse.js";import"./bioforest-BHTl2ieS.js";import"./web-BDPsUnWU.js";import"./amount-BQsqQYGO.js";import"./notification-Bio-xl4W.js";import"./index-CT6lxcKj.js";import"./transaction-meta-BjA9BfYB.js";import"./IconDots-BKCoa7B8.js";import"./IconShieldCheck-BYNzAE6A.js";import"./IconApps-Bq8QbrYc.js";import"./IconCoins-BoXn536m.js";import"./IconSparkles-oX6E7hRR.js";import"./IconTrash-5cBoP5c_.js";import"./transaction-list-B1l1-vdw.js";import"./transaction-item-DrutLN0G.js";import"./IconRefresh-DSlr227u.js";import"./swipeable-tabs-yFu5iYDx.js";import"./swiper-ByuKktKe.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
