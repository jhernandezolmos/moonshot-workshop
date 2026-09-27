import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { engine, ScrollEngine, type SceneHandle } from "../engine";
import { nextStop, previousStop } from "../navigation";
import { renderApp } from "./render";

const VH = 1000;

function setScrollY(y: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
}

/** A fake pinned scene laid out at a fixed document position. */
function fakeScene(id: string, index: number, docTop: number, height: number, beats: number, onBeat = vi.fn()): SceneHandle {
  const section = document.createElement("section");
  const stage = document.createElement("div");
  section.getBoundingClientRect = () => {
    const top = docTop - window.scrollY;
    return { top, bottom: top + height, height, left: 0, right: 0, width: 0, x: 0, y: top, toJSON: () => ({}) };
  };
  Object.defineProperty(stage, "clientHeight", { configurable: true, value: VH });
  return { id, index, beats, section, stage, getVideo: () => null, onBeat };
}

describe("scroll stops", () => {
  let computed: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    Object.defineProperty(window, "innerHeight", { configurable: true, value: VH });
    computed = vi.spyOn(window, "getComputedStyle").mockReturnValue({ position: "sticky" } as CSSStyleDeclaration);
    setScrollY(0);
  });

  afterEach(() => computed.mockRestore());

  // Scene A: no enter window, 3000px of content, 1000px exit.
  // Scene B overlaps A by two viewports: 1000px slide-in, 1000px crossfade, then 2000px of content.
  function twoScenes(onBeatA = vi.fn(), onBeatB = vi.fn()) {
    const e = new ScrollEngine();
    e.register(fakeScene("a", 0, 0, 5000, 3, onBeatA));
    e.register(fakeScene("b", 1, 3000, 4000, 2, onBeatB));
    return e;
  }

  it("places one stop per beat inside each scene's content window", () => {
    const stops = twoScenes().getStops();
    expect(stops.map((s) => [s.sceneIndex, s.beat, s.y])).toEqual([
      [0, 0, 0],
      [0, 1, 1450],
      [0, 2, 2450],
      [1, 0, 4450],
      [1, 1, 5450],
    ]);
  });

  it("moves forward and backward one stop at a time", () => {
    const stops = twoScenes().getStops();
    setScrollY(0);
    expect(nextStop(stops)?.y).toBe(1450);
    expect(previousStop(stops)).toBeUndefined();
    setScrollY(2450);
    expect(nextStop(stops)).toMatchObject({ sceneIndex: 1, beat: 0 });
    setScrollY(4450);
    expect(previousStop(stops)).toMatchObject({ sceneIndex: 0, beat: 2 });
    setScrollY(5450);
    expect(nextStop(stops)).toBeUndefined();
  });

  it("reports beats and the active scene as the reader scrolls, in both directions", () => {
    const onBeatA = vi.fn();
    const onBeatB = vi.fn();
    const e = twoScenes(onBeatA, onBeatB);
    const tick = () => (e as unknown as { tick: () => void }).tick();

    setScrollY(1450);
    tick();
    expect(onBeatA).toHaveBeenLastCalledWith(1);
    expect(e.getState()).toEqual({ activeIndex: 0, activeBeat: 1 });

    setScrollY(4450);
    tick();
    expect(onBeatB).toHaveBeenLastCalledWith(0);
    expect(e.getState().activeIndex).toBe(1);

    setScrollY(450);
    tick();
    expect(onBeatA).toHaveBeenLastCalledWith(0);
    expect(e.getState()).toEqual({ activeIndex: 0, activeBeat: 0 });
  });

  it("crossfades the incoming stage only after it has slid into place", () => {
    const e = twoScenes();
    const tick = () => (e as unknown as { tick: () => void }).tick();
    const stageB = (e as unknown as { scenes: SceneHandle[] }).scenes[1].stage;

    setScrollY(2500);
    tick();
    expect(stageB.style.getPropertyValue("--enter")).toBe("0.0000");

    setScrollY(3500);
    tick();
    expect(stageB.style.getPropertyValue("--enter")).toBe("0.5000");

    setScrollY(4000);
    tick();
    expect(stageB.style.getPropertyValue("--enter")).toBe("1.0000");
  });
});

describe("keyboard navigation", () => {
  const STOPS = [
    { sceneIndex: 0, beat: 0, y: 0 },
    { sceneIndex: 0, beat: 1, y: 800 },
    { sceneIndex: 1, beat: 0, y: 2400 },
    { sceneIndex: 6, beat: 0, y: 9000 },
  ];

  beforeEach(() => {
    setScrollY(0);
    vi.spyOn(engine, "getStops").mockReturnValue(STOPS);
  });

  afterEach(() => vi.restoreAllMocks());

  it("advances to the next stop with the right arrow", () => {
    renderApp();
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: "smooth" });
  });

  it("goes back with the left arrow", () => {
    renderApp();
    setScrollY(2400);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: "smooth" });
  });

  it("only uses the down arrow and Page Down for stops in presenter mode", () => {
    renderApp();
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(window.scrollTo).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "p" });
    expect(screen.getByRole("region", { name: "Presenter controls" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "PageDown" });
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: "smooth" });
  });

  it("does not navigate while the presenter is typing", () => {
    renderApp();
    const input = screen.getByLabelText("Candidate 1");
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("jumps straight to a chapter from the chapter menu", () => {
    renderApp();
    fireEvent.keyDown(window, { key: "m" });
    const dialog = screen.getByRole("dialog", { name: "Chapter menu" });
    fireEvent.click(within(dialog).getByRole("button", { name: /01\s*The signal/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 9000, behavior: "smooth" });
  });
});
