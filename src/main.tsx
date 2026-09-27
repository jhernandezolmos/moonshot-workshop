import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource-variable/geist";
import "./styles.css";
import { App } from "./App";
import { NotesWindow } from "./components/NotesWindow";
import { StateProvider } from "./state";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

const speakerView = new URLSearchParams(window.location.search).get("view") === "notes";
const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

createRoot(root).render(
  <StrictMode>
    {speakerView ? (
      <NotesWindow />
    ) : (
      <StateProvider prefersReducedMotion={prefersReducedMotion}>
        <App />
      </StateProvider>
    )}
  </StrictMode>,
);
