import{j as r}from"./iframe-BthQp-yI.js";import{R as t}from"./recover-wallet-form-DvCzM7hP.js";import{f as s}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./index-D0E7N0oa.js";import"./index-B_jtOnfb.js";import"./button-C78JC7RI.js";import"./useButton-DJTZFLL_.js";import"./useRenderElement-DlBKa77z.js";import"./input-hAc8UXGE.js";import"./useField-BC0S3jmd.js";import"./useBaseUiId-B5L88r9M.js";import"./index-Bdi7dIcT.js";import"./index-D9SMGAnr.js";import"./useTranslation-RlIfOlQn.js";import"./index-BwV9l44E.js";import"./IconX-DrWLqtlx.js";import"./createReactComponent-BFWyios4.js";import"./IconCheck-B6x97gNc.js";import"./IconAlertCircle-RmefdvIa.js";import"./IconLoader2-D1IzGqjN.js";const E={title:"Onboarding/RecoverWalletForm",component:t,parameters:{layout:"centered"},decorators:[n=>r.jsx("div",{className:"w-[360px] rounded-lg border bg-background p-4",children:r.jsx(n,{})})],args:{onSubmit:s()}},a={},o={args:{isSubmitting:!0}},e={render:n=>r.jsxs("div",{className:"space-y-4",children:[r.jsxs("p",{className:"text-xs text-muted-foreground",children:["测试助记词（请勿在生产环境使用）：",r.jsx("br",{}),"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"]}),r.jsx(t,{...n})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source},description:{story:"Default empty state",...a.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...e.parameters?.docs?.source},description:{story:"Interactive demo with prefilled valid mnemonic",...e.parameters?.docs?.description}}};const M=["Default","Submitting","WithValidMnemonic"];export{a as Default,o as Submitting,e as WithValidMnemonic,M as __namedExportsOrder,E as default};
