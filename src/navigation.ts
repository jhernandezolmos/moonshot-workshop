import { useSyncExternalStore } from "react";
import { engine, type Stop } from "./engine";
import { SCENES } from "./story";

export function useEngineState() {
  return useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
}

function prefersInstant(): boolean {
  return document.documentElement.dataset.motion === "reduced";
}

export function scrollToY(y: number): void {
  window.scrollTo({ top: Math.max(0, y), behavior: prefersInstant() ? "auto" : "smooth" });
}

export function nextStop(stops: Stop[] = engine.getStops()): Stop | undefined {
  const y = window.scrollY;
  return stops.find((stop) => stop.y > y + 4);
}

export function previousStop(stops: Stop[] = engine.getStops()): Stop | undefined {
  const y = window.scrollY;
  return [...stops].reverse().find((stop) => stop.y < y - 4);
}

export function goNext(): void {
  const stop = nextStop();
  if (stop) scrollToY(stop.y);
}

export function goPrevious(): void {
  const stop = previousStop();
  scrollToY(stop ? stop.y : 0);
}

export function goToScene(sceneId: string): void {
  const index = SCENES.findIndex((scene) => scene.id === sceneId);
  const stop = engine.getStops().find((s) => s.sceneIndex === index);
  if (stop) scrollToY(index === 0 ? 0 : stop.y);
  else document.getElementById(sceneId)?.scrollIntoView({ behavior: prefersInstant() ? "auto" : "smooth" });
}

export function goToChapter(chapterId: string): void {
  const scene = SCENES.find((s) => s.chapter === chapterId);
  if (scene) goToScene(scene.id);
}

/** Keeps the current scene in the URL so a reload or a shared link lands in the same place. */
export function rememberScene(sceneId: string): void {
  const hash = `#${sceneId}`;
  if (window.location.hash !== hash) history.replaceState(null, "", hash);
}

export function restoreScene(): void {
  const id = window.location.hash.slice(1);
  if (!id || window.scrollY > 0 || !SCENES.some((scene) => scene.id === id)) return;
  goToSceneInstant(id);
}

function goToSceneInstant(sceneId: string): void {
  const index = SCENES.findIndex((scene) => scene.id === sceneId);
  const stop = engine.getStops().find((s) => s.sceneIndex === index);
  if (stop) window.scrollTo({ top: stop.y, behavior: "auto" });
}

export const CHANNEL_NAME = "moonshot-presenter";

export type ChannelMessage =
  | { type: "position"; sceneIndex: number; beat: number; frozen: boolean; timerEndsAt: number | null }
  | { type: "command"; command: "next" | "previous" | "freeze" }
  | { type: "hello" };

export function openChannel(): BroadcastChannel | null {
  return typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(CHANNEL_NAME);
}
