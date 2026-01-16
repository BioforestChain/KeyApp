import{j as a,r as n}from"./iframe-BNCIUlAe.js";import{A as o}from"./arbitrary-key-input-CEavjrlw.js";import"./preload-helper-PPVm8Dsz.js";import"./button-BVKjMiYf.js";import"./utils-CDN07tui.js";import"./useButton-Dn4VLpjI.js";import"./useRenderElement-eznI4fyj.js";import"./useTranslation-CHdy0Kqt.js";import"./index-2cl3VLgZ.js";import"./IconEye-COrQJ7mW.js";import"./createReactComponent-u1gFnxbc.js";import"./IconEyeOff-CzL_3CIY.js";import"./IconRotateClockwise-Da2P8Yno.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
