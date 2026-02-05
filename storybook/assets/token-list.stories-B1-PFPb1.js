import{j as c}from"./iframe-DQCpXejB.js";import{a as p}from"./token-item-i33M-N0b.js";import{G as l}from"./LoadingSpinner-UdlPBbn8.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BlrU07oJ.js";import"./hologram-canvas-cy6tfKX-.js";import"./chain-icon-CUHzn_DF.js";import"./service-BE5RDYz9.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BtzkkEUE.js";import"./address-display-DwqOktA8.js";import"./web-CNjDOgx6.js";import"./createReactComponent-CMeOeM-a.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DYr4xtuv.js";import"./index-Bd6ew9IK.js";import"./IconCheck-dRXeSmEZ.js";import"./IconChevronDown-BlrqFM5S.js";import"./IconSettings-R-Euwrlt.js";import"./wallet-selector-Csx7buj7.js";import"./wallet-mini-card-BHHS9Imv.js";import"./token-icon-DvkeCa2H.js";import"./amount-display-CggafkMi.js";import"./NumberFlow-client-48rw3j0J-BMoRmRmR.js";import"./animated-number-BlYgbvrQ.js";import"./time-display-BRuVL0RE.js";import"./service-status-alert-Dzi16CA2.js";import"./IconX-B7wvOwO9.js";import"./IconAlertTriangle-JIITenHH.js";import"./IconLock-Dt0WuTkv.js";import"./button-qq0F5gta.js";import"./useButton-BPkXlE9s.js";import"./useRenderElement-CA-LBDhN.js";import"./dropdown-menu-CnMkjRvZ.js";import"./index-B5lL8cBf.js";import"./index-DyFPzRqL.js";import"./composite-DDxA-wVn.js";import"./useBaseUiId-CytxBk5p.js";import"./useCompositeListItem-BcwRIY03.js";import"./useRole-V6AiMHdf.js";import"./user-profile-BZMRhnPj.js";import"./avatar-codec-Dgk9fNXV.js";import"./bioforest-C6c9RKHA.js";import"./web-I-GV2K30.js";import"./amount-BQsqQYGO.js";import"./notification-Boxyu61l.js";import"./index-BeldT4CP.js";import"./transaction-meta-DCLtu36L.js";import"./IconDots-CSAyyOh8.js";import"./IconShieldCheck-BvMLyqP9.js";import"./IconApps-DD9MGBxm.js";import"./IconCoins-CJVyrr6w.js";import"./IconSparkles-y5hN6RIU.js";import"./IconTrash-B3EwJZBB.js";import"./transaction-list-DZ7FcK9W.js";import"./transaction-item-Bt4TeRw7.js";import"./IconRefresh-C6yZhb9h.js";import"./swipeable-tabs-DjN_vY86.js";import"./swiper-Bto53HdV.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
