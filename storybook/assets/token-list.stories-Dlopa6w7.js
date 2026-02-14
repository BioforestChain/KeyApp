import{j as c}from"./iframe-BTpb5FuF.js";import{a as p}from"./token-item-DCbmE1dU.js";import{G as l}from"./LoadingSpinner-Bj1P4A7v.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BflnDx55.js";import"./hologram-canvas-CQg_2NrZ.js";import"./chain-icon-uOwu4GsM.js";import"./service-B11mV8mZ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DXhIenTQ.js";import"./address-display-Dwj9BZtz.js";import"./web-2aVBBSU0.js";import"./createReactComponent-BdieSkAI.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-B4edLqB0.js";import"./index-CWWgpFGc.js";import"./IconCheck-DGG9uPQJ.js";import"./IconChevronDown-DS0hqfHe.js";import"./IconSettings-D0BgB655.js";import"./wallet-selector-Cd7-heIp.js";import"./wallet-mini-card-CZ2qEQHD.js";import"./token-icon-CQUJiJpR.js";import"./amount-display-CkrnJBl7.js";import"./NumberFlow-client-48rw3j0J-CW2mAzu9.js";import"./animated-number-BevoHaxf.js";import"./time-display-NSy4Wzld.js";import"./service-status-alert-D96OV52y.js";import"./IconX-DuDek79G.js";import"./IconAlertTriangle-CcYcut4h.js";import"./IconLock-d8cp28og.js";import"./item-LXtUglwY.js";import"./button-BOvm2CMd.js";import"./useButton-By7RoCFb.js";import"./useRenderElement-BN7LlmvW.js";import"./dropdown-menu-CMlvEO8n.js";import"./index-DNgmIf6_.js";import"./index-COAZ4abe.js";import"./composite-DTBc_FlF.js";import"./useBaseUiId-DXLRwZBq.js";import"./useCompositeListItem-B751cFSX.js";import"./useRole-B1uEXi_v.js";import"./user-profile-eFVEPEjr.js";import"./avatar-codec-CkBf2GtH.js";import"./bioforest-Df_cUMWx.js";import"./web-BmqjK__H.js";import"./amount-BQsqQYGO.js";import"./notification-inF0sq9u.js";import"./index-BseEPeeZ.js";import"./transaction-meta-CNYDuqW4.js";import"./IconDots-CDD4hFte.js";import"./IconShieldCheck-CwPcyAe5.js";import"./IconApps-9gyhbirg.js";import"./IconCoins-C061LgFB.js";import"./IconSparkles-DwAdKjsI.js";import"./IconTrash-D8YT7E4-.js";import"./transaction-list-CTZQOwHW.js";import"./transaction-item-B2zVg_ug.js";import"./IconRefresh-OMqQCPFO.js";import"./swipeable-tabs-Ba4nfsqI.js";import"./swiper-5M8uE_0Q.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
