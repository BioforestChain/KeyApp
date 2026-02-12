import{j as c}from"./iframe-BaLTYcLj.js";import{a as p}from"./token-item-DTwkdLzt.js";import{G as l}from"./LoadingSpinner-X_TYtwyd.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Cg1itWHv.js";import"./hologram-canvas-C4Na_BAd.js";import"./chain-icon-oAX84yr9.js";import"./service-BlVhX8JZ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CEElGHnj.js";import"./address-display-CUn2jxy4.js";import"./web-DxbHzEn5.js";import"./createReactComponent-CwORpysc.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-XqDJdYHX.js";import"./index-Bjas02mz.js";import"./IconCheck-cycgSQSc.js";import"./IconChevronDown-Dlchl_Rd.js";import"./IconSettings-C5PIqXDC.js";import"./wallet-selector-Cf-jFN_5.js";import"./wallet-mini-card-CAsbw7K1.js";import"./token-icon-B_bgPozn.js";import"./amount-display-Cxp8QGIp.js";import"./NumberFlow-client-48rw3j0J-2AqrHX5q.js";import"./animated-number-DA8vFZsq.js";import"./time-display-DrA3lKLV.js";import"./service-status-alert-UnKxGzeA.js";import"./IconX-BXHszti1.js";import"./IconAlertTriangle-ZsZTjd8-.js";import"./IconLock-DSySxMxc.js";import"./item-Cv7e6Tbv.js";import"./button-C0FnBpDd.js";import"./useButton-B801ydtf.js";import"./useRenderElement-CZ_Fetq-.js";import"./dropdown-menu-BM5QnqR4.js";import"./index-B_l_J9Tp.js";import"./index-0Vp09a8T.js";import"./composite-FGugJUg_.js";import"./useBaseUiId-DS2rF3uZ.js";import"./useCompositeListItem-DVg89qHi.js";import"./useRole-CDeZVhTG.js";import"./user-profile-BGII2n8P.js";import"./avatar-codec-B9dG8TzM.js";import"./bioforest-Bq9dR4_d.js";import"./web-fe7SZzuu.js";import"./amount-BQsqQYGO.js";import"./notification-BmalLb-p.js";import"./index-Dq5FsSnA.js";import"./transaction-meta-BYKYp2MB.js";import"./IconDots-h2MP8PyX.js";import"./IconShieldCheck-CXTwOhVM.js";import"./IconApps-BEI_M3Ot.js";import"./IconCoins-DmGUuBDm.js";import"./IconSparkles-Cu_3N-bJ.js";import"./IconTrash-DGlSzVdD.js";import"./transaction-list-C6Nj-ZYz.js";import"./transaction-item-BjW_yJ4j.js";import"./IconRefresh-C8aFoC7o.js";import"./swipeable-tabs-DwQGWqIf.js";import"./swiper-D9wMBvkB.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
