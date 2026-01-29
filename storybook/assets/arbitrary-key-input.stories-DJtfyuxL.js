import{j as a,r as n}from"./iframe-BuDZgClS.js";import{A as o}from"./arbitrary-key-input-cxcewib9.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CqZpCM-a.js";import"./utils-4perknFd.js";import"./useButton-BPP4vCD8.js";import"./useRenderElement-CnI4ETw1.js";import"./useTranslation-CwjW3P5e.js";import"./index-0yvu-sz8.js";import"./IconEye-BHl2uy9-.js";import"./createReactComponent-CCT_KxSw.js";import"./IconEyeOff-utxmbKWm.js";import"./IconRotateClockwise-BshorhIC.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
