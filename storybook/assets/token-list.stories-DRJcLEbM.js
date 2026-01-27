import{j as c}from"./iframe-CMX6GvDx.js";import{a as p}from"./token-item-B8nOa2gi.js";import{G as l}from"./LoadingSpinner-CBg4Zkne.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-jBtoieeK.js";import"./hologram-canvas-B9TOUJVi.js";import"./chain-icon-qQVvVPgA.js";import"./service-qx9PzakR.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CmJNFLfN.js";import"./address-display-DT2Dz0gS.js";import"./web-C-rTaHOD.js";import"./createReactComponent-CsnZ93S4.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DOQIbGsS.js";import"./index-BdTp2md1.js";import"./IconCheck-CdDs7kxE.js";import"./IconChevronDown-BvmebWB8.js";import"./IconSettings-DC0_2CPA.js";import"./wallet-selector-D_EYb1yi.js";import"./wallet-mini-card-B-V4Lzl2.js";import"./token-icon-DJ3j8ZX7.js";import"./amount-display-DmHifVBF.js";import"./NumberFlow-client-48rw3j0J-Buvc5vQH.js";import"./animated-number-DI-0id-n.js";import"./time-display-BEC4adVp.js";import"./service-status-alert-rB4bu5hU.js";import"./IconX-Dvzy2s7Y.js";import"./IconAlertTriangle-CYabEY5J.js";import"./IconLock-fB2Xe_wf.js";import"./button-DZddXMM9.js";import"./useButton-CT3j_Tgq.js";import"./useRenderElement-DKbY89Sy.js";import"./dropdown-menu-BlWzN0CT.js";import"./index-Bae2dgwh.js";import"./index-BAyRZMqw.js";import"./composite-C_EiaM0V.js";import"./useBaseUiId-DCYFml5e.js";import"./useCompositeListItem-DR5V4OTn.js";import"./useRole-DCmp3H1n.js";import"./user-profile-rIN_GxQp.js";import"./avatar-codec-D7rhyY6J.js";import"./bioforest-COUrd5ZY.js";import"./web-NCSswCd6.js";import"./amount-BQsqQYGO.js";import"./notification-BZVNP0Iu.js";import"./index-BKxvte0Y.js";import"./transaction-meta-CcHkujU5.js";import"./IconDots-DlppL6Zi.js";import"./IconShieldCheck-D3Jn0O24.js";import"./IconApps-BmoumRnF.js";import"./IconCoins-D6LQRx8S.js";import"./IconSparkles-e2h6LofP.js";import"./IconTrash-BdHPY0L0.js";import"./transaction-list-epGnUu_N.js";import"./transaction-item-BhTiL_-B.js";import"./IconRefresh-Dis9BPHj.js";import"./swipeable-tabs-CL_3mKz3.js";import"./swiper-5Fvh_9OV.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
