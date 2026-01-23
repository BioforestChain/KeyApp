import{j as a,r as n}from"./iframe-CxqJ7t_d.js";import{A as o}from"./arbitrary-key-input-DJYOSlyJ.js";import"./preload-helper-PPVm8Dsz.js";import"./button-y9znDRSj.js";import"./utils-4perknFd.js";import"./useButton-_nSio9WM.js";import"./useRenderElement-Cuq_tw-2.js";import"./useTranslation-DjVxdnu3.js";import"./index-DVGGjAlj.js";import"./IconEye-CW57iPry.js";import"./createReactComponent-FjQf3UKG.js";import"./IconEyeOff-DWz1o6jZ.js";import"./IconRotateClockwise-jHJAOx9f.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
