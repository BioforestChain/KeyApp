import{j as e}from"./iframe-g2b0m8DI.js";import{L as s}from"./loading-spinner-BKRfkk18.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./useTranslation-Cu2h0njW.js";import"./index-D3aA_s7S.js";const d={title:"Common/LoadingSpinner",component:s,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]},fullScreen:{control:"boolean"}}},r={},n={render:()=>e.jsxs("div",{className:"flex items-center gap-8",children:[e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{size:"sm"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"Small"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{size:"md"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"Medium"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{size:"lg"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"Large"})]})]})},a={render:()=>e.jsxs("button",{className:"bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2",children:[e.jsx(s,{size:"sm",className:"text-white"}),e.jsx("span",{children:"加载中..."})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-8">
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="sm" />
        <span className="text-muted-foreground text-xs">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="md" />
        <span className="text-muted-foreground text-xs">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LoadingSpinner size="lg" />
        <span className="text-muted-foreground text-xs">Large</span>
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <button className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded-md px-4 py-2">
      <LoadingSpinner size="sm" className="text-white" />
      <span>加载中...</span>
    </button>
}`,...a.parameters?.docs?.source}}};const p=["Default","AllSizes","InButton"];export{n as AllSizes,r as Default,a as InButton,p as __namedExportsOrder,d as default};
