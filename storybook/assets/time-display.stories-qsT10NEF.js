import{j as e}from"./iframe-DmSIcYar.js";import{T as s}from"./time-display-CI47nwju.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-5-CNWNe7.js";import"./index-CeB_thMf.js";const h={title:"Common/TimeDisplay",component:s,tags:["autodocs"],argTypes:{format:{control:"select",options:["relative","date","datetime","time"]}}},a=new Date,u=new Date(a.getTime()-300*1e3),t=new Date(a.getTime()-10800*1e3),p=new Date(a.getTime()-2880*60*1e3),v=new Date(a.getTime()-336*60*60*1e3),r={args:{value:u}},m={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"刚刚:"}),e.jsx(s,{value:a})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"5分钟前:"}),e.jsx(s,{value:u})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"3小时前:"}),e.jsx(s,{value:t})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"2天前:"}),e.jsx(s,{value:p})]}),e.jsxs("div",{className:"flex justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"2周前:"}),e.jsx(s,{value:v})]})]})},n={args:{value:a,format:"date"}},o={args:{value:a,format:"datetime"}},i={args:{value:a,format:"time"}},d={render:()=>e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-1 text-sm",children:"Relative (default)"}),e.jsx(s,{value:t,format:"relative"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-1 text-sm",children:"Date"}),e.jsx(s,{value:t,format:"date"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-1 text-sm",children:"DateTime"}),e.jsx(s,{value:t,format:"datetime"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-1 text-sm",children:"Time"}),e.jsx(s,{value:t,format:"time"})]})]})},l={render:()=>e.jsx("div",{className:"space-y-2",children:[{type:"发送",amount:"-100 USDT",time:u},{type:"接收",amount:"+0.5 ETH",time:t},{type:"兑换",amount:"100 USDT → 0.05 ETH",time:p}].map((c,x)=>e.jsxs("div",{className:"bg-muted/30 flex items-center justify-between rounded-lg p-3",children:[e.jsxs("div",{children:[e.jsx("p",{className:"font-medium",children:c.type}),e.jsx("p",{className:"text-muted-foreground text-sm",children:c.amount})]}),e.jsx(s,{value:c.time,className:"text-muted-foreground text-sm"})]},x))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: minutesAgo
  }
}`,...r.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">刚刚:</span>
        <TimeDisplay value={now} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">5分钟前:</span>
        <TimeDisplay value={minutesAgo} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">3小时前:</span>
        <TimeDisplay value={hoursAgo} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">2天前:</span>
        <TimeDisplay value={daysAgo} />
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">2周前:</span>
        <TimeDisplay value={weeksAgo} />
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    value: now,
    format: 'date'
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: now,
    format: 'datetime'
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    value: now,
    format: 'time'
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-3">
      <div>
        <p className="text-muted-foreground mb-1 text-sm">Relative (default)</p>
        <TimeDisplay value={hoursAgo} format="relative" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-sm">Date</p>
        <TimeDisplay value={hoursAgo} format="date" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-sm">DateTime</p>
        <TimeDisplay value={hoursAgo} format="datetime" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-sm">Time</p>
        <TimeDisplay value={hoursAgo} format="time" />
      </div>
    </div>
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      {[{
      type: '发送',
      amount: '-100 USDT',
      time: minutesAgo
    }, {
      type: '接收',
      amount: '+0.5 ETH',
      time: hoursAgo
    }, {
      type: '兑换',
      amount: '100 USDT → 0.05 ETH',
      time: daysAgo
    }].map((tx, i) => <div key={i} className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
          <div>
            <p className="font-medium">{tx.type}</p>
            <p className="text-muted-foreground text-sm">{tx.amount}</p>
          </div>
          <TimeDisplay value={tx.time} className="text-muted-foreground text-sm" />
        </div>)}
    </div>
}`,...l.parameters?.docs?.source}}};const D=["Default","RelativeTime","DateFormat","DateTimeFormat","TimeFormat","AllFormats","TransactionList"];export{d as AllFormats,n as DateFormat,o as DateTimeFormat,r as Default,m as RelativeTime,i as TimeFormat,l as TransactionList,D as __namedExportsOrder,h as default};
