import{j as r}from"./iframe-BuDZgClS.js";import{R as t}from"./recover-wallet-form-gT0mYPHl.js";import{f as s}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./index-D0E7N0oa.js";import"./button-CqZpCM-a.js";import"./useButton-BPP4vCD8.js";import"./useRenderElement-CnI4ETw1.js";import"./input-BXxTzo8x.js";import"./useField-C4M4H8YW.js";import"./useBaseUiId-D4izhuAu.js";import"./index-D3GrSwlj.js";import"./index-B84DK1ok.js";import"./useTranslation-CwjW3P5e.js";import"./index-0yvu-sz8.js";import"./IconX-viUyieuq.js";import"./createReactComponent-CCT_KxSw.js";import"./IconCheck-BYf6dG4O.js";import"./IconAlertCircle-71rb_LD7.js";import"./IconLoader2-BGGuoQbK.js";const w={title:"Onboarding/RecoverWalletForm",component:t,parameters:{layout:"centered"},decorators:[n=>r.jsx("div",{className:"w-[360px] rounded-lg border bg-background p-4",children:r.jsx(n,{})})],args:{onSubmit:s()}},a={},o={args:{isSubmitting:!0}},e={render:n=>r.jsxs("div",{className:"space-y-4",children:[r.jsxs("p",{className:"text-xs text-muted-foreground",children:["测试助记词（请勿在生产环境使用）：",r.jsx("br",{}),"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"]}),r.jsx(t,{...n})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source},description:{story:"Default empty state",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    isSubmitting: true
  }
}`,...o.parameters?.docs?.source},description:{story:"With submitting state",...o.parameters?.docs?.description}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: args => {
    // Note: This is a test mnemonic, never use in production
    return <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          测试助记词（请勿在生产环境使用）：
          <br />
          abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon
          about
        </p>
        <RecoverWalletForm {...args} />
      </div>;
  }
}`,...e.parameters?.docs?.source},description:{story:"Interactive demo with prefilled valid mnemonic",...e.parameters?.docs?.description}}};const E=["Default","Submitting","WithValidMnemonic"];export{a as Default,o as Submitting,e as WithValidMnemonic,E as __namedExportsOrder,w as default};
