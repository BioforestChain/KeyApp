import{j as c}from"./iframe-L7e6CwBi.js";import{a as p}from"./token-item-BN1vQtcF.js";import{G as l}from"./LoadingSpinner-D8h96wqT.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-KH9IW3AU.js";import"./hologram-canvas-CrlkpdW-.js";import"./chain-icon-BjpzV8oD.js";import"./service-BkoiQvzo.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-ClDV6VJV.js";import"./address-display-aCyqLODp.js";import"./web-Bam-Uxu-.js";import"./createReactComponent-CIub4Pjs.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DZkVTLt1.js";import"./index-m-NcY5rd.js";import"./IconCheck-DJnsYo3P.js";import"./IconChevronDown-BAzgAUev.js";import"./IconSettings-DvD1Dnss.js";import"./wallet-selector-CQhcO5cx.js";import"./wallet-mini-card-BwMSWfik.js";import"./token-icon-MrYGxV9K.js";import"./amount-display-c5B9UmC2.js";import"./NumberFlow-client-48rw3j0J-C7hLHJvf.js";import"./animated-number-kUCpIV8K.js";import"./time-display-B84G4PlB.js";import"./service-status-alert-CsY0nOXP.js";import"./IconX-2B5iZ3gJ.js";import"./IconAlertTriangle-q6rTffVs.js";import"./IconLock-CNZAliUz.js";import"./item-D_dtNmWL.js";import"./button-DX-bk_V0.js";import"./useButton-ClQAgxW6.js";import"./useRenderElement-CcBO2jkL.js";import"./dropdown-menu--gaPf34t.js";import"./index-yjycLuDL.js";import"./index-DRjRCFKh.js";import"./composite-NfyfWuPm.js";import"./useBaseUiId-D0okJEiV.js";import"./useCompositeListItem-IV7zQz4L.js";import"./useRole-CquWwlko.js";import"./user-profile-CHlUKcQX.js";import"./avatar-codec-DSrqv8PA.js";import"./bioforest-CcSgL-Rz.js";import"./web-Q-8HLczx.js";import"./amount-BQsqQYGO.js";import"./notification-CD7IojhX.js";import"./index-DNOIQ5JC.js";import"./transaction-meta-C_hpZP2y.js";import"./IconDots-C9XXo4MO.js";import"./IconShieldCheck-i0WeW1qP.js";import"./IconApps-CQ0naSXE.js";import"./IconCoins-CyOyqDuB.js";import"./IconSparkles-Do_ILksU.js";import"./IconTrash-DSjHjGIP.js";import"./transaction-list-CSwf5aWH.js";import"./transaction-item-BCL83_Z0.js";import"./IconRefresh-BmoO8cEI.js";import"./swipeable-tabs-D8412_Lc.js";import"./swiper-Cec49WGK.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
