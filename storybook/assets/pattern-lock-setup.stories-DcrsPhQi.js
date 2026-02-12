import{j as e,r as d}from"./iframe-Cbnwk2tm.js";import{P as m}from"./pattern-lock-setup-BWv1B5Q6.js";import{f as l,w as p,e as u}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./pattern-lock-BcqTiGPu.js";import"./useTranslation-FkKTO-Qo.js";import"./index-CSVYnQSj.js";import"./LoadingSpinner-B6msqE3E.js";import"./NumberFlow-client-48rw3j0J-BXrIYALF.js";import"./amount-display-DzFoyipt.js";import"./animated-number-B0_xBULY.js";import"./time-display-BLd9rMoZ.js";import"./service-status-alert-BYX0jeVi.js";import"./web-ViucSx7j.js";import"./createReactComponent-twPddvdz.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-WXMNjFTg.js";import"./IconX-C3bYldSy.js";import"./IconAlertTriangle-DklA-0bo.js";import"./IconLock-k0xbgjgC.js";import"./IconShieldCheck-BvCX_5aD.js";import"./IconChevronRight-C6FFBj-T.js";import"./IconRefresh-BkK1pn_P.js";const A={title:"Security/PatternLockSetup",component:m,parameters:{layout:"centered"},tags:["autodocs"]},c={args:{onComplete:l(),minPoints:4},play:({canvasElement:t})=>{const a=p(t);u(a.getByTestId("pattern-lock-set-grid")).toBeInTheDocument()}},s={name:"Full Setup Flow",render:()=>{const[t,a]=d.useState(null);return t?e.jsxs("div",{className:"w-80 text-center space-y-4",children:[e.jsx("div",{className:"text-6xl text-green-500",children:"✓"}),e.jsx("h3",{className:"font-bold text-lg",children:"Pattern Set Successfully"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Pattern Key: ",e.jsx("code",{className:"bg-muted px-2 py-1 rounded",children:t})]}),e.jsx("button",{onClick:()=>a(null),className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg",children:"Try Again"})]}):e.jsx("div",{className:"w-80",children:e.jsx(m,{onComplete:a,minPoints:4})})}},r={name:"Minimum 2 Points",args:{onComplete:l(),minPoints:2}},n={name:"Minimum 6 Points",args:{onComplete:l(),minPoints:6}},i={name:"Theme: Dark Mode",parameters:{backgrounds:{default:"dark"}},decorators:[t=>e.jsx("div",{className:"dark bg-background p-8 rounded-lg w-80",children:e.jsx(t,{})})],args:{onComplete:l(),minPoints:4}},o={name:"Security: Pattern Requirements",render:()=>e.jsxs("div",{className:"w-96 space-y-6",children:[e.jsx("div",{className:"text-center",children:e.jsx("h3",{className:"font-bold text-lg",children:"Pattern Lock Security"})}),e.jsxs("div",{className:"space-y-4 text-sm",children:[e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-2",children:"✓ Security Features"}),e.jsxs("ul",{className:"list-disc list-inside space-y-1 text-muted-foreground",children:[e.jsx("li",{children:"Minimum 4 points required by default"}),e.jsx("li",{children:"Order matters: [0,1,2,5] ≠ [5,2,1,0]"}),e.jsx("li",{children:"No duplicate points allowed"}),e.jsx("li",{children:"Must confirm pattern twice"})]})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Pattern Complexity"}),e.jsxs("ul",{className:"list-disc list-inside space-y-1 text-muted-foreground",children:[e.jsx("li",{children:"4 points: 7,152 combinations"}),e.jsx("li",{children:"5 points: 56,520 combinations"}),e.jsx("li",{children:"6 points: 361,152 combinations"}),e.jsx("li",{children:"9 points: 985,824 combinations"})]})]})]}),e.jsx("div",{className:"pt-4",children:e.jsx(m,{onComplete:t=>alert(`Pattern: ${t}`),minPoints:4})})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    onComplete: fn(),
    minPoints: 4
  },
  play: ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('pattern-lock-set-grid')).toBeInTheDocument();
  }
}`,...c.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  name: 'Full Setup Flow',
  render: () => {
    const [result, setResult] = useState<string | null>(null);
    if (result) {
      return <div className="w-80 text-center space-y-4">
          <div className="text-6xl text-green-500">✓</div>
          <h3 className="font-bold text-lg">Pattern Set Successfully</h3>
          <p className="text-sm text-muted-foreground">
            Pattern Key: <code className="bg-muted px-2 py-1 rounded">{result}</code>
          </p>
          <button onClick={() => setResult(null)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Try Again
          </button>
        </div>;
    }
    return <div className="w-80">
        <PatternLockSetup onComplete={setResult} minPoints={4} />
      </div>;
  }
}`,...s.parameters?.docs?.source},description:{story:"完整流程演示",...s.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'Minimum 2 Points',
  args: {
    onComplete: fn(),
    minPoints: 2
  }
}`,...r.parameters?.docs?.source},description:{story:"最小点数为 2",...r.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Minimum 6 Points',
  args: {
    onComplete: fn(),
    minPoints: 6
  }
}`,...n.parameters?.docs?.source},description:{story:"最小点数为 6",...n.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  name: 'Theme: Dark Mode',
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  },
  decorators: [Story => <div className="dark bg-background p-8 rounded-lg w-80">
        <Story />
      </div>],
  args: {
    onComplete: fn(),
    minPoints: 4
  }
}`,...i.parameters?.docs?.source},description:{story:"暗色主题",...i.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: 'Security: Pattern Requirements',
  render: () => {
    return <div className="w-96 space-y-6">
        <div className="text-center">
          <h3 className="font-bold text-lg">Pattern Lock Security</h3>
        </div>
        
        <div className="space-y-4 text-sm">
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">✓ Security Features</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Minimum 4 points required by default</li>
              <li>Order matters: [0,1,2,5] ≠ [5,2,1,0]</li>
              <li>No duplicate points allowed</li>
              <li>Must confirm pattern twice</li>
            </ul>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">Pattern Complexity</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>4 points: 7,152 combinations</li>
              <li>5 points: 56,520 combinations</li>
              <li>6 points: 361,152 combinations</li>
              <li>9 points: 985,824 combinations</li>
            </ul>
          </div>
        </div>

        <div className="pt-4">
          <PatternLockSetup onComplete={key => alert(\`Pattern: \${key}\`)} minPoints={4} />
        </div>
      </div>;
  }
}`,...o.parameters?.docs?.source},description:{story:"安全测试说明",...o.parameters?.docs?.description}}};const K=["Default","FullFlow","MinPoints2","MinPoints6","ThemeDark","SecurityNotes"];export{c as Default,s as FullFlow,r as MinPoints2,n as MinPoints6,o as SecurityNotes,i as ThemeDark,K as __namedExportsOrder,A as default};
