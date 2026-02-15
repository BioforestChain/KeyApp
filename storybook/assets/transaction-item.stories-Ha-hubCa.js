import{j as t}from"./iframe-Cd1kewla.js";import{A as e}from"./amount-BQsqQYGO.js";import{T as a}from"./transaction-item-DMNH4Ila.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./address-display-Cbk8XVLk.js";import"./web-KFzE8mwj.js";import"./createReactComponent-DE2d0GlP.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./useTranslation-BEYE2zBY.js";import"./index-DC4Hx_HQ.js";import"./IconCheck-Do5gMhwk.js";import"./chain-icon-DyZLxnGT.js";import"./service-DEDe-FPR.js";import"./index-D0E7N0oa.js";import"./derivation-C7zok9CF.js";import"./LoadingSpinner-LptAbqd6.js";import"./NumberFlow-client-48rw3j0J-CQSvsoJ7.js";import"./amount-display-DUMKR089.js";import"./animated-number-Cn323t_z.js";import"./time-display-TTOaanEO.js";import"./service-status-alert-CVGymN48.js";import"./IconX-bU4nCkLv.js";import"./IconAlertTriangle-DeRWT6_I.js";import"./IconLock-BURiWEzT.js";import"./button-DKtPsAVZ.js";import"./useButton-DZGOlRym.js";import"./useRenderElement-5kjXJKMh.js";import"./transaction-meta-enKsQYOp.js";import"./IconDots-ecvXomS6.js";import"./IconShieldCheck-D0ngpGBk.js";import"./IconApps-CgZECHSR.js";import"./IconCoins-S-R9EVS9.js";import"./IconSparkles-331_zKOV.js";import"./IconTrash-Dwqf7K-8.js";import"./IconRefresh-fuhmiywO.js";const W={title:"Transaction/TransactionItem",component:a,tags:["autodocs"]},c={id:"1",type:"send",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(Date.now()-36e5)},d={id:"2",type:"receive",status:"confirmed",amount:e.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"TRX9876543210fedcba9876543210fedcba",timestamp:new Date(Date.now()-864e5)},p={id:"3",type:"send",status:"pending",amount:e.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date},l={id:"4",type:"send",status:"failed",amount:e.fromFormatted("200",6,"TRX"),symbol:"TRX",address:"TRX1111222233334444555566667777888899",timestamp:new Date(Date.now()-72e5)},o={args:{transaction:c,onClick:()=>alert("View transaction")}},r={args:{transaction:d,onClick:()=>alert("View transaction")}},n={args:{transaction:p,onClick:()=>alert("View transaction")}},s={args:{transaction:l,onClick:()=>alert("View transaction")}},i={args:{transaction:{id:"5",type:"exchange",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT → ETH",address:"0xdex1234567890",timestamp:new Date(Date.now()-18e5)},onClick:()=>alert("View swap")}},m={render:()=>t.jsxs("div",{className:"space-y-1",children:[t.jsx(a,{transaction:c,onClick:()=>{}}),t.jsx(a,{transaction:d,onClick:()=>{}}),t.jsx(a,{transaction:p,onClick:()=>{}}),t.jsx(a,{transaction:l,onClick:()=>{}}),t.jsx(a,{transaction:{id:"5",type:"stake",status:"confirmed",amount:e.fromFormatted("1000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(Date.now()-1728e5)},onClick:()=>{}})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
