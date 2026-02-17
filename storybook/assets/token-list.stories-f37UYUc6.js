import{j as c}from"./iframe-DtSykY7Y.js";import{a as p}from"./token-item-CO2Ghgfi.js";import{G as l}from"./LoadingSpinner-tMF0OJpJ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DGA55bJS.js";import"./hologram-canvas-BD-Nceoh.js";import"./chain-icon-B4w5N-wH.js";import"./service-n17MZ-NQ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DZMe6kEi.js";import"./address-display-DTRbbLFH.js";import"./web-B3WOpFWu.js";import"./createReactComponent-Birl1has.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-tL0uWGej.js";import"./index-D9iZfumr.js";import"./IconCheck-ClzEI4Br.js";import"./IconChevronDown-Bpv_5051.js";import"./IconSettings-BpMpokhK.js";import"./wallet-selector-DCBzbWYf.js";import"./wallet-mini-card-Bdzj5WHA.js";import"./token-icon-sSpGCLvq.js";import"./amount-display-BRIHGJbI.js";import"./NumberFlow-client-48rw3j0J-f8LMg_bL.js";import"./animated-number-BqQc6DTo.js";import"./time-display-Bn0shu7c.js";import"./service-status-alert-e250JVJn.js";import"./IconX-BPRU7tG3.js";import"./IconAlertTriangle-B8YPRsnc.js";import"./IconLock-BY8GXBfc.js";import"./item-BO2L6zR2.js";import"./button-BJzDb9_H.js";import"./useButton-1dpyzXop.js";import"./useRenderElement-CWBIieu3.js";import"./dropdown-menu-Mseml1HR.js";import"./index-D6He0Yzc.js";import"./index-DsdH4rFE.js";import"./composite-GkdfaYA8.js";import"./useBaseUiId-BvxxTFfM.js";import"./useCompositeListItem-C3LN2LAM.js";import"./useRole-CsFWYl-C.js";import"./user-profile-WbxahNPG.js";import"./avatar-codec-ClU7t3vR.js";import"./bioforest-Bi0ph6sX.js";import"./web-DQo_T2PS.js";import"./amount-BQsqQYGO.js";import"./notification-BZD8rPH9.js";import"./index-UPmwpVn4.js";import"./transaction-meta-CmuvsEe6.js";import"./IconDots-Rl3Byhsw.js";import"./IconShieldCheck-CcayFxKV.js";import"./IconApps-DLp9vKX7.js";import"./IconCoins-rSyTUQKS.js";import"./IconSparkles--OrZ2Zyz.js";import"./IconTrash-DxR85tDH.js";import"./transaction-list-DyCkTWPm.js";import"./transaction-item-Cy4pWLLq.js";import"./IconRefresh-CJr-DHas.js";import"./swipeable-tabs-DxyBbiKR.js";import"./swiper-Hq114Y6z.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
