import{j as c}from"./iframe-C21mQbSY.js";import{a as p}from"./token-item-tRYDLEO-.js";import{G as l}from"./LoadingSpinner-C6hUUVu3.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BvewFQ0M.js";import"./hologram-canvas-qK_gY0Q-.js";import"./chain-icon-CK7p54U_.js";import"./service-SNUfo6PG.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C4qEloxQ.js";import"./address-display-DqtKbvlU.js";import"./web-DaazThpj.js";import"./createReactComponent-BRgf_Xxb.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-FhkkIyCA.js";import"./index-Dr6-oy7a.js";import"./IconCheck-RmNUui3J.js";import"./IconChevronDown-Bau0dOUZ.js";import"./IconSettings-D6qF4uYT.js";import"./wallet-selector-BPDIb5-S.js";import"./wallet-mini-card-DREnO9zc.js";import"./token-icon-D_s9ZQbt.js";import"./amount-display-CThk5Emh.js";import"./NumberFlow-client-48rw3j0J-Dfq3dGbY.js";import"./animated-number-dDwwIbrN.js";import"./time-display-DLU9C6Ay.js";import"./service-status-alert-Bk-YpWn7.js";import"./IconX-BlIcf-Yy.js";import"./IconAlertTriangle-C3jojUXA.js";import"./IconLock-DOzRjn6Q.js";import"./item-B_SKEMgw.js";import"./button-o_HTLRsN.js";import"./useButton-Br6m5WU1.js";import"./useRenderElement-C78O61am.js";import"./dropdown-menu-CVQ32QEH.js";import"./index-DPuPuiSQ.js";import"./index-Co4mcRq0.js";import"./composite-CgX3SqyM.js";import"./useBaseUiId-DUSN6M-i.js";import"./useCompositeListItem-HJq7QdU2.js";import"./useRole-NiWOc0tL.js";import"./user-profile-BvHw7T62.js";import"./avatar-codec-Bi0pQbkp.js";import"./bioforest-DtmrOoZc.js";import"./web-D6hBI2An.js";import"./amount-BQsqQYGO.js";import"./notification-CTy0WD3U.js";import"./index-ie3lSMxi.js";import"./transaction-meta-B_x_DYQ7.js";import"./IconDots-DJWMJF0Z.js";import"./IconShieldCheck-vLqsbaz8.js";import"./IconApps-DYLmb6Ok.js";import"./IconCoins-BRIMd417.js";import"./IconSparkles-CqRKznA5.js";import"./IconTrash-Chw_i-s_.js";import"./transaction-list-B9WRU9f-.js";import"./transaction-item-CXljoCVC.js";import"./IconRefresh-CwqZ27dj.js";import"./swipeable-tabs-D6RciiCp.js";import"./swiper-BUY7BgPI.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
