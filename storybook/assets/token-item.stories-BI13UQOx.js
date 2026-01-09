import{j as e}from"./iframe-Dt-mvS9d.js";import{T as o}from"./token-item-z4k1aLk1.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-DZC4fYoz.js";import"./hologram-canvas-DrhGhET9.js";import"./chain-icon-BG7izoDN.js";import"./address-display-CY1ujTX_.js";import"./web-CYIEB8v4.js";import"./createReactComponent-Com5XDcP.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Daw7Ix_X.js";import"./index-BYpULzmI.js";import"./IconCheck-MHV0osq3.js";import"./IconChevronDown-BSOZlxWx.js";import"./IconSettings-DevaB5dx.js";import"./wallet-selector-C1ljfp1h.js";import"./wallet-mini-card-CkosKCdf.js";import"./token-icon-B9yOgUPa.js";import"./chain-config-Cy31f5Um.js";import"./index-D0E7N0oa.js";import"./bioforest-D91I-84E.js";import"./address-format-Bt4Tl7ZW.js";import"./amount-BQsqQYGO.js";import"./index-LPxyf6X8.js";import"./transaction-item-c2pqukIR.js";import"./gradient-button-5mekRODe.js";import"./index-CHiPz-35.js";import"./index-B_jtOnfb.js";import"./loading-spinner-CecumNt0.js";import"./empty-state-CVSNdB-0.js";import"./skeleton-D7LN5vTW.js";import"./amount-display-BfU9Ge76.js";import"./NumberFlow-client-48rw3j0J-CGHuaBbc.js";import"./animated-number-C5YTZArn.js";import"./time-display-CfGyW9eP.js";import"./qr-code-Byoz7L0I.js";import"./index-MPaqBLz1.js";import"./icon-circle-DeN-hrrd.js";import"./error-boundary-DuxMeN9t.js";import"./IconAlertCircle-Dg-Jds9d.js";import"./IconAlertTriangle-Dnu4zFQ6.js";import"./IconCircleCheck-CZt0cfCb.js";import"./IconInfoCircle-DmKc7jpx.js";import"./button-CIITPt9X.js";import"./useButton-RW-KfbzL.js";import"./useRenderElement-BTSWYIRv.js";import"./IconDots-DN0YYadw.js";import"./IconShieldCheck-DEU4wTjk.js";import"./IconTrash-CTeBC24B.js";import"./IconCoins-BFSaY6HW.js";import"./IconSparkles-B9OcTfoe.js";import"./web-DdbTbBSl.js";import"./transaction-list-FeVgZDEG.js";import"./swipeable-tabs-7D3SJg16.js";import"./swiper-CH4WLE7V.js";const ue={title:"Token/TokenItem",component:o,tags:["autodocs"]},i={symbol:"USDT",name:"Tether USD",balance:"1,234.56",fiatValue:"1,234.56",chain:"ethereum",change24h:.05},p={symbol:"ETH",name:"Ethereum",balance:"2.5",fiatValue:"4,500.00",chain:"ethereum",change24h:-2.3},k={symbol:"TRX",name:"Tron",balance:"10,000",fiatValue:"800.00",chain:"tron",change24h:5.2},h={symbol:"BTC",name:"Bitcoin",balance:"0.05",fiatValue:"2,500.00",chain:"bitcoin",change24h:1.8},r={args:{token:i,onClick:()=>alert("Clicked USDT")}},t={args:{token:p,showChange:!0,onClick:()=>alert("Clicked ETH")}},n={args:{token:{...p,change24h:-5.5},showChange:!0}},s={args:{token:k}},a={render:()=>e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})},c={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("p",{className:"text-muted-foreground text-xs",children:["使用顶部工具栏的 ",e.jsx("span",{className:"font-medium",children:"Currency"})," 切换 USD/CNY/EUR/JPY/KRW，查看汇率换算展示。"]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(o,{token:i,onClick:()=>{},showChange:!0}),e.jsx(o,{token:p,onClick:()=>{},showChange:!0}),e.jsx(o,{token:k,onClick:()=>{},showChange:!0}),e.jsx(o,{token:h,onClick:()=>{},showChange:!0})]})]}),parameters:{docs:{description:{story:"用于验证多货币显示：切换 Currency 后应看到 ≈ 符号后的法币数值与符号随之变化。"}}}},m={args:{token:i,onClick:()=>{},showChange:!0},parameters:{docs:{description:{story:"调整容器宽度，观察图标和文字尺寸变化"}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
