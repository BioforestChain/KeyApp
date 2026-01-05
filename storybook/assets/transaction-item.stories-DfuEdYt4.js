import{j as t}from"./iframe-Cdc63axx.js";import{A as e}from"./amount-BQsqQYGO.js";import{T as a}from"./transaction-item-cwlr8uIT.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./address-display-Br4bPKCM.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-B1THGpvK.js";import"./index-CgApz5ds.js";import"./IconCheck-CSFX6uTb.js";import"./createReactComponent-Byz9u14m.js";import"./IconCopy-Bd89ourp.js";import"./chain-icon-D4xOCR_v.js";import"./gradient-button-CZKG_OxC.js";import"./index-DPaogHfF.js";import"./index-B_jtOnfb.js";import"./loading-spinner-BUGHRkCk.js";import"./empty-state-BekREkN0.js";import"./skeleton-B6q0SJ8M.js";import"./amount-display-CpkhKkD5.js";import"./NumberFlow-client-48rw3j0J-B9MIwagk.js";import"./animated-number-BzKftMU8.js";import"./time-display-Bqp2_Ej9.js";import"./qr-code-CN1BkjhE.js";import"./index-BumXyOSu.js";import"./icon-circle-BA3rQJgu.js";import"./error-boundary-Br_PTww5.js";import"./IconAlertCircle-CXTf0ayz.js";import"./IconAlertTriangle-CN6TnQbc.js";import"./IconCircleCheck-XqF-o2ls.js";import"./IconInfoCircle-i82YKtep.js";import"./button-CXgo3fuS.js";import"./useButton-DInLJQHG.js";import"./useRenderElement-DBEnl05C.js";import"./IconDots-Dmyhnky5.js";import"./IconTrash-B5y_mVMQ.js";import"./IconCoins-gvMH-Yks.js";import"./IconSparkles-CUJ4IiFn.js";const $={title:"Transaction/TransactionItem",component:a,tags:["autodocs"]},c={id:"1",type:"send",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(Date.now()-36e5)},d={id:"2",type:"receive",status:"confirmed",amount:e.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"TRX9876543210fedcba9876543210fedcba",timestamp:new Date(Date.now()-864e5)},p={id:"3",type:"send",status:"pending",amount:e.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date},l={id:"4",type:"send",status:"failed",amount:e.fromFormatted("200",6,"TRX"),symbol:"TRX",address:"TRX1111222233334444555566667777888899",timestamp:new Date(Date.now()-72e5)},o={args:{transaction:c,onClick:()=>alert("View transaction")}},r={args:{transaction:d,onClick:()=>alert("View transaction")}},n={args:{transaction:p,onClick:()=>alert("View transaction")}},s={args:{transaction:l,onClick:()=>alert("View transaction")}},i={args:{transaction:{id:"5",type:"exchange",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT → ETH",address:"0xdex1234567890",timestamp:new Date(Date.now()-18e5)},onClick:()=>alert("View swap")}},m={render:()=>t.jsxs("div",{className:"space-y-1",children:[t.jsx(a,{transaction:c,onClick:()=>{}}),t.jsx(a,{transaction:d,onClick:()=>{}}),t.jsx(a,{transaction:p,onClick:()=>{}}),t.jsx(a,{transaction:l,onClick:()=>{}}),t.jsx(a,{transaction:{id:"5",type:"stake",status:"confirmed",amount:e.fromFormatted("1000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(Date.now()-1728e5)},onClick:()=>{}})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: mockSend,
    onClick: () => alert('View transaction')
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: mockReceive,
    onClick: () => alert('View transaction')
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: mockPending,
    onClick: () => alert('View transaction')
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: mockFailed,
    onClick: () => alert('View transaction')
  }
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    transaction: {
      id: '5',
      type: 'exchange',
      status: 'confirmed',
      amount: Amount.fromFormatted('100', 6, 'USDT'),
      symbol: 'USDT → ETH',
      address: '0xdex1234567890',
      timestamp: new Date(Date.now() - 1800000)
    },
    onClick: () => alert('View swap')
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-1">
      <TransactionItem transaction={mockSend} onClick={() => {}} />
      <TransactionItem transaction={mockReceive} onClick={() => {}} />
      <TransactionItem transaction={mockPending} onClick={() => {}} />
      <TransactionItem transaction={mockFailed} onClick={() => {}} />
      <TransactionItem transaction={{
      id: '5',
      type: 'stake',
      status: 'confirmed',
      amount: Amount.fromFormatted('1000', 8, 'BFM'),
      symbol: 'BFM',
      address: '质押合约',
      timestamp: new Date(Date.now() - 172800000)
    }} onClick={() => {}} />
    </div>
}`,...m.parameters?.docs?.source}}};const tt=["Send","Receive","Pending","Failed","Swap","AllTypes"];export{m as AllTypes,s as Failed,n as Pending,r as Receive,o as Send,i as Swap,tt as __namedExportsOrder,$ as default};
