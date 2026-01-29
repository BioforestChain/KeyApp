import{j as c}from"./iframe-CUTaUOgg.js";import{a as p}from"./token-item-62XBhZjq.js";import{G as l}from"./LoadingSpinner-C5RlpjT0.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CgJP9oZ3.js";import"./hologram-canvas-CQ2FVdfu.js";import"./chain-icon-BzgWghYi.js";import"./service-NVQO_MqM.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CIvxAo9e.js";import"./address-display-DowCEyaP.js";import"./web-nPoJMOC7.js";import"./createReactComponent-B69VBfHm.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BYgXC6gz.js";import"./index-DgSS0CGD.js";import"./IconCheck-yW8T0Ywr.js";import"./IconChevronDown-BQbppIdI.js";import"./IconSettings-D3y9nc6Z.js";import"./wallet-selector-mEvbCZg3.js";import"./wallet-mini-card-TneqBdEf.js";import"./token-icon-BaM3ems6.js";import"./amount-display-DBVWESkU.js";import"./NumberFlow-client-48rw3j0J-CDE3ZLrE.js";import"./animated-number-Dap2yx0f.js";import"./time-display-EvAIUUgH.js";import"./service-status-alert-1Nm-bqWq.js";import"./IconX-Ddc5sns4.js";import"./IconAlertTriangle-GYLF0r4s.js";import"./IconLock-CsouooSZ.js";import"./button-CH3dd-W1.js";import"./useButton-DHZLAPgf.js";import"./useRenderElement-BY_P1_6z.js";import"./dropdown-menu-D5hhDsM7.js";import"./index-Cwbq21tS.js";import"./index-yjrgXnVF.js";import"./composite-CLV0NYdo.js";import"./useBaseUiId-CGtB928V.js";import"./useCompositeListItem-UjqfSCMC.js";import"./useRole-Bg0OXGa9.js";import"./user-profile-5r8-WGNi.js";import"./avatar-codec-dy4yFzAs.js";import"./bioforest-l5-Np5Vt.js";import"./web-Bld83PTI.js";import"./amount-BQsqQYGO.js";import"./notification-M4DDnbr3.js";import"./index-DwIbjXNs.js";import"./transaction-meta-C9KDgmbf.js";import"./IconDots-DO0pvYv2.js";import"./IconShieldCheck-BtkJ0XSW.js";import"./IconApps-DwVnzbJ_.js";import"./IconCoins-T9hUx8Zj.js";import"./IconSparkles-lviPuRhL.js";import"./IconTrash-Czzxyw9V.js";import"./transaction-list-DcjEeaLU.js";import"./transaction-item-BUJxp6Xp.js";import"./IconRefresh-CYx6sxSY.js";import"./swipeable-tabs-B6TehXot.js";import"./swiper-B61rJfHR.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
