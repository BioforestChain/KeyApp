import{j as c}from"./iframe-Dcmh7lQ9.js";import{a as p}from"./token-item-QNn7AKQf.js";import{G as l}from"./LoadingSpinner-BzqE95IK.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-xOj-d05U.js";import"./hologram-canvas-DKM7Feu_.js";import"./chain-icon-nkTsqzVE.js";import"./index-BLGLtvwY.js";import"./schemas-B18CumQY.js";import"./address-display-C85A7-zA.js";import"./web-Dc3zdOnH.js";import"./createReactComponent-DVf7QFAR.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-CXs6ROZL.js";import"./index-BzYTzJ7n.js";import"./IconCheck-VzjnAenZ.js";import"./IconChevronDown-DwW_TbZc.js";import"./IconSettings-DmdrgpPg.js";import"./wallet-selector-C-rrlp_G.js";import"./wallet-mini-card-DsDOWUCN.js";import"./token-icon-eie7jyaA.js";import"./amount-display-TmZqX0Tu.js";import"./NumberFlow-client-48rw3j0J-C1gGer7K.js";import"./animated-number-CmaNV9dB.js";import"./time-display-D2FP4i9l.js";import"./copyable-text-CUa-ypOb.js";import"./IconX-D47LZlB5.js";import"./button-CXIVLgk8.js";import"./useButton-DR8rx_gs.js";import"./useRenderElement-v8y18vJm.js";import"./dropdown-menu-CtYEc4NQ.js";import"./index-BJghxh4k.js";import"./index-C4J0r7UG.js";import"./composite-B25S_zd1.js";import"./useBaseUiId-CWl49O58.js";import"./useCompositeListItem-D3dT4n0u.js";import"./useRole-b9u3lLzx.js";import"./user-profile-CCmy6zND.js";import"./index-D0E7N0oa.js";import"./bioforest-BDygyqbZ.js";import"./avatar-codec-DelRR0Rd.js";import"./web-C5ribghG.js";import"./amount-BQsqQYGO.js";import"./notification-CEG2zgnH.js";import"./index-WseqBFmX.js";import"./transaction-meta-Bi03JIDK.js";import"./IconDots-DiJEZzQG.js";import"./IconShieldCheck-C9RZ2X7Z.js";import"./IconApps-FF19avU-.js";import"./IconCoins-6ELjlZ-R.js";import"./IconSparkles-DkQNTS3U.js";import"./IconLock-ziAKH-Db.js";import"./IconTrash-Ci_v_AdR.js";import"./transaction-list-kkkFV0ft.js";import"./transaction-item-Cw8skg57.js";import"./IconRefresh-DtRvoyR7.js";import"./swipeable-tabs-CWwR5LOP.js";import"./swiper-B-USTqQw.js";import"./IconAlertTriangle-BGPqPzB3.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
