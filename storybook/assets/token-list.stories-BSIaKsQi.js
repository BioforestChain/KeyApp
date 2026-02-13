import{j as c}from"./iframe-BR45iAMW.js";import{a as p}from"./token-item-DB5CCZDz.js";import{G as l}from"./LoadingSpinner-DWYpTTXX.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Bc_lfvoU.js";import"./hologram-canvas-SQznhQoe.js";import"./chain-icon-B_1PGQlm.js";import"./service-BG9WHSO3.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DTxxAQrg.js";import"./address-display-DoYb0ezu.js";import"./web-GM-31yRx.js";import"./createReactComponent-Cr_JlDar.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-UW7x6zxI.js";import"./index-DhoY983P.js";import"./IconCheck-v8m3rHGX.js";import"./IconChevronDown-DrWE8cyA.js";import"./IconSettings-Cop-RZ7G.js";import"./wallet-selector-DQL7dfst.js";import"./wallet-mini-card-BYDRIWa-.js";import"./token-icon-yA8qhqgF.js";import"./amount-display-Css5Hf-P.js";import"./NumberFlow-client-48rw3j0J-TpGsm6T1.js";import"./animated-number-DdvJ4k-8.js";import"./time-display-DcP4k5Dd.js";import"./service-status-alert-ojMkbY79.js";import"./IconX-DKqMCN7v.js";import"./IconAlertTriangle-TGrMiTd1.js";import"./IconLock-Cy2btxe9.js";import"./item-D1N6EJ7R.js";import"./button-BMLPHxvn.js";import"./useButton-DybKAZj4.js";import"./useRenderElement-Cz1qcXuI.js";import"./dropdown-menu-DzgcbT2t.js";import"./index-CBm62IZg.js";import"./index-BBWUVVP6.js";import"./composite-CVNPtJKJ.js";import"./useBaseUiId-DZoT4-w_.js";import"./useCompositeListItem-CcqY4GBI.js";import"./useRole-vxWigCn4.js";import"./user-profile-m_4h1kNV.js";import"./avatar-codec-B7tqEbLC.js";import"./bioforest-BfH-QX95.js";import"./web-CKNM4f4f.js";import"./amount-BQsqQYGO.js";import"./notification-BdHiFbVv.js";import"./index-DAr2LevI.js";import"./transaction-meta-Cdembg-G.js";import"./IconDots-BImpHy_w.js";import"./IconShieldCheck-C6V2OFk2.js";import"./IconApps-CMA5qy0e.js";import"./IconCoins-BAtYWM7J.js";import"./IconSparkles-CWUP8kUX.js";import"./IconTrash-Dw9dnYxQ.js";import"./transaction-list-peJBXQ_4.js";import"./transaction-item-BEZLiq7a.js";import"./IconRefresh-DW5nHQAu.js";import"./swipeable-tabs-CTCD_uqd.js";import"./swiper-svLbWJk-.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
