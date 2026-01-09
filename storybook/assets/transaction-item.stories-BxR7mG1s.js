import{j as t}from"./iframe-D8HuPklR.js";import{A as e}from"./amount-BQsqQYGO.js";import{T as a}from"./transaction-item-1yNFMmpo.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./address-display-BLKTwJkl.js";import"./web-DAAeEFIs.js";import"./createReactComponent-DdmPrrAT.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-5HKfA7bW.js";import"./index-D85HYSDi.js";import"./IconCheck-Bm191dgP.js";import"./chain-icon-ZTjI2YHg.js";import"./gradient-button-BoxP_5VQ.js";import"./index-DO3qvWDr.js";import"./index-B_jtOnfb.js";import"./loading-spinner-CI59dVg1.js";import"./empty-state-AHA5q4Af.js";import"./skeleton-n7XL7W8x.js";import"./amount-display-xaPhfsQD.js";import"./NumberFlow-client-48rw3j0J-C8Uh9xZE.js";import"./animated-number-B7Ac1SOd.js";import"./time-display-CAOlWQlz.js";import"./qr-code-B4m9ayQ4.js";import"./index-fAcS8NTV.js";import"./icon-circle--K3XnjCB.js";import"./copyable-text-FxibUpBr.js";import"./IconAlertCircle-DmfGovmB.js";import"./IconAlertTriangle-DDmjzwOD.js";import"./IconCircleCheck-D-M2FNtX.js";import"./IconInfoCircle-CxAPThhN.js";import"./button-B8ZysgrZ.js";import"./useButton-hp5SGEGC.js";import"./useRenderElement-Dtgsp6Pg.js";import"./IconX-CfRcC0S9.js";import"./IconDots-Sxr6XZN3.js";import"./IconShieldCheck-bljxd_qn.js";import"./IconTrash-kwiUrPG-.js";import"./IconCoins-C58B3_g9.js";import"./IconSparkles-CEkQEtKZ.js";const tt={title:"Transaction/TransactionItem",component:a,tags:["autodocs"]},c={id:"1",type:"send",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(Date.now()-36e5)},d={id:"2",type:"receive",status:"confirmed",amount:e.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"TRX9876543210fedcba9876543210fedcba",timestamp:new Date(Date.now()-864e5)},p={id:"3",type:"send",status:"pending",amount:e.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date},l={id:"4",type:"send",status:"failed",amount:e.fromFormatted("200",6,"TRX"),symbol:"TRX",address:"TRX1111222233334444555566667777888899",timestamp:new Date(Date.now()-72e5)},o={args:{transaction:c,onClick:()=>alert("View transaction")}},r={args:{transaction:d,onClick:()=>alert("View transaction")}},n={args:{transaction:p,onClick:()=>alert("View transaction")}},s={args:{transaction:l,onClick:()=>alert("View transaction")}},i={args:{transaction:{id:"5",type:"exchange",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT → ETH",address:"0xdex1234567890",timestamp:new Date(Date.now()-18e5)},onClick:()=>alert("View swap")}},m={render:()=>t.jsxs("div",{className:"space-y-1",children:[t.jsx(a,{transaction:c,onClick:()=>{}}),t.jsx(a,{transaction:d,onClick:()=>{}}),t.jsx(a,{transaction:p,onClick:()=>{}}),t.jsx(a,{transaction:l,onClick:()=>{}}),t.jsx(a,{transaction:{id:"5",type:"stake",status:"confirmed",amount:e.fromFormatted("1000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(Date.now()-1728e5)},onClick:()=>{}})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const at=["Send","Receive","Pending","Failed","Swap","AllTypes"];export{m as AllTypes,s as Failed,n as Pending,r as Receive,o as Send,i as Swap,at as __namedExportsOrder,tt as default};
