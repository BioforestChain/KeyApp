import{j as c}from"./iframe-w903NJLm.js";import{a as p}from"./token-item-DDPk4sjp.js";import{G as l}from"./LoadingSpinner-DfUtsz0v.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-dtxWp9tM.js";import"./hologram-canvas-gFc_ixeu.js";import"./chain-icon-B2GSntt-.js";import"./service-YX1D6WHD.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-_Vf8-vI5.js";import"./address-display-B4A0nPsu.js";import"./web-udW8HG2M.js";import"./createReactComponent-D__mylMG.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DUm4KrZI.js";import"./index-BlL-ueqV.js";import"./IconCheck-DfMUSKjf.js";import"./IconChevronDown-C8l85f4f.js";import"./IconSettings-BESQwq-o.js";import"./wallet-selector-BQH134Si.js";import"./wallet-mini-card-BbfNDWAs.js";import"./token-icon-D_3wGBOu.js";import"./amount-display-DW0jijrT.js";import"./NumberFlow-client-48rw3j0J-Ddy_jkDZ.js";import"./animated-number-BddZgQoh.js";import"./time-display-Sw-nQ9es.js";import"./service-status-alert-DXjG980X.js";import"./IconX-wfbyIiCE.js";import"./IconAlertTriangle-D1zn7K2o.js";import"./IconLock-CpstMj9I.js";import"./button-Co_ygT7g.js";import"./useButton-7TRUE0ZM.js";import"./useRenderElement-Al1mfPw1.js";import"./dropdown-menu-CuX4FGzH.js";import"./index-_N3U92l8.js";import"./index-DjB_dF-4.js";import"./composite-d8VOE-jm.js";import"./useBaseUiId-BtOV_3Pg.js";import"./useCompositeListItem-D3EYwzkW.js";import"./useRole-DzAgWdkh.js";import"./user-profile-BqvL_q7a.js";import"./avatar-codec-DkFCca-a.js";import"./bioforest-DqPXeYrP.js";import"./web-CBGOEIbz.js";import"./amount-BQsqQYGO.js";import"./notification-CdWSMhOd.js";import"./index-CZmD6q_r.js";import"./transaction-meta-Cv8ZMxkS.js";import"./IconDots-CISWrQiE.js";import"./IconShieldCheck-CAJQd7Pq.js";import"./IconApps-BW56f680.js";import"./IconCoins-B2GvNOml.js";import"./IconSparkles-Dx0RMVuh.js";import"./IconTrash-BNwc_d9h.js";import"./transaction-list-CR-HYCkG.js";import"./transaction-item-2QOLF-aj.js";import"./IconRefresh-h3AkOuUD.js";import"./swipeable-tabs-BmGRApyH.js";import"./swiper-DDmyy8go.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
