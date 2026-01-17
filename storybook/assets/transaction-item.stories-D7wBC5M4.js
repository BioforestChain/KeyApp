import{j as t}from"./iframe-CnCQVOpP.js";import{A as e}from"./amount-BQsqQYGO.js";import{T as a}from"./transaction-item-CiT9i9I_.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./address-display-B16XIfyV.js";import"./web-Bmffpo9t.js";import"./createReactComponent-DMt2BglU.js";import"./breakpoint-C1BNOfKS.js";import"./schemas-B18CumQY.js";import"./useTranslation-C6ajbKrk.js";import"./index-L9QLT5oL.js";import"./IconCheck-BzvylCVH.js";import"./chain-icon-DuxtU-gn.js";import"./index-CuTA__Ds.js";import"./NumberFlow-client-48rw3j0J-HK_Q3nRN.js";import"./amount-display-LCJZASGr.js";import"./animated-number-CImjvOK-.js";import"./time-display-GUSalHiU.js";import"./copyable-text-C3qNeJzm.js";import"./IconX-BCy4QeDS.js";import"./button-BgYAK_3A.js";import"./useButton-G5ZReQd4.js";import"./useRenderElement-D677GkQS.js";import"./transaction-meta-BKPteF0L.js";import"./IconDots-Dqar4tbZ.js";import"./IconShieldCheck-D_Rv2LAt.js";import"./IconApps-C4207Eu_.js";import"./IconCoins-CAbK08YW.js";import"./IconSparkles-Bw4iQhrz.js";import"./IconLock-DLKq2DaC.js";import"./IconTrash-SZz-rBZU.js";import"./IconRefresh-CYUEkh5Y.js";const J={title:"Transaction/TransactionItem",component:a,tags:["autodocs"]},m={id:"1",type:"send",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(Date.now()-36e5)},d={id:"2",type:"receive",status:"confirmed",amount:e.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"TRX9876543210fedcba9876543210fedcba",timestamp:new Date(Date.now()-864e5)},p={id:"3",type:"send",status:"pending",amount:e.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date},l={id:"4",type:"send",status:"failed",amount:e.fromFormatted("200",6,"TRX"),symbol:"TRX",address:"TRX1111222233334444555566667777888899",timestamp:new Date(Date.now()-72e5)},o={args:{transaction:m,onClick:()=>alert("View transaction")}},r={args:{transaction:d,onClick:()=>alert("View transaction")}},n={args:{transaction:p,onClick:()=>alert("View transaction")}},s={args:{transaction:l,onClick:()=>alert("View transaction")}},i={args:{transaction:{id:"5",type:"exchange",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT → ETH",address:"0xdex1234567890",timestamp:new Date(Date.now()-18e5)},onClick:()=>alert("View swap")}},c={render:()=>t.jsxs("div",{className:"space-y-1",children:[t.jsx(a,{transaction:m,onClick:()=>{}}),t.jsx(a,{transaction:d,onClick:()=>{}}),t.jsx(a,{transaction:p,onClick:()=>{}}),t.jsx(a,{transaction:l,onClick:()=>{}}),t.jsx(a,{transaction:{id:"5",type:"stake",status:"confirmed",amount:e.fromFormatted("1000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(Date.now()-1728e5)},onClick:()=>{}})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const K=["Send","Receive","Pending","Failed","Swap","AllTypes"];export{c as AllTypes,s as Failed,n as Pending,r as Receive,o as Send,i as Swap,K as __namedExportsOrder,J as default};
