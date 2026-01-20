import{j as c}from"./iframe-BWFzn1lJ.js";import{a as p}from"./token-item-DeaHpBBN.js";import{G as l}from"./index-erJUkPmc.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-BJIWjoWn.js";import"./hologram-canvas-Cz6PSUUh.js";import"./chain-icon-yREwHbPw.js";import"./index-Cx9aE2aa.js";import"./schemas-B18CumQY.js";import"./address-display-U6iPI6Wr.js";import"./web-CDZY9kGp.js";import"./createReactComponent-6mQvn9h0.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-C2DDmKBj.js";import"./index-v2GAUope.js";import"./IconCheck-DIPf9SBz.js";import"./IconChevronDown-BwAws7Dq.js";import"./IconSettings-DU1heim6.js";import"./wallet-selector-kzOIwSSL.js";import"./wallet-mini-card-CQLZJRlJ.js";import"./token-icon-CE8DO9x1.js";import"./amount-display-BGHzgPw8.js";import"./NumberFlow-client-48rw3j0J-CKI16aWZ.js";import"./animated-number-DUoRJzdg.js";import"./time-display-QnFWTUGM.js";import"./copyable-text-CzUkiTjt.js";import"./IconX-Btv8elgZ.js";import"./button-CIt9T2um.js";import"./useButton-D29ukeu0.js";import"./useRenderElement-USN4lyDD.js";import"./dropdown-menu-BpboKK9E.js";import"./index-Br3vEGOu.js";import"./index-C2LoEiDv.js";import"./composite-D3D-95BS.js";import"./useBaseUiId-lUH9_7Y2.js";import"./useCompositeListItem-DdLe731d.js";import"./useRole-DU9I_svJ.js";import"./user-profile-B_7KoQqP.js";import"./index-D0E7N0oa.js";import"./bioforest-B8KXXzKH.js";import"./avatar-codec-sXKPhKHq.js";import"./web-B4yIt3Fr.js";import"./amount-BQsqQYGO.js";import"./notification-BY52Oh0z.js";import"./index-BeTmBPKj.js";import"./transaction-meta-BUSBQUB-.js";import"./IconDots-BaubUTwf.js";import"./IconShieldCheck-C7FG8Htt.js";import"./IconApps-B_NyKjEZ.js";import"./IconCoins-C9AaTK2F.js";import"./IconSparkles-BOL9BREr.js";import"./IconLock-BYrf7WXp.js";import"./IconTrash-DCJnyexA.js";import"./transaction-list-DaDXR-yH.js";import"./transaction-item-Ck6l4TPR.js";import"./IconRefresh-BtnlfOz9.js";import"./swipeable-tabs-D2DovJ6o.js";import"./swiper-C_zdC8rz.js";import"./IconAlertTriangle-DTSPf7lh.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Ce=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Ce as __namedExportsOrder,ye as default};
