import{j as p}from"./iframe-BuDZgClS.js";import{A as t}from"./amount-BQsqQYGO.js";import{T as d}from"./transaction-list-QnAML79n.js";import{G as u}from"./LoadingSpinner-DcGSo1AE.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./transaction-item-Ch55xkmo.js";import"./address-display-BD-jr4tD.js";import"./web-DI_ANFt8.js";import"./createReactComponent-CCT_KxSw.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./useTranslation-CwjW3P5e.js";import"./index-0yvu-sz8.js";import"./IconCheck-BYf6dG4O.js";import"./chain-icon-BykvBTsd.js";import"./service-Djioy5S5.js";import"./index-D0E7N0oa.js";import"./derivation-CmDALZW3.js";import"./amount-display-BxEvaYce.js";import"./NumberFlow-client-48rw3j0J-2MHyCwTo.js";import"./animated-number-DQI5-4sM.js";import"./time-display-D-azlSU1.js";import"./service-status-alert-Bqlmowzc.js";import"./IconX-viUyieuq.js";import"./IconAlertTriangle-CEil6iNr.js";import"./IconLock-DEii1Rb4.js";import"./button-CqZpCM-a.js";import"./useButton-BPP4vCD8.js";import"./useRenderElement-CnI4ETw1.js";import"./transaction-meta-nITteHVt.js";import"./IconDots-7lZEiWC1.js";import"./IconShieldCheck-5alHW1iU.js";import"./IconApps-2q64GzC2.js";import"./IconCoins-CTYCb9vx.js";import"./IconSparkles-BMrxQJKM.js";import"./IconTrash-28kkW-YI.js";import"./IconRefresh-Kse1x6Q5.js";const W={title:"Transaction/TransactionList",component:d,tags:["autodocs"]},a=Date.now(),c=[{id:"1",type:"send",status:"confirmed",amount:t.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(a-36e5)},{id:"2",type:"receive",status:"confirmed",amount:t.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date(a-72e5)},{id:"3",type:"send",status:"pending",amount:t.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0x9876543210fedcba9876543210fedcba98765432",timestamp:new Date(a-18e5)},{id:"4",type:"receive",status:"confirmed",amount:t.fromFormatted("1000",6,"TRX"),symbol:"TRX",address:"TRX1234567890123456789012345678901234",timestamp:new Date(a-864e5-36e5)},{id:"5",type:"send",status:"failed",amount:t.fromFormatted("200",6,"USDT"),symbol:"USDT",address:"0xfedcba9876543210fedcba9876543210fedcba98",timestamp:new Date(a-864e5-72e5)},{id:"6",type:"stake",status:"confirmed",amount:t.fromFormatted("5000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(a-1728e5)}],o={args:{transactions:c,onTransactionClick:e=>alert(`查看交易: ${e.id}`)}},r={args:{transactions:[],loading:!0}},s={args:{transactions:[],emptyAction:p.jsx(u,{size:"sm",children:"开始转账"})}},n={args:{transactions:[],emptyTitle:"没有找到交易",emptyDescription:"尝试调整筛选条件",emptyAction:p.jsx("button",{className:"text-primary text-sm font-medium",children:"清除筛选"})}},m={args:{transactions:[c[0]],onTransactionClick:e=>alert(`查看交易: ${e.id}`)}},i={args:{transactions:[...c,{id:"7",type:"receive",status:"confirmed",amount:t.fromFormatted("0.1",8,"BTC"),symbol:"BTC",address:"bc1q123456789",timestamp:new Date(a-2592e5)},{id:"8",type:"exchange",status:"confirmed",amount:t.fromFormatted("500",6,"USDT"),symbol:"USDT → ETH",address:"DEX Router",timestamp:new Date(a-3456e5)}],onTransactionClick:e=>console.log("Clicked:",e)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: mockTransactions,
    onTransactionClick: tx => alert(\`查看交易: \${tx.id}\`)
  }
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: [],
    loading: true
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: [],
    emptyAction: <GradientButton size="sm">开始转账</GradientButton>
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: [],
    emptyTitle: '没有找到交易',
    emptyDescription: '尝试调整筛选条件',
    emptyAction: <button className="text-primary text-sm font-medium">
        清除筛选
      </button>
  }
}`,...n.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: [mockTransactions[0]!],
    onTransactionClick: tx => alert(\`查看交易: \${tx.id}\`)
  }
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    transactions: [...mockTransactions, {
      id: '7',
      type: 'receive',
      status: 'confirmed',
      amount: Amount.fromFormatted('0.1', 8, 'BTC'),
      symbol: 'BTC',
      address: 'bc1q123456789',
      timestamp: new Date(now - 259200000)
    }, {
      id: '8',
      type: 'exchange',
      status: 'confirmed',
      amount: Amount.fromFormatted('500', 6, 'USDT'),
      symbol: 'USDT → ETH',
      address: 'DEX Router',
      timestamp: new Date(now - 345600000)
    }],
    onTransactionClick: tx => console.log('Clicked:', tx)
  }
}`,...i.parameters?.docs?.source}}};const Y=["Default","Loading","Empty","CustomEmpty","SingleTransaction","ManyTransactions"];export{n as CustomEmpty,o as Default,s as Empty,r as Loading,i as ManyTransactions,m as SingleTransaction,Y as __namedExportsOrder,W as default};
