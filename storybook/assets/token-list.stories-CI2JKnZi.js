import{j as c}from"./iframe-Bc5dYfO-.js";import{a as p}from"./token-item-B284eJD6.js";import{G as l}from"./LoadingSpinner-BqEhSM8P.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BxR0mRiD.js";import"./hologram-canvas-CECchoom.js";import"./chain-icon-bdlbqJRU.js";import"./service-CGxZA-IU.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DbPDMDMk.js";import"./address-display-Df5KHumq.js";import"./web-D30SOBVp.js";import"./createReactComponent-hXyIZvjS.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-pE0FQzrM.js";import"./index-H1jWJtHO.js";import"./IconCheck-ZF7qLp9s.js";import"./IconChevronDown-CljZZP4G.js";import"./IconSettings-BwCCpDoO.js";import"./wallet-selector-MDarQY4P.js";import"./wallet-mini-card-BxYqNAPi.js";import"./token-icon-DJeldQc5.js";import"./amount-display-C8SFE2wL.js";import"./NumberFlow-client-48rw3j0J-DpoYLGtc.js";import"./animated-number-D7eLiomX.js";import"./time-display-BdaR1JAx.js";import"./service-status-alert-CyS1qfVu.js";import"./IconX-D8_buM2p.js";import"./IconAlertTriangle-BtOeJ8At.js";import"./IconLock-DWt1nFcX.js";import"./item-BowF0k7V.js";import"./button-BcW1mNGg.js";import"./useButton-CKC3Qtkx.js";import"./useRenderElement-COL4coyF.js";import"./dropdown-menu-B-oogOXW.js";import"./index-BwYkfJmd.js";import"./index-c16-kCsZ.js";import"./composite-CkhbC7xm.js";import"./useBaseUiId-BIdl776O.js";import"./useCompositeListItem-D6rn-rj8.js";import"./useRole-BhNiWXjL.js";import"./user-profile-D5pCeKXL.js";import"./avatar-codec-DnXoSb4O.js";import"./bioforest-BmGbxLfq.js";import"./web-DsfHXx1v.js";import"./amount-BQsqQYGO.js";import"./notification-CemyqBV6.js";import"./index-u75otDwf.js";import"./transaction-meta-B3D9DBMu.js";import"./IconDots-Du4SVB7e.js";import"./IconShieldCheck-Dzz0P7uj.js";import"./IconApps-DJ2MbUTl.js";import"./IconCoins-SFFKHDoe.js";import"./IconSparkles-B-jqd8rC.js";import"./IconTrash-BPT0AJNl.js";import"./transaction-list-gq68zMLp.js";import"./transaction-item-DzvdaE6i.js";import"./IconRefresh-CjfgLfBE.js";import"./swipeable-tabs-QKXsPfpq.js";import"./swiper-waIUqUrg.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
