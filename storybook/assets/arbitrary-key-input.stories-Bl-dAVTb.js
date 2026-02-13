import{j as a,r as n}from"./iframe-BItTx6xa.js";import{A as o}from"./arbitrary-key-input-BAJ2rZW1.js";import"./preload-helper-PPVm8Dsz.js";import"./button-jci0XqND.js";import"./utils-4perknFd.js";import"./useButton-DU8nj5ek.js";import"./useRenderElement-VREc9raJ.js";import"./useTranslation-C5zymG6a.js";import"./index-CNpMLyeW.js";import"./IconEye-HMQzrldT.js";import"./createReactComponent-Dbk6urU_.js";import"./IconEyeOff-dqipsGGL.js";import"./IconRotateClockwise-3UhMxouz.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
