import{j as c}from"./iframe-CjNAZWHM.js";import{a as p}from"./token-item-Cted_Xpb.js";import{G as l}from"./LoadingSpinner-Cjkf_QGd.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Bd_OI2UY.js";import"./hologram-canvas-B8uTqRKr.js";import"./chain-icon-CDTuspbG.js";import"./service-DX3F1YPH.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Cj-RqwiM.js";import"./address-display-DZFN_LUh.js";import"./web-DRZapiqy.js";import"./createReactComponent-CArIJyMr.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-D270kyXf.js";import"./index-4c9erh7n.js";import"./IconCheck-Dl2jguS3.js";import"./IconChevronDown-CuQ0Ve8a.js";import"./IconSettings-WI27aMGa.js";import"./wallet-selector-CPZ8Ll9C.js";import"./wallet-mini-card-CugPSC3F.js";import"./token-icon-P2wS9O-c.js";import"./amount-display-Dv0Bo_Kg.js";import"./NumberFlow-client-48rw3j0J-DG-hRf6_.js";import"./animated-number-DFvkHwcr.js";import"./time-display-C9sdpFdb.js";import"./service-status-alert-D-Sf9C6C.js";import"./IconX-Lz2DqxLP.js";import"./IconAlertTriangle-CUJNbpdK.js";import"./IconLock-C_RWtKvn.js";import"./item-BgQL2e4c.js";import"./button-DMqAWtsn.js";import"./useButton-iVMgXrVa.js";import"./useRenderElement-BvBLNdnY.js";import"./dropdown-menu-bzn5EIIn.js";import"./index-UxxBKekv.js";import"./index-BgMTTpSu.js";import"./composite-ByJoG1Nm.js";import"./useBaseUiId-YPpUgNuI.js";import"./useCompositeListItem-WRqsNetd.js";import"./useRole-CfUUeuZl.js";import"./user-profile-CWiRqJSL.js";import"./avatar-codec-C3ZbrPmW.js";import"./bioforest--iaNmfPA.js";import"./web-BkbcmaZ7.js";import"./amount-BQsqQYGO.js";import"./notification-BRDaKN_I.js";import"./index-BLoeWecs.js";import"./transaction-meta-aw8PzB02.js";import"./IconDots-CFUlnwSa.js";import"./IconShieldCheck-C9aio8XT.js";import"./IconApps-DVFl7DoK.js";import"./IconCoins-DYjY0TR4.js";import"./IconSparkles-DsTq8Y4e.js";import"./IconTrash-h8KTBFfl.js";import"./transaction-list-DwNSVK6h.js";import"./transaction-item-CUrgnKLZ.js";import"./IconRefresh-BXPduv3e.js";import"./swipeable-tabs-CxCDoMyg.js";import"./swiper-CHoFVZXx.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
