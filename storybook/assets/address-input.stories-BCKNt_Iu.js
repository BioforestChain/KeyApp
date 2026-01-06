import{j as e,r as b}from"./iframe-CLYHcCRY.js";import{A as a}from"./address-input-KFXdxFKe.js";import{a as t}from"./chain-config-CJhdu2xl.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./contact-avatar-Dld7FrOF.js";import"./index-DYUqLMM0.js";import"./createReactComponent-wBEFsRbv.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./address-format-DY2duW3A.js";import"./index-D0E7N0oa.js";import"./bioforest-uXX5qE5N.js";import"./useTranslation-Cb2TYd22.js";import"./index-BII8D0GK.js";import"./IconX-wx2JE-kR.js";const D={title:"Transfer/AddressInput",component:a,tags:["autodocs"]},n={args:{label:"收款地址",onScan:()=>alert("Open scanner")}},c={args:{label:"收款地址",value:"0x1234567890abcdef1234567890abcdef12345678"}},l={args:{label:"收款地址",value:"0x123",error:"地址格式不正确"}},i={render:()=>{const[s,r]=b.useState("");return e.jsxs("div",{className:"space-y-4",children:[e.jsx(a,{label:"收款地址",value:s,onChange:r,onScan:()=>alert("Scan QR code")}),e.jsxs("p",{className:"text-muted-foreground text-sm",children:["当前值: ",s||"(空)"]})]})}},u={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsx(a,{label:"ETH 地址",value:"0x1234567890abcdef1234567890abcdef12345678"}),e.jsx(a,{label:"TRON 地址",value:"TRXabcdefghijklmnopqrstuvwxyz123456"}),e.jsx(a,{label:"BTC 地址",value:"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"})]})},m={args:{label:"收款地址"}},p={render:()=>{const[s,r]=b.useState("");return e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsx("h3",{className:"text-lg font-medium",children:"转账"}),e.jsx(a,{label:"收款地址",value:s,onChange:r,onScan:()=>alert("Open QR scanner")}),e.jsx("button",{className:"bg-primary w-full rounded-full py-3 font-medium text-white disabled:opacity-50",disabled:!s||s.length<20,children:"下一步"})]})}},d={decorators:[s=>(t.clearAll(),t.addContact({name:"Alice",addresses:[{id:"1",address:"0x1234567890abcdef1234567890abcdef12345678",label:"ETH",isDefault:!0}],memo:"同事"}),t.addContact({name:"Bob",addresses:[{id:"2",address:"0xabcdef1234567890abcdef1234567890abcdef12",label:"ETH",isDefault:!0},{id:"3",address:"c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3",label:"BFMETA"}]}),t.addContact({name:"Charlie",addresses:[{id:"4",address:"0x9876543210fedcba9876543210fedcba98765432",label:"ETH",isDefault:!0}],memo:"朋友"}),e.jsx(s,{}))],render:()=>{const[s,r]=b.useState("");return e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsx("p",{className:"text-muted-foreground text-sm",children:"聚焦输入框即可看到所有联系人建议，输入可过滤"}),e.jsx(a,{label:"收款地址",value:s,onChange:r,onScan:()=>alert("Open QR scanner"),onContactPicker:()=>alert("Open contact picker"),showSuggestions:!0}),e.jsxs("p",{className:"text-muted-foreground text-sm",children:["当前值: ",s||"(空)"]})]})}},o={decorators:[s=>(t.clearAll(),t.addContact({name:"Alice",addresses:[{id:"1",address:"0x1234567890abcdef1234567890abcdef12345678",label:"ETH",isDefault:!0},{id:"2",address:"b7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3",label:"BFMETA"}]}),t.addContact({name:"Bob",addresses:[{id:"3",address:"c7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11",label:"CCCHAIN",isDefault:!0}]}),e.jsx(s,{}))],render:()=>{const[s,r]=b.useState("");return e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsx("p",{className:"text-muted-foreground text-sm",children:'设置 chainType="bfmeta"，只显示 BFMeta 链有效的地址'}),e.jsx(a,{label:"BFMeta 地址",value:s,onChange:r,chainType:"bfmeta",onContactPicker:()=>alert("Open contact picker for BFMeta"),showSuggestions:!0})]})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址',
    onScan: () => alert('Open scanner')
  }
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址',
    value: '0x1234567890abcdef1234567890abcdef12345678'
  }
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址',
    value: '0x123',
    error: '地址格式不正确'
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <div className="space-y-4">
        <AddressInput label="收款地址" value={value} onChange={setValue} onScan={() => alert('Scan QR code')} />
        <p className="text-muted-foreground text-sm">当前值: {value || '(空)'}</p>
      </div>;
  }
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <AddressInput label="ETH 地址" value="0x1234567890abcdef1234567890abcdef12345678" />
      <AddressInput label="TRON 地址" value="TRXabcdefghijklmnopqrstuvwxyz123456" />
      <AddressInput label="BTC 地址" value="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" />
    </div>
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址'
  }
}`,...m.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [address, setAddress] = useState('');
    return <div className="space-y-6 p-4">
        <h3 className="text-lg font-medium">转账</h3>
        <AddressInput label="收款地址" value={address} onChange={setAddress} onScan={() => alert('Open QR scanner')} />
        <button className="bg-primary w-full rounded-full py-3 font-medium text-white disabled:opacity-50" disabled={!address || address.length < 20}>
          下一步
        </button>
      </div>;
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    // Setup contacts for suggestions
    addressBookActions.clearAll();
    addressBookActions.addContact({
      name: 'Alice',
      addresses: [{
        id: '1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        label: 'ETH',
        isDefault: true
      }],
      memo: '同事'
    });
    addressBookActions.addContact({
      name: 'Bob',
      addresses: [{
        id: '2',
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        label: 'ETH',
        isDefault: true
      }, {
        id: '3',
        address: 'c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
        label: 'BFMETA'
      }]
    });
    addressBookActions.addContact({
      name: 'Charlie',
      addresses: [{
        id: '4',
        address: '0x9876543210fedcba9876543210fedcba98765432',
        label: 'ETH',
        isDefault: true
      }],
      memo: '朋友'
    });
    return <Story />;
  }],
  render: () => {
    const [address, setAddress] = useState('');
    return <div className="space-y-6 p-4">
        <p className="text-muted-foreground text-sm">
          聚焦输入框即可看到所有联系人建议，输入可过滤
        </p>
        <AddressInput label="收款地址" value={address} onChange={setAddress} onScan={() => alert('Open QR scanner')} onContactPicker={() => alert('Open contact picker')} showSuggestions />
        <p className="text-muted-foreground text-sm">当前值: {address || '(空)'}</p>
      </div>;
  }
}`,...d.parameters?.docs?.source},description:{story:`带联系人建议 - 聚焦即展开，显示所有联系人
AddressInput 直接从 addressBookStore 读取数据（单一数据源）`,...d.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    addressBookActions.clearAll();
    addressBookActions.addContact({
      name: 'Alice',
      addresses: [{
        id: '1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        label: 'ETH',
        isDefault: true
      }, {
        id: '2',
        address: 'b7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3',
        label: 'BFMETA'
      }]
    });
    addressBookActions.addContact({
      name: 'Bob',
      addresses: [{
        id: '3',
        address: 'c7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11',
        label: 'CCCHAIN',
        isDefault: true
      }]
    });
    return <Story />;
  }],
  render: () => {
    const [address, setAddress] = useState('');
    return <div className="space-y-6 p-4">
        <p className="text-muted-foreground text-sm">
          设置 chainType="bfmeta"，只显示 BFMeta 链有效的地址
        </p>
        <AddressInput label="BFMeta 地址" value={address} onChange={setAddress} chainType="bfmeta" onContactPicker={() => alert('Open contact picker for BFMeta')} showSuggestions />
      </div>;
  }
}`,...o.parameters?.docs?.source},description:{story:`按链类型过滤 - 只显示指定链的地址
AddressInput 直接从 addressBookStore 读取数据（单一数据源）`,...o.parameters?.docs?.description}}};const H=["Default","WithValue","WithError","Controlled","DifferentChains","WithoutScan","TransferForm","WithContactSuggestions","FilterByChain"];export{i as Controlled,n as Default,u as DifferentChains,o as FilterByChain,p as TransferForm,d as WithContactSuggestions,l as WithError,c as WithValue,m as WithoutScan,H as __namedExportsOrder,D as default};
