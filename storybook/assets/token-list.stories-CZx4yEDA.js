import{j as c}from"./iframe-C3baw6xp.js";import{a as p}from"./token-item-wmsGEAlC.js";import{G as l}from"./LoadingSpinner-dZvOYKlC.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CiZPLwuz.js";import"./hologram-canvas-Bw1Ol1SI.js";import"./chain-icon-Dl6ArTGx.js";import"./service-96tVcaV3.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DdAT4zQP.js";import"./address-display-D7DVuWyy.js";import"./web-C75PfdA7.js";import"./createReactComponent-ByEbVxwh.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DcMPBTGM.js";import"./index-B239EKpK.js";import"./IconCheck-Cn6U7s7e.js";import"./IconChevronDown-CQuTXha4.js";import"./IconSettings-CoWiaOTL.js";import"./wallet-selector-CTwI7v2A.js";import"./wallet-mini-card-CuRnaIP1.js";import"./token-icon-gRBxIxMk.js";import"./amount-display-VUUBHb65.js";import"./NumberFlow-client-48rw3j0J-mywMzaJS.js";import"./animated-number-BFaUBMXG.js";import"./time-display-DhYOOfLF.js";import"./service-status-alert-ehBvNzP1.js";import"./IconX-qT2UUSnO.js";import"./IconAlertTriangle-9nvZbYQN.js";import"./IconLock-DiiPCjf0.js";import"./item-BETjXN24.js";import"./button-B1qN-Q1j.js";import"./useButton-CJC88G2j.js";import"./useRenderElement-BVd8YRpF.js";import"./dropdown-menu-1k_Isvd-.js";import"./index-Dfd8cgxk.js";import"./index-DpLsJUMi.js";import"./composite-DcUaFs-n.js";import"./useBaseUiId-3HX44K-V.js";import"./useCompositeListItem-DZh_XYrV.js";import"./useRole-CZWrrmkZ.js";import"./user-profile-BiNBSLsm.js";import"./avatar-codec-DM5te3XS.js";import"./bioforest-B2Nq6mQS.js";import"./web-BcWsrUGX.js";import"./amount-BQsqQYGO.js";import"./notification-Dflx26or.js";import"./index-DFVq34fo.js";import"./transaction-meta-xHHRMM58.js";import"./IconDots-BjdFKJ4V.js";import"./IconShieldCheck-DIyTMQby.js";import"./IconApps-DDqww2Th.js";import"./IconCoins-O4Jb1Cb6.js";import"./IconSparkles-eeEZxDph.js";import"./IconTrash-CPNOXQ98.js";import"./transaction-list-C32pVhM-.js";import"./transaction-item-C_FqwTZC.js";import"./IconRefresh-DrTpJxub.js";import"./swipeable-tabs-p-VRPH0w.js";import"./swiper-C3RaKflI.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
