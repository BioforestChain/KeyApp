import{j as t}from"./iframe-13xkpxxJ.js";import{E as i}from"./empty-state-CO3P3pDq.js";import{G as n}from"./gradient-button-DCnBx6RQ.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./index-4ISX3GU7.js";import"./index-B_jtOnfb.js";import"./createReactComponent-BmAlyfWH.js";const j={title:"Common/EmptyState",component:i,tags:["autodocs"]},a=()=>t.jsx("svg",{className:"w-16 h-16",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1,children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"})}),c=()=>t.jsx("svg",{className:"w-16 h-16",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:1,children:t.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})}),o={args:{icon:t.jsx(a,{}),title:"暂无钱包",description:"创建或导入钱包开始使用",action:t.jsx(n,{children:"创建钱包"})}},e={args:{icon:t.jsx(c,{}),title:"暂无交易记录",description:"完成第一笔交易后，记录将显示在这里"}},r={args:{title:"暂无资产",description:"转入资产后将显示在这里",action:t.jsx("button",{className:"text-primary text-sm font-medium",children:"了解如何转入"})}},s={args:{icon:t.jsx(a,{}),title:"容器响应式",description:"调整容器尺寸，观察文字大小变化",action:t.jsx(n,{children:"操作按钮"})},parameters:{docs:{description:{story:"使用 @container 查询响应容器尺寸"}}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <WalletIcon />,
    title: '暂无钱包',
    description: '创建或导入钱包开始使用',
    action: <GradientButton>创建钱包</GradientButton>
  }
}`,...o.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <TransactionIcon />,
    title: '暂无交易记录',
    description: '完成第一笔交易后，记录将显示在这里'
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    title: '暂无资产',
    description: '转入资产后将显示在这里',
    action: <button className="text-primary text-sm font-medium">
        了解如何转入
      </button>
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    icon: <WalletIcon />,
    title: '容器响应式',
    description: '调整容器尺寸，观察文字大小变化',
    action: <GradientButton>操作按钮</GradientButton>
  },
  parameters: {
    docs: {
      description: {
        story: '使用 @container 查询响应容器尺寸'
      }
    }
  }
}`,...s.parameters?.docs?.source}}};const f=["Default","NoTransactions","NoAssets","Responsive"];export{o as Default,r as NoAssets,e as NoTransactions,s as Responsive,f as __namedExportsOrder,j as default};
