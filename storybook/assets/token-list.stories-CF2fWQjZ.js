import{j as c}from"./iframe-BItTx6xa.js";import{a as p}from"./token-item-lX0-Mo7i.js";import{G as l}from"./LoadingSpinner-CnENE4j2.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DVoGf8fo.js";import"./hologram-canvas-nB8G1qR1.js";import"./chain-icon-Cw4-qRXl.js";import"./service-BXc0T6ax.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Bhvuajzn.js";import"./address-display-BETtJaMi.js";import"./web-BhWLHE4h.js";import"./createReactComponent-Dbk6urU_.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-C5zymG6a.js";import"./index-CNpMLyeW.js";import"./IconCheck-CQjur4cm.js";import"./IconChevronDown-TTXL2vU6.js";import"./IconSettings-xN5n6zuw.js";import"./wallet-selector-DrgpvL8J.js";import"./wallet-mini-card-D0eLb204.js";import"./token-icon-BmY8SXmf.js";import"./amount-display-BSE8RxRV.js";import"./NumberFlow-client-48rw3j0J-COsGDRQF.js";import"./animated-number-Bm-zN3YX.js";import"./time-display-C3wusd74.js";import"./service-status-alert-DlHTIQqK.js";import"./IconX-BMREaQd_.js";import"./IconAlertTriangle-D7i5TeRc.js";import"./IconLock-sLnbppjL.js";import"./item-CA-vFUmv.js";import"./button-jci0XqND.js";import"./useButton-DU8nj5ek.js";import"./useRenderElement-VREc9raJ.js";import"./dropdown-menu-BjoGDrGh.js";import"./index-DdEiF4so.js";import"./index-D1tVsUJt.js";import"./composite-CpyKR50H.js";import"./useBaseUiId-mqYSpYdQ.js";import"./useCompositeListItem-4AW9GzKj.js";import"./useRole-CqdsfoBP.js";import"./user-profile-CPMrF2V5.js";import"./avatar-codec-C8QZVhyD.js";import"./bioforest-Tn7eiqhf.js";import"./web-Cve2hjqV.js";import"./amount-BQsqQYGO.js";import"./notification-CI9K62Kc.js";import"./index-CWXrAt-m.js";import"./transaction-meta-CgcyFYVc.js";import"./IconDots-DNkuX7UX.js";import"./IconShieldCheck-BuKjxNgP.js";import"./IconApps-v1TB-RNa.js";import"./IconCoins-B1wWuvPg.js";import"./IconSparkles-BCbEmQJs.js";import"./IconTrash-CaTJQjOw.js";import"./transaction-list-CJzk368j.js";import"./transaction-item-BoIzVcdX.js";import"./IconRefresh-BgTOZDzQ.js";import"./swipeable-tabs-C9-vxDQJ.js";import"./swiper-D9IDPtrA.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
