import{j as c}from"./iframe-BphNANQP.js";import{a as p}from"./token-item-E6Lpligj.js";import{G as l}from"./LoadingSpinner-DaN_UD65.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-YCOzJTts.js";import"./hologram-canvas-B6cHCwMF.js";import"./chain-icon-C889DtOP.js";import"./service-4DWrGAFI.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BfrHXRlw.js";import"./address-display-r6pVRWw6.js";import"./web-CXW8ok-O.js";import"./createReactComponent-CL1v_uZJ.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-JGtij7MO.js";import"./index-DJUnhNHd.js";import"./IconCheck-AX_jaYDM.js";import"./IconChevronDown-TEG5lXC-.js";import"./IconSettings-BXetr2wU.js";import"./wallet-selector-B1TMRhvY.js";import"./wallet-mini-card-C5pKi5Rh.js";import"./token-icon-m9RHvqZZ.js";import"./amount-display-DRC61gKA.js";import"./NumberFlow-client-48rw3j0J-v745vXql.js";import"./animated-number-Dcrj3MAW.js";import"./time-display-BfH4a_k7.js";import"./service-status-alert-Cd1-rJYw.js";import"./IconX-BHdlPHHK.js";import"./IconAlertTriangle-DALuqCKV.js";import"./IconLock-DvIx6hrU.js";import"./item-Bm_vGwoy.js";import"./button-BOFlzM8N.js";import"./useButton-BOUG5YDW.js";import"./useRenderElement-CYkiPf8b.js";import"./dropdown-menu-CkJmSiXF.js";import"./index-z5Wb4NE1.js";import"./index-DJD-msx7.js";import"./composite-OkTJmhuF.js";import"./useBaseUiId-DSdI_6f2.js";import"./useCompositeListItem-CGtmUlri.js";import"./useRole-CZzVWy5S.js";import"./user-profile-Bs4gUYsQ.js";import"./avatar-codec-CgkzsOvo.js";import"./bioforest-hIibEdJr.js";import"./web-D0gRy0zv.js";import"./amount-BQsqQYGO.js";import"./notification-CS9cA9Gr.js";import"./index-DBE4gORw.js";import"./transaction-meta-crjKh_jJ.js";import"./IconDots-JOBnRTJn.js";import"./IconShieldCheck-CZp3g1cl.js";import"./IconApps-YdJA-ZSP.js";import"./IconCoins-BgLxnIyT.js";import"./IconSparkles-D-q7kU00.js";import"./IconTrash-Dceqk1nD.js";import"./transaction-list-C7ohR6pV.js";import"./transaction-item-CHjaZglT.js";import"./IconRefresh-kF4vAGqF.js";import"./swipeable-tabs-B8hPMa7G.js";import"./swiper-DGnRr1zP.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
