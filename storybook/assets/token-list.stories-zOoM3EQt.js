import{j as c}from"./iframe-aa7wC7o-.js";import{a as p}from"./token-item-DmrIDsuq.js";import{G as l}from"./LoadingSpinner-DOvyJVH1.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BfZWAoFm.js";import"./hologram-canvas-D37Sll60.js";import"./chain-icon-D3SjBe6l.js";import"./service-DMS6iO-M.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BHYUBV8J.js";import"./address-display-BPVIYWxU.js";import"./web-DE-tcLx9.js";import"./createReactComponent-DaLJOb4x.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BVFfo3_P.js";import"./index-CGEWXZc0.js";import"./IconCheck-BCBZUn8F.js";import"./IconChevronDown-8Fu_u1SB.js";import"./IconSettings-X3bbExFI.js";import"./wallet-selector-BuEpNEMN.js";import"./wallet-mini-card-kML8Qd6W.js";import"./token-icon-r4ebXk9x.js";import"./amount-display-s4DqHEVy.js";import"./NumberFlow-client-48rw3j0J-Bo5JbyQV.js";import"./animated-number-D0G6H7Dd.js";import"./time-display-ICeo8FiO.js";import"./service-status-alert-fpO991Jc.js";import"./IconX-Cu6txWLh.js";import"./IconAlertTriangle-DIOOwX7w.js";import"./IconLock-CKeCR-PY.js";import"./item-0hgaHj1s.js";import"./button-BVKyYsj8.js";import"./useButton-gSRRCz6S.js";import"./useRenderElement-CWkpan-B.js";import"./dropdown-menu-DAP1Yjik.js";import"./index-BomnOuEB.js";import"./index-BZjqxGRk.js";import"./composite-CzRHu-w5.js";import"./useBaseUiId-B4lbn_3F.js";import"./useCompositeListItem-ZbFjvHKl.js";import"./useRole-T9Bwns32.js";import"./user-profile-D6gR__qC.js";import"./avatar-codec-BqISCWOM.js";import"./bioforest-BHL6rKBW.js";import"./web-BvHXd6ps.js";import"./amount-BQsqQYGO.js";import"./notification-DoSM4NVj.js";import"./index-NLO_OPQ0.js";import"./transaction-meta-BL2StT4M.js";import"./IconDots-l2kZ5-eq.js";import"./IconShieldCheck-0pWPDmVs.js";import"./IconApps-DWku2-o-.js";import"./IconCoins-DDehbtGP.js";import"./IconSparkles-DW6jjlOg.js";import"./IconTrash-BuvZSssB.js";import"./transaction-list-DyXsZq2y.js";import"./transaction-item-Ci5jgcy4.js";import"./IconRefresh-D-1_trYI.js";import"./swipeable-tabs-C0QW1Y_D.js";import"./swiper-sjg7L_qq.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
