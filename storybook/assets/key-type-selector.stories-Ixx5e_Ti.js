import{j as o,r as n}from"./iframe-BsFAjrMt.js";import{K as t}from"./key-type-selector-B82PNxb8.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-D3dR0QcB.js";import"./index-BnAl6yxc.js";import"./IconCheck-CEKgIBoF.js";import"./createReactComponent-CZurZBpK.js";const x={title:"Onboarding/KeyTypeSelector",component:t,tags:["autodocs"],decorators:[a=>o.jsx("div",{className:"max-w-md p-4",children:o.jsx(a,{})})]},e={render:()=>{const[a,s]=n.useState("mnemonic");return o.jsx(t,{value:a,onChange:s})}},r={args:{value:"mnemonic",disabled:!0,onChange:()=>{}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<WalletKeyType>('mnemonic');
    return <KeyTypeSelector value={value} onChange={setValue} />;
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'mnemonic',
    disabled: true,
    onChange: () => undefined
  }
}`,...r.parameters?.docs?.source}}};const v=["Default","Disabled"];export{e as Default,r as Disabled,v as __namedExportsOrder,x as default};
