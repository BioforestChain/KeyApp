import{j as c}from"./iframe-BQJL0pL_.js";import{a as p}from"./token-item-D0LeZX4j.js";import{G as l}from"./LoadingSpinner-B8aFhyyz.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DGS2uUDq.js";import"./hologram-canvas-CFY_0Yt5.js";import"./chain-icon-DaGWDgkS.js";import"./service-u9zf3p78.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BUnC2lyF.js";import"./address-display-CDMUFYVp.js";import"./web-C9o702Wu.js";import"./createReactComponent-DxQJumuF.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CFAlGsOi.js";import"./index-Ctp8a16w.js";import"./IconCheck-TPP9fGIJ.js";import"./IconChevronDown-s7O70WCO.js";import"./IconSettings-Bfie4Wgl.js";import"./wallet-selector-B19KUVWS.js";import"./wallet-mini-card-BK-T7X87.js";import"./token-icon-DoYmz-RE.js";import"./amount-display-Dz4LvhUi.js";import"./NumberFlow-client-48rw3j0J-tOa5EQxE.js";import"./animated-number-zPj5Hz1a.js";import"./time-display-Dxkuq45E.js";import"./service-status-alert-CTK2j9t_.js";import"./IconX-BgyXBJsa.js";import"./IconAlertTriangle-CMkS4vec.js";import"./IconLock-C2yQ_6sJ.js";import"./item-DbXROW3N.js";import"./button-CEk9DjEf.js";import"./useButton-BXym9LV_.js";import"./useRenderElement-DRTGoeR8.js";import"./dropdown-menu-DNGPnxvq.js";import"./index-BIa-EU4F.js";import"./index-BHTfqxwQ.js";import"./composite-BRF-djGv.js";import"./useBaseUiId-DaTNVDzr.js";import"./useCompositeListItem-CbdSs4aZ.js";import"./useRole-Bl7rQUjy.js";import"./user-profile-D8jSeggH.js";import"./avatar-codec-Jqp65I3T.js";import"./bioforest-BwvQjcFV.js";import"./web-B7NWsAyZ.js";import"./amount-BQsqQYGO.js";import"./notification-CdTUa5Lk.js";import"./index-CIojCwU2.js";import"./transaction-meta-CdXSJj1t.js";import"./IconDots-CMbdFvXz.js";import"./IconShieldCheck-cdpUPUGO.js";import"./IconApps-D5sOPAeh.js";import"./IconCoins-DOgzhSmq.js";import"./IconSparkles-Be2SLoko.js";import"./IconTrash-C1ya353C.js";import"./transaction-list-CwEsUN3_.js";import"./transaction-item-BONGMHsf.js";import"./IconRefresh-DF7bCDB6.js";import"./swipeable-tabs-CuvC_s5C.js";import"./swiper-fKacBn8h.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
