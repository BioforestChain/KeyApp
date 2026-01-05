import{j as e}from"./iframe-COU4jiV7.js";import{T as o}from"./token-item-BWDIV2_j.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-BlkedFOV.js";import"./hologram-canvas-BuHsQQ3v.js";import"./chain-icon-DX9n_B5U.js";import"./address-display-BotvcatA.js";import"./web-DwEfzBpW.js";import"./breakpoint-CX_csqtO.js";import"./schemas-DBe5gblO.js";import"./useTranslation-_4fOArPU.js";import"./index-s3QWmJ4F.js";import"./IconCheck-CQN2B4KM.js";import"./createReactComponent-DE454l2M.js";import"./IconCopy-CLmv6fgQ.js";import"./IconChevronDown-B8HdtH5d.js";import"./IconSettings-Cpz7ugy3.js";import"./wallet-selector-BxDYZxj6.js";import"./wallet-mini-card-BiGNrVDA.js";import"./token-icon-BjM6whnQ.js";import"./gradient-button-C5H52r6i.js";import"./index-DCCuZUXu.js";import"./index-B_jtOnfb.js";import"./loading-spinner-DfnfFopB.js";import"./empty-state-Dk7pDqFT.js";import"./skeleton-DRwtIXd4.js";import"./amount-display-B3Wp74g-.js";import"./NumberFlow-client-48rw3j0J-Cy5GWM7V.js";import"./animated-number-3h20x6Ee.js";import"./time-display-CfkGYYvI.js";import"./qr-code-BZsDCxGF.js";import"./index-BWWTAJYt.js";import"./icon-circle-DZK32FIw.js";import"./error-boundary-BrGc7NlB.js";import"./IconAlertCircle-Bf3ApxTU.js";import"./IconAlertTriangle-BUQPaQPR.js";import"./IconCircleCheck-CzOAel6A.js";import"./IconInfoCircle-0OQSvTQk.js";import"./button-BKtUs1ME.js";import"./useButton-07DFO_Si.js";import"./useRenderElement-bml70h2I.js";import"./chain-config-lTDsBSdd.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./web-Ce9cpvCS.js";import"./amount-BQsqQYGO.js";import"./index-BajbfiR2.js";import"./adapter-B6DlYjXl.js";const ie={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},n={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},t={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const pe=["Default","WithChange","NegativeChange","NotClickable","TokenList","MultiCurrency","Responsive"];export{r as Default,c as MultiCurrency,t as NegativeChange,s as NotClickable,m as Responsive,a as TokenList,n as WithChange,pe as __namedExportsOrder,ie as default};
