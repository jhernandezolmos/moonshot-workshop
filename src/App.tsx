import { useCallback, useEffect, useRef } from "react";
import { engine } from "./engine";
import {
  goNext,
  goPrevious,
  goToScene,
  openChannel,
  rememberScene,
  restoreScene,
  useEngineState,
  type ChannelMessage,
} from "./navigation";
import { useAppState, useDispatch } from "./state";
import { SCENES } from "./story";
import { ChapterMenu, DiscussionBanner, FrozenBadge, NotesPanel, PresenterHud, TopBar, toggleFullscreen } from "./components/Chrome";
import { SceneView } from "./components/Scene";

function isTyping(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']") !== null;
}

export function App() {
  const state = useAppState();
  const dispatch = useDispatch();
  const { activeIndex, activeBeat } = useEngineState();
  const restored = useRef(false);
  const position = useRef({ activeIndex, activeBeat, frozen: state.frozen, timerEndsAt: state.timerEndsAt });
  position.current = { activeIndex, activeBeat, frozen: state.frozen, timerEndsAt: state.timerEndsAt };

  useEffect(() => engine.start(), []);

  useEffect(() => {
    document.documentElement.dataset.motion = state.readable ? "reduced" : "full";
    engine.setLinear(state.readable);
  }, [state.readable]);

  useEffect(() => {
    document.documentElement.dataset.frozen = String(state.frozen);
    engine.setFrozen(state.frozen);
  }, [state.frozen]);

  useEffect(() => {
    document.documentElement.dataset.presenter = String(state.presenter);
  }, [state.presenter]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      restoreScene();
      restored.current = true;
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (restored.current) rememberScene(SCENES[activeIndex].id);
  }, [activeIndex]);

  const toggleReadable = useCallback(() => {
    const sceneId = SCENES[position.current.activeIndex].id;
    dispatch({ type: "setReadable", readable: !state.readable });
    requestAnimationFrame(() => requestAnimationFrame(() => goToScene(sceneId)));
  }, [dispatch, state.readable]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const onControl = e.target instanceof HTMLElement && e.target.closest("button, a, summary") !== null;
      switch (e.key) {
        case "Escape":
          if (state.menuOpen) dispatch({ type: "setMenu", open: false });
          else if (state.notesOpen) dispatch({ type: "toggleNotes" });
          return;
        case "p":
        case "P":
          dispatch({ type: "togglePresenter" });
          return;
        case "f":
        case "F":
          toggleFullscreen();
          return;
        case "m":
        case "M":
          dispatch({ type: "setMenu", open: !state.menuOpen });
          return;
        case "n":
        case "N":
          if (state.presenter) dispatch({ type: "toggleNotes" });
          return;
        case ".":
          dispatch({ type: "toggleFrozen" });
          return;
      }
      if (state.menuOpen) return;
      const space = e.key === " " && !onControl;
      const forward = e.key === "ArrowRight" || (state.presenter && (e.key === "ArrowDown" || e.key === "PageDown" || (space && !e.shiftKey)));
      const back = e.key === "ArrowLeft" || (state.presenter && (e.key === "ArrowUp" || e.key === "PageUp" || (space && e.shiftKey)));
      if (forward) {
        e.preventDefault();
        goNext();
      } else if (back) {
        e.preventDefault();
        goPrevious();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dispatch, state.menuOpen, state.notesOpen, state.presenter]);

  const channel = useRef<BroadcastChannel | null>(null);
  useEffect(() => {
    const ch = openChannel();
    channel.current = ch;
    if (!ch) return;
    ch.onmessage = (event: MessageEvent<ChannelMessage>) => {
      const msg = event.data;
      if (msg.type === "hello") {
        const p = position.current;
        ch.postMessage({ type: "position", sceneIndex: p.activeIndex, beat: p.activeBeat, frozen: p.frozen, timerEndsAt: p.timerEndsAt });
      } else if (msg.type === "command") {
        if (msg.command === "next") goNext();
        if (msg.command === "previous") goPrevious();
        if (msg.command === "freeze") dispatch({ type: "toggleFrozen" });
      }
    };
    return () => {
      ch.close();
      channel.current = null;
    };
  }, [dispatch]);

  useEffect(() => {
    channel.current?.postMessage({
      type: "position",
      sceneIndex: activeIndex,
      beat: activeBeat,
      frozen: state.frozen,
      timerEndsAt: state.timerEndsAt,
    } satisfies ChannelMessage);
  }, [activeIndex, activeBeat, state.frozen, state.timerEndsAt]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to the story
      </a>
      <TopBar onToggleReadable={toggleReadable} />
      <main id="main" className="story">
        {SCENES.map((scene, index) => (
          <SceneView
            key={scene.id}
            scene={scene}
            index={index}
            near={Math.abs(index - activeIndex) <= 2}
            readable={state.readable}
          />
        ))}
      </main>
      {state.presenter ? <PresenterHud /> : null}
      {state.presenter && state.notesOpen ? <NotesPanel /> : null}
      {state.menuOpen ? <ChapterMenu /> : null}
      {state.discussion ? <DiscussionBanner /> : null}
      {state.frozen && !state.discussion ? <FrozenBadge /> : null}
    </>
  );
}
