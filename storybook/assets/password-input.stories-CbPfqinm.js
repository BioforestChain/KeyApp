import{j as e,r as i}from"./iframe-d96jbflr.js";import{P as s}from"./password-input-DVGehQuH.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-ClTwWhs-.js";import"./index-eCgcuFC8.js";import"./IconEyeOff-D2yzEcIp.js";import"./createReactComponent-B3jwCrnC.js";import"./IconEye-DWJ--hjZ.js";const y={title:"Security/PasswordInput",component:s,tags:["autodocs"],argTypes:{showStrength:{control:"boolean"},disabled:{control:"boolean"}}},n={args:{placeholder:"请输入密码"}},o={render:()=>{const[t,p]=i.useState(""),[a,u]=i.useState("weak");return e.jsxs("div",{className:"space-y-4",children:[e.jsx(s,{placeholder:"请输入密码",value:t,onChange:r=>p(r.target.value),showStrength:!0,onStrengthChange:u}),e.jsxs("p",{className:"text-muted-foreground text-sm",children:["当前强度: ",a]})]})}},l={args:{placeholder:"请输入密码",disabled:!0,value:"password123"}},d={render:()=>e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"安全密码"}),e.jsx(s,{placeholder:"6-20位，需包含字母和数字",showStrength:!0}),e.jsx("p",{className:"text-muted-foreground text-xs",children:"安全密码用于链上转账验证，请牢记"})]})},c={render:()=>{const[t,p]=i.useState(""),[a,u]=i.useState(""),r=t===a&&t.length>0;return e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"设置密码"}),e.jsx(s,{placeholder:"请输入密码",value:t,onChange:h=>p(h.target.value),showStrength:!0})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"确认密码"}),e.jsx(s,{placeholder:"请再次输入密码",value:a,onChange:h=>u(h.target.value)}),a&&!r&&e.jsx("p",{className:"text-destructive text-xs",children:"两次输入的密码不一致"}),r&&e.jsx("p",{className:"text-green-500 text-xs",children:"密码匹配"})]})]})}},m={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm",children:"弱密码 (123456)"}),e.jsx(s,{value:"123456",showStrength:!0,readOnly:!0})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm",children:"中等密码 (Password1)"}),e.jsx(s,{value:"Password1",showStrength:!0,readOnly:!0})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm",children:"强密码 (MyP@ssw0rd!)"}),e.jsx(s,{value:"MyP@ssw0rd!",showStrength:!0,readOnly:!0})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: '请输入密码'
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState('');
    const [strength, setStrength] = useState<PasswordStrength>('weak');
    return <div className="space-y-4">
        <PasswordInput placeholder="请输入密码" value={value} onChange={e => setValue(e.target.value)} showStrength onStrengthChange={setStrength} />
        <p className="text-muted-foreground text-sm">当前强度: {strength}</p>
      </div>;
  }
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: '请输入密码',
    disabled: true,
    value: 'password123'
  }
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      <label className="text-sm font-medium">安全密码</label>
      <PasswordInput placeholder="6-20位，需包含字母和数字" showStrength />
      <p className="text-muted-foreground text-xs">安全密码用于链上转账验证，请牢记</p>
    </div>
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const isMatch = password === confirm && password.length > 0;
    return <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">设置密码</label>
          <PasswordInput placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} showStrength />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">确认密码</label>
          <PasswordInput placeholder="请再次输入密码" value={confirm} onChange={e => setConfirm(e.target.value)} />
          {confirm && !isMatch && <p className="text-destructive text-xs">两次输入的密码不一致</p>}
          {isMatch && <p className="text-green-500 text-xs">密码匹配</p>}
        </div>
      </div>;
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm">弱密码 (123456)</p>
        <PasswordInput value="123456" showStrength readOnly />
      </div>
      <div>
        <p className="mb-2 text-sm">中等密码 (Password1)</p>
        <PasswordInput value="Password1" showStrength readOnly />
      </div>
      <div>
        <p className="mb-2 text-sm">强密码 (MyP@ssw0rd!)</p>
        <PasswordInput value="MyP@ssw0rd!" showStrength readOnly />
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};const P=["Default","WithStrength","Disabled","WithLabel","ConfirmPassword","StrengthLevels"];export{c as ConfirmPassword,n as Default,l as Disabled,m as StrengthLevels,d as WithLabel,o as WithStrength,P as __namedExportsOrder,y as default};
