/* global React, PB, APP */
// AI PDLC Playbook — Home: the spine is the navigation.

const PBHome = (function () {
  const { useNav, A, routes, Canon, EditorNote, PracticeHead, AddLink, Endorsed, Seal, ArrowR } = APP;

  function activityEndorsed(aid) {
    const ucs = PB.ucByActivity(aid);
    return ucs.some((u) => u.endorsed || u.techniques.some((tid) => (PB.technique(tid) || {}).endorsed));
  }

  function SpineBoard() {
    const { go } = useNav();
    return (
      <div className="spine spine-board">
        <div className="spine-rail"></div>
        {PB.PHASES.map((p) => (
          <div key={p.id} className={'phase-col pc-' + p.id} style={{ '--phase': p.hue }}>
            <div className="phase-node">
              <span className="phase-dot"></span>
              <span className="phase-num">PHASE {p.n}</span>
            </div>
            <div className="phase-head-link" onClick={() => go(routes.phase(p.id))}>
              <div className="phase-name">{p.name}</div>
            </div>
            <div className="phase-tag">{p.tagline}</div>
            <div className="activity-list">
              {p.activities.map((a) => {
                const n = PB.ucByActivity(a.id).length;
                const end = activityEndorsed(a.id);
                return (
                  <div key={a.id} className={'activity-row' + (n === 0 ? ' empty' : '')} onClick={() => go(routes.activity(a.id))}>
                    <span className="a-name row" style={{ gap: 7 }}>
                      {end && <span className="endorse-dot" title="Has PDLC-endorsed practice"></span>}
                      {a.name}
                    </span>
                    <span className="a-count">{n || '—'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function FeatCard({ uc, big }) {
    const { go } = useNav();
    const ph = PB.phase(uc.placement.phase);
    return (
      <div className={'feat-card p-' + uc.placement.phase} style={{ '--phase': ph.hue, minHeight: big ? 250 : 180 }} onClick={() => go(routes.usecase(uc.id))}>
        <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
          <span className="tag lc" style={{ '--phase': ph.hue }}>{ph.name} · {PB.activity(uc.placement.activity).name}</span>
          {uc.endorsed && <Endorsed />}
        </div>
        <div className="f-title" style={{ fontSize: big ? 25 : 18 }}>{uc.title}</div>
        {big && <div className="f-quote">{uc.solution}</div>}
        <div className="spacer"></div>
        {uc.metric && <div className="f-metric"><span className="fl">{uc.metric.label}</span><span className="fv" style={{ fontSize: big ? 22 : 18 }}>{uc.metric.value}</span></div>}
      </div>
    );
  }

  function Home() {
    const { go } = useNav();
    const feat = PB.featured();
    return (
      <div className="fade-in">
        <div className="wrap-wide">
          <div className="home-hero">
            <div className="kicker-mono" style={{ marginBottom: 14 }}>An AI in Product initiative</div>
            <div className="pb-h1">Where in the work does AI actually help?</div>
            <p className="pb-lede" style={{ marginTop: 16, fontSize: 17 }}>
              A shared playbook for AI-augmented product craft, organized along the lifecycle every product moves through.
              The protocol is thin and official; the practice is rich and growing. Start at a phase.
            </p>
          </div>
          <SpineBoard />
          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 10 }}>
            <AddLink kind="use case">+ Submit a use case</AddLink>
          </div>

          <div className="section-gap">
            <PracticeHead title="Featured this month" count={feat.length}>
              <span className="kicker-mono">Curated by the editor</span>
            </PracticeHead>
            <div className="feat-row">
              <FeatCard uc={feat[0]} big />
              {feat.slice(1, 3).map((u) => <FeatCard key={u.id} uc={u} />)}
            </div>
          </div>

          <div className="section-gap">
            <div className="practice-head">
              <div className="ph-left">
                <div className="voice-label" style={{ color: 'var(--ink-3)' }}><span className="vmark" style={{ background: 'var(--accent)' }}></span> Cut across the lifecycle</div>
                <h3>Browse by technique</h3>
              </div>
              <A to={routes.techniques()} className="kicker-mono" style={{ cursor: 'pointer' }}>All techniques →</A>
            </div>
            <div className="tech-board">
              {PB.TECHNIQUES.map((t) => (
                <A key={t.id} to={routes.technique(t.id)} className={'tech-chip' + (t.endorsed ? ' endorsed-chip' : '')}>
                  {t.endorsed ? <Seal size={12} /> : <span className="hash">#</span>}
                  {t.name}
                  <span className="c">{PB.techCount(t.id)}</span>
                </A>
              ))}
            </div>
            <p className="kicker-mono" style={{ marginTop: 14, color: 'var(--ink-4)', textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>
              Techniques are emergent tags for now — they'll cluster into a richer structure once patterns settle.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return { Home };
})();

window.PBHome = PBHome;
