import{j as c}from"./iframe-CeVYlVA3.js";import{a as p}from"./token-item-a1cCWFWq.js";import{G as l}from"./LoadingSpinner-CKkaK1KB.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BbQ2HWWz.js";import"./hologram-canvas-BSlKykEI.js";import"./chain-icon-Dh9Lk6Gk.js";import"./service-BB0bGeUZ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-NrQKuRUP.js";import"./address-display-CwKEJJOB.js";import"./web-zb7mPoCG.js";import"./createReactComponent-wl4k8Mdo.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DGcIga4g.js";import"./index-BP2lfDQb.js";import"./IconCheck-CmQF7cnR.js";import"./IconChevronDown-CfWTDYBA.js";import"./IconSettings-BaS-1weE.js";import"./wallet-selector-CMgGg-0V.js";import"./wallet-mini-card-CXKAQ5H1.js";import"./token-icon-CX62U3XX.js";import"./amount-display-CGZ46Thg.js";import"./NumberFlow-client-48rw3j0J-BSYdH5uj.js";import"./animated-number-CNVCFHPq.js";import"./time-display-BMhDu7Kq.js";import"./service-status-alert-BM-lR4wI.js";import"./IconX-DCkfpTW2.js";import"./IconAlertTriangle-CaDH3OJJ.js";import"./IconLock-0IzuxcvT.js";import"./item-D6NAzaDd.js";import"./button-D0vqD5Fj.js";import"./useButton-BahIwM1n.js";import"./useRenderElement-hl_jM4NT.js";import"./dropdown-menu-CazRtSIy.js";import"./index-_sH4Eecd.js";import"./index-BgRpTT_7.js";import"./composite-Bs4HhxD-.js";import"./useBaseUiId-DUAweyL0.js";import"./useCompositeListItem-CGw3Dlzk.js";import"./useRole-B-maVyST.js";import"./user-profile-6MEAWVdy.js";import"./avatar-codec-dsp1tHUD.js";import"./bioforest-D8y-UjrY.js";import"./web-DPaFGawW.js";import"./amount-BQsqQYGO.js";import"./notification-BrV5k1qz.js";import"./index-JS8jUhbQ.js";import"./transaction-meta-CoASzp7n.js";import"./IconDots-CEi2m8F7.js";import"./IconShieldCheck-DzG82VIR.js";import"./IconApps-BoeML-J4.js";import"./IconCoins-C2WS_y3H.js";import"./IconSparkles-V-nFIfim.js";import"./IconTrash-CCvJ2jut.js";import"./transaction-list-XFkjNWPk.js";import"./transaction-item-BYvQ9mav.js";import"./IconRefresh-B0dFu0fc.js";import"./swipeable-tabs-BS9Prrsi.js";import"./swiper-RTeROTwc.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
