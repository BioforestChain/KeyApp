import{j as c}from"./iframe-SYGESj7Y.js";import{a as p}from"./token-item-Dgzqus5A.js";import{G as l}from"./LoadingSpinner-Hrlvvx2n.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Dsl6D0IU.js";import"./hologram-canvas-DyqaDJCH.js";import"./chain-icon-D8W5pT2g.js";import"./service-Cvny1la2.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CDrnOAkH.js";import"./address-display-qvskLqpj.js";import"./web-BRWXgA1g.js";import"./createReactComponent-7n0EO62A.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CIUwsVEu.js";import"./index-A7HAxnm8.js";import"./IconCheck-BDFt_Aji.js";import"./IconChevronDown-D46qMu_2.js";import"./IconSettings-BV6AzgX8.js";import"./wallet-selector-BfkTOEXw.js";import"./wallet-mini-card-BOgbW-PU.js";import"./token-icon-70kqUxAD.js";import"./amount-display-BGzW72lf.js";import"./NumberFlow-client-48rw3j0J-DAaNebHR.js";import"./animated-number-DVsVnpfO.js";import"./time-display-C7yQM--r.js";import"./service-status-alert-DoYdcddK.js";import"./IconX-DNw7IpRn.js";import"./IconAlertTriangle-OFWnB9zU.js";import"./IconLock-CUvJ4Hqh.js";import"./item-Cam7MCtJ.js";import"./button-JklywDjE.js";import"./useButton-6cTYUpA4.js";import"./useRenderElement-CC-aUpck.js";import"./dropdown-menu-9GL9m5-h.js";import"./index-DlYXCBGE.js";import"./index-C-n3Lt0j.js";import"./composite-u6A-wuA0.js";import"./useBaseUiId-yPzjnvp5.js";import"./useCompositeListItem-DFSaKLpv.js";import"./useRole-CyYGmwQ6.js";import"./user-profile-BOk9Ov4O.js";import"./avatar-codec-lv3qpvF4.js";import"./bioforest-SkJ4Z7kP.js";import"./web-Bno7gaqY.js";import"./amount-BQsqQYGO.js";import"./notification-CfHPIV4a.js";import"./index-DQnXIEY2.js";import"./transaction-meta-DMzBdO94.js";import"./IconDots-OB0sC3Qd.js";import"./IconShieldCheck-Bvz8hWRG.js";import"./IconApps-CTjo46V3.js";import"./IconCoins-DLrwpksp.js";import"./IconSparkles-t9AF1hC_.js";import"./IconTrash-BBMzOxjM.js";import"./transaction-list-DwVo_8zn.js";import"./transaction-item-Gloml25K.js";import"./IconRefresh-BVZsVsaj.js";import"./swipeable-tabs-C-v1h1yH.js";import"./swiper-BoD6tU16.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
