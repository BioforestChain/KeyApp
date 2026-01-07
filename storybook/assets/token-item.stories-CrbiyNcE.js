import{j as e}from"./iframe-YGgzyB6y.js";import{T as o}from"./token-item-UsanTuCu.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-MJRhtQjT.js";import"./hologram-canvas-BjGRfdLc.js";import"./chain-icon-BmsN0vV8.js";import"./address-display-Hjq68B6I.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-DJYaXVoL.js";import"./index-C9jnYNzc.js";import"./IconCheck-DXiHzmBL.js";import"./createReactComponent-C65dmoKK.js";import"./IconCopy-B9s_BlJh.js";import"./IconChevronDown-BFyZjn6Z.js";import"./IconSettings-DlfHUmjB.js";import"./wallet-selector-diQVuWMz.js";import"./wallet-mini-card-DsWG0aHi.js";import"./token-icon-CwOeQB-u.js";import"./amount-BQsqQYGO.js";import"./index-DOSpCLaG.js";import"./chain-config-mrrNMkBP.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";import"./transaction-item-CipuqUU4.js";import"./gradient-button-BrhOUTEG.js";import"./index-DbD0qw7Q.js";import"./index-B_jtOnfb.js";import"./loading-spinner-DHBIrD9T.js";import"./empty-state-73TFthc8.js";import"./skeleton-gdUfPxx4.js";import"./amount-display-VzuGZ8HF.js";import"./NumberFlow-client-48rw3j0J-CACE_QoZ.js";import"./animated-number-BqphCAAU.js";import"./time-display-DFf2PejR.js";import"./qr-code-BEiKlJjN.js";import"./index-BxAZLTKO.js";import"./icon-circle-CadSb1-Y.js";import"./error-boundary-DUbdgwux.js";import"./IconAlertCircle-kVogN0sY.js";import"./IconAlertTriangle-wlF1uuIl.js";import"./IconCircleCheck-CuMO848h.js";import"./IconInfoCircle-BuV_e2Zd.js";import"./button-cKR6cI8K.js";import"./useButton-D1UChW__.js";import"./useRenderElement-BkqhpeaF.js";import"./IconDots-COmrTEGY.js";import"./IconShieldCheck-BUZj7DGE.js";import"./IconTrash-C_NULuOr.js";import"./IconCoins-Dy9VkAtt.js";import"./IconSparkles-BSqTj7IY.js";import"./web-CjCcrg7f.js";import"./transaction-list-BlK48-vJ.js";import"./swipeable-tabs-B8Fi_1qf.js";import"./swiper-BmF-CrQg.js";const ge={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},t={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},n={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
