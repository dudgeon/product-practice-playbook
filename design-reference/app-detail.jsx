/* global React, PB, APP, PBPhase */
// AI PDLC Playbook — leaf detail pages: use case + technique pages + techniques index.

const PBDetail = (function () {
  const { useNav, A, routes, AddLink, Endorsed, Seal, ArrowR, TechTag, Author, UseCaseCard } = APP;
  const Crumbs = PBPhase.Crumbs;

  // ---------- USE CASE ----------
  // Goal (problem) → Approach (solution prose + optional prompt + optional links) → Impact.
  function UseCasePage({ id }) {
    const u = PB.usecase(id);
    if (!u) return null;
    const p = PB.phase(u.placement.phase);
    const act = PB.activity(u.placement.activity);
    return (
      <div className="wrap-narrow fade-in" style={{ '--phase': p.hue, maxWidth: 1080 }}>
        <Crumbs items={[
          { label: 'Lifecycle', to: routes.home() },
          { label: p.name, to: routes.phase(p.id), cls: 'phase', style: { color: p.hue } },
          { label: act.name, to: routes.activity(act.id) },
        ]} />
        <div className="leaf" style={{ marginTop: 8 }}>
          <div className="leaf-main pcs" style={{ '--phase': p.hue }}>
            <div className="leaf-meta">
              <A to={routes.phase(p.id)} className="tag lc" style={{ '--phase': p.hue }}>{p.name} · {act.name}</A>
              {u.techniques.map((t) => <TechTag key={t} id={t} />)}
              {u.endorsed && <Endorsed />}
            </div>
            <div className="leaf-title">{u.title}</div>

            <section><h3><span className="ix">01</span> Goal · the problem</h3><p>{u.problem}</p></section>

            <section>
              <h3><span className="ix">02</span> Approach · the how</h3>
              <p>{u.solution}</p>
              {u.prompt && (
                <>
                  <div className="approach-sub">From the instructions</div>
                  <div className="code-snip">{u.prompt}</div>
                </>
              )}
              {u.links && u.links.length > 0 && (
                <div className="link-list">
                  {u.links.map((l) => (
                    <a key={l.url} className="link-row" href={'https://' + l.url} target="_blank" rel="noreferrer" onClick={(e) => e.preventDefault()}>
                      <span className="lr-ico">↗</span>
                      <span className="lr-label">{l.label}</span>
                      <span className="lr-url">{l.url}</span>
                    </a>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3><span className="ix">03</span> Impact <span className="note-pill" style={{ marginLeft: 6 }}>optional</span></h3>
              <p>{u.impact}</p>
              {u.metric && <div className="metric-box"><span className="ml">{u.metric.label}</span><span className="mv">{u.metric.value}</span></div>}
            </section>
          </div>

          <aside className="leaf-side">
            {u.endorsed && (
              <div className="side-box" style={{ background: 'var(--seal-soft)', borderColor: 'var(--seal-line)' }}>
                <div className="row" style={{ gap: 9 }}><Seal size={18} /><strong style={{ fontSize: 13.5, color: 'var(--seal-2)' }}>PDLC-endorsed</strong></div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 8, lineHeight: 1.5 }}>A reference example the protocol recommends.</div>
              </div>
            )}
            <div className="side-box">
              <div className="sb-label">Techniques</div>
              <div className="wrap">{u.techniques.map((t) => <TechTag key={t} id={t} />)}</div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>The approach is aggregated on each technique page.</div>
            </div>
            <div className="side-box tinted">
              <div className="sb-label">Placed on the spine</div>
              <div className="row" style={{ gap: 9 }}>
                <span className="phase-dot" style={{ background: p.hue, width: 12, height: 12, boxShadow: 'none' }}></span>
                <span style={{ fontSize: 13.5 }}><A to={routes.phase(p.id)}><strong>{p.name}</strong></A> › <A to={routes.activity(act.id)}>{act.name}</A></span>
              </div>
            </div>
            <div className="side-box">
              <div className="sb-label">Tools</div>
              <div className="wrap">{u.tools.map((t) => <span key={t} className="tag">{t}</span>)}</div>
            </div>
            <div className="side-box">
              <div className="sb-label">Contributed by</div>
              <Author name={u.author} role="Submitting team" />
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // ---------- TECHNIQUE (tag) — aggregates the use cases tagged with it ----------
  function TechniquePage({ id }) {
    const t = PB.technique(id);
    if (!t) return null;
    const ucs = PB.ucByTechnique(id);
    const related = PB.TECHNIQUES.filter((x) => x.id !== id).slice(0, 6);
    const phases = new Set(ucs.map((u) => u.placement.phase));
    return (
      <div className="wrap-narrow fade-in">
        <Crumbs items={[
          { label: 'Techniques', to: routes.techniques() },
          { label: '#' + t.name, style: { color: 'var(--accent-2)' } },
        ]} />
        <div className="tech-hero">
          <div className="row" style={{ gap: 10 }}>
            <span className="th-tag">#{t.name}</span>
            {t.endorsed && <Endorsed lg />}
          </div>
          <div className="pb-h1" style={{ fontSize: 36 }}>{t.name}</div>
          <p className="pb-lede">{t.description} A horizontal technique — it shows up across the lifecycle wherever a use case applies it. Tag-based for now; related techniques will cluster into families once the patterns settle.</p>
          <div className="row" style={{ gap: 18, marginTop: 4 }}>
            <span className="kicker-mono" style={{ textTransform: 'none', letterSpacing: 0 }}>{ucs.length} use case{ucs.length === 1 ? '' : 's'}</span>
            <span className="kicker-mono" style={{ textTransform: 'none', letterSpacing: 0 }}>spans {phases.size} phase{phases.size === 1 ? '' : 's'}</span>
            <span style={{ flex: 1 }}></span>
            <AddLink kind="use case" label={t.name}>+ I used this — add your use case</AddLink>
          </div>
        </div>

        <div className="pb-rail-label">Use cases applying this technique</div>
        {ucs.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {ucs.map((u) => <UseCaseCard key={u.id} uc={u} />)}
          </div>
        ) : (
          <div className="side-box tinted" style={{ borderStyle: 'dashed', textAlign: 'center', padding: '34px 24px' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, color: 'var(--ink-2)', marginBottom: 6 }}>A technique on the board, no use case yet.</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 16 }}>This technique is documented, but nobody has attached a use case. If you’ve applied it, add your goal and approach.</div>
            <AddLink kind="use case" label={t.name}>+ Add the first use case</AddLink>
          </div>
        )}

        <div className="pb-rail-label" style={{ marginTop: 32 }}>Often appears with</div>
        <div className="tech-board">
          {related.map((x) => (
            <A key={x.id} to={routes.technique(x.id)} className={'tech-chip' + (x.endorsed ? ' endorsed-chip' : '')}>
              {x.endorsed ? <Seal size={12} /> : <span className="hash">#</span>}{x.name}<span className="c">{PB.techCount(x.id)}</span>
            </A>
          ))}
        </div>
      </div>
    );
  }

  // ---------- TECHNIQUES INDEX ----------
  function TechniquesIndex() {
    const endorsed = PB.TECHNIQUES.filter((t) => t.endorsed);
    return (
      <div className="wrap-narrow fade-in">
        <div className="home-hero" style={{ padding: '40px 0 18px' }}>
          <div className="kicker-mono" style={{ marginBottom: 12 }}>The horizontal axis</div>
          <div className="pb-h1" style={{ fontSize: 40 }}>Techniques</div>
          <p className="pb-lede" style={{ marginTop: 14 }}>The cross-cutting tags that gather related approaches across the lifecycle. Each page aggregates the use cases that apply it. {endorsed.length} are PDLC-endorsed; the rest are emergent tags that will cluster into families later.</p>
        </div>
        <div className="act-index">
          {PB.TECHNIQUES.map((t) => {
            const n = PB.ucByTechnique(t.id).length;
            return (
              <A key={t.id} to={routes.technique(t.id)} className="act-item">
                <span className="ai-n">{t.endorsed ? <Seal size={14} /> : <span style={{ color: 'var(--ink-4)' }}>#</span>}</span>
                <div>
                  <div className="row" style={{ gap: 9 }}><span className="ai-name">{t.name}</span>{t.endorsed && <Endorsed />}</div>
                  <div className="ai-canon">{t.description}</div>
                </div>
                <div className="ai-meta"><span className="ai-count">{n ? `${n} use case${n === 1 ? '' : 's'}` : 'No use cases yet'}</span><span className="arrow"><ArrowR /></span></div>
              </A>
            );
          })}
        </div>
      </div>
    );
  }

  return { UseCasePage, TechniquePage, TechniquesIndex };
})();

window.PBDetail = PBDetail;
