import{j as c}from"./iframe-oLXwfKP8.js";import{a as p}from"./token-item-BCB2aMIW.js";import{G as l}from"./LoadingSpinner-DPq2tEHw.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CS3UPg9X.js";import"./hologram-canvas-VPh4TAyL.js";import"./chain-icon-DlaCF8fB.js";import"./service-CRuyv-Y6.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DpXoq79C.js";import"./address-display-CDXOtXS7.js";import"./web-BwWa4J-I.js";import"./createReactComponent-7iclG9mA.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-NaGGVpvJ.js";import"./index-BtsCOiQA.js";import"./IconCheck-BWQLVB-J.js";import"./IconChevronDown-B3avXGn4.js";import"./IconSettings-xUPCqyRL.js";import"./wallet-selector-GWZVKtxn.js";import"./wallet-mini-card-BE3KcERT.js";import"./token-icon-CPwmqvBK.js";import"./amount-display-B26OTdnY.js";import"./NumberFlow-client-48rw3j0J-BSBuDHP5.js";import"./animated-number-B_VeZzAd.js";import"./time-display-Ds8ZKjzk.js";import"./service-status-alert-C_Zoufm-.js";import"./IconX-DSghMemk.js";import"./IconAlertTriangle-y0TDTBDD.js";import"./IconLock-Cdm9_uMR.js";import"./button-DU0jN1vA.js";import"./useButton-DSRYwVtd.js";import"./useRenderElement-CyXPQ-mi.js";import"./dropdown-menu-2PlfXQQp.js";import"./index-DYxLppUK.js";import"./index-BJk4y0Bp.js";import"./composite-DkEAX0kC.js";import"./useBaseUiId-1y9Coi-V.js";import"./useCompositeListItem-DrHo3hd7.js";import"./useRole-DxnhZ0_8.js";import"./user-profile-0ZCzh7nM.js";import"./avatar-codec-B6Vn-qiv.js";import"./bioforest-Cku730UM.js";import"./web-AdyYT2J7.js";import"./amount-BQsqQYGO.js";import"./notification-DS6hhFD5.js";import"./index-G93eg8j7.js";import"./transaction-meta-Da5-WOMY.js";import"./IconDots-hIpehv7v.js";import"./IconShieldCheck-CcYD9U3F.js";import"./IconApps-Cvt6D5Fp.js";import"./IconCoins-OWoU6RvL.js";import"./IconSparkles-BvkI9HJA.js";import"./IconTrash-CCUaGVaA.js";import"./transaction-list-BKLf_PKA.js";import"./transaction-item-OCwyqNmU.js";import"./IconRefresh-tx2Q9M_Y.js";import"./swipeable-tabs-CpC4pwCy.js";import"./swiper-Bl9589Q-.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
