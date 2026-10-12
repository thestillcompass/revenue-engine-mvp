import Link from 'next/link'

export default function Home(){
  return <>
    <div className="container">
      <header className="topnav"><div className="brand"><span className="brandmark">R</span>Revenue Engine</div><div className="navlinks"><a href="#how">How it works</a><a href="#product">Product</a><Link className="btn secondary" href="/login">Log in</Link></div></header>
      <main className="hero"><div className="hero-grid">
        <div><div className="eyebrow">Conversational revenue infrastructure</div><h1>Find where leads leak. Build the engine that fixes it.</h1><p className="lead">Revenue Engine diagnoses your lead journey, recommends the smallest system you need, builds qualification logic, assembles the journey and measures what actually turns into revenue.</p><div className="hero-actions"><Link className="btn primary" href="/diagnostic">Run the free diagnostic</Link><Link className="btn secondary" href="/signup">Create free workspace</Link></div></div>
        <div className="card scorecard"><span className="pill">Example diagnosis</span><div className="score-ring"><div><strong>58</strong><small>/100</small></div></div><div className="mini-list"><div className="mini-row"><span>Primary leak</span><b>Qualification</b></div><div className="mini-row"><span>Secondary leak</span><b>Conversion</b></div><div className="mini-row"><span>Recommended engine</span><b>Qualified Consultation</b></div></div></div>
      </div></main>
      <section id="how" className="section"><div className="grid three"><div className="card feature"><strong>01 Diagnose</strong><p className="muted">Score acquisition, capture, qualification, conversion, nurture and measurement.</p></div><div className="card feature"><strong>02 Build</strong><p className="muted">Generate the right qualification and journey architecture instead of starting from a blank workflow.</p></div><div className="card feature"><strong>03 Optimize</strong><p className="muted">Measure qualified leads, bookings, attendance, wins and revenue—not vanity metrics.</p></div></div></section>
      <section id="product" className="section"><div className="card"><div className="eyebrow">Product-led path</div><h2>Start free. Upgrade only when the system earns it.</h2><p className="lead">Free diagnostic → personalized recommendation → Revenue Engine → assisted deployment → done-for-you → recurring Revenue Intelligence.</p></div></section>
      <footer className="footer">Revenue Engine MVP · Product brain first, integrations second.</footer>
    </div>
  </>
}
