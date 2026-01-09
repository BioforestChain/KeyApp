import{j as r}from"./iframe-D8HuPklR.js";import{R as t}from"./recover-wallet-form-Ki7kkxH0.js";import{f as s}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./index-D0E7N0oa.js";import"./index-B_jtOnfb.js";import"./button-B8ZysgrZ.js";import"./useButton-hp5SGEGC.js";import"./useRenderElement-Dtgsp6Pg.js";import"./input-DVV8I3gP.js";import"./useBaseUiId-BZ1JfcV7.js";import"./index-DqZfb2Si.js";import"./index-CV1wKv8D.js";import"./useTranslation-5HKfA7bW.js";import"./index-D85HYSDi.js";import"./IconX-CfRcC0S9.js";import"./createReactComponent-DdmPrrAT.js";import"./IconCheck-Bm191dgP.js";import"./IconAlertCircle-DmfGovmB.js";import"./IconLoader2-Yq3lOSla.js";const w={title:"Onboarding/RecoverWalletForm",component:t,parameters:{layout:"centered"},decorators:[n=>r.jsx("div",{className:"w-[360px] rounded-lg border bg-background p-4",children:r.jsx(n,{})})],args:{onSubmit:s()}},a={},o={args:{isSubmitting:!0}},e={render:n=>r.jsxs("div",{className:"space-y-4",children:[r.jsxs("p",{className:"text-xs text-muted-foreground",children:["测试助记词（请勿在生产环境使用）：",r.jsx("br",{}),"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"]}),r.jsx(t,{...n})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source},description:{story:"Default empty state",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
