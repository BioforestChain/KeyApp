import{j as c}from"./iframe-BtBfLKTD.js";import{a as p}from"./token-item-XxWjPWi1.js";import{G as l}from"./LoadingSpinner-DSXmk0nS.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-r2dUQyCC.js";import"./hologram-canvas-DUOA7J3b.js";import"./chain-icon-DAr2BuLY.js";import"./index-Dggwd96D.js";import"./schemas-B18CumQY.js";import"./address-display-BOzUKET5.js";import"./web-DSwQeJCf.js";import"./createReactComponent-D_MX2SzB.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-NbEfJFuK.js";import"./index-BmMlfY7b.js";import"./IconCheck-BTp0X1fd.js";import"./IconChevronDown-DGF-xdRN.js";import"./IconSettings-BnXqVs-K.js";import"./wallet-selector-CQJHkVha.js";import"./wallet-mini-card-VDbQMp4k.js";import"./token-icon-C3iaPTcR.js";import"./amount-display-Cot2TNqs.js";import"./NumberFlow-client-48rw3j0J-D5k-VzPL.js";import"./animated-number-GLYRgzkD.js";import"./time-display-Cl-v_6rV.js";import"./copyable-text-CjRqC9Ch.js";import"./IconX-htZAI7TQ.js";import"./button-BwVYriG6.js";import"./useButton-nYR3qDRL.js";import"./useRenderElement-BgCqABuI.js";import"./dropdown-menu-DVtwfu3T.js";import"./index-BZPwEHM_.js";import"./index-P0LMgqf_.js";import"./composite-Dunzz5J7.js";import"./useBaseUiId-BOQ4kkyn.js";import"./useCompositeListItem-DnwpODrl.js";import"./useRole-Dl5-FYlC.js";import"./user-profile-CcW-PXZ_.js";import"./index-D0E7N0oa.js";import"./bioforest-Bkf7ejq_.js";import"./avatar-codec-CLZgmii5.js";import"./web-B_U8kgZP.js";import"./amount-BQsqQYGO.js";import"./notification-DDyDnq6u.js";import"./index-Cr6fj8qe.js";import"./transaction-meta-_GmSo1fs.js";import"./IconDots-BiMTBOz0.js";import"./IconShieldCheck-BXsvoqZx.js";import"./IconApps-xPb7l1mF.js";import"./IconCoins-CeI8hgKj.js";import"./IconSparkles-lIj8JxoF.js";import"./IconLock-DVYVAx0o.js";import"./IconTrash-DsWSGJgX.js";import"./transaction-list-CNbi8T70.js";import"./transaction-item-CPPtPTCb.js";import"./IconRefresh-NKvhs6bI.js";import"./swipeable-tabs-Ca74i-MU.js";import"./swiper-DcuytQSW.js";import"./IconAlertTriangle-5din1WUm.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Ce=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Ce as __namedExportsOrder,ye as default};
