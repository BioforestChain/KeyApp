import{j as c}from"./iframe-BMrLP8cp.js";import{T as p}from"./token-list-XXb90htv.js";import{G as l}from"./gradient-button-BpAt7P9P.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./token-item-CByixd7O.js";import"./wallet-card-BxWH9Nkg.js";import"./hologram-canvas-CmgG6rs5.js";import"./chain-icon-Damg4N9D.js";import"./address-display-By__MDA2.js";import"./web-B9VECXrs.js";import"./breakpoint-CUnGgoIy.js";import"./schemas-Cl5zTOv_.js";import"./useTranslation-z5I97Fu9.js";import"./index-DAM9MvhS.js";import"./IconCheck-DHxbXaSg.js";import"./createReactComponent-cD9o9rb1.js";import"./IconCopy-BCx5ubra.js";import"./IconChevronDown-Cj2ELcVc.js";import"./IconSettings-BGVwRIMj.js";import"./wallet-selector-B2f1r3I8.js";import"./wallet-mini-card-BgG88OD2.js";import"./token-icon-CpgG_ITU.js";import"./loading-spinner-DD_Y_E9V.js";import"./empty-state-DEa5zoKe.js";import"./skeleton-C6v9XNpR.js";import"./amount-display-BXalVtzw.js";import"./NumberFlow-client-48rw3j0J-DR6oELfc.js";import"./animated-number-BzNTqeiX.js";import"./time-display-DigAGEMj.js";import"./qr-code-DFjfxBW4.js";import"./index-jzU-ZFWu.js";import"./icon-circle-CPVKAOWs.js";import"./error-boundary-eZ65v0Q0.js";import"./IconAlertCircle-CXB_77OK.js";import"./IconAlertTriangle-D542Gz07.js";import"./IconCircleCheck-DNIxjxnz.js";import"./IconInfoCircle-DtyyRuRP.js";import"./button-C-X0C96B.js";import"./index-B_jtOnfb.js";import"./useRenderElement-DpudR0zo.js";import"./chain-config-CuJ3PB36.js";import"./index-D0E7N0oa.js";import"./bioforest-D6P49my8.js";import"./address-format-DoygnCi0.js";import"./web-C0q31tyC.js";import"./amount-BQsqQYGO.js";import"./adapter-P1TowZKT.js";import"./index-DIn-ONe7.js";const me={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
