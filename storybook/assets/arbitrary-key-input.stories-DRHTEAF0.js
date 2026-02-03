import{j as a,r as n}from"./iframe-RrmlVuYH.js";import{A as o}from"./arbitrary-key-input-B9aa59i0.js";import"./preload-helper-PPVm8Dsz.js";import"./button-ae8kcaa_.js";import"./utils-4perknFd.js";import"./useButton-Bp5rxItp.js";import"./useRenderElement-C8N179Z8.js";import"./useTranslation-B3utfR0Z.js";import"./index-CSBs33ZL.js";import"./IconEye-DRay0L4N.js";import"./createReactComponent-DHZ3g0py.js";import"./IconEyeOff-CTdVvb3i.js";import"./IconRotateClockwise-BSlktvWm.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
