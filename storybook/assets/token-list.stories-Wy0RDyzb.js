import{j as c}from"./iframe-CxqJ7t_d.js";import{a as p}from"./token-item-DK4VBArF.js";import{G as l}from"./LoadingSpinner-DgxKGd8Q.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CjRG1ZdT.js";import"./hologram-canvas-BJ6ErNGA.js";import"./chain-icon-Rfv3DXQ5.js";import"./index-ORzy0U-8.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DhJ2utsa.js";import"./address-display-bDzCPot3.js";import"./web-Do73hSYQ.js";import"./createReactComponent-FjQf3UKG.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DjVxdnu3.js";import"./index-DVGGjAlj.js";import"./IconCheck-Dh4Lk-cL.js";import"./IconChevronDown-CppIW3Tl.js";import"./IconSettings-1vxv-hk3.js";import"./wallet-selector-I9clxt9F.js";import"./wallet-mini-card-03wmelzO.js";import"./token-icon-D3FNDQNZ.js";import"./amount-display-Cgp7GHxP.js";import"./NumberFlow-client-48rw3j0J-Dn98ZNkm.js";import"./animated-number-DGWnTRpK.js";import"./time-display-M8n795T7.js";import"./service-status-alert-DoaESEgb.js";import"./IconX-Ck9fHpiU.js";import"./IconAlertTriangle-DHXab_pj.js";import"./IconLock-CHrudbRx.js";import"./button-y9znDRSj.js";import"./useButton-_nSio9WM.js";import"./useRenderElement-Cuq_tw-2.js";import"./dropdown-menu-DFmBCWvt.js";import"./index-DuFOI7xd.js";import"./index-7JOQpM-o.js";import"./composite-Br3TQ4o0.js";import"./useBaseUiId-aqO0dTwN.js";import"./useCompositeListItem-BNiyAJ47.js";import"./useRole-CIl4FmhG.js";import"./user-profile-D6sL5LfV.js";import"./avatar-codec-DgxJxeEc.js";import"./bioforest-BAyREqus.js";import"./web-DAxCx5AA.js";import"./amount-BQsqQYGO.js";import"./notification-CEsMdVmr.js";import"./index-Cj465iev.js";import"./transaction-meta-BVXIu_0A.js";import"./IconDots-di-6dJ_b.js";import"./IconShieldCheck-DLGtX0dK.js";import"./IconApps-Uf0BvtM7.js";import"./IconCoins-BCGoby_2.js";import"./IconSparkles-NANSlWXF.js";import"./IconTrash-CkoX7m0z.js";import"./transaction-list-3iaQAPnI.js";import"./transaction-item-B2RflMXp.js";import"./IconRefresh-BI78qN1W.js";import"./swipeable-tabs-kD0DJYKR.js";import"./swiper-DQjETVvs.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
