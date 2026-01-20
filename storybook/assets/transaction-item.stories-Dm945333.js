import{j as t}from"./iframe-DP2WwkEK.js";import{A as e}from"./amount-BQsqQYGO.js";import{T as a}from"./transaction-item-jJYqg2Lv.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./address-display-CveFfeTt.js";import"./web-Bt-WgROb.js";import"./createReactComponent-B9zKjBQW.js";import"./breakpoint-C1BNOfKS.js";import"./schemas-B18CumQY.js";import"./useTranslation-D56OS28U.js";import"./index-B3ErpZrp.js";import"./IconCheck-ByzzR-xm.js";import"./chain-icon-CuwEql4x.js";import"./index-C9Fec6lp.js";import"./LoadingSpinner-CKAsVYyD.js";import"./NumberFlow-client-48rw3j0J-B1amY8-Z.js";import"./amount-display-BO2LBxjd.js";import"./animated-number-CI5dpkcx.js";import"./time-display-CL96gpQM.js";import"./copyable-text-7ImiNVlV.js";import"./IconX-DwKkd_DL.js";import"./button-DkzmP_wT.js";import"./useButton-DbPtD0Db.js";import"./useRenderElement-CTFMrgbn.js";import"./transaction-meta-DTHRoAxH.js";import"./IconDots-QblRZhpA.js";import"./IconShieldCheck-Zxv9K2bk.js";import"./IconApps-DheENsy7.js";import"./IconCoins-D2q5RZ2D.js";import"./IconSparkles-CnnFvCUX.js";import"./IconLock-D0JzPiP3.js";import"./IconTrash-tIMs8KzZ.js";import"./IconRefresh-DJgIlVYK.js";const K={title:"Transaction/TransactionItem",component:a,tags:["autodocs"]},m={id:"1",type:"send",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(Date.now()-36e5)},d={id:"2",type:"receive",status:"confirmed",amount:e.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"TRX9876543210fedcba9876543210fedcba",timestamp:new Date(Date.now()-864e5)},p={id:"3",type:"send",status:"pending",amount:e.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date},l={id:"4",type:"send",status:"failed",amount:e.fromFormatted("200",6,"TRX"),symbol:"TRX",address:"TRX1111222233334444555566667777888899",timestamp:new Date(Date.now()-72e5)},o={args:{transaction:m,onClick:()=>alert("View transaction")}},r={args:{transaction:d,onClick:()=>alert("View transaction")}},n={args:{transaction:p,onClick:()=>alert("View transaction")}},s={args:{transaction:l,onClick:()=>alert("View transaction")}},i={args:{transaction:{id:"5",type:"exchange",status:"confirmed",amount:e.fromFormatted("100",6,"USDT"),symbol:"USDT → ETH",address:"0xdex1234567890",timestamp:new Date(Date.now()-18e5)},onClick:()=>alert("View swap")}},c={render:()=>t.jsxs("div",{className:"space-y-1",children:[t.jsx(a,{transaction:m,onClick:()=>{}}),t.jsx(a,{transaction:d,onClick:()=>{}}),t.jsx(a,{transaction:p,onClick:()=>{}}),t.jsx(a,{transaction:l,onClick:()=>{}}),t.jsx(a,{transaction:{id:"5",type:"stake",status:"confirmed",amount:e.fromFormatted("1000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(Date.now()-1728e5)},onClick:()=>{}})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};const L=["Send","Receive","Pending","Failed","Swap","AllTypes"];export{c as AllTypes,s as Failed,n as Pending,r as Receive,o as Send,i as Swap,L as __namedExportsOrder,K as default};
