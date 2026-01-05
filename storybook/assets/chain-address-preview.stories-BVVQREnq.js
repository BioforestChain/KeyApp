import{j as e,r as i}from"./iframe-Cdc63axx.js";import{C as t}from"./chain-address-preview-Dapk3Eme.js";import"./preload-helper-PPVm8Dsz.js";import"./address-display-Br4bPKCM.js";import"./utils-CDN07tui.js";import"./web-D11Qze_b.js";import"./breakpoint-LJlNYN6X.js";import"./schemas-34eCiBJ6.js";import"./useTranslation-B1THGpvK.js";import"./index-CgApz5ds.js";import"./IconCheck-CSFX6uTb.js";import"./createReactComponent-Byz9u14m.js";import"./IconCopy-Bd89ourp.js";import"./index-D0E7N0oa.js";import"./bioforest-ChHUthdw.js";const w={title:"Onboarding/ChainAddressPreview",component:t,tags:["autodocs"],decorators:[r=>e.jsx("div",{className:"max-w-md space-y-4 p-4",children:e.jsx(r,{})})]},n=[{id:"bfmeta",version:"1.0",chainKind:"bioforest",name:"BFMeta",symbol:"BFT",decimals:8,enabled:!0,source:"default"},{id:"pmchain",version:"1.0",chainKind:"bioforest",name:"PMChain",symbol:"PM",decimals:8,enabled:!0,source:"default"}],s={render:()=>{const[r,a]=i.useState("my secret");return e.jsxs("div",{className:"space-y-3",children:[e.jsx("input",{className:"w-full rounded border px-3 py-2 text-sm",value:r,onChange:o=>a(o.target.value)}),e.jsx(t,{secret:r,enabledBioforestChainConfigs:n})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [secret, setSecret] = useState('my secret');
    return <div className="space-y-3">
        <input className="w-full rounded border px-3 py-2 text-sm" value={secret} onChange={e => setSecret(e.target.value)} />
        <ChainAddressPreview secret={secret} enabledBioforestChainConfigs={mockConfigs} />
      </div>;
  }
}`,...s.parameters?.docs?.source}}};const S=["Default"];export{s as Default,S as __namedExportsOrder,w as default};
