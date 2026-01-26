import{j as a,r as n}from"./iframe-b-sVmduO.js";import{A as o}from"./arbitrary-key-input-CJZvhd_i.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CzVagMcs.js";import"./utils-4perknFd.js";import"./useButton-WqFoX9V1.js";import"./useRenderElement-UW8U3z2X.js";import"./useTranslation-C1Xpk5kb.js";import"./index-CZzLdyTW.js";import"./IconEye-DvejQShn.js";import"./createReactComponent-CiK24Q5d.js";import"./IconEyeOff-ln9jm445.js";import"./IconRotateClockwise-BR7ZMipa.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
