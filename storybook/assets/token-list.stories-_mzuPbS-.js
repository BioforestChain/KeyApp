import{j as c}from"./iframe-CtUqWLzc.js";import{a as p}from"./token-item-ikzMpb0D.js";import{G as l}from"./LoadingSpinner-CThpDbO_.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-yQJkXuEU.js";import"./hologram-canvas-DIagU4Re.js";import"./chain-icon-CtTU1ZV5.js";import"./service-0SsM670I.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-L4TIyYgn.js";import"./address-display-CVYA6ti-.js";import"./web-Iwva3Zqr.js";import"./createReactComponent-CBZhxdaG.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CJoXfpZJ.js";import"./index-CJ9NiFaV.js";import"./IconCheck-D8ZutlgY.js";import"./IconChevronDown-DVUyIil7.js";import"./IconSettings-Cy_jeyjm.js";import"./wallet-selector-BybYdlR3.js";import"./wallet-mini-card-BuC7v--x.js";import"./token-icon-BbM1PrEB.js";import"./amount-display-BX679Aq3.js";import"./NumberFlow-client-48rw3j0J-qlHgEvTY.js";import"./animated-number-bOZEnqkR.js";import"./time-display-nV7u3_kH.js";import"./service-status-alert-C4f18H5D.js";import"./IconX-y3Cbcg2d.js";import"./IconAlertTriangle-BND1G0Ll.js";import"./IconLock-Dly7oz8K.js";import"./button-BNQv8uul.js";import"./useButton-LUbipbPX.js";import"./useRenderElement-BsBJydIk.js";import"./dropdown-menu-BclVMdcg.js";import"./index-C56QssN3.js";import"./index-ClMSgGLg.js";import"./composite-BW6r0q5S.js";import"./useBaseUiId-feX8R1ba.js";import"./useCompositeListItem-BbxHiZSh.js";import"./useRole-D73rK82m.js";import"./user-profile-CDRPtg6G.js";import"./avatar-codec-Bct8CGiW.js";import"./bioforest-Dm8Qyfpp.js";import"./web-Cd0V0FW-.js";import"./amount-BQsqQYGO.js";import"./notification-C9xz3Xlc.js";import"./index-CkyK164j.js";import"./transaction-meta-D3FPUGD3.js";import"./IconDots-Bi56KxJq.js";import"./IconShieldCheck-DMDjPVGe.js";import"./IconApps-CVPLLe8h.js";import"./IconCoins-DrzlwMXJ.js";import"./IconSparkles-BjmO-duQ.js";import"./IconTrash-_4YC5v1V.js";import"./transaction-list-D0q8Ho_2.js";import"./transaction-item-DMR7S8_p.js";import"./IconRefresh-7igsIl24.js";import"./swipeable-tabs-BDxUvOD_.js";import"./swiper-fJnGXoiL.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
