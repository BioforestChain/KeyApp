import{j as c}from"./iframe-B-d0lOz6.js";import{a as p}from"./token-item-BPpGRwvV.js";import{G as l}from"./LoadingSpinner-BZwUDmiY.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DwIlpShv.js";import"./hologram-canvas-BK0RL3mT.js";import"./chain-icon-BKG3C_Ko.js";import"./service-BSRmu3v5.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-ClLXXo5f.js";import"./address-display-D77q0vgW.js";import"./web-BQyHYy1Y.js";import"./createReactComponent-D4-B61ht.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CtrQnQkd.js";import"./index-CfEkxDE-.js";import"./IconCheck-BZVQxFhF.js";import"./IconChevronDown-CAk6G5QY.js";import"./IconSettings-CA1EBWJh.js";import"./wallet-selector-32usiKqs.js";import"./wallet-mini-card-CPQ3IRIs.js";import"./token-icon-CNWCyiyC.js";import"./amount-display-B9Jjf1Nx.js";import"./NumberFlow-client-48rw3j0J-0hocEtWg.js";import"./animated-number--yYlASkx.js";import"./time-display-BjFsHaGt.js";import"./service-status-alert-WH5k920-.js";import"./IconX-CRP2bVPT.js";import"./IconAlertTriangle-DLsYQsDc.js";import"./IconLock-BKGKvr3F.js";import"./button-CUtXCe_W.js";import"./useButton-BzzCI2vr.js";import"./useRenderElement-eS0kiWgO.js";import"./dropdown-menu-CYw_hACb.js";import"./index-Cgv-LIio.js";import"./index-BlqTBAwO.js";import"./composite-CU9SQFl9.js";import"./useBaseUiId-BUPq-to3.js";import"./useCompositeListItem-Djp5TBY9.js";import"./useRole-eUrjYeCi.js";import"./user-profile-B46-toL7.js";import"./avatar-codec-Cmlzvu7r.js";import"./bioforest-oPHGPnG7.js";import"./web-h8Dc2e2Y.js";import"./amount-BQsqQYGO.js";import"./notification-CCy3Whb4.js";import"./index-BNdIWKL-.js";import"./transaction-meta-D8V-slUZ.js";import"./IconDots-Dh7WmB2F.js";import"./IconShieldCheck-CgSFhXxj.js";import"./IconApps-e_iBEiT-.js";import"./IconCoins-DxY53apS.js";import"./IconSparkles-62vU5mtt.js";import"./IconTrash-s7ex0uIa.js";import"./transaction-list-DZ3IGdED.js";import"./transaction-item-KJskD-wN.js";import"./IconRefresh-BM6nizR0.js";import"./swipeable-tabs-CRASdM3F.js";import"./swiper-BpPM3Ppa.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
