/* global React, PB, APP */
// AI PDLC Playbook — About pages: the PDLC, the editor, the initiative.

const PBAbout = (function () {
  const { A, routes, Endorsed, Seal } = APP;

  function AboutNav({ which }) {
    const items = [['pdlc', 'The PDLC'], ['editor', 'The editor'], ['initiative', 'AI in Product']];
    return (
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        {items.map(([k, label]) => (
          <A key={k} to={routes.about(k)} className={'tag' + (k === which ? '' : '')} style={k === which ? { background: 'var(--ink)', color: '#fff', borderColor: 'var(--ink)' } : { cursor: 'pointer' }}>{label}</A>
        ))}
      </div>
    );
  }

  function AboutPage({ id }) {
    const which = ['pdlc', 'editor', 'initiative'].includes(id) ? id : 'pdlc';
    const a = PB.ABOUT[which];
    return (
      <div className="wrap-narrow fade-in">
        <div className="crumbs"><A to={routes.home()}>Lifecycle</A><span className="sep">›</span><span>About</span></div>
        <AboutNav which={which} />
        <div className="about-hero">
          {which === 'pdlc' && <div className="row" style={{ gap: 8, marginBottom: 14 }}><Seal size={16} /><span className="kicker-mono" style={{ color: 'var(--seal-2)' }}>The protocol</span></div>}
          <h1>{a.title}</h1>
          <p className="lede">{a.lede}</p>
          {a.draft && <div style={{ marginTop: 16 }}><span className="draft-note">✎ {a.draft}</span></div>}
        </div>

        {which === 'editor' && (
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 28, alignItems: 'start', margin: '8px 0 12px' }}>
            <div className="placeholder-img" style={{ height: 160 }}>editor portrait</div>
            <div className="about-body" style={{ padding: 0 }}>
              {a.body.map(([h, p]) => <section key={h}><h2>{h}</h2><p>{p}</p></section>)}
            </div>
          </div>
        )}

        {which !== 'editor' && (
          <div className="about-body">
            {a.body.map(([h, p]) => <section key={h}><h2>{h}</h2><p>{p}</p></section>)}
          </div>
        )}

        {which === 'pdlc' && (
          <div className="section-gap" style={{ marginTop: 24 }}>
            <div className="pb-rail-label">The endorsement seal</div>
            <div className="row" style={{ gap: 12, alignItems: 'center' }}>
              <Endorsed lg />
              <span style={{ fontSize: 14, color: 'var(--ink-2)' }}>marks practice that has been promoted into the protocol's recommendations.</span>
            </div>
          </div>
        )}

        <div className="divider"></div>
        <div className="row" style={{ gap: 16, flexWrap: 'wrap' }}>
          <span className="kicker-mono">Keep reading:</span>
          {['pdlc', 'editor', 'initiative'].filter((k) => k !== which).map((k) => (
            <A key={k} to={routes.about(k)} className="inline-link">{PB.ABOUT[k].title} →</A>
          ))}
        </div>
      </div>
    );
  }

  return { AboutPage };
})();

window.PBAbout = PBAbout;
