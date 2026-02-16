import{j as c}from"./iframe-BWeqjITw.js";import{a as p}from"./token-item-BMCb4Aw4.js";import{G as l}from"./LoadingSpinner-BX-as0np.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B-MX2tyC.js";import"./hologram-canvas-4go9sMBC.js";import"./chain-icon-Djkbu6SA.js";import"./service-jBNg5IZq.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Dn_NLtka.js";import"./address-display-ByxpPujQ.js";import"./web-Dl7j0Upe.js";import"./createReactComponent-CZ0FE120.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-xI2qK3OI.js";import"./index-Cz6VFDXe.js";import"./IconCheck-C3Q_jHbl.js";import"./IconChevronDown-QjFEqfEJ.js";import"./IconSettings-DGAUYxXV.js";import"./wallet-selector-D30S-zIg.js";import"./wallet-mini-card-DQe6J6ch.js";import"./token-icon-CY_6CJGW.js";import"./amount-display-C7Hj5IPN.js";import"./NumberFlow-client-48rw3j0J-DJ3mPExW.js";import"./animated-number-DbwaE-UI.js";import"./time-display-cVn3yrqg.js";import"./service-status-alert-BhZbADNa.js";import"./IconX-hAmdSUWz.js";import"./IconAlertTriangle-DFmmXpxC.js";import"./IconLock-BPNXFsTK.js";import"./item-CA8DIqh4.js";import"./button-BAdyIxPu.js";import"./useButton-8MoI8Tpn.js";import"./useRenderElement-Cq20EMg7.js";import"./dropdown-menu-Bhfs_6g1.js";import"./index-S7KLjegn.js";import"./index-ZFP_nO-v.js";import"./composite-BhQqNIoG.js";import"./useBaseUiId-DjgNfMZV.js";import"./useCompositeListItem-qdxU8_2C.js";import"./useRole-BqrHgA_I.js";import"./user-profile-Dk_kijuI.js";import"./avatar-codec-BCfJ87vB.js";import"./bioforest-tjr8Syby.js";import"./web-BAZGP8WJ.js";import"./amount-BQsqQYGO.js";import"./notification-CZiZl7-G.js";import"./index-qYIYDQQe.js";import"./transaction-meta-BdKW6iP1.js";import"./IconDots-DYCqAsRQ.js";import"./IconShieldCheck-DzQg7vt4.js";import"./IconApps-CuWv2Z3g.js";import"./IconCoins-C97ZnJG6.js";import"./IconSparkles-BFJfKj46.js";import"./IconTrash-Bwn4Cqq0.js";import"./transaction-list-CZ7gNiMr.js";import"./transaction-item-C4CjKwx4.js";import"./IconRefresh-BzDJYE_4.js";import"./swipeable-tabs-DscVMvWU.js";import"./swiper-Bxih_TIL.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
