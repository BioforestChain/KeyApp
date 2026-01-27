import{j as c}from"./iframe-d96jbflr.js";import{a as p}from"./token-item-D4yZnGye.js";import{G as l}from"./LoadingSpinner-CrsGMqaG.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-C44XEB4C.js";import"./hologram-canvas-DwlTXWKB.js";import"./chain-icon-D5WTThFc.js";import"./service-C5fu61FZ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BBuk2SYe.js";import"./address-display-BADrBbmO.js";import"./web-DJqIBczy.js";import"./createReactComponent-B3jwCrnC.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-ClTwWhs-.js";import"./index-eCgcuFC8.js";import"./IconCheck-Ds77auM7.js";import"./IconChevronDown-CRfKVmsC.js";import"./IconSettings-C3i80Qi8.js";import"./wallet-selector-BQ3HNjcG.js";import"./wallet-mini-card-CV5hUdi_.js";import"./token-icon-BBXBmDl5.js";import"./amount-display-D9A5SBle.js";import"./NumberFlow-client-48rw3j0J-X3iwWp43.js";import"./animated-number-8YWLb5ba.js";import"./time-display-CTQSH6N-.js";import"./service-status-alert-xF0fQeYZ.js";import"./IconX-O2injE3U.js";import"./IconAlertTriangle-Bp0mtV91.js";import"./IconLock-CnepmPjz.js";import"./button-b-SychfI.js";import"./useButton-CNx3hbuy.js";import"./useRenderElement-mxdm8TbF.js";import"./dropdown-menu-BKwvCFID.js";import"./index-DIYULK-l.js";import"./index-DhasUZRi.js";import"./composite-BU2meLLD.js";import"./useBaseUiId-sV6rXYZ6.js";import"./useCompositeListItem-DpYOM5z4.js";import"./useRole-D968Hg-1.js";import"./user-profile-D9guGjlg.js";import"./avatar-codec-C4-7ZIsO.js";import"./bioforest-CBPxOKcQ.js";import"./web-BpRhnZxW.js";import"./amount-BQsqQYGO.js";import"./notification-DTrTLJtC.js";import"./index-BZA3ElqL.js";import"./transaction-meta-BvmKOUXt.js";import"./IconDots-DqWbw6HI.js";import"./IconShieldCheck-BWgskZej.js";import"./IconApps-Bo03Qv8L.js";import"./IconCoins-Dv9xO67b.js";import"./IconSparkles-CAbuPeJb.js";import"./IconTrash-CqLM2T41.js";import"./transaction-list-Bbsfvr8P.js";import"./transaction-item-DPoXLhRL.js";import"./IconRefresh-CiKvX8-4.js";import"./swipeable-tabs-zWlg0Bi9.js";import"./swiper-CyzHqR6f.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
