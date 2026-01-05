import{j as e}from"./iframe-Cdc63axx.js";import{T as o}from"./token-item-B3WkOXGU.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-D72Fjhtn.js";import"./hologram-canvas-BNbq140G.js";import"./chain-icon-D4xOCR_v.js";import"./address-display-Br4bPKCM.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-B1THGpvK.js";import"./index-CgApz5ds.js";import"./IconCheck-CSFX6uTb.js";import"./createReactComponent-Byz9u14m.js";import"./IconCopy-Bd89ourp.js";import"./IconChevronDown-47ONnUQ4.js";import"./IconSettings-CnHezete.js";import"./wallet-selector-DyhJjCoj.js";import"./wallet-mini-card-DxswMVgD.js";import"./token-icon-G8t5AcAW.js";import"./gradient-button-CZKG_OxC.js";import"./index-DPaogHfF.js";import"./index-B_jtOnfb.js";import"./loading-spinner-BUGHRkCk.js";import"./empty-state-BekREkN0.js";import"./skeleton-B6q0SJ8M.js";import"./amount-display-CpkhKkD5.js";import"./NumberFlow-client-48rw3j0J-B9MIwagk.js";import"./animated-number-BzKftMU8.js";import"./time-display-Bqp2_Ej9.js";import"./qr-code-CN1BkjhE.js";import"./index-BumXyOSu.js";import"./icon-circle-BA3rQJgu.js";import"./error-boundary-Br_PTww5.js";import"./IconAlertCircle-CXTf0ayz.js";import"./IconAlertTriangle-CN6TnQbc.js";import"./IconCircleCheck-XqF-o2ls.js";import"./IconInfoCircle-i82YKtep.js";import"./button-CXgo3fuS.js";import"./useButton-DInLJQHG.js";import"./useRenderElement-DBEnl05C.js";import"./chain-config-CVvvJPxJ.js";import"./index-D0E7N0oa.js";import"./bioforest-ChHUthdw.js";import"./address-format-BmR8oJgW.js";import"./web-B0qc0cto.js";import"./amount-BQsqQYGO.js";import"./index-DBrPxRsx.js";const me={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},n={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},t={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ie=["Default","WithChange","NegativeChange","NotClickable","TokenList","MultiCurrency","Responsive"];export{r as Default,c as MultiCurrency,t as NegativeChange,s as NotClickable,m as Responsive,a as TokenList,n as WithChange,ie as __namedExportsOrder,me as default};
