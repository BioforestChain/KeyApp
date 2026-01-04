import{j as r}from"./iframe-BEYsz_Nt.js";import{R as t}from"./recover-wallet-form-hIohFidQ.js";import{f as s}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./index-D0E7N0oa.js";import"./index-B_jtOnfb.js";import"./button-CQpB5DKZ.js";import"./useRenderElement-BBCNVxdJ.js";import"./input-B6z-0htb.js";import"./useBaseUiId-CyRrLFo7.js";import"./index-j-9-AEpi.js";import"./index-CP8G5XVJ.js";import"./useTranslation-B3xWiyCw.js";import"./index-vFE_paAZ.js";import"./IconX-DcX_mvRm.js";import"./createReactComponent-BT0NPHve.js";import"./IconCheck-MuB5Cc54.js";import"./IconAlertCircle-Bieuwgiv.js";import"./IconLoader2-DQ13BzPu.js";const F={title:"Onboarding/RecoverWalletForm",component:t,parameters:{layout:"centered"},decorators:[n=>r.jsx("div",{className:"w-[360px] rounded-lg border bg-background p-4",children:r.jsx(n,{})})],args:{onSubmit:s()}},a={},e={args:{isSubmitting:!0}},o={render:n=>r.jsxs("div",{className:"space-y-4",children:[r.jsxs("p",{className:"text-xs text-muted-foreground",children:["测试助记词（请勿在生产环境使用）：",r.jsx("br",{}),"abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"]}),r.jsx(t,{...n})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{}",...a.parameters?.docs?.source},description:{story:"Default empty state",...a.parameters?.docs?.description}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
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
