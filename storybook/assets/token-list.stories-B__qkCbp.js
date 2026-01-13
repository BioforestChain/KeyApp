import{j as c}from"./iframe-DVFyc1Xs.js";import{a as p}from"./token-item-T3Mn4JwF.js";import{G as l}from"./index-CBzETV1A.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-De4kZj2t.js";import"./hologram-canvas-DW0vqChp.js";import"./chain-icon-Csl-PRF6.js";import"./address-display-BNoQoJuB.js";import"./web-DPj2RDqN.js";import"./createReactComponent-BBBX6Kky.js";import"./breakpoint-BtpSOnE_.js";import"./schemas-jh0dXz-I.js";import"./useTranslation-CY2fQRTf.js";import"./index-Cj1TshCZ.js";import"./IconCheck-BQBYePQt.js";import"./IconChevronDown-DCMErmrL.js";import"./IconSettings-DAYeejZD.js";import"./wallet-selector-BwJNHk2W.js";import"./wallet-mini-card-BEOMcN3H.js";import"./token-icon-CVpw0txN.js";import"./address-book-BJd9BBs7.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-BVRwS0b-.js";import"./transaction-item-CUKqk9TH.js";import"./amount-display-BlwJTbN5.js";import"./NumberFlow-client-48rw3j0J-vXOuyeUt.js";import"./animated-number-CjXyCj6L.js";import"./time-display-Bu7QyM3W.js";import"./copyable-text-Bj5-4deP.js";import"./button-BVqUVWiK.js";import"./useButton-OygTN6we.js";import"./useRenderElement-oizxM6Nc.js";import"./IconX-DgBGLwmP.js";import"./IconDots-wZUbpKKK.js";import"./IconShieldCheck-D_aeZy7Y.js";import"./IconTrash-BzH37DYO.js";import"./IconCoins-BF-Gzl89.js";import"./IconSparkles-dH2TJ1ef.js";import"./web-DlhKi6NU.js";import"./dropdown-menu-BEjbgcEs.js";import"./index-B6qSRzSJ.js";import"./index-D_YgfWQD.js";import"./composite-CHDm9_vl.js";import"./useBaseUiId-D5_sKw_P.js";import"./useCompositeListItem-nxf2yStx.js";import"./useRole-D7TYRFH3.js";import"./transaction-list-BXrnZxOR.js";import"./swipeable-tabs-n0TE2ieo.js";import"./swiper-DUTqPm7z.js";import"./IconAlertTriangle-hc13g3MQ.js";const ke={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
