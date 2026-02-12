import{j as e}from"./iframe-BKKGzOJ9.js";import{F as s}from"./fee-display-B1qX4hpU.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./LoadingSpinner-dN-QOyE-.js";import"./NumberFlow-client-48rw3j0J-BgrfNshU.js";import"./amount-display-CGSHDd6a.js";import"./animated-number-BsWXdyCs.js";import"./time-display-Ir9nLGL6.js";import"./useTranslation-DhkL1aew.js";import"./index-BQbtQqVg.js";import"./service-status-alert-BfBcAhja.js";import"./web-az20aKeq.js";import"./createReactComponent-CkLt9PPZ.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-Dg234RuK.js";import"./IconX-CEFuVlOT.js";import"./IconAlertTriangle-BWTIwlVc.js";import"./IconLock-CUxL14QZ.js";import"./IconPencil-DLevH48O.js";const w={title:"Transaction/FeeDisplay",component:s,tags:["autodocs"],argTypes:{amount:{control:"text"},symbol:{control:"text"},fiatValue:{control:"number"},fiatSymbol:{control:"text"},isLoading:{control:"boolean"},highFeeThreshold:{control:"number"}}},a={args:{amount:.0021,symbol:"ETH"}},t={args:{amount:.0021,symbol:"ETH",fiatValue:5.25}},r={args:{amount:.05,symbol:"ETH",fiatValue:125.5,highFeeThreshold:50}},o={args:{amount:0,symbol:"ETH",isLoading:!0}},n={args:{amount:1e-7,symbol:"ETH",fiatValue:2e-4}},m={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"Normal Fee"}),e.jsx(s,{amount:.0021,symbol:"ETH",fiatValue:5.25})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"High Fee Warning"}),e.jsx(s,{amount:.05,symbol:"ETH",fiatValue:125.5,highFeeThreshold:50})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"Loading"}),e.jsx(s,{amount:0,symbol:"ETH",isLoading:!0})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"No Fiat"}),e.jsx(s,{amount:.001,symbol:"TRX"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"Very Small"}),e.jsx(s,{amount:1e-7,symbol:"BTC",fiatValue:.001})]})]})},i={render:()=>e.jsxs("div",{className:"w-80 rounded-lg border border-border bg-card p-4",children:[e.jsx("h3",{className:"mb-4 font-semibold",children:"Transaction Details"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Amount"}),e.jsx("span",{className:"font-medium",children:"0.5 ETH"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"To"}),e.jsx("span",{className:"font-mono text-sm",children:"0x1234...5678"})]}),e.jsx("div",{className:"border-t border-border pt-3",children:e.jsxs("div",{className:"flex items-start justify-between",children:[e.jsx("span",{className:"text-muted-foreground",children:"Network Fee"}),e.jsx(s,{amount:.0021,symbol:"ETH",fiatValue:5.25})]})})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    amount: 0.0021,
    symbol: 'ETH'
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    amount: 0.0021,
    symbol: 'ETH',
    fiatValue: 5.25
  }
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    amount: 0.05,
    symbol: 'ETH',
    fiatValue: 125.5,
    highFeeThreshold: 50
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    amount: 0,
    symbol: 'ETH',
    isLoading: true
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    amount: 0.0000001,
    symbol: 'ETH',
    fiatValue: 0.0002
  }
}`,...n.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Normal Fee</p>
        <FeeDisplay amount={0.0021} symbol="ETH" fiatValue={5.25} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">High Fee Warning</p>
        <FeeDisplay amount={0.05} symbol="ETH" fiatValue={125.5} highFeeThreshold={50} />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Loading</p>
        <FeeDisplay amount={0} symbol="ETH" isLoading />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">No Fiat</p>
        <FeeDisplay amount={0.001} symbol="TRX" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">Very Small</p>
        <FeeDisplay amount={0.0000001} symbol="BTC" fiatValue={0.001} />
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-80 rounded-lg border border-border bg-card p-4">
      <h3 className="mb-4 font-semibold">Transaction Details</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-medium">0.5 ETH</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">To</span>
          <span className="font-mono text-sm">0x1234...5678</span>
        </div>
        <div className="border-t border-border pt-3">
          <div className="flex items-start justify-between">
            <span className="text-muted-foreground">Network Fee</span>
            <FeeDisplay amount={0.0021} symbol="ETH" fiatValue={5.25} />
          </div>
        </div>
      </div>
    </div>
}`,...i.parameters?.docs?.source}}};const L=["Default","WithFiat","HighFeeWarning","Loading","SmallAmount","AllVariants","InContext"];export{m as AllVariants,a as Default,r as HighFeeWarning,i as InContext,o as Loading,n as SmallAmount,t as WithFiat,L as __namedExportsOrder,w as default};
