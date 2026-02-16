import{j as c}from"./iframe-CQyDXeRN.js";import{a as p}from"./token-item-DhdTtb_g.js";import{G as l}from"./LoadingSpinner-2K4i9Owc.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-CNch8ulj.js";import"./hologram-canvas-DsS7CLeD.js";import"./chain-icon-DWjkd9fu.js";import"./service-CfIovLRb.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CJhKOaxQ.js";import"./address-display-DIOrlbkM.js";import"./web-Bp4jzWol.js";import"./createReactComponent-FIegxF4S.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-AH4gnL6f.js";import"./index-BKVozS6Z.js";import"./IconCheck-DbkOqPUG.js";import"./IconChevronDown-0eE8cpB0.js";import"./IconSettings-CbN3pctx.js";import"./wallet-selector-CfeZ5KBG.js";import"./wallet-mini-card-ZPAjiYQc.js";import"./token-icon-Dbc-Cwu9.js";import"./amount-display-CXX3kYuM.js";import"./NumberFlow-client-48rw3j0J-DJD3gkoa.js";import"./animated-number-BLGL3nFE.js";import"./time-display-CtkkEMLj.js";import"./service-status-alert-DjzqvTp4.js";import"./IconX-DWD8tT-M.js";import"./IconAlertTriangle-BhKxt1uW.js";import"./IconLock-D8Iiyxh-.js";import"./item-Dm1eDTqP.js";import"./button-Cix4ry-z.js";import"./useButton-BWiwhMKK.js";import"./useRenderElement-CL8pDYr7.js";import"./dropdown-menu-Bi3p3Ghz.js";import"./index-DXzEAfI5.js";import"./index-DMGlzQLN.js";import"./composite-Bz6Zdimg.js";import"./useBaseUiId-CqtxzdFH.js";import"./useCompositeListItem-gp0mMsGj.js";import"./useRole-CCt9j1Dy.js";import"./user-profile-BxLAcXDJ.js";import"./avatar-codec-BSoG6CPx.js";import"./bioforest-xIvpW8yZ.js";import"./web-oHi3_NzL.js";import"./amount-BQsqQYGO.js";import"./notification-OP_IE5s0.js";import"./index-DG_LvWxd.js";import"./transaction-meta-uEF4ZF1j.js";import"./IconDots-D9xvZZWJ.js";import"./IconShieldCheck-BYMp9r7J.js";import"./IconApps-By6rOby8.js";import"./IconCoins-BKbVBMH2.js";import"./IconSparkles-nmtnYshq.js";import"./IconTrash-B8k8S0YK.js";import"./transaction-list-dwlwOrU6.js";import"./transaction-item-BpoDyE0l.js";import"./IconRefresh-B7uKwa5P.js";import"./swipeable-tabs-BPEzeePT.js";import"./swiper-DIe3Q9kB.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
