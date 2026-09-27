import type { AppState } from "./state";
import { WORKSHOP_QUESTIONS } from "./story";

export function buildNotesExport(state: Pick<AppState, "workshopNotes" | "candidates" | "selected">, now = new Date()): string {
  const lines = [
    "# Moonshot workshop notes",
    "",
    `Exported ${now.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`,
    "",
    "## Questions we must answer",
    ...WORKSHOP_QUESTIONS.map((q, i) => `${i + 1}. ${q}`),
    "",
    "## Discussion notes",
    state.workshopNotes.trim() || "_No notes were recorded._",
    "",
    "## Moonshot candidates",
  ];

  const named = state.candidates
    .map((c, i) => ({ ...c, index: i }))
    .filter((c) => c.name.trim() !== "");
  if (named.length === 0) lines.push("_No candidates were named._");
  for (const c of named) {
    const placement = [
      c.value ? `value to users: ${c.value}` : null,
      c.feasibility ? `feasibility to test: ${c.feasibility}` : null,
    ].filter(Boolean);
    const selected = state.selected === c.index ? " — selected" : "";
    lines.push(`- **${c.name.trim()}**${selected}${placement.length ? ` (${placement.join(", ")})` : ""}`);
    if (c.note.trim()) lines.push(`  ${c.note.trim()}`);
  }
  if (named.length > 0 && state.selected === null) lines.push("", "Decision to be made together.");
  return `${lines.join("\n")}\n`;
}

export function downloadNotes(state: Pick<AppState, "workshopNotes" | "candidates" | "selected">): void {
  const blob = new Blob([buildNotesExport(state)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `moonshot-workshop-notes-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
