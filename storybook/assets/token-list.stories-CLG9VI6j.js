import{j as c}from"./iframe-Bqszs9Pm.js";import{a as p}from"./token-item-DiDXuCap.js";import{G as l}from"./LoadingSpinner-DW-d5kwJ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DAdkjtpG.js";import"./hologram-canvas-CuQJtqGd.js";import"./chain-icon-DNfhR2ct.js";import"./service-BQu1iJAT.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CIwoU_W7.js";import"./address-display-BpNmk7qw.js";import"./web-Cs9jB92V.js";import"./createReactComponent-Cxm5LRz6.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BX5JB2uM.js";import"./index-BoWDcdrn.js";import"./IconCheck-BH6DV65U.js";import"./IconChevronDown-BkfePPdM.js";import"./IconSettings-GGyK-4Ax.js";import"./wallet-selector-DJm_uJ-h.js";import"./wallet-mini-card-Dxm6GE9f.js";import"./token-icon-CUbfeJVp.js";import"./amount-display-BPRk9mZK.js";import"./NumberFlow-client-48rw3j0J-pxzGyfJa.js";import"./animated-number-BAIpMuUb.js";import"./time-display-J309DKxD.js";import"./service-status-alert-ezC-4Fcl.js";import"./IconX-ibm23nbj.js";import"./IconAlertTriangle-a4KMfU_R.js";import"./IconLock-i8gdlZFT.js";import"./button-SjMx26aC.js";import"./useButton-Bdyo7Kan.js";import"./useRenderElement-CkcKM1SS.js";import"./dropdown-menu-cAvd_4kc.js";import"./index-CXZzaSbq.js";import"./index-B-XxbUSw.js";import"./composite-Bkicb_Qr.js";import"./useBaseUiId-BIMaM3nL.js";import"./useCompositeListItem-BYvkkeD8.js";import"./useRole-BIzYh9qx.js";import"./user-profile-BcB5dWyL.js";import"./avatar-codec-DfGvbQmc.js";import"./bioforest-Cg4RgBH-.js";import"./web-DgEcDx1Y.js";import"./amount-BQsqQYGO.js";import"./notification-bf_kkhbr.js";import"./index-cOQEqyrE.js";import"./transaction-meta-78IGSkl_.js";import"./IconDots-z_yHS8Hv.js";import"./IconShieldCheck-DVGSqfN7.js";import"./IconApps-D3-YH0FQ.js";import"./IconCoins-Cs5o6VxL.js";import"./IconSparkles-CDbWnIAG.js";import"./IconTrash-IabUg9YH.js";import"./transaction-list-BB9x5kcz.js";import"./transaction-item-DIujHBFP.js";import"./IconRefresh-D1kBh7b8.js";import"./swipeable-tabs-Cl_j1a3f.js";import"./swiper-DPKjt1-A.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Te=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Te as __namedExportsOrder,Ce as default};
