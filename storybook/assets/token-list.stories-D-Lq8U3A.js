import{j as c}from"./iframe-Cr_UN5ps.js";import{a as p}from"./token-item-DPTVarzi.js";import{G as l}from"./LoadingSpinner-Bg-nmjWN.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BxRgTR8g.js";import"./hologram-canvas-BrYNj9js.js";import"./chain-icon-bybjceh8.js";import"./index-COveLHHP.js";import"./schemas-B18CumQY.js";import"./address-display-DFFgORXI.js";import"./web-CdGo0L2S.js";import"./createReactComponent-T6tanagy.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-CFi8Ka59.js";import"./index-DvRiJqI5.js";import"./IconCheck-BodlbRuj.js";import"./IconChevronDown-DzbKoMMG.js";import"./IconSettings-FYjecSAc.js";import"./wallet-selector-h1SVsgLX.js";import"./wallet-mini-card-Bqtdi-tM.js";import"./token-icon-BOypsSRN.js";import"./amount-display-CVIZ-Vn1.js";import"./NumberFlow-client-48rw3j0J-B2RFCmqP.js";import"./animated-number-C7X6FabG.js";import"./time-display-B_hmFhF5.js";import"./copyable-text-Bt1wgbt8.js";import"./IconX-WApUtH-t.js";import"./button-D1tYjhCW.js";import"./useButton-Dc5zf6xL.js";import"./useRenderElement-By_XGQex.js";import"./dropdown-menu-BT5F3FNi.js";import"./index-BBEtTe70.js";import"./index-DDORebJ9.js";import"./composite-CTaKJwcM.js";import"./useBaseUiId-BmJE0KUT.js";import"./useCompositeListItem-DOAAyMA3.js";import"./useRole-D7YSr6_6.js";import"./user-profile-BBxMf48y.js";import"./index-D0E7N0oa.js";import"./bioforest-cU8m0mjs.js";import"./avatar-codec-BFrRl5jW.js";import"./web-BPP2v312.js";import"./amount-BQsqQYGO.js";import"./notification-ClBTXteW.js";import"./index-C0kkUY8Z.js";import"./transaction-meta-DzLUsi5C.js";import"./IconDots-CCbtRLTE.js";import"./IconShieldCheck-Cm4HAVFT.js";import"./IconApps-9d_8kao3.js";import"./IconCoins-ZmT7zYkT.js";import"./IconSparkles-H0hZ4IOC.js";import"./IconLock-CmKRURTf.js";import"./IconTrash-DpmdX-vp.js";import"./transaction-list-B0gTKvHF.js";import"./transaction-item-pL-qryVn.js";import"./IconRefresh-BOPmnqC1.js";import"./swipeable-tabs-CxgsOwg2.js";import"./swiper-DUMS8xXX.js";import"./IconAlertTriangle-BuxqM4wn.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
