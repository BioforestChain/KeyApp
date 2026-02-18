import{j as s}from"./iframe-D60tT8n5.js";import{T as a,a as u}from"./transaction-status-DX2ZCeBc.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./IconBan-COfE1Lh4.js";import"./createReactComponent-CSeiZBWP.js";import"./IconClock-CAzNWsc4.js";import"./IconX-BDvbb92k.js";import"./IconCheck-CHk2f65U.js";const b={title:"Transaction/TransactionStatus",component:a,tags:["autodocs"],argTypes:{status:{control:"select",options:["success","failed","pending","cancelled"]},size:{control:"select",options:["sm","md","lg"]},showLabel:{control:"boolean"},label:{control:"text"}}},m=["success","failed","pending","cancelled"],t={args:{status:"success"}},r={render:()=>s.jsx("div",{className:"flex flex-wrap gap-3",children:m.map(e=>s.jsx(a,{status:e},e))})},n={render:()=>s.jsx("div",{className:"space-y-4",children:["sm","md","lg"].map(e=>s.jsxs("div",{className:"flex items-center gap-3",children:[s.jsx("span",{className:"w-8 text-sm text-muted-foreground",children:e}),m.map(i=>s.jsx(a,{status:i,size:e},i))]},e))})},c={render:()=>s.jsx("div",{className:"flex gap-4",children:m.map(e=>s.jsxs("div",{className:"flex flex-col items-center gap-1",children:[s.jsx(a,{status:e,showLabel:!1}),s.jsx("span",{className:"text-xs text-muted-foreground",children:e})]},e))})},o={render:()=>s.jsx("div",{className:"flex gap-4",children:m.map(e=>s.jsxs("div",{className:"flex flex-col items-center gap-1",children:[s.jsx(u,{status:e,size:"lg"}),s.jsx("span",{className:"text-xs text-muted-foreground",children:e})]},e))})},l={render:()=>s.jsxs("div",{className:"flex flex-wrap gap-3",children:[s.jsx(a,{status:"success",label:"Confirmed"}),s.jsx(a,{status:"pending",label:"Processing"}),s.jsx(a,{status:"failed",label:"Rejected"}),s.jsx(a,{status:"cancelled",label:"Reverted"})]})},d={render:()=>s.jsx("div",{className:"w-80 space-y-2",children:[{hash:"0x1234...abcd",amount:"+0.5 ETH",status:"success"},{hash:"0x5678...efgh",amount:"-100 USDT",status:"pending"},{hash:"0x9abc...ijkl",amount:"-0.1 ETH",status:"failed"},{hash:"0xdef0...mnop",amount:"-50 USDT",status:"cancelled"}].map(e=>s.jsxs("div",{className:"flex items-center justify-between rounded-lg border border-border p-3",children:[s.jsxs("div",{children:[s.jsx("p",{className:"font-mono text-sm",children:e.hash}),s.jsx("p",{className:"text-sm text-muted-foreground",children:e.amount})]}),s.jsx(a,{status:e.status,size:"sm"})]},e.hash))})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success'
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-3">
      {allStatuses.map(status => <TransactionStatus key={status} status={status} />)}
    </div>
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      {(['sm', 'md', 'lg'] as const).map(size => <div key={size} className="flex items-center gap-3">
          <span className="w-8 text-sm text-muted-foreground">{size}</span>
          {allStatuses.map(status => <TransactionStatus key={status} status={status} size={size} />)}
        </div>)}
    </div>
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4">
      {allStatuses.map(status => <div key={status} className="flex flex-col items-center gap-1">
          <TransactionStatus status={status} showLabel={false} />
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>)}
    </div>
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-4">
      {allStatuses.map(status => <div key={status} className="flex flex-col items-center gap-1">
          <TransactionStatusIcon status={status} size="lg" />
          <span className="text-xs text-muted-foreground">{status}</span>
        </div>)}
    </div>
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-3">
      <TransactionStatus status="success" label="Confirmed" />
      <TransactionStatus status="pending" label="Processing" />
      <TransactionStatus status="failed" label="Rejected" />
      <TransactionStatus status="cancelled" label="Reverted" />
    </div>
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-80 space-y-2">
      {[{
      hash: '0x1234...abcd',
      amount: '+0.5 ETH',
      status: 'success' as const
    }, {
      hash: '0x5678...efgh',
      amount: '-100 USDT',
      status: 'pending' as const
    }, {
      hash: '0x9abc...ijkl',
      amount: '-0.1 ETH',
      status: 'failed' as const
    }, {
      hash: '0xdef0...mnop',
      amount: '-50 USDT',
      status: 'cancelled' as const
    }].map(tx => <div key={tx.hash} className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="font-mono text-sm">{tx.hash}</p>
            <p className="text-sm text-muted-foreground">{tx.amount}</p>
          </div>
          <TransactionStatus status={tx.status} size="sm" />
        </div>)}
    </div>
}`,...d.parameters?.docs?.source}}};const T=["Default","AllStatuses","AllSizes","IconOnly","StatusIcons","CustomLabels","InContext"];export{n as AllSizes,r as AllStatuses,l as CustomLabels,t as Default,c as IconOnly,d as InContext,o as StatusIcons,T as __namedExportsOrder,b as default};
