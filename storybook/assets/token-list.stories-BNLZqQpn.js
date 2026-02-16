import{j as c}from"./iframe-CftqfirD.js";import{a as p}from"./token-item-Cq2hRKDV.js";import{G as l}from"./LoadingSpinner-Bq28KgSz.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-c69-GkSf.js";import"./hologram-canvas-Clv_4Yht.js";import"./chain-icon-BQfjH_0X.js";import"./service-KgUWzkni.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DPAx9XgD.js";import"./address-display-BgapLKIe.js";import"./web-wwpL2rk7.js";import"./createReactComponent-R-j1hbng.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-KzIqTB0x.js";import"./index-C6g0glMg.js";import"./IconCheck-mxuA1vS9.js";import"./IconChevronDown-xIpp2Eqr.js";import"./IconSettings-BjMn3BoE.js";import"./wallet-selector-CJfUhFDN.js";import"./wallet-mini-card-KaVPZOJW.js";import"./token-icon-CFYqtz3O.js";import"./amount-display-C4OUfRzJ.js";import"./NumberFlow-client-48rw3j0J-Tv5tKF9z.js";import"./animated-number-DU57kvHX.js";import"./time-display-BRGEOCY5.js";import"./service-status-alert-CnQNaa1l.js";import"./IconX-DPCbG36b.js";import"./IconAlertTriangle-ChRW5xsp.js";import"./IconLock-BpSJADbV.js";import"./item-CBVDNg3y.js";import"./button-B71_VDW-.js";import"./useButton-C5qJXrLb.js";import"./useRenderElement-DosBXD0d.js";import"./dropdown-menu--UWAccU4.js";import"./index-Ct20z3_o.js";import"./index-De9NfVon.js";import"./composite-EYx6siFC.js";import"./useBaseUiId-BA1HKLNN.js";import"./useCompositeListItem-C5pmPn8u.js";import"./useRole-YMySrQmp.js";import"./user-profile-BIlXIHEr.js";import"./avatar-codec-D0SKUafG.js";import"./bioforest-CWtwpodr.js";import"./web-nf2F69oa.js";import"./amount-BQsqQYGO.js";import"./notification-BAmbi0o8.js";import"./index-CI8_tEVm.js";import"./transaction-meta-BW8HrRor.js";import"./IconDots-eKbUI7rS.js";import"./IconShieldCheck-BXia-oue.js";import"./IconApps-DRCxfwH6.js";import"./IconCoins-xoKXundR.js";import"./IconSparkles-aBxzbA3w.js";import"./IconTrash-B4-Ko5HD.js";import"./transaction-list-C1m1h0fJ.js";import"./transaction-item-C3lTZMBL.js";import"./IconRefresh-CvJ6Q2FB.js";import"./swipeable-tabs-CwQ7dsWu.js";import"./swiper-B2sX6sBu.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
