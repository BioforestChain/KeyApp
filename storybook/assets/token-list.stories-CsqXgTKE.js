import{j as c}from"./iframe-CnCQVOpP.js";import{a as p}from"./token-item-p8HtXwOT.js";import{G as l}from"./index-CuTA__Ds.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-BVjUlEyK.js";import"./hologram-canvas-CQD04wwY.js";import"./chain-icon-DuxtU-gn.js";import"./address-display-B16XIfyV.js";import"./web-Bmffpo9t.js";import"./createReactComponent-DMt2BglU.js";import"./breakpoint-C1BNOfKS.js";import"./schemas-B18CumQY.js";import"./useTranslation-C6ajbKrk.js";import"./index-L9QLT5oL.js";import"./IconCheck-BzvylCVH.js";import"./IconChevronDown-B5XQ089e.js";import"./IconSettings-B7yb8Duf.js";import"./wallet-selector-CIzR-vsG.js";import"./wallet-mini-card-BbKRRfkB.js";import"./token-icon-CXWM30sS.js";import"./amount-display-LCJZASGr.js";import"./NumberFlow-client-48rw3j0J-HK_Q3nRN.js";import"./animated-number-CImjvOK-.js";import"./time-display-GUSalHiU.js";import"./copyable-text-C3qNeJzm.js";import"./IconX-BCy4QeDS.js";import"./button-BgYAK_3A.js";import"./useButton-G5ZReQd4.js";import"./useRenderElement-D677GkQS.js";import"./dropdown-menu-C3ZFZXtg.js";import"./index-CFWuutwf.js";import"./index-1myQHtS6.js";import"./composite-CRubFMlM.js";import"./useBaseUiId-BhjIio0M.js";import"./useCompositeListItem-BWySaN7I.js";import"./useRole-n9Wzwi5C.js";import"./user-profile-CDlMrbMx.js";import"./index-D0E7N0oa.js";import"./bioforest-D9p3ncSz.js";import"./avatar-codec-oZfUTenm.js";import"./web-CXQWeFXu.js";import"./amount-BQsqQYGO.js";import"./notification-M0WjgA0v.js";import"./index-BhuGlhuL.js";import"./transaction-meta-BKPteF0L.js";import"./IconDots-Dqar4tbZ.js";import"./IconShieldCheck-D_Rv2LAt.js";import"./IconApps-C4207Eu_.js";import"./IconCoins-CAbK08YW.js";import"./IconSparkles-Bw4iQhrz.js";import"./IconLock-DLKq2DaC.js";import"./IconTrash-SZz-rBZU.js";import"./transaction-list-CJzJiT2A.js";import"./transaction-item-CiT9i9I_.js";import"./IconRefresh-CYUEkh5Y.js";import"./swipeable-tabs-BEjGXDn5.js";import"./swiper-D9QMJ5BC.js";import"./IconAlertTriangle-fEeT4PM1.js";const be={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ye=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ye as __namedExportsOrder,be as default};
