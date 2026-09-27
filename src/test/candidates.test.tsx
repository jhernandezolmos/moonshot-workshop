import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderApp } from "./render";

const closingScene = () => document.getElementById("invitation") as HTMLElement;
const card = (n: number) => screen.getByLabelText(`Candidate ${n}`).closest(".candidate") as HTMLElement;

describe("moonshot candidates", () => {
  it("closes with 'Decision to be made together.' when nothing is selected", () => {
    renderApp();
    expect(within(closingScene()).getByText("Decision to be made together.")).toBeInTheDocument();
    expect(screen.getByText("No selection yet. Decision to be made together.")).toHaveAttribute("role", "status");
  });

  it("cannot select or place a candidate before it has a name", () => {
    renderApp();
    expect(within(card(1)).getByRole("button", { name: "Select for the close" })).toBeDisabled();
    expect(within(card(1)).getAllByRole("button", { name: "higher" })[0]).toBeDisabled();
  });

  it("carries the selected candidate into the closing scene", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText("Candidate 2"), "Market plan briefing");
    await user.click(within(card(2)).getByRole("button", { name: "Select for the close" }));

    expect(within(card(2)).getByRole("button", { name: "Selected · clear" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Selected: Market plan briefing. It will open the closing scene.")).toBeInTheDocument();
    expect(within(closingScene()).getByText("First possible experiment")).toBeInTheDocument();
    expect(within(closingScene()).getByText("Market plan briefing")).toBeInTheDocument();
    expect(within(closingScene()).queryByText("Decision to be made together.")).not.toBeInTheDocument();
  });

  it("returns to an open decision when the selection is cleared or its name is erased", async () => {
    const user = userEvent.setup();
    renderApp();
    const name = screen.getByLabelText("Candidate 1");
    await user.type(name, "Approval with context");
    await user.click(within(card(1)).getByRole("button", { name: "Select for the close" }));
    await user.click(within(card(1)).getByRole("button", { name: "Selected · clear" }));
    expect(within(closingScene()).getByText("Decision to be made together.")).toBeInTheDocument();

    await user.click(within(card(1)).getByRole("button", { name: "Select for the close" }));
    fireEvent.change(name, { target: { value: "" } });
    expect(within(closingScene()).getByText("Decision to be made together.")).toBeInTheDocument();
  });

  it("places named candidates on the value and feasibility matrix", async () => {
    const user = userEvent.setup();
    renderApp();
    await user.type(screen.getByLabelText("Candidate 3"), "Sales follow-up");
    const levels = within(card(3));
    await user.click(within(levels.getByRole("group", { name: "Value to users" })).getByRole("button", { name: "higher" }));
    await user.click(within(levels.getByRole("group", { name: "Feasibility to test" })).getByRole("button", { name: "lower" }));

    const dot = document.querySelector(".matrix__dot") as HTMLElement;
    expect(dot).toHaveTextContent("Sales follow-up");
    expect(dot.style.getPropertyValue("--mx")).toBe("25%");
    expect(dot.style.getPropertyValue("--my")).toBe("25%");
  });

  it("keeps candidates and the selection after a reload", async () => {
    const user = userEvent.setup();
    const first = renderApp();
    await user.type(screen.getByLabelText("Candidate 1"), "Service renewal brief");
    await user.click(within(card(1)).getByRole("button", { name: "Select for the close" }));
    first.unmount();

    renderApp();
    expect(screen.getByLabelText("Candidate 1")).toHaveValue("Service renewal brief");
    expect(within(closingScene()).getByText("Service renewal brief")).toBeInTheDocument();
  });
});
