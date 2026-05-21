export default function App() {
  const products = [
    { brand: 'MK Electric', name: 'Logic Plus 13A Double Switched Socket', category: 'Wiring Devices', code: 'K2747WHI', price: '£4.22' },
    { brand: 'Cooper Lighting', name: 'Emergency LED Bulkhead', category: 'Emergency Lighting', code: 'ELBLED3', price: '£18.95' },
    { brand: 'Cables Generic', name: 'Tri-rated Cable 50mm Blue', category: 'Cable', code: 'TRI50BLU', price: '£2.80/m' },
    { brand: 'Polypipe Ventilation', name: 'Bathroom Extract Fan 100mm', category: 'Ventilation', code: 'PV100EF', price: '£22.50' }
  ];

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', background: '#f4f7fb', minHeight: '100vh', padding: 24 }}>
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ background: '#0f172a', color: 'white', borderRadius: 24, padding: 40 }}>
          <h1 style={{ fontSize: 44, margin: 0 }}>AI Electrical Product Finder</h1>
          <p style={{ fontSize: 18, opacity: 0.9 }}>Search electrical products, find alternatives and compare trade suppliers.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <input id="search" placeholder="Try: MK socket, emergency lighting, tri-rated cable" style={{ flex: 1, padding: 16, borderRadius: 12, border: 0, fontSize: 16 }} />
            <button onClick={() => alert('Search demo active. Full AI search is the next upgrade.')} style={{ padding: '16px 24px', borderRadius: 12, border: 0, fontWeight: 700, cursor: 'pointer' }}>Search</button>
          </div>
        </div>

        <h2 style={{ marginTop: 32 }}>Featured product matches</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {products.map((p) => (
            <article key={p.code} style={{ background: 'white', borderRadius: 18, padding: 20, boxShadow: '0 10px 25px rgba(15,23,42,0.08)' }}>
              <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700 }}>{p.brand}</div>
              <h3>{p.name}</h3>
              <p>{p.category}</p>
              <p><strong>Code:</strong> {p.code}</p>
              <p><strong>Trade price:</strong> {p.price}</p>
              <button style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', cursor: 'pointer' }}>Find alternatives</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
