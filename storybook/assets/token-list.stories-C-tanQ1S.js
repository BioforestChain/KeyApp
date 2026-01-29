import{j as c}from"./iframe-CB9gxppC.js";import{a as p}from"./token-item-BpIAJw5K.js";import{G as l}from"./LoadingSpinner-Bg53SXIP.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Ftz5217R.js";import"./hologram-canvas-CWAVwhDW.js";import"./chain-icon-D4TkTtL4.js";import"./service-CJdFA54j.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BZNFIg4L.js";import"./address-display-BPbOYdKj.js";import"./web-BVcJqMwG.js";import"./createReactComponent-Cp_ulBle.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DtPm63V2.js";import"./index-BLpI68M-.js";import"./IconCheck-C-thbtK8.js";import"./IconChevronDown-Dh4mxj9G.js";import"./IconSettings-BiVKHi8W.js";import"./wallet-selector-BlQscs8W.js";import"./wallet-mini-card-D9i56m2i.js";import"./token-icon-rMgx-S1j.js";import"./amount-display-DnkHAawt.js";import"./NumberFlow-client-48rw3j0J-CZ6M_hL1.js";import"./animated-number-DHbZrrfA.js";import"./time-display-pUD1Jx8l.js";import"./service-status-alert-CHF-Z-XF.js";import"./IconX-DSCkmrmv.js";import"./IconAlertTriangle-WTDp7b7T.js";import"./IconLock-BbxnbNBS.js";import"./button-C58XCBmi.js";import"./useButton-Dni_6Fur.js";import"./useRenderElement-B2Gjv0YI.js";import"./dropdown-menu-DOtsBowI.js";import"./index-DPuvDyK5.js";import"./index-HVGYi6To.js";import"./composite-BpYqf45l.js";import"./useBaseUiId-BVpbxHpl.js";import"./useCompositeListItem-C687Ctsh.js";import"./useRole-CZRUS6rz.js";import"./user-profile-CyOksqac.js";import"./avatar-codec-D6HEH34O.js";import"./bioforest-CApsUA28.js";import"./web-DIz1t5iu.js";import"./amount-BQsqQYGO.js";import"./notification-CkqKApwK.js";import"./index-o_w2d0pj.js";import"./transaction-meta-DCFbYm9a.js";import"./IconDots-aZjwTDhg.js";import"./IconShieldCheck-Dmxt03qF.js";import"./IconApps-F_821UPT.js";import"./IconCoins-miwTnbKk.js";import"./IconSparkles-C4OEbK20.js";import"./IconTrash-DHs26SAy.js";import"./transaction-list-aU-zfh0T.js";import"./transaction-item-BblOiY2w.js";import"./IconRefresh-CvjqfA0r.js";import"./swipeable-tabs-BrkwGHXK.js";import"./swiper-Brs_M1ts.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
