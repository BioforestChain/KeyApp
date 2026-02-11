import{j as c}from"./iframe-D_wumixU.js";import{a as p}from"./token-item-DMjAuIJh.js";import{G as l}from"./LoadingSpinner-DOo5Lv34.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DFVtPPt5.js";import"./hologram-canvas-Brsi-NY4.js";import"./chain-icon-CMc0nT-_.js";import"./service-DJC3MZ37.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-ZlXlbSXA.js";import"./address-display-qWDX3fR_.js";import"./web-DjtR0MQH.js";import"./createReactComponent-DTmO_ECI.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BUN0bWmz.js";import"./index-DJ7mgCHa.js";import"./IconCheck-D_havJbe.js";import"./IconChevronDown-La6X4-Uq.js";import"./IconSettings-JsZaJU9x.js";import"./wallet-selector-CHyyTD0N.js";import"./wallet-mini-card-Bgd4VsPg.js";import"./token-icon-DohYnksY.js";import"./amount-display-C0oJy3zC.js";import"./NumberFlow-client-48rw3j0J-C4JYfZGI.js";import"./animated-number-DmfCnYog.js";import"./time-display-_-82LLLN.js";import"./service-status-alert-DYDMaSOj.js";import"./IconX-zx6_11bs.js";import"./IconAlertTriangle-CFNPiDiG.js";import"./IconLock-Ba3v9Gai.js";import"./item-BdaRjUSz.js";import"./button-8VCYF9q8.js";import"./useButton-B7fJWq_D.js";import"./useRenderElement-BJltmq7R.js";import"./dropdown-menu-u7dJS_rg.js";import"./index-YE3hJ12-.js";import"./index-Doilf_uA.js";import"./composite-DwInnjN0.js";import"./useBaseUiId-LRyRTKBR.js";import"./useCompositeListItem-COjcsRtF.js";import"./useRole-Bz7UEW6p.js";import"./user-profile-CwnGhH7J.js";import"./avatar-codec-CK1eTEDe.js";import"./bioforest-bWrsnjtH.js";import"./web-Delo70pr.js";import"./amount-BQsqQYGO.js";import"./notification-BlvBEjKO.js";import"./index-CULjlCoN.js";import"./transaction-meta-DQ1SozSY.js";import"./IconDots-BBax1IIZ.js";import"./IconShieldCheck-COF95d4f.js";import"./IconApps-KjXpaT_U.js";import"./IconCoins-GBvD9mEX.js";import"./IconSparkles-Nm4IDPq3.js";import"./IconTrash-CFZxxA6M.js";import"./transaction-list-sW0jpnEh.js";import"./transaction-item-C7yR-2gy.js";import"./IconRefresh-C4_CpCCj.js";import"./swipeable-tabs-BRtLnFLw.js";import"./swiper-lfGq_F6Y.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
