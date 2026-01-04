import{j as c}from"./iframe-BEYsz_Nt.js";import{T as p}from"./token-list-BqyoIw_e.js";import{G as l}from"./gradient-button-C-uFbkJH.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./token-item-C9tKi95o.js";import"./wallet-card-EMjq8ZeP.js";import"./hologram-canvas-DHxHprx7.js";import"./chain-icon-BzbIAD-o.js";import"./address-display-CY5GhdSv.js";import"./web-B9VECXrs.js";import"./breakpoint-CUnGgoIy.js";import"./schemas-Cl5zTOv_.js";import"./useTranslation-B3xWiyCw.js";import"./index-vFE_paAZ.js";import"./IconCheck-MuB5Cc54.js";import"./createReactComponent-BT0NPHve.js";import"./IconCopy-_Lea3FiA.js";import"./IconChevronDown-CDxde5ec.js";import"./IconSettings-CmnSRkrc.js";import"./wallet-selector-CG72Cunq.js";import"./wallet-mini-card-DsiUA6Jp.js";import"./token-icon-v6H6nGjO.js";import"./loading-spinner-qCYwQe_K.js";import"./empty-state-Bs7MkhC2.js";import"./skeleton-DRyW99Kl.js";import"./amount-display-DAmblLKu.js";import"./NumberFlow-client-48rw3j0J-BM3qjY4m.js";import"./animated-number-BmS7BpZt.js";import"./time-display-BDtvbEd7.js";import"./qr-code-DaqudJtg.js";import"./index-DYK0aWG_.js";import"./icon-circle-sOaFK1ED.js";import"./error-boundary-PiYeLgUx.js";import"./IconAlertCircle-Bieuwgiv.js";import"./IconAlertTriangle-DbNazWEC.js";import"./IconCircleCheck-CSPFvmBd.js";import"./IconInfoCircle-FXeAYAMR.js";import"./button-CQpB5DKZ.js";import"./index-B_jtOnfb.js";import"./useRenderElement-BBCNVxdJ.js";import"./chain-config-lKD-osoU.js";import"./index-D0E7N0oa.js";import"./bioforest-D6P49my8.js";import"./address-format-DoygnCi0.js";import"./web-BYmBbCUN.js";import"./amount-BQsqQYGO.js";import"./adapter-P1TowZKT.js";import"./index-CYW01yvF.js";const me={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ie=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ie as __namedExportsOrder,me as default};
