import{j as c}from"./iframe-RrmlVuYH.js";import{a as p}from"./token-item-CR-4RTap.js";import{G as l}from"./LoadingSpinner-VEE9as44.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B3IPT2Cb.js";import"./hologram-canvas-BHJGKmcy.js";import"./chain-icon-CVVedTBx.js";import"./service-CGy3mqoj.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CiAIDQqN.js";import"./address-display-Bnf6UbDs.js";import"./web-DDDC57Q0.js";import"./createReactComponent-DHZ3g0py.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-B3utfR0Z.js";import"./index-CSBs33ZL.js";import"./IconCheck-BMlQLGlz.js";import"./IconChevronDown-DJCvhh0W.js";import"./IconSettings-BixfZwXh.js";import"./wallet-selector-DyKX57ts.js";import"./wallet-mini-card-KIVcsTnO.js";import"./token-icon-BL7HRplw.js";import"./amount-display-BBztnDw9.js";import"./NumberFlow-client-48rw3j0J-D9LURy3M.js";import"./animated-number-B3Q9WnrP.js";import"./time-display-DhA9i60O.js";import"./service-status-alert-BHa-OBmh.js";import"./IconX-DoTPVNJF.js";import"./IconAlertTriangle-C9ALpprj.js";import"./IconLock-BqEYsSJe.js";import"./button-ae8kcaa_.js";import"./useButton-Bp5rxItp.js";import"./useRenderElement-C8N179Z8.js";import"./dropdown-menu-DgHx1Xxg.js";import"./index-DT_gd2Ux.js";import"./index-CgKbKqUv.js";import"./composite-BKHL0j5k.js";import"./useBaseUiId-vP0WoMSc.js";import"./useCompositeListItem-L4Jv331w.js";import"./useRole-DA9S_wrX.js";import"./user-profile-daxJB9Gc.js";import"./avatar-codec-Dnw2Y551.js";import"./bioforest-CBJPM8v_.js";import"./web-B0tZmnDe.js";import"./amount-BQsqQYGO.js";import"./notification-BL0j6uVW.js";import"./index-Bekrgtsz.js";import"./transaction-meta-BTtIYwQ-.js";import"./IconDots-C0PWOGvs.js";import"./IconShieldCheck-DCxgMX2b.js";import"./IconApps-BA_Sakm2.js";import"./IconCoins-a_7IFq4i.js";import"./IconSparkles-C7UgAK1N.js";import"./IconTrash-DqzCr4Xc.js";import"./transaction-list-O-40WSAK.js";import"./transaction-item-D9nWNL_5.js";import"./IconRefresh-C2FaGLza.js";import"./swipeable-tabs-CJVqaSdj.js";import"./swiper-BlAW6lMB.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
