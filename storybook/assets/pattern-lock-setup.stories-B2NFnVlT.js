import{j as e,r as m}from"./iframe-g2b0m8DI.js";import{P as d}from"./pattern-lock-setup-KD25Fgbv.js";import{f as l,w as p,e as u}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./pattern-lock-DQcepsy9.js";import"./useTranslation-Cu2h0njW.js";import"./index-D3aA_s7S.js";import"./icon-circle-BPhKNUJn.js";import"./gradient-button-Bxl7tD7d.js";import"./index-nmRTiCJZ.js";import"./index-B_jtOnfb.js";import"./createReactComponent-Cuq699P7.js";import"./IconShieldCheck-u41z_njd.js";import"./IconChevronRight-DnbWrSD5.js";const F={title:"Security/PatternLockSetup",component:d,parameters:{layout:"centered"},tags:["autodocs"]},c={args:{onComplete:l(),minPoints:4},play:({canvasElement:t})=>{const o=p(t);u(o.getByTestId("pattern-lock-set-grid")).toBeInTheDocument()}},s={name:"Full Setup Flow",render:()=>{const[t,o]=m.useState(null);return t?e.jsxs("div",{className:"w-80 text-center space-y-4",children:[e.jsx("div",{className:"text-6xl text-green-500",children:"✓"}),e.jsx("h3",{className:"font-bold text-lg",children:"Pattern Set Successfully"}),e.jsxs("p",{className:"text-sm text-muted-foreground",children:["Pattern Key: ",e.jsx("code",{className:"bg-muted px-2 py-1 rounded",children:t})]}),e.jsx("button",{onClick:()=>o(null),className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg",children:"Try Again"})]}):e.jsx("div",{className:"w-80",children:e.jsx(d,{onComplete:o,minPoints:4})})}},n={name:"Minimum 2 Points",args:{onComplete:l(),minPoints:2}},r={name:"Minimum 6 Points",args:{onComplete:l(),minPoints:6}},i={name:"Theme: Dark Mode",parameters:{backgrounds:{default:"dark"}},decorators:[t=>e.jsx("div",{className:"dark bg-background p-8 rounded-lg w-80",children:e.jsx(t,{})})],args:{onComplete:l(),minPoints:4}},a={name:"Security: Pattern Requirements",render:()=>e.jsxs("div",{className:"w-96 space-y-6",children:[e.jsx("div",{className:"text-center",children:e.jsx("h3",{className:"font-bold text-lg",children:"Pattern Lock Security"})}),e.jsxs("div",{className:"space-y-4 text-sm",children:[e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-2",children:"✓ Security Features"}),e.jsxs("ul",{className:"list-disc list-inside space-y-1 text-muted-foreground",children:[e.jsx("li",{children:"Minimum 4 points required by default"}),e.jsx("li",{children:"Order matters: [0,1,2,5] ≠ [5,2,1,0]"}),e.jsx("li",{children:"No duplicate points allowed"}),e.jsx("li",{children:"Must confirm pattern twice"})]})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-semibold mb-2",children:"Pattern Complexity"}),e.jsxs("ul",{className:"list-disc list-inside space-y-1 text-muted-foreground",children:[e.jsx("li",{children:"4 points: 7,152 combinations"}),e.jsx("li",{children:"5 points: 56,520 combinations"}),e.jsx("li",{children:"6 points: 361,152 combinations"}),e.jsx("li",{children:"9 points: 985,824 combinations"})]})]})]}),e.jsx("div",{className:"pt-4",children:e.jsx(d,{onComplete:t=>alert(`Pattern: ${t}`),minPoints:4})})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source},description:{story:"完整流程演示",...s.parameters?.docs?.description}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Minimum 2 Points',
  args: {
    onComplete: fn(),
    minPoints: 2
  }
}`,...n.parameters?.docs?.source},description:{story:"最小点数为 2",...n.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'Minimum 6 Points',
  args: {
    onComplete: fn(),
    minPoints: 6
  }
}`,...r.parameters?.docs?.source},description:{story:"最小点数为 6",...r.parameters?.docs?.description}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source},description:{story:"暗色主题",...i.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...a.parameters?.docs?.source},description:{story:"安全测试说明",...a.parameters?.docs?.description}}};const T=["Default","FullFlow","MinPoints2","MinPoints6","ThemeDark","SecurityNotes"];export{c as Default,s as FullFlow,n as MinPoints2,r as MinPoints6,a as SecurityNotes,i as ThemeDark,T as __namedExportsOrder,F as default};
