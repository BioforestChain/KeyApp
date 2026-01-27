import{j as a,r as n}from"./iframe-CMX6GvDx.js";import{A as o}from"./arbitrary-key-input-CjDNeFI-.js";import"./preload-helper-PPVm8Dsz.js";import"./button-DZddXMM9.js";import"./utils-4perknFd.js";import"./useButton-CT3j_Tgq.js";import"./useRenderElement-DKbY89Sy.js";import"./useTranslation-DOQIbGsS.js";import"./index-BdTp2md1.js";import"./IconEye-BmwKc4gb.js";import"./createReactComponent-CsnZ93S4.js";import"./IconEyeOff-BHFmuFRm.js";import"./IconRotateClockwise-DEOiLxKb.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
