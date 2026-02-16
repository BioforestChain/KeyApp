import{j as a,r as n}from"./iframe-CQyDXeRN.js";import{A as o}from"./arbitrary-key-input-DFLzaMpO.js";import"./preload-helper-PPVm8Dsz.js";import"./button-Cix4ry-z.js";import"./utils-4perknFd.js";import"./useButton-BWiwhMKK.js";import"./useRenderElement-CL8pDYr7.js";import"./useTranslation-AH4gnL6f.js";import"./index-BKVozS6Z.js";import"./IconEye-BEbYnm4S.js";import"./createReactComponent-FIegxF4S.js";import"./IconEyeOff-KdYMlN9l.js";import"./IconRotateClockwise-BQpKMJb8.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
