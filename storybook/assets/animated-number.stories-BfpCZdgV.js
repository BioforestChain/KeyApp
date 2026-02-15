import{r as p,j as e}from"./iframe-QVsCtZB2.js";import{A as n,a as N}from"./animated-number-CCKqWxky.js";import"./preload-helper-PPVm8Dsz.js";import"./NumberFlow-client-48rw3j0J-Bc_o6jBA.js";import"./utils-4perknFd.js";import"./amount-display-ficMOKCB.js";const k={title:"Common/AnimatedNumber",component:n,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{value:{control:{type:"number"},description:"The number value to display"},decimals:{control:{type:"number",min:0,max:18},description:"Decimal places to show"},loading:{control:"boolean",description:"Show loading state"},locale:{control:"text",description:"Formatting locale"}}},v={args:{value:10015.12345678,decimals:8,loading:!1}},x={args:{value:0,loading:!0}},g={args:{value:12345e-8,decimals:8}},b={args:{value:123456789012345e-8,decimals:8}},h={args:{value:1e4,decimals:8}},i={render:()=>{const[a,s]=p.useState(10015),o=()=>{s(Math.random()*1e5)},r=()=>{s(l=>l+1e3)},t=()=>{s(l=>Math.max(0,l-1e3))};return e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsx("div",{className:"text-3xl font-bold",children:e.jsx(n,{value:a,decimals:8})}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{onClick:t,className:"rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600",children:"- 1000"}),e.jsx("button",{onClick:o,className:"rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600",children:"Random"}),e.jsx("button",{onClick:r,className:"rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600",children:"+ 1000"})]})]})}},d={render:()=>{const[a,s]=p.useState(!0),[o,r]=p.useState(0);p.useEffect(()=>{const l=setTimeout(()=>{s(!1),r(10015.12345678)},2e3);return()=>clearTimeout(l)},[]);const t=()=>{s(!0),r(0),setTimeout(()=>{s(!1),r(Math.random()*1e5)},2e3)};return e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsxs("div",{className:"text-2xl",children:["Balance: ",e.jsx(n,{value:o,loading:a,decimals:8})]}),e.jsx("button",{onClick:t,className:"rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600",children:"Reload"})]})}},c={render:()=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{children:["From string: ",e.jsx(N,{value:"10015.12345678",decimals:8})]}),e.jsxs("div",{children:["From number: ",e.jsx(N,{value:10015.12345678,decimals:8})]})]})},m={render:()=>{const[a,s]=p.useState([1e3,5e3,1e4,5e4]),o=()=>{s(a.map(()=>Math.random()*1e5))};return e.jsxs("div",{className:"flex flex-col items-center gap-4",children:[e.jsx("div",{className:"grid grid-cols-2 gap-4",children:a.map((r,t)=>e.jsxs("div",{className:"rounded border p-4 text-center",children:[e.jsxs("div",{className:"text-muted-foreground text-sm",children:["Token ",t+1]}),e.jsx("div",{className:"text-xl font-bold",children:e.jsx(n,{value:r,decimals:4})})]},t))}),e.jsx("button",{onClick:o,className:"rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600",children:"Randomize All"})]})}},u={render:()=>{const a=10015.12345678;return e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{children:["0 decimals: ",e.jsx(n,{value:a,decimals:0})]}),e.jsxs("div",{children:["2 decimals: ",e.jsx(n,{value:a,decimals:2})]}),e.jsxs("div",{children:["4 decimals: ",e.jsx(n,{value:a,decimals:4})]}),e.jsxs("div",{children:["8 decimals (default): ",e.jsx(n,{value:a,decimals:8})]})]})}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    value: 10015.12345678,
    decimals: 8,
    loading: false
  }
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0,
    loading: true
  }
}`,...x.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    value: 0.00012345,
    decimals: 8
  }
}`,...g.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    value: 1234567.89012345,
    decimals: 8
  }
}`,...b.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    value: 10000,
    decimals: 8
  }
}`,...h.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState(10015);
    const randomize = () => {
      setValue(Math.random() * 100000);
    };
    const increment = () => {
      setValue(prev => prev + 1000);
    };
    const decrement = () => {
      setValue(prev => Math.max(0, prev - 1000));
    };
    return <div className="flex flex-col items-center gap-4">
        <div className="text-3xl font-bold">
          <AnimatedNumber value={value} decimals={8} />
        </div>
        <div className="flex gap-2">
          <button onClick={decrement} className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            - 1000
          </button>
          <button onClick={randomize} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
            Random
          </button>
          <button onClick={increment} className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
            + 1000
          </button>
        </div>
      </div>;
  }
}`,...i.parameters?.docs?.source},description:{story:"Interactive demo showing the animation in action",...i.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [loading, setLoading] = useState(true);
    const [value, setValue] = useState(0);
    useEffect(() => {
      const timer = setTimeout(() => {
        setLoading(false);
        setValue(10015.12345678);
      }, 2000);
      return () => clearTimeout(timer);
    }, []);
    const reload = () => {
      setLoading(true);
      setValue(0);
      setTimeout(() => {
        setLoading(false);
        setValue(Math.random() * 100000);
      }, 2000);
    };
    return <div className="flex flex-col items-center gap-4">
        <div className="text-2xl">
          Balance: <AnimatedNumber value={value} loading={loading} decimals={8} />
        </div>
        <button onClick={reload} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Reload
        </button>
      </div>;
  }
}`,...d.parameters?.docs?.source},description:{story:"Simulates loading data from an API",...d.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    return <div className="flex flex-col gap-2">
        <div>
          From string: <AnimatedAmount value="10015.12345678" decimals={8} />
        </div>
        <div>
          From number: <AnimatedAmount value={10015.12345678} decimals={8} />
        </div>
      </div>;
  }
}`,...c.parameters?.docs?.source},description:{story:"AnimatedAmount accepts string values",...c.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [values, setValues] = useState([1000, 5000, 10000, 50000]);
    const randomize = () => {
      setValues(values.map(() => Math.random() * 100000));
    };
    return <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-2 gap-4">
          {values.map((v, i) => <div key={i} className="rounded border p-4 text-center">
              <div className="text-muted-foreground text-sm">Token {i + 1}</div>
              <div className="text-xl font-bold">
                <AnimatedNumber value={v} decimals={4} />
              </div>
            </div>)}
        </div>
        <button onClick={randomize} className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          Randomize All
        </button>
      </div>;
  }
}`,...m.parameters?.docs?.source},description:{story:"Multiple numbers animating together",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const value = 10015.12345678;
    return <div className="flex flex-col gap-2">
        <div>0 decimals: <AnimatedNumber value={value} decimals={0} /></div>
        <div>2 decimals: <AnimatedNumber value={value} decimals={2} /></div>
        <div>4 decimals: <AnimatedNumber value={value} decimals={4} /></div>
        <div>8 decimals (default): <AnimatedNumber value={value} decimals={8} /></div>
      </div>;
  }
}`,...u.parameters?.docs?.source},description:{story:"Different decimal configurations",...u.parameters?.docs?.description}}};const w=["Default","Loading","SmallNumber","LargeNumber","WholeNumber","Interactive","LoadingToLoaded","WithStringValue","MultipleNumbers","DecimalVariants"];export{u as DecimalVariants,v as Default,i as Interactive,b as LargeNumber,x as Loading,d as LoadingToLoaded,m as MultipleNumbers,g as SmallNumber,h as WholeNumber,c as WithStringValue,w as __namedExportsOrder,k as default};
