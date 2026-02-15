import{j as c}from"./iframe-QVsCtZB2.js";import{a as p}from"./token-item-DuBD_cpw.js";import{G as l}from"./LoadingSpinner-BshP3aJN.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BlKwtADD.js";import"./hologram-canvas-Bd3us6Vc.js";import"./chain-icon-UL41VTkN.js";import"./service-D_NcUxFK.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-D1Z15z3C.js";import"./address-display-BcrQ41jG.js";import"./web-BAVlYJab.js";import"./createReactComponent-D_3suLAK.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BAUoxyUr.js";import"./index-du3QcUno.js";import"./IconCheck-29FmJfko.js";import"./IconChevronDown-DxW8tqkE.js";import"./IconSettings-Ba_w08FO.js";import"./wallet-selector-cBgt_ykq.js";import"./wallet-mini-card-CLckAb18.js";import"./token-icon-jl74VRSH.js";import"./amount-display-ficMOKCB.js";import"./NumberFlow-client-48rw3j0J-Bc_o6jBA.js";import"./animated-number-CCKqWxky.js";import"./time-display-CmsojBez.js";import"./service-status-alert-CQJpD7DK.js";import"./IconX-1xTn_jHT.js";import"./IconAlertTriangle-Bw1LYYYi.js";import"./IconLock-CnhGG_k4.js";import"./item-CdB23mDr.js";import"./button-2XVhiOj4.js";import"./useButton-DtjTKaod.js";import"./useRenderElement-D2oz4MdE.js";import"./dropdown-menu-B-LZvPUP.js";import"./index-yRmMD5Lz.js";import"./index-DUOsdT3t.js";import"./composite-BJFu_CPW.js";import"./useBaseUiId-Bi6BAp26.js";import"./useCompositeListItem-4UJAjCaJ.js";import"./useRole-t6lzxQ-m.js";import"./user-profile-CzqYuTnF.js";import"./avatar-codec-HYsLQ2Z3.js";import"./bioforest-CUZGjkTa.js";import"./web-MaNhgTnd.js";import"./amount-BQsqQYGO.js";import"./notification-BgGM2T5M.js";import"./index-BLbO_kPl.js";import"./transaction-meta-DUKTFcr4.js";import"./IconDots-CRBQEH9Y.js";import"./IconShieldCheck-CpD5feiR.js";import"./IconApps-BGhvcaS_.js";import"./IconCoins-D02Jiuyu.js";import"./IconSparkles-m5j6F3ny.js";import"./IconTrash-XGGr1vT7.js";import"./transaction-list-DzY6yIjE.js";import"./transaction-item-DNkoh3zg.js";import"./IconRefresh-BNSzlQ-E.js";import"./swipeable-tabs-BY3a-QnJ.js";import"./swiper-CfwjRTpG.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
