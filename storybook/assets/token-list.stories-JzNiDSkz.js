import{j as c}from"./iframe-DP2WwkEK.js";import{a as p}from"./token-item-Bpd48NsY.js";import{G as l}from"./LoadingSpinner-CKAsVYyD.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Bt3BfZYW.js";import"./hologram-canvas-CEeC1_hY.js";import"./chain-icon-CuwEql4x.js";import"./index-C9Fec6lp.js";import"./schemas-B18CumQY.js";import"./address-display-CveFfeTt.js";import"./web-Bt-WgROb.js";import"./createReactComponent-B9zKjBQW.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-D56OS28U.js";import"./index-B3ErpZrp.js";import"./IconCheck-ByzzR-xm.js";import"./IconChevronDown-Ca4So856.js";import"./IconSettings-B-6Y1Vey.js";import"./wallet-selector-D-iysE6X.js";import"./wallet-mini-card-Ds2brCqH.js";import"./token-icon-5_rBzlOM.js";import"./amount-display-BO2LBxjd.js";import"./NumberFlow-client-48rw3j0J-B1amY8-Z.js";import"./animated-number-CI5dpkcx.js";import"./time-display-CL96gpQM.js";import"./copyable-text-7ImiNVlV.js";import"./IconX-DwKkd_DL.js";import"./button-DkzmP_wT.js";import"./useButton-DbPtD0Db.js";import"./useRenderElement-CTFMrgbn.js";import"./dropdown-menu-xK0bc3_x.js";import"./index-D7q12DjP.js";import"./index-BBUus08y.js";import"./composite-CbEqZqwP.js";import"./useBaseUiId-BUO9XNIC.js";import"./useCompositeListItem-D38K7dV8.js";import"./useRole-DWwCW4Te.js";import"./user-profile-BcdT9kbr.js";import"./index-D0E7N0oa.js";import"./bioforest-B8KXXzKH.js";import"./avatar-codec-sXKPhKHq.js";import"./web-DpenQz7b.js";import"./amount-BQsqQYGO.js";import"./notification-C81mJ_5T.js";import"./index-BgynVEcu.js";import"./transaction-meta-DTHRoAxH.js";import"./IconDots-QblRZhpA.js";import"./IconShieldCheck-Zxv9K2bk.js";import"./IconApps-DheENsy7.js";import"./IconCoins-D2q5RZ2D.js";import"./IconSparkles-CnnFvCUX.js";import"./IconLock-D0JzPiP3.js";import"./IconTrash-tIMs8KzZ.js";import"./transaction-list-BzdtNlMa.js";import"./transaction-item-jJYqg2Lv.js";import"./IconRefresh-DJgIlVYK.js";import"./swipeable-tabs-9cE3OB78.js";import"./swiper-BEsTNAvW.js";import"./IconAlertTriangle-Bk27ifne.js";const ye={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},n={args:{tokens:[],loading:!0}},r={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
