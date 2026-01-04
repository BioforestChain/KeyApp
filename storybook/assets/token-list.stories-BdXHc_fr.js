import{j as c}from"./iframe-CsJjcyMS.js";import{T as p}from"./token-list-n3WmU-1N.js";import{G as l}from"./gradient-button-Cr9gj5A0.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./token-item-DZb4dS9A.js";import"./wallet-card-BPACoZn0.js";import"./hologram-canvas-3YXbNT2T.js";import"./chain-icon-OBzYgEFI.js";import"./address-display-E2gqOghN.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-mJk0QBrw.js";import"./index-DvB0ldGR.js";import"./IconCheck-BAqEtIBE.js";import"./createReactComponent-B1QyCjEx.js";import"./IconCopy-BZGAnz7k.js";import"./IconChevronDown-CGR4Zf1C.js";import"./IconSettings-DVSYlqbJ.js";import"./wallet-selector-DsR8OlLL.js";import"./wallet-mini-card-C7P4tQJ0.js";import"./token-icon-Oiy3V6_W.js";import"./loading-spinner-CiE8EWGd.js";import"./empty-state-C7A6Xum2.js";import"./skeleton-C5mYgbO7.js";import"./amount-display-BNpDjbgj.js";import"./NumberFlow-client-48rw3j0J-DDwDcx7d.js";import"./animated-number-B-jhjge7.js";import"./time-display-WuoNq9js.js";import"./qr-code-ItPtgHGs.js";import"./index-BynTUo9w.js";import"./icon-circle-Kf6vmUFi.js";import"./error-boundary-SV90xZ-q.js";import"./IconAlertCircle-DpwpgU_P.js";import"./IconAlertTriangle--Q9kcyxa.js";import"./IconCircleCheck-Y4JfdjWY.js";import"./IconInfoCircle-VqkvE4Ce.js";import"./button-C4-BaJb3.js";import"./index-B_jtOnfb.js";import"./useButton-BY83BFUt.js";import"./useRenderElement-Bk4WznJS.js";import"./chain-config-BvUmVsz0.js";import"./index-D0E7N0oa.js";import"./bioforest-D6P49my8.js";import"./address-format-DoygnCi0.js";import"./web-DSDdl93j.js";import"./amount-BQsqQYGO.js";import"./transaction-service-T7lpNq4r.js";import"./index-B-at9vAG.js";const ie={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ce=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ce as __namedExportsOrder,ie as default};
