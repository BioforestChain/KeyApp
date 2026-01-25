import{j as c}from"./iframe-4u1c0eWP.js";import{a as p}from"./token-item-D-XEfW8G.js";import{G as l}from"./LoadingSpinner-C4dvWb4n.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CbGNJHkX.js";import"./hologram-canvas-DZ65AEcs.js";import"./chain-icon-B0prenz4.js";import"./index-Bz3rr-KD.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DkdlvTXc.js";import"./address-display-rqi8fWZB.js";import"./web-CLmvds4h.js";import"./createReactComponent-DOJzQYGw.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation--XymrLlU.js";import"./index-B4Ntgh4S.js";import"./IconCheck-fxNepR-M.js";import"./IconChevronDown-DF-iPKRv.js";import"./IconSettings-53CfcYCH.js";import"./wallet-selector-yNv8r9XR.js";import"./wallet-mini-card-BlQNb0j_.js";import"./token-icon-BidATNun.js";import"./amount-display-D04QfpYl.js";import"./NumberFlow-client-48rw3j0J-qgCSzCS7.js";import"./animated-number-Dz0HMnZh.js";import"./time-display-uqrkoDY-.js";import"./service-status-alert-4HH5RmIB.js";import"./IconX-cy_BWbbT.js";import"./IconAlertTriangle-BTl2AUlr.js";import"./IconLock-j9w343zo.js";import"./button-CZ3lTRXT.js";import"./useButton-SEMLQbyi.js";import"./useRenderElement-Gz_mh9Hi.js";import"./dropdown-menu-CYlvUl6F.js";import"./index-CGRftBym.js";import"./index-BwtRhZQX.js";import"./composite-VeBIPCnP.js";import"./useBaseUiId-jlV75P_j.js";import"./useCompositeListItem-DyHhsTmK.js";import"./useRole-BP8u-JUT.js";import"./user-profile-btOiW6rG.js";import"./avatar-codec-DC_TggNI.js";import"./bioforest-CLFq0L3A.js";import"./web-Dt_-X2np.js";import"./amount-BQsqQYGO.js";import"./notification-OBANLd3t.js";import"./index-C-HTtQ6a.js";import"./transaction-meta-CcEswsms.js";import"./IconDots-Ds0dDa5K.js";import"./IconShieldCheck-WlEJzris.js";import"./IconApps-ETs30NKE.js";import"./IconCoins-CdKL1xvH.js";import"./IconSparkles-CBDoPOgr.js";import"./IconTrash-8wy_vwAA.js";import"./transaction-list-Cb6ok_yr.js";import"./transaction-item-BJIo7-JB.js";import"./IconRefresh-DARtpHjD.js";import"./swipeable-tabs-BNjj0WXl.js";import"./swiper-CmAUhqlw.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
