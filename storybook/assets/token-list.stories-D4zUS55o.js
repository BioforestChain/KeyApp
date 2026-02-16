import{j as c}from"./iframe-CUCdvki0.js";import{a as p}from"./token-item-CV5bSLSd.js";import{G as l}from"./LoadingSpinner-BdMD_3Ra.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CAycbrS2.js";import"./hologram-canvas-mjQIZ0jz.js";import"./chain-icon-CaM73srl.js";import"./service-BnAX2v0l.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DIzvbm3-.js";import"./address-display-4qa6uhxO.js";import"./web-a4Xnl1Rv.js";import"./createReactComponent-Y3xQdtB8.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CCVYyjbP.js";import"./index-B6OH5EYA.js";import"./IconCheck-B2R5hViJ.js";import"./IconChevronDown-CZR9NtNi.js";import"./IconSettings-D1SHqPZz.js";import"./wallet-selector-DAlbGEde.js";import"./wallet-mini-card-CtcJBZPB.js";import"./token-icon-DheppgLf.js";import"./amount-display-DhpYX3ja.js";import"./NumberFlow-client-48rw3j0J-CjC7ut4J.js";import"./animated-number-yEv0qHFs.js";import"./time-display-DUZg60h9.js";import"./service-status-alert-T8PtLBoB.js";import"./IconX-BBJcBAW6.js";import"./IconAlertTriangle-Jd6PsTfW.js";import"./IconLock-D20QBcUS.js";import"./item-BW3pqvVj.js";import"./button-UqEutDWL.js";import"./useButton-PXvTb9sC.js";import"./useRenderElement-DFQDU41c.js";import"./dropdown-menu-BmslfiRw.js";import"./index-Be_e41jM.js";import"./index-CSpLEab0.js";import"./composite-DBaF9VxZ.js";import"./useBaseUiId-CWhSWEMk.js";import"./useCompositeListItem-DW_YKMiL.js";import"./useRole-DSFDDXjf.js";import"./user-profile-BOPvqFpp.js";import"./avatar-codec-BjrDqyND.js";import"./bioforest-BY5s5fqW.js";import"./web-EA_-2BEp.js";import"./amount-BQsqQYGO.js";import"./notification-CfhExbhw.js";import"./index-C8pzlvf0.js";import"./transaction-meta-DGBzX8GE.js";import"./IconDots-C1lboqKN.js";import"./IconShieldCheck-CBTw9Yc5.js";import"./IconApps-DjDjbI0D.js";import"./IconCoins-DF74Fb0H.js";import"./IconSparkles-BLg7RvRS.js";import"./IconTrash-QrUarLps.js";import"./transaction-list-b97MtNbC.js";import"./transaction-item-DVZ0UklI.js";import"./IconRefresh-Bho5NUDl.js";import"./swipeable-tabs-C-u5wdwq.js";import"./swiper-BUH4XnPL.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
