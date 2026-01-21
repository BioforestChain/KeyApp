import{j as c}from"./iframe-Dp2Ali2n.js";import{a as p}from"./token-item-DY8SF0ZK.js";import{G as l}from"./LoadingSpinner-eMDvfvYX.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-_SaARk4t.js";import"./hologram-canvas-4Mp9PxTf.js";import"./chain-icon-DhMbBswI.js";import"./index-DLitWbhY.js";import"./schemas-B18CumQY.js";import"./address-display-BqUGmvyI.js";import"./web-D1cHMkfF.js";import"./createReactComponent-Bvc6i3j5.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-BYYU4Ehv.js";import"./index-BwP4oI1_.js";import"./IconCheck-CuzQejSn.js";import"./IconChevronDown-Duq0YtfH.js";import"./IconSettings-D1uOKaOO.js";import"./wallet-selector-DHwtEvtI.js";import"./wallet-mini-card-DNiu1N24.js";import"./token-icon-m9Hy3XpH.js";import"./amount-display-B7v7ryFA.js";import"./NumberFlow-client-48rw3j0J-B9UhlFlb.js";import"./animated-number-Cu4fOHxm.js";import"./time-display-CxSfi9cM.js";import"./copyable-text-DyLBGNNb.js";import"./IconX-D_0sUCDD.js";import"./button-fDD5SNuy.js";import"./useButton-CupiKGSs.js";import"./useRenderElement-B3L952jm.js";import"./dropdown-menu-CYo36PiC.js";import"./index-xWSWC5n7.js";import"./index-CN4R9uGu.js";import"./composite-BCsZLEvF.js";import"./useBaseUiId-Dn-jWZMa.js";import"./useCompositeListItem-JSnW7NJe.js";import"./useRole-0UyTaAzE.js";import"./user-profile-Cm8tk7wk.js";import"./index-D0E7N0oa.js";import"./bioforest-Jv6nvRbL.js";import"./avatar-codec-BfuA4PgX.js";import"./web-DNtYQgRC.js";import"./amount-BQsqQYGO.js";import"./notification-BwZmGlco.js";import"./index-DpMoyOsT.js";import"./transaction-meta-1aK-BnJ2.js";import"./IconDots-hJufdCq_.js";import"./IconShieldCheck-u0XkfRs_.js";import"./IconApps-PUBiFjmV.js";import"./IconCoins-qBMxRksk.js";import"./IconSparkles-XIhK_Cl_.js";import"./IconLock-DaMXQBAm.js";import"./IconTrash-ueM4-kgu.js";import"./transaction-list-zxZa2Mik.js";import"./transaction-item-CpwArYuD.js";import"./IconRefresh-DCRGamP9.js";import"./swipeable-tabs-ChsQWgqF.js";import"./swiper-BGfEJWqG.js";import"./IconAlertTriangle-BbxB4FvF.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Ce=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Ce as __namedExportsOrder,ye as default};
