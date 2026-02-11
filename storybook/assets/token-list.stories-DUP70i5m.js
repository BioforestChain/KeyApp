import{j as c}from"./iframe-DhRzs3QD.js";import{a as p}from"./token-item-DbcS1bKI.js";import{G as l}from"./LoadingSpinner-BgAredTm.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DSyPy-o5.js";import"./hologram-canvas-CUROFI0V.js";import"./chain-icon-CCNq8k-M.js";import"./service-__1EAnwc.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BYLs4s_d.js";import"./address-display-BG1VU3jC.js";import"./web-ChZsC4Ze.js";import"./createReactComponent-h8x-Q1Cj.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-C9JGIhWl.js";import"./index-CAdZSkRa.js";import"./IconCheck-C2OGQcJ1.js";import"./IconChevronDown-rBotlNom.js";import"./IconSettings-BsE_zuMb.js";import"./wallet-selector-7kACE3hv.js";import"./wallet-mini-card-CBNiNVzu.js";import"./token-icon-BIJCqGAW.js";import"./amount-display-5rQ1KHOW.js";import"./NumberFlow-client-48rw3j0J-BSPeT8gR.js";import"./animated-number-CIvF6exc.js";import"./time-display-DbudZ1vp.js";import"./service-status-alert-Bun5kfcN.js";import"./IconX-CJ6g2mV5.js";import"./IconAlertTriangle-D4t9KaCM.js";import"./IconLock-CJfE6O0S.js";import"./item-BIygPWU0.js";import"./button-DLucXVXZ.js";import"./useButton-cUd3xYlA.js";import"./useRenderElement-zf-aeRvE.js";import"./dropdown-menu-CQ0lSIKV.js";import"./index-DlV_KyJ_.js";import"./index-C_bRl42U.js";import"./composite-B0xDTogz.js";import"./useBaseUiId-D6oAr_Cg.js";import"./useCompositeListItem-C0qFsSjj.js";import"./useRole-S35txYkO.js";import"./user-profile-DMZfGvVh.js";import"./avatar-codec-CbK3J8XH.js";import"./bioforest-yoQVZaPm.js";import"./web-CLoUdtHG.js";import"./amount-BQsqQYGO.js";import"./notification-ClFntkkQ.js";import"./index-BGo2RwBf.js";import"./transaction-meta-hHp8JR3h.js";import"./IconDots-DcAeyFyx.js";import"./IconShieldCheck-DpdQx6G9.js";import"./IconApps-Dqwx1JTB.js";import"./IconCoins-vjgAcSKr.js";import"./IconSparkles-B2bmEjco.js";import"./IconTrash-3gvGVXs_.js";import"./transaction-list-De6llEk-.js";import"./transaction-item-DsjYGWff.js";import"./IconRefresh-CtylLlJs.js";import"./swipeable-tabs-OzAlKVdI.js";import"./swiper-jdXpHTuo.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
