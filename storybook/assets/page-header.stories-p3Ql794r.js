import{j as e}from"./iframe-L7e6CwBi.js";import{P as c}from"./page-header-CyqPMH--.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-DZkVTLt1.js";import"./index-m-NcY5rd.js";const g={title:"Layout/PageHeader",component:c,tags:["autodocs"],decorators:[n=>e.jsxs("div",{className:"bg-background min-h-[200px]",children:[e.jsx(n,{}),e.jsx("div",{className:"p-4",children:e.jsx("p",{className:"text-muted-foreground",children:"页面内容区域"})})]})]},r={args:{title:"转账",onBack:()=>alert("返回")}},t={args:{title:"设置",onBack:()=>alert("返回"),rightAction:e.jsx("button",{className:"text-primary text-sm font-medium",children:"保存"})}},s={args:{title:"钱包详情",onBack:()=>alert("返回"),transparent:!0},decorators:[n=>e.jsxs("div",{className:"bg-gradient-purple min-h-[200px]",children:[e.jsx(n,{}),e.jsx("div",{className:"p-4 text-white",children:e.jsx("p",{children:"渐变背景内容"})})]})]},a={args:{title:"首页",rightAction:e.jsx("button",{className:"hover:bg-muted/50 flex h-8 w-8 items-center justify-center rounded-full",children:e.jsx("svg",{className:"h-5 w-5",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"})})})}},o={args:{onBack:()=>alert("返回"),children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm",children:"ETH"}),e.jsx("svg",{className:"h-4 w-4",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M19 9l-7 7-7-7"})})]})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: '转账',
    onBack: () => alert('返回')
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    title: '设置',
    onBack: () => alert('返回'),
    rightAction: <button className="text-primary text-sm font-medium">保存</button>
  }
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    title: '钱包详情',
    onBack: () => alert('返回'),
    transparent: true
  },
  decorators: [Story => <div className="bg-gradient-purple min-h-[200px]">
        <Story />
        <div className="p-4 text-white">
          <p>渐变背景内容</p>
        </div>
      </div>]
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    title: '首页',
    rightAction: <button className="hover:bg-muted/50 flex h-8 w-8 items-center justify-center rounded-full">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    onBack: () => alert('返回'),
    children: <div className="flex items-center gap-2">
        <span className="text-sm">ETH</span>
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
  }
}`,...o.parameters?.docs?.source}}};const h=["Default","WithRightAction","TransparentBackground","NoBackButton","CustomContent"];export{o as CustomContent,r as Default,a as NoBackButton,s as TransparentBackground,t as WithRightAction,h as __namedExportsOrder,g as default};
