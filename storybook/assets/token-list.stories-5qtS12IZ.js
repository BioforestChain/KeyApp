import{j as c}from"./iframe-gbNh2oU9.js";import{a as p}from"./token-item-DncYVCYA.js";import{G as l}from"./gradient-button-BsdZUNaw.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-DTJhRvdo.js";import"./hologram-canvas-DT_opiuK.js";import"./chain-icon-ZCRm7Pf2.js";import"./address-display-DE4JWsOF.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-DU4EZ3E2.js";import"./index-D-ebAOZc.js";import"./IconCheck-BZ3UdLDx.js";import"./createReactComponent-DPbUS0aZ.js";import"./IconCopy-nttcS5ze.js";import"./IconChevronDown-BRvulvbR.js";import"./IconSettings-BL1PP2MF.js";import"./wallet-selector--R6Dvc_-.js";import"./wallet-mini-card-BKKfid2O.js";import"./token-icon-CypbDYis.js";import"./amount-BQsqQYGO.js";import"./index-RHee9S_0.js";import"./chain-config-BdHI0jWn.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-8rYKdp2s.js";import"./loading-spinner-CVYi0rNm.js";import"./empty-state-CJzqNsx2.js";import"./skeleton-CD7L9sol.js";import"./amount-display-DUDOeQh6.js";import"./NumberFlow-client-48rw3j0J-DPQHMKKt.js";import"./animated-number-BOthvpde.js";import"./time-display-dWOns_OE.js";import"./qr-code-CTfSFCZl.js";import"./index-BMczBEBu.js";import"./icon-circle-DLAeWw1V.js";import"./error-boundary-riyBp1AR.js";import"./IconAlertCircle-BO3pg4_B.js";import"./IconAlertTriangle-BRdKUJiK.js";import"./IconCircleCheck-BXzC4UAG.js";import"./IconInfoCircle-CuXremqu.js";import"./button-Cgr5_wpt.js";import"./index-B_jtOnfb.js";import"./useButton-cpDSFqsI.js";import"./useRenderElement-D9d7Hr2e.js";import"./IconDots-C6CFK1B4.js";import"./IconShieldCheck-Dz9bLqcq.js";import"./IconTrash-C4Bwj-LE.js";import"./IconCoins-pHHnCKU7.js";import"./IconSparkles-C-1IfK2l.js";import"./web-C442G2V3.js";import"./transaction-list-R7HrtW4w.js";import"./swipeable-tabs-DMMDWHul.js";import"./swiper-CRsfGNq1.js";import"./index-UN1nGomL.js";const ge={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
