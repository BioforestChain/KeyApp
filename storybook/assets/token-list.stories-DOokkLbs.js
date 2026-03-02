import{j as c}from"./iframe-DzuFRuhj.js";import{a as p}from"./token-item-DBmOcw7K.js";import{G as l}from"./LoadingSpinner-DmOAyc7O.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Bxfp9stk.js";import"./hologram-canvas-CLLGRaT2.js";import"./chain-icon-CCTPtJWR.js";import"./service-CuZl5qzz.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-fzusHZu5.js";import"./address-display-7as3xMpK.js";import"./web-B6zsnioA.js";import"./createReactComponent-CsXGsFmR.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-D40cbtz1.js";import"./index-B9F8gwoO.js";import"./IconCheck-D3UN2JkH.js";import"./IconChevronDown-CU6cRRJ1.js";import"./IconSettings-5OBBNq6e.js";import"./wallet-selector-CfHqGvW7.js";import"./wallet-mini-card-BueJkODP.js";import"./token-icon-3L29DdAq.js";import"./amount-display-7-EvnWkm.js";import"./NumberFlow-client-48rw3j0J-C4ZLpvgg.js";import"./animated-number-CNsNfY0q.js";import"./time-display-BZHnvoRH.js";import"./service-status-alert-CVa6bCfH.js";import"./IconX-BvGa7VyR.js";import"./IconAlertTriangle-aXvM_85P.js";import"./IconLock-CF_UTXyJ.js";import"./item-DU8_N0gq.js";import"./button-BOmMMcH3.js";import"./useButton-CM703ikI.js";import"./useRenderElement-DFeFw4Pv.js";import"./dropdown-menu-DQbx9ymS.js";import"./index-BiyoNnDe.js";import"./index-JOOH_QYo.js";import"./composite-CzCzaE4j.js";import"./useBaseUiId-DpLAZ9hp.js";import"./useCompositeListItem-DnJAeaB0.js";import"./useRole-BWGTettQ.js";import"./user-profile-Lst41NQC.js";import"./avatar-codec-D5lgE01V.js";import"./bioforest-B_di51J9.js";import"./web-b2QCMe4-.js";import"./amount-BQsqQYGO.js";import"./notification-Dqm-92cf.js";import"./index-CU7q0Bhq.js";import"./transaction-meta-BgHHg1_y.js";import"./IconDots-DqK4pDBR.js";import"./IconShieldCheck-DzRAjyBV.js";import"./IconApps-mxLKwY9O.js";import"./IconCoins-_TogRhcL.js";import"./IconSparkles-5VBRpMEU.js";import"./IconTrash-Y7YG19ax.js";import"./transaction-list-WGp7NNFe.js";import"./transaction-item-nWjMnonD.js";import"./IconRefresh-njXpVTPj.js";import"./swipeable-tabs-CdMFWq3T.js";import"./swiper-Bu0y6qSW.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
