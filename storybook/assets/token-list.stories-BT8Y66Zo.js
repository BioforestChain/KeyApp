import{j as c}from"./iframe-BCrNjImN.js";import{a as p}from"./token-item-CkQ7h6i-.js";import{G as l}from"./LoadingSpinner-BBi0SiC8.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B9uDSgb0.js";import"./hologram-canvas-D3XVF-u0.js";import"./chain-icon-DOwQ3GJj.js";import"./service-DknHpkdc.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BH8kgAyf.js";import"./address-display-DMEviNC1.js";import"./web-BgL-5yYp.js";import"./createReactComponent-andi6kw7.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CU2slI-l.js";import"./index-DHKp91te.js";import"./IconCheck-DYYWhxtK.js";import"./IconChevronDown-DLdBdBd_.js";import"./IconSettings-gWvFof36.js";import"./wallet-selector-5WNMXgXx.js";import"./wallet-mini-card-DGuXe3Cm.js";import"./token-icon-CPnzn-Uc.js";import"./amount-display-5iC0PMdo.js";import"./NumberFlow-client-48rw3j0J-BCa_JeyB.js";import"./animated-number-BYNTZF_J.js";import"./time-display-BjmVpjih.js";import"./service-status-alert-CLDn2hRL.js";import"./IconX-DPohlY0o.js";import"./IconAlertTriangle-CTcN4q2M.js";import"./IconLock-DRkhSKXr.js";import"./item-CvHbjqrJ.js";import"./button-CpWQPgd7.js";import"./useButton-DrZEIbiF.js";import"./useRenderElement-Blsu1gsm.js";import"./dropdown-menu-D9vQXGME.js";import"./index-DVLF5JXl.js";import"./index-mwWVIJod.js";import"./composite-DxaUI6XJ.js";import"./useBaseUiId-BwUV1wh0.js";import"./useCompositeListItem-DAsFic18.js";import"./useRole-3d4iTYLA.js";import"./user-profile-Dqdn2fNc.js";import"./avatar-codec-DYcU_f1V.js";import"./bioforest-Csp_8cek.js";import"./web-qy5o9cc6.js";import"./amount-BQsqQYGO.js";import"./notification-_mkG7iom.js";import"./index-Bh9mODD8.js";import"./transaction-meta-0Q--06QI.js";import"./IconDots-Bww8oeb7.js";import"./IconShieldCheck-BwqAH80O.js";import"./IconApps-BQsahsqL.js";import"./IconCoins-CUnquleu.js";import"./IconSparkles-D_kEEx3w.js";import"./IconTrash-DuP06HYL.js";import"./transaction-list-DpoXjMNs.js";import"./transaction-item-CLOi8owt.js";import"./IconRefresh-CvER4eLs.js";import"./swipeable-tabs-C682AF93.js";import"./swiper-BxdiSPy9.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
