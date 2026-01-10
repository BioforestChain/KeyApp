import{j as c}from"./iframe-g2b0m8DI.js";import{a as p}from"./token-item-DkSJ-y5E.js";import{G as l}from"./gradient-button-Bxl7tD7d.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-Ddaln5uG.js";import"./hologram-canvas-CfHQsoPv.js";import"./chain-icon-COt1uHxx.js";import"./address-display-C7nFi0cW.js";import"./web-wmJrEV3C.js";import"./createReactComponent-Cuq699P7.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Cu2h0njW.js";import"./index-D3aA_s7S.js";import"./IconCheck-C48_yMgZ.js";import"./IconChevronDown-BUNW6xut.js";import"./IconSettings-CuoOkbTk.js";import"./wallet-selector-DYNhADHH.js";import"./wallet-mini-card-DAe4T2aE.js";import"./token-icon-uu9a5B4t.js";import"./chain-config-DW44byg9.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-BVzIq5_8.js";import"./transaction-item-91IuR5c8.js";import"./loading-spinner-BKRfkk18.js";import"./empty-state-Djr2ZYm8.js";import"./skeleton-BkqRBCyh.js";import"./amount-display-p3kKhEyv.js";import"./animated-number-D2KYFGet.js";import"./time-display-BRjqNmbb.js";import"./qr-code-C7yKKB09.js";import"./index-Bs6xVBz9.js";import"./icon-circle-BPhKNUJn.js";import"./copyable-text-BhO3508M.js";import"./IconAlertCircle-CUQDCVam.js";import"./IconAlertTriangle-BX3363qR.js";import"./IconCircleCheck-WR4e0BUZ.js";import"./IconInfoCircle-Ds2ezTBJ.js";import"./button-CkH5a8bp.js";import"./index-B_jtOnfb.js";import"./useButton-Vl73DGon.js";import"./useRenderElement-CculAx30.js";import"./IconX-Dho8Gi5m.js";import"./IconDots-CMGu_NAW.js";import"./IconShieldCheck-u41z_njd.js";import"./IconTrash-COIP1dsh.js";import"./IconCoins-Cfp7zbc0.js";import"./IconSparkles-0DupEXdp.js";import"./web-C48KhOIf.js";import"./dropdown-menu-pacyIMP3.js";import"./index-BsXJ8dw5.js";import"./index-C1ltPsAf.js";import"./composite-CEjQz6UX.js";import"./useBaseUiId-DDpcwVum.js";import"./useCompositeListItem-CJu-ylAh.js";import"./useRole-Yg_4Ogwi.js";import"./transaction-list-CtSNixvf.js";import"./swipeable-tabs-C_CtScwj.js";import"./swiper-141A4hTv.js";import"./index-nmRTiCJZ.js";const Se={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},m={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},s={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    tokens: [mockTokens[0]!],
    onTokenClick: token => alert(\`Clicked \${token.symbol}\`)
  }
}`,...m.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const Be=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,n as Empty,r as Loading,s as ManyTokens,m as SingleToken,t as WithChange,Be as __namedExportsOrder,Se as default};
