import{j as c}from"./iframe-DFuQ4OKQ.js";import{a as p}from"./token-item-ByaOKxJa.js";import{G as l}from"./LoadingSpinner-CJFCEke3.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-C1gLrr7I.js";import"./hologram-canvas-BIIfoBYW.js";import"./chain-icon-CZyWARmZ.js";import"./index-bgdHFUqx.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-7d4ATrNt.js";import"./address-display-CNidmkbx.js";import"./web-CVC0sofk.js";import"./createReactComponent-CkViK6dM.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DawiKlXH.js";import"./index-sxSVhNJ_.js";import"./IconCheck-BILXnvtI.js";import"./IconChevronDown-DEFHHumW.js";import"./IconSettings-Boqfo4Sc.js";import"./wallet-selector-Ds-XsLNv.js";import"./wallet-mini-card-tS8nwik5.js";import"./token-icon-BbKi1uu-.js";import"./amount-display-2JdIVUpZ.js";import"./NumberFlow-client-48rw3j0J-BRKy6nA-.js";import"./animated-number-DXX_Pop1.js";import"./time-display-CwXe5eET.js";import"./service-status-alert-BWLLhy99.js";import"./IconX-DgzNV7il.js";import"./IconAlertTriangle-BQeYwvuG.js";import"./IconLock-DUnM8E9H.js";import"./button-CpqZKowH.js";import"./useButton-CkP7kAlw.js";import"./useRenderElement-CbMuY0Vd.js";import"./dropdown-menu-CAnJAzmU.js";import"./index-BVpi7oUv.js";import"./index-BxdftXVI.js";import"./composite-CJM0Gx6J.js";import"./useBaseUiId-BiVdDrkW.js";import"./useCompositeListItem-MCpOKMTF.js";import"./useRole-CNC_FzT6.js";import"./user-profile-DeX7ReIm.js";import"./avatar-codec-DjP94FEJ.js";import"./bioforest-rEZVvMJT.js";import"./web-DLlk0-by.js";import"./amount-BQsqQYGO.js";import"./notification-C11fd27U.js";import"./index-7QGlxuRQ.js";import"./transaction-meta-DerNCs5Q.js";import"./IconDots-B_1zqnoM.js";import"./IconShieldCheck-D9gyzwoW.js";import"./IconApps-BFpEEw3e.js";import"./IconCoins-CdtidTVS.js";import"./IconSparkles-K0Ewm2q9.js";import"./IconTrash-BcgulBtf.js";import"./transaction-list-BCbo6sjU.js";import"./transaction-item-NLS_b6JG.js";import"./IconRefresh-CZVykAqY.js";import"./swipeable-tabs-CqUL53Yc.js";import"./swiper-CNUWtryQ.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
