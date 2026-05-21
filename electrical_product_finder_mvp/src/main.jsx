
import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Search, SlidersHorizontal, ShoppingCart, Zap, Database, GitCompare, KeyRound } from "lucide-react";
import products from "./data/products.sample.json";
import { searchProducts, findAlternatives, mockSupplierOffers, parseQuery } from "./lib/search";
import "./style.css";

function Stat({label,value}) {
  return <div className="stat"><div>{value}</div><span>{label}</span></div>
}

function ProductCard({product,onSelect,onQuote,selected}) {
  return <article className={`card ${selected ? "selected" : ""}`}>
    <div className="cardTop">
      <div>
        <p className="eyebrow">{product.brand || "Generic"}</p>
        <h3>{product.description || product.productType || product.product}</h3>
      </div>
      <button onClick={() => onQuote(product)} className="iconBtn"><ShoppingCart size={18}/></button>
    </div>
    <div className="meta">
      <span>Cat: {product.catalogueNumber || "—"}</span>
      <span>TSI/Item: {product.tsi || "—"}</span>
      <span>EAN: {product.ean || "—"}</span>
    </div>
    <p className="sub">{product.commodityMajor} · {product.commodityMinor}</p>
    <div className="chips">
      {product.productType && <span>{product.productType}</span>}
      {product.dimensions && <span>{product.dimensions}</span>}
      {product.finish && <span>{product.finish}</span>}
      {product.supplierName && <span>{product.supplierName}</span>}
    </div>
    <div className="cardBottom">
      <strong>{product.price ? `£${product.price}` : "POA"}</strong>
      <button onClick={() => onSelect(product)}>View match</button>
    </div>
  </article>
}

function App() {
  const [query,setQuery] = useState("black 50mm tri-rated cable");
  const [searchInput,setSearchInput] = useState("black 50mm tri-rated cable");
  const [filters,setFilters] = useState({brand:"",category:"",supplier:""});
  const [selected,setSelected] = useState(null);
  const [quote,setQuote] = useState([]);

  const brands = useMemo(()=>[...new Set(products.map(p=>p.brand).filter(Boolean))].sort().slice(0,80),[]);
  const categories = useMemo(()=>[...new Set(products.map(p=>p.commodityMajor).filter(Boolean))].sort(),[]);
  const suppliers = useMemo(()=>[...new Set(products.map(p=>p.supplierName).filter(Boolean))].sort(),[]);
  const parsed = useMemo(()=>parseQuery(query),[query]);
  const results = useMemo(()=>searchProducts(products, query, filters),[query,filters]);
  const active = selected || results[0];
  const alternatives = useMemo(()=>findAlternatives(products, active),[active]);
  const offers = useMemo(()=>active ? mockSupplierOffers(active) : [],[active]);

  function addQuote(p) {
    setQuote(prev => prev.find(x=>x.id===p.id) ? prev : [...prev,p]);
  }

  return <div>
    <header className="hero">
      <nav>
        <div className="logo"><Zap/> TradeFind AI</div>
        <div className="navPill"><Database size={16}/> Sample Luckins-style dataset connected</div>
      </nav>
      <section>
        <p className="eyebrow">AI Electrical Product Finder MVP</p>
        <h1>Find, match and compare electrical products in seconds.</h1>
        <p className="lead">Natural-language product search, alternatives, TSI/item matching, supplier comparison and quote building — ready for live Luckins/API credentials later.</p>
        <div className="searchBox">
          <Search/>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter") setQuery(searchInput)}} placeholder="Try: alternative to MK socket, 13A black socket, 50mm cable..." />
          <button onClick={()=>setQuery(searchInput)}>Search</button>
        </div>
        <div className="examples">
          {["black socket USB","tri-rated cable 50mm","compare emergency lighting","MK switch"].map(x=><button key={x} onClick={()=>{setSearchInput(x); setQuery(x)}}>{x}</button>)}
        </div>
      </section>
      <div className="stats">
        <Stat label="sample products" value={products.length.toLocaleString()} />
        <Stat label="results found" value={results.length} />
        <Stat label="intent" value={parsed.intent} />
      </div>
    </header>

    <main className="layout">
      <aside className="panel">
        <h2><SlidersHorizontal size={18}/> Filters</h2>
        <label>Brand<select value={filters.brand} onChange={e=>setFilters({...filters,brand:e.target.value})}><option value="">All brands</option>{brands.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Category<select value={filters.category} onChange={e=>setFilters({...filters,category:e.target.value})}><option value="">All categories</option>{categories.map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Supplier<select value={filters.supplier} onChange={e=>setFilters({...filters,supplier:e.target.value})}><option value="">All suppliers</option>{suppliers.map(x=><option key={x}>{x}</option>)}</select></label>
        <div className="aiBox">
          <h3><KeyRound size={16}/> Integration ready</h3>
          <p>Add your Luckins/OpenAI credentials in <code>.env</code>. The app already has placeholders for live API mode.</p>
        </div>
        <div className="quote">
          <h3>Quote basket ({quote.length})</h3>
          {quote.slice(0,5).map(p=><p key={p.id}>{p.description}</p>)}
          {quote.length === 0 && <p>No items added yet.</p>}
        </div>
      </aside>

      <section className="results">
        <div className="sectionHead"><h2>Best matches</h2><span>{results.length} products</span></div>
        <div className="grid">
          {results.slice(0,12).map(p=><ProductCard key={`${p.id}-${p.catalogueNumber}`} product={p} selected={active?.id===p.id} onSelect={setSelected} onQuote={addQuote}/>)}
        </div>
      </section>

      <aside className="panel detail">
        <h2><GitCompare size={18}/> Match detail</h2>
        {active ? <>
          <p className="eyebrow">{active.brand}</p>
          <h3>{active.description}</h3>
          <dl>
            <dt>Catalogue</dt><dd>{active.catalogueNumber || "—"}</dd>
            <dt>TSI/Item</dt><dd>{active.tsi || "—"}</dd>
            <dt>Commodity</dt><dd>{active.commodityMinor || "—"}</dd>
            <dt>Supplier</dt><dd>{active.supplierName || "—"}</dd>
          </dl>
          <h3>Supplier comparison</h3>
          {offers.map(o=><div className="offer" key={o.name}><strong>{o.name}</strong><span>£{o.price}</span><small>{o.stock ? `${o.stock} in stock` : "No stock"} · {o.leadTime}</small><em>{o.confidence}</em></div>)}
          <h3>Alternatives</h3>
          {alternatives.map(a=><button className="alt" key={a.id} onClick={()=>setSelected(a)}>{a.description}<span>{a.matchScore}% match</span></button>)}
        </> : <p>Search for a product to see details.</p>}
      </aside>
    </main>
  </div>
}

createRoot(document.getElementById("root")).render(<App />);
