import{j as e}from"./iframe-Cdc63axx.js";import{Q as i,A as d}from"./qr-code-CN1BkjhE.js";import"./preload-helper-PPVm8Dsz.js";import"./index-BumXyOSu.js";import"./utils-CDN07tui.js";const g={title:"Common/QRCode",component:i,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{size:{control:{type:"range",min:100,max:400,step:20}},level:{control:"select",options:["L","M","Q","H"]},bgColor:{control:"color"},fgColor:{control:"color"}}},s={args:{value:"https://example.com",size:200}},r={args:{value:"ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F",size:200,level:"H"}},a={args:{value:"bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",size:200,level:"H"}},t={args:{value:"https://example.com",size:200,bgColor:"#f0f0f0",fgColor:"#6366f1"}},o={args:{value:"https://example.com",size:300}},n={args:{value:"https://example.com",size:120}},c={args:{value:"https://example.com",size:200,level:"H"}},m={render:()=>e.jsxs("div",{className:"flex gap-6",children:[e.jsxs("div",{className:"text-center",children:[e.jsx(d,{address:"0x71C7656EC7ab88b098defB751B7401B5f6d8976F",chain:"ethereum"}),e.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"Ethereum"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx(d,{address:"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",chain:"bitcoin"}),e.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"Bitcoin"})]}),e.jsxs("div",{className:"text-center",children:[e.jsx(d,{address:"TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW",chain:"tron"}),e.jsx("p",{className:"mt-2 text-sm text-muted-foreground",children:"Tron"})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'https://example.com',
    size: 200
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'ethereum:0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    size: 200,
    level: 'H'
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    size: 200,
    level: 'H'
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'https://example.com',
    size: 200,
    bgColor: '#f0f0f0',
    fgColor: '#6366f1'
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'https://example.com',
    size: 300
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'https://example.com',
    size: 120
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    value: 'https://example.com',
    size: 200,
    level: 'H'
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex gap-6">
      <div className="text-center">
        <AddressQRCode address="0x71C7656EC7ab88b098defB751B7401B5f6d8976F" chain="ethereum" />
        <p className="mt-2 text-sm text-muted-foreground">Ethereum</p>
      </div>
      <div className="text-center">
        <AddressQRCode address="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa" chain="bitcoin" />
        <p className="mt-2 text-sm text-muted-foreground">Bitcoin</p>
      </div>
      <div className="text-center">
        <AddressQRCode address="TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW" chain="tron" />
        <p className="mt-2 text-sm text-muted-foreground">Tron</p>
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};const v=["Default","EthereumAddress","BitcoinAddress","CustomColors","LargeSize","SmallSize","HighErrorCorrection","AddressQRCodeStory"];export{m as AddressQRCodeStory,a as BitcoinAddress,t as CustomColors,s as Default,r as EthereumAddress,c as HighErrorCorrection,o as LargeSize,n as SmallSize,v as __namedExportsOrder,g as default};
