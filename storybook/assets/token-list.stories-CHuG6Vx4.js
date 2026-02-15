import{j as c}from"./iframe-DZOLjtV7.js";import{a as p}from"./token-item-B-KjcE2g.js";import{G as l}from"./LoadingSpinner-D0NCOa1S.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DD3UaDpV.js";import"./hologram-canvas-CtyfQBV3.js";import"./chain-icon-CpIqzhT7.js";import"./service-j4i0aheN.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-G_1Sri-h.js";import"./address-display-CHNAN0Hy.js";import"./web-CKuC86AI.js";import"./createReactComponent-DS42xUKy.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-WQ2S7Fqt.js";import"./index-CKdQOotH.js";import"./IconCheck-Bkd19m3i.js";import"./IconChevronDown-glHB3lxd.js";import"./IconSettings-Bg-1J7pD.js";import"./wallet-selector-Bk_7T9On.js";import"./wallet-mini-card-BV4ag7_B.js";import"./token-icon-5onGglIv.js";import"./amount-display-B2wBnd3z.js";import"./NumberFlow-client-48rw3j0J-BFSBwUv_.js";import"./animated-number-7lBjA_5a.js";import"./time-display-UsImE0K0.js";import"./service-status-alert-D-80XOeD.js";import"./IconX-DdEF1ccS.js";import"./IconAlertTriangle-CgFQgqYb.js";import"./IconLock-BMcDxX_K.js";import"./item-Cd0Rek9F.js";import"./button-C4mIut_r.js";import"./useButton-CXLoMtPC.js";import"./useRenderElement-BMI0-nYz.js";import"./dropdown-menu-DUeldU6-.js";import"./index-foTg9qga.js";import"./index-B5SkT1pc.js";import"./composite-CqHZ38wC.js";import"./useBaseUiId-BvFwVaRZ.js";import"./useCompositeListItem-DUwHt6T5.js";import"./useRole-J7n0EweL.js";import"./user-profile-vHNJY5--.js";import"./avatar-codec-Bzi25is6.js";import"./bioforest-C_WOwaaB.js";import"./web-BgQuSdgm.js";import"./amount-BQsqQYGO.js";import"./notification-C4-0aOCn.js";import"./index-B9D1J69l.js";import"./transaction-meta-D79kZp1A.js";import"./IconDots-LaCW-GR0.js";import"./IconShieldCheck-Bk7iC8Jb.js";import"./IconApps-BfxHLI-j.js";import"./IconCoins-BOzv-Qza.js";import"./IconSparkles-DAE9P363.js";import"./IconTrash-B5kBVefG.js";import"./transaction-list-gqeQ7o8x.js";import"./transaction-item-4WpZKf3s.js";import"./IconRefresh-B2Fun_cG.js";import"./swipeable-tabs-rECFabw_.js";import"./swiper-BfG-bBVn.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
