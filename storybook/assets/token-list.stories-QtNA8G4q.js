import{j as c}from"./iframe-mWBAGdu2.js";import{a as p}from"./token-item-DGVSCGT8.js";import{G as l}from"./LoadingSpinner-5yBM7ljk.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DnYtNczq.js";import"./hologram-canvas-889_hCIX.js";import"./chain-icon-2HeprLOs.js";import"./service-B4irENPO.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CJhU_MGF.js";import"./address-display-DKT0vOoz.js";import"./web-CZBBkCl8.js";import"./createReactComponent-B-6fW5hv.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CgcY4kD2.js";import"./index-CQqlk44_.js";import"./IconCheck-CuLK5Lso.js";import"./IconChevronDown-BiJECIYo.js";import"./IconSettings-rvaMsw2T.js";import"./wallet-selector-CjrH7Oof.js";import"./wallet-mini-card-DaMhy_eq.js";import"./token-icon-DeWE72I8.js";import"./amount-display-wQjnDxjL.js";import"./NumberFlow-client-48rw3j0J-CcYGONdn.js";import"./animated-number-q7Zuurvj.js";import"./time-display-C1uapCJl.js";import"./service-status-alert-6hcq_l5R.js";import"./IconX-BqC2qfgB.js";import"./IconAlertTriangle-CNSsSeij.js";import"./IconLock-BgRk-y-j.js";import"./item-C_V34aOe.js";import"./button-CWmjkcwj.js";import"./useButton-CzZE3PFl.js";import"./useRenderElement-sc-z0PWr.js";import"./dropdown-menu-DNSoO2V2.js";import"./index-VCB1YGXn.js";import"./index-CA7gD68F.js";import"./composite-BboVuw4R.js";import"./useBaseUiId-DQBrHUlS.js";import"./useCompositeListItem-DvR8hAqx.js";import"./useRole-DGvmnm99.js";import"./user-profile-8iPUTBHY.js";import"./avatar-codec-D48yzn7e.js";import"./bioforest-Cl7-L94f.js";import"./web-BjtGL4-O.js";import"./amount-BQsqQYGO.js";import"./notification-BbAH52jB.js";import"./index-Bn-Rhtqg.js";import"./transaction-meta-Cj9oQZ9L.js";import"./IconDots-KtAZEoMt.js";import"./IconShieldCheck-DlibSZX5.js";import"./IconApps-CYwRRxTF.js";import"./IconCoins-ec82T06A.js";import"./IconSparkles-Pvooc5dW.js";import"./IconTrash-BKP2FQQB.js";import"./transaction-list-DvVvUZ6t.js";import"./transaction-item-B7nDttdd.js";import"./IconRefresh-CuhR68Lg.js";import"./swipeable-tabs-BKXeHkfm.js";import"./swiper-DABNyrAf.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
