import { useEffect, useRef, useState } from "react";
import { openChannel, type ChannelMessage } from "../navigation";
import { chapterOf, SCENES } from "../story";
import { useCountdown } from "../useCountdown";
import { formatRemaining } from "../overlays/workshop";

/** Speaker view for a second screen, kept in sync with the presentation tab. */
export function NotesWindow() {
  const [position, setPosition] = useState<Extract<ChannelMessage, { type: "position" }> | null>(null);
  const [clock, setClock] = useState(() => new Date());
  const channel = useRef<BroadcastChannel | null>(null);
  const remaining = useCountdown(position?.timerEndsAt ?? null);

  useEffect(() => {
    document.title = "Speaker notes — Moonshot workshop";
    const ch = openChannel();
    channel.current = ch;
    if (!ch) return;
    ch.onmessage = (event: MessageEvent<ChannelMessage>) => {
      if (event.data.type === "position") setPosition(event.data);
    };
    ch.postMessage({ type: "hello" } satisfies ChannelMessage);
    const tick = setInterval(() => setClock(new Date()), 15_000);
    return () => {
      clearInterval(tick);
      ch.close();
    };
  }, []);

  const send = (command: "next" | "previous" | "freeze") =>
    channel.current?.postMessage({ type: "command", command } satisfies ChannelMessage);

  if (!position) {
    return (
      <main className="speaker speaker--waiting">
        <p>Waiting for the presentation tab… keep it open in the same browser.</p>
      </main>
    );
  }

  const scene = SCENES[position.sceneIndex] ?? SCENES[0];
  const beat = scene.beats[Math.min(position.beat, scene.beats.length - 1)];
  const next = scene.beats[position.beat + 1] ?? SCENES[position.sceneIndex + 1]?.beats[0];
  const chapter = chapterOf(scene);

  return (
    <main className="speaker">
      <header className="speaker__head">
        <span className="speaker__chapter">
          {chapter.number === "00" ? "Prologue" : chapter.number} · {chapter.number === "00" ? scene.title : chapter.title}
        </span>
        <span className="mono">{clock.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </header>
      <p className="speaker__now">
        Now: {beat.label}
        {beat.pause ? <span className="pause-badge">Workshop pause</span> : null}
      </p>
      <div className="speaker__notes">
        {scene.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </div>
      <footer className="speaker__foot">
        <span>{next ? `Next: ${next.label}` : "End of the presentation"}</span>
        {position.timerEndsAt ? <span className="mono">Timer {formatRemaining(remaining)}</span> : null}
        <span className="speaker__buttons">
          <button type="button" className="btn" onClick={() => send("previous")}>
            ‹ Previous
          </button>
          <button type="button" className="btn" aria-pressed={position.frozen} onClick={() => send("freeze")}>
            {position.frozen ? "Resume motion" : "Freeze"}
          </button>
          <button type="button" className="btn btn--accent" onClick={() => send("next")}>
            Next ›
          </button>
        </span>
      </footer>
    </main>
  );
}
