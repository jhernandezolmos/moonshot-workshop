import { useEffect, useRef } from "react";
import { goNext, goPrevious, goToChapter, goToScene, useEngineState } from "../navigation";
import { useAppState, useDispatch } from "../state";
import { chapterOf, CHAPTERS, SCENES } from "../story";
import { useCountdown } from "../useCountdown";
import { formatRemaining } from "../overlays/workshop";

const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`;

export function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.();
}

export function openSpeakerWindow(): void {
  window.open(`${window.location.pathname}?view=notes`, "moonshot-speaker-notes", "width=960,height=720");
}

const TOTAL_STOPS = SCENES.reduce((sum, scene) => sum + scene.beats.length, 0);

function stopNumber(sceneIndex: number, beat: number): number {
  return SCENES.slice(0, sceneIndex).reduce((sum, scene) => sum + scene.beats.length, 0) + beat + 1;
}

export function TopBar({ onToggleReadable }: { onToggleReadable: () => void }) {
  const state = useAppState();
  const dispatch = useDispatch();
  const { activeIndex } = useEngineState();
  const scene = SCENES[activeIndex] ?? SCENES[0];

  return (
    <header className="topbar">
      <a
        className="brandmark"
        href={`#${SCENES[0].id}`}
        onClick={(e) => {
          e.preventDefault();
          goToScene(SCENES[0].id);
        }}
        aria-label={`${scene.brand === "siemens" ? "Siemens Energy" : "Omterra"}. Back to the start`}
      >
        <img
          className={`brandmark__logo brandmark__logo--siemens${scene.brand === "siemens" ? " is-on" : ""}`}
          src={asset("brand/siemens-energy-white.svg")}
          alt=""
        />
        <img
          className={`brandmark__logo brandmark__logo--omterra${scene.brand === "omterra" ? " is-on" : ""}`}
          src={asset("brand/omterra-wordmark.png")}
          alt=""
        />
      </a>
      <nav className="chapter-nav" aria-label="Chapters">
        <ol>
          {CHAPTERS.map((chapter) => (
            <li key={chapter.id}>
              <button
                type="button"
                aria-current={chapter.id === scene.chapter ? "step" : undefined}
                onClick={() => goToChapter(chapter.id)}
              >
                <span className="chapter-nav__dot" aria-hidden="true" />
                <span className="chapter-nav__num">{chapter.number}</span>
                <span className="chapter-nav__title">{chapter.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="topbar__actions">
        <button type="button" className="chip-btn" onClick={() => dispatch({ type: "setMenu", open: true })}>
          Chapters
        </button>
        <button
          type="button"
          className="chip-btn"
          aria-pressed={state.presenter}
          onClick={() => dispatch({ type: "togglePresenter" })}
        >
          Presenter
        </button>
        <button type="button" className="chip-btn" onClick={onToggleReadable}>
          {state.readable ? "Cinematic version" : "Readable version"}
        </button>
      </div>
      <span className="story-progress" aria-hidden="true" />
    </header>
  );
}

export function PresenterHud() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { activeIndex, activeBeat } = useEngineState();
  const scene = SCENES[activeIndex] ?? SCENES[0];
  const chapter = chapterOf(scene);
  const beat = scene.beats[Math.min(activeBeat, scene.beats.length - 1)];
  const current = stopNumber(activeIndex, Math.min(activeBeat, scene.beats.length - 1));

  return (
    <div className="hud" role="region" aria-label="Presenter controls">
      <div className="hud__where">
        <span className="hud__chapter">
          <span className="hud__num">{chapter.number === "00" ? "Prologue" : chapter.number}</span> {chapter.number === "00" ? scene.title : chapter.title}
        </span>
        <span className="hud__beat">
          {beat.label}
          {beat.pause ? <span className="pause-badge">Workshop pause · no auto-advance</span> : null}
        </span>
        <span className="hud__progress" aria-hidden="true">
          <i style={{ width: `${(current / TOTAL_STOPS) * 100}%` }} />
        </span>
      </div>
      <div className="hud__nav">
        <button type="button" className="btn" onClick={goPrevious} aria-label="Previous stop">
          ‹ Previous
        </button>
        <span className="mono hud__count" aria-live="polite">
          {current} / {TOTAL_STOPS}
        </span>
        <button type="button" className="btn btn--accent" onClick={goNext} aria-label="Next stop">
          Next ›
        </button>
      </div>
      <div className="hud__tools">
        <button type="button" className="btn" aria-pressed={state.frozen} onClick={() => dispatch({ type: "toggleFrozen" })}>
          {state.frozen ? "Resume motion" : "Freeze"}
        </button>
        <button type="button" className="btn" aria-pressed={state.notesOpen} onClick={() => dispatch({ type: "toggleNotes" })}>
          Notes
        </button>
        <button type="button" className="btn" onClick={openSpeakerWindow}>
          Speaker window
        </button>
        <button type="button" className="btn" onClick={toggleFullscreen}>
          Fullscreen
        </button>
        <button type="button" className="btn" onClick={() => dispatch({ type: "setMenu", open: true })}>
          Chapters
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: "togglePresenter" })}>
          Exit
        </button>
      </div>
    </div>
  );
}

export function NotesPanel() {
  const dispatch = useDispatch();
  const { activeIndex, activeBeat } = useEngineState();
  const scene = SCENES[activeIndex] ?? SCENES[0];
  const next = scene.beats[activeBeat + 1] ?? SCENES[activeIndex + 1]?.beats[0];

  return (
    <aside className="notes-panel" aria-label="Presenter notes">
      <div className="notes-panel__head">
        <span>{scene.kicker}</span>
        <button type="button" className="btn btn--ghost" onClick={() => dispatch({ type: "toggleNotes" })}>
          Hide
        </button>
      </div>
      {scene.notes.map((note) => (
        <p key={note}>{note}</p>
      ))}
      {next ? <p className="notes-panel__next">Next: {next.label}</p> : null}
      <p className="notes-panel__hint">These notes are visible on this screen. For a private view, open the speaker window on your laptop display.</p>
    </aside>
  );
}

export function ChapterMenu() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { activeIndex } = useEngineState();
  const firstButton = useRef<HTMLButtonElement>(null);
  const activeChapter = SCENES[activeIndex]?.chapter;

  useEffect(() => {
    firstButton.current?.focus();
  }, []);

  const close = () => dispatch({ type: "setMenu", open: false });
  const jump = (chapterId: string) => {
    close();
    goToChapter(chapterId);
  };

  return (
    <div className="menu-backdrop" onClick={close}>
      <div className="menu" role="dialog" aria-modal="true" aria-label="Chapter menu" onClick={(e) => e.stopPropagation()}>
        <div className="menu__head">
          <p className="kicker">What if the application came to the work?</p>
          <button type="button" className="btn btn--ghost" onClick={close}>
            Close
          </button>
        </div>
        <ol className="menu__list">
          {CHAPTERS.map((chapter, i) => (
            <li key={chapter.id}>
              <button
                ref={i === 0 ? firstButton : undefined}
                type="button"
                aria-current={chapter.id === activeChapter ? "step" : undefined}
                onClick={() => jump(chapter.id)}
              >
                <span className="menu__num">{chapter.number}</span>
                <span className="menu__title">{chapter.title}</span>
                <span className="menu__summary">{chapter.summary}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="menu__foot">
          <p>
            <kbd>→</kbd> <kbd>←</kbd> next and previous · <kbd>P</kbd> presenter · <kbd>N</kbd> notes · <kbd>.</kbd> freeze ·{" "}
            <kbd>F</kbd> fullscreen · <kbd>M</kbd> this menu
          </p>
          <p>{state.readable ? "You are reading the readable version." : "Prefer less motion? Switch to the readable version in the top bar."}</p>
        </div>
      </div>
    </div>
  );
}

export function DiscussionBanner() {
  const state = useAppState();
  const dispatch = useDispatch();
  const remaining = useCountdown(state.timerEndsAt);
  return (
    <div className="discussion" role="status">
      <span className="discussion__title">Pause for discussion</span>
      {state.timerEndsAt ? (
        <span className="mono discussion__timer">{remaining > 0 ? formatRemaining(remaining) : "Time"}</span>
      ) : null}
      <button type="button" className="btn btn--accent" onClick={() => dispatch({ type: "setDiscussion", active: false })}>
        Resume
      </button>
    </div>
  );
}

export function FrozenBadge() {
  return (
    <p className="frozen-badge" role="status">
      Motion frozen · press <kbd>.</kbd> to resume
    </p>
  );
}
