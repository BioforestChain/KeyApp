import{j as c}from"./iframe-xycdlyUs.js";import{a as p}from"./token-item-BtH6OWZR.js";import{G as l}from"./index-DiPTr9Fq.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-zKO4vygu.js";import"./hologram-canvas-CY2Y0ofK.js";import"./chain-icon-DhF8kkNy.js";import"./address-display-C1aD6C0Q.js";import"./web-B-AJvKTs.js";import"./createReactComponent-DptCLsGT.js";import"./breakpoint-CK5U7Mfi.js";import"./schemas-D5l0QB92.js";import"./useTranslation-D-G-6Zge.js";import"./index-DJYHlYNF.js";import"./IconCheck-BdCmg-hT.js";import"./IconChevronDown-DWMB9al-.js";import"./IconSettings-COfKJNmK.js";import"./wallet-selector-bVsNnL0v.js";import"./wallet-mini-card-qiiIWQDD.js";import"./token-icon-CxLvWMNi.js";import"./amount-display-D4dvbT3f.js";import"./NumberFlow-client-48rw3j0J-PmLTfB9S.js";import"./animated-number-BDo2lKaB.js";import"./time-display-B_SwHpBS.js";import"./copyable-text-BfUkynLD.js";import"./IconX-BoMSxf6O.js";import"./button-CcNvUFJu.js";import"./useButton--fJARj5v.js";import"./useRenderElement-Bn3vcKYy.js";import"./dropdown-menu-D8RnYA1Y.js";import"./index-Dv6E8P3X.js";import"./index-JxWxWX4V.js";import"./composite-Cay_yK2R.js";import"./useBaseUiId-BHeA7YHy.js";import"./useCompositeListItem-Dk98W97W.js";import"./useRole-D70WcPS0.js";import"./address-book-CRYKBJVg.js";import"./index-D0E7N0oa.js";import"./bioforest-D9p3ncSz.js";import"./address-format-CtvAo1Ai.js";import"./web-Bqsxt2ql.js";import"./amount-BQsqQYGO.js";import"./query-client-KS72rkQB.js";import"./index-DgiQpsSy.js";import"./transaction-meta-BTkk2hs_.js";import"./IconDots-Daxx1BJi.js";import"./IconShieldCheck-Dn0hbvvA.js";import"./IconApps-DuiFjxWQ.js";import"./IconCoins-zCY4ID04.js";import"./IconSparkles-Dn0rmW4U.js";import"./IconLock-Bv6uM0PY.js";import"./IconTrash-D1hTiqru.js";import"./transaction-list-Dis960Me.js";import"./transaction-item-BjA4A5D8.js";import"./IconRefresh-CfTZ06ld.js";import"./swipeable-tabs-BjOihQ9w.js";import"./swiper-CAQwC-V-.js";import"./IconAlertTriangle-CYSwaznA.js";const be={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ye=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ye as __namedExportsOrder,be as default};
