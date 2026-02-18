import{j as c}from"./iframe-BpDWdeYo.js";import{a as p}from"./token-item-D1trZ3vB.js";import{G as l}from"./LoadingSpinner-C9FyLoGg.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DePXyctr.js";import"./hologram-canvas-DTinVO-g.js";import"./chain-icon-CSqt4TKT.js";import"./service-ClaDHpKh.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-B2AQyKjz.js";import"./address-display-eV6nJOIt.js";import"./web-Bzxja3VH.js";import"./createReactComponent-CTzRdXU5.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-_tBHPFow.js";import"./index-746G9wrD.js";import"./IconCheck-BHlGV3u2.js";import"./IconChevronDown-bLlblPo8.js";import"./IconSettings-C3K1cfK_.js";import"./wallet-selector-CIBBuzMZ.js";import"./wallet-mini-card-_1speDCI.js";import"./token-icon-JDu2YzNt.js";import"./amount-display-D9OQ78YF.js";import"./NumberFlow-client-48rw3j0J-DKr1HO1_.js";import"./animated-number-D4N1pt_9.js";import"./time-display-CQq4EGzo.js";import"./service-status-alert-CMDgrFyH.js";import"./IconX-B9d2j8J6.js";import"./IconAlertTriangle-2V9b3ygJ.js";import"./IconLock-BXVOEFIn.js";import"./item-9c7fzWbf.js";import"./button-rWrKvQiL.js";import"./useButton-DMMe6EYe.js";import"./useRenderElement-IEsLCaOd.js";import"./dropdown-menu-BgT8kp2s.js";import"./index-BCKtl6zJ.js";import"./index-BCvt4_Ie.js";import"./composite-VLsVwh0o.js";import"./useBaseUiId-B-Nwjyq0.js";import"./useCompositeListItem-Bcwv75DK.js";import"./useRole-CGvSY83d.js";import"./user-profile-BkhL0V4Z.js";import"./avatar-codec-Dq1LG53F.js";import"./bioforest-BSrLTI5l.js";import"./web-Cg6L7J2L.js";import"./amount-BQsqQYGO.js";import"./notification-W6FDMsB8.js";import"./index-CpA0Y5o_.js";import"./transaction-meta-nUjzoweH.js";import"./IconDots-BnRx0sfW.js";import"./IconShieldCheck-yKfByTnC.js";import"./IconApps-CwGN9KOE.js";import"./IconCoins-CK9bvoST.js";import"./IconSparkles-DKXIN_qI.js";import"./IconTrash-BhUkTzAs.js";import"./transaction-list-XoyZJ70e.js";import"./transaction-item-DsPMIM8y.js";import"./IconRefresh-DJ8iOAy0.js";import"./swipeable-tabs-CNFYpcRp.js";import"./swiper-B5Jhe2ty.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
