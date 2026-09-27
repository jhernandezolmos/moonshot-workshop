import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildNotesExport } from "../exportNotes";
import type { Candidate } from "../state";
import { WORKSHOP_QUESTIONS } from "../story";
import { renderApp } from "./render";

const NOW = new Date("2026-09-26T09:40:00Z");
const empty = (): Candidate[] => [0, 1, 2].map(() => ({ name: "", note: "" }));

describe("notes export", () => {
  afterEach(() => vi.restoreAllMocks());

  it("lists the six questions and says when nothing was recorded", () => {
    const md = buildNotesExport({ workshopNotes: "  ", candidates: empty(), selected: null }, NOW);
    WORKSHOP_QUESTIONS.forEach((q, i) => expect(md).toContain(`${i + 1}. ${q}`));
    expect(md).toContain("_No notes were recorded._");
    expect(md).toContain("_No candidates were named._");
    expect(md).not.toContain("Decision to be made together.");
  });

  it("includes notes, candidate placement and the selection", () => {
    const candidates = empty();
    candidates[0] = { name: "Market plan briefing", note: "Planner team owns it", value: "higher", feasibility: "higher" };
    candidates[2] = { name: "Approval with context", note: "" };
    const md = buildNotesExport({ workshopNotes: "Workflow: quarterly planning", candidates, selected: 0 }, NOW);
    expect(md).toContain("Workflow: quarterly planning");
    expect(md).toContain("- **Market plan briefing** — selected (value to users: higher, feasibility to test: higher)");
    expect(md).toContain("  Planner team owns it");
    expect(md).toContain("- **Approval with context**");
    expect(md).not.toContain("Decision to be made together.");
  });

  it("never invents a decision: named candidates without a selection stay open", () => {
    const candidates = empty();
    candidates[1] = { name: "Sales follow-up", note: "" };
    const md = buildNotesExport({ workshopNotes: "", candidates, selected: null }, NOW);
    expect(md).toContain("Decision to be made together.");
    expect(md).not.toContain("selected");
  });

  it("downloads the notes typed in the workshop as a markdown file", async () => {
    const user = userEvent.setup();
    const createObjectURL = vi.fn((blob: Blob) => (blob.size > 0 ? "blob:notes" : ""));
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectURL });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    renderApp();
    await user.type(screen.getByLabelText("Discussion notes"), "Pick the planning workflow");
    await user.click(screen.getByRole("button", { name: "Export notes" }));

    expect(createObjectURL).toHaveBeenCalledOnce();
    const blob = createObjectURL.mock.calls[0][0];
    expect(blob.type).toBe("text/markdown;charset=utf-8");
    expect(await blob.text()).toContain("Pick the planning workflow");
    const link = click.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toMatch(/^moonshot-workshop-notes-\d{4}-\d{2}-\d{2}\.md$/);
  });

  it("keeps workshop notes in this browser only", async () => {
    const user = userEvent.setup();
    renderApp();
    expect(screen.getByText("Notes stay in this browser unless you export them.")).toBeInTheDocument();
    await user.type(screen.getByLabelText("Discussion notes"), "Local only");
    expect(JSON.parse(localStorage.getItem("moonshot-presentation:v1") ?? "{}").workshopNotes).toBe("Local only");
  });
});
