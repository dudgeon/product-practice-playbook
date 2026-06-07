/* global React, PB, APP */
// AI PDLC Playbook — Phase page + Activity page.

const PBPhase = (function () {
  const { useNav, A, routes, Canon, EditorNote, PracticeHead, AddLink, Endorsed, Seal, ArrowR, UseCaseCard } = APP;

  function Crumbs({ items }) {
    return (
      <div className="crumbs">
        {items.map((it, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep">›</span>}
            {it.to ? <A to={it.to} className={it.cls}>{it.label}</A> : <span className={it.cls} style={it.style}>{it.label}</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }

  function PhasePage({ id }) {
    const { go } = useNav();
    const p = PB.phase(id);
    if (!p) return null;
    const idx = PB.PHASES.findIndex((x) => x.id === id);
    const next = PB.PHASES[idx + 1];
    const prev = PB.PHASES[idx - 1];
    const techs = PB.techniquesInPhase(id);
    return (
      <div className="wrap-narrow fade-in" style={{ '--phase': p.hue }}>
        <Crumbs items={[
          { label: 'Lifecycle', to: routes.home() },
          { label: `Phase ${p.n} · ${p.name}`, cls: 'phase', style: { color: p.hue } },
        ]} />

        <div className="phase-hero">
          <div className="ph-num">PHASE {p.n} OF 03</div>
          <div className="ph-title">
            <span className="ph-dot" style={{ background: p.hue }}></span>
            <h1 style={{ color: p.hue }}>{p.name}</h1>
          </div>
          <p className="pb-lede">{p.tagline}</p>
          <div className="phase-progress">
            {PB.PHASES.map((x) => <span key={x.id} className={'pp' + (x.id === id ? ' on' : '')} style={x.id === id ? { background: p.hue } : {}} onClick={() => go(routes.phase(x.id))}></span>)}
          </div>
        </div>

        <Canon text={p.canon} seal />
        <div style={{ height: 24 }}></div>
        <EditorNote text={p.editor} />

        <div className="divider"></div>

        <PracticeHead title={`Activities in ${p.name}`} count={p.activities.length}>
          <AddLink kind="use case" label={p.name}>+ Add to this phase</AddLink>
        </PracticeHead>
        <div className="act-index">
          {p.activities.map((a, i) => {
            const n = PB.ucByActivity(a.id).length;
            const endorsed = PB.ucByActivity(a.id).some((u) => u.endorsed || u.techniques.some((tid) => (PB.technique(tid) || {}).endorsed));
            return (
              <div key={a.id} className="act-item" onClick={() => go(routes.activity(a.id))}>
                <span className="ai-n">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <div className="row" style={{ gap: 9 }}>
                    <span className="ai-name">{a.name}</span>
                    {endorsed && <Endorsed />}
                  </div>
                  <div className={'ai-canon' + (a.canon ? '' : ' silent')}>{a.canon || 'The protocol is silent here.'}</div>
                </div>
                <div className="ai-meta">
                  <span className="ai-count">{n ? `${n} use case${n === 1 ? '' : 's'}` : 'No practice yet'}</span>
                  <span className="arrow"><ArrowR /></span>
                </div>
              </div>
            );
          })}
        </div>

        {techs.length > 0 && (
          <div className="section-gap">
            <div className="pb-rail-label">Techniques seen across {p.name}</div>
            <div className="tech-board">
              {techs.map((t) => (
                <A key={t.id} to={routes.technique(t.id)} className={'tech-chip' + (t.endorsed ? ' endorsed-chip' : '')}>
                  {t.endorsed ? <Seal size={12} /> : <span className="hash">#</span>}{t.name}<span className="c">{PB.techCount(t.id)}</span>
                </A>
              ))}
            </div>
          </div>
        )}

        <div className="divider"></div>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          {prev ? <A to={routes.phase(prev.id)} className="btn ghost sm">← {prev.name}</A> : <span></span>}
          {next ? <A to={routes.phase(next.id)} className="btn ghost sm">{next.name} →</A> : <span></span>}
        </div>
      </div>
    );
  }

  function ActivityPage({ id }) {
    const a = PB.activity(id);
    if (!a) return null;
    const p = a.phase;
    const ucs = PB.ucByActivity(id);
    const techs = PB.techniquesInActivity(id);
    const aIdx = p.activities.findIndex((x) => x.id === id);
    return (
      <div className="wrap-narrow fade-in" style={{ '--phase': p.hue }}>
        <Crumbs items={[
          { label: 'Lifecycle', to: routes.home() },
          { label: p.name, to: routes.phase(p.id), cls: 'phase', style: { color: p.hue } },
          { label: a.name, cls: '', style: { color: 'var(--ink-2)' } },
        ]} />

        <div className="phase-hero" style={{ paddingBottom: 18 }}>
          <div className="ph-num" style={{ color: p.hue }}>{p.name.toUpperCase()} · ACTIVITY {String(aIdx + 1).padStart(2, '0')}</div>
          <div className="ph-title" style={{ margin: '10px 0 12px' }}>
            <h1 style={{ fontSize: 38, color: 'var(--ink)' }}>{a.name}</h1>
          </div>
        </div>

        <Canon text={a.canon} seal={!!a.canon} />
        {a.editor && <><div style={{ height: 24 }}></div><EditorNote text={a.editor} compact /></>}

        <div className="divider"></div>

        <PracticeHead title="What teams are doing" count={ucs.length}>
          <AddLink kind="use case" label={`${p.name} · ${a.name}`}>+ Add a use case here</AddLink>
        </PracticeHead>

        {ucs.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {ucs.map((u) => <UseCaseCard key={u.id} uc={u} />)}
          </div>
        ) : (
          <div className="side-box tinted" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '34px 24px' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--ink-2)', marginBottom: 6 }}>No practice documented yet.</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 16 }}>This activity is on the spine, but the field hasn't filled it in. Be the first.</div>
            <AddLink kind="use case" label={`${p.name} · ${a.name}`}>+ Add the first use case</AddLink>
          </div>
        )}

        {techs.length > 0 && (
          <div className="section-gap">
            <div className="pb-rail-label">Techniques used here</div>
            <div className="tech-board">
              {techs.map((t) => (
                <A key={t.id} to={routes.technique(t.id)} className={'tech-chip' + (t.endorsed ? ' endorsed-chip' : '')}>
                  {t.endorsed ? <Seal size={12} /> : <span className="hash">#</span>}{t.name}<span className="c">{PB.techCount(t.id)}</span>
                </A>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return { PhasePage, ActivityPage, Crumbs };
})();

window.PBPhase = PBPhase;
