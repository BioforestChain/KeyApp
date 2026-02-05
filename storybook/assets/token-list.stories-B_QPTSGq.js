import{j as c}from"./iframe-CtleeSHV.js";import{a as p}from"./token-item-xL11KHgE.js";import{G as l}from"./LoadingSpinner-DVgw1XYg.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B8sqoIB8.js";import"./hologram-canvas-CdEG0yw7.js";import"./chain-icon-B4ivJZ93.js";import"./service-DAAFi3Pi.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-D6i6n4zV.js";import"./address-display-BpdMXTa5.js";import"./web-DrTXeCPV.js";import"./createReactComponent-43mkGQ7G.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BuScmFrn.js";import"./index-Nvskhkzv.js";import"./IconCheck-BIvyKCEM.js";import"./IconChevronDown-BwQoa0lS.js";import"./IconSettings-DXzo1cF-.js";import"./wallet-selector-DARoAsUm.js";import"./wallet-mini-card-Cil4YLDI.js";import"./token-icon-Wq6mz2rg.js";import"./amount-display-D-ykmZ_L.js";import"./NumberFlow-client-48rw3j0J-D3TNIbZI.js";import"./animated-number-C47VJFnh.js";import"./time-display-DcdJaP09.js";import"./service-status-alert-BePfZPC5.js";import"./IconX-gBb1i3ad.js";import"./IconAlertTriangle-Ct-LMASc.js";import"./IconLock-DIF7u3zG.js";import"./button-DI7m9c8N.js";import"./useButton-yK3-RJv8.js";import"./useRenderElement-D2Hgm0s_.js";import"./dropdown-menu-D51H8t4S.js";import"./index-CyXBOrhB.js";import"./index-C4rpdars.js";import"./composite-DyRQ0agZ.js";import"./useBaseUiId-D2tP_45i.js";import"./useCompositeListItem-A9DvhKYX.js";import"./useRole-7EqLOtLv.js";import"./user-profile-CVoJ0M4v.js";import"./avatar-codec-CPiuCmfU.js";import"./bioforest-BOqmhQ05.js";import"./web-DwkfIwza.js";import"./amount-BQsqQYGO.js";import"./notification-8gHKEgqw.js";import"./index-DVI5iBgO.js";import"./transaction-meta-DtQE4nc-.js";import"./IconDots-DSTVj8on.js";import"./IconShieldCheck-B60ZQGDJ.js";import"./IconApps-CGyTi-y2.js";import"./IconCoins-BlsN7d0s.js";import"./IconSparkles-CBPcyJfe.js";import"./IconTrash-CHzQzrZJ.js";import"./transaction-list-Dpbu_DU4.js";import"./transaction-item-lNt5ddua.js";import"./IconRefresh-Clel5HjX.js";import"./swipeable-tabs-DI7pti7G.js";import"./swiper-DlbnXKhT.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
