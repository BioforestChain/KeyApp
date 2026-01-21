import{j as c}from"./iframe-D_jX0M3w.js";import{a as p}from"./token-item-REO6l1Z6.js";import{G as l}from"./LoadingSpinner-C_0-UxYd.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DIpe5czb.js";import"./hologram-canvas-DAZe6V-I.js";import"./chain-icon-DhHBA4Xs.js";import"./index-O9E2TfTN.js";import"./schemas-B18CumQY.js";import"./address-display-5YHlZfPs.js";import"./web-DDXIyFIc.js";import"./createReactComponent-Dhbfj6RJ.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-BXtw4Hgp.js";import"./index-D0oJr3gH.js";import"./IconCheck-waOjZK6O.js";import"./IconChevronDown-N67CRNED.js";import"./IconSettings-DjIzw3qE.js";import"./wallet-selector-Dcv5ehwk.js";import"./wallet-mini-card-BCPt2U4G.js";import"./token-icon-D9oPdFql.js";import"./amount-display-8OWJzKuU.js";import"./NumberFlow-client-48rw3j0J-O9YBGGY6.js";import"./animated-number-XuJvMJfm.js";import"./time-display-C7YpGkBI.js";import"./copyable-text-saTmwjjx.js";import"./IconX-CUoRR1T0.js";import"./button-CjQHBmND.js";import"./useButton-U9vnfQIs.js";import"./useRenderElement-BApz5BLJ.js";import"./dropdown-menu-BeOh0xg0.js";import"./index-CTTRb9cR.js";import"./index-ChSDzzES.js";import"./composite-BXh84xmU.js";import"./useBaseUiId-DbfGcCks.js";import"./useCompositeListItem-Bvf1cYVe.js";import"./useRole-Bp6MS0ar.js";import"./user-profile-DDHuf8Q1.js";import"./index-D0E7N0oa.js";import"./bioforest-DYY0vyrv.js";import"./avatar-codec-rayKEr8Y.js";import"./web-DPKzTbsz.js";import"./amount-BQsqQYGO.js";import"./notification-BnIjfT-F.js";import"./index-QLcEGmjW.js";import"./transaction-meta-BGlojEYq.js";import"./IconDots-QoWXFgZh.js";import"./IconShieldCheck-BGilSxo-.js";import"./IconApps-BbyjNejT.js";import"./IconCoins-hltYPCnG.js";import"./IconSparkles-CJWFdOep.js";import"./IconLock-C5jSOYfm.js";import"./IconTrash-BAQ5m6pP.js";import"./transaction-list-D5Di9F1z.js";import"./transaction-item-CRP2tcap.js";import"./IconRefresh-BS_8F_gg.js";import"./swipeable-tabs-B5diKUpE.js";import"./swiper-Bx1L5xtp.js";import"./IconAlertTriangle-CTSF44gc.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Ce=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Ce as __namedExportsOrder,ye as default};
