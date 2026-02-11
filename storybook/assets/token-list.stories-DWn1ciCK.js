import{j as c}from"./iframe-D6qYwrCP.js";import{a as p}from"./token-item-DN7LGCi1.js";import{G as l}from"./LoadingSpinner-Y0PqSdWH.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CMDK2EBl.js";import"./hologram-canvas-Cqc80lCI.js";import"./chain-icon-C-rub0Ih.js";import"./service-YxSMDz5U.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CJtNHOz6.js";import"./address-display-CFdtzkhV.js";import"./web-GhfsSFFO.js";import"./createReactComponent-3sZwvKLg.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CYT98Nx5.js";import"./index-Dm7aXZv1.js";import"./IconCheck-DP1QF9D3.js";import"./IconChevronDown-C3aLLwPE.js";import"./IconSettings-Bn13-0y9.js";import"./wallet-selector-CxiS4jOZ.js";import"./wallet-mini-card-ChNXX2Jg.js";import"./token-icon-BoSh5wGQ.js";import"./amount-display-D7meyTV1.js";import"./NumberFlow-client-48rw3j0J-CvkKtRZw.js";import"./animated-number-DGL9osT8.js";import"./time-display-Nd3ai-9_.js";import"./service-status-alert-DA7KbldF.js";import"./IconX-C6H_6-Ly.js";import"./IconAlertTriangle-CYWtmTlS.js";import"./IconLock-BoTuay4m.js";import"./item-DQIn8jZo.js";import"./button-DeN3KJiF.js";import"./useButton-Cs4hutME.js";import"./useRenderElement-DlrUMPN8.js";import"./dropdown-menu-DVlSm9ja.js";import"./index-BC8eoa1E.js";import"./index-BjOSRywT.js";import"./composite-Bdpx7Ja4.js";import"./useBaseUiId-Dg3qCavG.js";import"./useCompositeListItem-CEXUXOIx.js";import"./useRole-SCTvkEb9.js";import"./user-profile-Mo45z9Zj.js";import"./avatar-codec-B2Mhfd2-.js";import"./bioforest-DMnFS6f2.js";import"./web-DinkjV6e.js";import"./amount-BQsqQYGO.js";import"./notification-Ca_nY2Av.js";import"./index-DuabsC52.js";import"./transaction-meta-CUBvXQIq.js";import"./IconDots-D-eWr3a9.js";import"./IconShieldCheck-DLBUTiS1.js";import"./IconApps-UXCxbd7w.js";import"./IconCoins-DRxLkjW2.js";import"./IconSparkles-C2l7wci_.js";import"./IconTrash-DPDRzKYq.js";import"./transaction-list-Blnx1rMc.js";import"./transaction-item-C-51d2qE.js";import"./IconRefresh-BX5XtAT4.js";import"./swipeable-tabs-CMM_kXGC.js";import"./swiper-DxquzkXX.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
