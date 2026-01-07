import{j as c}from"./iframe-YGgzyB6y.js";import{a as p}from"./token-item-UsanTuCu.js";import{G as l}from"./gradient-button-BrhOUTEG.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-MJRhtQjT.js";import"./hologram-canvas-BjGRfdLc.js";import"./chain-icon-BmsN0vV8.js";import"./address-display-Hjq68B6I.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-DJYaXVoL.js";import"./index-C9jnYNzc.js";import"./IconCheck-DXiHzmBL.js";import"./createReactComponent-C65dmoKK.js";import"./IconCopy-B9s_BlJh.js";import"./IconChevronDown-BFyZjn6Z.js";import"./IconSettings-DlfHUmjB.js";import"./wallet-selector-diQVuWMz.js";import"./wallet-mini-card-DsWG0aHi.js";import"./token-icon-CwOeQB-u.js";import"./amount-BQsqQYGO.js";import"./index-DOSpCLaG.js";import"./chain-config-mrrNMkBP.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-CipuqUU4.js";import"./loading-spinner-DHBIrD9T.js";import"./empty-state-73TFthc8.js";import"./skeleton-gdUfPxx4.js";import"./amount-display-VzuGZ8HF.js";import"./NumberFlow-client-48rw3j0J-CACE_QoZ.js";import"./animated-number-BqphCAAU.js";import"./time-display-DFf2PejR.js";import"./qr-code-BEiKlJjN.js";import"./index-BxAZLTKO.js";import"./icon-circle-CadSb1-Y.js";import"./error-boundary-DUbdgwux.js";import"./IconAlertCircle-kVogN0sY.js";import"./IconAlertTriangle-wlF1uuIl.js";import"./IconCircleCheck-CuMO848h.js";import"./IconInfoCircle-BuV_e2Zd.js";import"./button-cKR6cI8K.js";import"./index-B_jtOnfb.js";import"./useButton-D1UChW__.js";import"./useRenderElement-BkqhpeaF.js";import"./IconDots-COmrTEGY.js";import"./IconShieldCheck-BUZj7DGE.js";import"./IconTrash-C_NULuOr.js";import"./IconCoins-Dy9VkAtt.js";import"./IconSparkles-BSqTj7IY.js";import"./web-CjCcrg7f.js";import"./transaction-list-BlK48-vJ.js";import"./swipeable-tabs-B8Fi_1qf.js";import"./swiper-BmF-CrQg.js";import"./index-DbD0qw7Q.js";const ge={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const be=["Default","WithChange","Loading","Empty","CustomEmpty","SingleToken","ManyTokens"];export{a as CustomEmpty,o as Default,r as Empty,n as Loading,m as ManyTokens,s as SingleToken,t as WithChange,be as __namedExportsOrder,ge as default};
