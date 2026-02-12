import{r as u,j as t,L as y}from"./iframe-BKKGzOJ9.js";import{w as h,e as n,u as p}from"./index-BjIXEP53.js";import{M as w}from"./MiniappVisualProvider-DvbmCJ37.js";import{g as x,m as b,D as g}from"./index-C1Sz92Ee.js";import{A as l}from"./index-BWtM5w26.js";import{m as a}from"./proxy-Beqz-p7r.js";import"./preload-helper-PPVm8Dsz.js";import"./wujie-container-QGgz7FjU.js";import"./index-b4ZkC7eL.js";import"./service-6XO18RSB.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BNPn19nD.js";import"./amount-BQsqQYGO.js";import"./bioforest-Dms9Dixt.js";import"./web-DLRHDpGr.js";import"./user-profile-CzXUEYwY.js";import"./avatar-codec-DqW-7FcL.js";import"./breakpoint-DQ_qwb34.js";import"./window-stack-BPi_p-h9.js";import"./index-BwiwV7zE.js";const U={title:"Services/MiniappRuntime/LaunchMotion",parameters:{layout:"fullscreen"}},m=1,I=b(g,{motion:{timeScale:m}}),i=x(I),r={render:function(){const[s,e]=u.useState("idle");return t.jsx(w,{override:{motion:{timeScale:m}},children:t.jsx(y,{children:t.jsxs("div",{className:"relative h-screen overflow-hidden bg-zinc-900 font-sans",children:[t.jsx(l,{mode:"popLayout",children:s==="idle"&&t.jsx(a.div,{layoutId:"miniapp-container",transition:i.sharedLayout,className:"absolute top-8 left-8 z-10 bg-zinc-800",style:{width:64,height:64,borderRadius:16,overflow:"hidden"},onClick:()=>e("window"),"data-testid":"icon",children:t.jsx(a.div,{layoutId:"miniapp-icon",transition:i.sharedLayout,className:"flex h-full w-full items-center justify-center bg-blue-500",style:{borderRadius:16},children:t.jsx(a.span,{layoutId:"miniapp-symbol",transition:i.sharedLayout,className:"text-2xl select-none",children:"🚀"})})},"idle")}),t.jsx(l,{mode:"popLayout",children:s==="window"&&t.jsxs(a.div,{layoutId:"miniapp-container",transition:i.sharedLayout,className:"absolute inset-4 z-20 flex flex-col bg-zinc-800",style:{borderRadius:24,overflow:"hidden"},initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},"data-testid":"window",children:[t.jsxs("div",{className:"flex items-center gap-3 bg-blue-500/80 p-4",children:[t.jsx(a.div,{layoutId:"miniapp-icon",transition:i.sharedLayout,className:"flex h-12 w-12 items-center justify-center bg-blue-500",style:{borderRadius:16},children:t.jsx(a.span,{layoutId:"miniapp-symbol",transition:i.sharedLayout,className:"text-3xl select-none",children:"🚀"})}),t.jsx("span",{className:"font-bold text-white",children:"My Miniapp"}),t.jsx("button",{onClick:()=>e("idle"),className:"ml-auto rounded bg-white/20 px-3 py-1 text-white","data-testid":"btn-close",children:"关闭"})]}),t.jsx("div",{className:"flex-1 p-4 text-white",children:"Miniapp 内容区域"})]},"window")}),t.jsxs("div",{className:"absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white",children:["状态: ",t.jsx("span",{"data-testid":"status",children:s})]})]})})})},play:async({canvasElement:d,step:s})=>{const e=h(d);await new Promise(o=>setTimeout(o,200)),await s("初始 idle",async()=>{n(e.getByTestId("status").textContent).toBe("idle"),n(e.getByTestId("icon")).toBeInTheDocument()}),await s("点击启动",async()=>{await p.click(e.getByTestId("icon")),await new Promise(o=>setTimeout(o,600)),n(e.getByTestId("status").textContent).toBe("window"),n(e.getByTestId("window")).toBeInTheDocument()}),await s("点击关闭",async()=>{await p.click(e.getByTestId("btn-close")),await new Promise(o=>setTimeout(o,600)),n(e.getByTestId("status").textContent).toBe("idle"),n(e.getByTestId("icon")).toBeInTheDocument()})}},c={render:function(){const[s,e]=u.useState("idle"),o=()=>{e("splash"),setTimeout(()=>e("window"),900)};return t.jsx(w,{override:{motion:{timeScale:m}},children:t.jsx(y,{children:t.jsxs("div",{className:"relative h-screen overflow-hidden bg-zinc-900 font-sans",children:[t.jsx(l,{mode:"popLayout",children:s==="idle"&&t.jsx(a.div,{layoutId:"splash-container",transition:i.sharedLayout,className:"absolute top-8 left-8 z-10 bg-orange-500",style:{width:64,height:64,borderRadius:16,overflow:"hidden"},onClick:o,"data-testid":"icon",children:t.jsx(a.div,{layoutId:"splash-icon",transition:i.sharedLayout,className:"flex h-full w-full items-center justify-center",style:{borderRadius:16},children:t.jsx(a.span,{layoutId:"splash-symbol",transition:i.sharedLayout,className:"text-2xl select-none",children:"🎯"})})},"idle")}),t.jsx(l,{children:s==="splash"&&t.jsx(a.div,{className:"absolute inset-0 bg-gradient-to-b from-orange-400 to-amber-500",initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},transition:i.uiFast,"data-testid":"splash-bg"},"splash-bg")}),t.jsx(l,{mode:"popLayout",children:s==="splash"&&t.jsx(a.div,{layoutId:"splash-container",transition:i.sharedLayout,className:"absolute top-1/2 left-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-orange-600 shadow-xl",style:{borderRadius:24,overflow:"hidden"},"data-testid":"splash-icon",children:t.jsx(a.div,{layoutId:"splash-icon",transition:i.sharedLayout,className:"flex h-full w-full items-center justify-center",style:{borderRadius:24},children:t.jsx(a.span,{layoutId:"splash-symbol",transition:i.sharedLayout,className:"text-4xl select-none",children:"🎯"})})},"splash")}),t.jsx(l,{mode:"popLayout",children:s==="window"&&t.jsxs(a.div,{layoutId:"splash-container",transition:i.sharedLayout,className:"absolute inset-4 z-30 flex flex-col bg-white",style:{borderRadius:24,overflow:"hidden"},initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},"data-testid":"window",children:[t.jsxs("div",{className:"flex items-center gap-3 bg-orange-500 p-4",children:[t.jsx(a.div,{layoutId:"splash-icon",transition:i.sharedLayout,className:"flex h-10 w-10 items-center justify-center bg-orange-600",style:{borderRadius:12},children:t.jsx(a.span,{layoutId:"splash-symbol",transition:i.sharedLayout,className:"text-lg select-none",children:"🎯"})}),t.jsx("span",{className:"font-bold text-white",children:"Splash Miniapp"}),t.jsx("button",{onClick:()=>e("idle"),className:"ml-auto rounded bg-white/20 px-3 py-1 text-white","data-testid":"btn-close",children:"关闭"})]}),t.jsx("div",{className:"flex-1 p-4",children:t.jsx("p",{className:"text-gray-800",children:"App 内容区域"})})]},"window")}),t.jsxs("div",{className:"absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white",children:["状态: ",t.jsx("span",{"data-testid":"status",children:s})]})]})})})},play:async({canvasElement:d,step:s})=>{const e=h(d);await new Promise(o=>setTimeout(o,200)),await s("初始 idle",async()=>{n(e.getByTestId("status").textContent).toBe("idle"),n(e.getByTestId("icon")).toBeInTheDocument()}),await s("点击进入 splash",async()=>{await p.click(e.getByTestId("icon")),await new Promise(o=>setTimeout(o,500)),n(e.getByTestId("status").textContent).toBe("splash"),n(e.getByTestId("splash-icon")).toBeInTheDocument()}),await s("自动进入 window",async()=>{await new Promise(o=>setTimeout(o,900)),n(e.getByTestId("status").textContent).toBe("window"),n(e.getByTestId("window")).toBeInTheDocument()}),await s("关闭返回 idle",async()=>{await p.click(e.getByTestId("btn-close")),await new Promise(o=>setTimeout(o,500)),n(e.getByTestId("status").textContent).toBe("idle")})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: function DirectPathStory() {
    const [state, setState] = useState<'idle' | 'window'>('idle');
    return <MiniappVisualProvider override={{
      motion: {
        timeScale: MOTION_DEBUG_TIME_SCALE
      }
    }}>
        <LayoutGroup>
          <div className="relative h-screen overflow-hidden bg-zinc-900 font-sans">
            {/* idle icon */}
            <AnimatePresence mode="popLayout">
              {state === 'idle' && <motion.div key="idle" layoutId="miniapp-container" transition={MOTION_PRESETS.sharedLayout} className="absolute top-8 left-8 z-10 bg-zinc-800" style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              overflow: 'hidden'
            }} onClick={() => setState('window')} data-testid="icon">
                  <motion.div layoutId="miniapp-icon" transition={MOTION_PRESETS.sharedLayout} className="flex h-full w-full items-center justify-center bg-blue-500" style={{
                borderRadius: 16
              }}>
                    <motion.span layoutId="miniapp-symbol" transition={MOTION_PRESETS.sharedLayout} className="text-2xl select-none">
                      🚀
                    </motion.span>
                  </motion.div>
                </motion.div>}
            </AnimatePresence>

            {/* window */}
            <AnimatePresence mode="popLayout">
              {state === 'window' && <motion.div key="window" layoutId="miniapp-container" transition={MOTION_PRESETS.sharedLayout} className="absolute inset-4 z-20 flex flex-col bg-zinc-800" style={{
              borderRadius: 24,
              overflow: 'hidden'
            }} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} data-testid="window">
                  <div className="flex items-center gap-3 bg-blue-500/80 p-4">
                    <motion.div layoutId="miniapp-icon" transition={MOTION_PRESETS.sharedLayout} className="flex h-12 w-12 items-center justify-center bg-blue-500" style={{
                  borderRadius: 16
                }}>
                      <motion.span layoutId="miniapp-symbol" transition={MOTION_PRESETS.sharedLayout} className="text-3xl select-none">
                        🚀
                      </motion.span>
                    </motion.div>
                    <span className="font-bold text-white">My Miniapp</span>
                    <button onClick={() => setState('idle')} className="ml-auto rounded bg-white/20 px-3 py-1 text-white" data-testid="btn-close">
                      关闭
                    </button>
                  </div>
                  <div className="flex-1 p-4 text-white">Miniapp 内容区域</div>
                </motion.div>}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white">
              状态: <span data-testid="status">{state}</span>
            </div>
          </div>
        </LayoutGroup>
      </MiniappVisualProvider>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const c = within(canvasElement);
    await new Promise(r => setTimeout(r, 200));
    await step('初始 idle', async () => {
      expect(c.getByTestId('status').textContent).toBe('idle');
      expect(c.getByTestId('icon')).toBeInTheDocument();
    });
    await step('点击启动', async () => {
      await userEvent.click(c.getByTestId('icon'));
      await new Promise(r => setTimeout(r, 600));
      expect(c.getByTestId('status').textContent).toBe('window');
      expect(c.getByTestId('window')).toBeInTheDocument();
    });
    await step('点击关闭', async () => {
      await userEvent.click(c.getByTestId('btn-close'));
      await new Promise(r => setTimeout(r, 600));
      expect(c.getByTestId('status').textContent).toBe('idle');
      expect(c.getByTestId('icon')).toBeInTheDocument();
    });
  }
}`,...r.parameters?.docs?.source},description:{story:"直接路径：icon -> window",...r.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: function SplashPathStory() {
    const [state, setState] = useState<'idle' | 'splash' | 'window'>('idle');
    const goSplash = () => {
      setState('splash');
      setTimeout(() => setState('window'), 900);
    };
    return <MiniappVisualProvider override={{
      motion: {
        timeScale: MOTION_DEBUG_TIME_SCALE
      }
    }}>
        <LayoutGroup>
          <div className="relative h-screen overflow-hidden bg-zinc-900 font-sans">
            {/* idle icon */}
            <AnimatePresence mode="popLayout">
              {state === 'idle' && <motion.div key="idle" layoutId="splash-container" transition={MOTION_PRESETS.sharedLayout} className="absolute top-8 left-8 z-10 bg-orange-500" style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              overflow: 'hidden'
            }} onClick={goSplash} data-testid="icon">
                  <motion.div layoutId="splash-icon" transition={MOTION_PRESETS.sharedLayout} className="flex h-full w-full items-center justify-center" style={{
                borderRadius: 16
              }}>
                    <motion.span layoutId="splash-symbol" transition={MOTION_PRESETS.sharedLayout} className="text-2xl select-none">
                      🎯
                    </motion.span>
                  </motion.div>
                </motion.div>}
            </AnimatePresence>

            {/* splash 背景 */}
            <AnimatePresence>
              {state === 'splash' && <motion.div key="splash-bg" className="absolute inset-0 bg-gradient-to-b from-orange-400 to-amber-500" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={MOTION_PRESETS.uiFast} data-testid="splash-bg" />}
            </AnimatePresence>

            {/* splash icon 居中 */}
            <AnimatePresence mode="popLayout">
              {state === 'splash' && <motion.div key="splash" layoutId="splash-container" transition={MOTION_PRESETS.sharedLayout} className="absolute top-1/2 left-1/2 z-20 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-orange-600 shadow-xl" style={{
              borderRadius: 24,
              overflow: 'hidden'
            }} data-testid="splash-icon">
                  <motion.div layoutId="splash-icon" transition={MOTION_PRESETS.sharedLayout} className="flex h-full w-full items-center justify-center" style={{
                borderRadius: 24
              }}>
                    <motion.span layoutId="splash-symbol" transition={MOTION_PRESETS.sharedLayout} className="text-4xl select-none">
                      🎯
                    </motion.span>
                  </motion.div>
                </motion.div>}
            </AnimatePresence>

            {/* window */}
            <AnimatePresence mode="popLayout">
              {state === 'window' && <motion.div key="window" layoutId="splash-container" transition={MOTION_PRESETS.sharedLayout} className="absolute inset-4 z-30 flex flex-col bg-white" style={{
              borderRadius: 24,
              overflow: 'hidden'
            }} initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} data-testid="window">
                  <div className="flex items-center gap-3 bg-orange-500 p-4">
                    <motion.div layoutId="splash-icon" transition={MOTION_PRESETS.sharedLayout} className="flex h-10 w-10 items-center justify-center bg-orange-600" style={{
                  borderRadius: 12
                }}>
                      <motion.span layoutId="splash-symbol" transition={MOTION_PRESETS.sharedLayout} className="text-lg select-none">
                        🎯
                      </motion.span>
                    </motion.div>
                    <span className="font-bold text-white">Splash Miniapp</span>
                    <button onClick={() => setState('idle')} className="ml-auto rounded bg-white/20 px-3 py-1 text-white" data-testid="btn-close">
                      关闭
                    </button>
                  </div>
                  <div className="flex-1 p-4">
                    <p className="text-gray-800">App 内容区域</p>
                  </div>
                </motion.div>}
            </AnimatePresence>

            <div className="absolute bottom-4 left-4 rounded bg-black/50 px-2 py-1 text-sm text-white">
              状态: <span data-testid="status">{state}</span>
            </div>
          </div>
        </LayoutGroup>
      </MiniappVisualProvider>;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const c = within(canvasElement);
    await new Promise(r => setTimeout(r, 200));
    await step('初始 idle', async () => {
      expect(c.getByTestId('status').textContent).toBe('idle');
      expect(c.getByTestId('icon')).toBeInTheDocument();
    });
    await step('点击进入 splash', async () => {
      await userEvent.click(c.getByTestId('icon'));
      await new Promise(r => setTimeout(r, 500));
      expect(c.getByTestId('status').textContent).toBe('splash');
      expect(c.getByTestId('splash-icon')).toBeInTheDocument();
    });
    await step('自动进入 window', async () => {
      await new Promise(r => setTimeout(r, 900));
      expect(c.getByTestId('status').textContent).toBe('window');
      expect(c.getByTestId('window')).toBeInTheDocument();
    });
    await step('关闭返回 idle', async () => {
      await userEvent.click(c.getByTestId('btn-close'));
      await new Promise(r => setTimeout(r, 500));
      expect(c.getByTestId('status').textContent).toBe('idle');
    });
  }
}`,...c.parameters?.docs?.source},description:{story:"Splash 路径：icon -> splash(icon+bg) -> window",...c.parameters?.docs?.description}}};const F=["DirectPath","SplashPath"];export{r as DirectPath,c as SplashPath,F as __namedExportsOrder,U as default};
