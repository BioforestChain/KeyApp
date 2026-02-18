import{j as a,r as n}from"./iframe-CMEr1D9F.js";import{A as o}from"./arbitrary-key-input-CWSnb88A.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CmRHa7No.js";import"./utils-4perknFd.js";import"./useButton-0bZyOuwZ.js";import"./useRenderElement-4_Vh7gky.js";import"./useTranslation-mmorjM9A.js";import"./index-D82DQpnE.js";import"./IconEye-BGRDRmjB.js";import"./createReactComponent-DKpurfk4.js";import"./IconEyeOff-XPuq8WqN.js";import"./IconRotateClockwise-D_qa0CC9.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
