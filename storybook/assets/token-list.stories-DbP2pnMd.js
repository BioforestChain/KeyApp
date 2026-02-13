import{j as c}from"./iframe-DWrEB2rB.js";import{a as p}from"./token-item-BT7UOQ39.js";import{G as l}from"./LoadingSpinner-rRezIg24.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Bkyy6b_U.js";import"./hologram-canvas-BNhKcRTL.js";import"./chain-icon-cg4xGQBz.js";import"./service-DkLzQ1kM.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-DHhDdbki.js";import"./address-display-HWENA0DU.js";import"./web-BGgTa46s.js";import"./createReactComponent-BRzbPcR8.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-C6SI5Kte.js";import"./index-CpjIUBSx.js";import"./IconCheck-B6mNoFa7.js";import"./IconChevronDown-JuJUAGWw.js";import"./IconSettings-jMEmSGjS.js";import"./wallet-selector-C-T9O38_.js";import"./wallet-mini-card-xhlDmoZb.js";import"./token-icon-DXRyrxfN.js";import"./amount-display-DrhjZwC9.js";import"./NumberFlow-client-48rw3j0J-DUiSaqea.js";import"./animated-number-DXnsT5eL.js";import"./time-display-Du87engk.js";import"./service-status-alert-x-HvNkDw.js";import"./IconX-Cv1qhjnn.js";import"./IconAlertTriangle-CQTyo8Pb.js";import"./IconLock-D93at38I.js";import"./item-BVw9JbSI.js";import"./button-kMHvIIDl.js";import"./useButton-C06Z_yn4.js";import"./useRenderElement-DtH1sKAG.js";import"./dropdown-menu-Vfwij1Sv.js";import"./index-BEaOHVrs.js";import"./index-NqOo93fb.js";import"./composite-Dvswa-AE.js";import"./useBaseUiId-DHI-tsdG.js";import"./useCompositeListItem-DQJ9aI3q.js";import"./useRole-xO56kNuj.js";import"./user-profile-DGhmB-vc.js";import"./avatar-codec-rtZfUUY8.js";import"./bioforest-OC-_y_vS.js";import"./web-B_Df3eRL.js";import"./amount-BQsqQYGO.js";import"./notification-CFKtrs40.js";import"./index-uHcwtmDt.js";import"./transaction-meta-C1lrTloK.js";import"./IconDots-l28-4wg7.js";import"./IconShieldCheck-Bmmigcb3.js";import"./IconApps-CPA_ODbD.js";import"./IconCoins-DxaBPJ-w.js";import"./IconSparkles-BSfzBzSZ.js";import"./IconTrash-BMR2VoHl.js";import"./transaction-list-3WVExIP6.js";import"./transaction-item-CFZwIjYZ.js";import"./IconRefresh-BNNT3IlL.js";import"./swipeable-tabs-CuyufmqS.js";import"./swiper-CXJcT8K9.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
