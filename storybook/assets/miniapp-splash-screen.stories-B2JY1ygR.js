import{j as o,r as f}from"./iframe-CyYNzbJL.js";import{f as A,w as p,e as n,a as I}from"./index-BjIXEP53.js";import{M as S}from"./miniapp-splash-screen-q7gaave_.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./config-HmZ3kn8E.js";import"./window-stack-BPi_p-h9.js";import"./proxy-CVfuGK97.js";const M={title:"Ecosystem/MiniappSplashScreen",component:S,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[t=>o.jsx("div",{className:"relative h-[600px] w-full bg-background",children:o.jsx(t,{})})],args:{visible:!0,animating:!0,onClose:A()}},c={args:{app:{name:"转账助手",icon:"https://picsum.photos/seed/splash1/200",themeColor:280}}},i={args:{app:{name:"DeFi 收益",icon:"https://picsum.photos/seed/splash2/200",themeColor:220}}},l={args:{app:{name:"质押挖矿",icon:"https://picsum.photos/seed/splash3/200",themeColor:145}}},m={args:{app:{name:"NFT 市场",icon:"https://picsum.photos/seed/splash4/200",themeColor:45}}},h={args:{app:{name:"风险提醒",icon:"https://picsum.photos/seed/splash5/200",themeColor:25}}},u={args:{app:{name:"跨链桥",icon:"https://picsum.photos/seed/splash6/200",themeColor:"#6366f1"}}},d={args:{app:{name:"链上投票",icon:"https://picsum.photos/seed/splash7/200",themeColor:"oklch(0.6 0.2 180)"}}},g={args:{app:{name:"暗黑钱包",icon:"https://picsum.photos/seed/splash8/200",themeColor:280}},decorators:[t=>o.jsx("div",{className:"dark relative h-[600px] w-full bg-background",children:o.jsx(t,{})})]},y={args:{app:{name:"静态启动",icon:"https://picsum.photos/seed/splash9/200",themeColor:200},animating:!1}},v={args:{app:{name:"隐藏的应用",icon:"https://picsum.photos/seed/splash10/200",themeColor:280},visible:!1}};function H(){const[t,s]=f.useState(!0);return f.useEffect(()=>{const e=setTimeout(()=>s(!1),3e3);return()=>clearTimeout(e)},[]),o.jsx(S,{app:{name:"3秒后关闭",icon:"https://picsum.photos/seed/splash11/200",themeColor:280},visible:t,onClose:()=>s(!1)})}const b={render:()=>o.jsx(H,{})},w={args:{app:{name:"渲染测试",icon:"https://picsum.photos/seed/test1/200",themeColor:120}},play:async({canvasElement:t,step:s})=>{const e=p(t);await s("验证组件渲染",async()=>{const a=e.getByTestId("miniapp-splash-screen");await n(a).toBeInTheDocument(),await n(a).toHaveAttribute("data-visible","true")}),await s("验证图标渲染",async()=>{const a=e.getByAltText("渲染测试");await n(a).toBeInTheDocument()}),await s("验证无障碍属性",async()=>{const a=e.getByTestId("miniapp-splash-screen");await n(a).toHaveAttribute("role","status"),await n(a).toHaveAttribute("aria-label","渲染测试 正在加载")})}},T={args:{app:{name:"渐变测试",icon:"https://picsum.photos/seed/test2/200",themeColor:180}},play:async({canvasElement:t,step:s})=>{const e=p(t);await s("验证 CSS 变量设置",async()=>{const r=e.getByTestId("miniapp-splash-screen").style;await n(r.getPropertyValue("--splash-hue-primary")).toBe("180"),await n(r.getPropertyValue("--splash-hue-secondary")).toBe("210"),await n(r.getPropertyValue("--splash-hue-tertiary")).toBe("150")})}},C={args:{app:{name:"动画测试",icon:"https://picsum.photos/seed/test3/200",themeColor:280},animating:!0},play:async({canvasElement:t,step:s})=>{const e=p(t);await s("验证动画属性启用",async()=>{const a=e.getByTestId("miniapp-splash-screen");await n(a).toHaveAttribute("data-animating","true")})}},x={render:function(){const[s,e]=f.useState(!0);return o.jsxs("div",{children:[o.jsx("button",{onClick:()=>e(a=>!a),className:"absolute bottom-4 left-4 z-50 rounded bg-primary px-4 py-2 text-primary-foreground","data-testid":"toggle-btn",children:"Toggle"}),o.jsx(S,{app:{name:"切换测试",icon:"https://picsum.photos/seed/test4/200",themeColor:280},visible:s})]})},play:async({canvasElement:t,step:s})=>{const e=p(t);await s("初始状态应该可见",async()=>{const a=e.getByTestId("miniapp-splash-screen");await n(a).toHaveAttribute("data-visible","true")}),await s("点击按钮切换隐藏",async()=>{e.getByTestId("toggle-btn").click(),await I(()=>{const r=e.getByTestId("miniapp-splash-screen");n(r).toHaveAttribute("data-visible","false")})}),await s("再次点击切换显示",async()=>{e.getByTestId("toggle-btn").click(),await I(()=>{const r=e.getByTestId("miniapp-splash-screen");n(r).toHaveAttribute("data-visible","true")})})}},B={args:{app:{name:"响应式测试",icon:"https://picsum.photos/seed/test5/200",themeColor:280}},parameters:{viewport:{defaultViewport:"mobile1"}},play:async({canvasElement:t,step:s})=>{const e=p(t);await s("移动端视图验证",async()=>{const a=e.getByTestId("miniapp-splash-screen");await n(a).toBeInTheDocument()})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '转账助手',
      icon: 'https://picsum.photos/seed/splash1/200',
      themeColor: 280 // 紫色
    }
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: 'DeFi 收益',
      icon: 'https://picsum.photos/seed/splash2/200',
      themeColor: 220 // 蓝色
    }
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '质押挖矿',
      icon: 'https://picsum.photos/seed/splash3/200',
      themeColor: 145 // 绿色
    }
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: 'NFT 市场',
      icon: 'https://picsum.photos/seed/splash4/200',
      themeColor: 45 // 橙色
    }
  }
}`,...m.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '风险提醒',
      icon: 'https://picsum.photos/seed/splash5/200',
      themeColor: 25 // 红色
    }
  }
}`,...h.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '跨链桥',
      icon: 'https://picsum.photos/seed/splash6/200',
      themeColor: '#6366f1' // Indigo
    }
  }
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '链上投票',
      icon: 'https://picsum.photos/seed/splash7/200',
      themeColor: 'oklch(0.6 0.2 180)'
    }
  }
}`,...d.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '暗黑钱包',
      icon: 'https://picsum.photos/seed/splash8/200',
      themeColor: 280
    }
  },
  decorators: [Story => <div className="dark relative h-[600px] w-full bg-background">
        <Story />
      </div>]
}`,...g.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '静态启动',
      icon: 'https://picsum.photos/seed/splash9/200',
      themeColor: 200
    },
    animating: false
  }
}`,...y.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '隐藏的应用',
      icon: 'https://picsum.photos/seed/splash10/200',
      themeColor: 280
    },
    visible: false
  }
}`,...v.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <AutoCloseDemo />
}`,...b.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '渲染测试',
      icon: 'https://picsum.photos/seed/test1/200',
      themeColor: 120
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('验证组件渲染', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen');
      await expect(splash).toBeInTheDocument();
      await expect(splash).toHaveAttribute('data-visible', 'true');
    });
    await step('验证图标渲染', async () => {
      const icon = canvas.getByAltText('渲染测试');
      await expect(icon).toBeInTheDocument();
    });
    await step('验证无障碍属性', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen');
      await expect(splash).toHaveAttribute('role', 'status');
      await expect(splash).toHaveAttribute('aria-label', '渲染测试 正在加载');
    });
  }
}`,...w.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '渐变测试',
      icon: 'https://picsum.photos/seed/test2/200',
      themeColor: 180 // Cyan
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('验证 CSS 变量设置', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen');
      const style = splash.style;

      // 验证主色
      await expect(style.getPropertyValue('--splash-hue-primary')).toBe('180');
      // 验证邻近色1 (+30)
      await expect(style.getPropertyValue('--splash-hue-secondary')).toBe('210');
      // 验证邻近色2 (-30)
      await expect(style.getPropertyValue('--splash-hue-tertiary')).toBe('150');
    });
  }
}`,...T.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '动画测试',
      icon: 'https://picsum.photos/seed/test3/200',
      themeColor: 280
    },
    animating: true
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('验证动画属性启用', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen');
      await expect(splash).toHaveAttribute('data-animating', 'true');
    });
  }
}`,...C.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: function VisibilityToggle() {
    const [visible, setVisible] = useState(true);
    return <div>
        <button onClick={() => setVisible(v => !v)} className="absolute bottom-4 left-4 z-50 rounded bg-primary px-4 py-2 text-primary-foreground" data-testid="toggle-btn">
          Toggle
        </button>
        <MiniappSplashScreen app={{
        name: '切换测试',
        icon: 'https://picsum.photos/seed/test4/200',
        themeColor: 280
      }} visible={visible} />
      </div>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('初始状态应该可见', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen');
      await expect(splash).toHaveAttribute('data-visible', 'true');
    });
    await step('点击按钮切换隐藏', async () => {
      const btn = canvas.getByTestId('toggle-btn');
      btn.click();
      await waitFor(() => {
        const splash = canvas.getByTestId('miniapp-splash-screen');
        expect(splash).toHaveAttribute('data-visible', 'false');
      });
    });
    await step('再次点击切换显示', async () => {
      const btn = canvas.getByTestId('toggle-btn');
      btn.click();
      await waitFor(() => {
        const splash = canvas.getByTestId('miniapp-splash-screen');
        expect(splash).toHaveAttribute('data-visible', 'true');
      });
    });
  }
}`,...x.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    app: {
      name: '响应式测试',
      icon: 'https://picsum.photos/seed/test5/200',
      themeColor: 280
    }
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1'
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('移动端视图验证', async () => {
      const splash = canvas.getByTestId('miniapp-splash-screen');
      await expect(splash).toBeInTheDocument();
    });
  }
}`,...B.parameters?.docs?.source}}};const P=["Default","BlueTheme","GreenTheme","OrangeTheme","RedTheme","HexColor","OklchColor","DarkMode","NoAnimation","Hidden","AutoClose","RenderTest","GradientTest","AnimationTest","VisibilityToggleTest","ResponsiveTest"];export{C as AnimationTest,b as AutoClose,i as BlueTheme,g as DarkMode,c as Default,T as GradientTest,l as GreenTheme,u as HexColor,v as Hidden,y as NoAnimation,d as OklchColor,m as OrangeTheme,h as RedTheme,w as RenderTest,B as ResponsiveTest,x as VisibilityToggleTest,P as __namedExportsOrder,M as default};
