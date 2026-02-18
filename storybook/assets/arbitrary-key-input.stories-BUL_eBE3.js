import{j as a,r as n}from"./iframe-BpDWdeYo.js";import{A as o}from"./arbitrary-key-input-CLbnk1zX.js";import"./preload-helper-PPVm8Dsz.js";import"./button-rWrKvQiL.js";import"./utils-4perknFd.js";import"./useButton-DMMe6EYe.js";import"./useRenderElement-IEsLCaOd.js";import"./useTranslation-_tBHPFow.js";import"./index-746G9wrD.js";import"./IconEye-BLvVIJPp.js";import"./createReactComponent-CTzRdXU5.js";import"./IconEyeOff-CKPeVqTK.js";import"./IconRotateClockwise-O_Vsz6jL.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
