import{j as c}from"./iframe-Ccr3EadC.js";import{a as p}from"./token-item-lt6bljCu.js";import{G as l}from"./LoadingSpinner-C_6_vaie.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-WW3uUnLL.js";import"./hologram-canvas-BmtUYZ5H.js";import"./chain-icon-BCSlK9jn.js";import"./service-Dk6ujaeB.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-3s2Q7oEM.js";import"./address-display-1vveDjAP.js";import"./web-DxDgbmtu.js";import"./createReactComponent-CW1k9Y36.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-Dw6LUa7x.js";import"./index-B7ArhURv.js";import"./IconCheck-Cu-u3Fld.js";import"./IconChevronDown-DujO74QI.js";import"./IconSettings-DIcRYIpV.js";import"./wallet-selector-BFjdLeVU.js";import"./wallet-mini-card-z-LlXeCQ.js";import"./token-icon-CsViP4Iu.js";import"./amount-display-DZSVkdpG.js";import"./NumberFlow-client-48rw3j0J-DbGVsbRb.js";import"./animated-number-cYoMxTer.js";import"./time-display-DtsnjAve.js";import"./service-status-alert-C8lW55B1.js";import"./IconX-Dkslwysl.js";import"./IconAlertTriangle-D9UhECul.js";import"./IconLock-0ERgT-K6.js";import"./button-B5zDJadI.js";import"./useButton-CZI-_ZZ9.js";import"./useRenderElement-CfRL3NCb.js";import"./dropdown-menu-CnxuZoeM.js";import"./index-CJpwcK28.js";import"./index-dYFoso_F.js";import"./composite-CInc4L2q.js";import"./useBaseUiId-DUgCvee8.js";import"./useCompositeListItem-BRBAco_z.js";import"./useRole-BYC3j-6l.js";import"./user-profile-7Xr3D_G5.js";import"./avatar-codec-q_UoDHba.js";import"./bioforest-CGmgofyy.js";import"./web-BNljm5Gd.js";import"./amount-BQsqQYGO.js";import"./notification-BECJHu-o.js";import"./index-p4zmfVwO.js";import"./transaction-meta-DzQm1nzT.js";import"./IconDots-BzKLrbFa.js";import"./IconShieldCheck-BOAWELGB.js";import"./IconApps-BD-Rvx1q.js";import"./IconCoins-fkd-i2vc.js";import"./IconSparkles-CAf7RzbQ.js";import"./IconTrash-DTWP7Ukb.js";import"./transaction-list-B8nj1Byu.js";import"./transaction-item-BC7ZE6df.js";import"./IconRefresh-BsTJH-X2.js";import"./swipeable-tabs-DbxdQdKv.js";import"./swiper-toSkN0CB.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
