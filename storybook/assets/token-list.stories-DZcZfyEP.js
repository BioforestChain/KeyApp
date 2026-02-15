import{j as c}from"./iframe-BNKLbH-6.js";import{a as p}from"./token-item-CdajEkZe.js";import{G as l}from"./LoadingSpinner-BQwUH96e.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-A3Q8NDWe.js";import"./hologram-canvas-ThySC_-t.js";import"./chain-icon-VM8gZZqe.js";import"./service-lAexD2Wr.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Bhla7qwo.js";import"./address-display-DIjZgmds.js";import"./web-CFPZ225R.js";import"./createReactComponent-DG20OVdZ.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CSaUSbgP.js";import"./index-guW4vevp.js";import"./IconCheck-CLY0g_YK.js";import"./IconChevronDown-DgHyTnxW.js";import"./IconSettings-Cit_1bLX.js";import"./wallet-selector-DVaLAFph.js";import"./wallet-mini-card-DoP9qBCM.js";import"./token-icon-BV221brf.js";import"./amount-display-DIEgwHwo.js";import"./NumberFlow-client-48rw3j0J-BQL7obtT.js";import"./animated-number-CNOJ2Ei6.js";import"./time-display-fkJVIh32.js";import"./service-status-alert-DJ4bmm-u.js";import"./IconX-djaTuIzY.js";import"./IconAlertTriangle-azT3g2YN.js";import"./IconLock-C2nj8D8t.js";import"./item-B4osolow.js";import"./button--jkzg4Ms.js";import"./useButton-B9ymlaE_.js";import"./useRenderElement-CgFrWgrs.js";import"./dropdown-menu-kWDQEjZf.js";import"./index-DGqLkL0S.js";import"./index-CXKzFli0.js";import"./composite-CE5gDuPh.js";import"./useBaseUiId-DDFK4Obv.js";import"./useCompositeListItem-BwM7D6Fo.js";import"./useRole-CrWRpyiP.js";import"./user-profile-CYLifDzv.js";import"./avatar-codec-DiG0EvfI.js";import"./bioforest-CqC6PKuZ.js";import"./web-DBTLGMsq.js";import"./amount-BQsqQYGO.js";import"./notification-BFlk1HQC.js";import"./index-Cg6T5SvN.js";import"./transaction-meta-3Wt6iNBe.js";import"./IconDots-DU29-IBp.js";import"./IconShieldCheck-U8ZQcmKa.js";import"./IconApps-DwqK8WaG.js";import"./IconCoins-Du4IdUFN.js";import"./IconSparkles-BrJcDPtd.js";import"./IconTrash-BgM7GiAr.js";import"./transaction-list-CKsTmQmr.js";import"./transaction-item-BE7PRz2H.js";import"./IconRefresh-Bn1QnjKO.js";import"./swipeable-tabs-C5yHHEAH.js";import"./swiper-C_mbgFvm.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
