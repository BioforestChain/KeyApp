import{j as c}from"./iframe-CLYHcCRY.js";import{a as p}from"./token-item-DyOE7C1T.js";import{G as l}from"./gradient-button-eh87wLHg.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-lBwrkdsM.js";import"./hologram-canvas-C6Iy-dHW.js";import"./chain-icon-DENF18Nl.js";import"./address-display-BNCYVQQx.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Cb2TYd22.js";import"./index-BII8D0GK.js";import"./IconCheck-B40OcL4a.js";import"./createReactComponent-wBEFsRbv.js";import"./IconCopy-BuWPXw-E.js";import"./IconChevronDown-CFusJApW.js";import"./IconSettings-CfxxGCFZ.js";import"./wallet-selector-CzdfjQ8k.js";import"./wallet-mini-card-IFcPmFMU.js";import"./token-icon-Dr_c_NXn.js";import"./amount-BQsqQYGO.js";import"./index-wSp7Vo6A.js";import"./chain-config-CJhdu2xl.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-CC63LXFY.js";import"./loading-spinner-DqC7JCd8.js";import"./empty-state-DX03tGcj.js";import"./skeleton-CAwtnORC.js";import"./amount-display-BRiBavrB.js";import"./NumberFlow-client-48rw3j0J-CN8CXYSF.js";import"./animated-number-DcLSzJ4j.js";import"./time-display-CIVcGCI1.js";import"./qr-code-aEqhiK5l.js";import"./index-Brvk0KZk.js";import"./icon-circle-DgObHDui.js";import"./error-boundary-BC2jZZ2a.js";import"./IconAlertCircle-BRQls_oc.js";import"./IconAlertTriangle-DbB-nqyx.js";import"./IconCircleCheck-7EIB1DCh.js";import"./IconInfoCircle-Brhpw96t.js";import"./button-DwhlsmiW.js";import"./index-B_jtOnfb.js";import"./useButton-AYI6L8Mv.js";import"./useRenderElement-VYtBqXlq.js";import"./IconDots-CjJ7rcnq.js";import"./IconShieldCheck-C5gl-f6m.js";import"./IconTrash-EzjdQ8NL.js";import"./IconCoins-DDfrCBdn.js";import"./IconSparkles-enyC7vew.js";import"./web-CGxU7K0N.js";import"./transaction-list-CQpKx25j.js";import"./swipeable-tabs-C9eerlxJ.js";import"./swiper-CkOD4_3z.js";import"./index-Cih1Hrsb.js";const ge={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const be=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,be as __namedExportsOrder,ge as default};
