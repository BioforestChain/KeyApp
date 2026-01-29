import{j as c}from"./iframe-BsT3irWX.js";import{a as p}from"./token-item-FEGp14dO.js";import{G as l}from"./LoadingSpinner-CV8PXjfV.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DHsY9k3a.js";import"./hologram-canvas-Bd-aLRnY.js";import"./chain-icon-CvGbhoK9.js";import"./service-By45kHDR.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BqppQbLg.js";import"./address-display-BTU2pyZQ.js";import"./web-gvWQv4__.js";import"./createReactComponent-BPM5AwPk.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BS7MhSBe.js";import"./index-BTOVhjfc.js";import"./IconCheck-Jz2m-eM5.js";import"./IconChevronDown-CHkGt5r0.js";import"./IconSettings-D8lrmBD7.js";import"./wallet-selector-_7F_qJ9l.js";import"./wallet-mini-card-C2IRojFz.js";import"./token-icon-Ch-D35TR.js";import"./amount-display-DvldDJBv.js";import"./NumberFlow-client-48rw3j0J-DIuDxZKn.js";import"./animated-number-CEUaSAIs.js";import"./time-display-J5AHozKN.js";import"./service-status-alert-DP8Z-WEy.js";import"./IconX-BIvps7h2.js";import"./IconAlertTriangle-CP1YxeGA.js";import"./IconLock-CayHOQS5.js";import"./button-DZGyMPl2.js";import"./useButton-LfJKgF-J.js";import"./useRenderElement-nb0eEMeV.js";import"./dropdown-menu-DcQmOYut.js";import"./index-BnOQ3Lli.js";import"./index-DMuZ0OI8.js";import"./composite-BGdJCpJs.js";import"./useBaseUiId-CXaZW6SJ.js";import"./useCompositeListItem-BzQfJuei.js";import"./useRole-CTwxpCy_.js";import"./user-profile-B9Ty9LM6.js";import"./avatar-codec-BoUl6JYW.js";import"./bioforest--q0H36Ma.js";import"./web-C24Ub8OP.js";import"./amount-BQsqQYGO.js";import"./notification-CrteHzf_.js";import"./index-IqPV5r9Y.js";import"./transaction-meta-Cu_EfTSB.js";import"./IconDots-8Plvbm0R.js";import"./IconShieldCheck-CmrdvvhX.js";import"./IconApps-DxK4ecKX.js";import"./IconCoins-7K3ChFCw.js";import"./IconSparkles-BSlm_MZA.js";import"./IconTrash-DkXS3mKX.js";import"./transaction-list-DsObMjbx.js";import"./transaction-item-DmE2V_z7.js";import"./IconRefresh-vkeXOBrf.js";import"./swipeable-tabs-C3I258HS.js";import"./swiper-CfW0_lQf.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
