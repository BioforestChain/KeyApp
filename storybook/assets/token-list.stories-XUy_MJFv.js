import{j as c}from"./iframe-CyYNzbJL.js";import{a as p}from"./token-item-BOvHotZf.js";import{G as l}from"./LoadingSpinner-DU1XDDLV.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BplLemu5.js";import"./hologram-canvas-D_3LHKN4.js";import"./chain-icon-Dd7z7LzY.js";import"./service-BqCsOJfx.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CuS4YWMX.js";import"./address-display-ChXM8Y2Y.js";import"./web-CSjpY_gv.js";import"./createReactComponent-CUuh3cdw.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BB9FXUKP.js";import"./index-BM9Q35K9.js";import"./IconCheck-Du9Dn1VL.js";import"./IconChevronDown-QK9NZQiH.js";import"./IconSettings-Aq9ODhTs.js";import"./wallet-selector-ChHc9T9A.js";import"./wallet-mini-card-D8NHehYj.js";import"./token-icon-CmS51FQR.js";import"./amount-display-C0HTHpwz.js";import"./NumberFlow-client-48rw3j0J-JthwvN_3.js";import"./animated-number-Bl9YlNyY.js";import"./time-display-Pyfc2YB1.js";import"./service-status-alert-CEiU1wAE.js";import"./IconX-B6veifLA.js";import"./IconAlertTriangle-L9r-v03n.js";import"./IconLock-B7_WR00i.js";import"./item-Br3_qjCR.js";import"./button-BFbLYQEm.js";import"./useButton-DPywT7vJ.js";import"./useRenderElement-CdGWhY6E.js";import"./dropdown-menu-BUkl7wPj.js";import"./index-X0Vu_Ke2.js";import"./index-Qkj-wqYm.js";import"./composite-B-SFJxzc.js";import"./useBaseUiId-BvBvFpFG.js";import"./useCompositeListItem-Cw6W8NOY.js";import"./useRole-KbfvC2Ej.js";import"./user-profile-Bbet2Vmt.js";import"./avatar-codec-Cm64YtLj.js";import"./bioforest-D-5s2Gc6.js";import"./web-DItVtpha.js";import"./amount-BQsqQYGO.js";import"./notification-D6r8klB-.js";import"./index-Ck5wsex-.js";import"./transaction-meta-BKgBcUu5.js";import"./IconDots-C5guX6IY.js";import"./IconShieldCheck-BOaR91FK.js";import"./IconApps-DoTeJTN5.js";import"./IconCoins-C3fUPPFq.js";import"./IconSparkles-BxaPu217.js";import"./IconTrash-BgrIrYRw.js";import"./transaction-list-BF7y18ar.js";import"./transaction-item-BVtKm5-_.js";import"./IconRefresh-Dw5F1TsA.js";import"./swipeable-tabs-DlnlBcRM.js";import"./swiper-CCnof3Ns.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
