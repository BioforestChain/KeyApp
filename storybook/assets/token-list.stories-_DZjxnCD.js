import{j as c}from"./iframe-DmSIcYar.js";import{a as p}from"./token-item-UrUYqZHg.js";import{G as l}from"./LoadingSpinner-BUdIbYaf.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CpU0arF6.js";import"./hologram-canvas-CZwgqZrR.js";import"./chain-icon-N9T3Pn70.js";import"./service-BsKys642.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CbkeOq6q.js";import"./address-display-CBU2bkGI.js";import"./web-CVGV_n8w.js";import"./createReactComponent-m1MJ474U.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-5-CNWNe7.js";import"./index-CeB_thMf.js";import"./IconCheck-MSBq1LGQ.js";import"./IconChevronDown-X7egdOuf.js";import"./IconSettings-DZRGXnGT.js";import"./wallet-selector-D3oFDGrK.js";import"./wallet-mini-card-DCX0mg6h.js";import"./token-icon-CgjrdbUB.js";import"./amount-display-jye1g5Je.js";import"./NumberFlow-client-48rw3j0J-bmCfU8Ee.js";import"./animated-number-B3OR5IX6.js";import"./time-display-CI47nwju.js";import"./service-status-alert-ocIZ9fEB.js";import"./IconX-B7ih4_Hf.js";import"./IconAlertTriangle-DhbTBk6-.js";import"./IconLock-CWz8OCcS.js";import"./item-Bx1nYQ2g.js";import"./button-CjhDbb7h.js";import"./useButton-DCpgR4aa.js";import"./useRenderElement-CIdrVnLe.js";import"./dropdown-menu-B-Al2uYC.js";import"./index-B8DVLNlj.js";import"./index-BCA7thEE.js";import"./composite-Cjkd9drL.js";import"./useBaseUiId-q3NbOMR5.js";import"./useCompositeListItem-DQC_U8fy.js";import"./useRole-B-0-WgNT.js";import"./user-profile-q0bmfNXQ.js";import"./avatar-codec-CSdQZkyd.js";import"./bioforest-CL4jERvh.js";import"./web-uFFAfLVR.js";import"./amount-BQsqQYGO.js";import"./notification-CSdz_nEQ.js";import"./index-DqaBxsyB.js";import"./transaction-meta-DcXY5Sr-.js";import"./IconDots-akgvqoEz.js";import"./IconShieldCheck-CZKaQji3.js";import"./IconApps-Du78UzYn.js";import"./IconCoins-CiDbqf8N.js";import"./IconSparkles-D2Pu1h3Q.js";import"./IconTrash-Cb0_7kPP.js";import"./transaction-list-C3NadcYI.js";import"./transaction-item-Be6VuX8h.js";import"./IconRefresh-DkDqLTzO.js";import"./swipeable-tabs-Bqsqarg7.js";import"./swiper-NnmiFPYo.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
