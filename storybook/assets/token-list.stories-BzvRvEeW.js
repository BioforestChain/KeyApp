import{j as c}from"./iframe-CsVGzOX8.js";import{a as p}from"./token-item-BR0D-RVB.js";import{G as l}from"./LoadingSpinner-BjTOF6b3.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BT7_YXF3.js";import"./hologram-canvas-C3qJbRPb.js";import"./chain-icon-CPYaA0nK.js";import"./service-CRC2WJtv.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CqH9nY1F.js";import"./address-display-Bi5oy_pD.js";import"./web-Cq2IN7Fa.js";import"./createReactComponent-B5Y5RZQD.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-D_ioW859.js";import"./index-z8gF-eXQ.js";import"./IconCheck-Y878BNCv.js";import"./IconChevronDown-ii0bN0Et.js";import"./IconSettings-8SXspyCE.js";import"./wallet-selector-DUhLR9aF.js";import"./wallet-mini-card-B-rilnPo.js";import"./token-icon-B3C0izTK.js";import"./amount-display-DmCOFcrF.js";import"./NumberFlow-client-48rw3j0J-Cft8Vynn.js";import"./animated-number-COmZkqHu.js";import"./time-display-pg9uyAwh.js";import"./service-status-alert-GS0m3FZk.js";import"./IconX-DnI5_H9S.js";import"./IconAlertTriangle-BZ8mbhlP.js";import"./IconLock-CrcUcdUT.js";import"./item-Dd2YZe2W.js";import"./button-Y33HfV2w.js";import"./useButton-BnEut5nZ.js";import"./useRenderElement-C9bTAUjL.js";import"./dropdown-menu-Cpb_ilQJ.js";import"./index-BbzZuGQh.js";import"./index-DY0_a4ku.js";import"./composite-DHLQl33M.js";import"./useBaseUiId-B6n2YXI7.js";import"./useCompositeListItem-Bj3DUVuG.js";import"./useRole-DpJx94tx.js";import"./user-profile-BmhxqlS4.js";import"./avatar-codec-C1X-qS2I.js";import"./bioforest-DLSYT4hh.js";import"./web-C1Ct2uzd.js";import"./amount-BQsqQYGO.js";import"./notification-BXQa8BYa.js";import"./index-BKQm51wl.js";import"./transaction-meta-JJKx_w69.js";import"./IconDots-BXMqag1g.js";import"./IconShieldCheck-Mbb1DNmF.js";import"./IconApps-BZIyL8ng.js";import"./IconCoins-nGdiAACE.js";import"./IconSparkles-BD_syzLm.js";import"./IconTrash-CHwX4974.js";import"./transaction-list-BWIDc7A0.js";import"./transaction-item-DC5981LA.js";import"./IconRefresh-tv9B9xJg.js";import"./swipeable-tabs-DGkv8LBB.js";import"./swiper-DBDutJ2b.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
