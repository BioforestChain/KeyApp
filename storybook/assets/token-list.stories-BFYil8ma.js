import{j as c}from"./iframe-Cbnwk2tm.js";import{a as p}from"./token-item-Ckwqdjaw.js";import{G as l}from"./LoadingSpinner-B6msqE3E.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BsIwv6Ga.js";import"./hologram-canvas-wsmJhh-Z.js";import"./chain-icon-C-JdnuqG.js";import"./service-DrQFSbwd.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-_faS8FpG.js";import"./address-display-DaymGsaY.js";import"./web-ViucSx7j.js";import"./createReactComponent-twPddvdz.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-FkKTO-Qo.js";import"./index-CSVYnQSj.js";import"./IconCheck-WXMNjFTg.js";import"./IconChevronDown-Bq-sjWux.js";import"./IconSettings-DuxuBXNt.js";import"./wallet-selector-Bvt9JilO.js";import"./wallet-mini-card-CscBHigO.js";import"./token-icon-D9bpjuTq.js";import"./amount-display-DzFoyipt.js";import"./NumberFlow-client-48rw3j0J-BXrIYALF.js";import"./animated-number-B0_xBULY.js";import"./time-display-BLd9rMoZ.js";import"./service-status-alert-BYX0jeVi.js";import"./IconX-C3bYldSy.js";import"./IconAlertTriangle-DklA-0bo.js";import"./IconLock-k0xbgjgC.js";import"./item-D8YKCIyh.js";import"./button-DXWy6T57.js";import"./useButton-CTWHTqq8.js";import"./useRenderElement-30W17YcB.js";import"./dropdown-menu-Bog5hmyu.js";import"./index-CmXmuHdz.js";import"./index-Brenr6ie.js";import"./composite-mh7dQPr5.js";import"./useBaseUiId-CeBrkOxy.js";import"./useCompositeListItem-BeX6lNcs.js";import"./useRole-DJ9AAm0X.js";import"./user-profile-DNBg8ib2.js";import"./avatar-codec-CIMVGxXa.js";import"./bioforest-DftRD5aN.js";import"./web-o2iLSlSt.js";import"./amount-BQsqQYGO.js";import"./notification-DfqHJ_lH.js";import"./index-CEHQw5na.js";import"./transaction-meta-WQ5IArVo.js";import"./IconDots-Cme_GZD_.js";import"./IconShieldCheck-BvCX_5aD.js";import"./IconApps-CdiN0Wnz.js";import"./IconCoins-bvuOOUTN.js";import"./IconSparkles-vqxbPrEq.js";import"./IconTrash-BG_Aovei.js";import"./transaction-list-DPrizo69.js";import"./transaction-item-wwZLuE_G.js";import"./IconRefresh-BkK1pn_P.js";import"./swipeable-tabs-DHpBwVpq.js";import"./swiper-COs-LzIO.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
