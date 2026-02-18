import{j as c}from"./iframe-CMEr1D9F.js";import{a as p}from"./token-item-CmYlZ0h2.js";import{G as l}from"./LoadingSpinner-DmvydZYr.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Dz885dFf.js";import"./hologram-canvas-33EdBLMd.js";import"./chain-icon-ClauCW6L.js";import"./service-B-ab_L8y.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BDX7fMzo.js";import"./address-display-WodRoZQ6.js";import"./web-BhUj_G-K.js";import"./createReactComponent-DKpurfk4.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-mmorjM9A.js";import"./index-D82DQpnE.js";import"./IconCheck-CrsGAW3r.js";import"./IconChevronDown-4Kau22py.js";import"./IconSettings-B4xtNgJx.js";import"./wallet-selector-C50j-8qo.js";import"./wallet-mini-card-5g0XPLei.js";import"./token-icon-Bg8iCfOG.js";import"./amount-display-BYC9-4Lx.js";import"./NumberFlow-client-48rw3j0J-BF-hRNhT.js";import"./animated-number-CVjEGv_O.js";import"./time-display-BhM65JU0.js";import"./service-status-alert-HjYdyBaF.js";import"./IconX-Dn4fuc_s.js";import"./IconAlertTriangle-BI584rco.js";import"./IconLock-CfJT35WV.js";import"./item-B_ULJBft.js";import"./button-CmRHa7No.js";import"./useButton-0bZyOuwZ.js";import"./useRenderElement-4_Vh7gky.js";import"./dropdown-menu-RQOjgEWa.js";import"./index-BDWCGhjn.js";import"./index-DSTEvdOk.js";import"./composite-BDfMX0yO.js";import"./useBaseUiId-B19TAvnn.js";import"./useCompositeListItem-DC0Ort-4.js";import"./useRole-ClkkDUPg.js";import"./user-profile-C4TBgngU.js";import"./avatar-codec-DZIi1Xxo.js";import"./bioforest-UbwPI8C6.js";import"./web-CtaT17_5.js";import"./amount-BQsqQYGO.js";import"./notification-21LmV9sX.js";import"./index-pSVVxMD6.js";import"./transaction-meta-BtI4hb64.js";import"./IconDots-Dp1-PTrr.js";import"./IconShieldCheck-LsgXfoRi.js";import"./IconApps-Coe8Szmq.js";import"./IconCoins-BLIednjY.js";import"./IconSparkles-CRphQpdH.js";import"./IconTrash-CRhHqJGO.js";import"./transaction-list-CTteXveO.js";import"./transaction-item-CB6n1VJo.js";import"./IconRefresh-DRfVklX3.js";import"./swipeable-tabs-BVHIZa4y.js";import"./swiper-xuf4XbPT.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
