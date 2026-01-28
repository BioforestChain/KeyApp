import{j as c}from"./iframe-CPKUD8ii.js";import{a as p}from"./token-item-BgA0xZQF.js";import{G as l}from"./LoadingSpinner-d7E69kAs.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Nm6D7TWc.js";import"./hologram-canvas-CVn4fw2a.js";import"./chain-icon-DSicoABt.js";import"./service-CDs4yOOQ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BNhTNn7Q.js";import"./address-display-D-rCNbvG.js";import"./web-e4K0t7KX.js";import"./createReactComponent-DNU9avNE.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-Df3LzLvY.js";import"./index-CsQ6DdDF.js";import"./IconCheck-CNAOkGo-.js";import"./IconChevronDown-C4q08Mcz.js";import"./IconSettings-PK6OZUDq.js";import"./wallet-selector-4jRW-ruP.js";import"./wallet-mini-card-uj_zVst7.js";import"./token-icon-Bgdom9eu.js";import"./amount-display-Ch4n3PDM.js";import"./NumberFlow-client-48rw3j0J-CtSTC4y3.js";import"./animated-number-CKM-NaLf.js";import"./time-display-8Vmqwi24.js";import"./service-status-alert-VOZrSR5X.js";import"./IconX-CAN-ukMO.js";import"./IconAlertTriangle-G77VVn2e.js";import"./IconLock-B1k7KTqS.js";import"./button-iMwaAMbT.js";import"./useButton-Ciuzx4HI.js";import"./useRenderElement-DXvb-0n8.js";import"./dropdown-menu-CZZTpxk6.js";import"./index-Bhpa7Z-Y.js";import"./index-BSFt0oym.js";import"./composite-Bn5_0-B_.js";import"./useBaseUiId-DhPd-xwo.js";import"./useCompositeListItem-BTXu-JNT.js";import"./useRole-BS84hNym.js";import"./user-profile-CJw5GxO_.js";import"./avatar-codec-CgWQmV3f.js";import"./bioforest-BF-ijTsB.js";import"./web-95p2GJ8-.js";import"./amount-BQsqQYGO.js";import"./notification-BjmAn4uy.js";import"./index-DlevUHOu.js";import"./transaction-meta-Bcg4aVl9.js";import"./IconDots-DUxp3Ykp.js";import"./IconShieldCheck-gXlWQn4X.js";import"./IconApps-CO23RTeo.js";import"./IconCoins-DZGn6gFw.js";import"./IconSparkles-DHc12fnB.js";import"./IconTrash-DVEkxJgj.js";import"./transaction-list-BSIiN6fC.js";import"./transaction-item-CYH_eBVA.js";import"./IconRefresh-B3Q6b0gx.js";import"./swipeable-tabs-6y0Ew1Yb.js";import"./swiper-CEELFQUR.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
