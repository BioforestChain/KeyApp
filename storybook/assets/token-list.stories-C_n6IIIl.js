import{j as c}from"./iframe-b-sVmduO.js";import{a as p}from"./token-item-BhqcUJgl.js";import{G as l}from"./LoadingSpinner-DqYVILdX.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B3Dq7-TG.js";import"./hologram-canvas-CkFDIeCK.js";import"./chain-icon-ZhsGuijk.js";import"./service-Cq_hJ_zD.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-kZVyXZJ6.js";import"./address-display-BVlNKOlk.js";import"./web-jtU6abry.js";import"./createReactComponent-CiK24Q5d.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-C1Xpk5kb.js";import"./index-CZzLdyTW.js";import"./IconCheck-BTBfiJTq.js";import"./IconChevronDown-ZXbJd3ob.js";import"./IconSettings-CH7VptFn.js";import"./wallet-selector-2G9nFifL.js";import"./wallet-mini-card-a1ypwLqJ.js";import"./token-icon-B2nefU2e.js";import"./amount-display-DlFIpFXJ.js";import"./NumberFlow-client-48rw3j0J-B4LfgjmF.js";import"./animated-number-Dcoh_7WY.js";import"./time-display-GrKAnBbz.js";import"./service-status-alert-CSVqeh2A.js";import"./IconX-AFxIOvWu.js";import"./IconAlertTriangle-BWuP6ZFU.js";import"./IconLock-DithyVlA.js";import"./button-CzVagMcs.js";import"./useButton-WqFoX9V1.js";import"./useRenderElement-UW8U3z2X.js";import"./dropdown-menu-lRzdC4Ew.js";import"./index-IWRTwXZq.js";import"./index-C3YlQXdH.js";import"./composite-Cf7yktJG.js";import"./useBaseUiId-CDepGl4N.js";import"./useCompositeListItem-CQ_PUYpR.js";import"./useRole-Ctuve6Y6.js";import"./user-profile-Plun0Xm4.js";import"./avatar-codec-d1cDoMQ2.js";import"./bioforest-kco3YumZ.js";import"./web-DrfNyoYo.js";import"./amount-BQsqQYGO.js";import"./notification-ChdHoW85.js";import"./index-1ArJ4a9u.js";import"./transaction-meta-Bcx0o4gO.js";import"./IconDots-3iKaFwoM.js";import"./IconShieldCheck-BEaCBy5S.js";import"./IconApps-CbQbNb7X.js";import"./IconCoins-FIBeoGHJ.js";import"./IconSparkles-DRe3hx-A.js";import"./IconTrash-CiXT4WRB.js";import"./transaction-list-D_O9BxZF.js";import"./transaction-item-d4xqphmr.js";import"./IconRefresh-CTxhP5fX.js";import"./swipeable-tabs-Bk65t96q.js";import"./swiper-DMTdtjNc.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
