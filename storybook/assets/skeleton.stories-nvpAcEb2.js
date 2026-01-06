import{j as e}from"./iframe-CLYHcCRY.js";import{S as s,a as i,b as p,c as u}from"./skeleton-CAwtnORC.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";const x={title:"Common/Skeleton",component:s,tags:["autodocs"]},a={args:{className:"h-4 w-32"}},r={args:{className:"w-12 aspect-square rounded-full"}},c={args:{className:"h-24 w-full rounded-lg"}},t={render:()=>e.jsx(i,{lines:3})},o={render:()=>e.jsx(p,{})},l={render:()=>e.jsx(u,{count:5})},n={render:()=>e.jsxs("div",{className:"bg-gradient-purple space-y-4 rounded-2xl p-4",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(s,{className:"aspect-square w-10 shrink-0 rounded-full bg-white/20"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(s,{className:"h-4 w-20 bg-white/20"}),e.jsx(s,{className:"h-3 w-16 bg-white/20"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(s,{className:"h-8 w-32 bg-white/20"}),e.jsx(s,{className:"h-4 w-20 bg-white/20"})]}),e.jsx(s,{className:"h-4 w-40 bg-white/20"})]}),parameters:{docs:{description:{story:"钱包卡片加载状态"}}}},d={render:()=>e.jsx("div",{className:"space-y-2",children:[1,2,3].map(m=>e.jsxs("div",{className:"flex items-center gap-3 rounded-lg p-3",children:[e.jsx(s,{className:"aspect-square w-10 shrink-0 rounded-full"}),e.jsxs("div",{className:"flex-1 space-y-1.5",children:[e.jsx(s,{className:"h-4 w-16"}),e.jsx(s,{className:"h-3 w-24"})]}),e.jsxs("div",{className:"space-y-1.5 text-right",children:[e.jsx(s,{className:"ml-auto h-4 w-20"}),e.jsx(s,{className:"ml-auto h-3 w-14"})]})]},m))}),parameters:{docs:{description:{story:"代币列表加载状态"}}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    className: 'h-4 w-32'
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    className: 'w-12 aspect-square rounded-full'
  }
}`,...r.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    className: 'h-24 w-full rounded-lg'
  }
}`,...c.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <SkeletonText lines={3} />
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <SkeletonCard />
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <SkeletonList count={5} />
}`,...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="bg-gradient-purple space-y-4 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="aspect-square w-10 shrink-0 rounded-full bg-white/20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-20 bg-white/20" />
          <Skeleton className="h-3 w-16 bg-white/20" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-32 bg-white/20" />
        <Skeleton className="h-4 w-20 bg-white/20" />
      </div>
      <Skeleton className="h-4 w-40 bg-white/20" />
    </div>,
  parameters: {
    docs: {
      description: {
        story: '钱包卡片加载状态'
      }
    }
  }
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-2">
      {[1, 2, 3].map(i => <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <Skeleton className="aspect-square w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-1.5 text-right">
            <Skeleton className="ml-auto h-4 w-20" />
            <Skeleton className="ml-auto h-3 w-14" />
          </div>
        </div>)}
    </div>,
  parameters: {
    docs: {
      description: {
        story: '代币列表加载状态'
      }
    }
  }
}`,...d.parameters?.docs?.source}}};const S=["Default","Circle","Rectangle","Text","Card","List","WalletCardSkeleton","TokenListSkeleton"];export{o as Card,r as Circle,a as Default,l as List,c as Rectangle,t as Text,d as TokenListSkeleton,n as WalletCardSkeleton,S as __namedExportsOrder,x as default};
