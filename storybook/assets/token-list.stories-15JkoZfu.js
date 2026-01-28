import{j as c}from"./iframe-0iuA4WOb.js";import{a as p}from"./token-item-DELVEElI.js";import{G as l}from"./LoadingSpinner-BkCrcB5e.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BQcnItLc.js";import"./hologram-canvas-Gh83wktJ.js";import"./chain-icon-DV7Ok3xi.js";import"./service-zSifutxU.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CxUY9Iq-.js";import"./address-display-CrWJmLEb.js";import"./web-CxfalgsD.js";import"./createReactComponent-SHUP81T7.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DcwoRKNa.js";import"./index-CsHIUSRp.js";import"./IconCheck-CWEpuQ2X.js";import"./IconChevronDown-DZuudFzD.js";import"./IconSettings-DpmNXe_O.js";import"./wallet-selector-3H32TX1C.js";import"./wallet-mini-card-3K1viqFZ.js";import"./token-icon-CuCZIB2N.js";import"./amount-display-CSP2eA3-.js";import"./NumberFlow-client-48rw3j0J-BkwGQcf-.js";import"./animated-number-BghPDwGH.js";import"./time-display-CDbcGBGR.js";import"./service-status-alert-BA4yhh7k.js";import"./IconX-CuCMqZdl.js";import"./IconAlertTriangle-owWcsMEE.js";import"./IconLock-BeXPpY5C.js";import"./button-B2WLzXQc.js";import"./useButton-x5-Fe-Gq.js";import"./useRenderElement-Rk6mAKsh.js";import"./dropdown-menu-DUkPEWPO.js";import"./index-DZ855RaS.js";import"./index-5wS2CoCW.js";import"./composite-Bv9_SMPi.js";import"./useBaseUiId-C_smqBQM.js";import"./useCompositeListItem-2j1C-Lc-.js";import"./useRole-BCMzPMqP.js";import"./user-profile-CSClXrbc.js";import"./avatar-codec-BEN9zsDp.js";import"./bioforest-1jSlEcT_.js";import"./web-BIwrIVR1.js";import"./amount-BQsqQYGO.js";import"./notification-hYVl5pFj.js";import"./index-D3lOK7Ix.js";import"./transaction-meta-QqcWi-AV.js";import"./IconDots-3rVIRe2W.js";import"./IconShieldCheck-BgVpSJG-.js";import"./IconApps-D3pcBEhe.js";import"./IconCoins-B1-dz89A.js";import"./IconSparkles-Eq1F0adT.js";import"./IconTrash-iv926Bb9.js";import"./transaction-list-zZxkTHyn.js";import"./transaction-item-zadrWJHu.js";import"./IconRefresh-DclP0r8p.js";import"./swipeable-tabs-TYw5DCIa.js";import"./swiper-CJ4c6xzQ.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
