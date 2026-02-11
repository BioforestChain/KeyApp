import{j as c}from"./iframe-Bu8aE4Do.js";import{a as p}from"./token-item-DIJ0SvGf.js";import{G as l}from"./LoadingSpinner-C_gSiWFW.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-JOfWIy3W.js";import"./hologram-canvas-CnSVcxwG.js";import"./chain-icon-BcndpuDU.js";import"./service-D2g8-K_c.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CRZn86EQ.js";import"./address-display-B0ice9MD.js";import"./web-6YZw0Y6u.js";import"./createReactComponent-uyF1zpS3.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-jmbQdz-f.js";import"./index-Dp2akRJL.js";import"./IconCheck-BbEW2mEM.js";import"./IconChevronDown-DWH4hZ8O.js";import"./IconSettings-AkqqVDmW.js";import"./wallet-selector-BamjS1QV.js";import"./wallet-mini-card-BE0ZNMCt.js";import"./token-icon-CGNfoov-.js";import"./amount-display-DxkZoZnY.js";import"./NumberFlow-client-48rw3j0J-DrfEIaW7.js";import"./animated-number-C14nWDJc.js";import"./time-display-CBwT_-KB.js";import"./service-status-alert-D3rGGOdZ.js";import"./IconX-B8ivnzbb.js";import"./IconAlertTriangle-B1vBsI0u.js";import"./IconLock-CkYb68-h.js";import"./item-DGKAtXgz.js";import"./button-BlZEmXrA.js";import"./useButton-CJr4SIzi.js";import"./useRenderElement-mjahtkMj.js";import"./dropdown-menu-DABAXQfO.js";import"./index-JZduLrBP.js";import"./index-CYIUXsgj.js";import"./composite-BYklEjQx.js";import"./useBaseUiId-hktS3UNJ.js";import"./useCompositeListItem-yJ3DZ-uG.js";import"./useRole-C883S6hV.js";import"./user-profile-C8NVhnhy.js";import"./avatar-codec-BxoASqbL.js";import"./bioforest-C8kfjEi0.js";import"./web-CgB3ULj9.js";import"./amount-BQsqQYGO.js";import"./notification-D7qYC29x.js";import"./index-BRq4KGCZ.js";import"./transaction-meta-B6ZqEWr5.js";import"./IconDots-Bol48aN6.js";import"./IconShieldCheck-CTg8uWoe.js";import"./IconApps-C5gO-QiK.js";import"./IconCoins-CjcUU_8P.js";import"./IconSparkles-j3dOtI5h.js";import"./IconTrash-B3ygOXfR.js";import"./transaction-list-CFq78SUh.js";import"./transaction-item-DwJayL-p.js";import"./IconRefresh-Ct1ozmwX.js";import"./swipeable-tabs-EEXo0x4h.js";import"./swiper-BK2G0TUK.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
