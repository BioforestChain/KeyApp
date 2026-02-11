import{j as a,r as n}from"./iframe-D_wumixU.js";import{A as o}from"./arbitrary-key-input-DfAD_WQb.js";import"./preload-helper-PPVm8Dsz.js";import"./button-8VCYF9q8.js";import"./utils-4perknFd.js";import"./useButton-B7fJWq_D.js";import"./useRenderElement-BJltmq7R.js";import"./useTranslation-BUN0bWmz.js";import"./index-DJ7mgCHa.js";import"./IconEye-C0njIer0.js";import"./createReactComponent-DTmO_ECI.js";import"./IconEyeOff-DUP9JsTv.js";import"./IconRotateClockwise-DTdbkADf.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
