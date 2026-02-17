import{j as e,r as v}from"./iframe-L7e6CwBi.js";import{A as r}from"./address-input-BwpQS0DH.js";import{a}from"./user-profile-CHlUKcQX.js";import"./service-BkoiQvzo.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./contact-avatar-ChuSRwtf.js";import"./index-DRjRCFKh.js";import"./avatar-codec-DSrqv8PA.js";import"./index-D0E7N0oa.js";import"./derivation-ClDV6VJV.js";import"./bioforest-CcSgL-Rz.js";import"./createReactComponent-CIub4Pjs.js";import"./web-Bam-Uxu-.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./address-display-aCyqLODp.js";import"./useTranslation-DZkVTLt1.js";import"./index-m-NcY5rd.js";import"./IconCheck-DJnsYo3P.js";import"./IconX-2B5iZ3gJ.js";import"./IconWallet-8olgOpbd.js";import"./IconPencil-DigL_Z1Y.js";const V={title:"Transfer/AddressInput",component:r,tags:["autodocs"]},l={args:{label:"收款地址",onScan:()=>alert("Open scanner")}},i={args:{label:"收款地址",value:"0x1234567890abcdef1234567890abcdef12345678"}},u={render:()=>e.jsx(r,{label:"收款地址 (Focused)",value:"0x1234567890abcdef1234567890abcdef12345678",autoFocus:!0,onScan:()=>{}})},p={args:{label:"Long Address (Unfocused)",value:"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"}},m={args:{label:"收款地址",value:"0x123",error:"地址格式不正确"}},b={render:()=>{const[s,t]=v.useState("");return e.jsxs("div",{className:"space-y-4",children:[e.jsx(r,{label:"收款地址",value:s,onChange:t,onScan:()=>alert("Scan QR code")}),e.jsxs("p",{className:"text-muted-foreground text-sm",children:["当前值: ",s||"(空)"]})]})}},f={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsx(r,{label:"ETH 地址",value:"0x1234567890abcdef1234567890abcdef12345678"}),e.jsx(r,{label:"TRON 地址",value:"TRXabcdefghijklmnopqrstuvwxyz123456"}),e.jsx(r,{label:"BTC 地址",value:"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"})]})},x={args:{label:"收款地址"}},g={render:()=>{const[s,t]=v.useState("");return e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsx("h3",{className:"text-lg font-medium",children:"转账"}),e.jsx(r,{label:"收款地址",value:s,onChange:t,onScan:()=>alert("Open QR scanner")}),e.jsx("button",{className:"bg-primary w-full rounded-full py-3 font-medium text-white disabled:opacity-50",disabled:!s||s.length<20,children:"下一步"})]})}},d={decorators:[s=>(a.clearAll(),a.addContact({name:"Alice",addresses:[{id:"1",address:"0x1234567890abcdef1234567890abcdef12345678",label:"ETH",isDefault:!0}],memo:"同事"}),a.addContact({name:"Bob",addresses:[{id:"2",address:"0xabcdef1234567890abcdef1234567890abcdef12",label:"ETH",isDefault:!0},{id:"3",address:"c7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3",label:"BFMETA"}]}),a.addContact({name:"Charlie",addresses:[{id:"4",address:"0x9876543210fedcba9876543210fedcba98765432",label:"ETH",isDefault:!0}],memo:"朋友"}),e.jsx(s,{}))],render:()=>{const[s,t]=v.useState("");return e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsx("p",{className:"text-muted-foreground text-sm",children:"聚焦输入框即可看到所有联系人建议，输入可过滤"}),e.jsx(r,{label:"收款地址",value:s,onChange:t,onScan:()=>alert("Open QR scanner"),onContactPicker:()=>alert("Open contact picker"),showSuggestions:!0}),e.jsxs("p",{className:"text-muted-foreground text-sm",children:["当前值: ",s||"(空)"]})]})}},o={decorators:[s=>(a.clearAll(),a.addContact({name:"Alice",addresses:[{id:"1",address:"0x1234567890abcdef1234567890abcdef12345678",label:"ETH",isDefault:!0},{id:"2",address:"b7R6wVdPvHqvRxe5Q9ZvWr7CpPn5Mk5Xz3",label:"BFMETA"}]}),a.addContact({name:"Bob",addresses:[{id:"3",address:"c7ADmvZJJ3n3aDxkvwbXxJX1oGgeiCzL11",label:"CCCHAIN",isDefault:!0}]}),e.jsx(s,{}))],render:()=>{const[s,t]=v.useState("");return e.jsxs("div",{className:"space-y-6 p-4",children:[e.jsx("p",{className:"text-muted-foreground text-sm",children:'设置 chainType="bfmeta"，只显示 BFMeta 链有效的地址'}),e.jsx(r,{label:"BFMeta 地址",value:s,onChange:t,chainType:"bfmeta",onContactPicker:()=>alert("Open contact picker for BFMeta"),showSuggestions:!0})]})}},n={args:{label:"Unknown Address",value:"0x1234567890abcdef1234567890abcdef12345678"}},c={decorators:[s=>(a.clearAll(),a.addContact({name:"Alice Cooper",addresses:[{id:"1",address:"0x1234567890abcdef1234567890abcdef12345678",label:"ETH",isDefault:!0}],memo:"Rockstar"}),e.jsx(s,{}))],args:{label:"Known Contact",value:"0x1234567890abcdef1234567890abcdef12345678"}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址',
    onScan: () => alert('Open scanner')
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址',
    value: '0x1234567890abcdef1234567890abcdef12345678'
  }
}`,...i.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    return <AddressInput label="收款地址 (Focused)" value="0x1234567890abcdef1234567890abcdef12345678" autoFocus onScan={() => {}} />;
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Long Address (Unfocused)',
    value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh'
  }
}`,...p.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址',
    value: '0x123',
    error: '地址格式不正确'
  }
}`,...m.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    return <div className="space-y-4">
        <AddressInput label="收款地址" value={value} onChange={setValue} onScan={() => alert('Scan QR code')} />
        <p className="text-muted-foreground text-sm">当前值: {value || '(空)'}</p>
      </div>;
  }
}`,...b.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <AddressInput label="ETH 地址" value="0x1234567890abcdef1234567890abcdef12345678" />
      <AddressInput label="TRON 地址" value="TRXabcdefghijklmnopqrstuvwxyz123456" />
      <AddressInput label="BTC 地址" value="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" />
    </div>
}`,...f.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: '收款地址'
  }
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
AddressInput 直接从 addressBookStore 读取数据（单一数据源）`,...o.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Unknown Address',
    value: '0x1234567890abcdef1234567890abcdef12345678'
  }
}`,...n.parameters?.docs?.source},description:{story:"未知地址显示模式 - 显示钱包占位图标",...n.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  decorators: [Story => {
    addressBookActions.clearAll();
    addressBookActions.addContact({
      name: 'Alice Cooper',
      addresses: [{
        id: '1',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        label: 'ETH',
        isDefault: true
      }],
      memo: 'Rockstar'
    });
    return <Story />;
  }],
  args: {
    label: 'Known Contact',
    value: '0x1234567890abcdef1234567890abcdef12345678'
  }
}`,...c.parameters?.docs?.source},description:{story:"已知联系人显示模式 - 显示头像和双行信息（名称+地址）",...c.parameters?.docs?.description}}};const Q=["Default","WithValue","WithValueFocused","LongAddressUnfocused","WithError","Controlled","DifferentChains","WithoutScan","TransferForm","WithContactSuggestions","FilterByChain","UnknownAddressDisplay","KnownContactDisplay"];export{b as Controlled,l as Default,f as DifferentChains,o as FilterByChain,c as KnownContactDisplay,p as LongAddressUnfocused,g as TransferForm,n as UnknownAddressDisplay,d as WithContactSuggestions,m as WithError,i as WithValue,u as WithValueFocused,x as WithoutScan,Q as __namedExportsOrder,V as default};
