// AI PDLC Playbook — content model + sample data.
//
// The spine is a fixed 3-phase product development lifecycle; each phase holds
// 5–8 "key activities". Three voices layer over the spine:
//   • CANON   — what the PDLC protocol officially says. Thin but authoritative.
//   • EDITOR  — the editor's expansion / point of view on the canon.
//   • PRACTICE— what teams are actually doing: use cases + resources.
// Some resources / techniques / use cases are PDLC-ENDORSED (a seal of approval).
// Horizontal techniques are emergent TAGS (no fixed taxonomy yet).

window.PB = (function () {
  // ---- The spine: 3 phases × key activities ----
  const PHASES = [
    {
      id: 'discover', n: '01', name: 'Discover', hue: '#2d6a6a',
      tagline: 'Understand the problem and decide what to build.',
      canon: 'No solution may proceed without a named customer, a written problem, and evidence the problem is worth solving.',
      editor: {
        lead: 'Discovery is where AI has changed the most, and the fastest — and where it\u2019s easiest to fool yourself.',
        body: 'The cost of synthesis has collapsed. Eighty interviews become six personas in an afternoon; a week of competitive reading becomes a morning. But the failure mode moved with the cost — the bottleneck is no longer gathering, it\u2019s trust.',
        points: [
          '**Make every model claim traceable to a source** — a transcript timecode, a quote, a link. Untraceable synthesis is worse than none.',
          '**Keep a human naming the problem.** Agents are fluent at restating solutions as problems; that\u2019s the one thing Discover can\u2019t outsource.',
          '**Treat speed as runway, not the finish line.** Faster discovery should buy more cycles, not fewer questions.',
        ],
      },
      activities: [
        { id: 'd-research', name: 'Customer research', canon: 'Talk to a named customer before writing a line of spec.', editor: 'The highest-leverage place to point an agent in the whole lifecycle.' },
        { id: 'd-framing', name: 'Problem framing', canon: 'State the problem as a problem, not as a disguised solution.' },
        { id: 'd-sensing', name: 'Market & competitive sensing', canon: null },
        { id: 'd-sizing', name: 'Opportunity sizing', canon: null },
        { id: 'd-specs', name: 'Requirements & specs', canon: 'Requirements trace to evidence. Open questions are listed, not hidden.', editor: 'Traceability footnotes are non-negotiable here.' },
        { id: 'd-prioritize', name: 'Prioritization', canon: null },
      ],
    },
    {
      id: 'build', n: '02', name: 'Build', hue: '#4a5a8a',
      tagline: 'Design, prototype, and ship the thing.',
      canon: 'Every step produces a reviewable artifact. Decisions are recorded with their rationale. Quality gates precede release.',
      editor: {
        lead: 'The protocol asks for reviewable artifacts and recorded decisions. Agents happen to be unreasonably good at exactly that.',
        body: 'Drafting the spec, decomposing the plan, reviewing the PR, writing the eval — these are the load-bearing chores of Build, and they\u2019re where teams see the most consistent leverage. The ones getting durable value share a few habits.',
        points: [
          '**The agent proposes; a human commits.** Keep agents non-destructive — comment, draft, queue — never auto-merge or auto-close.',
          '**Record the decision and the reason, not just the diff.** The rationale is the artifact future-you actually needs.',
          '**Gate quality before release.** A 90-second eval beats a post-incident postmortem every time.',
        ],
      },
      activities: [
        { id: 'b-design', name: 'Design & prototyping', canon: 'Show a working artifact, not a description of one.' },
        { id: 'b-eng', name: 'Engineering', canon: null },
        { id: 'b-review', name: 'Code review & QA', canon: 'A second reviewer sees every change before it ships.', editor: 'Calibrate the agent to comment, never to approve.' },
        { id: 'b-decisions', name: 'Technical decisions', canon: 'Record the decision and the reason. Future-you is the audience.' },
        { id: 'b-docs', name: 'Documentation', canon: null },
        { id: 'b-testing', name: 'Testing & evals', canon: 'Regressions are caught before release, not after.' },
      ],
    },
    {
      id: 'grow', n: '03', name: 'Grow', hue: '#3a7a4a',
      tagline: 'Launch, learn, and keep it running.',
      canon: 'Releases are measured and reversible. Operations have an owner. Findings return to Discover.',
      editor: {
        lead: 'Growth and operations are where the durable wins live, because the work recurs.',
        body: 'A triage skill that saves fifty hours a week compounds every week; a one-off discovery win doesn\u2019t. The risk here is the inverse of Discover\u2019s — not too little rigor, but too much trust in an unattended loop.',
        points: [
          '**Measure, and make it reversible.** Every rollout stage should be one you can undo.',
          '**Keep a human in the path for anything irreversible.** Unattended automation is fine for proposing, dangerous for deciding.',
          '**Close the loop back to Discover** — today\u2019s operational findings are next quarter\u2019s problems.',
        ],
      },
      activities: [
        { id: 'g-launch', name: 'Launch & GTM', canon: 'Roll out in stages. Every stage is reversible.' },
        { id: 'g-enable', name: 'Rollout & enablement', canon: 'Someone owns getting people to actually use it.' },
        { id: 'g-analytics', name: 'Analytics & experimentation', canon: null },
        { id: 'g-iterate', name: 'Iteration & optimization', canon: 'Findings return to Discover as new problems.' },
        { id: 'g-ops', name: 'Operations & toil', canon: 'Recurring work has an owner and a runbook.', editor: 'The compounding-returns activity. If you\u2019re new, start here.' },
        { id: 'g-support', name: 'Support & feedback loops', canon: null },
      ],
    },
  ];

  // ---- Horizontal techniques (the cross-cutting tags; one page each) ----
  const TECHNIQUES = [
    { id: 't-subagents', name: 'Subagents', endorsed: false, description: 'Spinning up scoped sub-agents that each own one job, then composing their output.' },
    { id: 't-prompt', name: 'Prompt engineering', endorsed: false, description: 'Shaping prompts, personas, and instructions to steer model behavior reliably.' },
    { id: 't-context', name: 'Context management', endorsed: false, description: 'Managing what the model can see — context windows, working directories, freshness.' },
    { id: 't-skills', name: 'Skills', endorsed: false, description: 'Packaging a repeatable capability as a reusable skill the agent can invoke.' },
    { id: 't-hooks', name: 'Hooks', endorsed: false, description: 'Triggering agent work automatically on an event — a commit, a schedule, a message.' },
    { id: 't-mcp', name: 'MCP & tools', endorsed: false, description: 'Connecting agents to external systems and data through tools and MCP servers.' },
    { id: 't-evals', name: 'Evals', endorsed: true, description: 'Measuring quality with checks and graders before a change is allowed to ship.' },
    { id: 't-multiagent', name: 'Multi-agent', endorsed: false, description: 'Coordinating several agents toward one outcome with clear, legible handoffs.' },
    { id: 't-structured', name: 'Structured output', endorsed: false, description: 'Forcing legible, schema-shaped output instead of free text, so results are checkable.' },
    { id: 't-retrieval', name: 'Retrieval', endorsed: false, description: 'Finding and grounding on the right source material on demand, with traceability.' },
  ];

  const RES_TYPES = {
    pattern: 'Pattern', skill: 'Skill', template: 'Template',
    prompt: 'Prompt', principle: 'Principle', config: 'Tool config',
  };

  // ---- Resources (standalone, reusable) ----
  const RESOURCES = [
    {
      id: 'r-twopass', type: 'pattern', name: 'Two-pass: classify, then summarize', endorsed: false,
      summary: 'Split a long-context classification + summary job into two passes — classify each item standalone, then summarize only the kept set. Far more reliable than one combined call.',
      techniques: ['t-prompt', 't-context'], author: 'Northstar Squad',
    },
    {
      id: 'r-filehandoff', type: 'pattern', name: 'Strict file-based subagent handoff', endorsed: false,
      summary: 'Subagents never share state in memory. Each writes to a shared directory using a strict frontmatter schema; a synthesizer reads the tree. Legible, debuggable, and resilient.',
      techniques: ['t-subagents', 't-multiagent', 't-structured'], author: 'Orbital Insights',
    },
    {
      id: 'r-evalcases', type: 'template', name: 'Eval cases as YAML + checked-in graders', endorsed: true,
      summary: 'Each skill gets an adjacent evals/ folder: one YAML case = input + expected qualitative property + a small grader prompt. Graders are checked in so the team can argue about them.',
      techniques: ['t-evals', 't-skills'], author: 'Helios Platform',
    },
    {
      id: 'r-traceability', type: 'principle', name: 'Traceability footnotes to source', endorsed: true,
      summary: 'Every generated claim links back to its source with a bracketed footnote (e.g. a transcript timecode). Reviewers verify any line in seconds — the single biggest driver of trust.',
      techniques: ['t-structured', 't-retrieval'], author: 'Kingfisher Research',
    },
    {
      id: 'r-queue', type: 'principle', name: 'Non-destructive queue, human commits', endorsed: true,
      summary: 'The agent proposes; a human disposes. Agents write to a review queue and never perform destructive actions directly. The constraint is why these patterns get adopted, not feared.',
      techniques: ['t-subagents'], author: 'Delta Velocity',
    },
    {
      id: 'r-claudemd', type: 'template', name: 'CLAUDE.md role + voice scaffold', endorsed: false,
      summary: 'A starter CLAUDE.md pre-populated with role, voice, and escalation rules, plus an examples/ folder shaped like the user\u2019s real work. Turns "point it at anything" into "here is your project".',
      techniques: ['t-prompt', 't-context'], author: 'Ember Onboarding',
    },
  ];

  // ---- Use cases ----
  const USECASES = [
    {
      id: 'u-triage', title: 'Agentic Slack triage that flags real customer signal across 30 channels',
      placement: { phase: 'grow', activity: 'g-ops' }, endorsed: false,
      techniques: ['t-subagents', 't-mcp'], resources: ['r-twopass', 'r-queue'],
      tools: ['Claude Code', 'Slack', 'MCP'], author: 'Northstar Squad', featured: true,
      problem: 'A support team monitored 30 Slack channels — roughly 60 hours/week of triage, most of it skimming routine chatter for the few real customer issues.',
      solution: 'A scheduled subagent pulls the last 15 minutes from each channel, classifies every message as signal / noise / escalate, and writes a markdown digest. A second pass summarizes only the signal set and posts escalations to a dedicated channel.',
      prompt: '# pass 1 — classify each message standalone\nfor msg in messages:\n    label = classify(msg)   # signal | noise | escalate\n\n# pass 2 — summarize only the kept set\ndigest = summarize([m for m, l in pairs if l != "noise"])',
      links: [
        { label: 'support-triage skill', url: 'github.com/example/support-triage' },
        { label: 'Internal launch memo', url: 'example.com/memo' },
      ],
      impact: 'Triage dropped from ~60 hrs/week to ~8. Three weeks running with zero missed escalations against a control sample.',
      metric: { label: 'Time saved', value: '52 hrs/week' },
    },
    {
      id: 'u-prd', title: 'PRD-from-transcript: customer interviews into reviewable specs in 10 minutes',
      placement: { phase: 'discover', activity: 'd-specs' }, endorsed: true,
      techniques: ['t-skills', 't-structured'], resources: ['r-traceability'],
      tools: ['Claude Code', 'skill'], author: 'Kingfisher Research', featured: true,
      problem: 'Converting interview transcripts into a coherent PRD took 3\u20134 days. By the time the doc landed, the freshness of the conversations was gone.',
      solution: 'A skill ingests a folder of .vtt transcripts and drafts a PRD: problem statement, jobs-to-be-done, prioritized requirements, and open questions — each claim footnoted back to a transcript timecode.',
      links: [{ label: 'prd-from-transcript skill', url: 'github.com/example/prd-skill' }],
      impact: 'One PM cleared a backlog of 6 PRDs in an afternoon. Eng leads said the traceability changed how much they trusted the doc.',
      metric: null,
    },
    {
      id: 'u-research', title: 'Parallel subagents for competitive research: 8\u00d7 faster intelligence gathering',
      placement: { phase: 'discover', activity: 'd-sensing' }, endorsed: false,
      techniques: ['t-subagents', 't-multiagent'], resources: ['r-filehandoff'],
      tools: ['Claude Code', 'subagent'], author: 'Orbital Insights', featured: false,
      problem: 'Quarterly competitive sweeps took a researcher 2\u20133 days of switching between sources and reconciling overlapping mentions — half of it tab management.',
      solution: 'Eight parallel subagents, each scoped to one source, write findings to a shared directory using a strict frontmatter schema. A synthesizer reads the whole tree and produces the executive brief.',
      prompt: '---\ncompetitor: <id>\nsource_type: <press|changelog|jobs|pricing>\ndate_observed: <iso>\nsignal_strength: <low|medium|high>\n---',
      links: [{ label: 'comp-intel-orchestrator', url: 'github.com/example/comp-intel' }],
      impact: 'Cycle time on the quarterly brief dropped from 2.5 days to about 4 hours of human curation.',
      metric: { label: 'Cycle time', value: '2.5d \u2192 4h' },
    },
    {
      id: 'u-evals', title: 'A lightweight eval harness that catches 80% of prompt drift in a 90-second check',
      placement: { phase: 'build', activity: 'b-testing' }, endorsed: true,
      techniques: ['t-evals', 't-hooks'], resources: ['r-evalcases'],
      tools: ['Claude Code', 'eval', 'hook'], author: 'Helios Platform', featured: true,
      problem: 'Prompt and skill regressions kept slipping into production. The team needed a no-fuss eval pattern that didn\u2019t require a full ML pipeline.',
      solution: 'Each skill has an adjacent evals/ folder of YAML cases. A pre-commit hook runs them against the staged version in parallel and blocks on qualitative failures.',
      impact: 'Caught 7 regressions in the first four weeks that would otherwise have shipped. Adopted by 5 teams.',
      metric: { label: 'Regressions caught', value: '7 in 4 wks' },
    },
    {
      id: 'u-grooming', title: 'Backlog grooming agent: an overnight pass that re-tags, dedupes, and ranks stale tickets',
      placement: { phase: 'grow', activity: 'g-ops' }, endorsed: false,
      techniques: ['t-subagents'], resources: ['r-queue', 'r-twopass'],
      tools: ['Claude Code', 'Jira', 'MCP'], author: 'Delta Velocity', featured: false,
      problem: '1,400+ stale tickets accumulated over years. Manual grooming never made a dent.',
      solution: 'An overnight subagent runs each old ticket through dedupe, tag normalization, owner inference, and a relevance check — then lands results in a review queue. It never closes tickets; humans close from the queue.',
      impact: 'Trimmed the backlog from 1,400 to 420 in three weeks of morning reviews. Eng leads look at the backlog again.',
      metric: null,
    },
    {
      id: 'u-onboard', title: 'CWD-as-project-scope: a 5-minute onboarding pattern for new agentic-coding users',
      placement: { phase: 'grow', activity: 'g-enable' }, endorsed: false,
      techniques: ['t-prompt', 't-context'], resources: ['r-claudemd'],
      tools: ['Claude Code'], author: 'Ember Onboarding', featured: false,
      problem: 'New users spent 30+ minutes wandering before getting useful output. "Open the agent in your home directory and figure it out" is hostile to newcomers.',
      solution: 'Onboarding opens directly into a scaffolded directory: a populated CLAUDE.md, three small runnable examples, and an out/ folder. The working directory becomes the project scope.',
      impact: 'Activation (one runnable task in the first session) rose from 41% to 78%.',
      metric: { label: 'Activation', value: '41% \u2192 78%' },
    },
    {
      id: 'u-designreview', title: 'Async design review: structured feedback that gets reviewers to actually engage',
      placement: { phase: 'build', activity: 'b-design' }, endorsed: false,
      techniques: ['t-prompt'], resources: [],
      tools: ['Claude Code', 'Figma'], author: 'Magnolia Studio', featured: false,
      problem: 'Async design reviews collected sparse, low-signal comments. Reviewers said the open-ended format was the problem.',
      solution: 'A skill turns the design artifact into a structured review template with prompts at the right specificity — clarity, hierarchy, accessibility, content — then synthesizes responses into a single thread.',
      impact: 'Reviewer engagement, measured by words-per-review, tripled. Designers rate the feedback meaningfully higher.',
      metric: null,
    },
    {
      id: 'u-personas', title: 'Persona synthesizer: 80 interviews into 6 actionable personas that stay fresh',
      placement: { phase: 'discover', activity: 'd-research' }, endorsed: false,
      techniques: ['t-structured', 't-retrieval'], resources: ['r-traceability', 'r-twopass'],
      tools: ['Claude Code', 'skill'], author: 'Kingfisher Research', featured: false,
      problem: 'Persona work was either thin (invented in a room) or stale (built once, never refreshed).',
      solution: 'An agent clusters interview utterances into latent personas with traceability to source. Personas live as markdown files with a recency metric; a monthly run shows which are drifting.',
      impact: 'Personas now visibly used in 4 product reviews — trusted because the source utterances are one click away.',
      metric: null,
    },
    {
      id: 'u-pr-reviewer', title: 'PR reviewer agent: a calibrated second pair of eyes that focuses humans on what matters',
      placement: { phase: 'build', activity: 'b-review' }, endorsed: false,
      techniques: ['t-subagents', 't-evals'], resources: ['r-queue'],
      tools: ['Claude Code', 'GitHub', 'MCP'], author: 'Helios Platform', featured: false,
      problem: 'Code reviews ate senior engineers\u2019 afternoons, mostly on style and small correctness issues that could be caught earlier.',
      solution: 'An agent runs on every PR and produces three sections — mechanical, risk, and unsure. Seniors focus on risk and unsure; the team self-resolves mechanical. It comments only, never approves.',
      impact: 'Senior-engineer review time per PR halved. Defect rate held steady.',
      metric: { label: 'Review time', value: '\u221250%' },
    },
    {
      id: 'u-spec-decomp', title: 'Spec-decomposer: a one-page PRD into a tracked engineering plan with seeded subtasks',
      placement: { phase: 'build', activity: 'b-decisions' }, endorsed: false,
      techniques: ['t-structured', 't-skills'], resources: [],
      tools: ['Claude Code', 'Jira', 'MCP'], author: 'Delta Velocity', featured: false,
      problem: 'The handoff from a one-page PRD to a tracked engineering plan was a half-day exercise that often missed dependencies.',
      solution: 'A skill reads the PRD, classifies each requirement (api / ui / data / ops), and generates Jira-formatted subtasks with proposed owners and a draft dependency graph — as markdown a human pastes in.',
      impact: 'Decomposition dropped from a half-day to ~30 minutes. Two teams adopted it in their first review.',
      metric: null,
    },
    {
      id: 'u-rollout', title: 'Phased rollout brief: an agent that drafts the comms, training, and risk plan for a launch',
      placement: { phase: 'grow', activity: 'g-launch' }, endorsed: false,
      techniques: ['t-prompt', 't-structured'], resources: [],
      tools: ['Claude Code', 'Confluence'], author: 'Ember Onboarding', featured: false,
      problem: 'Phased rollouts took 2\u20133 weeks of comms, training, and stakeholder alignment after a feature was technically ready.',
      solution: 'An agent ingests the PRD, the change-management template, and the stakeholder map, and drafts a rollout brief: phased timeline, comms by audience, training outline, risk register. It fills the form; humans answer what it flags as unknown.',
      impact: 'Median rollout-prep time dropped from ~12 days to ~4. Comms quality, judged blindly, was rated equal or better.',
      metric: { label: 'Prep time', value: '12d \u2192 4d' },
    },
    {
      id: 'u-postmortem', title: 'Postmortem-as-conversation: an agent that interviews the on-call and drafts a calibrated writeup',
      placement: { phase: 'grow', activity: 'g-iterate' }, endorsed: false,
      techniques: ['t-prompt'], resources: [],
      tools: ['Claude Code', 'skill'], author: 'Helios Platform', featured: false,
      problem: 'Postmortems were either thin (rushed by the on-call) or never written at all.',
      solution: 'An interview-style agent asks the on-call structured questions, drafts the writeup, then asks them to confirm specific factual claims. It is calibrated to be curious about systems, never to blame people.',
      impact: 'Postmortem completion rose from 60% to 95%. The platform team reports they\u2019re noticeably better.',
      metric: null,
    },
    {
      id: 'u-promptlib', title: 'A team prompt library that earns its keep — and the rules that keep it from rotting',
      placement: { phase: 'build', activity: 'b-docs' }, endorsed: false,
      techniques: ['t-prompt', 't-context'], resources: [],
      tools: ['prompt library', 'Confluence'], author: 'Magnolia Studio', featured: false,
      problem: 'Most prompt libraries become folders of dead snippets within three months.',
      solution: 'Every prompt carries three required fields: a use case, a known failure mode, and a freshness date. Anything 90 days stale is auto-archived. The failure-mode field is what drives quality.',
      impact: 'Three quarters in: 142 active prompts, 80+ used at least monthly, fewer than 10 stale.',
      metric: null,
    },
  ];

  // ---- About pages ----
  const ABOUT = {
    pdlc: {
      title: 'About the PDLC',
      lede: 'The Product Development Lifecycle is a thin, open protocol. It defines the minimum each phase must satisfy — and deliberately says little else.',
      body: [
        ['Thin by design', 'The protocol is three phases and a short list of requirements per phase. That is the whole of the canon. It is intentionally sparse: a protocol that over-specifies calcifies, and product work is too varied to legislate. What the PDLC guarantees is a floor — a named customer before a spec, a reviewable artifact at every step, a reversible release — not a method.'],
        ['Three voices', 'Everything on this site is labelled by voice. CANON is what the protocol officially says; it is short and authoritative. The EDITOR\u2019S NOTE is my expansion on the canon — opinionated, and clearly mine, not the protocol\u2019s. PRACTICE is what teams are actually doing in the field: use cases and the reusable resources behind them.'],
        ['Endorsement', 'When a practice proves itself across enough teams, it can be endorsed — promoted from practice into the protocol\u2019s recommendations. Endorsed resources and techniques carry a seal. Endorsement is the only way the thin protocol grows, and it is deliberately slow.'],
      ],
    },
    editor: {
      title: 'About the editor',
      lede: 'I curate this playbook and lead the AI in Product initiative. Everything marked Editor\u2019s Note is my view, not the protocol\u2019s.',
      body: [
        ['Why I keep this', 'I kept watching teams reinvent the same AI-augmented patterns in isolation — and watching good patterns die because nobody wrote them down. The playbook is the durable place those patterns live, organized so you can find the one that fits where you actually are in the work.'],
        ['How I curate', 'I read every submission, place it on the spine, and write the editor\u2019s notes. I try to be generous about what counts as practice and conservative about what gets endorsed. When I\u2019m editorializing, I say so.'],
      ],
      draft: 'Draft \u2014 replace with your bio, photo, and contact.',
    },
    initiative: {
      title: 'About AI in Product',
      lede: 'AI in Product is an initiative for sharing the use cases and techniques of AI-augmented product craft across teams.',
      body: [
        ['What it is', 'A cross-team effort to make AI-augmented product work legible: to collect what\u2019s working, organize it against a shared lifecycle, and lower the cost of adopting a good pattern from "rebuild it yourself" to "read this and fork it".'],
        ['How to take part', 'Every section of the playbook has an "add to this section" link, and the header carries a submit button. Contributions are GitHub issues — low-ceremony, public, and easy to discuss before anything is merged.'],
      ],
      draft: 'Draft \u2014 replace with the real initiative description and links.',
    },
  };

  // ---- Derived helpers ----
  const phase = (id) => PHASES.find((p) => p.id === id);
  const activity = (id) => { for (const p of PHASES) { const a = p.activities.find((x) => x.id === id); if (a) return { ...a, phase: p }; } return null; };
  const technique = (id) => TECHNIQUES.find((t) => t.id === id);
  const resource = (id) => RESOURCES.find((r) => r.id === id);
  const usecase = (id) => USECASES.find((u) => u.id === id);
  const ucByPhase = (pid) => USECASES.filter((u) => u.placement.phase === pid);
  const ucByActivity = (aid) => USECASES.filter((u) => u.placement.activity === aid);
  const ucByTechnique = (tid) => USECASES.filter((u) => u.techniques.includes(tid));
  const resByTechnique = (tid) => RESOURCES.filter((r) => r.techniques.includes(tid));
  const ucUsingResource = (rid) => USECASES.filter((u) => u.resources && u.resources.includes(rid));
  const resByPhase = (pid) => RESOURCES.filter((r) => ucUsingResource(r.id).some((u) => u.placement.phase === pid));
  const techCount = (tid) => ucByTechnique(tid).length;
  const techniquesInPhase = (pid) => [...new Set(ucByPhase(pid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);
  const techniquesInActivity = (aid) => [...new Set(ucByActivity(aid).flatMap((u) => u.techniques))].map(technique).filter(Boolean);
  const featured = () => USECASES.filter((u) => u.featured);

  return {
    PHASES, TECHNIQUES, RES_TYPES, RESOURCES, USECASES, ABOUT,
    phase, activity, technique, resource, usecase,
    ucByPhase, ucByActivity, ucByTechnique, resByTechnique, ucUsingResource, resByPhase,
    techCount, techniquesInPhase, techniquesInActivity, featured,
  };
})();
