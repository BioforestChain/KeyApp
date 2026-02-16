import{j as c}from"./iframe-BsFAjrMt.js";import{a as p}from"./token-item-BH--lU5K.js";import{G as l}from"./LoadingSpinner-DZYn303g.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DBulR8ld.js";import"./hologram-canvas-BvDhzuDP.js";import"./chain-icon-D2BW2vV_.js";import"./service-CB2tjGon.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CmJfj5ER.js";import"./address-display-DbgwgdFw.js";import"./web-DNNLxmRA.js";import"./createReactComponent-CZurZBpK.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-D3dR0QcB.js";import"./index-BnAl6yxc.js";import"./IconCheck-CEKgIBoF.js";import"./IconChevronDown-CCIreAa1.js";import"./IconSettings-CTXTJiNz.js";import"./wallet-selector-C6M94IDB.js";import"./wallet-mini-card-BzlfC4Kd.js";import"./token-icon-2J76hFgA.js";import"./amount-display-CYHQlU_v.js";import"./NumberFlow-client-48rw3j0J-CWNCptA8.js";import"./animated-number-CUUBFrV7.js";import"./time-display-BWbiCr7i.js";import"./service-status-alert-CSXNUjBM.js";import"./IconX-_rlxScxA.js";import"./IconAlertTriangle-BlEHDSVc.js";import"./IconLock-CEcWZw7g.js";import"./item-BMJQZxkK.js";import"./button-Bz_J7PEI.js";import"./useButton-CG4pul1p.js";import"./useRenderElement-DBk4QFW-.js";import"./dropdown-menu-BOqBq-Ck.js";import"./index-DJB-jHUq.js";import"./index-Dqc67vMq.js";import"./composite-Clz37zOm.js";import"./useBaseUiId-DBF-JzJn.js";import"./useCompositeListItem-BEl5qqdG.js";import"./useRole-GRII30Oz.js";import"./user-profile-BTo1KyAv.js";import"./avatar-codec-rAQex6rd.js";import"./bioforest-B1VZxBVY.js";import"./web-mJgfBfEt.js";import"./amount-BQsqQYGO.js";import"./notification-CDxSETBX.js";import"./index-DY3sBKIe.js";import"./transaction-meta-svUDpZmL.js";import"./IconDots-Cf1s2PWf.js";import"./IconShieldCheck-CTnNeMzH.js";import"./IconApps-a8JfnKus.js";import"./IconCoins-Dw3qc-Hh.js";import"./IconSparkles-BWYM1BGo.js";import"./IconTrash-DQ5yqfCj.js";import"./transaction-list-pqL0Dgpp.js";import"./transaction-item-Bu3FR-IW.js";import"./IconRefresh-BDRnsYF_.js";import"./swipeable-tabs-CwlVU25t.js";import"./swiper-SPa7eA1i.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
