import{j as e}from"./iframe-BsFAjrMt.js";import{T as o}from"./token-item-BH--lU5K.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DBulR8ld.js";import"./hologram-canvas-BvDhzuDP.js";import"./chain-icon-D2BW2vV_.js";import"./service-CB2tjGon.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CmJfj5ER.js";import"./address-display-DbgwgdFw.js";import"./web-DNNLxmRA.js";import"./createReactComponent-CZurZBpK.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-D3dR0QcB.js";import"./index-BnAl6yxc.js";import"./IconCheck-CEKgIBoF.js";import"./IconChevronDown-CCIreAa1.js";import"./IconSettings-CTXTJiNz.js";import"./wallet-selector-C6M94IDB.js";import"./wallet-mini-card-BzlfC4Kd.js";import"./token-icon-2J76hFgA.js";import"./LoadingSpinner-DZYn303g.js";import"./NumberFlow-client-48rw3j0J-CWNCptA8.js";import"./amount-display-CYHQlU_v.js";import"./animated-number-CUUBFrV7.js";import"./time-display-BWbiCr7i.js";import"./service-status-alert-CSXNUjBM.js";import"./IconX-_rlxScxA.js";import"./IconAlertTriangle-BlEHDSVc.js";import"./IconLock-CEcWZw7g.js";import"./item-BMJQZxkK.js";import"./button-Bz_J7PEI.js";import"./useButton-CG4pul1p.js";import"./useRenderElement-DBk4QFW-.js";import"./dropdown-menu-BOqBq-Ck.js";import"./index-DJB-jHUq.js";import"./index-Dqc67vMq.js";import"./composite-Clz37zOm.js";import"./useBaseUiId-DBF-JzJn.js";import"./useCompositeListItem-BEl5qqdG.js";import"./useRole-GRII30Oz.js";import"./user-profile-BTo1KyAv.js";import"./avatar-codec-rAQex6rd.js";import"./bioforest-B1VZxBVY.js";import"./web-mJgfBfEt.js";import"./amount-BQsqQYGO.js";import"./notification-CDxSETBX.js";import"./index-DY3sBKIe.js";import"./transaction-meta-svUDpZmL.js";import"./IconDots-Cf1s2PWf.js";import"./IconShieldCheck-CTnNeMzH.js";import"./IconApps-a8JfnKus.js";import"./IconCoins-Dw3qc-Hh.js";import"./IconSparkles-BWYM1BGo.js";import"./IconTrash-DQ5yqfCj.js";import"./transaction-list-pqL0Dgpp.js";import"./transaction-item-Bu3FR-IW.js";import"./IconRefresh-BDRnsYF_.js";import"./swipeable-tabs-CwlVU25t.js";import"./swiper-SPa7eA1i.js";const Ee={title:"Token/TokenItem",component:o,tags:["autodocs"]},t={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},r={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},u={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},s={args:{token:t,onClick:()=>alert("Clicked USDT")}},a={args:{token:r,showChange:!0,onClick:()=>alert("Clicked ETH")}},m={args:{token:{...r,change24h:-5.5},showChange:!0}},c={args:{token:u}},i={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},p={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},k={args:{token:t,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}},l={args:{token:t,onClick:()=>alert("Clicked USDT"),onContextMenu:(d,n)=>{alert(`Context menu for ${n.symbol}`)},mainAssetSymbol:"ETH"},parameters:{docs:{description:{story:"带有更多操作按钮的代币项，点击按钮、右键点击或长按触发上下文菜单"}}}},C={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:r,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:u,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"TRX"})]}),parameters:{docs:{description:{story:"多个代币项带有上下文菜单，注意主资产(TRX)的 canDestroy 为 false"}}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
