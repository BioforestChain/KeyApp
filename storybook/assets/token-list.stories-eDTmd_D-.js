import{j as c}from"./iframe-CZMiMZiE.js";import{a as p}from"./token-item-p6xZ3V4g.js";import{G as l}from"./LoadingSpinner-DUrKTfc8.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DCnygN64.js";import"./hologram-canvas-fvo43Af2.js";import"./chain-icon-Bf8UXBZW.js";import"./service-6F0IG-s5.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C-DalbTs.js";import"./address-display-qBhBDtpE.js";import"./web-D9rtq29H.js";import"./createReactComponent-CyIjciDW.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BwuSwSVz.js";import"./index-B6TgdZdy.js";import"./IconCheck-3Syih3Ic.js";import"./IconChevronDown-D4O1MglX.js";import"./IconSettings-DSNWjpqQ.js";import"./wallet-selector-CQMgZ7wg.js";import"./wallet-mini-card-D4go6CqH.js";import"./token-icon-BB-Prir6.js";import"./amount-display-D6owbtVp.js";import"./NumberFlow-client-48rw3j0J-3UIGK3kG.js";import"./animated-number-j3NSDcmO.js";import"./time-display-D3XuwYv9.js";import"./service-status-alert-BU13oAgA.js";import"./IconX-DWblOP-V.js";import"./IconAlertTriangle-CI8JUzFK.js";import"./IconLock-EgqpgmWq.js";import"./item-rFQeB-3l.js";import"./button-ZNem7ZML.js";import"./useButton-Bs5pFYaJ.js";import"./useRenderElement-CWk4FBd6.js";import"./dropdown-menu-BSSMQ-Q0.js";import"./index-JlVE35Ii.js";import"./index-CgwzxVO0.js";import"./composite-BZgi2rCH.js";import"./useBaseUiId-uk9T1i62.js";import"./useCompositeListItem-C_x9IxYW.js";import"./useRole-CaJxRIO9.js";import"./user-profile-B9iJoOAy.js";import"./avatar-codec-C95YI68Z.js";import"./bioforest-XspvCCHk.js";import"./web-CDham-e_.js";import"./amount-BQsqQYGO.js";import"./notification-CPt16D6I.js";import"./index-vh2rS2hg.js";import"./transaction-meta-C4qlEifG.js";import"./IconDots-BSjNxE4d.js";import"./IconShieldCheck-BI_DCqJz.js";import"./IconApps-B8DyS1Af.js";import"./IconCoins-BwglFfxf.js";import"./IconSparkles-BNKpRKCi.js";import"./IconTrash-CxWvXDf-.js";import"./transaction-list-CKcmj3Ud.js";import"./transaction-item-CMI99WM4.js";import"./IconRefresh-Ber8RQ4o.js";import"./swipeable-tabs-t_3v1Q9G.js";import"./swiper-CsVdf28Y.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
