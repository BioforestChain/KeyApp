import{j as a,r as n}from"./iframe-Dt8wZwjo.js";import{A as o}from"./arbitrary-key-input-UapMNyOJ.js";import"./preload-helper-PPVm8Dsz.js";import"./button-1p66Js1j.js";import"./utils-4perknFd.js";import"./useButton-CdLwvVYf.js";import"./useRenderElement-D_lHscCc.js";import"./useTranslation-Br48bveG.js";import"./index-Dfw9gGKV.js";import"./IconEye-Cjg4_Llv.js";import"./createReactComponent-BDIgNuTp.js";import"./IconEyeOff-505jopeh.js";import"./IconRotateClockwise-BA91sFyx.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
