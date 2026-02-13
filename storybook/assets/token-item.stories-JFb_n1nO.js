import{j as e}from"./iframe-DiTbX0IW.js";import{T as o}from"./token-item-CbniCsUG.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-C4EhqI9I.js";import"./hologram-canvas-f8CDXftB.js";import"./chain-icon-BU3VWqRh.js";import"./service-oKJQN9S1.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-Dp6bZnX-.js";import"./address-display-CfH8l4mh.js";import"./web-DCQ-jzzt.js";import"./createReactComponent-CsAWfYOO.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-CrBtWVkI.js";import"./index-PxwM-cQl.js";import"./IconCheck-D-zvsvG2.js";import"./IconChevronDown-CqVIs3Wg.js";import"./IconSettings-DjPtxsfk.js";import"./wallet-selector-rf9Csv-a.js";import"./wallet-mini-card-BGsYdviW.js";import"./token-icon-o2Evsbq3.js";import"./LoadingSpinner-D1DjlpnU.js";import"./NumberFlow-client-48rw3j0J-MEBnEMM-.js";import"./amount-display-DkxTPL1-.js";import"./animated-number-D9k-rG-f.js";import"./time-display-OmewVAKh.js";import"./service-status-alert-BdEDVk2W.js";import"./IconX-DQkGJ2tu.js";import"./IconAlertTriangle-BYJYLH3z.js";import"./IconLock-DsnzZlgd.js";import"./item-CwnP2lCa.js";import"./button-V_jX1OLq.js";import"./useButton-CWLqZqk7.js";import"./useRenderElement-DsnB5a2h.js";import"./dropdown-menu-CO91eWEY.js";import"./index-DqbLvQvd.js";import"./index-C5BCuv5I.js";import"./composite-CN7r9zdQ.js";import"./useBaseUiId-B7b9C06f.js";import"./useCompositeListItem-BWP5pVQr.js";import"./useRole-DWw1Hdoz.js";import"./user-profile-CqRd3yoO.js";import"./avatar-codec-Bmh89c4V.js";import"./bioforest-Cs6KeS9H.js";import"./web-sXXS6i6g.js";import"./amount-BQsqQYGO.js";import"./notification-B8LVYZJ_.js";import"./index-r2WO9SAj.js";import"./transaction-meta-B-LZaI6I.js";import"./IconDots-BmUExUuL.js";import"./IconShieldCheck-BaPXHr9s.js";import"./IconApps-WauHuIt5.js";import"./IconCoins-ZoQfzEKQ.js";import"./IconSparkles-BqtErlHu.js";import"./IconTrash-CgWHyU0G.js";import"./transaction-list-CFcwlOg_.js";import"./transaction-item-Ma_XfZYP.js";import"./IconRefresh-kuRFeFzV.js";import"./swipeable-tabs-Chl40aRu.js";import"./swiper-DT0qO8ux.js";const Ee={title:"Token/TokenItem",component:o,tags:["autodocs"]},t={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},r={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},u={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},s={args:{token:t,onClick:()=>alert("Clicked USDT")}},a={args:{token:r,showChange:!0,onClick:()=>alert("Clicked ETH")}},m={args:{token:{...r,change24h:-5.5},showChange:!0}},c={args:{token:u}},i={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},p={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},k={args:{token:t,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}},l={args:{token:t,onClick:()=>alert("Clicked USDT"),onContextMenu:(d,n)=>{alert(`Context menu for ${n.symbol}`)},mainAssetSymbol:"ETH"},parameters:{docs:{description:{story:"带有更多操作按钮的代币项，点击按钮、右键点击或长按触发上下文菜单"}}}},C={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:r,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:u,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"TRX"})]}),parameters:{docs:{description:{story:"多个代币项带有上下文菜单，注意主资产(TRX)的 canDestroy 为 false"}}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
