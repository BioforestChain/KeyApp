import{j as a,r as n}from"./iframe-L7e6CwBi.js";import{A as o}from"./arbitrary-key-input-B4IJkAW8.js";import"./preload-helper-PPVm8Dsz.js";import"./button-DX-bk_V0.js";import"./utils-4perknFd.js";import"./useButton-ClQAgxW6.js";import"./useRenderElement-CcBO2jkL.js";import"./useTranslation-DZkVTLt1.js";import"./index-m-NcY5rd.js";import"./IconEye-DZ78body.js";import"./createReactComponent-CIub4Pjs.js";import"./IconEyeOff-CODR3vCg.js";import"./IconRotateClockwise-DvdGfwEA.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
