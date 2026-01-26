import{j as c}from"./iframe-BLQPPV58.js";import{a as p}from"./token-item-DOmeE_a6.js";import{G as l}from"./LoadingSpinner-T93whJMy.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-D2nemuj3.js";import"./hologram-canvas-thSrG9OF.js";import"./chain-icon-BpsM90-U.js";import"./service-SHQ5qflD.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DJ_d9UnK.js";import"./address-display-Cg2vy3ce.js";import"./web-CcjXaQYl.js";import"./createReactComponent-GB9Oo0vv.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DJmQji8N.js";import"./index-Ct8krvgw.js";import"./IconCheck-B9anvgrF.js";import"./IconChevronDown-DNPpVVj6.js";import"./IconSettings-pGTeVmtk.js";import"./wallet-selector-BUf6N7Fy.js";import"./wallet-mini-card-CSaR0RJ7.js";import"./token-icon-FDxmuPBP.js";import"./amount-display-DGLBSDjm.js";import"./NumberFlow-client-48rw3j0J-BmwSRk6e.js";import"./animated-number-D5GgIjpU.js";import"./time-display-Dw7aFxn-.js";import"./service-status-alert-bGqrTf9Q.js";import"./IconX-CigzngHq.js";import"./IconAlertTriangle-iCbx3PMa.js";import"./IconLock-B6noBnjE.js";import"./button-CgGkpUUL.js";import"./useButton-BRs4ugnA.js";import"./useRenderElement-CE8zZvbZ.js";import"./dropdown-menu-ZQdvzIvg.js";import"./index-Bnf6V1AJ.js";import"./index-0LEeW4J4.js";import"./composite-BQZhalDS.js";import"./useBaseUiId-BVvfucfi.js";import"./useCompositeListItem-eiUaMv1W.js";import"./useRole-Cl6JQ05j.js";import"./user-profile-bx-8Jyn4.js";import"./avatar-codec--ugxHx84.js";import"./bioforest-6nM-y0Xo.js";import"./web-DMlWpGRg.js";import"./amount-BQsqQYGO.js";import"./notification-C_Czfpui.js";import"./index-C6L5CAXb.js";import"./transaction-meta-iQQyfopI.js";import"./IconDots-BZjfkPjL.js";import"./IconShieldCheck-jDy0ulDK.js";import"./IconApps-rpuxipw3.js";import"./IconCoins-Dqg1pHG6.js";import"./IconSparkles-D2FOiTBb.js";import"./IconTrash-BT7OCPMo.js";import"./transaction-list-WiuubOhr.js";import"./transaction-item-C_5fvDm3.js";import"./IconRefresh-DFzFR_Uu.js";import"./swipeable-tabs-DeW0RT-i.js";import"./swiper-BGGJh7y_.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
