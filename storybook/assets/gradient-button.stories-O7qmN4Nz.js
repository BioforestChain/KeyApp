import{j as e}from"./iframe-g2b0m8DI.js";import{G as r}from"./gradient-button-Bxl7tD7d.js";import"./preload-helper-PPVm8Dsz.js";import"./index-nmRTiCJZ.js";import"./index-B_jtOnfb.js";import"./utils-CDN07tui.js";import"./createReactComponent-Cuq699P7.js";const h={title:"Common/GradientButton",component:r,tags:["autodocs"],argTypes:{variant:{control:"select",options:["blue","purple","red","mint"]},size:{control:"select",options:["sm","md","lg"]},fullWidth:{control:"boolean"},loading:{control:"boolean"},disabled:{control:"boolean"}}},t={args:{children:"确认转账"}},a={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx(r,{variant:"purple",children:"Purple (默认)"}),e.jsx(r,{variant:"blue",children:"Blue"}),e.jsx(r,{variant:"red",children:"Red"}),e.jsx(r,{variant:"mint",children:"Mint"})]})},s={render:()=>e.jsxs("div",{className:"flex flex-col items-start gap-4",children:[e.jsx(r,{size:"sm",children:"Small"}),e.jsx(r,{size:"md",children:"Medium (默认)"}),e.jsx(r,{size:"lg",children:"Large"})]})},n={args:{children:"处理中...",loading:!0}},o={args:{children:"不可用",disabled:!0}},i={args:{children:"全宽按钮",fullWidth:!0}},d={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-muted-foreground text-sm",children:"拖拽容器边缘或使用工具栏切换容器尺寸，观察按钮响应式变化"}),e.jsx(r,{fullWidth:!0,children:"响应式按钮"})]}),parameters:{docs:{description:{story:"按钮使用 @container 查询响应容器尺寸变化。尝试调整容器宽度查看效果。"}}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: '确认转账'
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <GradientButton variant="purple">Purple (默认)</GradientButton>
      <GradientButton variant="blue">Blue</GradientButton>
      <GradientButton variant="red">Red</GradientButton>
      <GradientButton variant="mint">Mint</GradientButton>
    </div>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col items-start gap-4">
      <GradientButton size="sm">Small</GradientButton>
      <GradientButton size="md">Medium (默认)</GradientButton>
      <GradientButton size="lg">Large</GradientButton>
    </div>
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    children: '处理中...',
    loading: true
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: '不可用',
    disabled: true
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: '全宽按钮',
    fullWidth: true
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <p className="text-muted-foreground text-sm">拖拽容器边缘或使用工具栏切换容器尺寸，观察按钮响应式变化</p>
      <GradientButton fullWidth>响应式按钮</GradientButton>
    </div>,
  parameters: {
    docs: {
      description: {
        story: '按钮使用 @container 查询响应容器尺寸变化。尝试调整容器宽度查看效果。'
      }
    }
  }
}`,...d.parameters?.docs?.source}}};const f=["Default","AllVariants","AllSizes","Loading","Disabled","FullWidth","ResponsiveContainer"];export{s as AllSizes,a as AllVariants,t as Default,o as Disabled,i as FullWidth,n as Loading,d as ResponsiveContainer,f as __namedExportsOrder,h as default};
