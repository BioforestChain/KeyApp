import{j as p}from"./iframe-CVsnPOYc.js";import{A as t}from"./amount-BQsqQYGO.js";import{T as d}from"./transaction-list-D7JnZO4U.js";import{G as u}from"./gradient-button-DEoESV6_.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./transaction-item-x8WhBrzr.js";import"./address-display-CsSBwCJO.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-DzAxu0sT.js";import"./index-DwHoKsdM.js";import"./IconCheck-CTmUUJ-J.js";import"./createReactComponent-BX-2XwI1.js";import"./IconCopy-BXs4XcV9.js";import"./chain-icon-CtFDUT2x.js";import"./loading-spinner-Cil9EiWH.js";import"./empty-state-B67wnvMz.js";import"./skeleton-BRb6Luxt.js";import"./amount-display-BTdiPLBA.js";import"./NumberFlow-client-48rw3j0J-B2Ei7vW0.js";import"./animated-number-DbdhG2Yn.js";import"./time-display-BNJXkPMl.js";import"./qr-code-BNS0Yg3I.js";import"./index-CWZFdeOX.js";import"./icon-circle-CQXqp_re.js";import"./error-boundary-LLpEY9XN.js";import"./IconAlertCircle-D-RAb7M5.js";import"./IconAlertTriangle-Dve38QOj.js";import"./IconCircleCheck-DjMMdPa7.js";import"./IconInfoCircle-CwquL7E4.js";import"./button-n34NNLFc.js";import"./index-B_jtOnfb.js";import"./useButton-DNnqn-kk.js";import"./useRenderElement-DjccSJiH.js";import"./IconDots-DGBG7xxm.js";import"./IconTrash-DSRxh7lm.js";import"./IconCoins-Bz0Mahfb.js";import"./IconSparkles-114P2s_d.js";import"./index-B54l9L7G.js";const tt={title:"Transaction/TransactionList",component:d,tags:["autodocs"]},a=Date.now(),c=[{id:"1",type:"send",status:"confirmed",amount:t.fromFormatted("100",6,"USDT"),symbol:"USDT",address:"0x1234567890abcdef1234567890abcdef12345678",timestamp:new Date(a-36e5)},{id:"2",type:"receive",status:"confirmed",amount:t.fromFormatted("0.5",18,"ETH"),symbol:"ETH",address:"0xabcdef1234567890abcdef1234567890abcdef12",timestamp:new Date(a-72e5)},{id:"3",type:"send",status:"pending",amount:t.fromFormatted("50",6,"USDT"),symbol:"USDT",address:"0x9876543210fedcba9876543210fedcba98765432",timestamp:new Date(a-18e5)},{id:"4",type:"receive",status:"confirmed",amount:t.fromFormatted("1000",6,"TRX"),symbol:"TRX",address:"TRX1234567890123456789012345678901234",timestamp:new Date(a-864e5-36e5)},{id:"5",type:"send",status:"failed",amount:t.fromFormatted("200",6,"USDT"),symbol:"USDT",address:"0xfedcba9876543210fedcba9876543210fedcba98",timestamp:new Date(a-864e5-72e5)},{id:"6",type:"stake",status:"confirmed",amount:t.fromFormatted("5000",8,"BFM"),symbol:"BFM",address:"质押合约",timestamp:new Date(a-1728e5)}],o={args:{transactions:c,onTransactionClick:e=>alert(`查看交易: ${e.id}`)}},r={args:{transactions:[],loading:!0}},s={args:{transactions:[],emptyAction:p.jsx(u,{size:"sm",children:"开始转账"})}},n={args:{transactions:[],emptyTitle:"没有找到交易",emptyDescription:"尝试调整筛选条件",emptyAction:p.jsx("button",{className:"text-primary text-sm font-medium",children:"清除筛选"})}},m={args:{transactions:[c[0]],onTransactionClick:e=>alert(`查看交易: ${e.id}`)}},i={args:{transactions:[...c,{id:"7",type:"receive",status:"confirmed",amount:t.fromFormatted("0.1",8,"BTC"),symbol:"BTC",address:"bc1q123456789",timestamp:new Date(a-2592e5)},{id:"8",type:"exchange",status:"confirmed",amount:t.fromFormatted("500",6,"USDT"),symbol:"USDT → ETH",address:"DEX Router",timestamp:new Date(a-3456e5)}],onTransactionClick:e=>console.log("Clicked:",e)}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};const at=["Default","Loading","Empty","CustomEmpty","SingleTransaction","ManyTransactions"];export{n as CustomEmpty,o as Default,s as Empty,r as Loading,i as ManyTransactions,m as SingleTransaction,at as __namedExportsOrder,tt as default};
