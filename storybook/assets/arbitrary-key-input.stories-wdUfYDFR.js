import{j as a,r as n}from"./iframe-DuWoFZa1.js";import{A as o}from"./arbitrary-key-input-CHp0htB8.js";import"./preload-helper-PPVm8Dsz.js";import"./button-suH-SeIc.js";import"./utils-4perknFd.js";import"./useButton-DOC8L4nN.js";import"./useRenderElement-BoyeB58t.js";import"./useTranslation-D87pdBv3.js";import"./index-nyV1BjU-.js";import"./IconEye-BxO4HJCS.js";import"./createReactComponent-sOLayI23.js";import"./IconEyeOff-Bh2Wm5xs.js";import"./IconRotateClockwise-BtiNbu7q.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
