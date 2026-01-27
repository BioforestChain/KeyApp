import{j as c}from"./iframe-CyHKRRfK.js";import{a as p}from"./token-item-Cb4v7now.js";import{G as l}from"./LoadingSpinner-CsDyFSeb.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DmcbK-2x.js";import"./hologram-canvas-BXJKJFmf.js";import"./chain-icon-Dgjddu0-.js";import"./service-DP-NM-sf.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BR17AZyy.js";import"./address-display-CE3Z_TiK.js";import"./web-CG-vNO2v.js";import"./createReactComponent-s7oBHST4.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CIKJsFW0.js";import"./index-BUgYDrNo.js";import"./IconCheck-Bwfu6zg_.js";import"./IconChevronDown-n10E_K4f.js";import"./IconSettings-wPrPObel.js";import"./wallet-selector-BiKFPvyE.js";import"./wallet-mini-card-BSctK5TO.js";import"./token-icon-CUEZjXwT.js";import"./amount-display-B_iESWI-.js";import"./NumberFlow-client-48rw3j0J-BBOJ6OFT.js";import"./animated-number-BZQLzc8r.js";import"./time-display-BmQuJLH_.js";import"./service-status-alert-Yxt6K4l3.js";import"./IconX-B_-P0vwJ.js";import"./IconAlertTriangle-W6hyc0IG.js";import"./IconLock-Bca_HJzI.js";import"./button-DqCIK_L3.js";import"./useButton-BA25y7PG.js";import"./useRenderElement-DkWAnHdu.js";import"./dropdown-menu-XmHCVZ-n.js";import"./index-Dvj3nYe8.js";import"./index-BkJaIWio.js";import"./composite-CrQkzwD9.js";import"./useBaseUiId-B_XhQx0v.js";import"./useCompositeListItem-Dj2xLgWc.js";import"./useRole-lqpchYPa.js";import"./user-profile-1cakxpxh.js";import"./avatar-codec-DcFsRURq.js";import"./bioforest-ZCexNS2w.js";import"./web-DEeCKjil.js";import"./amount-BQsqQYGO.js";import"./notification-DKJwDnj5.js";import"./index-fhYM6w4G.js";import"./transaction-meta-58OE7j5a.js";import"./IconDots-DqGau4aZ.js";import"./IconShieldCheck-BU_nglpP.js";import"./IconApps-D5ggEIyk.js";import"./IconCoins-LzMki9Ly.js";import"./IconSparkles-DxlDtXHF.js";import"./IconTrash-Bj-Bt2Ri.js";import"./transaction-list-BUlJNOPA.js";import"./transaction-item-CPSUCYlt.js";import"./IconRefresh-Dl_mUmmW.js";import"./swipeable-tabs-CjS67HfU.js";import"./swiper-CJDxcieY.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
