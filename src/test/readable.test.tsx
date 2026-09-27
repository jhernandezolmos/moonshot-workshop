import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SCENES } from "../story";
import { renderApp } from "./render";

describe("reduced motion and the readable version", () => {
  it("renders a linear, still version when the reader prefers reduced motion", () => {
    const { container } = renderApp({ reducedMotion: true });
    expect(document.documentElement.dataset.motion).toBe("reduced");
    expect(container.querySelector("video")).toBeNull();

    const beats = container.querySelectorAll(".beat");
    const total = SCENES.reduce((sum, scene) => sum + scene.beats.length, 0);
    expect(beats).toHaveLength(total);
    beats.forEach((beat) => expect(beat).toHaveClass("is-on"));

    const posters = container.querySelectorAll(".media img");
    expect(posters.length).toBe(SCENES.filter((s) => s.video).length);
  });

  it("keeps every chapter reachable as a heading", () => {
    renderApp({ reducedMotion: true });
    for (const scene of SCENES) {
      expect(screen.getByRole("heading", { level: 2, name: (name) => name.includes(scene.title) })).toBeInTheDocument();
    }
  });

  it("uses silent inline videos under the text in the cinematic version", () => {
    const { container } = renderApp();
    const videos = Array.from(container.querySelectorAll("video"));
    expect(videos.length).toBe(SCENES.filter((s) => s.video).length);
    videos.forEach((video) => {
      expect(video.muted).toBe(true);
      expect(video).toHaveAttribute("playsinline");
      expect(video.closest(".stage")?.querySelector(".stage__copy")).not.toBeNull();
    });
    // Only scenes near the reader load their clip.
    const loaded = videos.filter((v) => v.getAttribute("src"));
    expect(loaded.length).toBeGreaterThan(0);
    expect(loaded.length).toBeLessThan(videos.length);
  });

  it("lets the reader switch between the cinematic and readable versions", async () => {
    const user = userEvent.setup();
    const { container } = renderApp();
    await user.click(screen.getByRole("button", { name: "Readable version" }));
    expect(document.documentElement.dataset.motion).toBe("reduced");
    expect(container.querySelector("video")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Cinematic version" }));
    expect(document.documentElement.dataset.motion).toBe("full");
    expect(container.querySelector("video")).not.toBeNull();
  });
});
