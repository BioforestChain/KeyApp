import{j as c}from"./iframe-BuDZgClS.js";import{a as p}from"./token-item-DCEvg7LN.js";import{G as l}from"./LoadingSpinner-DcGSo1AE.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-C22u57rG.js";import"./hologram-canvas-C0-eii0p.js";import"./chain-icon-BykvBTsd.js";import"./service-Djioy5S5.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CmDALZW3.js";import"./address-display-BD-jr4tD.js";import"./web-DI_ANFt8.js";import"./createReactComponent-CCT_KxSw.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CwjW3P5e.js";import"./index-0yvu-sz8.js";import"./IconCheck-BYf6dG4O.js";import"./IconChevronDown-Bt0QuwbO.js";import"./IconSettings-CBdLs3xQ.js";import"./wallet-selector-CJbJ-VaA.js";import"./wallet-mini-card-BfjJOnO2.js";import"./token-icon-0495b7l_.js";import"./amount-display-BxEvaYce.js";import"./NumberFlow-client-48rw3j0J-2MHyCwTo.js";import"./animated-number-DQI5-4sM.js";import"./time-display-D-azlSU1.js";import"./service-status-alert-Bqlmowzc.js";import"./IconX-viUyieuq.js";import"./IconAlertTriangle-CEil6iNr.js";import"./IconLock-DEii1Rb4.js";import"./button-CqZpCM-a.js";import"./useButton-BPP4vCD8.js";import"./useRenderElement-CnI4ETw1.js";import"./dropdown-menu-B3iazgPt.js";import"./index-D3GrSwlj.js";import"./index-B84DK1ok.js";import"./composite-AfDCDaTj.js";import"./useBaseUiId-D4izhuAu.js";import"./useCompositeListItem-oaM7o2V0.js";import"./useRole-BzRTWzpe.js";import"./user-profile-6LXEY8Dx.js";import"./avatar-codec-DtksUyoH.js";import"./bioforest-ph7UYvV6.js";import"./web-Db2nSYeA.js";import"./amount-BQsqQYGO.js";import"./notification-CbZ9EUQJ.js";import"./index-DpRcvKR4.js";import"./transaction-meta-nITteHVt.js";import"./IconDots-7lZEiWC1.js";import"./IconShieldCheck-5alHW1iU.js";import"./IconApps-2q64GzC2.js";import"./IconCoins-CTYCb9vx.js";import"./IconSparkles-BMrxQJKM.js";import"./IconTrash-28kkW-YI.js";import"./transaction-list-QnAML79n.js";import"./transaction-item-Ch55xkmo.js";import"./IconRefresh-Kse1x6Q5.js";import"./swipeable-tabs-C3UlY03T.js";import"./swiper-B25CBp2D.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
