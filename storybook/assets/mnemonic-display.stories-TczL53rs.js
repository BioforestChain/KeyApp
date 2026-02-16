import{j as e,r as m}from"./iframe-BWeqjITw.js";import{M as n}from"./mnemonic-display-ByjhnksG.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./web-Dl7j0Upe.js";import"./createReactComponent-CZ0FE120.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./useTranslation-xI2qK3OI.js";import"./index-Cz6VFDXe.js";import"./IconCheck-C3Q_jHbl.js";const w={title:"Security/MnemonicDisplay",component:n,tags:["autodocs"]},c=["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident"],p=["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident","account","accuse","achieve","acid","acoustic","acquire","across","act","action","actor","actress","actual"],s={args:{words:c,onCopy:()=>console.log("Copied!")}},r={args:{words:c,hidden:!0}},t={args:{words:p}},a={render:()=>{const[d,i]=m.useState(!0);return e.jsxs("div",{className:"space-y-4",children:[e.jsx(n,{words:c,hidden:d}),e.jsx("button",{onClick:()=>i(!d),className:"text-sm text-primary",children:d?"显示助记词":"隐藏助记词"})]})}},o={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"p-3 rounded-lg bg-destructive/10 border border-destructive/20",children:[e.jsx("p",{className:"text-sm text-destructive font-medium",children:"⚠️ 重要提示"}),e.jsx("p",{className:"text-xs text-destructive/80 mt-1",children:"请将助记词抄写在纸上并妥善保管。任何人获取您的助记词都可以访问您的钱包资产。"})]}),e.jsx(n,{words:c})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    words: mockWords,
    onCopy: () => console.log('Copied!')
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    words: mockWords,
    hidden: true
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    words: mock24Words
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [hidden, setHidden] = useState(true);
    return <div className="space-y-4">
        <MnemonicDisplay words={mockWords} hidden={hidden} />
        <button onClick={() => setHidden(!hidden)} className="text-sm text-primary">
          {hidden ? '显示助记词' : '隐藏助记词'}
        </button>
      </div>;
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-sm text-destructive font-medium">⚠️ 重要提示</p>
        <p className="text-xs text-destructive/80 mt-1">
          请将助记词抄写在纸上并妥善保管。任何人获取您的助记词都可以访问您的钱包资产。
        </p>
      </div>
      <MnemonicDisplay words={mockWords} />
    </div>
}`,...o.parameters?.docs?.source}}};const k=["Default","Hidden","Words24","ToggleVisibility","WithWarning"];export{s as Default,r as Hidden,a as ToggleVisibility,o as WithWarning,t as Words24,k as __namedExportsOrder,w as default};
