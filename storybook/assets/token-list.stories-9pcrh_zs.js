import{j as c}from"./iframe-BTjVugVZ.js";import{a as p}from"./token-item-bFvOgTs4.js";import{G as l}from"./LoadingSpinner-XHaSIT4o.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-NC-yD1qz.js";import"./hologram-canvas-D8xRdId8.js";import"./chain-icon-hWB97-Mw.js";import"./service-DwLqsZ-b.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-8FwDMVuo.js";import"./address-display-DkRq1oBW.js";import"./web-Dw9KlDOd.js";import"./createReactComponent-CWFjM57r.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DavaNEIK.js";import"./index-CLH7eXVP.js";import"./IconCheck-B_BlVc78.js";import"./IconChevronDown-kguWTOrj.js";import"./IconSettings-BGXOxq4z.js";import"./wallet-selector-BNVcXgia.js";import"./wallet-mini-card-8bd7P5rV.js";import"./token-icon-BfuDRxbj.js";import"./amount-display-CjVKBEsJ.js";import"./NumberFlow-client-48rw3j0J-BtjcLgGi.js";import"./animated-number-Cw_7jSL4.js";import"./time-display-BN-EDNqx.js";import"./service-status-alert-BZIt9EmT.js";import"./IconX-B7KXSM4z.js";import"./IconAlertTriangle--X9SjLjt.js";import"./IconLock-B43-Su9v.js";import"./button-u8GeBPo-.js";import"./useButton-BcHWilYT.js";import"./useRenderElement-Bi-W2An_.js";import"./dropdown-menu-CkNe_c4D.js";import"./index-DppPExzW.js";import"./index-CnNwtusi.js";import"./composite-DF9ptQvJ.js";import"./useBaseUiId-B3wiPWNX.js";import"./useCompositeListItem-CpHCXumr.js";import"./useRole-DgXTb0cd.js";import"./user-profile-B9OWhnZ7.js";import"./avatar-codec--yMQ5Wpp.js";import"./bioforest-BWb3p-t_.js";import"./web-BFXSQuRG.js";import"./amount-BQsqQYGO.js";import"./notification-DaDR0VP4.js";import"./index-D0Wt1wGV.js";import"./transaction-meta-C5edzg3j.js";import"./IconDots-CBibz4cI.js";import"./IconShieldCheck-CiLxlSBw.js";import"./IconApps-DcFcha_u.js";import"./IconCoins-B9a5Xugt.js";import"./IconSparkles-Cb1zrh7H.js";import"./IconTrash-C9QpKJG-.js";import"./transaction-list-KvRlYtYP.js";import"./transaction-item-BfAXUC-J.js";import"./IconRefresh-CeD7flMp.js";import"./swipeable-tabs-MpRn7QH6.js";import"./swiper-CQury4PB.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
