import{j as c}from"./iframe-D60tT8n5.js";import{a as p}from"./token-item-CYSc3mo3.js";import{G as l}from"./LoadingSpinner-B1MST-Bq.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-3ZyIn2uE.js";import"./hologram-canvas-BwCGhOxH.js";import"./chain-icon-Bf2fDkbJ.js";import"./service-CAebP7jP.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-QbB4RuQ_.js";import"./address-display-BaSwFZXL.js";import"./web-Cxx7M_hu.js";import"./createReactComponent-CSeiZBWP.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-Cwzcid2v.js";import"./index-CPD7HH6A.js";import"./IconCheck-CHk2f65U.js";import"./IconChevronDown-Cj_XVBwS.js";import"./IconSettings-BfcHrRLy.js";import"./wallet-selector-D54g8O7F.js";import"./wallet-mini-card-ep02Qg1i.js";import"./token-icon-Bps-j_bf.js";import"./amount-display-BbDUA_mD.js";import"./NumberFlow-client-48rw3j0J-mHWvuqRS.js";import"./animated-number-9YCfGsHJ.js";import"./time-display-D9ExRyDQ.js";import"./service-status-alert-DOEpFO8b.js";import"./IconX-BDvbb92k.js";import"./IconAlertTriangle-CcAgafE0.js";import"./IconLock-TMI52nan.js";import"./item-DN7Kp23g.js";import"./button-BAXRuSGM.js";import"./useButton-dlfQV4Oq.js";import"./useRenderElement-GH_joVgn.js";import"./dropdown-menu-NfAIzv0p.js";import"./index-CFgA-mtD.js";import"./index-D93YHoQi.js";import"./composite-DhdbxwgG.js";import"./useBaseUiId-B-TKxx6o.js";import"./useCompositeListItem-z1pMXPB6.js";import"./useRole-CdSuuU8P.js";import"./user-profile-OTc03E0T.js";import"./avatar-codec-CLjD4n9H.js";import"./bioforest-iPcRDXM0.js";import"./web-Cgw32JDH.js";import"./amount-BQsqQYGO.js";import"./notification-CFO9ZhoL.js";import"./index-iQpFjs3r.js";import"./transaction-meta-D9VFrpuh.js";import"./IconDots-BE_lUEkt.js";import"./IconShieldCheck-Cuw33DAS.js";import"./IconApps-D7sjZbB8.js";import"./IconCoins-9A15HoBO.js";import"./IconSparkles-DSr6z9e_.js";import"./IconTrash-0L8wP4ZM.js";import"./transaction-list-Cv04FWSH.js";import"./transaction-item-BE0NhFy0.js";import"./IconRefresh-CxFsJtaI.js";import"./swipeable-tabs-CJZJgUAh.js";import"./swiper-CH4ZBJax.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
