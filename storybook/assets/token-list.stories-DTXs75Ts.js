import{j as c}from"./iframe-DTpQIzq1.js";import{a as p}from"./token-item-B-Yhx2Mr.js";import{G as l}from"./LoadingSpinner-CbUFHdMO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DtzK5SbP.js";import"./hologram-canvas-X0Mx2Nye.js";import"./chain-icon-DLgsiDR8.js";import"./service-D4i2Uv6t.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation--GAl6nWo.js";import"./address-display-BVeK0L-i.js";import"./web-Dm6GheK3.js";import"./createReactComponent-D4ZaaTIu.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CVemGc0k.js";import"./index-TsPtL0LE.js";import"./IconCheck-COB4eBHK.js";import"./IconChevronDown-BWOku7Lq.js";import"./IconSettings-GZyGtNTZ.js";import"./wallet-selector-D9QtlIms.js";import"./wallet-mini-card-DWUTD6NE.js";import"./token-icon-BV60drsj.js";import"./amount-display-CGgNQjFm.js";import"./NumberFlow-client-48rw3j0J-BN6nX1uP.js";import"./animated-number-92onOt7L.js";import"./time-display-DtU9CPr-.js";import"./service-status-alert-DvcFWwhs.js";import"./IconX-DyZuEkrC.js";import"./IconAlertTriangle-BDRUS8IK.js";import"./IconLock-CHLosCo7.js";import"./item-CCUrThn6.js";import"./button-COZIujNI.js";import"./useButton-CsylPOAT.js";import"./useRenderElement-C1xkhfI3.js";import"./dropdown-menu-C4CeZO8V.js";import"./index-CNO-_GAD.js";import"./index-BkISFBi8.js";import"./composite-xO1Che9I.js";import"./useBaseUiId-DvXQ5IFd.js";import"./useCompositeListItem-BUUMQSOB.js";import"./useRole-DkVK27nV.js";import"./user-profile-r4nmwqQc.js";import"./avatar-codec-4BeBrU8C.js";import"./bioforest-BvzUPcJJ.js";import"./web-DPTvhKpB.js";import"./amount-BQsqQYGO.js";import"./notification-B2SGeJJv.js";import"./index-CSFJ9ZmU.js";import"./transaction-meta-CHvdIbgW.js";import"./IconDots-DbkBQL6y.js";import"./IconShieldCheck-CuHO4ObS.js";import"./IconApps-Dkyb7CtR.js";import"./IconCoins-D3BZzbFq.js";import"./IconSparkles-B9Ipurwd.js";import"./IconTrash-2M4E5kit.js";import"./transaction-list-BG20FwUO.js";import"./transaction-item-DlK_uY38.js";import"./IconRefresh-Cd00wlFK.js";import"./swipeable-tabs-Dw3yEHxr.js";import"./swiper-C4abKS8E.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
