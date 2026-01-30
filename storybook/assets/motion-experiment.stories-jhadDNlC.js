import{r as p,j as e,M as u,L as m}from"./iframe-g0rpXZ9Y.js";import{w as y,e as a,u as r}from"./index-BjIXEP53.js";import{A as x}from"./index-DrCCnfg1.js";import{m as i}from"./proxy-EzWGznH2.js";import"./preload-helper-PPVm8Dsz.js";const N={title:"Services/MotionExperiment",parameters:{layout:"fullscreen"}},l={render:function(){const[o,t]=p.useState(!1),s=16,d=24;return e.jsx(u,{transition:{type:"spring",stiffness:300,damping:30,mass:.8},children:e.jsx(m,{children:e.jsxs("div",{className:"relative h-screen w-full overflow-hidden bg-zinc-900 font-sans",children:[e.jsx(x,{mode:"popLayout",children:o?e.jsxs(i.div,{layoutId:"window-bg",className:"absolute inset-4 z-20 flex flex-col items-center justify-center bg-zinc-800",style:{borderRadius:d,overflow:"hidden"},children:[e.jsx(i.div,{layoutId:"icon-bg",className:"flex h-24 w-24 cursor-pointer items-center justify-center bg-blue-500",style:{borderRadius:d},onClick:h=>{h.stopPropagation(),t(!1)},"data-testid":"splash-icon",children:e.jsx(i.span,{layoutId:"icon-symbol",className:"text-4xl select-none",children:"🚀"})}),e.jsx(i.p,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},exit:{opacity:0,y:10},transition:{delay:.2},className:"mt-4 text-white",children:"点击图标关闭"})]},"open"):e.jsx(i.div,{layoutId:"window-bg",className:"absolute top-8 left-8 z-10 bg-zinc-800",style:{borderRadius:s,overflow:"hidden",width:64,height:64},onClick:()=>t(!0),"data-testid":"icon",children:e.jsx(i.div,{layoutId:"icon-bg",className:"flex h-full w-full cursor-pointer items-center justify-center bg-blue-500",style:{borderRadius:s},children:e.jsx(i.span,{layoutId:"icon-symbol",className:"text-2xl select-none",children:"🚀"})})},"closed")}),e.jsxs("div",{className:"absolute bottom-4 left-4 text-sm text-white",children:["状态: ",e.jsx("span",{"data-testid":"status",children:o?"open":"closed"})]})]})})})},play:async({canvasElement:n,step:o})=>{const t=y(n);await new Promise(s=>setTimeout(s,300)),await o("初始: closed",async()=>{a(t.getByTestId("status").textContent).toBe("closed"),a(t.getByTestId("icon")).toBeInTheDocument()}),await o("点击图标: 动画到中间",async()=>{await r.click(t.getByTestId("icon")),await new Promise(s=>setTimeout(s,800)),a(t.getByTestId("status").textContent).toBe("open"),a(t.getByTestId("splash-icon")).toBeInTheDocument()}),await o("点击关闭: 动画回去",async()=>{await r.click(t.getByTestId("splash-icon")),await new Promise(s=>setTimeout(s,800)),a(t.getByTestId("status").textContent).toBe("closed"),a(t.getByTestId("icon")).toBeInTheDocument()})}},w=({onClose:n})=>e.jsxs(i.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{delay:.1,duration:.2},className:"absolute top-4 right-4 z-50 flex h-8 items-center overflow-hidden rounded-full border border-white/20 bg-black/20 backdrop-blur-md",children:[e.jsx("button",{className:"flex h-full w-10 items-center justify-center hover:bg-white/10 active:bg-white/20",children:e.jsxs("div",{className:"flex gap-[2px]",children:[e.jsx("div",{className:"h-1 w-1 rounded-full bg-white"}),e.jsx("div",{className:"h-1 w-1 rounded-full bg-white"}),e.jsx("div",{className:"h-1 w-1 rounded-full bg-white"})]})}),e.jsx("div",{className:"h-4 w-[1px] bg-white/20"}),e.jsx("button",{onClick:o=>{o.stopPropagation(),n()},className:"flex h-full w-10 items-center justify-center hover:bg-white/10 active:bg-white/20","data-testid":"capsule-close",children:e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",strokeLinecap:"round",strokeLinejoin:"round",className:"text-white",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})})]}),c={render:function(){const[o,t]=p.useState(!1);return e.jsx(u,{transition:{type:"spring",stiffness:220,damping:28},children:e.jsx(m,{children:e.jsxs("div",{className:"relative flex h-screen w-full items-center justify-center overflow-hidden bg-zinc-100 font-sans",children:[e.jsx("div",{className:"absolute top-10 text-xs text-zinc-400",children:"iOS 风格启动：图标内容随窗口同步放大"}),e.jsx(x,{mode:"popLayout",children:o?e.jsxs(i.div,{layoutId:"app-container",className:"relative flex flex-col overflow-hidden bg-black shadow-2xl",style:{width:375,height:812,borderRadius:40,zIndex:20},"data-testid":"app-window",children:[e.jsx("div",{className:"pointer-events-none absolute inset-0 flex items-center justify-center",children:e.jsx(i.div,{layoutId:"app-logo",className:"flex items-center justify-center",children:e.jsx(i.span,{className:"text-9xl",animate:{opacity:.1,scale:1.2},transition:{delay:.3,duration:.5},children:""})})}),e.jsxs("div",{className:"relative z-10 flex h-full w-full flex-col",children:[e.jsx(w,{onClose:()=>t(!1)}),e.jsxs(i.div,{className:"flex-1 overflow-y-auto p-6 pt-24 text-white",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:{delay:.2,duration:.3},children:[e.jsx("h1",{className:"mb-2 text-3xl font-bold",children:"My App"}),e.jsx("p",{className:"mb-8 text-zinc-500",children:"Designed by Apple in California"}),e.jsx("div",{className:"grid grid-cols-2 gap-4",children:[1,2,3,4].map(s=>e.jsxs("div",{className:"aspect-square rounded-2xl border border-white/10 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800",children:[e.jsx("div",{className:"mb-2 h-8 w-8 rounded-full bg-white/20"}),e.jsx("div",{className:"h-2 w-16 rounded bg-white/10"})]},s))})]})]})]},"window"):e.jsx(i.div,{layoutId:"app-container",className:"relative cursor-pointer overflow-hidden bg-black text-white shadow-2xl",style:{width:68,height:68,borderRadius:16,position:"absolute",zIndex:10},onClick:()=>t(!0),"data-testid":"app-icon",children:e.jsx(i.div,{layoutId:"app-logo",className:"absolute inset-0 flex items-center justify-center",children:e.jsx("span",{className:"text-3xl",children:""})})},"icon")})]})})})},play:async({canvasElement:n,step:o})=>{const t=y(n);await new Promise(s=>setTimeout(s,500)),await o("Tap Icon",async()=>{await r.click(t.getByTestId("app-icon")),await new Promise(s=>setTimeout(s,1e3)),a(t.getByTestId("app-window")).toBeInTheDocument()}),await o("Close App",async()=>{await r.click(t.getByTestId("capsule-close")),await new Promise(s=>setTimeout(s,1e3)),a(t.getByTestId("app-icon")).toBeInTheDocument()})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: function IconToSplashStory() {
    const [isOpen, setIsOpen] = useState(false);

    // 定义圆角数值，保持一致性
    const BORDER_RADIUS_CLOSED = 16; // 对应 rounded-2xl
    const BORDER_RADIUS_OPEN = 24; // 对应 rounded-3xl

    return <MotionConfig transition={{
      type: 'spring',
      stiffness: 300,
      damping: 30,
      mass: 0.8
    }}>
        <LayoutGroup>
          <div className="relative h-screen w-full overflow-hidden bg-zinc-900 font-sans">
            <AnimatePresence mode="popLayout">
              {!isOpen ? (/* ================= CLOSED (Icon) ================= */
            <motion.div layoutId="window-bg" key="closed" className="absolute top-8 left-8 z-10 bg-zinc-800" // 即使是 closed 状态，最好也给个背景色防止闪烁
            style={{
              borderRadius: BORDER_RADIUS_CLOSED,
              overflow: 'hidden',
              // 关键修复：防止内容溢出圆角
              width: 64,
              // 显式宽高有助于计算
              height: 64
            }} onClick={() => setIsOpen(true)} data-testid="icon">
                  <motion.div layoutId="icon-bg" className="flex h-full w-full cursor-pointer items-center justify-center bg-blue-500" style={{
                // 这里不需要 overflow hidden，因为它是内部填充物
                borderRadius: BORDER_RADIUS_CLOSED
              }}>
                    <motion.span layoutId="icon-symbol" className="text-2xl select-none">
                      🚀
                    </motion.span>
                  </motion.div>
                </motion.div>) : (/* ================= OPEN (Window) ================= */
            <motion.div layoutId="window-bg" key="open"
            // 移除 inset-4，改用具体的宽高或定位，或者保留 inset 但配合 layout
            className="absolute inset-4 z-20 flex flex-col items-center justify-center bg-zinc-800" style={{
              borderRadius: BORDER_RADIUS_OPEN,
              overflow: 'hidden' // 关键修复：在放大过程中保持圆角裁剪
            }}>
                  <motion.div layoutId="icon-bg" className="flex h-24 w-24 cursor-pointer items-center justify-center bg-blue-500" style={{
                borderRadius: BORDER_RADIUS_OPEN // 内部元素也需要平滑过渡圆角
              }} onClick={e => {
                e.stopPropagation();
                setIsOpen(false);
              }} data-testid="splash-icon">
                    <motion.span layoutId="icon-symbol" className="text-4xl select-none">
                      🚀
                    </motion.span>
                  </motion.div>

                  <motion.p initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: 10
              }} transition={{
                delay: 0.2
              }} className="mt-4 text-white">
                    点击图标关闭
                  </motion.p>
                </motion.div>)}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 text-sm text-white">
              状态: <span data-testid="status">{isOpen ? 'open' : 'closed'}</span>
            </div>
          </div>
        </LayoutGroup>
      </MotionConfig>;
  },
  // Play 函数保持不变，因为逻辑和 testId 都保留了
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 300));
    await step('初始: closed', async () => {
      expect(canvas.getByTestId('status').textContent).toBe('closed');
      expect(canvas.getByTestId('icon')).toBeInTheDocument();
    });
    await step('点击图标: 动画到中间', async () => {
      await userEvent.click(canvas.getByTestId('icon'));
      // 等待动画完成
      await new Promise(resolve => setTimeout(resolve, 800));
      expect(canvas.getByTestId('status').textContent).toBe('open');
      expect(canvas.getByTestId('splash-icon')).toBeInTheDocument();
    });
    await step('点击关闭: 动画回去', async () => {
      await userEvent.click(canvas.getByTestId('splash-icon'));
      await new Promise(resolve => setTimeout(resolve, 800));
      expect(canvas.getByTestId('status').textContent).toBe('closed');
      expect(canvas.getByTestId('icon')).toBeInTheDocument();
    });
  }
}`,...l.parameters?.docs?.source},description:{story:`基础 layoutId 测试 - FLIP 正确实现

关键：使用 LayoutGroup 包裹，确保 layoutId 跨组件工作
两个元素都在 AnimatePresence 内，实现正确的交叉淡化`,...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: function IOSLaunch() {
    const [isOpen, setIsOpen] = useState(false);
    return <MotionConfig transition={{
      type: 'spring',
      stiffness: 220,
      damping: 28
    }}>
        <LayoutGroup>
          <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-zinc-100 font-sans">
            <div className="absolute top-10 text-xs text-zinc-400">iOS 风格启动：图标内容随窗口同步放大</div>

            <AnimatePresence mode="popLayout">
              {!isOpen ? (/* ================= ICON 状态 ================= */
            <motion.div key="icon" layoutId="app-container" // 1. 容器变形
            className="relative cursor-pointer overflow-hidden bg-black text-white shadow-2xl" style={{
              width: 68,
              // iOS 图标标准尺寸
              height: 68,
              borderRadius: 16,
              // 连续曲率圆角
              position: 'absolute',
              zIndex: 10
            }} onClick={() => setIsOpen(true)} data-testid="app-icon">
                  {/* 2. Logo 变形：居中，尺寸较小 */}
                  <motion.div layoutId="app-logo" className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl"></span>
                  </motion.div>
                </motion.div>) : (/* ================= WINDOW 状态 ================= */
            <motion.div key="window" layoutId="app-container" // 1. 容器变形
            className="relative flex flex-col overflow-hidden bg-black shadow-2xl" style={{
              width: 375,
              height: 812,
              // iPhone 尺寸
              borderRadius: 40,
              // 屏幕圆角
              zIndex: 20
            }} data-testid="app-window">
                  {/*
                      核心技巧：
                      在 Window 打开时，Logo 依然存在且居中，但是变大了。
                      Motion 会自动计算小 Logo 到大 Logo 的插值。
                      这给人的感觉就是“图标放大了”。
                   */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <motion.div layoutId="app-logo" className="flex items-center justify-center">
                      {/* 这里 Logo 变大了，并且透明度逐渐变淡，因为内容要浮现了 */}
                      <motion.span className="text-9xl" // 变大！
                  animate={{
                    opacity: 0.1,
                    scale: 1.2
                  }} // 可选：进入后淡化或继续微调
                  transition={{
                    delay: 0.3,
                    duration: 0.5
                  }} // 变形结束后再淡化
                  >
                        
                      </motion.span>
                    </motion.div>
                  </div>

                  {/* ================= 实际 APP 内容 ================= */}
                  {/* 使用 absolute 覆盖在 Splash Logo 上，并延迟显示 */}
                  <div className="relative z-10 flex h-full w-full flex-col">
                    <CapsuleButton onClose={() => setIsOpen(false)} />

                    <motion.div className="flex-1 overflow-y-auto p-6 pt-24 text-white" initial={{
                  opacity: 0
                }} animate={{
                  opacity: 1
                }} // 简单的淡入
                exit={{
                  opacity: 0
                }} transition={{
                  delay: 0.2,
                  duration: 0.3
                }}>
                      <h1 className="mb-2 text-3xl font-bold">My App</h1>
                      <p className="mb-8 text-zinc-500">Designed by Apple in California</p>

                      <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square rounded-2xl border border-white/10 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800">
                            <div className="mb-2 h-8 w-8 rounded-full bg-white/20" />
                            <div className="h-2 w-16 rounded bg-white/10" />
                          </div>)}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>)}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </MotionConfig>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await new Promise(resolve => setTimeout(resolve, 500));
    await step('Tap Icon', async () => {
      await userEvent.click(canvas.getByTestId('app-icon'));
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(canvas.getByTestId('app-window')).toBeInTheDocument();
    });
    await step('Close App', async () => {
      await userEvent.click(canvas.getByTestId('capsule-close'));
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(canvas.getByTestId('app-icon')).toBeInTheDocument();
    });
  }
}`,...c.parameters?.docs?.source}}};const j=["IconToSplash","IconToMiniProgram"];export{c as IconToMiniProgram,l as IconToSplash,j as __namedExportsOrder,N as default};
