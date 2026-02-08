import{j as c}from"./iframe-BEhoETRs.js";import{a as p}from"./token-item-Du0TVdo2.js";import{G as l}from"./LoadingSpinner-aNAjuFjE.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DdxpmYwP.js";import"./hologram-canvas-CjAcwg7r.js";import"./chain-icon-qO1ON2tr.js";import"./service-CDiI-fD3.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Ddkx2ZQy.js";import"./address-display-DMJKdJHh.js";import"./web-DrjvvRa-.js";import"./createReactComponent-BAja8KbA.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DF7at6qm.js";import"./index-Bg0mJUBe.js";import"./IconCheck-De0gzBs0.js";import"./IconChevronDown-BWzoLYtM.js";import"./IconSettings-BVOAzeg2.js";import"./wallet-selector-CP9mVtIN.js";import"./wallet-mini-card-Bib9UmTa.js";import"./token-icon-D_3yqou-.js";import"./amount-display-Dxt1QGxN.js";import"./NumberFlow-client-48rw3j0J-BkouvZPU.js";import"./animated-number-BCxYrdEa.js";import"./time-display-BfKAldTd.js";import"./service-status-alert-XLpkMDQy.js";import"./IconX-BU96QDJd.js";import"./IconAlertTriangle-B1zhBK0I.js";import"./IconLock-79qezLDT.js";import"./item-DHyL3iZK.js";import"./button-CV3O5RAP.js";import"./useButton-DNALwdlJ.js";import"./useRenderElement-D_Fh2Swr.js";import"./dropdown-menu-HadrTopJ.js";import"./index-MQORoPFo.js";import"./index-DmFmpIhv.js";import"./composite-CBxDtPlE.js";import"./useBaseUiId-bm6mDtEa.js";import"./useCompositeListItem-DhNZ1UsD.js";import"./useRole-cEbo2Ttl.js";import"./user-profile-Bkgf40Il.js";import"./avatar-codec-CHrE0Tpo.js";import"./bioforest-BZCUPywt.js";import"./web-DA2j5JBr.js";import"./amount-BQsqQYGO.js";import"./notification-BeRTlpzL.js";import"./index-DKnKDbd1.js";import"./transaction-meta-ATv8xTuq.js";import"./IconDots-BB-CaMHZ.js";import"./IconShieldCheck-OWcH62CG.js";import"./IconApps-BSTZYFau.js";import"./IconCoins-D4Zz08sI.js";import"./IconSparkles-Bflbe_7v.js";import"./IconTrash-obeBE9DU.js";import"./transaction-list-Cur7sXfW.js";import"./transaction-item-B9W4j-5w.js";import"./IconRefresh-CJ15Plt5.js";import"./swipeable-tabs-FwyEAM--.js";import"./swiper-COo7O1fT.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
