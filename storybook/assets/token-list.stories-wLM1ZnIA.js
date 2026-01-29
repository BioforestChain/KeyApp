import{j as c}from"./iframe-DuWoFZa1.js";import{a as p}from"./token-item-C8AKzU6U.js";import{G as l}from"./LoadingSpinner-CInkRrqh.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CY3qRxPx.js";import"./hologram-canvas-nxCH4NXY.js";import"./chain-icon-CtkyRNw6.js";import"./service-7REn8_1J.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Blh9YRwv.js";import"./address-display-DE2Il6I9.js";import"./web-CynV9cj-.js";import"./createReactComponent-sOLayI23.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-D87pdBv3.js";import"./index-nyV1BjU-.js";import"./IconCheck-BSGYp6F1.js";import"./IconChevronDown-R5l216Dv.js";import"./IconSettings-Cutm-Ot8.js";import"./wallet-selector-Zl8uCqEg.js";import"./wallet-mini-card-Lu6ZktPi.js";import"./token-icon-CZk56E7S.js";import"./amount-display-DqzE5YYf.js";import"./NumberFlow-client-48rw3j0J-CXOdaeDr.js";import"./animated-number-DbZo4d2E.js";import"./time-display-BVQBKTcW.js";import"./service-status-alert-C54c6gy2.js";import"./IconX-Dtpro1_C.js";import"./IconAlertTriangle-BLehs_sv.js";import"./IconLock-CH8n3TO-.js";import"./button-suH-SeIc.js";import"./useButton-DOC8L4nN.js";import"./useRenderElement-BoyeB58t.js";import"./dropdown-menu-CR-XeJqe.js";import"./index-Dr9PUhKz.js";import"./index-1JIwLk-f.js";import"./composite-Bk1uAzYt.js";import"./useBaseUiId-CKGkVbTz.js";import"./useCompositeListItem-BgNNQN3L.js";import"./useRole-cPJejg-_.js";import"./user-profile-3w8N-D48.js";import"./avatar-codec-DipF3moC.js";import"./bioforest-CK2J0SkG.js";import"./web-CcYYaylu.js";import"./amount-BQsqQYGO.js";import"./notification-BjgFEM0w.js";import"./index-Bv9MHI49.js";import"./transaction-meta-B-Moyhe2.js";import"./IconDots-BoJ8eKKT.js";import"./IconShieldCheck-BWhqWgTK.js";import"./IconApps-D3F100lu.js";import"./IconCoins-l5CnnU1s.js";import"./IconSparkles-eqa42yAr.js";import"./IconTrash-C2OYKY0f.js";import"./transaction-list-Ci-lc2ky.js";import"./transaction-item-BaBh2QXF.js";import"./IconRefresh-_Vj9Oat1.js";import"./swipeable-tabs-DbUAOixp.js";import"./swiper-s5e33Ujd.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Te=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Te as __namedExportsOrder,Ce as default};
