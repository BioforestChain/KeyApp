import{j as a,r as n}from"./iframe-Bu8aE4Do.js";import{A as o}from"./arbitrary-key-input-kA8rU8Bd.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BlZEmXrA.js";import"./utils-4perknFd.js";import"./useButton-CJr4SIzi.js";import"./useRenderElement-mjahtkMj.js";import"./useTranslation-jmbQdz-f.js";import"./index-Dp2akRJL.js";import"./IconEye-CzuY-QOP.js";import"./createReactComponent-uyF1zpS3.js";import"./IconEyeOff-HbhAsz7O.js";import"./IconRotateClockwise-DT1QvUDR.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
