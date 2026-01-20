import{j as c}from"./iframe-yG3M1UEA.js";import{a as p}from"./token-item-Bh1c5F2c.js";import{G as l}from"./index--zwHcY-K.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BrIWkoi0.js";import"./hologram-canvas-BGL_Vp9a.js";import"./chain-icon-BgQMCftU.js";import"./index-DmDOB9i5.js";import"./schemas-B18CumQY.js";import"./address-display-CQdINYS_.js";import"./web-e-ZjMs_9.js";import"./createReactComponent-CcUWevkd.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-Ue83x85s.js";import"./index-BITZp0vK.js";import"./IconCheck-DhHh2ed0.js";import"./IconChevronDown-BltvfUt6.js";import"./IconSettings-CLTL790Y.js";import"./wallet-selector-z7l2OIxG.js";import"./wallet-mini-card-qmqidQhG.js";import"./token-icon-B3i5Uih7.js";import"./amount-display-221qzEhX.js";import"./NumberFlow-client-48rw3j0J-BQYSJW3N.js";import"./animated-number-BSRqb4mJ.js";import"./time-display-BveBWRAB.js";import"./copyable-text-rdyEh8ck.js";import"./IconX-BAnqixsM.js";import"./button-CW7_tSrf.js";import"./useButton-DopBPLUQ.js";import"./useRenderElement-BmbBbWza.js";import"./dropdown-menu-XDR2-Va9.js";import"./index-B1V-spRG.js";import"./index-DqAxAFMm.js";import"./composite-TWot8NRH.js";import"./useBaseUiId-Bkc8Pgyv.js";import"./useCompositeListItem-DWZRXpS9.js";import"./useRole-BFx9eEna.js";import"./user-profile-BEbmA-Z3.js";import"./index-D0E7N0oa.js";import"./bioforest-B8KXXzKH.js";import"./avatar-codec-sXKPhKHq.js";import"./web-CCvb2Aue.js";import"./amount-BQsqQYGO.js";import"./notification-DQaQvDcm.js";import"./index-wTUQOqbP.js";import"./transaction-meta-C50SaR3A.js";import"./IconDots-CSXvYc_9.js";import"./IconShieldCheck-DBa17iUA.js";import"./IconApps-CMjyPYlV.js";import"./IconCoins-HqvPPILE.js";import"./IconSparkles-Ddo-_yNN.js";import"./IconLock-DcR2qbmX.js";import"./IconTrash-SZcq6rlX.js";import"./transaction-list-Dj8eltOv.js";import"./transaction-item-B4SEP5Z3.js";import"./IconRefresh-BK6yXk2F.js";import"./swipeable-tabs-CHrHCm6-.js";import"./swiper-BkdOpzaH.js";import"./IconAlertTriangle-BCEciQMJ.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Ce=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Ce as __namedExportsOrder,ye as default};
