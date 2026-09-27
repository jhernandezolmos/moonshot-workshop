export interface SceneHandle {
  id: string;
  index: number;
  beats: number;
  section: HTMLElement;
  stage: HTMLElement;
  getVideo: () => HTMLVideoElement | null;
  onBeat: (beat: number) => void;
}

export interface EngineState {
  activeIndex: number;
  activeBeat: number;
}

export interface Stop {
  sceneIndex: number;
  beat: number;
  y: number;
}

interface SceneMetrics {
  top: number;
  height: number;
  vh: number;
  enterLen: number;
  exitLen: number;
  pinned: boolean;
}

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Seeking a video is asynchronous; easing toward the scroll target and never
// issuing a new seek while one is pending keeps scrubbing smooth.
const SCRUB_EASE = 0.22;

export class ScrollEngine {
  private scenes: SceneHandle[] = [];
  private beats = new Map<string, number>();
  private videoTimes = new Map<string, number>();
  private listeners = new Set<() => void>();
  private frame = 0;
  private started = false;
  private state: EngineState = { activeIndex: 0, activeBeat: 0 };

  linear = false;
  frozen = false;

  register(handle: SceneHandle): () => void {
    this.scenes = [...this.scenes.filter((s) => s.id !== handle.id), handle].sort((a, b) => a.index - b.index);
    this.schedule();
    return () => {
      this.scenes = this.scenes.filter((s) => s !== handle);
      this.beats.delete(handle.id);
      this.videoTimes.delete(handle.id);
    };
  }

  start(): () => void {
    if (this.started) return () => undefined;
    this.started = true;
    const onScroll = () => this.schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    this.schedule();
    return () => {
      this.started = false;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    };
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = (): EngineState => this.state;

  setFrozen(frozen: boolean): void {
    this.frozen = frozen;
    if (!frozen) this.schedule();
  }

  setLinear(linear: boolean): void {
    this.linear = linear;
    this.beats.clear();
    this.schedule();
  }

  schedule(): void {
    if (this.frame || typeof window === "undefined") return;
    this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      this.tick();
    });
  }

  private metrics(index: number): SceneMetrics {
    const scene = this.scenes[index];
    const rect = scene.section.getBoundingClientRect();
    const vh = scene.stage.clientHeight || window.innerHeight;
    const pinned = !this.linear && getComputedStyle(scene.stage).position === "sticky";
    const prev = this.scenes[index - 1]?.section.getBoundingClientRect();
    const next = this.scenes[index + 1]?.section.getBoundingClientRect();
    const overlapPrev = prev ? Math.max(0, prev.bottom - rect.top) : 0;
    const overlapNext = next ? Math.max(0, rect.bottom - next.top) : 0;
    return {
      top: rect.top,
      height: rect.height,
      vh,
      pinned,
      // The first viewport of an overlap is spent sliding in while fully transparent.
      enterLen: Math.max(0, overlapPrev - vh),
      exitLen: Math.max(0, overlapNext - vh),
    };
  }

  private tick(): void {
    const vh = window.innerHeight;
    let activeIndex = 0;
    let animating = false;

    this.scenes.forEach((scene, index) => {
      const m = this.metrics(index);
      const scrolled = -m.top;
      const total = Math.max(1, m.height - m.vh);
      const visible = m.top < vh && m.top + m.height > 0;
      const enter = m.enterLen > 0 ? clamp(scrolled / m.enterLen) : 1;
      const contentLen = Math.max(1, total - m.enterLen - m.exitLen);
      const content = clamp((scrolled - m.enterLen) / contentLen);
      const exit = m.exitLen > 0 ? clamp((scrolled - (total - m.exitLen)) / m.exitLen) : 0;

      if (m.pinned ? scrolled >= m.enterLen * 0.5 : m.top <= vh * 0.45) activeIndex = index;
      if (this.frozen || !visible) return;

      const style = scene.stage.style;
      style.setProperty("--enter", enter.toFixed(4));
      style.setProperty("--p", content.toFixed(4));
      style.setProperty("--exit", exit.toFixed(4));

      const beat = !m.pinned ? scene.beats - 1 : content >= 1 ? scene.beats - 1 : Math.floor(content * scene.beats);
      if (this.beats.get(scene.id) !== beat) {
        this.beats.set(scene.id, beat);
        scene.onBeat(beat);
      }

      const video = scene.getVideo();
      if (video && m.pinned && video.readyState >= 1 && Number.isFinite(video.duration)) {
        const target = clamp(scrolled / total) * Math.max(0, video.duration - 0.05);
        const current = this.videoTimes.get(scene.id) ?? target;
        const diff = target - current;
        const next = Math.abs(diff) < 0.004 ? target : current + diff * SCRUB_EASE;
        this.videoTimes.set(scene.id, next);
        if (!video.seeking && Math.abs(video.currentTime - next) > 0.015) video.currentTime = next;
        if (next !== target) animating = true;
      }
    });

    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - vh);
    doc.style.setProperty("--story", clamp(window.scrollY / max).toFixed(4));

    const activeBeat = this.beats.get(this.scenes[activeIndex]?.id ?? "") ?? 0;
    if (activeIndex !== this.state.activeIndex || activeBeat !== this.state.activeBeat) {
      this.state = { activeIndex, activeBeat };
      this.listeners.forEach((listener) => listener());
    }
    if (animating) this.schedule();
  }

  /** Scroll positions (document coordinates) where each beat is fully on screen. */
  getStops(): Stop[] {
    const stops: Stop[] = [];
    this.scenes.forEach((scene, index) => {
      const m = this.metrics(index);
      const docTop = m.top + window.scrollY;
      if (!m.pinned) {
        stops.push({ sceneIndex: index, beat: scene.beats - 1, y: Math.max(0, docTop - 1) });
        return;
      }
      const contentLen = Math.max(1, m.height - m.vh - m.enterLen - m.exitLen);
      for (let beat = 0; beat < scene.beats; beat++) {
        // The opening beat is already showing at the very top of the page.
        const offset = index === 0 && beat === 0 ? 0 : ((beat + 0.45) / scene.beats) * contentLen;
        stops.push({ sceneIndex: index, beat, y: Math.round(docTop + m.enterLen + offset) });
      }
    });
    return stops;
  }

  currentStopIndex(stops: Stop[] = this.getStops()): number {
    const y = window.scrollY;
    let current = 0;
    stops.forEach((stop, index) => {
      if (stop.y <= y + 4) current = index;
    });
    return current;
  }
}

export const engine = new ScrollEngine();
