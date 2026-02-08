import{j as a,r as n}from"./iframe-BEhoETRs.js";import{A as o}from"./arbitrary-key-input-DtzIdoxb.js";import"./preload-helper-PPVm8Dsz.js";import"./button-CV3O5RAP.js";import"./utils-4perknFd.js";import"./useButton-DNALwdlJ.js";import"./useRenderElement-D_Fh2Swr.js";import"./useTranslation-DF7at6qm.js";import"./index-Bg0mJUBe.js";import"./IconEye-Ct_stW5Z.js";import"./createReactComponent-BAja8KbA.js";import"./IconEyeOff-CIkpGZ4Q.js";import"./IconRotateClockwise-CDHQaeZ7.js";const j={title:"Onboarding/ArbitraryKeyInput",component:o,tags:["autodocs"],decorators:[t=>a.jsx("div",{className:"max-w-md space-y-4 p-4",children:a.jsx(t,{})})]},e={render:()=>{const[t,s]=n.useState("");return a.jsx(o,{value:t,onChange:s})}},r={args:{value:"my secret key",onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
