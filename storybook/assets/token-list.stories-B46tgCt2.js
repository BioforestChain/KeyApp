import{j as c}from"./iframe-Cdc63axx.js";import{T as p}from"./token-list-BFIzIT9A.js";import{G as l}from"./gradient-button-CZKG_OxC.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./token-item-B3WkOXGU.js";import"./wallet-card-D72Fjhtn.js";import"./hologram-canvas-BNbq140G.js";import"./chain-icon-D4xOCR_v.js";import"./address-display-Br4bPKCM.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-B1THGpvK.js";import"./index-CgApz5ds.js";import"./IconCheck-CSFX6uTb.js";import"./createReactComponent-Byz9u14m.js";import"./IconCopy-Bd89ourp.js";import"./IconChevronDown-47ONnUQ4.js";import"./IconSettings-CnHezete.js";import"./wallet-selector-DyhJjCoj.js";import"./wallet-mini-card-DxswMVgD.js";import"./token-icon-G8t5AcAW.js";import"./loading-spinner-BUGHRkCk.js";import"./empty-state-BekREkN0.js";import"./skeleton-B6q0SJ8M.js";import"./amount-display-CpkhKkD5.js";import"./NumberFlow-client-48rw3j0J-B9MIwagk.js";import"./animated-number-BzKftMU8.js";import"./time-display-Bqp2_Ej9.js";import"./qr-code-CN1BkjhE.js";import"./index-BumXyOSu.js";import"./icon-circle-BA3rQJgu.js";import"./error-boundary-Br_PTww5.js";import"./IconAlertCircle-CXTf0ayz.js";import"./IconAlertTriangle-CN6TnQbc.js";import"./IconCircleCheck-XqF-o2ls.js";import"./IconInfoCircle-i82YKtep.js";import"./button-CXgo3fuS.js";import"./index-B_jtOnfb.js";import"./useButton-DInLJQHG.js";import"./useRenderElement-DBEnl05C.js";import"./chain-config-CVvvJPxJ.js";import"./index-D0E7N0oa.js";import"./bioforest-ChHUthdw.js";import"./address-format-BmR8oJgW.js";import"./web-B0qc0cto.js";import"./amount-BQsqQYGO.js";import"./index-DBrPxRsx.js";import"./index-DPaogHfF.js";const ie={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
