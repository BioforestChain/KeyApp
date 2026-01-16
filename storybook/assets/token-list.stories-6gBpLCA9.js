import{j as c}from"./iframe-BNCIUlAe.js";import{a as p}from"./token-item-C_qgaMuc.js";import{G as l}from"./index-BRPC8zcC.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-Bw0OfOwH.js";import"./hologram-canvas-BUdzdxsm.js";import"./chain-icon-DEja4DN1.js";import"./address-display-BGwzauoD.js";import"./web-DJ2Rt7h1.js";import"./createReactComponent-u1gFnxbc.js";import"./breakpoint-C1BNOfKS.js";import"./schemas-B18CumQY.js";import"./useTranslation-CHdy0Kqt.js";import"./index-2cl3VLgZ.js";import"./IconCheck-C7gv-ubI.js";import"./IconChevronDown-CP63t4xf.js";import"./IconSettings-Vm-0dxTn.js";import"./wallet-selector-Bw5oi0U4.js";import"./wallet-mini-card-D_AGGuxb.js";import"./token-icon-Dfb8OM83.js";import"./amount-display-CXy4nwL6.js";import"./NumberFlow-client-48rw3j0J-B_zJceWh.js";import"./animated-number-f9Iugavi.js";import"./time-display-zpWhuF4g.js";import"./copyable-text-BjQ5ukV1.js";import"./IconX-DWe4KS1g.js";import"./button-BVKjMiYf.js";import"./useButton-Dn4VLpjI.js";import"./useRenderElement-eznI4fyj.js";import"./dropdown-menu-l7WQr7Uu.js";import"./index-BmaYcUR5.js";import"./index-CvWucazW.js";import"./composite-C8PGNN4i.js";import"./useBaseUiId-B7eSfG96.js";import"./useCompositeListItem-COUw_nXV.js";import"./useRole-Dmf5ckgH.js";import"./user-profile-BdQXHsJz.js";import"./index-D0E7N0oa.js";import"./bioforest-D9p3ncSz.js";import"./avatar-codec-oZfUTenm.js";import"./web-C2Bc7E60.js";import"./amount-BQsqQYGO.js";import"./notification-Nwghx8mm.js";import"./index-UAKLyyZC.js";import"./transaction-meta-djW5pXTM.js";import"./IconDots-lW32uzNI.js";import"./IconShieldCheck-d-aFV-55.js";import"./IconApps-BDmim8Q0.js";import"./IconCoins-UfPgT35w.js";import"./IconSparkles-C4BI1xKl.js";import"./IconLock-B9N1Itrb.js";import"./IconTrash-DkRTXKUF.js";import"./transaction-list-D724Eshu.js";import"./transaction-item-DUZ4KBWr.js";import"./IconRefresh-Bak8gaqe.js";import"./swipeable-tabs-BMlBrlrW.js";import"./swiper-C-43vtSV.js";import"./IconAlertTriangle-CghKBNGR.js";const be={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ye=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ye as __namedExportsOrder,be as default};
