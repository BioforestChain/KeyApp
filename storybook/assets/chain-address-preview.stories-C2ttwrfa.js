import{j as e,r as i}from"./iframe-CyHKRRfK.js";import{C as t}from"./chain-address-preview-BOscWEX7.js";import"./preload-helper-PPVm8Dsz.js";import"./address-display-CE3Z_TiK.js";import"./utils-4perknFd.js";import"./web-CG-vNO2v.js";import"./createReactComponent-s7oBHST4.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./useTranslation-CIKJsFW0.js";import"./index-BUgYDrNo.js";import"./IconCheck-Bwfu6zg_.js";import"./index-D0E7N0oa.js";import"./derivation-BR17AZyy.js";import"./bioforest-ZCexNS2w.js";const w={title:"Onboarding/ChainAddressPreview",component:t,tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"max-w-md space-y-4 p-4",children:e.jsx(r,{})})]},n=[{id:"bfmeta",version:"1.0",chainKind:"bioforest",name:"BFMeta",symbol:"BFT",decimals:8,enabled:!0,source:"default"},{id:"pmchain",version:"1.0",chainKind:"bioforest",name:"PMChain",symbol:"PM",decimals:8,enabled:!0,source:"default"}],s={render:()=>{const[r,a]=i.useState("my secret");return e.jsxs("div",{className:"space-y-3",children:[e.jsx("input",{className:"w-full rounded border px-3 py-2 text-sm",value:r,onChange:o=>a(o.target.value)}),e.jsx(t,{secret:r,enabledBioforestChainConfigs:n})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [secret, setSecret] = useState('my secret');
    return <div className="space-y-3">
        <input className="w-full rounded border px-3 py-2 text-sm" value={secret} onChange={e => setSecret(e.target.value)} />
        <ChainAddressPreview secret={secret} enabledBioforestChainConfigs={mockConfigs} />
      </div>;
  }
}`,...s.parameters?.docs?.source}}};const S=["Default"];export{s as Default,S as __namedExportsOrder,w as default};
