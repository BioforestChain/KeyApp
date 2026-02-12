import{j as c}from"./iframe-BKKGzOJ9.js";import{a as p}from"./token-item-DLgk9Yhh.js";import{G as l}from"./LoadingSpinner-dN-QOyE-.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BBIcPg-p.js";import"./hologram-canvas-CnNyt0z1.js";import"./chain-icon-DObLYkVm.js";import"./service-6XO18RSB.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BNPn19nD.js";import"./address-display-ClKDyoWb.js";import"./web-az20aKeq.js";import"./createReactComponent-CkLt9PPZ.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DhkL1aew.js";import"./index-BQbtQqVg.js";import"./IconCheck-Dg234RuK.js";import"./IconChevronDown-CPL4BFXI.js";import"./IconSettings-BrmUdmsE.js";import"./wallet-selector-D6hPHkuc.js";import"./wallet-mini-card-BxgKUB2y.js";import"./token-icon-CXzyrvLd.js";import"./amount-display-CGSHDd6a.js";import"./NumberFlow-client-48rw3j0J-BgrfNshU.js";import"./animated-number-BsWXdyCs.js";import"./time-display-Ir9nLGL6.js";import"./service-status-alert-BfBcAhja.js";import"./IconX-CEFuVlOT.js";import"./IconAlertTriangle-BWTIwlVc.js";import"./IconLock-CUxL14QZ.js";import"./item-BtJpWHIn.js";import"./button-BD3bwTsp.js";import"./useButton-CZm-aUjp.js";import"./useRenderElement-CqXEbpNC.js";import"./dropdown-menu-BBQJBUF5.js";import"./index-CbposZf3.js";import"./index-DkCih96X.js";import"./composite-D633InyB.js";import"./useBaseUiId-BCJ9FuWh.js";import"./useCompositeListItem-DwcayYkL.js";import"./useRole-BvxgGeLp.js";import"./user-profile-CzXUEYwY.js";import"./avatar-codec-DqW-7FcL.js";import"./bioforest-Dms9Dixt.js";import"./web-DLRHDpGr.js";import"./amount-BQsqQYGO.js";import"./notification-BNJDFn6p.js";import"./index-b4ZkC7eL.js";import"./transaction-meta-DB5zltig.js";import"./IconDots-jxeuxq7h.js";import"./IconShieldCheck-D6k0vu4j.js";import"./IconApps-DuOmMHgG.js";import"./IconCoins-Cex14Dw3.js";import"./IconSparkles-XV_Jdcy_.js";import"./IconTrash-BclNgy3P.js";import"./transaction-list-DJ7L6Izg.js";import"./transaction-item-DJ3q9krB.js";import"./IconRefresh-D7c6XLX-.js";import"./swipeable-tabs-DM4EcnWh.js";import"./swiper-B3peLvdF.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
