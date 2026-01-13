import{j as c}from"./iframe-CHpnNFF-.js";import{a as p}from"./token-item-BPygPByH.js";import{G as l}from"./index-CfBoVE1b.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-BK2FJuPy.js";import"./hologram-canvas-CDVJN9ZH.js";import"./chain-icon-BBgimTiY.js";import"./address-display-B-hUTRw6.js";import"./web-BxSWUboP.js";import"./createReactComponent-BBuOTQib.js";import"./breakpoint-BtpSOnE_.js";import"./schemas-jh0dXz-I.js";import"./useTranslation-Cn35rriq.js";import"./index-DWDuuOjN.js";import"./IconCheck-Cw9WdQrc.js";import"./IconChevronDown-DIFDulqw.js";import"./IconSettings-DD94lZwD.js";import"./wallet-selector-BXomQ79Q.js";import"./wallet-mini-card-CD1oWC8i.js";import"./token-icon-_bohwj3i.js";import"./address-book-DI0wc2JF.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-B2mNTGNA.js";import"./transaction-item-GvXR-Bs6.js";import"./amount-display-Dupymd1I.js";import"./NumberFlow-client-48rw3j0J-BeHAiNN2.js";import"./animated-number-BVlrSyMW.js";import"./time-display-qNg-b0Ae.js";import"./copyable-text-C2GCixg7.js";import"./button-DoYcZF2P.js";import"./useButton-B8jHMvD6.js";import"./useRenderElement-KLX3fYL1.js";import"./IconX-5q83HnUG.js";import"./IconDots-DI9HbMRX.js";import"./IconShieldCheck-C9IWrqIs.js";import"./IconTrash-DhVV1Rgj.js";import"./IconCoins-C1p1dgST.js";import"./IconSparkles-Du-ANovT.js";import"./web-DIbESPGX.js";import"./dropdown-menu-lMELI0LT.js";import"./index-B9zbaluw.js";import"./index-BDfqrh_T.js";import"./composite-CjHXT3tL.js";import"./useBaseUiId-BFgwffvm.js";import"./useCompositeListItem-KWU9NOGz.js";import"./useRole--996FJ2-.js";import"./transaction-list-B5snKF-E.js";import"./swipeable-tabs-BFN8NNFx.js";import"./swiper-DK5F_JhY.js";import"./IconAlertTriangle-DhfsXtjK.js";const ke={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ue=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ue as __namedExportsOrder,ke as default};
