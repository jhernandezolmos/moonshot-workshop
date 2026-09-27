import { idx, Thread, type OverlayProps } from "./shared";

const FILES = [
  "Forecast_FY26_v7.xlsx",
  "Forecast_FY26_v7_FINAL.xlsx",
  "Forecast_FY26_v7_FINAL (2).xlsx",
  "Pipeline_EMEA_current?.xlsx",
  "Pipeline_EMEA_JM_edits.xlsx",
  "Planning_master_DO_NOT_TOUCH.xlsx",
];

export function FilesOverlay({ beat }: OverlayProps) {
  return (
    <div className="ov ov-files" data-beat={beat}>
      <Thread className="thread--wander" d="M40 520 C 180 420, 120 300, 300 330 S 420 520, 560 380 S 640 140, 760 260 S 880 420, 980 120" />
      <ul className="file-cloud" aria-label="Files with almost the same name">
        {FILES.map((file, i) => (
          <li key={file} className="file-chip" style={idx(i)}>
            <span className="file-chip__icon" aria-hidden="true" />
            {file}
          </li>
        ))}
      </ul>
      <p className="bubble bubble--question">Which file is current?</p>
    </div>
  );
}

export function AutomationOverlay({ beat }: OverlayProps) {
  const near = [0, 1, 2, 3];
  const far = Array.from({ length: 18 }, (_, i) => i);
  return (
    <div className="ov ov-steps" data-beat={beat}>
      <div className="named-chip">
        <span className="named-chip__name">McCoy</span>
        <span className="named-chip__meta">A small AI-assisted automation · powered by Excel</span>
      </div>
      <svg className="steps" viewBox="0 0 1000 200" aria-hidden="true">
        <path className="steps__done" d="M60 100 L 300 100" pathLength={1} />
        {near.map((i) => (
          <circle key={i} className="step step--near" cx={60 + i * 80} cy={100} r={9} style={idx(i)} />
        ))}
        {far.map((i) => (
          <circle key={i} className="step step--far" cx={400 + i * 34} cy={100 + Math.sin(i * 1.7) * 40} r={6} style={idx(i)} />
        ))}
      </svg>
    </div>
  );
}

const BEFORE = ["Idea", "Specification", "Waiting", "Build", "Review"];
const NOW = ["Idea", "Prototype", "Review", "Improve"];
const BUILT = ["HTML presentations", "Coding agents in Salesforce", "GCO Planner", "Agent experiments", "MEP · Market Evaluation Planner"];

export function PrototypeOverlay({ beat }: OverlayProps) {
  return (
    <div className="ov ov-prototype" data-beat={beat}>
      <div className="timeline" aria-label="From idea to prototype, before and now">
        <div className="timeline__row timeline__row--before">
          <span className="timeline__label">Before</span>
          <ol>
            {BEFORE.map((step, i) => (
              <li key={step} style={idx(i)}>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="timeline__row timeline__row--now">
          <span className="timeline__label">Now</span>
          <ol>
            {NOW.map((step, i) => (
              <li key={step} style={idx(i)}>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div className="built">
        <p className="built__title">Built in these months</p>
        <ul>
          {BUILT.map((item, i) => (
            <li key={item} style={idx(i)}>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const TERMS = [
  "HTML",
  "APIs",
  "agents",
  "MCP",
  "skills",
  "automation",
  "tokens",
  "orchestration",
  "harness",
  "connectors",
  "React apps",
  "Power Automate",
  "Copilot Studio",
  "LLMs",
  "Claude",
  "prompts",
];

const QUESTIONS = ["What decision does this improve?", "What data can it use?", "Who is allowed to act?"];

// Deterministic scatter so the cloud looks the same on every render.
const scatter = (i: number) => ({ x: ((i * 37) % 86) + 4, y: ((i * 53) % 78) + 8, r: ((i * 29) % 30) - 15 });

export function LanguageOverlay({ beat }: OverlayProps) {
  return (
    <div className="ov ov-language" data-beat={beat}>
      <ul className="term-cloud" aria-label="Words from the new tools">
        {TERMS.map((term, i) => {
          const s = scatter(i);
          return (
            <li key={term} className="term" style={idx(i, { "--x": `${s.x}%`, "--y": `${s.y}%`, "--r": `${s.r}deg` })}>
              {term}
            </li>
          );
        })}
      </ul>
      <div className="translation">
        <p className="translation__label">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
            <rect x="3" y="14" width="4" height="6" rx="1.5" />
            <rect x="17" y="14" width="4" height="6" rx="1.5" />
          </svg>
          Translated into everyday questions
        </p>
        <ul>
          {QUESTIONS.map((q, i) => (
            <li key={q} style={idx(i)}>
              {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const PEOPLE = [
  { label: "Sales", x: 18, y: 30 },
  { label: "Planning", x: 36, y: 16 },
  { label: "Product", x: 62, y: 20 },
  { label: "Data", x: 80, y: 36 },
  { label: "IT", x: 74, y: 66 },
  { label: "Service", x: 48, y: 78 },
  { label: "Leadership", x: 22, y: 64 },
];

export function ConstellationOverlay({ beat }: OverlayProps) {
  const hub = { x: 50, y: 46 };
  return (
    <div className="ov ov-constellation" data-beat={beat}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="constellation" aria-hidden="true">
        {PEOPLE.map((p, i) => (
          <line
            key={p.label}
            className={`link${p.label === "IT" || p.label === "Data" ? " link--design" : ""}`}
            x1={hub.x}
            y1={hub.y}
            x2={p.x}
            y2={p.y}
            pathLength={1}
            style={idx(i)}
          />
        ))}
      </svg>
      <ul className="nodes" aria-label="Teams joining the conversation">
        {PEOPLE.map((p, i) => (
          <li key={p.label} className="node" style={idx(i, { "--x": `${p.x}%`, "--y": `${p.y}%` })}>
            {p.label}
          </li>
        ))}
        <li className="node node--hub" style={idx(0, { "--x": `${hub.x}%`, "--y": `${hub.y}%` })}>
          Us
        </li>
      </ul>
      <p className="design-note">Dashed paths: integration and governance decisions still to design</p>
    </div>
  );
}
