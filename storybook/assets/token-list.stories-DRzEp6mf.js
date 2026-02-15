import{j as c}from"./iframe-DDIM8zrC.js";import{a as p}from"./token-item-QhQdagNr.js";import{G as l}from"./LoadingSpinner-DioF2prX.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BbSOQk4Z.js";import"./hologram-canvas-BpcW5D3u.js";import"./chain-icon-Bpc7N42b.js";import"./service-C6MKWekp.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CLxSf9WB.js";import"./address-display-e7Xe9fUV.js";import"./web-CU6WXRKf.js";import"./createReactComponent-qYmak6bv.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CzpZJ1d8.js";import"./index-aBLE1Wau.js";import"./IconCheck-BFZ8eQMm.js";import"./IconChevronDown-Cuer3vnA.js";import"./IconSettings-BugD0VtZ.js";import"./wallet-selector-CdgCmxy_.js";import"./wallet-mini-card-BQRGN9Ea.js";import"./token-icon-D6VWYQ09.js";import"./amount-display-Bl6LrXk_.js";import"./NumberFlow-client-48rw3j0J-Dvcw7fuQ.js";import"./animated-number-D0usAa3t.js";import"./time-display-auybcsHn.js";import"./service-status-alert-f7sa2IJX.js";import"./IconX-RUI1FtvX.js";import"./IconAlertTriangle-CtUB79Ao.js";import"./IconLock-CRUzFQfZ.js";import"./item-BP0gePPE.js";import"./button-DiXbBXrQ.js";import"./useButton-aGui-FA9.js";import"./useRenderElement-Dd9A4p6M.js";import"./dropdown-menu-cDIITaA5.js";import"./index-IdRvP6yL.js";import"./index-DL6qpJSC.js";import"./composite-6FqvPWdU.js";import"./useBaseUiId-amthYDtt.js";import"./useCompositeListItem-DjK348uT.js";import"./useRole-BOfFMoAv.js";import"./user-profile-B2ylnteg.js";import"./avatar-codec-J3SA6AdB.js";import"./bioforest-D2esP7jr.js";import"./web-Cbj36BKO.js";import"./amount-BQsqQYGO.js";import"./notification-DdMaQF4f.js";import"./index-DISKxu8e.js";import"./transaction-meta-D4zXbu5I.js";import"./IconDots-BQVtKJcz.js";import"./IconShieldCheck-Cwk5eHwx.js";import"./IconApps-BLnbRlNe.js";import"./IconCoins-C5O5fnhT.js";import"./IconSparkles-D8tTPAN8.js";import"./IconTrash-98l5ZCiv.js";import"./transaction-list-D-r1tpjT.js";import"./transaction-item-COM1UALr.js";import"./IconRefresh-Bp9TZr_k.js";import"./swipeable-tabs-DhRwxkqV.js";import"./swiper-DcGDDJr0.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
