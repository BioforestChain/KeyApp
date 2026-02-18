import{j as c}from"./iframe-BBL1Y9Q3.js";import{a as p}from"./token-item-Cq-cHKaj.js";import{G as l}from"./LoadingSpinner-3KCDQZQk.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-hb71s4hK.js";import"./hologram-canvas-DUfdRv2l.js";import"./chain-icon-wI9IT7EF.js";import"./service-DZCjdhqS.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-QsAvQL1e.js";import"./address-display-Qmklh1ew.js";import"./web-CCbp988c.js";import"./createReactComponent-CNTpCBNj.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-qL4usZoQ.js";import"./index-BRbw8C-D.js";import"./IconCheck-CtGimEMv.js";import"./IconChevronDown-Depqo8bT.js";import"./IconSettings-DQjWlA58.js";import"./wallet-selector-B5-Wfnvg.js";import"./wallet-mini-card-0Ko-UDDU.js";import"./token-icon-0S9jGhbB.js";import"./amount-display-CxFCnklA.js";import"./NumberFlow-client-48rw3j0J-DRsoOONR.js";import"./animated-number-BjSGJsmA.js";import"./time-display-DRYwpQYb.js";import"./service-status-alert-C0XlwbMl.js";import"./IconX-Bw0AKI1S.js";import"./IconAlertTriangle-B3ia6w8L.js";import"./IconLock-Dg5k2l32.js";import"./item-wBSOy5kL.js";import"./button-DbxpXwAg.js";import"./useButton-BmF7K8NF.js";import"./useRenderElement-BHzxvNBn.js";import"./dropdown-menu-VsOcgfmS.js";import"./index-C7O24_YE.js";import"./index-DgI4J9bq.js";import"./composite-dzh-Hwxj.js";import"./useBaseUiId-BiAtOpXr.js";import"./useCompositeListItem-CIB9jC7L.js";import"./useRole-CHkJmF7K.js";import"./user-profile-CfMBBVcP.js";import"./avatar-codec-AcMsrE7d.js";import"./bioforest-B-xvuozq.js";import"./web-Dr1GNtDG.js";import"./amount-BQsqQYGO.js";import"./notification-s2tFLArh.js";import"./index-C6i8678D.js";import"./transaction-meta-fEa_IM9I.js";import"./IconDots-DakJaLCG.js";import"./IconShieldCheck-D-B972vF.js";import"./IconApps-DEdHIh5a.js";import"./IconCoins-BW2ZkFFV.js";import"./IconSparkles-BagMj1D5.js";import"./IconTrash-B7nmah-A.js";import"./transaction-list-9q1kKtkH.js";import"./transaction-item-BchU5i17.js";import"./IconRefresh-Cn39jlU7.js";import"./swipeable-tabs-B6M_s-1H.js";import"./swiper-CMprYRyG.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
