import{j as c}from"./iframe-CX7oSO9x.js";import{a as p}from"./token-item-CK-4D_p4.js";import{G as l}from"./LoadingSpinner-CFLpFE4h.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-QFB-RydZ.js";import"./hologram-canvas-o5O8qJy8.js";import"./chain-icon-BuBo_HrU.js";import"./service-DRUr7lhY.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DwWMO97-.js";import"./address-display-1iHnSdZW.js";import"./web-BFFlGZKd.js";import"./createReactComponent-DWkv_Pgi.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-C8RsGP0I.js";import"./index-D5tdIX1v.js";import"./IconCheck-DRTDR57c.js";import"./IconChevronDown-DxEDuPiJ.js";import"./IconSettings-psph6MU5.js";import"./wallet-selector-B1MjZxzm.js";import"./wallet-mini-card-B61wRQOI.js";import"./token-icon-_JScF6Kl.js";import"./amount-display-jWw7nxMi.js";import"./NumberFlow-client-48rw3j0J-8zV6y2PA.js";import"./animated-number-CvjY07TV.js";import"./time-display-CA1U3V6I.js";import"./service-status-alert-CqRAleTk.js";import"./IconX-CtVIcB9F.js";import"./IconAlertTriangle-Cp4jnjh2.js";import"./IconLock-_6-oqF0-.js";import"./button-B_XKMRG9.js";import"./useButton-Bp6-fHTd.js";import"./useRenderElement-0VVVEFHS.js";import"./dropdown-menu-7UmuEQn3.js";import"./index-DYKpCglC.js";import"./index-CMa4IkZL.js";import"./composite-BYoH9qch.js";import"./useBaseUiId-DwduatI5.js";import"./useCompositeListItem-DMZklbqH.js";import"./useRole-AylU1tF_.js";import"./user-profile-C8cX_B2P.js";import"./avatar-codec-NoExKs4w.js";import"./bioforest-j_8f7F8L.js";import"./web-CYaW-Z6u.js";import"./amount-BQsqQYGO.js";import"./notification-Oa3tudsF.js";import"./index-BlY7Yf8z.js";import"./transaction-meta-DiLozo57.js";import"./IconDots-Cks2xCEj.js";import"./IconShieldCheck-Bo76zELa.js";import"./IconApps-D5-9tumz.js";import"./IconCoins-CY1ClsRD.js";import"./IconSparkles-Bt_4c8lm.js";import"./IconTrash-BTSdg7I4.js";import"./transaction-list-BG12mbdS.js";import"./transaction-item-CGgX_nNY.js";import"./IconRefresh-CpZuSub-.js";import"./swipeable-tabs-Bo0RwIJb.js";import"./swiper-iH3ErwX4.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
