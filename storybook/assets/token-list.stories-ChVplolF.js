import{j as c}from"./iframe-g0rpXZ9Y.js";import{a as p}from"./token-item-CamjXK5O.js";import{G as l}from"./LoadingSpinner-D8xS0Y0o.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DV_WrCRh.js";import"./hologram-canvas-DA6sPjX5.js";import"./chain-icon-Bia94fEV.js";import"./service-CjN9B6lB.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BW_ahP5Q.js";import"./address-display-DsxtVu1u.js";import"./web-K3U0S9Rv.js";import"./createReactComponent-Bmkp5vVl.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-0rhrOrOh.js";import"./index-CCfl6Jqn.js";import"./IconCheck-Cvf2zch2.js";import"./IconChevronDown-CILI2s5Z.js";import"./IconSettings-Cdbv9LOW.js";import"./wallet-selector-BmbcGLy6.js";import"./wallet-mini-card-CId2Vq2E.js";import"./token-icon-BCWl9bv-.js";import"./amount-display-B7NIqeqM.js";import"./NumberFlow-client-48rw3j0J-DgBOH_V-.js";import"./animated-number-CXK5YMHO.js";import"./time-display-w26p6MqJ.js";import"./service-status-alert-DcAGO7Jq.js";import"./IconX-CRrfzxHc.js";import"./IconAlertTriangle-xCut5WiD.js";import"./IconLock-UDjUoqdU.js";import"./button-Bco9b4WO.js";import"./useButton-DRn48q9y.js";import"./useRenderElement-e09WXz5G.js";import"./dropdown-menu-Kh4yUa_F.js";import"./index-BzKgXcGe.js";import"./index-DQUyz7Qv.js";import"./composite-CzCIL_wI.js";import"./useBaseUiId-ek9vsuqs.js";import"./useCompositeListItem-DAqX_z7C.js";import"./useRole-DWRXjQz7.js";import"./user-profile-Cjv7zCAL.js";import"./avatar-codec-BwNN8_04.js";import"./bioforest-D5DuyfCH.js";import"./web-BGhqLi5b.js";import"./amount-BQsqQYGO.js";import"./notification-e7DuFUiX.js";import"./index-BQ1776hN.js";import"./transaction-meta-BpzA-1Mq.js";import"./IconDots-5LFHHSmW.js";import"./IconShieldCheck-DXOPmP0p.js";import"./IconApps-C8Ki1YSC.js";import"./IconCoins-CfmuaC9B.js";import"./IconSparkles-CDEoJR33.js";import"./IconTrash-DIhOOUks.js";import"./transaction-list-DhFqv34o.js";import"./transaction-item-BbCpyvCB.js";import"./IconRefresh-Da8eRYA2.js";import"./swipeable-tabs-CdLUQrNA.js";import"./swiper-CZ-nMZxr.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
