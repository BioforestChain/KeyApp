import{j as a,r as n}from"./iframe-BI2yxCKi.js";import{A as o}from"./arbitrary-key-input-CBNxNgRr.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CMgAABAS.js";import"./utils-4perknFd.js";import"./useButton-Z1ioppNI.js";import"./useRenderElement-CM9yFL3n.js";import"./useTranslation-CJAVMPUn.js";import"./index-CIM2jmAx.js";import"./IconEye-DC8c4KLv.js";import"./createReactComponent-CXoWQxjz.js";import"./IconEyeOff-BTHcBFq_.js";import"./IconRotateClockwise-BZLA_SjU.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <ArbitraryKeyInput value={value} onChange={setValue} />;
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'my secret key',
    onChange: () => undefined
  }
}`,...r.parameters?.docs?.source}}};const b=["Default","Filled"];export{e as Default,r as Filled,b as __namedExportsOrder,j as default};
