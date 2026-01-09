import{j as e}from"./iframe-D8HuPklR.js";import{T as o}from"./token-item-DVa5EJn5.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-kVfzh3P2.js";import"./hologram-canvas-8qoCKe-D.js";import"./chain-icon-ZTjI2YHg.js";import"./address-display-BLKTwJkl.js";import"./web-DAAeEFIs.js";import"./createReactComponent-DdmPrrAT.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-5HKfA7bW.js";import"./index-D85HYSDi.js";import"./IconCheck-Bm191dgP.js";import"./IconChevronDown-BeDBGQvx.js";import"./IconSettings-CE1p3rdT.js";import"./wallet-selector-qOlIUMVR.js";import"./wallet-mini-card-B6589S7A.js";import"./token-icon-Ca0sc-Eh.js";import"./chain-config-BTy51NxL.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-BpO8vo8u.js";import"./transaction-item-1yNFMmpo.js";import"./gradient-button-BoxP_5VQ.js";import"./index-DO3qvWDr.js";import"./index-B_jtOnfb.js";import"./loading-spinner-CI59dVg1.js";import"./empty-state-AHA5q4Af.js";import"./skeleton-n7XL7W8x.js";import"./amount-display-xaPhfsQD.js";import"./NumberFlow-client-48rw3j0J-C8Uh9xZE.js";import"./animated-number-B7Ac1SOd.js";import"./time-display-CAOlWQlz.js";import"./qr-code-B4m9ayQ4.js";import"./index-fAcS8NTV.js";import"./icon-circle--K3XnjCB.js";import"./copyable-text-FxibUpBr.js";import"./IconAlertCircle-DmfGovmB.js";import"./IconAlertTriangle-DDmjzwOD.js";import"./IconCircleCheck-D-M2FNtX.js";import"./IconInfoCircle-CxAPThhN.js";import"./button-B8ZysgrZ.js";import"./useButton-hp5SGEGC.js";import"./useRenderElement-Dtgsp6Pg.js";import"./IconX-CfRcC0S9.js";import"./IconDots-Sxr6XZN3.js";import"./IconShieldCheck-bljxd_qn.js";import"./IconTrash-kwiUrPG-.js";import"./IconCoins-C58B3_g9.js";import"./IconSparkles-CEkQEtKZ.js";import"./web-DSAis8To.js";import"./transaction-list-B8xu9p81.js";import"./swipeable-tabs-CTBIrBXy.js";import"./swiper-DPx5oLr3.js";const ge={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},t={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},n={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockUSDT,
    onClick: () => alert('Clicked USDT')
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    token: mockETH,
    showChange: true,
    onClick: () => alert('Clicked ETH')
  }
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    token: {
      ...mockETH,
      change24h: -5.5
    },
    showChange: true
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Te=["Default","WithChange","NegativeChange","NotClickable","TokenList","MultiCurrency","Responsive"];export{r as Default,c as MultiCurrency,n as NegativeChange,s as NotClickable,m as Responsive,a as TokenList,t as WithChange,Te as __namedExportsOrder,ge as default};
