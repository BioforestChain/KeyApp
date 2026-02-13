import{j as c}from"./iframe-DiTbX0IW.js";import{a as p}from"./token-item-CbniCsUG.js";import{G as l}from"./LoadingSpinner-D1DjlpnU.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-C4EhqI9I.js";import"./hologram-canvas-f8CDXftB.js";import"./chain-icon-BU3VWqRh.js";import"./service-oKJQN9S1.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Dp6bZnX-.js";import"./address-display-CfH8l4mh.js";import"./web-DCQ-jzzt.js";import"./createReactComponent-CsAWfYOO.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CrBtWVkI.js";import"./index-PxwM-cQl.js";import"./IconCheck-D-zvsvG2.js";import"./IconChevronDown-CqVIs3Wg.js";import"./IconSettings-DjPtxsfk.js";import"./wallet-selector-rf9Csv-a.js";import"./wallet-mini-card-BGsYdviW.js";import"./token-icon-o2Evsbq3.js";import"./amount-display-DkxTPL1-.js";import"./NumberFlow-client-48rw3j0J-MEBnEMM-.js";import"./animated-number-D9k-rG-f.js";import"./time-display-OmewVAKh.js";import"./service-status-alert-BdEDVk2W.js";import"./IconX-DQkGJ2tu.js";import"./IconAlertTriangle-BYJYLH3z.js";import"./IconLock-DsnzZlgd.js";import"./item-CwnP2lCa.js";import"./button-V_jX1OLq.js";import"./useButton-CWLqZqk7.js";import"./useRenderElement-DsnB5a2h.js";import"./dropdown-menu-CO91eWEY.js";import"./index-DqbLvQvd.js";import"./index-C5BCuv5I.js";import"./composite-CN7r9zdQ.js";import"./useBaseUiId-B7b9C06f.js";import"./useCompositeListItem-BWP5pVQr.js";import"./useRole-DWw1Hdoz.js";import"./user-profile-CqRd3yoO.js";import"./avatar-codec-Bmh89c4V.js";import"./bioforest-Cs6KeS9H.js";import"./web-sXXS6i6g.js";import"./amount-BQsqQYGO.js";import"./notification-B8LVYZJ_.js";import"./index-r2WO9SAj.js";import"./transaction-meta-B-LZaI6I.js";import"./IconDots-BmUExUuL.js";import"./IconShieldCheck-BaPXHr9s.js";import"./IconApps-WauHuIt5.js";import"./IconCoins-ZoQfzEKQ.js";import"./IconSparkles-BqtErlHu.js";import"./IconTrash-CgWHyU0G.js";import"./transaction-list-CFcwlOg_.js";import"./transaction-item-Ma_XfZYP.js";import"./IconRefresh-kuRFeFzV.js";import"./swipeable-tabs-Chl40aRu.js";import"./swiper-DT0qO8ux.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
