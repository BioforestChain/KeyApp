import{j as a,r as n}from"./iframe-CUCdvki0.js";import{A as o}from"./arbitrary-key-input-CjIOaNn3.js";import"./preload-helper-PPVm8Dsz.js";import"./button-UqEutDWL.js";import"./utils-4perknFd.js";import"./useButton-PXvTb9sC.js";import"./useRenderElement-DFQDU41c.js";import"./useTranslation-CCVYyjbP.js";import"./index-B6OH5EYA.js";import"./IconEye-BRy8cGEj.js";import"./createReactComponent-Y3xQdtB8.js";import"./IconEyeOff-wLL630ud.js";import"./IconRotateClockwise-CHBhjMHd.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
