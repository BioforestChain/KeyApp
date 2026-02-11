import{j as t}from"./iframe-mWBAGdu2.js";import{A as e}from"./amount-BQsqQYGO.js";import{T as a}from"./transaction-item-B7nDttdd.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./address-display-DKT0vOoz.js";import"./web-CZBBkCl8.js";import"./createReactComponent-B-6fW5hv.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./useTranslation-CgcY4kD2.js";import"./index-CQqlk44_.js";import"./IconCheck-CuLK5Lso.js";import"./chain-icon-2HeprLOs.js";import"./service-B4irENPO.js";import"./index-D0E7N0oa.js";import"./derivation-CJhU_MGF.js";import"./LoadingSpinner-5yBM7ljk.js";import"./NumberFlow-client-48rw3j0J-CcYGONdn.js";import"./amount-display-wQjnDxjL.js";import"./animated-number-q7Zuurvj.js";import"./time-display-C1uapCJl.js";import"./service-status-alert-6hcq_l5R.js";import"./IconX-BqC2qfgB.js";import"./IconAlertTriangle-CNSsSeij.js";import"./IconLock-BgRk-y-j.js";import"./button-CWmjkcwj.js";import"./useButton-CzZE3PFl.js";import"./useRenderElement-sc-z0PWr.js";import"./transaction-meta-Cj9oQZ9L.js";import"./IconDots-KtAZEoMt.js";import"./IconShieldCheck-DlibSZX5.js";import"./IconApps-CYwRRxTF.js";import"./IconCoins-ec82T06A.js";import"./IconSparkles-Pvooc5dW.js";import"./IconTrash-BKP2FQQB.js";import"./IconRefresh-CuhR68Lg.js";const W={title:"Transaction/TransactionItem",component:a,tags:["autodocs"]},c={id:"1",type:"send",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(Date.now()-36e5)},d={id:"2",type:"receive",status:"confirmed",amount:e.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"TRX9876543210fedcba9876543210fedcba",timestamp:new Date(Date.now()-864e5)},p={id:"3",type:"send",status:"pending",amount:e.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date},l={id:"4",type:"send",status:"failed",amount:e.fromFormatted("200",6,"TRX"),symbol:"TRX",address:"TRX1111222233334444555566667777888899",timestamp:new Date(Date.now()-72e5)},o={args:{transaction:c,onClick:()=>alert("View transaction")}},r={args:{transaction:d,onClick:()=>alert("View transaction")}},n={args:{transaction:p,onClick:()=>alert("View transaction")}},s={args:{transaction:l,onClick:()=>alert("View transaction")}},i={args:{transaction:{id:"5",type:"exchange",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT → ETH",address:"0xdex1234567890",timestamp:new Date(Date.now()-18e5)},onClick:()=>alert("View swap")}},m={render:()=>t.jsxs("div",{className:"space-y-1",children:[t.jsx(a,{transaction:c,onClick:()=>{}}),t.jsx(a,{transaction:d,onClick:()=>{}}),t.jsx(a,{transaction:p,onClick:()=>{}}),t.jsx(a,{transaction:l,onClick:()=>{}}),t.jsx(a,{transaction:{id:"5",type:"stake",status:"confirmed",amount:e.fromFormatted("1000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(Date.now()-1728e5)},onClick:()=>{}})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};const Y=["Send","Receive","Pending","Failed","Swap","AllTypes"];export{m as AllTypes,s as Failed,n as Pending,r as Receive,o as Send,i as Swap,Y as __namedExportsOrder,W as default};
