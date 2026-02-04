import{j as c}from"./iframe-CzIoh2oq.js";import{a as p}from"./token-item-DUY_goBn.js";import{G as l}from"./LoadingSpinner-CiUslrw7.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BPkW3Akv.js";import"./hologram-canvas-CArWqrwk.js";import"./chain-icon-BmjbEMt4.js";import"./service-BRdBN9PZ.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-4DF7Sj97.js";import"./address-display-DiqMqWog.js";import"./web-BeGEqsbm.js";import"./createReactComponent-CXeMcnvW.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-DuWlJSAe.js";import"./index-DlDIxsxW.js";import"./IconCheck-BDs0o1A3.js";import"./IconChevronDown-BD51DC1w.js";import"./IconSettings-cwoORvFH.js";import"./wallet-selector-CNo-0XWs.js";import"./wallet-mini-card-fwkgGYfI.js";import"./token-icon-CXRn0XEs.js";import"./amount-display-jTTLveam.js";import"./NumberFlow-client-48rw3j0J-CUT3WRZS.js";import"./animated-number-gRK6TNC2.js";import"./time-display-cHmo67K-.js";import"./service-status-alert-Cqvyj5hh.js";import"./IconX-C9QEV0Hm.js";import"./IconAlertTriangle-BoGWq9dA.js";import"./IconLock-Dp0Ur4gR.js";import"./button-DCLwnUQS.js";import"./useButton-BdmPyv8M.js";import"./useRenderElement-CeNVTP9O.js";import"./dropdown-menu-DStKiRk5.js";import"./index-BCRY6PLH.js";import"./index-B7c5tLOz.js";import"./composite-gCjSiYQL.js";import"./useBaseUiId-CpKXT3wN.js";import"./useCompositeListItem-BMcGoEMy.js";import"./useRole-BndPRyNS.js";import"./user-profile-BDAi1qka.js";import"./avatar-codec-cGkzPN8Q.js";import"./bioforest-BKObbNFn.js";import"./web-CqX31nrX.js";import"./amount-BQsqQYGO.js";import"./notification-Cc_BJP2u.js";import"./index-Cuj_uScy.js";import"./transaction-meta-DL41Tddy.js";import"./IconDots-BDJS87uo.js";import"./IconShieldCheck-udMbmg7W.js";import"./IconApps-CrqV8tR8.js";import"./IconCoins-CaZA8s7z.js";import"./IconSparkles-Bk5vMJLP.js";import"./IconTrash-BC17yusu.js";import"./transaction-list-DzVxdP2u.js";import"./transaction-item-hryPwHNT.js";import"./IconRefresh-BGTujIxO.js";import"./swipeable-tabs-DIgCF6ub.js";import"./swiper-D9MsVlyC.js";const Ce={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
