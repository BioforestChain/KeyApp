import{j as c}from"./iframe-BUkuBLc8.js";import{a as p}from"./token-item-ClQrQNzx.js";import{G as l}from"./LoadingSpinner-BgdMsQuG.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CYnUe-tR.js";import"./hologram-canvas-gZClIWDf.js";import"./chain-icon-CWcgffKi.js";import"./service-Cc2mnP6i.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DqpAbR1y.js";import"./address-display-B_F5H1ka.js";import"./web-BBV4lwAl.js";import"./createReactComponent-Dw1Y0MQa.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CTIURYhP.js";import"./index-D6S4sHJj.js";import"./IconCheck-CqGNsIuY.js";import"./IconChevronDown-BP8hOXmW.js";import"./IconSettings-UvPAI3lg.js";import"./wallet-selector-CWncXV30.js";import"./wallet-mini-card-D9gesLV8.js";import"./token-icon-C1BsXd9f.js";import"./amount-display-DI9R1mF4.js";import"./NumberFlow-client-48rw3j0J-DX8hateX.js";import"./animated-number-b-2-URQk.js";import"./time-display-DqsY2nmM.js";import"./service-status-alert-BpIcjm2X.js";import"./IconX-CxdkTgbZ.js";import"./IconAlertTriangle-DSqfg_Zc.js";import"./IconLock-CcHMnMtU.js";import"./item-BJCJhzGJ.js";import"./button-CI4CZVvr.js";import"./useButton-wMw66dT-.js";import"./useRenderElement-CS_Ote0x.js";import"./dropdown-menu-DVbp9JGt.js";import"./index-Dw1OaQtZ.js";import"./index-Crdf8mEC.js";import"./composite-DZof_6Ee.js";import"./useBaseUiId-Br6AHEum.js";import"./useCompositeListItem-Bw_LoVn2.js";import"./useRole-BOvjdKoM.js";import"./user-profile-DnOw8m80.js";import"./avatar-codec-MxhwPPOD.js";import"./bioforest-BsdpQNmv.js";import"./web-CiAHZe46.js";import"./amount-BQsqQYGO.js";import"./notification-DV7ol2FS.js";import"./index-iS0BeXAR.js";import"./transaction-meta-CqMUazEA.js";import"./IconDots-CZqpofUW.js";import"./IconShieldCheck-DOjZQqkS.js";import"./IconApps-Cse4dmTc.js";import"./IconCoins-BwoGkok8.js";import"./IconSparkles-DOv04vHs.js";import"./IconTrash-Cbn749Sn.js";import"./transaction-list-B8f75CMr.js";import"./transaction-item-CcJ1YF8c.js";import"./IconRefresh-DlKZG2ku.js";import"./swipeable-tabs-2jgs3_2u.js";import"./swiper-D34ZAukq.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const fe=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,n as Empty,r as Loading,m as ManyTokens,s as SingleToken,t as WithChange,fe as __namedExportsOrder,Te as default};
