import{j as a,r as n}from"./iframe-BaLTYcLj.js";import{A as o}from"./arbitrary-key-input-B3hifuoa.js";import"./preload-helper-PPVm8Dsz.js";import"./button-C0FnBpDd.js";import"./utils-4perknFd.js";import"./useButton-B801ydtf.js";import"./useRenderElement-CZ_Fetq-.js";import"./useTranslation-XqDJdYHX.js";import"./index-Bjas02mz.js";import"./IconEye-DAkMZCtl.js";import"./createReactComponent-CwORpysc.js";import"./IconEyeOff-CTZaRjCN.js";import"./IconRotateClockwise-CypnNONG.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
