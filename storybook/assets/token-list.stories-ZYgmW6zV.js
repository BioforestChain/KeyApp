import{j as c}from"./iframe-CPG22Gvg.js";import{a as p}from"./token-item-BnT9i141.js";import{G as l}from"./LoadingSpinner-97gXTgHp.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Dsh5xUBo.js";import"./hologram-canvas-Cgb_VMZJ.js";import"./chain-icon-DmCtfEDP.js";import"./service-BVbeyLdv.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BLchsz9S.js";import"./address-display-BYSsmXA6.js";import"./web-CDAmkwGm.js";import"./createReactComponent-CbQTe-Tv.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DCL0_HUc.js";import"./index-DpSMJCqy.js";import"./IconCheck-C0Uv5X9v.js";import"./IconChevronDown-B7ysrIQT.js";import"./IconSettings-XP1YOmHd.js";import"./wallet-selector-B4cCbmoK.js";import"./wallet-mini-card-CtzGYjr9.js";import"./token-icon-mE28uhLj.js";import"./amount-display-ChhPoAuy.js";import"./NumberFlow-client-48rw3j0J-CIhj6HUH.js";import"./animated-number-BzyXpLL3.js";import"./time-display-BQ05-2VA.js";import"./service-status-alert-Bx-gebca.js";import"./IconX-D9XHFEJR.js";import"./IconAlertTriangle-C6j35NI0.js";import"./IconLock-DN-H8lLL.js";import"./item-D6F2LhNi.js";import"./button-CUoLTxz1.js";import"./useButton-D7g1prjV.js";import"./useRenderElement-BYd6SeVi.js";import"./dropdown-menu-Cyb6mH8K.js";import"./index-BRN0vHlh.js";import"./index-BRd4svWS.js";import"./composite-BKUMHrSh.js";import"./useBaseUiId-C5zq5W4S.js";import"./useCompositeListItem-U0GFb7Qq.js";import"./useRole-Bb4w76O-.js";import"./user-profile-DTMlfwoF.js";import"./avatar-codec-CBVKDlUj.js";import"./bioforest-DSIIUw3s.js";import"./web-CJW70xaB.js";import"./amount-BQsqQYGO.js";import"./notification-DJ4owEfb.js";import"./index-Ba5weNmE.js";import"./transaction-meta-By86k_mU.js";import"./IconDots-D5oTf8pK.js";import"./IconShieldCheck-ByKMdGNv.js";import"./IconApps-DhtsYTSG.js";import"./IconCoins-BRgCEQOW.js";import"./IconSparkles-BexNqTVi.js";import"./IconTrash-gtEfNMdX.js";import"./transaction-list-CKx1CE9J.js";import"./transaction-item-Ckttbyvv.js";import"./IconRefresh-970GWWLw.js";import"./swipeable-tabs-CYfyoL8A.js";import"./swiper-BiAKNBcT.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
