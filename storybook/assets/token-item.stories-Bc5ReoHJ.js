import{j as e}from"./iframe-BEYsz_Nt.js";import{T as o}from"./token-item-C9tKi95o.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-EMjq8ZeP.js";import"./hologram-canvas-DHxHprx7.js";import"./chain-icon-BzbIAD-o.js";import"./address-display-CY5GhdSv.js";import"./web-B9VECXrs.js";import"./breakpoint-CUnGgoIy.js";import"./schemas-Cl5zTOv_.js";import"./useTranslation-B3xWiyCw.js";import"./index-vFE_paAZ.js";import"./IconCheck-MuB5Cc54.js";import"./createReactComponent-BT0NPHve.js";import"./IconCopy-_Lea3FiA.js";import"./IconChevronDown-CDxde5ec.js";import"./IconSettings-CmnSRkrc.js";import"./wallet-selector-CG72Cunq.js";import"./wallet-mini-card-DsiUA6Jp.js";import"./token-icon-v6H6nGjO.js";import"./gradient-button-C-uFbkJH.js";import"./index-CYW01yvF.js";import"./index-B_jtOnfb.js";import"./loading-spinner-qCYwQe_K.js";import"./empty-state-Bs7MkhC2.js";import"./skeleton-DRyW99Kl.js";import"./amount-display-DAmblLKu.js";import"./NumberFlow-client-48rw3j0J-BM3qjY4m.js";import"./animated-number-BmS7BpZt.js";import"./time-display-BDtvbEd7.js";import"./qr-code-DaqudJtg.js";import"./index-DYK0aWG_.js";import"./icon-circle-sOaFK1ED.js";import"./error-boundary-PiYeLgUx.js";import"./IconAlertCircle-Bieuwgiv.js";import"./IconAlertTriangle-DbNazWEC.js";import"./IconCircleCheck-CSPFvmBd.js";import"./IconInfoCircle-FXeAYAMR.js";import"./button-CQpB5DKZ.js";import"./useRenderElement-BBCNVxdJ.js";import"./chain-config-lKD-osoU.js";import"./index-D0E7N0oa.js";import"./bioforest-D6P49my8.js";import"./address-format-DoygnCi0.js";import"./web-BYmBbCUN.js";import"./amount-BQsqQYGO.js";import"./adapter-P1TowZKT.js";const ce={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},n={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},t={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockUSDT,
    onClick: () => alert('Clicked USDT')
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockETH,
    showChange: true,
    onClick: () => alert('Clicked ETH')
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    token: {
      ...mockETH,
      change24h: -5.5
    },
    showChange: true
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockTRX
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-1">
      <TokenItem token={mockUSDT} onClick={() => {}} showChange />
      <TokenItem token={mockETH} onClick={() => {}} showChange />
      <TokenItem token={mockTRX} onClick={() => {}} showChange />
      <TokenItem token={mockBTC} onClick={() => {}} showChange />
    </div>
}`,...a.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const me=["Default","WithChange","NegativeChange","NotClickable","TokenList","MultiCurrency","Responsive"];export{r as Default,c as MultiCurrency,t as NegativeChange,s as NotClickable,m as Responsive,a as TokenList,n as WithChange,me as __namedExportsOrder,ce as default};
