import{j as e,r as d}from"./iframe-CftqfirD.js";import{P as o,p as i,i as B}from"./pattern-lock-DCVKvHZ3.js";import{w as E,e as N}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-KzIqTB0x.js";import"./index-C6g0glMg.js";const z={title:"Security/PatternLock",component:o,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{minPoints:{control:{type:"range",min:2,max:9,step:1}},size:{control:{type:"range",min:3,max:5,step:1}}}},P={args:{minPoints:4,size:3,"data-testid":"pattern-lock"},play:({canvasElement:t})=>{const r=E(t).getAllByRole("checkbox");N(r).toHaveLength(9)}},k={render:()=>{const[t,a]=d.useState([]),[r,s]=d.useState(!1);return e.jsxs("div",{className:"space-y-4 w-80",children:[e.jsx(o,{value:t,onChange:a,onComplete:()=>{s(!0),setTimeout(()=>s(!1),1e3)},success:r&&t.length>=4}),e.jsxs("div",{className:"text-center text-sm text-muted-foreground",children:["Pattern: ",t.length>0?i(t):"None"]})]})}},j={args:{value:[0,1,2,5],error:!0,minPoints:4}},A={args:{value:[0,1,2,5,8],success:!0,minPoints:4}},C={args:{value:[0,4,8],disabled:!0,minPoints:4}},T={args:{minPoints:2}},w={args:{size:4,minPoints:6}},D={render:()=>{const[t,a]=d.useState("set"),[r,s]=d.useState([]),[n,c]=d.useState([]),[L,S]=d.useState(!1),M=l=>{l.length>=4&&(s(l),a("confirm"))},q=l=>{l.length>=4&&(i(l)===i(r)?(a("done"),S(!1)):(S(!0),c([]),setTimeout(()=>S(!1),1500)))},F=()=>{a("set"),s([]),c([]),S(!1)};return e.jsxs("div",{className:"space-y-4 w-80",children:[e.jsxs("h3",{className:"text-lg font-semibold text-center",children:[t==="set"&&"设置钱包锁",t==="confirm"&&"确认钱包锁",t==="done"&&"设置成功!"]}),t==="set"&&e.jsx(o,{value:r,onChange:s,onComplete:M,success:r.length>=4}),t==="confirm"&&e.jsx(o,{value:n,onChange:c,onComplete:q,error:L}),t==="done"&&e.jsxs("div",{className:"text-center space-y-4",children:[e.jsx("div",{className:"text-6xl",children:"✓"}),e.jsx("p",{className:"text-muted-foreground",children:"钱包锁已设置"}),e.jsx("button",{onClick:F,className:"px-4 py-2 bg-primary text-primary-foreground rounded-lg",children:"重新设置"})]})]})}},m={name:"Security: Different Order = Different Pattern",render:()=>{const t=[0,1,2,5],a=[5,2,1,0],r=i(t),s=i(a),n=r!==s;return e.jsxs("div",{className:"space-y-6 w-96",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"font-bold text-lg",children:"Security Test: Pattern Order Matters"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-2",children:"Same points, different order = Different patterns"})]}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm font-medium text-center",children:"Pattern 1: 0→1→2→5"}),e.jsx(o,{value:t,disabled:!0}),e.jsxs("p",{className:"text-xs text-center text-muted-foreground",children:["Key: ",r]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm font-medium text-center",children:"Pattern 2: 5→2→1→0"}),e.jsx(o,{value:a,disabled:!0}),e.jsxs("p",{className:"text-xs text-center text-muted-foreground",children:["Key: ",s]})]})]}),e.jsx("div",{className:`text-center p-3 rounded-lg ${n?"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`,children:n?"✓ PASS: Patterns are correctly different":"✗ FAIL: Patterns should be different!"})]})}},p={name:"Security: Pattern Uniqueness",render:()=>{const t=[{name:"L Shape",pattern:[0,3,6,7,8]},{name:"Z Shape",pattern:[0,1,2,4,6,7,8]},{name:"Square",pattern:[0,1,2,5,8,7,6,3]},{name:"Cross",pattern:[1,4,3,4,5,4,7]},{name:"Diagonal",pattern:[0,4,8]},{name:"Reverse Diagonal",pattern:[8,4,0]}],a=t.map(n=>i(n.pattern)),s=new Set(a).size===a.length;return e.jsxs("div",{className:"space-y-4 w-full max-w-2xl",children:[e.jsx("div",{className:"text-center",children:e.jsx("h3",{className:"font-bold text-lg",children:"Security Test: All Patterns Must Be Unique"})}),e.jsx("div",{className:"grid grid-cols-3 gap-3",children:t.map((n,c)=>e.jsxs("div",{className:"space-y-1 p-2 border rounded-lg",children:[e.jsx("p",{className:"text-xs font-medium text-center",children:n.name}),e.jsx("div",{className:"w-24 mx-auto",children:e.jsx(o,{value:n.pattern,disabled:!0,className:"scale-75 origin-top"})}),e.jsx("p",{className:"text-[10px] text-center text-muted-foreground font-mono",children:a[c]})]},c))}),e.jsx("div",{className:`text-center p-3 rounded-lg ${s?"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`,children:s?`✓ PASS: All ${a.length} patterns have unique keys`:"✗ FAIL: Found duplicate keys!"})]})}},u={name:"Security: Pattern Validation",render:()=>{const a=[{pattern:[0,1,2,5],expected:!0,desc:"Valid: 4 points"},{pattern:[0,1,2],expected:!1,desc:"Invalid: Only 3 points"},{pattern:[0,1,1,2],expected:!1,desc:"Invalid: Duplicate node"},{pattern:[0,1,9,2],expected:!1,desc:"Invalid: Out of range (9)"},{pattern:[0,1,2,3,4,5,6,7,8],expected:!0,desc:"Valid: All 9 points"},{pattern:[],expected:!1,desc:"Invalid: Empty pattern"}].map(s=>({...s,actual:B(s.pattern),pass:B(s.pattern)===s.expected})),r=a.every(s=>s.pass);return e.jsxs("div",{className:"space-y-4 w-full max-w-md",children:[e.jsx("h3",{className:"font-bold text-lg text-center",children:"Security Test: Pattern Validation"}),e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b",children:[e.jsx("th",{className:"text-left py-2",children:"Test Case"}),e.jsx("th",{className:"text-center",children:"Expected"}),e.jsx("th",{className:"text-center",children:"Actual"}),e.jsx("th",{className:"text-center",children:"Result"})]})}),e.jsx("tbody",{children:a.map((s,n)=>e.jsxs("tr",{className:"border-b",children:[e.jsx("td",{className:"py-2",children:s.desc}),e.jsx("td",{className:"text-center",children:s.expected?"✓":"✗"}),e.jsx("td",{className:"text-center",children:s.actual?"✓":"✗"}),e.jsx("td",{className:"text-center",children:s.pass?"✓":"✗"})]},n))})]}),e.jsx("div",{className:`text-center p-3 rounded-lg ${r?"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`,children:r?"✓ All validation tests passed":"✗ Some validation tests failed"})]})}},x={name:"Boundary: Minimum Points (4)",args:{value:[0,1,2,5],minPoints:4,success:!0}},g={name:"Boundary: Maximum Points (9)",args:{value:[0,1,2,5,8,7,6,3,4],minPoints:4,success:!0}},v={name:"Boundary: Below Minimum (3 of 4)",args:{value:[0,1,2],minPoints:4}},h={name:"Accessibility: Keyboard Navigation",render:()=>{const[t,a]=d.useState([]);return e.jsxs("div",{className:"space-y-4 w-80",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"font-bold",children:"Keyboard Navigation Test"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Use Tab to navigate, Space/Enter to select"})]}),e.jsx(o,{value:t,onChange:a,"data-testid":"keyboard-test"}),e.jsxs("div",{className:"text-center text-sm",children:["Selected: ",t.length>0?i(t):"None"]}),e.jsx("p",{className:"text-xs text-muted-foreground text-center",children:"Note: Only the last selected node can be deselected via keyboard"})]})},play:async({canvasElement:t})=>{const r=E(t).getAllByRole("checkbox");N(r).toHaveLength(9);for(const s of r)N(s).toHaveAttribute("aria-label")}},y={name:"Accessibility: Screen Reader Labels",args:{value:[0,4,8],"data-testid":"a11y-test"},play:async({canvasElement:t})=>{const a=E(t),r=a.getByRole("group");N(r).toHaveAttribute("aria-label");const n=a.getAllByRole("checkbox").filter(c=>c.checked);N(n).toHaveLength(3)}},f={name:"Theme: Dark Mode",parameters:{backgrounds:{default:"dark"}},decorators:[t=>e.jsx("div",{className:"dark bg-background p-8 rounded-lg",children:e.jsx(t,{})})],args:{value:[0,1,2,5,8],success:!0}},b={name:"Theme: Dark Mode Error",parameters:{backgrounds:{default:"dark"}},decorators:[t=>e.jsx("div",{className:"dark bg-background p-8 rounded-lg",children:e.jsx(t,{})})],args:{value:[0,1,2,5],error:!0}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    minPoints: 4,
    size: 3,
    'data-testid': 'pattern-lock'
  },
  play: ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const nodes = canvas.getAllByRole('checkbox');
    expect(nodes).toHaveLength(9);
  }
}`,...P.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [pattern, setPattern] = useState<number[]>([]);
    const [completed, setCompleted] = useState(false);
    return <div className="space-y-4 w-80">
        <PatternLock value={pattern} onChange={setPattern} onComplete={() => {
        setCompleted(true);
        setTimeout(() => setCompleted(false), 1000);
      }} success={completed && pattern.length >= 4} />
        <div className="text-center text-sm text-muted-foreground">
          Pattern: {pattern.length > 0 ? patternToString(pattern) : 'None'}
        </div>
      </div>;
  }
}`,...k.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    value: [0, 1, 2, 5],
    error: true,
    minPoints: 4
  }
}`,...j.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    value: [0, 1, 2, 5, 8],
    success: true,
    minPoints: 4
  }
}`,...A.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    value: [0, 4, 8],
    disabled: true,
    minPoints: 4
  }
}`,...C.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    minPoints: 2
  }
}`,...T.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    size: 4,
    minPoints: 6
  }
}`,...w.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [step, setStep] = useState<'set' | 'confirm' | 'done'>('set');
    const [firstPattern, setFirstPattern] = useState<number[]>([]);
    const [secondPattern, setSecondPattern] = useState<number[]>([]);
    const [error, setError] = useState(false);
    const handleFirstComplete = (pattern: number[]) => {
      if (pattern.length >= 4) {
        setFirstPattern(pattern);
        setStep('confirm');
      }
    };
    const handleSecondComplete = (pattern: number[]) => {
      if (pattern.length >= 4) {
        if (patternToString(pattern) === patternToString(firstPattern)) {
          setStep('done');
          setError(false);
        } else {
          setError(true);
          setSecondPattern([]);
          setTimeout(() => setError(false), 1500);
        }
      }
    };
    const reset = () => {
      setStep('set');
      setFirstPattern([]);
      setSecondPattern([]);
      setError(false);
    };
    return <div className="space-y-4 w-80">
        <h3 className="text-lg font-semibold text-center">
          {step === 'set' && '设置钱包锁'}
          {step === 'confirm' && '确认钱包锁'}
          {step === 'done' && '设置成功!'}
        </h3>
        
        {step === 'set' && <PatternLock value={firstPattern} onChange={setFirstPattern} onComplete={handleFirstComplete} success={firstPattern.length >= 4} />}
        
        {step === 'confirm' && <PatternLock value={secondPattern} onChange={setSecondPattern} onComplete={handleSecondComplete} error={error} />}
        
        {step === 'done' && <div className="text-center space-y-4">
            <div className="text-6xl">✓</div>
            <p className="text-muted-foreground">钱包锁已设置</p>
            <button onClick={reset} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              重新设置
            </button>
          </div>}
      </div>;
  }
}`,...D.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Security: Different Order = Different Pattern',
  render: () => {
    const pattern1 = [0, 1, 2, 5];
    const pattern2 = [5, 2, 1, 0];
    const str1 = patternToString(pattern1);
    const str2 = patternToString(pattern2);
    const areDifferent = str1 !== str2;
    return <div className="space-y-6 w-96">
        <div className="text-center">
          <h3 className="font-bold text-lg">Security Test: Pattern Order Matters</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Same points, different order = Different patterns
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Pattern 1: 0→1→2→5</p>
            <PatternLock value={pattern1} disabled />
            <p className="text-xs text-center text-muted-foreground">Key: {str1}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-center">Pattern 2: 5→2→1→0</p>
            <PatternLock value={pattern2} disabled />
            <p className="text-xs text-center text-muted-foreground">Key: {str2}</p>
          </div>
        </div>

        <div className={\`text-center p-3 rounded-lg \${areDifferent ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}\`}>
          {areDifferent ? '✓ PASS: Patterns are correctly different' : '✗ FAIL: Patterns should be different!'}
        </div>
      </div>;
  }
}`,...m.parameters?.docs?.source},description:{story:`安全测试：验证不同顺序的图案被正确区分
图案 [0,1,2,5] 和 [5,2,1,0] 虽然连接相同的点，但顺序不同，应该是不同的图案`,...m.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Security: Pattern Uniqueness',
  render: () => {
    const patterns = [{
      name: 'L Shape',
      pattern: [0, 3, 6, 7, 8]
    }, {
      name: 'Z Shape',
      pattern: [0, 1, 2, 4, 6, 7, 8]
    }, {
      name: 'Square',
      pattern: [0, 1, 2, 5, 8, 7, 6, 3]
    }, {
      name: 'Cross',
      pattern: [1, 4, 3, 4, 5, 4, 7]
    }, {
      name: 'Diagonal',
      pattern: [0, 4, 8]
    }, {
      name: 'Reverse Diagonal',
      pattern: [8, 4, 0]
    }];
    const keys = patterns.map(p => patternToString(p.pattern));
    const uniqueKeys = new Set(keys);
    const allUnique = uniqueKeys.size === keys.length;
    return <div className="space-y-4 w-full max-w-2xl">
        <div className="text-center">
          <h3 className="font-bold text-lg">Security Test: All Patterns Must Be Unique</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          {patterns.map((p, i) => <div key={i} className="space-y-1 p-2 border rounded-lg">
              <p className="text-xs font-medium text-center">{p.name}</p>
              <div className="w-24 mx-auto">
                <PatternLock value={p.pattern} disabled className="scale-75 origin-top" />
              </div>
              <p className="text-[10px] text-center text-muted-foreground font-mono">{keys[i]}</p>
            </div>)}
        </div>

        <div className={\`text-center p-3 rounded-lg \${allUnique ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}\`}>
          {allUnique ? \`✓ PASS: All \${keys.length} patterns have unique keys\` : \`✗ FAIL: Found duplicate keys!\`}
        </div>
      </div>;
  }
}`,...p.parameters?.docs?.source},description:{story:`安全测试：验证图案唯一性
展示多个不同的图案及其对应的密钥`,...p.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Security: Pattern Validation',
  render: () => {
    const testCases = [{
      pattern: [0, 1, 2, 5],
      expected: true,
      desc: 'Valid: 4 points'
    }, {
      pattern: [0, 1, 2],
      expected: false,
      desc: 'Invalid: Only 3 points'
    }, {
      pattern: [0, 1, 1, 2],
      expected: false,
      desc: 'Invalid: Duplicate node'
    }, {
      pattern: [0, 1, 9, 2],
      expected: false,
      desc: 'Invalid: Out of range (9)'
    }, {
      pattern: [0, 1, 2, 3, 4, 5, 6, 7, 8],
      expected: true,
      desc: 'Valid: All 9 points'
    }, {
      pattern: [],
      expected: false,
      desc: 'Invalid: Empty pattern'
    }];
    const results = testCases.map(tc => ({
      ...tc,
      actual: isValidPattern(tc.pattern),
      pass: isValidPattern(tc.pattern) === tc.expected
    }));
    const allPass = results.every(r => r.pass);
    return <div className="space-y-4 w-full max-w-md">
        <h3 className="font-bold text-lg text-center">Security Test: Pattern Validation</h3>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Test Case</th>
              <th className="text-center">Expected</th>
              <th className="text-center">Actual</th>
              <th className="text-center">Result</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => <tr key={i} className="border-b">
                <td className="py-2">{r.desc}</td>
                <td className="text-center">{r.expected ? '✓' : '✗'}</td>
                <td className="text-center">{r.actual ? '✓' : '✗'}</td>
                <td className="text-center">{r.pass ? '✓' : '✗'}</td>
              </tr>)}
          </tbody>
        </table>

        <div className={\`text-center p-3 rounded-lg \${allPass ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}\`}>
          {allPass ? '✓ All validation tests passed' : '✗ Some validation tests failed'}
        </div>
      </div>;
  }
}`,...u.parameters?.docs?.source},description:{story:"安全测试：验证 isValidPattern 函数",...u.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Boundary: Minimum Points (4)',
  args: {
    value: [0, 1, 2, 5],
    minPoints: 4,
    success: true
  }
}`,...x.parameters?.docs?.source},description:{story:"边界测试：最小有效图案 (正好 4 个点)",...x.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Boundary: Maximum Points (9)',
  args: {
    value: [0, 1, 2, 5, 8, 7, 6, 3, 4],
    minPoints: 4,
    success: true
  }
}`,...g.parameters?.docs?.source},description:{story:"边界测试：最大图案 (所有 9 个点)",...g.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Boundary: Below Minimum (3 of 4)',
  args: {
    value: [0, 1, 2],
    minPoints: 4
  }
}`,...v.parameters?.docs?.source},description:{story:"边界测试：少于最小点数",...v.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Accessibility: Keyboard Navigation',
  render: () => {
    const [pattern, setPattern] = useState<number[]>([]);
    return <div className="space-y-4 w-80">
        <div className="text-center">
          <h3 className="font-bold">Keyboard Navigation Test</h3>
          <p className="text-sm text-muted-foreground">
            Use Tab to navigate, Space/Enter to select
          </p>
        </div>
        
        <PatternLock value={pattern} onChange={setPattern} data-testid="keyboard-test" />
        
        <div className="text-center text-sm">
          Selected: {pattern.length > 0 ? patternToString(pattern) : 'None'}
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Note: Only the last selected node can be deselected via keyboard
        </p>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const nodes = canvas.getAllByRole('checkbox');

    // Verify all nodes are accessible
    expect(nodes).toHaveLength(9);

    // Each node should have an aria-label
    for (const node of nodes) {
      expect(node).toHaveAttribute('aria-label');
    }
  }
}`,...h.parameters?.docs?.source},description:{story:"可访问性：键盘导航测试",...h.parameters?.docs?.description}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  name: 'Accessibility: Screen Reader Labels',
  args: {
    value: [0, 4, 8],
    'data-testid': 'a11y-test'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Grid should have aria-label
    const grid = canvas.getByRole('group');
    expect(grid).toHaveAttribute('aria-label');

    // Selected nodes should have order info in label
    const nodes = canvas.getAllByRole('checkbox');
    const selectedNodes = nodes.filter(n => (n as HTMLInputElement).checked);
    expect(selectedNodes).toHaveLength(3);
  }
}`,...y.parameters?.docs?.source},description:{story:"可访问性：屏幕阅读器标签测试",...y.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'Theme: Dark Mode',
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  },
  decorators: [Story => <div className="dark bg-background p-8 rounded-lg">
        <Story />
      </div>],
  args: {
    value: [0, 1, 2, 5, 8],
    success: true
  }
}`,...f.parameters?.docs?.source},description:{story:"主题测试：暗色模式",...f.parameters?.docs?.description}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'Theme: Dark Mode Error',
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  },
  decorators: [Story => <div className="dark bg-background p-8 rounded-lg">
        <Story />
      </div>],
  args: {
    value: [0, 1, 2, 5],
    error: true
  }
}`,...b.parameters?.docs?.source},description:{story:"主题测试：错误状态在暗色模式",...b.parameters?.docs?.description}}};const $=["Default","Interactive","WithError","WithSuccess","Disabled","MinPoints2","Size4x4","SetAndConfirmFlow","SecurityDifferentOrder","SecurityPatternUniqueness","SecurityValidation","BoundaryMinPoints","BoundaryMaxPoints","BoundaryBelowMin","AccessibilityKeyboard","AccessibilityLabels","ThemeDark","ThemeDarkError"];export{h as AccessibilityKeyboard,y as AccessibilityLabels,v as BoundaryBelowMin,g as BoundaryMaxPoints,x as BoundaryMinPoints,P as Default,C as Disabled,k as Interactive,T as MinPoints2,m as SecurityDifferentOrder,p as SecurityPatternUniqueness,u as SecurityValidation,D as SetAndConfirmFlow,w as Size4x4,f as ThemeDark,b as ThemeDarkError,j as WithError,A as WithSuccess,$ as __namedExportsOrder,z as default};
