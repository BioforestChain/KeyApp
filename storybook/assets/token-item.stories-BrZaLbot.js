import{j as e}from"./iframe-CJpTPnNI.js";import{T as o}from"./token-item-CGxB5lVg.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-sn_akng3.js";import"./hologram-canvas-CO0bFt0z.js";import"./chain-icon-ao6YL0QW.js";import"./address-display-BewaP61y.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-B6RbLzit.js";import"./index-CllyeN4y.js";import"./IconCheck-Br1586__.js";import"./createReactComponent-DiopHDoT.js";import"./IconCopy-CNsa4--3.js";import"./IconChevronDown-B2x_GYvW.js";import"./IconSettings-Bhnyh3sa.js";import"./wallet-selector-CS5Dmk7p.js";import"./wallet-mini-card-DoDBeEdD.js";import"./token-icon-C4yEx6_v.js";import"./amount-BQsqQYGO.js";import"./index-DxVYZOB2.js";import"./chain-config-DG5VSGct.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-DyjwoM8W.js";import"./gradient-button-WUoG9QqF.js";import"./index-BHTpyBc-.js";import"./index-B_jtOnfb.js";import"./loading-spinner-BHFMxiCX.js";import"./empty-state-CYj05h1C.js";import"./skeleton-BoASDR21.js";import"./amount-display-oUIkkG1O.js";import"./NumberFlow-client-48rw3j0J-CoNjnbWe.js";import"./animated-number-D8ft1ipC.js";import"./time-display-BqW6FLB5.js";import"./qr-code-C2Yb-ANj.js";import"./index-6CQ18jak.js";import"./icon-circle-6ouslsgQ.js";import"./error-boundary-DceKJLMP.js";import"./IconAlertCircle-BHrbNzHj.js";import"./IconAlertTriangle-rm2kPBw9.js";import"./IconCircleCheck-CmmoD_IB.js";import"./IconInfoCircle-BtRDlUfR.js";import"./button-C9OFjL0U.js";import"./useButton-BAme-r7q.js";import"./useRenderElement-CRMvYRht.js";import"./IconDots-vbXjfyP8.js";import"./IconShieldCheck-CFIq47qH.js";import"./IconTrash-Brp1mZml.js";import"./IconCoins-CTF_9g0v.js";import"./IconSparkles-BGU0sqjx.js";import"./web-BIhcrt-B.js";import"./transaction-list-Dhc-JML6.js";import"./swipeable-tabs-Ce9leze8.js";import"./swiper-BrqzJ7J4.js";const ge={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},t={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},n={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
