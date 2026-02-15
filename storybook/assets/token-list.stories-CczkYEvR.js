import{j as c}from"./iframe-HyYVOuWN.js";import{a as p}from"./token-item-CPQ8UOd8.js";import{G as l}from"./LoadingSpinner-B-vq1eRk.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CoA3j9hb.js";import"./hologram-canvas-Bn-S5YfH.js";import"./chain-icon-C7eC6Tzr.js";import"./service-Bu6nirWM.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C9O-ZyXf.js";import"./address-display-DFQAjGMq.js";import"./web-BwI_jWt7.js";import"./createReactComponent-aapL5_h8.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BMO7P-mF.js";import"./index-C6_cQm_p.js";import"./IconCheck-mK2vatc0.js";import"./IconChevronDown-CXaxkwFm.js";import"./IconSettings-DviXZNmv.js";import"./wallet-selector-DlWI6s-V.js";import"./wallet-mini-card-Bat2d6t5.js";import"./token-icon-BemG9OyB.js";import"./amount-display-CIfNLv7v.js";import"./NumberFlow-client-48rw3j0J-La3yizSR.js";import"./animated-number-D9Pjq2xv.js";import"./time-display-C6vL9ZpN.js";import"./service-status-alert-D9UGGjkp.js";import"./IconX-DbjO4PV_.js";import"./IconAlertTriangle-f5OyM4tO.js";import"./IconLock-C8H26ONg.js";import"./item-DFbkk42u.js";import"./button-DHTOS9AR.js";import"./useButton-C4w2QgAM.js";import"./useRenderElement-DddKhq_U.js";import"./dropdown-menu-CibTDZ49.js";import"./index-CR-ZNuQ7.js";import"./index-DhNPdIPp.js";import"./composite-BTb9Ade9.js";import"./useBaseUiId-CkyFw1Pj.js";import"./useCompositeListItem-DurxjxEk.js";import"./useRole-1Z3-CPQi.js";import"./user-profile-PpRrJ3-y.js";import"./avatar-codec-DMvq3Yo7.js";import"./bioforest-DGlhXHnY.js";import"./web-CBUaog3C.js";import"./amount-BQsqQYGO.js";import"./notification-Doub1nbC.js";import"./index-Bnj5dDQa.js";import"./transaction-meta-Bko0G_6g.js";import"./IconDots-Cb-nieea.js";import"./IconShieldCheck-BwH_Z-Ij.js";import"./IconApps-D8D8CzJJ.js";import"./IconCoins-bMqBbdHz.js";import"./IconSparkles-D6JldWdt.js";import"./IconTrash-KuNANb6t.js";import"./transaction-list-DD0WMiei.js";import"./transaction-item-tyq2m0j2.js";import"./IconRefresh-CFvB9kUI.js";import"./swipeable-tabs-cyQC8-GF.js";import"./swiper-ek_JBGc2.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
