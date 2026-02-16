import{j as s}from"./iframe-BsFAjrMt.js";import{A as e}from"./address-display-DbgwgdFw.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./web-DNNLxmRA.js";import"./createReactComponent-CZurZBpK.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./useTranslation-D3dR0QcB.js";import"./index-BnAl6yxc.js";import"./IconCheck-CEKgIBoF.js";const j={title:"Wallet/AddressDisplay",component:e,tags:["autodocs"],argTypes:{copyable:{control:"boolean"}}},d="0x1234567890abcdef1234567890abcdef12345678",o="TAbcdefghijklmnopqrstuvwxyz123456789",c="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",r={render:()=>s.jsx("div",{className:"w-full",children:s.jsx(e,{address:d})})},a={render:()=>s.jsx("div",{className:"w-full",children:s.jsx(e,{address:d,copyable:!1})})},t={render:()=>s.jsxs("div",{className:"space-y-4",children:[s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("span",{className:"text-muted-foreground w-16 shrink-0 text-sm",children:"ETH:"}),s.jsx(e,{address:d})]}),s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("span",{className:"text-muted-foreground w-16 shrink-0 text-sm",children:"TRON:"}),s.jsx(e,{address:o})]}),s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("span",{className:"text-muted-foreground w-16 shrink-0 text-sm",children:"BTC:"}),s.jsx(e,{address:c})]})]})},n={render:()=>s.jsxs("div",{className:"space-y-6",children:[s.jsx("p",{className:"text-muted-foreground text-sm",children:"智能截断：根据容器宽度自动计算最优显示"}),s.jsxs("div",{className:"w-[150px] border border-dashed p-2",children:[s.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"150px"}),s.jsx(e,{address:d})]}),s.jsxs("div",{className:"w-[200px] border border-dashed p-2",children:[s.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"200px"}),s.jsx(e,{address:d})]}),s.jsxs("div",{className:"w-[300px] border border-dashed p-2",children:[s.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"300px"}),s.jsx(e,{address:d})]}),s.jsxs("div",{className:"w-[400px] border border-dashed p-2",children:[s.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"400px"}),s.jsx(e,{address:d})]}),s.jsxs("div",{className:"w-full border border-dashed p-2",children:[s.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"full width"}),s.jsx(e,{address:d})]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-full">
      <AddressDisplay address={ethAddress} />
    </div>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-full">
      <AddressDisplay address={ethAddress} copyable={false} />
    </div>
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-16 shrink-0 text-sm">ETH:</span>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-16 shrink-0 text-sm">TRON:</span>
        <AddressDisplay address={tronAddress} />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground w-16 shrink-0 text-sm">BTC:</span>
        <AddressDisplay address={btcAddress} />
      </div>
    </div>
}`,...t.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <p className="text-muted-foreground text-sm">智能截断：根据容器宽度自动计算最优显示</p>
      <div className="w-[150px] border border-dashed p-2">
        <p className="text-muted-foreground mb-1 text-xs">150px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-[200px] border border-dashed p-2">
        <p className="text-muted-foreground mb-1 text-xs">200px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-[300px] border border-dashed p-2">
        <p className="text-muted-foreground mb-1 text-xs">300px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-[400px] border border-dashed p-2">
        <p className="text-muted-foreground mb-1 text-xs">400px</p>
        <AddressDisplay address={ethAddress} />
      </div>
      <div className="w-full border border-dashed p-2">
        <p className="text-muted-foreground mb-1 text-xs">full width</p>
        <AddressDisplay address={ethAddress} />
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};const g=["Default","NotCopyable","DifferentChains","Responsive"];export{r as Default,t as DifferentChains,a as NotCopyable,n as Responsive,g as __namedExportsOrder,j as default};
