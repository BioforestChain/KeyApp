import{j as c}from"./iframe-CW0HKnfK.js";import{a as p}from"./token-item-DjjXgzSg.js";import{G as l}from"./LoadingSpinner-CsiTLMNI.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CD6xzpVr.js";import"./hologram-canvas-DiHA3xv_.js";import"./chain-icon-TUm_932u.js";import"./service-CDZC6le2.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-KwxdGrFy.js";import"./address-display-D_SLwP7J.js";import"./web-CYC99Q0T.js";import"./createReactComponent-KebqDpbG.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-cFSh0vM6.js";import"./index-CcSC0LoF.js";import"./IconCheck-BlBMnhvK.js";import"./IconChevronDown-D8yE_0ZU.js";import"./IconSettings-BSz-iV3t.js";import"./wallet-selector-R9G5lsBN.js";import"./wallet-mini-card-EDDYL8mK.js";import"./token-icon-DhVUpJAM.js";import"./amount-display-d-vQiL_t.js";import"./NumberFlow-client-48rw3j0J-CMW7ehwK.js";import"./animated-number-8t-O-Slr.js";import"./time-display-RfWoc0zD.js";import"./service-status-alert-BofIZxyc.js";import"./IconX-D8e47WSB.js";import"./IconAlertTriangle-CtE30T_U.js";import"./IconLock-CD9BONNS.js";import"./item-BuOJDvOD.js";import"./button-CcABjfJE.js";import"./useButton-BXVvf6Bv.js";import"./useRenderElement-CcTlXYWN.js";import"./dropdown-menu-_c6A1jX3.js";import"./index-bOaFRSfi.js";import"./index-DKovnV-B.js";import"./composite-03DtIocM.js";import"./useBaseUiId-Bx27waN8.js";import"./useCompositeListItem-DlI1Dz-C.js";import"./useRole-C-A1XB9q.js";import"./user-profile-D4JtskIT.js";import"./avatar-codec-BiPEklkx.js";import"./bioforest-C_hmEQYa.js";import"./web-CP99ZaSt.js";import"./amount-BQsqQYGO.js";import"./notification-Dv2zkhCz.js";import"./index-Bec_IN0W.js";import"./transaction-meta-PUZBWFcL.js";import"./IconDots-BifyPlh3.js";import"./IconShieldCheck-C1duUOGh.js";import"./IconApps-D2lUzQJP.js";import"./IconCoins-bl3zVwgT.js";import"./IconSparkles-ocXdMcrl.js";import"./IconTrash-DDGPffQb.js";import"./transaction-list-C7c16xQz.js";import"./transaction-item-CCYhEwHW.js";import"./IconRefresh-p1bYHFSb.js";import"./swipeable-tabs-CF5XZ2zc.js";import"./swiper-CQtZY9aD.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
