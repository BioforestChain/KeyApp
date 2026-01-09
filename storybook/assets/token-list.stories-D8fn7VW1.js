import{j as c}from"./iframe-Dt-mvS9d.js";import{a as p}from"./token-item-z4k1aLk1.js";import{G as l}from"./gradient-button-5mekRODe.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-DZC4fYoz.js";import"./hologram-canvas-DrhGhET9.js";import"./chain-icon-BG7izoDN.js";import"./address-display-CY1ujTX_.js";import"./web-CYIEB8v4.js";import"./createReactComponent-Com5XDcP.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Daw7Ix_X.js";import"./index-BYpULzmI.js";import"./IconCheck-MHV0osq3.js";import"./IconChevronDown-BSOZlxWx.js";import"./IconSettings-DevaB5dx.js";import"./wallet-selector-C1ljfp1h.js";import"./wallet-mini-card-CkosKCdf.js";import"./token-icon-B9yOgUPa.js";import"./chain-config-Cy31f5Um.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-LPxyf6X8.js";import"./transaction-item-c2pqukIR.js";import"./loading-spinner-CecumNt0.js";import"./empty-state-CVSNdB-0.js";import"./skeleton-D7LN5vTW.js";import"./amount-display-BfU9Ge76.js";import"./NumberFlow-client-48rw3j0J-CGHuaBbc.js";import"./animated-number-C5YTZArn.js";import"./time-display-CfGyW9eP.js";import"./qr-code-Byoz7L0I.js";import"./index-MPaqBLz1.js";import"./icon-circle-DeN-hrrd.js";import"./error-boundary-DuxMeN9t.js";import"./IconAlertCircle-Dg-Jds9d.js";import"./IconAlertTriangle-Dnu4zFQ6.js";import"./IconCircleCheck-CZt0cfCb.js";import"./IconInfoCircle-DmKc7jpx.js";import"./button-CIITPt9X.js";import"./index-B_jtOnfb.js";import"./useButton-RW-KfbzL.js";import"./useRenderElement-BTSWYIRv.js";import"./IconDots-DN0YYadw.js";import"./IconShieldCheck-DEU4wTjk.js";import"./IconTrash-CTeBC24B.js";import"./IconCoins-BFSaY6HW.js";import"./IconSparkles-B9OcTfoe.js";import"./web-DdbTbBSl.js";import"./transaction-list-FeVgZDEG.js";import"./swipeable-tabs-7D3SJg16.js";import"./swiper-CH4WLE7V.js";import"./index-CHiPz-35.js";const de={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ge=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,ge as __namedExportsOrder,de as default};
