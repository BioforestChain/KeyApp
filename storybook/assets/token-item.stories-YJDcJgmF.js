import{j as e}from"./iframe-D83HRxja.js";import{T as o}from"./token-item-D4rVa4rQ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-CV2xWVxX.js";import"./hologram-canvas-CWw662CY.js";import"./chain-icon-CPMMABXZ.js";import"./address-display-DMBPWyK8.js";import"./web-f237CAb2.js";import"./createReactComponent-D7OhYMh1.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-DO0JxAAY.js";import"./index-npW09g6C.js";import"./IconCheck-BSghpyhq.js";import"./IconChevronDown-BZp6kFlt.js";import"./IconSettings-Y9exJ1wq.js";import"./wallet-selector-BgmnXH-G.js";import"./wallet-mini-card-BrH-8AOB.js";import"./token-icon-DhHQv1yP.js";import"./chain-config-Bk_G759X.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-B4txTayA.js";import"./transaction-item-D4E_Ffwz.js";import"./gradient-button-BMU4sITt.js";import"./index-DZxl4Jsp.js";import"./index-B_jtOnfb.js";import"./loading-spinner-Bz27mwkU.js";import"./empty-state-DaZr51ss.js";import"./skeleton-CrEiQn3s.js";import"./amount-display-BcyyGRSk.js";import"./NumberFlow-client-48rw3j0J-BGcghRho.js";import"./animated-number-Dpvp6Z0Y.js";import"./time-display-O2nBreqk.js";import"./qr-code-D5l_HpWg.js";import"./index-ySv_Lraw.js";import"./icon-circle-B4y7N1Rv.js";import"./error-boundary-B2WqwxYa.js";import"./IconAlertCircle-DVbL7mU0.js";import"./IconAlertTriangle-Dgg3x20_.js";import"./IconCircleCheck-CAcXJ-EA.js";import"./IconInfoCircle-0_SBzl_3.js";import"./button-Dy8qyJWI.js";import"./useButton-B8xhICYR.js";import"./useRenderElement-Dbc4X9rA.js";import"./IconDots-wYRLlhLO.js";import"./IconShieldCheck-CgQ5L5l9.js";import"./IconTrash-COXgeTCe.js";import"./IconCoins-BS6ube4a.js";import"./IconSparkles-B5APTupF.js";import"./web-DC3fJ1nC.js";import"./transaction-list-BuYGXwvn.js";import"./swipeable-tabs-COfZlsMW.js";import"./swiper-C99ydrCt.js";const ue={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},t={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},n={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const ge=["Default","WithChange","NegativeChange","NotClickable","TokenList","MultiCurrency","Responsive"];export{r as Default,c as MultiCurrency,n as NegativeChange,s as NotClickable,m as Responsive,a as TokenList,t as WithChange,ge as __namedExportsOrder,ue as default};
