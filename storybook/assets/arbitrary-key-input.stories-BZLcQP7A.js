import{j as a,r as n}from"./iframe-BLQPPV58.js";import{A as o}from"./arbitrary-key-input-Bb2rTKXA.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CgGkpUUL.js";import"./utils-4perknFd.js";import"./useButton-BRs4ugnA.js";import"./useRenderElement-CE8zZvbZ.js";import"./useTranslation-DJmQji8N.js";import"./index-Ct8krvgw.js";import"./IconEye-BPGyQ44N.js";import"./createReactComponent-GB9Oo0vv.js";import"./IconEyeOff-6hD25SAf.js";import"./IconRotateClockwise-DU8a480z.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
