import{j as c}from"./iframe-SXVqHfW1.js";import{a as p}from"./token-item-BnGiwygY.js";import{G as l}from"./LoadingSpinner-aBqTPX38.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Z0krHUC3.js";import"./hologram-canvas-CUABOPdV.js";import"./chain-icon-c7kvVx0o.js";import"./service-D6CLtI_E.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DaU5Fc54.js";import"./address-display-DlzR_hmA.js";import"./web-B-H01CmI.js";import"./createReactComponent-BcoG-gz6.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BszJ4SY-.js";import"./index-Cb1-PfWX.js";import"./IconCheck-CkWppXyE.js";import"./IconChevronDown-VcAwuOLA.js";import"./IconSettings-DzVp8q7n.js";import"./wallet-selector-CAwZxGIs.js";import"./wallet-mini-card-CyHaRYNI.js";import"./token-icon-D714SkAu.js";import"./amount-display-lK4f5kKc.js";import"./NumberFlow-client-48rw3j0J-bvsY23vz.js";import"./animated-number-BdCWLope.js";import"./time-display-CZi5pY_E.js";import"./service-status-alert-h_su97V4.js";import"./IconX-RNHCmRZf.js";import"./IconAlertTriangle-Dgvaau8t.js";import"./IconLock-BR0NwITG.js";import"./button-Sidawz76.js";import"./useButton-Ca6SrVUp.js";import"./useRenderElement-BkFxhWus.js";import"./dropdown-menu-Cr43akFE.js";import"./index-_BPofhja.js";import"./index-cKQgJy5O.js";import"./composite-jbIyTfgp.js";import"./useBaseUiId-eXozJOFe.js";import"./useCompositeListItem-Cv0GUwaW.js";import"./useRole-hlFBctfE.js";import"./user-profile-C-4ZMrz0.js";import"./avatar-codec-BwHtyUo0.js";import"./bioforest-BrSvoWuc.js";import"./web-B0-GrAVz.js";import"./amount-BQsqQYGO.js";import"./notification-BJvdwJuQ.js";import"./index-CreRbCXK.js";import"./transaction-meta-Zi2xJpwV.js";import"./IconDots-P5Blnfq6.js";import"./IconShieldCheck-D1h8LOCh.js";import"./IconApps-DKqw56sU.js";import"./IconCoins-DBBrmLzA.js";import"./IconSparkles-xiJ0WJmH.js";import"./IconTrash-CJ3XQ8-M.js";import"./transaction-list-E0ahJq2Y.js";import"./transaction-item-DSlEkjQE.js";import"./IconRefresh-CCeB75gJ.js";import"./swipeable-tabs-Cttkc433.js";import"./swiper-BuLNzpU1.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
