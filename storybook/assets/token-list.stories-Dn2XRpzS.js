import{j as c}from"./iframe-CDstBDzb.js";import{a as p}from"./token-item-CnmE7tBy.js";import{G as l}from"./LoadingSpinner-CKRLkcin.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BjtCFQrZ.js";import"./hologram-canvas-BpJIAJ6j.js";import"./chain-icon-BCdAuiNt.js";import"./service-CfajPHx_.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-TAhnwOiX.js";import"./address-display-UgH4MtuB.js";import"./web-BO0aoLb3.js";import"./createReactComponent-BXjChy2x.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DtChdlRe.js";import"./index-6DqNxuEB.js";import"./IconCheck-VKUSnZOF.js";import"./IconChevronDown-DXoSdcfJ.js";import"./IconSettings-BqunQRe4.js";import"./wallet-selector-BuEekUV3.js";import"./wallet-mini-card-CQeXA0DR.js";import"./token-icon-BeGLM68C.js";import"./amount-display-DkyrXVKc.js";import"./NumberFlow-client-48rw3j0J-C0akwffI.js";import"./animated-number-D_qzL37a.js";import"./time-display-Duzpsrqr.js";import"./service-status-alert-DwkjLq5t.js";import"./IconX-BwI4SVAf.js";import"./IconAlertTriangle-BQil09vO.js";import"./IconLock-By0tM6M0.js";import"./item-DEcxslgp.js";import"./button-Bydz1ysO.js";import"./useButton-se5Y8ILU.js";import"./useRenderElement-C5ecs9bm.js";import"./dropdown-menu-BIXWdlh_.js";import"./index-CnrcIfVO.js";import"./index-DG0hXBHW.js";import"./composite-4EhkIcZS.js";import"./useBaseUiId-DRADaPy2.js";import"./useCompositeListItem-DA3su08-.js";import"./useRole-COt8zjDY.js";import"./user-profile-Bowjya44.js";import"./avatar-codec-D8sLk-Qg.js";import"./bioforest-VKGNL388.js";import"./web-B8WusLuF.js";import"./amount-BQsqQYGO.js";import"./notification-Cto7ddof.js";import"./index-DwlKY4Ls.js";import"./transaction-meta-C9fBu2Fm.js";import"./IconDots-CpjvvAag.js";import"./IconShieldCheck-BSMfq3b4.js";import"./IconApps-BCTSoYG_.js";import"./IconCoins-CJVxhjMf.js";import"./IconSparkles-wNWv5Ech.js";import"./IconTrash-DlHrPGHq.js";import"./transaction-list-Bvm-ercg.js";import"./transaction-item-A2MaYrOM.js";import"./IconRefresh-D-BIiyI5.js";import"./swipeable-tabs-DfO0VhNL.js";import"./swiper-CPPLJvii.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
