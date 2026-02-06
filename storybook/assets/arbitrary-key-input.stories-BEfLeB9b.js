import{j as a,r as n}from"./iframe-CsVGzOX8.js";import{A as o}from"./arbitrary-key-input-ChPT9TVV.js";import"./preload-helper-PPVm8Dsz.js";import"./button-Y33HfV2w.js";import"./utils-4perknFd.js";import"./useButton-BnEut5nZ.js";import"./useRenderElement-C9bTAUjL.js";import"./useTranslation-D_ioW859.js";import"./index-z8gF-eXQ.js";import"./IconEye-B53BnsfK.js";import"./createReactComponent-B5Y5RZQD.js";import"./IconEyeOff-S8huBDXR.js";import"./IconRotateClockwise-m_2m-z44.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
