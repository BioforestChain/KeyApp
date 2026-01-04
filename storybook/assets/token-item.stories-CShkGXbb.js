import{j as e}from"./iframe-CsJjcyMS.js";import{T as o}from"./token-item-DZb4dS9A.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-BPACoZn0.js";import"./hologram-canvas-3YXbNT2T.js";import"./chain-icon-OBzYgEFI.js";import"./address-display-E2gqOghN.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-mJk0QBrw.js";import"./index-DvB0ldGR.js";import"./IconCheck-BAqEtIBE.js";import"./createReactComponent-B1QyCjEx.js";import"./IconCopy-BZGAnz7k.js";import"./IconChevronDown-CGR4Zf1C.js";import"./IconSettings-DVSYlqbJ.js";import"./wallet-selector-DsR8OlLL.js";import"./wallet-mini-card-C7P4tQJ0.js";import"./token-icon-Oiy3V6_W.js";import"./gradient-button-Cr9gj5A0.js";import"./index-B-at9vAG.js";import"./index-B_jtOnfb.js";import"./loading-spinner-CiE8EWGd.js";import"./empty-state-C7A6Xum2.js";import"./skeleton-C5mYgbO7.js";import"./amount-display-BNpDjbgj.js";import"./NumberFlow-client-48rw3j0J-DDwDcx7d.js";import"./animated-number-B-jhjge7.js";import"./time-display-WuoNq9js.js";import"./qr-code-ItPtgHGs.js";import"./index-BynTUo9w.js";import"./icon-circle-Kf6vmUFi.js";import"./error-boundary-SV90xZ-q.js";import"./IconAlertCircle-DpwpgU_P.js";import"./IconAlertTriangle--Q9kcyxa.js";import"./IconCircleCheck-Y4JfdjWY.js";import"./IconInfoCircle-VqkvE4Ce.js";import"./button-C4-BaJb3.js";import"./useButton-BY83BFUt.js";import"./useRenderElement-Bk4WznJS.js";import"./chain-config-BvUmVsz0.js";import"./index-D0E7N0oa.js";import"./bioforest-D6P49my8.js";import"./address-format-DoygnCi0.js";import"./web-DSDdl93j.js";import"./amount-BQsqQYGO.js";import"./transaction-service-T7lpNq4r.js";const me={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},n={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},t={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
