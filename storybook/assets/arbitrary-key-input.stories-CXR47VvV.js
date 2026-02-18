import{j as a,r as n}from"./iframe-BUkuBLc8.js";import{A as o}from"./arbitrary-key-input-DYnk5u67.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CI4CZVvr.js";import"./utils-4perknFd.js";import"./useButton-wMw66dT-.js";import"./useRenderElement-CS_Ote0x.js";import"./useTranslation-CTIURYhP.js";import"./index-D6S4sHJj.js";import"./IconEye-bvwDrlxj.js";import"./createReactComponent-Dw1Y0MQa.js";import"./IconEyeOff-CDsvwp3w.js";import"./IconRotateClockwise-Bo4XX5-_.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
