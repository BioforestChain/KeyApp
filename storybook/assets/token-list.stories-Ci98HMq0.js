import{j as c}from"./iframe-BI2yxCKi.js";import{a as p}from"./token-item-Hazbn-Hk.js";import{G as l}from"./LoadingSpinner-6YF0wV6j.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-B9BVx8i1.js";import"./hologram-canvas-DYcTruOR.js";import"./chain-icon-CdZCo0UC.js";import"./index-Br8wWO4_.js";import"./schemas-B18CumQY.js";import"./address-display-QOMbRQIr.js";import"./web-BS7mXGqI.js";import"./createReactComponent-CXoWQxjz.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-CJAVMPUn.js";import"./index-CIM2jmAx.js";import"./IconCheck-BVObr8No.js";import"./IconChevronDown-5LwMUj09.js";import"./IconSettings-YdrgFoOu.js";import"./wallet-selector-lfdxffgq.js";import"./wallet-mini-card-C3GINsDl.js";import"./token-icon-CjA3hnM9.js";import"./amount-display-BuA4dnXJ.js";import"./NumberFlow-client-48rw3j0J-YE3F8saz.js";import"./animated-number-CAVH0tdd.js";import"./time-display-BWfnW_5P.js";import"./copyable-text-TWAmm-aP.js";import"./IconX-BsTaB4B9.js";import"./button-CMgAABAS.js";import"./useButton-Z1ioppNI.js";import"./useRenderElement-CM9yFL3n.js";import"./dropdown-menu-D-foudJp.js";import"./index-BtDqtYDD.js";import"./index-BJvbeWjC.js";import"./composite-DB3G8UdO.js";import"./useBaseUiId-BL_g7GBP.js";import"./useCompositeListItem-D2bLTXQB.js";import"./useRole-DJyqc5yz.js";import"./user-profile-Dzwd19KS.js";import"./index-D0E7N0oa.js";import"./bioforest-CKYD5h3O.js";import"./avatar-codec-Cqc11mkJ.js";import"./web-Bu3Nj0RP.js";import"./amount-BQsqQYGO.js";import"./notification-D6eu7TS6.js";import"./index-DEV6RnEr.js";import"./transaction-meta-B1OgDJDK.js";import"./IconDots-Dy12A-Iy.js";import"./IconShieldCheck-CfVeWEzx.js";import"./IconApps-C0dAEInE.js";import"./IconCoins-CMXp6P8x.js";import"./IconSparkles-DAaAc9fQ.js";import"./IconLock-DL1vzu_9.js";import"./IconTrash-C4lkmK4m.js";import"./transaction-list-Bbxp8HEM.js";import"./transaction-item-Dp52Gc1h.js";import"./IconRefresh-kvT-7tNj.js";import"./swipeable-tabs-DoidGJtQ.js";import"./swiper-dBhjW7IB.js";import"./IconAlertTriangle-BcTnX7BN.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Ce=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,Ce as __namedExportsOrder,ye as default};
