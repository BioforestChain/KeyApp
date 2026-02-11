import{j as e}from"./iframe-mWBAGdu2.js";import{T as o}from"./token-item-DGVSCGT8.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DnYtNczq.js";import"./hologram-canvas-889_hCIX.js";import"./chain-icon-2HeprLOs.js";import"./service-B4irENPO.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CJhU_MGF.js";import"./address-display-DKT0vOoz.js";import"./web-CZBBkCl8.js";import"./createReactComponent-B-6fW5hv.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CgcY4kD2.js";import"./index-CQqlk44_.js";import"./IconCheck-CuLK5Lso.js";import"./IconChevronDown-BiJECIYo.js";import"./IconSettings-rvaMsw2T.js";import"./wallet-selector-CjrH7Oof.js";import"./wallet-mini-card-DaMhy_eq.js";import"./token-icon-DeWE72I8.js";import"./LoadingSpinner-5yBM7ljk.js";import"./NumberFlow-client-48rw3j0J-CcYGONdn.js";import"./amount-display-wQjnDxjL.js";import"./animated-number-q7Zuurvj.js";import"./time-display-C1uapCJl.js";import"./service-status-alert-6hcq_l5R.js";import"./IconX-BqC2qfgB.js";import"./IconAlertTriangle-CNSsSeij.js";import"./IconLock-BgRk-y-j.js";import"./item-C_V34aOe.js";import"./button-CWmjkcwj.js";import"./useButton-CzZE3PFl.js";import"./useRenderElement-sc-z0PWr.js";import"./dropdown-menu-DNSoO2V2.js";import"./index-VCB1YGXn.js";import"./index-CA7gD68F.js";import"./composite-BboVuw4R.js";import"./useBaseUiId-DQBrHUlS.js";import"./useCompositeListItem-DvR8hAqx.js";import"./useRole-DGvmnm99.js";import"./user-profile-8iPUTBHY.js";import"./avatar-codec-D48yzn7e.js";import"./bioforest-Cl7-L94f.js";import"./web-BjtGL4-O.js";import"./amount-BQsqQYGO.js";import"./notification-BbAH52jB.js";import"./index-Bn-Rhtqg.js";import"./transaction-meta-Cj9oQZ9L.js";import"./IconDots-KtAZEoMt.js";import"./IconShieldCheck-DlibSZX5.js";import"./IconApps-CYwRRxTF.js";import"./IconCoins-ec82T06A.js";import"./IconSparkles-Pvooc5dW.js";import"./IconTrash-BKP2FQQB.js";import"./transaction-list-DvVvUZ6t.js";import"./transaction-item-B7nDttdd.js";import"./IconRefresh-CuhR68Lg.js";import"./swipeable-tabs-BKXeHkfm.js";import"./swiper-DABNyrAf.js";const Ee={title:"Token/TokenItem",component:o,tags:["autodocs"]},t={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},r={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},u={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},s={args:{token:t,onClick:()=>alert("Clicked USDT")}},a={args:{token:r,showChange:!0,onClick:()=>alert("Clicked ETH")}},m={args:{token:{...r,change24h:-5.5},showChange:!0}},c={args:{token:u}},i={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},p={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},k={args:{token:t,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}},l={args:{token:t,onClick:()=>alert("Clicked USDT"),onContextMenu:(d,n)=>{alert(`Context menu for ${n.symbol}`)},mainAssetSymbol:"ETH"},parameters:{docs:{description:{story:"带有更多操作按钮的代币项，点击按钮、右键点击或长按触发上下文菜单"}}}},C={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:r,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:u,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"TRX"})]}),parameters:{docs:{description:{story:"多个代币项带有上下文菜单，注意主资产(TRX)的 canDestroy 为 false"}}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockUSDT,
    onClick: () => alert('Clicked USDT')
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockETH,
    showChange: true,
    onClick: () => alert('Clicked ETH')
  }
}`,...a.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    token: {
      ...mockETH,
      change24h: -5.5
    },
    showChange: true
  }
}`,...m.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockTRX
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-1">
      <TokenItem token={mockUSDT} onClick={() => {}} showChange />
      <TokenItem token={mockETH} onClick={() => {}} showChange />
      <TokenItem token={mockTRX} onClick={() => {}} showChange />
      <TokenItem token={mockBTC} onClick={() => {}} showChange />
    </div>
}`,...i.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <p className="text-muted-foreground text-xs">
        使用顶部工具栏的 <span className="font-medium">Currency</span> 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。
      </p>
      <div className="space-y-1">
        <TokenItem token={mockUSDT} onClick={() => {}} showChange />
        <TokenItem token={mockETH} onClick={() => {}} showChange />
        <TokenItem token={mockTRX} onClick={() => {}} showChange />
        <TokenItem token={mockBTC} onClick={() => {}} showChange />
      </div>
    </div>,
  parameters: {
    docs: {
      description: {
        story: '用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。'
      }
    }
  }
}`,...p.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockUSDT,
    onClick: () => {},
    showChange: true
  },
  parameters: {
    docs: {
      description: {
        story: '调整容器宽度，观察图标和文字尺寸变化'
      }
    }
  }
}`,...k.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockUSDT,
    onClick: () => alert('Clicked USDT'),
    onContextMenu: (_event: React.MouseEvent, token: TokenInfo) => {
      alert(\`Context menu for \${token.symbol}\`);
    },
    mainAssetSymbol: 'ETH' // USDT is not main asset, so canDestroy = true for bioforest chains
  },
  parameters: {
    docs: {
      description: {
        story: '带有更多操作按钮的代币项，点击按钮、右键点击或长按触发上下文菜单'
      }
    }
  }
}`,...l.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-1">
      <TokenItem token={mockUSDT} onClick={() => {}} onContextMenu={(_e, token) => alert(\`Menu: \${token.symbol}\`)} mainAssetSymbol="ETH" />
      <TokenItem token={mockETH} onClick={() => {}} onContextMenu={(_e, token) => alert(\`Menu: \${token.symbol}\`)} mainAssetSymbol="ETH" />
      <TokenItem token={mockTRX} onClick={() => {}} onContextMenu={(_e, token) => alert(\`Menu: \${token.symbol}\`)} mainAssetSymbol="TRX" />
    </div>,
  parameters: {
    docs: {
      description: {
        story: '多个代币项带有上下文菜单，注意主资产(TRX)的 canDestroy 为 false'
      }
    }
  }
}`,...C.parameters?.docs?.source}}};const Me=["Default","WithChange","NegativeChange","NotClickable","TokenList","MultiCurrency","Responsive","WithContextMenu","ContextMenuList"];export{C as ContextMenuList,s as Default,p as MultiCurrency,m as NegativeChange,c as NotClickable,k as Responsive,i as TokenList,a as WithChange,l as WithContextMenu,Me as __namedExportsOrder,Ee as default};
