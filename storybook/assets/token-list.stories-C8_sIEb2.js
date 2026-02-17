import{j as c}from"./iframe-dO2EN605.js";import{a as p}from"./token-item-scgVCTFk.js";import{G as l}from"./LoadingSpinner-C1kwZdQs.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DdGv_j7k.js";import"./hologram-canvas-DtWNGV_U.js";import"./chain-icon-C34JGdBQ.js";import"./service-DVw_NIqC.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C2wjCcMH.js";import"./address-display-D_SzGijn.js";import"./web-C4zgUJid.js";import"./createReactComponent-Bhrjr7p9.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-Ck-b1HK6.js";import"./index-DqrAflbm.js";import"./IconCheck-Cy0-eQdz.js";import"./IconChevronDown-BgJ0OQFq.js";import"./IconSettings-BgWP5kw1.js";import"./wallet-selector-DDqlVDlA.js";import"./wallet-mini-card-CO5g2QPb.js";import"./token-icon-D_GQBY0n.js";import"./amount-display-DGCs5_tX.js";import"./NumberFlow-client-48rw3j0J-COpJm4tA.js";import"./animated-number-B4HvtmQC.js";import"./time-display-RnicvuRp.js";import"./service-status-alert-Bzbg6i6w.js";import"./IconX-DNdAWDg6.js";import"./IconAlertTriangle-BaKNLH8d.js";import"./IconLock-ItwlHAv0.js";import"./item-BoJEG7WG.js";import"./button-BBfxL8ER.js";import"./useButton-DNVuSdzc.js";import"./useRenderElement-CrJYfdJ6.js";import"./dropdown-menu-xNxphSlb.js";import"./index-jvIBXU_S.js";import"./index-DdU-ljPt.js";import"./composite-CxFUebGo.js";import"./useBaseUiId-DQjM6L-8.js";import"./useCompositeListItem-Cf9FURV2.js";import"./useRole-CbNwO7gp.js";import"./user-profile-lWX_9VNh.js";import"./avatar-codec-CjjBdg2g.js";import"./bioforest-DQyLkPyY.js";import"./web--YjHdHjW.js";import"./amount-BQsqQYGO.js";import"./notification-Dt0BRf6D.js";import"./index-DwhhC-lB.js";import"./transaction-meta-CQ9eNTSu.js";import"./IconDots-Bz3FCWmP.js";import"./IconShieldCheck-D-jrA03-.js";import"./IconApps-tvtKV9xX.js";import"./IconCoins-DWh8GEb6.js";import"./IconSparkles-BtTTb8Mh.js";import"./IconTrash-BH0OyIZv.js";import"./transaction-list-B6Faf2dJ.js";import"./transaction-item-BYC2dflm.js";import"./IconRefresh-BHVCZKea.js";import"./swipeable-tabs-Zv_Kzr8n.js";import"./swiper-DzVr8-9u.js";const Te={title:"Token/TokenList",component:p,tags:["autodocs"]},i=[{symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},{symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},{symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},{symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},{symbol:"BFM",name:"BFMeta",balance:"5,000",fiatValue:"250.00",chain:"bfmeta",change24h:0}],o={args:{tokens:i,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},t={args:{tokens:i,showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},r={args:{tokens:[],loading:!0}},n={args:{tokens:[],emptyAction:c.jsx(l,{size:"sm",children:"转入资产"})}},a={args:{tokens:[],emptyTitle:"没有找到代币",emptyDescription:"尝试添加新的代币到您的钱包",emptyAction:c.jsx("button",{className:"text-primary text-sm font-medium",children:"添加代币"})}},s={args:{tokens:[i[0]],onTokenClick:e=>alert(`Clicked ${e.symbol}`)}},m={args:{tokens:[...i,{symbol:"BNB",name:"Binance Coin",balance:"10",fiatValue:"3,000",chain:"bsc",change24h:3.1},{symbol:"USDC",name:"USD Coin",balance:"500",fiatValue:"500",chain:"ethereum",change24h:0}],showChange:!0,onTokenClick:e=>alert(`Clicked ${e.symbol}`)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
