import{j as c}from"./iframe-D3ABYMD8.js";import{a as p}from"./token-item-DYEirK0l.js";import{G as l}from"./LoadingSpinner-D74KKI-n.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CT0JWji0.js";import"./hologram-canvas-CTb5Q8NL.js";import"./chain-icon-BacVAzBY.js";import"./service-CYJrBEm1.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-ClrzEB5W.js";import"./address-display-B11uZCdf.js";import"./web-BLErXFbp.js";import"./createReactComponent-C0YYz3KP.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DQSHz3hi.js";import"./index-DfO7pNxz.js";import"./IconCheck-BMcerDXW.js";import"./IconChevronDown-D3S3U_7D.js";import"./IconSettings-CzwlXKIe.js";import"./wallet-selector-B3vA9D6B.js";import"./wallet-mini-card-BqhNbNOF.js";import"./token-icon-Cn1Fcq2u.js";import"./amount-display-7k58hnAJ.js";import"./NumberFlow-client-48rw3j0J-QPb7mGS9.js";import"./animated-number-BhXdI7aB.js";import"./time-display-9eG32PyF.js";import"./service-status-alert-D7_v42M5.js";import"./IconX-lDP6vjX0.js";import"./IconAlertTriangle-CXCPCUe2.js";import"./IconLock-BCqYSSYw.js";import"./button-BgtqXvte.js";import"./useButton-D2HLYTau.js";import"./useRenderElement-DR737Gpo.js";import"./dropdown-menu-55qBsyLz.js";import"./index-CHkBfMxD.js";import"./index-DJTS9Rzy.js";import"./composite-Ck_S3zbW.js";import"./useBaseUiId-CJJwqYdB.js";import"./useCompositeListItem-BteJke3u.js";import"./useRole-DJHof7qS.js";import"./user-profile-BuIZuabg.js";import"./avatar-codec-50g07eV5.js";import"./bioforest-D2zC8AQJ.js";import"./web-CSp9QLNT.js";import"./amount-BQsqQYGO.js";import"./notification-Cc5z6zZi.js";import"./index-DxtA42oa.js";import"./transaction-meta-B2aM7EaK.js";import"./IconDots-ClCIelU3.js";import"./IconShieldCheck-W7N_ieZK.js";import"./IconApps-DV34VFY-.js";import"./IconCoins-IiYZoY_M.js";import"./IconSparkles-eD7INIJG.js";import"./IconTrash-DMQ7crwe.js";import"./transaction-list-BUoP_twj.js";import"./transaction-item-JsFlFhIM.js";import"./IconRefresh-BJPeXXPM.js";import"./swipeable-tabs-COFpRu4K.js";import"./swiper-RnDi5isX.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
