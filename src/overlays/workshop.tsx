import { useId } from "react";
import { downloadNotes } from "../exportNotes";
import { useAppState, useDispatch, type Level } from "../state";
import { CANDIDATE_PLACEHOLDERS, WORKSHOP_QUESTIONS } from "../story";
import { useCountdown } from "../useCountdown";
import { idx, type OverlayProps } from "./shared";

const POSITIONS = [
  { x: 22, y: 20 },
  { x: 64, y: 12 },
  { x: 86, y: 44 },
  { x: 66, y: 78 },
  { x: 26, y: 82 },
  { x: 10, y: 50 },
];

export function WorkshopOverlay({ beat, readable }: OverlayProps) {
  const focus = beat >= 1 && beat <= WORKSHOP_QUESTIONS.length ? beat - 1 : -1;
  return (
    <div className="ov ov-workshop" data-beat={beat}>
      <ol className="question-map" aria-label="Six questions">
        {WORKSHOP_QUESTIONS.map((q, i) => (
          <li
            key={q}
            className={`qnode${focus === i ? " is-focus" : ""}${!readable && focus > i ? " is-seen" : ""}`}
            style={idx(i, { "--x": `${POSITIONS[i].x}%`, "--y": `${POSITIONS[i].y}%` })}
          >
            <span className="qnode__n">{i + 1}</span>
            <span className="qnode__q">{q}</span>
          </li>
        ))}
      </ol>
      <WorkshopTools />
    </div>
  );
}

export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function WorkshopTools() {
  const state = useAppState();
  const dispatch = useDispatch();
  const remaining = useCountdown(state.timerEndsAt);
  const notesId = useId();

  return (
    <div className="tools" role="group" aria-label="Workshop tools">
      <div className="tools__row">
        <button
          type="button"
          className={`btn${state.discussion ? " btn--on" : " btn--accent"}`}
          aria-pressed={state.discussion}
          onClick={() => dispatch({ type: "setDiscussion", active: !state.discussion })}
        >
          {state.discussion ? "Resume" : "Pause for discussion"}
        </button>
        {state.timerEndsAt ? (
          <button type="button" className="btn" onClick={() => dispatch({ type: "stopTimer" })}>
            Stop timer · <span className="mono">{formatRemaining(remaining)}</span>
          </button>
        ) : (
          <button type="button" className="btn" onClick={() => dispatch({ type: "startTimer", minutes: 10 })}>
            Start 10-minute timer
          </button>
        )}
      </div>
      <label className="tools__label" htmlFor={notesId}>
        Discussion notes
      </label>
      <textarea
        id={notesId}
        className="tools__notes"
        rows={4}
        placeholder="Optional: the workflow you discussed and your answers to the six questions"
        value={state.workshopNotes}
        onChange={(e) => dispatch({ type: "setWorkshopNotes", notes: e.target.value })}
      />
      <div className="tools__row tools__row--end">
        <p className="tools__privacy">Notes stay in this browser unless you export them.</p>
        <button type="button" className="btn" onClick={() => downloadNotes(state)}>
          Export notes
        </button>
      </div>
    </div>
  );
}

function LevelToggle({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value?: Level;
  disabled: boolean;
  onChange: (level: Level) => void;
}) {
  return (
    <fieldset className="level" disabled={disabled}>
      <legend>{label}</legend>
      {(["lower", "higher"] as const).map((level) => (
        <button key={level} type="button" aria-pressed={value === level} onClick={() => onChange(level)}>
          {level}
        </button>
      ))}
    </fieldset>
  );
}

export function CandidatesOverlay({ beat }: OverlayProps) {
  const state = useAppState();
  const dispatch = useDispatch();
  const selectedName = state.selected !== null ? state.candidates[state.selected]?.name.trim() : "";

  return (
    <div className="ov ov-candidates" data-beat={beat}>
      <div className="candidates" role="group" aria-label="Moonshot candidates">
        {state.candidates.map((candidate, i) => {
          const named = candidate.name.trim() !== "";
          const isSelected = state.selected === i;
          return (
            <div key={i} className={`candidate${isSelected ? " is-selected" : ""}`}>
              <label className="candidate__label" htmlFor={`candidate-${i}`}>
                Candidate {i + 1}
              </label>
              <input
                id={`candidate-${i}`}
                className="candidate__name"
                type="text"
                maxLength={60}
                placeholder={`e.g. ${CANDIDATE_PLACEHOLDERS[i]}`}
                value={candidate.name}
                onChange={(e) => dispatch({ type: "updateCandidate", index: i, patch: { name: e.target.value } })}
              />
              <input
                aria-label={`Candidate ${i + 1} note`}
                className="candidate__note"
                type="text"
                maxLength={140}
                placeholder="Optional note"
                value={candidate.note}
                onChange={(e) => dispatch({ type: "updateCandidate", index: i, patch: { note: e.target.value } })}
              />
              <div className="candidate__levels">
                <LevelToggle
                  label="Value to users"
                  value={candidate.value}
                  disabled={!named}
                  onChange={(value) => dispatch({ type: "updateCandidate", index: i, patch: { value } })}
                />
                <LevelToggle
                  label="Feasibility to test"
                  value={candidate.feasibility}
                  disabled={!named}
                  onChange={(feasibility) => dispatch({ type: "updateCandidate", index: i, patch: { feasibility } })}
                />
              </div>
              <button
                type="button"
                className={`btn candidate__select${isSelected ? " btn--on" : ""}`}
                disabled={!named}
                aria-pressed={isSelected}
                onClick={() => dispatch({ type: "select", index: isSelected ? null : i })}
              >
                {isSelected ? "Selected · clear" : "Select for the close"}
              </button>
            </div>
          );
        })}
      </div>
      <div className="matrix" aria-label="Value to users and feasibility to test, as placed by the presenter">
        <span className="matrix__y">Value to users</span>
        <span className="matrix__x">Feasibility to test</span>
        {state.candidates.map((c, i) =>
          c.name.trim() && c.value && c.feasibility ? (
            <span
              key={i}
              className={`matrix__dot${state.selected === i ? " is-selected" : ""}`}
              style={idx(i, { "--mx": c.feasibility === "higher" ? "75%" : "25%", "--my": c.value === "higher" ? "25%" : "75%" })}
            >
              {c.name.trim()}
            </span>
          ) : null,
        )}
      </div>
      <p className="candidates__status" role="status">
        {selectedName ? `Selected: ${selectedName}. It will open the closing scene.` : "No selection yet. Decision to be made together."}
      </p>
    </div>
  );
}
