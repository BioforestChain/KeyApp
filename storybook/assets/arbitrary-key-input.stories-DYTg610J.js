import{j as a,r as n}from"./iframe-D_jX0M3w.js";import{A as o}from"./arbitrary-key-input-BxQDgzhv.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CjQHBmND.js";import"./utils-4perknFd.js";import"./useButton-U9vnfQIs.js";import"./useRenderElement-BApz5BLJ.js";import"./useTranslation-BXtw4Hgp.js";import"./index-D0oJr3gH.js";import"./IconEye-rXyr6cs-.js";import"./createReactComponent-Dhbfj6RJ.js";import"./IconEyeOff-DP4FW1DN.js";import"./IconRotateClockwise-CEwLPmeN.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
