import{j as e,r as o}from"./iframe-DhRzs3QD.js";import{C as d,g as b}from"./chain-selector-BFb32VbA.js";import{f as i,w as y,e as x}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./input-BBaEUsJ1.js";import"./useRenderElement-zf-aeRvE.js";import"./useField--D6jc3pk.js";import"./useBaseUiId-D6oAr_Cg.js";import"./index-DlV_KyJ_.js";import"./index-C_bRl42U.js";import"./checkbox-pF4mVk7r.js";import"./createReactComponent-h8x-Q1Cj.js";import"./IconCheck-C2OGQcJ1.js";import"./useTranslation-C9JGIhWl.js";import"./index-CAdZSkRa.js";import"./IconSearch-wJ9ElBuR.js";import"./IconChevronDown-rBotlNom.js";import"./IconChevronRight-D06oFVam.js";const s=[{id:"bfmeta",version:"1.0",chainKind:"bioforest",name:"BFMeta",symbol:"BFM",decimals:8,enabled:!0,source:"default"},{id:"ccchain",version:"1.0",chainKind:"bioforest",name:"CCChain",symbol:"CCC",decimals:8,enabled:!0,source:"default"},{id:"pmchain",version:"1.0",chainKind:"bioforest",name:"PMChain",symbol:"PMC",decimals:8,enabled:!0,source:"default"},{id:"ethereum",version:"1.0",chainKind:"evm",name:"Ethereum",symbol:"ETH",decimals:18,enabled:!0,source:"default"},{id:"polygon",version:"1.0",chainKind:"evm",name:"Polygon",symbol:"MATIC",decimals:18,enabled:!0,source:"default"},{id:"bitcoin",version:"1.0",chainKind:"bitcoin",name:"Bitcoin",symbol:"BTC",decimals:8,enabled:!0,source:"default"},{id:"tron",version:"1.0",chainKind:"bitcoin",name:"Tron",symbol:"TRX",decimals:6,enabled:!0,source:"default"}],R={title:"Onboarding/ChainSelector",component:d,parameters:{layout:"centered"},tags:["autodocs"]},C={args:{chains:s,selectedChains:["bfmeta","ccchain","pmchain"],favoriteChains:["ccchain"],onSelectionChange:i(),onFavoriteChange:i(),"data-testid":"chain-selector"},play:({canvasElement:t})=>{const a=y(t);x(a.getByTestId("chain-selector-search")).toBeInTheDocument(),x(a.getByTestId("chain-selector-group-bioforest")).toBeInTheDocument(),x(a.getByTestId("chain-selector-chain-bfmeta")).toBeInTheDocument()}},l={name:"Interactive Selection",render:()=>{const[t,a]=o.useState(b(s)),[n,c]=o.useState(["ccchain"]);return e.jsxs("div",{className:"w-96 space-y-4",children:[e.jsx(d,{chains:s,selectedChains:t,favoriteChains:n,onSelectionChange:a,onFavoriteChange:c,"data-testid":"chain-selector"}),e.jsxs("div",{className:"text-sm text-muted-foreground",children:["Selected: ",t.length," chains"]})]})}},h={name:"Default: Bioforest Selected",render:()=>{const t=b(s),a=s.filter(c=>c.chainKind==="bioforest"),n=a.every(c=>t.includes(c.id));return e.jsxs("div",{className:"w-96 space-y-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"font-bold",children:"Default Selection Test"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Bioforest chains should be selected by default"})]}),e.jsx(d,{chains:s,selectedChains:t,onSelectionChange:()=>{},"data-testid":"chain-selector"}),e.jsx("div",{className:`text-center p-3 rounded-lg ${n?"bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":"bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`,children:n?`✓ All ${a.length} Bioforest chains selected by default`:"✗ Not all Bioforest chains selected!"})]})}},m={name:"Search Filtering",render:()=>{const[t,a]=o.useState([]);return e.jsxs("div",{className:"w-96 space-y-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"font-bold",children:"Search Test"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:'Try searching "ETH" or "BF"'})]}),e.jsx(d,{chains:s,selectedChains:t,onSelectionChange:a,"data-testid":"chain-selector"})]})}},u={name:"Boundary: Empty Chains",args:{chains:[],selectedChains:[],onSelectionChange:i(),"data-testid":"chain-selector"}},p={name:"Without Search",args:{chains:s,selectedChains:["bfmeta"],onSelectionChange:i(),showSearch:!1,"data-testid":"chain-selector"}},g={name:"All Chains Selected",args:{chains:s,selectedChains:s.map(t=>t.id),onSelectionChange:i(),"data-testid":"chain-selector"}},f={name:"With Favorites",render:()=>{const[t,a]=o.useState(["ethereum","bitcoin"]),[n,c]=o.useState(["ethereum","bitcoin"]);return e.jsxs("div",{className:"w-96 space-y-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"font-bold",children:"Favorites Test"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Favorited chains appear first in their group"})]}),e.jsx(d,{chains:s,selectedChains:t,favoriteChains:n,onSelectionChange:a,onFavoriteChange:c,"data-testid":"chain-selector"}),e.jsxs("div",{className:"text-sm text-muted-foreground text-center",children:["Favorites: ",n.join(", ")||"None"]})]})}},v={name:"Theme: Dark Mode",parameters:{backgrounds:{default:"dark"}},decorators:[t=>e.jsx("div",{className:"dark bg-background p-8 rounded-lg w-96",children:e.jsx(t,{})})],args:{chains:s,selectedChains:["bfmeta","ccchain","pmchain"],favoriteChains:["ccchain"],onSelectionChange:i(),onFavoriteChange:i(),"data-testid":"chain-selector"}},S={name:"Group Selection",render:()=>{const[t,a]=o.useState([]),n=s.filter(r=>r.chainKind==="bioforest").length,c=s.filter(r=>r.chainKind==="evm").length;return e.jsxs("div",{className:"w-96 space-y-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"font-bold",children:"Group Selection Test"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Click group checkbox to select/deselect all chains in group"})]}),e.jsx(d,{chains:s,selectedChains:t,onSelectionChange:a,"data-testid":"chain-selector"}),e.jsxs("div",{className:"text-sm space-y-1",children:[e.jsxs("div",{children:["Bioforest: ",s.filter(r=>r.chainKind==="bioforest"&&t.includes(r.id)).length,"/",n]}),e.jsxs("div",{children:["EVM: ",s.filter(r=>r.chainKind==="evm"&&t.includes(r.id)).length,"/",c]}),e.jsxs("div",{children:["Total Selected: ",t.length,"/",s.length]})]})]})}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    chains,
    selectedChains: ['bfmeta', 'ccchain', 'pmchain'],
    favoriteChains: ['ccchain'],
    onSelectionChange: fn(),
    onFavoriteChange: fn(),
    'data-testid': 'chain-selector'
  },
  play: ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByTestId('chain-selector-search')).toBeInTheDocument();
    expect(canvas.getByTestId('chain-selector-group-bioforest')).toBeInTheDocument();
    expect(canvas.getByTestId('chain-selector-chain-bfmeta')).toBeInTheDocument();
  }
}`,...C.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'Interactive Selection',
  render: () => {
    const [selected, setSelected] = useState<string[]>(getDefaultSelectedChains(chains));
    const [favorites, setFavorites] = useState<string[]>(['ccchain']);
    return <div className="w-96 space-y-4">
        <ChainSelector chains={chains} selectedChains={selected} favoriteChains={favorites} onSelectionChange={setSelected} onFavoriteChange={setFavorites} data-testid="chain-selector" />
        <div className="text-sm text-muted-foreground">
          Selected: {selected.length} chains
        </div>
      </div>;
  }
}`,...l.parameters?.docs?.source},description:{story:"交互式示例：展示完整的选择流程",...l.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  name: 'Default: Bioforest Selected',
  render: () => {
    const defaultSelected = getDefaultSelectedChains(chains);
    const bioforestChains = chains.filter(c => c.chainKind === 'bioforest');
    const allBioforestSelected = bioforestChains.every(c => defaultSelected.includes(c.id));
    return <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Default Selection Test</h3>
          <p className="text-sm text-muted-foreground">
            Bioforest chains should be selected by default
          </p>
        </div>

        <ChainSelector chains={chains} selectedChains={defaultSelected} onSelectionChange={() => {}} data-testid="chain-selector" />

        <div className={\`text-center p-3 rounded-lg \${allBioforestSelected ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}\`}>
          {allBioforestSelected ? \`✓ All \${bioforestChains.length} Bioforest chains selected by default\` : '✗ Not all Bioforest chains selected!'}
        </div>
      </div>;
  }
}`,...h.parameters?.docs?.source},description:{story:"默认选择测试：验证默认选择生物链林",...h.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: 'Search Filtering',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    return <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Search Test</h3>
          <p className="text-sm text-muted-foreground">
            Try searching "ETH" or "BF"
          </p>
        </div>

        <ChainSelector chains={chains} selectedChains={selected} onSelectionChange={setSelected} data-testid="chain-selector" />
      </div>;
  }
}`,...m.parameters?.docs?.source},description:{story:"搜索功能测试",...m.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Boundary: Empty Chains',
  args: {
    chains: [],
    selectedChains: [],
    onSelectionChange: fn(),
    'data-testid': 'chain-selector'
  }
}`,...u.parameters?.docs?.source},description:{story:"空列表边界测试",...u.parameters?.docs?.description}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Without Search',
  args: {
    chains,
    selectedChains: ['bfmeta'],
    onSelectionChange: fn(),
    showSearch: false,
    'data-testid': 'chain-selector'
  }
}`,...p.parameters?.docs?.source},description:{story:"无搜索框",...p.parameters?.docs?.description}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'All Chains Selected',
  args: {
    chains,
    selectedChains: chains.map(c => c.id),
    onSelectionChange: fn(),
    'data-testid': 'chain-selector'
  }
}`,...g.parameters?.docs?.source},description:{story:"全选状态",...g.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  name: 'With Favorites',
  render: () => {
    const [selected, setSelected] = useState<string[]>(['ethereum', 'bitcoin']);
    const [favorites, setFavorites] = useState<string[]>(['ethereum', 'bitcoin']);
    return <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Favorites Test</h3>
          <p className="text-sm text-muted-foreground">
            Favorited chains appear first in their group
          </p>
        </div>

        <ChainSelector chains={chains} selectedChains={selected} favoriteChains={favorites} onSelectionChange={setSelected} onFavoriteChange={setFavorites} data-testid="chain-selector" />

        <div className="text-sm text-muted-foreground text-center">
          Favorites: {favorites.join(', ') || 'None'}
        </div>
      </div>;
  }
}`,...f.parameters?.docs?.source},description:{story:"收藏功能测试",...f.parameters?.docs?.description}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  name: 'Theme: Dark Mode',
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  },
  decorators: [Story => <div className="dark bg-background p-8 rounded-lg w-96">
        <Story />
      </div>],
  args: {
    chains,
    selectedChains: ['bfmeta', 'ccchain', 'pmchain'],
    favoriteChains: ['ccchain'],
    onSelectionChange: fn(),
    onFavoriteChange: fn(),
    'data-testid': 'chain-selector'
  }
}`,...v.parameters?.docs?.source},description:{story:"暗色主题测试",...v.parameters?.docs?.description}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Group Selection',
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    const bioforestCount = chains.filter(c => c.chainKind === 'bioforest').length;
    const evmCount = chains.filter(c => c.chainKind === 'evm').length;
    return <div className="w-96 space-y-4">
        <div className="text-center">
          <h3 className="font-bold">Group Selection Test</h3>
          <p className="text-sm text-muted-foreground">
            Click group checkbox to select/deselect all chains in group
          </p>
        </div>

        <ChainSelector chains={chains} selectedChains={selected} onSelectionChange={setSelected} data-testid="chain-selector" />

        <div className="text-sm space-y-1">
          <div>Bioforest: {chains.filter(c => c.chainKind === 'bioforest' && selected.includes(c.id)).length}/{bioforestCount}</div>
          <div>EVM: {chains.filter(c => c.chainKind === 'evm' && selected.includes(c.id)).length}/{evmCount}</div>
          <div>Total Selected: {selected.length}/{chains.length}</div>
        </div>
      </div>;
  }
}`,...S.parameters?.docs?.source},description:{story:"组批量选择测试",...S.parameters?.docs?.description}}};const V=["Default","Interactive","DefaultSelectionBioforest","SearchFilter","EmptyChains","NoSearch","AllSelected","WithFavorites","ThemeDark","GroupSelection"];export{g as AllSelected,C as Default,h as DefaultSelectionBioforest,u as EmptyChains,S as GroupSelection,l as Interactive,p as NoSearch,m as SearchFilter,v as ThemeDark,f as WithFavorites,V as __namedExportsOrder,R as default};
