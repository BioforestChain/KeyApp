import{j as c}from"./iframe-QvUCCLT0.js";import{a as p}from"./token-item-BDWHhS4P.js";import{G as l}from"./gradient-button-BmRlH4O1.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-D3MjxUU-.js";import"./hologram-canvas-B5fVRd_S.js";import"./chain-icon-BnEw3ETB.js";import"./address-display-CVLyGDMe.js";import"./web-Bh-POjBD.js";import"./createReactComponent-CY3bNp0m.js";import"./breakpoint-BtpSOnE_.js";import"./schemas-jh0dXz-I.js";import"./useTranslation-x_MuhBEf.js";import"./index-LPGgJHkt.js";import"./IconCheck-4efTZSeY.js";import"./IconChevronDown-9SOULVce.js";import"./IconSettings-VtQw9QBR.js";import"./wallet-selector-j2T-hCSI.js";import"./wallet-mini-card-BV_wy--C.js";import"./token-icon-D-LlpTsz.js";import"./address-book-B7R-mI9o.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-CXdO_Qk6.js";import"./transaction-item-BOAu49Hn.js";import"./copyable-text-Da6ziQHu.js";import"./amount-display-Cy1dHTTe.js";import"./button-Dp0OQqVt.js";import"./index-B_jtOnfb.js";import"./useButton-BITmFop4.js";import"./useRenderElement-CUv1abh8.js";import"./IconX-DbaWOtXL.js";import"./animated-number-Biz0Z7fD.js";import"./time-display-DAv4PU_j.js";import"./IconDots-COYSDfnI.js";import"./IconShieldCheck-DYGP2Lrj.js";import"./IconTrash-DXt32S4P.js";import"./IconCoins-CJyuRvOP.js";import"./IconSparkles-DfBPwSBO.js";import"./web-CkKnivv-.js";import"./dropdown-menu-BCuQA1qw.js";import"./index-D9r0LBt6.js";import"./index-D-w_BhOg.js";import"./composite-Cij-woB3.js";import"./useBaseUiId-eA7D8elT.js";import"./useCompositeListItem-289rQ5CU.js";import"./useRole-efnTEpOx.js";import"./empty-state-C2jvfQSi.js";import"./skeleton-ClAsCZVh.js";import"./transaction-list-BKPkHmhL.js";import"./swipeable-tabs-ByFx0LGP.js";import"./swiper-0luwt_FN.js";import"./IconAlertTriangle-CwRfegV_.js";import"./index-uNGiozqi.js";const de={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ge=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ge as __namedExportsOrder,de as default};
