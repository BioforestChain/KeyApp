import{j as e}from"./iframe-CVsnPOYc.js";import{T as o}from"./token-item-Lr1hQsHS.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-DnEMy-0k.js";import"./hologram-canvas-C-qS0WUk.js";import"./chain-icon-CtFDUT2x.js";import"./address-display-CsSBwCJO.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-DzAxu0sT.js";import"./index-DwHoKsdM.js";import"./IconCheck-CTmUUJ-J.js";import"./createReactComponent-BX-2XwI1.js";import"./IconCopy-BXs4XcV9.js";import"./IconChevronDown-CMTiNW7z.js";import"./IconSettings-B4rME7Mv.js";import"./wallet-selector-CviWj48n.js";import"./wallet-mini-card-_yQtm-_h.js";import"./token-icon-C2_VQ9hP.js";import"./gradient-button-DEoESV6_.js";import"./index-B54l9L7G.js";import"./index-B_jtOnfb.js";import"./loading-spinner-Cil9EiWH.js";import"./empty-state-B67wnvMz.js";import"./skeleton-BRb6Luxt.js";import"./amount-display-BTdiPLBA.js";import"./NumberFlow-client-48rw3j0J-B2Ei7vW0.js";import"./animated-number-DbdhG2Yn.js";import"./time-display-BNJXkPMl.js";import"./qr-code-BNS0Yg3I.js";import"./index-CWZFdeOX.js";import"./icon-circle-CQXqp_re.js";import"./error-boundary-LLpEY9XN.js";import"./IconAlertCircle-D-RAb7M5.js";import"./IconAlertTriangle-Dve38QOj.js";import"./IconCircleCheck-DjMMdPa7.js";import"./IconInfoCircle-CwquL7E4.js";import"./button-n34NNLFc.js";import"./useButton-DNnqn-kk.js";import"./useRenderElement-DjccSJiH.js";import"./chain-config-DrjtVBMA.js";import"./index-D0E7N0oa.js";import"./bioforest-ChHUthdw.js";import"./address-format-BmR8oJgW.js";import"./web-BFSIvvml.js";import"./amount-BQsqQYGO.js";import"./index-CMCYSLo3.js";const me={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},n={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},t={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
