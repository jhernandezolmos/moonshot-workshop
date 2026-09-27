import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";

export type Level = "lower" | "higher";

export interface Candidate {
  name: string;
  note: string;
  value?: Level;
  feasibility?: Level;
}

export interface AppState {
  presenter: boolean;
  readable: boolean;
  frozen: boolean;
  notesOpen: boolean;
  menuOpen: boolean;
  discussion: boolean;
  timerEndsAt: number | null;
  workshopNotes: string;
  candidates: Candidate[];
  selected: number | null;
}

export type Action =
  | { type: "togglePresenter" }
  | { type: "setReadable"; readable: boolean }
  | { type: "toggleFrozen" }
  | { type: "toggleNotes" }
  | { type: "setMenu"; open: boolean }
  | { type: "setDiscussion"; active: boolean }
  | { type: "startTimer"; minutes: number }
  | { type: "stopTimer" }
  | { type: "setWorkshopNotes"; notes: string }
  | { type: "updateCandidate"; index: number; patch: Partial<Candidate> }
  | { type: "select"; index: number | null };

const STORAGE_KEY = "moonshot-presentation:v1";
const PERSISTED: (keyof AppState)[] = ["presenter", "readable", "workshopNotes", "candidates", "selected", "timerEndsAt"];

const emptyCandidates = (): Candidate[] => [0, 1, 2].map(() => ({ name: "", note: "" }));

export function initialState(prefersReducedMotion: boolean): AppState {
  const base: AppState = {
    presenter: false,
    readable: prefersReducedMotion,
    frozen: false,
    notesOpen: false,
    menuOpen: false,
    discussion: false,
    timerEndsAt: null,
    workshopNotes: "",
    candidates: emptyCandidates(),
    selected: null,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<AppState> | null;
    if (!saved) return base;
    const merged = { ...base, ...saved };
    if (prefersReducedMotion) merged.readable = true;
    if (!Array.isArray(merged.candidates) || merged.candidates.length !== 3) merged.candidates = emptyCandidates();
    return merged;
  } catch {
    return base;
  }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "togglePresenter":
      return { ...state, presenter: !state.presenter, notesOpen: state.presenter ? false : state.notesOpen };
    case "setReadable":
      return { ...state, readable: action.readable };
    case "toggleFrozen":
      return { ...state, frozen: !state.frozen };
    case "toggleNotes":
      return { ...state, notesOpen: !state.notesOpen };
    case "setMenu":
      return { ...state, menuOpen: action.open };
    case "setDiscussion":
      return { ...state, discussion: action.active, frozen: action.active };
    case "startTimer":
      return { ...state, timerEndsAt: Date.now() + action.minutes * 60_000 };
    case "stopTimer":
      return { ...state, timerEndsAt: null };
    case "setWorkshopNotes":
      return { ...state, workshopNotes: action.notes };
    case "updateCandidate": {
      const candidates = state.candidates.map((c, i) => (i === action.index ? { ...c, ...action.patch } : c));
      const selectedStillNamed = state.selected === null || candidates[state.selected]?.name.trim() !== "";
      return { ...state, candidates, selected: selectedStillNamed ? state.selected : null };
    }
    case "select":
      return { ...state, selected: action.index };
  }
}

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function StateProvider({ prefersReducedMotion, children }: { prefersReducedMotion: boolean; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, prefersReducedMotion, initialState);

  const persisted = useMemo(
    () => JSON.stringify(Object.fromEntries(PERSISTED.map((key) => [key, state[key]]))),
    [state],
  );
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, persisted);
    } catch {
      // Private browsing can refuse storage; the presentation keeps working without it.
    }
  }, [persisted]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const state = useContext(StateContext);
  if (!state) throw new Error("useAppState must be used inside StateProvider");
  return state;
}

export function useDispatch(): Dispatch<Action> {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) throw new Error("useDispatch must be used inside StateProvider");
  return dispatch;
}

export function selectedCandidateName(state: AppState): string | null {
  if (state.selected === null) return null;
  const name = state.candidates[state.selected]?.name.trim();
  return name ? name : null;
}
