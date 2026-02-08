import{j as c}from"./iframe-VurziD4D.js";import{a as p}from"./token-item-CfbHuLFW.js";import{G as l}from"./LoadingSpinner-CjD6I-GD.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DWOXGqh4.js";import"./hologram-canvas-BongnzDW.js";import"./chain-icon-Cju_gGNK.js";import"./service-BclcoUCT.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BJ5VcxmI.js";import"./address-display-ddJVBK7p.js";import"./web-PZJn1qJD.js";import"./createReactComponent-BS068yCM.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-C6adc5kI.js";import"./index-BGIHbrTm.js";import"./IconCheck-BmvbBjIs.js";import"./IconChevronDown-DhHVwWsn.js";import"./IconSettings-BRDjFHuJ.js";import"./wallet-selector-DS5A3r7_.js";import"./wallet-mini-card-D66YPEtG.js";import"./token-icon-Dy4NpVGn.js";import"./amount-display-BKLYTgFY.js";import"./NumberFlow-client-48rw3j0J-CRNw2gnS.js";import"./animated-number-b8i4bppa.js";import"./time-display-DsGnKZt4.js";import"./service-status-alert-BtcrEKiJ.js";import"./IconX-D5uZVjq-.js";import"./IconAlertTriangle-CCarWeb-.js";import"./IconLock-HSoEnj77.js";import"./item-DHQ_qeyB.js";import"./button-BjeHNLuB.js";import"./useButton-a_aMoD7p.js";import"./useRenderElement-_mjeLhLj.js";import"./dropdown-menu-CqQb-MI3.js";import"./index-BNmJzwb_.js";import"./index-DDdoBDoy.js";import"./composite-C9PuVATI.js";import"./useBaseUiId-oUNMtFEA.js";import"./useCompositeListItem-D-_LQfyn.js";import"./useRole-D_xnVLGH.js";import"./user-profile-DyK0cvqB.js";import"./avatar-codec-DC39ldMB.js";import"./bioforest-BSWA0AKA.js";import"./web-uDbBw-TF.js";import"./amount-BQsqQYGO.js";import"./notification-DrImjiJW.js";import"./index-CMMOJmEZ.js";import"./transaction-meta-Csg1Sxzd.js";import"./IconDots-DDqKoJzc.js";import"./IconShieldCheck-O7NSSFqv.js";import"./IconApps-BZ08QFYj.js";import"./IconCoins-DXl-jOGf.js";import"./IconSparkles-TrvI1RWF.js";import"./IconTrash-D4VEUFpy.js";import"./transaction-list-DwArUTbR.js";import"./transaction-item-BDn-1PxU.js";import"./IconRefresh-C4L5hmw1.js";import"./swipeable-tabs-Cu9CEoAC.js";import"./swiper-BnEGyTBd.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
