/* global React, PB */
// AI PDLC Playbook — app core: router, shared atoms, the three voices,
// endorsement seal, GitHub-issue submit flow, header/footer.

const { useState, useEffect, useMemo, useCallback, createContext, useContext } = React;

// ---------- Router ----------
function parseHash(h) {
  let s = (h || '').replace(/^#/, '');
  if (!s || s === '/') return { name: 'home' };
  const seg = s.split('/').filter(Boolean);
  const [a, b] = seg;
  switch (a) {
    case 'phase':return { name: 'phase', id: b };
    case 'activity':return { name: 'activity', id: b };
    case 'use-case':return { name: 'usecase', id: b };
    case 'resource':return { name: 'resource', id: b };
    case 'resources':return { name: 'resources' };
    case 'technique':return { name: 'technique', id: b };
    case 'techniques':return { name: 'techniques' };
    case 'about':return { name: 'about', id: b || 'pdlc' };
    default:return { name: 'home' };
  }
}
const NavCtx = createContext({ route: { name: 'home' }, go: () => {} });
function useNav() {return useContext(NavCtx);}
function NavProvider({ children }) {
  const [route, setRoute] = useState(() => parseHash(location.hash));
  useEffect(() => {
    const on = () => {setRoute(parseHash(location.hash));window.scrollTo(0, 0);};
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const go = useCallback((to) => {location.hash = to.startsWith('#') ? to : '#' + to;}, []);
  return <NavCtx.Provider value={{ route, go }}>{children}</NavCtx.Provider>;
}
function A({ to, children, className, ...rest }) {
  const { go } = useNav();
  return <a className={className} onClick={(e) => {e.preventDefault();go(to);}} {...rest}>{children}</a>;
}
const routes = {
  home: () => '#/',
  phase: (id) => `#/phase/${id}`,
  activity: (id) => `#/activity/${id}`,
  usecase: (id) => `#/use-case/${id}`,
  resource: (id) => `#/resource/${id}`,
  resources: () => '#/resources',
  technique: (id) => `#/technique/${id}`,
  techniques: () => '#/techniques',
  about: (id) => `#/about/${id}`
};

const initials = (name) => (name || '').split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();

// Inline **bold** → <strong>; returns an array of strings/elements.
function renderBold(str) {
  return String(str).split(/\*\*(.+?)\*\*/g).map((seg, i) => i % 2 ? <strong key={i}>{seg}</strong> : seg);
}

// ---------- Icons (simple shapes only) ----------
function Seal({ size = 13 }) {
  return (
    <svg className="seal-ico" width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" fill="currentColor" opacity="0.16" />
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}
function Gh({ size = 14, className = 'gh' }) {
  // generic "issue" glyph — ringed dot, not the branded mark
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.4" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="8" cy="8" r="2.1" fill="currentColor" />
    </svg>);

}
function ArrowR({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>;
}

// ---------- Endorsement ----------
function Endorsed({ lg }) {
  return <span className={'endorsed' + (lg ? ' lg' : '')}><Seal size={lg ? 14 : 13} /> PDLC-endorsed</span>;
}

// ---------- The three voices ----------
function Canon({ text, seal }) {
  const silent = !text;
  return (
    <div className="canon">
      <div className="voice-label"><span className="vmark"></span> What the PDLC says</div>
      {seal && <span className="canon-seal"><Seal size={12} /> Protocol</span>}
      <div className={'canon-text' + (silent ? ' silent' : '')}>
        {silent ? 'The protocol is silent here — this activity is yours to define.' : text}
      </div>
    </div>);

}
function EditorNote({ text, compact }) {
  if (!text) return null;
  const rich = typeof text === 'object';
  return (
    <div className={'editor-note' + (compact ? ' compact' : '') + (rich ? ' rich' : '')}>
      <span className="ava">ED</span>
      <div className="en-body">
        <div className="voice-label"><span className="vmark"></span> Editor's note</div>
        {rich ?
        <div className="en-rich" data-comment-anchor="c764e72dd2-div-103-9">
            {text.lead && <p className="en-lead">{text.lead}</p>}
            {text.body && <p className="en-para">{text.body}</p>}
            {text.points && text.points.length > 0 &&
            <ul className="en-points">
                {text.points.map((p, i) => <li key={i}>{renderBold(p)}</li>)}
              </ul>}
          </div> :

        <div className="en-text" data-comment-anchor="c764e72dd2-div-103-9">{text}</div>}
        {!compact && <div className="en-sig">— The Editor · AI in Product</div>}
      </div>
    </div>);

}
function PracticeHead({ title = 'In practice', count, children }) {
  return (
    <div className="practice-head">
      <div className="ph-left">
        <div className="voice-label"><span className="vmark"></span> Practice</div>
        <h3>{title}</h3>
        {count != null && <span className="count">{count}</span>}
      </div>
      {children}
    </div>);

}
// ---------- Submit (GitHub-issue) ----------
const SubmitCtx = createContext({ open: () => {} });
function useSubmit() {return useContext(SubmitCtx);}
function SubmitProvider({ children }) {
  const [scope, setScope] = useState(null); // {kind, label}
  const open = useCallback((s) => setScope(s || { kind: 'use case', label: null }), []);
  return (
    <SubmitCtx.Provider value={{ open }}>
      {children}
      {scope && <SubmitSheet scope={scope} onClose={() => setScope(null)} />}
    </SubmitCtx.Provider>);

}
function SubmitSheet({ scope, onClose }) {
  const title = scope.label ? `Add to “${scope.label}”` : `Submit a ${scope.kind}`;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="sh-head">
          <div>
            <h3>{title}</h3>
            <div className="sub">Contributions are GitHub issues — public, low-ceremony, easy to discuss before anything is merged.</div>
          </div>
          <button className="x" onClick={onClose}>×</button>
        </div>
        <div className="sh-body">
          <div className="gh-card">
            <Gh size={26} />
            <div>
              <div className="t">Open an issue in the playbook repo</div>
              <div className="d">Pick a template, fill in the fields below, and submit. The editor reviews, places it on the spine, and writes the editor's note.</div>
            </div>
          </div>
          <div className="issue-template">
            <span className="k"># {scope.kind === 'use case' ? 'New use case' : 'New ' + scope.kind}</span><br />
            <span className="k">Title:</span> …<br />
            {scope.kind === 'use case' ?
            <>
                <span className="k">Problem:</span> …<br />
                <span className="k">Solution:</span> …<br />
                <span className="k">Impact (optional):</span> …<br />
                <span className="k">Lifecycle placement:</span> {scope.label || 'phase › activity'}<br />
                <span className="k">Techniques / resources used:</span> …
              </> :

            <>
                <span className="k">What it is:</span> …<br />
                <span className="k">When to reach for it:</span> …<br />
                <span className="k">Techniques:</span> …
              </>
            }
          </div>
        </div>
        <div className="sh-foot">
          <span className="gh-pill"><Gh size={13} /> opens github.com</span>
          <span style={{ flex: 1 }}></span>
          <button className="btn ghost sm" onClick={onClose}>Cancel</button>
          <button className="btn accent sm" onClick={onClose}>Open a GitHub issue</button>
        </div>
      </div>
    </div>);

}
function AddLink({ label, kind = 'technique', children }) {
  const { open } = useSubmit();
  return (
    <button className="add-link" onClick={() => open({ kind, label })}>
      <Gh className="gh" size={13} /> {children || `+ Add a ${kind} to this section`}
    </button>);

}

// ---------- Tags / author ----------
function PlaceTag({ uc, withActivity }) {
  const ph = PB.phase(uc.placement.phase);
  const act = PB.activity(uc.placement.activity);
  return <A to={routes.phase(ph.id)} className="tag lc" style={{ '--phase': ph.hue }}>{ph.name}{withActivity && act ? ' · ' + act.name : ''}</A>;
}
function TechTag({ id }) {
  const t = PB.technique(id);
  if (!t) return null;
  return <A to={routes.technique(id)} className="tag tech">{t.name}</A>;
}
function Author({ name, role = 'Contributor' }) {
  return (
    <div className="author-line">
      <span className="av">{initials(name)}</span>
      <span className="stack"><span className="an">{name}</span><span className="ar">{role}</span></span>
    </div>);

}

// ---------- Cards ----------
function UseCaseCard({ uc, showProblem = true }) {
  const { go } = useNav();
  const ph = PB.phase(uc.placement.phase);
  return (
    <div className={'uc-card p-' + uc.placement.phase} style={{ '--phase': ph.hue }} onClick={() => go(routes.usecase(uc.id))}>
      <div className="place">
        <span className="swatch"></span>{ph.name} · {PB.activity(uc.placement.activity).name}
        {uc.endorsed && <><span style={{ flex: 1 }}></span><Endorsed /></>}
      </div>
      <div className="uc-title">{uc.title}</div>
      {showProblem && <div className="uc-problem">{uc.problem}</div>}
      <div className="uc-foot">
        {uc.techniques.slice(0, 2).map((t) => <span key={t} className="tag tech">{PB.technique(t).name}</span>)}
        <span className="spacer"></span>
        <span className="author">{uc.author}</span>
      </div>
    </div>);

}
function ResourceCard({ r }) {
  const { go } = useNav();
  const uses = PB.ucUsingResource(r.id).length;
  return (
    <div className="res-card" onClick={() => go(routes.resource(r.id))}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="r-type">{PB.RES_TYPES[r.type]}</div>
        {r.endorsed && <Endorsed />}
      </div>
      <div className="r-name">{r.name}</div>
      <div className="r-sum">{r.summary}</div>
      <div className="r-foot">Used in {uses} use case{uses === 1 ? '' : 's'} · {r.techniques.map((t) => PB.technique(t).name).join(', ')}</div>
    </div>);

}

// ---------- Header / Footer ----------
function Header() {
  const { route, go } = useNav();
  const { open } = useSubmit();
  const nav = [
  ['Lifecycle', routes.home(), route.name === 'home' || route.name === 'phase' || route.name === 'activity'],
  ['Techniques', routes.techniques(), route.name === 'techniques' || route.name === 'technique'],
  ['About', routes.about('pdlc'), route.name === 'about']];

  return (
    <div className="pb-head">
      <div className="pb-brand" onClick={() => go(routes.home())}>
        <span className="mark"></span><span>AI PDLC Playbook</span>
      </div>
      <nav className="pb-nav">
        {nav.map(([label, to, active]) =>
        <a key={label} className={active ? 'active' : ''} onClick={() => go(to)}>{label}</a>
        )}
      </nav>
      <div className="pb-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
        <span>Search the playbook</span>
      </div>
      <button className="pb-cta" onClick={() => open({ kind: 'use case' })}><Gh size={13} /> Submit a use case</button>
    </div>);

}
function Footer() {
  const { go } = useNav();
  return (
    <footer className="pb-foot">
      <div className="wrap-wide row">
        <span>AI PDLC Playbook · an AI in Product initiative · prototype</span>
        <span className="row" style={{ gap: 18 }}>
          <a onClick={() => go(routes.about('pdlc'))}>About the PDLC</a>
          <a onClick={() => go(routes.about('editor'))}>About the editor</a>
          <a onClick={() => go(routes.about('initiative'))}>About AI in Product</a>
        </span>
      </div>
    </footer>);

}

window.APP = {
  NavProvider, useNav, A, routes, initials,
  Seal, Gh, ArrowR, Endorsed,
  Canon, EditorNote, PracticeHead,
  SubmitProvider, useSubmit, AddLink,
  PlaceTag, TechTag, Author, UseCaseCard, ResourceCard,
  Header, Footer
};