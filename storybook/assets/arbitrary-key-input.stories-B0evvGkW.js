import{j as a,r as n}from"./iframe-mWBAGdu2.js";import{A as o}from"./arbitrary-key-input-C7zVwbNB.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CWmjkcwj.js";import"./utils-4perknFd.js";import"./useButton-CzZE3PFl.js";import"./useRenderElement-sc-z0PWr.js";import"./useTranslation-CgcY4kD2.js";import"./index-CQqlk44_.js";import"./IconEye-Cs9eDMwn.js";import"./createReactComponent-B-6fW5hv.js";import"./IconEyeOff-Ckfx00Ix.js";import"./IconRotateClockwise-b_y972iX.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
