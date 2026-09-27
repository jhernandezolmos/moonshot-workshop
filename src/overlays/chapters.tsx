import { selectedCandidateName, useAppState } from "../state";
import { ConceptTag, idx, Panel, Thread, type OverlayProps } from "./shared";

export function FragmentsOverlay({ beat }: OverlayProps) {
  return (
    <div className="ov ov-fragments" data-beat={beat}>
      <div className="frag frag--sheet" style={idx(0, { "--x": "58%", "--y": "14%", "--z": 0.9 })}>
        <div className="mini-grid" aria-hidden="true">
          {["Q1", "Q2", "Q3", "Q4", "1.2", "0.8", "1.9", "2.4", "0.6", "1.1", "?", "1.7"].map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
        <span className="frag__caption">Pipeline_EMEA.xlsx</span>
      </div>
      <div className="frag frag--card" style={idx(1, { "--x": "74%", "--y": "38%", "--z": 1.15 })}>
        <span className="frag__kicker">Opportunity</span>
        <strong>Service agreement renewal</strong>
        <span>Stage 3 · owner A. Keller</span>
      </div>
      <div className="frag frag--badge" style={idx(2, { "--x": "88%", "--y": "18%", "--z": 0.7 })}>
        <span className="frag__kicker">Inbox</span>
        <strong>14 unread</strong>
      </div>
      <div className="frag frag--approval" style={idx(3, { "--x": "60%", "--y": "64%", "--z": 1.0 })}>
        <span className="frag__kicker">Approval pending</span>
        <strong>Discount 8% · awaiting review</strong>
      </div>
      <div className="frag frag--map" style={idx(4, { "--x": "84%", "--y": "70%", "--z": 0.8 })}>
        <span className="frag__kicker">Market map</span>
        <strong>EMEA · gas services</strong>
      </div>
      <div className="frag frag--chat" style={idx(5, { "--x": "70%", "--y": "86%", "--z": 1.1 })}>
        <strong>“Is this the latest file?”</strong>
      </div>
      <ConceptTag>Illustration · fictional data</ConceptTag>
    </div>
  );
}

const WINDOWS = Array.from({ length: 7 }, (_, i) => i);

export function IntentionOverlay({ beat }: OverlayProps) {
  return (
    <div className="ov ov-intention" data-beat={beat}>
      <div className="window-stack" aria-hidden="true">
        {WINDOWS.map((i) => (
          <div key={i} className="win" style={idx(i)}>
            <span className="win__bar" />
            <span className="win__line" />
            <span className="win__line win__line--short" />
          </div>
        ))}
        <svg className="cursor" viewBox="0 0 24 24">
          <path d="M5 3l14 8-6 2-2 6z" />
        </svg>
      </div>
      <Panel className="answer" label="Future concept: an answer assembled from approved sources">
        <div className="answer__head">
          <ConceptTag>Future concept · fictional data</ConceptTag>
        </div>
        <p className="answer__ask">
          <span aria-hidden="true">›</span> What changed in this market since our last review?
        </p>
        <ul className="answer__items">
          <li style={idx(0)}>
            Two tenders moved from Q3 to Q4.
            <span className="source">Opportunities · Salesforce</span>
          </li>
          <li style={idx(1)}>
            A competitor announced new service pricing.
            <span className="source">Market note · planning workbook</span>
          </li>
          <li style={idx(2)}>
            One key account raised a delivery risk.
            <span className="source">Account plan</span>
          </li>
        </ul>
        <div className="answer__foot">
          <span className="asof">As of 26 Sep 2026, 09:40 · since review of 12 May</span>
          <span className="review-btn">Review before acting</span>
        </div>
      </Panel>
    </div>
  );
}

const ROLES = [
  {
    role: "Seller",
    title: "Customer brief",
    subject: "Nordic utility (fictional)",
    rows: ["Next meeting · Thu 10:00", "Open · service renewal", "New · outage report from site"],
  },
  {
    role: "Planner",
    title: "Market plan",
    subject: "EMEA gas services (fictional)",
    rows: ["Pipeline by quarter", "Capacity vs demand", "Three risks to review"],
  },
  {
    role: "Approver",
    title: "Decision card",
    subject: "Discount request 6% (fictional)",
    rows: ["Evidence · margin impact, history", "Requested by · sales, 24 Sep", "Audit trail · every step recorded"],
  },
];

export function RolesOverlay({ beat }: OverlayProps) {
  return (
    <div className="ov ov-roles" data-beat={beat}>
      <div className="roles">
        {ROLES.map((r, i) => (
          <Panel key={r.role} className={`role${beat === i + 1 ? " is-focus" : ""}`} label={`${r.role}: ${r.title}`}>
            <span className="role__who">{r.role}</span>
            <strong className="role__title">{r.title}</strong>
            <span className="role__subject">{r.subject}</span>
            <ul>
              {r.rows.map((row) => (
                <li key={row}>{row}</li>
              ))}
            </ul>
            {r.role === "Planner" ? (
              <span className="bars" aria-hidden="true">
                {[40, 64, 52, 80].map((h, j) => (
                  <i key={j} style={{ height: `${h}%` }} />
                ))}
              </span>
            ) : null}
          </Panel>
        ))}
      </div>
      <Thread className="thread--roots" viewBox="0 0 900 200" d="M150 0 C 150 120, 450 80, 450 190 M450 0 L 450 190 M750 0 C 750 120, 450 80, 450 190" />
      <div className="foundation">
        <strong>One trusted foundation</strong>
        <span>records · permissions · workflows · audit</span>
      </div>
      <ConceptTag />
    </div>
  );
}

const LAYERS = [
  { name: "Experiences & agents", detail: "focused views · assistants · the right task in context" },
  { name: "Governed access & data", detail: "policies · identity · governed analytical views, e.g. Snowflake" },
  { name: "Systems of record & workflows", detail: "records · workflows · approvals, e.g. Salesforce" },
];

const TOKEN_STEPS = [
  "Owned and updated in Salesforce",
  "Represented in a governed analytical view",
  "Shown in a focused experience",
  "Approved: the action follows an authorized write path",
  "Recorded: the audit trail stays with the record",
];

export function EngineOverlay({ beat }: OverlayProps) {
  const level = [2, 1, 0, 1, 2][Math.min(beat, 4)];
  return (
    <div className="ov ov-engine" data-beat={beat}>
      <div className="layers" style={idx(0, { "--level": level })}>
        {LAYERS.map((layer, i) => (
          <div key={layer.name} className={`layer${level === i ? " is-focus" : ""}`}>
            <strong>{layer.name}</strong>
            <span>{layer.detail}</span>
          </div>
        ))}
        <span className="flow flow--read">read</span>
        <span className="flow flow--policy">policy</span>
        <span className="flow flow--action">action</span>
        <span className="flow flow--audit">audit</span>
        <div className="token">
          <span className="token__dot" aria-hidden="true" />
          <span className="token__name">Opportunity · turbine service renewal (fictional)</span>
          <span className="token__step">{TOKEN_STEPS[Math.min(beat, 4)]}</span>
        </div>
      </div>
      <p className="market-signal">
        Market signal: Salesforce is opening its platform to other interfaces and agents (Headless 360).
      </p>
      <ConceptTag>Candidate pattern · not an architecture decision</ConceptTag>
    </div>
  );
}

const PRINCIPLES = ["speed", "security", "ownership", "quality", "cost", "adoption"];

export function TensionOverlay({ beat }: OverlayProps) {
  return (
    <div className="ov ov-tension" data-beat={beat}>
      <p className="principles__title">Principles we design with</p>
      <ul className="principles">
        {PRINCIPLES.map((word, i) => (
          <li key={word} style={idx(i, { "--side": i % 2 === 0 ? -1 : 1 })}>
            {word}
          </li>
        ))}
      </ul>
      <div className="bridge" aria-hidden="true">
        <span className="bridge__side bridge__side--fast">prototype</span>
        <span className="bridge__span" />
        <span className="bridge__side bridge__side--stable">controls</span>
      </div>
    </div>
  );
}

const PATH = ["A real task", "Context", "Decision", "Action", "Recorded outcome"];

export function InvitationOverlay({ beat }: OverlayProps) {
  const state = useAppState();
  const candidate = selectedCandidateName(state);
  return (
    <div className="ov ov-invitation" data-beat={beat}>
      <ol className="path" aria-label="A narrow path from task to outcome">
        {PATH.map((step, i) => (
          <li key={step} style={idx(i)}>
            {step}
          </li>
        ))}
      </ol>
      <div className="experiment">
        {candidate ? (
          <>
            <span className="experiment__label">First possible experiment</span>
            <strong className="experiment__name">{candidate}</strong>
          </>
        ) : (
          <strong className="experiment__name experiment__name--open">Decision to be made together.</strong>
        )}
      </div>
      <div className="signature" aria-label="Omterra">
        <img src={`${import.meta.env.BASE_URL}brand/omterra-wordmark.png`} alt="Omterra" />
        <span className="brand-bar" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}
