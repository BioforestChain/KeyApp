import{j as a,r as n}from"./iframe-CyYNzbJL.js";import{A as o}from"./arbitrary-key-input-BUBXsz2k.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BFbLYQEm.js";import"./utils-4perknFd.js";import"./useButton-DPywT7vJ.js";import"./useRenderElement-CdGWhY6E.js";import"./useTranslation-BB9FXUKP.js";import"./index-BM9Q35K9.js";import"./IconEye-BDTU20PM.js";import"./createReactComponent-CUuh3cdw.js";import"./IconEyeOff-DEO71Uu5.js";import"./IconRotateClockwise-BKY6caJ-.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
