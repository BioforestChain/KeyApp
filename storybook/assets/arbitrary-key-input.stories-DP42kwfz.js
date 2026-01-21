import{j as a,r as n}from"./iframe-Cr_UN5ps.js";import{A as o}from"./arbitrary-key-input-vIu4S89u.js";import"./preload-helper-PPVm8Dsz.js";import"./button-D1tYjhCW.js";import"./utils-4perknFd.js";import"./useButton-Dc5zf6xL.js";import"./useRenderElement-By_XGQex.js";import"./useTranslation-CFi8Ka59.js";import"./index-DvRiJqI5.js";import"./IconEye-DWX4CgER.js";import"./createReactComponent-T6tanagy.js";import"./IconEyeOff-C7nPAPe-.js";import"./IconRotateClockwise-Eoi9EQjc.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
