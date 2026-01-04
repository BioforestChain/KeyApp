import{j as r}from"./iframe-BMrLP8cp.js";import{R as t}from"./recover-wallet-form-CzLB0Lf6.js";import{f as s}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./index-D0E7N0oa.js";import"./index-B_jtOnfb.js";import"./button-C-X0C96B.js";import"./useRenderElement-DpudR0zo.js";import"./input-BXCu-Ig6.js";import"./useBaseUiId-sxsCLZlp.js";import"./index-VuwC0Bq2.js";import"./index-DTX6dXh7.js";import"./useTranslation-z5I97Fu9.js";import"./index-DAM9MvhS.js";import"./IconX-BWCViQou.js";import"./createReactComponent-cD9o9rb1.js";import"./IconCheck-DHxbXaSg.js";import"./IconAlertCircle-CXB_77OK.js";import"./IconLoader2-L15-1EDq.js";const F={title:"Onboarding/RecoverWalletForm",component:t,parameters:{layout:"centered"},decorators:[n=>r.jsx("div",{className:"w-[360px] rounded-lg border bg-background p-4",children:r.jsx(n,{})})],args:{onSubmit:s()}},a={},e={args:{isSubmitting:!0}},o={render:n=>r.jsxs("div",{className:"space-y-4",children:[r.jsxs("p",{className:"text-xs text-muted-foreground",children:["测试助记词（请勿在生产环境使用）：",r.jsx("br",{}),"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"]}),r.jsx(t,{...n})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source},description:{story:"Default empty state",...a.parameters?.docs?.description}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    isSubmitting: true
  }
}`,...e.parameters?.docs?.source},description:{story:"With submitting state",...e.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source},description:{story:"Interactive demo with prefilled valid mnemonic",...o.parameters?.docs?.description}}};const w=["Default","Submitting","WithValidMnemonic"];export{a as Default,e as Submitting,o as WithValidMnemonic,w as __namedExportsOrder,F as default};
