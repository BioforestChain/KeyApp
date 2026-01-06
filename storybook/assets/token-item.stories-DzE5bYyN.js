import{j as e}from"./iframe-Cctxta_P.js";import{T as o}from"./token-item-JMOiWq81.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-DUvztJIp.js";import"./hologram-canvas-B-4TSu35.js";import"./chain-icon-DZMbM4Yp.js";import"./address-display-Dtq1ht35.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Cyi9axMr.js";import"./index-ECTMCtyo.js";import"./IconCheck-BUbIsnVA.js";import"./createReactComponent-BokZZTcn.js";import"./IconCopy-XrsQyI7S.js";import"./IconChevronDown-BNgXvKMn.js";import"./IconSettings-BW6CvsVM.js";import"./wallet-selector-Bl24-a4p.js";import"./wallet-mini-card-C-JPi8da.js";import"./token-icon-DtvtRadC.js";import"./amount-BQsqQYGO.js";import"./index-Ar-6A-5n.js";import"./chain-config-DqVXGLIz.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-B6DGk-oU.js";import"./gradient-button-CI0i7sXk.js";import"./index-CYflX4oo.js";import"./index-B_jtOnfb.js";import"./loading-spinner-CQ_N_PP1.js";import"./empty-state-QlYsD_4V.js";import"./skeleton-dMQmJuYw.js";import"./amount-display-lh-aDGFD.js";import"./NumberFlow-client-48rw3j0J-D-9LcztC.js";import"./animated-number-uR3fQozJ.js";import"./time-display-DtS7YJCT.js";import"./qr-code-CY_2OM_C.js";import"./index-C069iInY.js";import"./icon-circle-DAEhXiJ_.js";import"./error-boundary-DnCREgnV.js";import"./IconAlertCircle-BEx518Hp.js";import"./IconAlertTriangle-D1gPId_I.js";import"./IconCircleCheck-B3YbjWQ1.js";import"./IconInfoCircle-Cpbyhs8C.js";import"./button-sjDKCcea.js";import"./useButton-BiCET3WI.js";import"./useRenderElement-qlaWX--Y.js";import"./IconDots-BSGCpCPI.js";import"./IconShieldCheck-DQW5fnOn.js";import"./IconTrash-B0njLt7H.js";import"./IconCoins-B8xpaPYW.js";import"./IconSparkles-B5YMY-mG.js";import"./web-DnZPwNCZ.js";import"./transaction-list-X9g1OvtJ.js";import"./swipeable-tabs-BaNw0YM4.js";import"./swiper-DvJCME9U.js";const ge={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},t={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},n={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
