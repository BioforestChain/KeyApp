import{j as e}from"./iframe-DP2WwkEK.js";import{T as o}from"./token-item-Bpd48NsY.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-Bt3BfZYW.js";import"./hologram-canvas-CEeC1_hY.js";import"./chain-icon-CuwEql4x.js";import"./index-C9Fec6lp.js";import"./schemas-B18CumQY.js";import"./address-display-CveFfeTt.js";import"./web-Bt-WgROb.js";import"./createReactComponent-B9zKjBQW.js";import"./breakpoint-C1BNOfKS.js";import"./useTranslation-D56OS28U.js";import"./index-B3ErpZrp.js";import"./IconCheck-ByzzR-xm.js";import"./IconChevronDown-Ca4So856.js";import"./IconSettings-B-6Y1Vey.js";import"./wallet-selector-D-iysE6X.js";import"./wallet-mini-card-Ds2brCqH.js";import"./token-icon-5_rBzlOM.js";import"./LoadingSpinner-CKAsVYyD.js";import"./NumberFlow-client-48rw3j0J-B1amY8-Z.js";import"./amount-display-BO2LBxjd.js";import"./animated-number-CI5dpkcx.js";import"./time-display-CL96gpQM.js";import"./copyable-text-7ImiNVlV.js";import"./IconX-DwKkd_DL.js";import"./button-DkzmP_wT.js";import"./useButton-DbPtD0Db.js";import"./useRenderElement-CTFMrgbn.js";import"./dropdown-menu-xK0bc3_x.js";import"./index-D7q12DjP.js";import"./index-BBUus08y.js";import"./composite-CbEqZqwP.js";import"./useBaseUiId-BUO9XNIC.js";import"./useCompositeListItem-D38K7dV8.js";import"./useRole-DWwCW4Te.js";import"./user-profile-BcdT9kbr.js";import"./index-D0E7N0oa.js";import"./bioforest-B8KXXzKH.js";import"./avatar-codec-sXKPhKHq.js";import"./web-DpenQz7b.js";import"./amount-BQsqQYGO.js";import"./notification-C81mJ_5T.js";import"./index-BgynVEcu.js";import"./transaction-meta-DTHRoAxH.js";import"./IconDots-QblRZhpA.js";import"./IconShieldCheck-Zxv9K2bk.js";import"./IconApps-DheENsy7.js";import"./IconCoins-D2q5RZ2D.js";import"./IconSparkles-CnnFvCUX.js";import"./IconLock-D0JzPiP3.js";import"./IconTrash-tIMs8KzZ.js";import"./transaction-list-BzdtNlMa.js";import"./transaction-item-jJYqg2Lv.js";import"./IconRefresh-DJgIlVYK.js";import"./swipeable-tabs-9cE3OB78.js";import"./swiper-BEsTNAvW.js";import"./IconAlertTriangle-Bk27ifne.js";const we={title:"Token/TokenItem",component:o,tags:["autodocs"]},t={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},r={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},u={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},s={args:{token:t,onClick:()=>alert("Clicked USDT")}},a={args:{token:r,showChange:!0,onClick:()=>alert("Clicked ETH")}},m={args:{token:{...r,change24h:-5.5},showChange:!0}},c={args:{token:u}},i={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},p={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},showChange:!0}),e.jsx(o,{token:r,onClick:()=>{},showChange:!0}),e.jsx(o,{token:u,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},k={args:{token:t,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}},l={args:{token:t,onClick:()=>alert("Clicked USDT"),onContextMenu:(d,n)=>{alert(`Context menu for ${n.symbol}`)},mainAssetSymbol:"ETH"},parameters:{docs:{description:{story:"带有更多操作按钮的代币项，点击按钮、右键点击或长按触发上下文菜单"}}}},C={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:t,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:r,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"ETH"}),e.jsx(o,{token:u,onClick:()=>{},onContextMenu:(d,n)=>alert(`Menu: ${n.symbol}`),mainAssetSymbol:"TRX"})]}),parameters:{docs:{description:{story:"多个代币项带有上下文菜单，注意主资产(TRX)的 canDestroy 为 false"}}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}};const De=["Default","WithChange","NegativeChange","NotClickable","TokenList","MultiCurrency","Responsive","WithContextMenu","ContextMenuList"];export{C as ContextMenuList,s as Default,p as MultiCurrency,m as NegativeChange,c as NotClickable,k as Responsive,i as TokenList,a as WithChange,l as WithContextMenu,De as __namedExportsOrder,we as default};
