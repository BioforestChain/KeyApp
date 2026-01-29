import{j as c}from"./iframe-DDpXk3xY.js";import{a as p}from"./token-item-B5xDBbsa.js";import{G as l}from"./LoadingSpinner-BZ2G_R6g.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-QNiyuS_F.js";import"./hologram-canvas-C7AzAjEO.js";import"./chain-icon-ZBW_orwb.js";import"./service-Bn7AeIKQ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BN6xqWKL.js";import"./address-display-BWFwE-E_.js";import"./web-Bi427Ih9.js";import"./createReactComponent-CIuGSuyN.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-pIiPgpqY.js";import"./index-Crm4t20I.js";import"./IconCheck-oYQn1eoJ.js";import"./IconChevronDown-BYpKzdHH.js";import"./IconSettings-2liuaKNm.js";import"./wallet-selector-CvdRj9IS.js";import"./wallet-mini-card-CTf9FeCF.js";import"./token-icon-SKWpetXv.js";import"./amount-display-CDN_0SOe.js";import"./NumberFlow-client-48rw3j0J-B6ir8eSF.js";import"./animated-number-CqmamUvm.js";import"./time-display-KQbsmDoD.js";import"./service-status-alert-BChcHP14.js";import"./IconX-CS7L28DK.js";import"./IconAlertTriangle-DzfoFwU3.js";import"./IconLock-Cy6rpqge.js";import"./button-DVjwaLg7.js";import"./useButton-Tkl4vm5U.js";import"./useRenderElement-C37q5w6L.js";import"./dropdown-menu-Cb2xcjOj.js";import"./index-C52N-TnH.js";import"./index-DM-iJ10R.js";import"./composite-BFQUOktD.js";import"./useBaseUiId-Bs3g3dOu.js";import"./useCompositeListItem-B43Ci8K1.js";import"./useRole-Be-nYm4W.js";import"./user-profile-Dve6_0lJ.js";import"./avatar-codec-Byq6V-zy.js";import"./bioforest-B0k2ODEM.js";import"./web-66kZx7dJ.js";import"./amount-BQsqQYGO.js";import"./notification-Dc2L7D-k.js";import"./index-DiWtt6s-.js";import"./transaction-meta-DabclF5i.js";import"./IconDots-BbzIREa8.js";import"./IconShieldCheck-BYwtaFQ2.js";import"./IconApps-BXpHB24U.js";import"./IconCoins-DysfZ70r.js";import"./IconSparkles-DElbf1gc.js";import"./IconTrash-BEq8-qKj.js";import"./transaction-list-b90dtPgg.js";import"./transaction-item-CdGVBsfC.js";import"./IconRefresh-CCTDkege.js";import"./swipeable-tabs-CAxXYzre.js";import"./swiper-CtpbRIC-.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
