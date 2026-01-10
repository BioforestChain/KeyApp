import{j as c}from"./iframe-Bk0viqBp.js";import{a as p}from"./token-item-CKkyweNU.js";import{G as l}from"./gradient-button-BDalvSX9.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-CbYA4Px5.js";import"./hologram-canvas-D5AbPsGx.js";import"./chain-icon-wUOcUlmp.js";import"./address-display-DJGFnm14.js";import"./web-BMkjmpIH.js";import"./createReactComponent-C9mJNZiy.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-CoW4CkER.js";import"./index-DM-GfxwZ.js";import"./IconCheck-CrUy9GjL.js";import"./IconChevronDown-DlFCj5uk.js";import"./IconSettings-L1267A3o.js";import"./wallet-selector-BE1MUtVV.js";import"./wallet-mini-card-CfaXGYot.js";import"./token-icon-CmArnqbl.js";import"./chain-config-Bptyz2k8.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-COJllVWR.js";import"./transaction-item-0o2L5uzt.js";import"./loading-spinner-D0CEeRhc.js";import"./empty-state-Dsy7ZYP2.js";import"./skeleton-CXlyLlda.js";import"./amount-display-V9AEqpmS.js";import"./animated-number-bNOCpp1N.js";import"./time-display-CN_IEGIt.js";import"./qr-code-RN2J8s1q.js";import"./index-D_iEzEYG.js";import"./icon-circle-DArqUMMG.js";import"./copyable-text-CLMON-zk.js";import"./IconAlertCircle-C54_XH_v.js";import"./IconAlertTriangle-DCQ3OleV.js";import"./IconCircleCheck-DdtO2jJk.js";import"./IconInfoCircle-BRUAA2fP.js";import"./button-DjZvxSXP.js";import"./index-B_jtOnfb.js";import"./useButton-BFTCjRQ4.js";import"./useRenderElement-DPzNcg5V.js";import"./IconX-CTs2zPcS.js";import"./IconDots-CCNxzkIs.js";import"./IconShieldCheck-C2izJXrB.js";import"./IconTrash-CoCgKjfO.js";import"./IconCoins-COOaCFBq.js";import"./IconSparkles-D3mtvJia.js";import"./web-aUVl4_7b.js";import"./dropdown-menu-BXiv-_0k.js";import"./index-2N54b85B.js";import"./index-YVUoKl76.js";import"./composite-C2b1qNxn.js";import"./useBaseUiId-DgXeBEfO.js";import"./useCompositeListItem---CTqx-O.js";import"./useRole-BUlVrQCx.js";import"./transaction-list-ByIwrq1G.js";import"./swipeable-tabs-Dvvlc-iv.js";import"./swiper-r57_VYut.js";import"./index-Be19sUVd.js";const Se={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},m={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},s={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [mockTokens[0]!],
    onTokenClick: token => alert(\`Clicked \${token.symbol}\`)
  }
}`,...m.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const Be=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,n as Empty,r as Loading,s as ManyTokens,m as SingleToken,t as WithChange,Be as __namedExportsOrder,Se as default};
