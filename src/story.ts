export type Brand = "siemens" | "omterra";

export type OverlayId =
  | "files"
  | "automation"
  | "prototype"
  | "language"
  | "constellation"
  | "fragments"
  | "intention"
  | "roles"
  | "engine"
  | "tension"
  | "workshop"
  | "candidates"
  | "invitation";

export interface Beat {
  /** Large on-screen lines. */
  lines: string[];
  /** Smaller supporting copy under the large lines. */
  sub?: string[];
  /** Small label above the lines, e.g. a role name. */
  eyebrow?: string;
  /** Keep the previous beats of this group on screen. */
  stack?: boolean;
  size?: "xl" | "lg" | "md";
  /** A workshop pause: presenter navigation stops here and never moves on by itself. */
  pause?: boolean;
  /** Short name for the presenter's stop list. */
  label: string;
}

export interface Scene {
  id: string;
  chapter: string;
  title: string;
  kicker: string;
  /** Clip id in public/media (both <id>.mp4 and <id>.jpg). */
  video?: string;
  brand: Brand;
  overlay?: OverlayId;
  beats: Beat[];
  notes: string[];
  layout?: "left" | "center" | "split";
  /** Scene contains form controls; on small screens it is laid out without pinning. */
  interactive?: boolean;
}

export interface Chapter {
  id: string;
  number: string;
  title: string;
  summary: string;
}

export const CHAPTERS: Chapter[] = [
  { id: "prologue", number: "00", title: "Prologue", summary: "The story from the Miro board" },
  { id: "signal", number: "01", title: "The signal", summary: "Work is fragmented" },
  { id: "shift", number: "02", title: "The shift", summary: "From navigation to intention" },
  { id: "moonshot", number: "03", title: "The moonshot", summary: "Work finds its moment" },
  { id: "engine", number: "04", title: "The engine", summary: "What is real underneath" },
  { id: "tension", number: "05", title: "The tension", summary: "Speed and trust" },
  { id: "workshop", number: "06", title: "The workshop", summary: "Questions we must answer" },
  { id: "choice", number: "07", title: "The choice", summary: "Pick a moonshot candidate" },
  { id: "invitation", number: "08", title: "The invitation", summary: "Begin the experiment" },
];

export const WORKSHOP_QUESTIONS = [
  "What decision or task are we trying to improve?",
  "Who owns the source record and the business rule?",
  "Who may see, decide, approve, and change it?",
  "How current must the information be?",
  "What is the full cost to build and operate it?",
  "What evidence would show that it worked?",
];

export const CANDIDATE_PLACEHOLDERS = ["market planning", "sales follow-up", "approval with context"];

export const SCENES: Scene[] = [
  {
    id: "prologue-arrival",
    chapter: "prologue",
    title: "A newcomer arrives",
    kicker: "Prologue · October 2025",
    video: "p1-arrival",
    brand: "siemens",
    beats: [
      { lines: ["October 2025."], size: "lg", label: "October 2025" },
      { lines: ["New team.", "Big ambition."], stack: true, size: "xl", label: "New team, big ambition" },
    ],
    notes: [
      "“I joined with plenty of ideas about modern business applications. The first thing I learned was how much knowledge already existed here—and how much effort it took to connect it.”",
      "From the Miro board: on the outside, a future-facing energy company. The newcomer carries a Salesforce sticker on the backpack and a rolled-up plan under the arm.",
    ],
  },
  {
    id: "prologue-inside",
    chapter: "prologue",
    title: "Inside",
    kicker: "Prologue · Inside",
    video: "p2-inside",
    brand: "siemens",
    overlay: "files",
    beats: [
      { lines: ["Many versions", "of the same answer."], size: "xl", label: "Many versions of the same answer" },
      {
        lines: [],
        sub: ["Talented people doing important work.", "The spreadsheets kept it moving."],
        stack: true,
        label: "Spreadsheets kept it moving",
      },
    ],
    notes: [
      "Keep this affectionate. Excel is a tool people use to keep work moving, not a joke at their expense.",
      "From the Miro board: “future company on the outside, old company on the inside.” Ask the room who has opened a file called FINAL (2) this month.",
    ],
  },
  {
    id: "prologue-steps",
    chapter: "prologue",
    title: "Useful but incremental",
    kicker: "Prologue · The early months",
    video: "p3-small-steps",
    brand: "siemens",
    overlay: "automation",
    beats: [
      { lines: ["First, we make", "a few steps easier."], size: "lg", label: "A few steps easier" },
      { lines: ["Then we see how many", "more steps there are."], stack: true, size: "lg", label: "How many more steps" },
    ],
    notes: [
      "“We improved parts of the journey. Those improvements mattered. They also showed us how much work still sat between an idea and something people could use.”",
      "McCoy: a first AI-assisted helper, a few automations powered by Excel. Small things that saved colleagues time.",
    ],
  },
  {
    id: "prologue-prototype",
    chapter: "prologue",
    title: "The tools change the pace",
    kicker: "Prologue · February 2026",
    video: "p4-prototype",
    brand: "siemens",
    overlay: "prototype",
    beats: [
      { lines: ["February 2026."], size: "lg", label: "February 2026" },
      {
        lines: ["The distance from idea", "to prototype gets shorter."],
        stack: true,
        size: "lg",
        label: "Idea to prototype gets shorter",
      },
      {
        lines: [],
        sub: ["A person still checks, tests and reshapes every result."],
        stack: true,
        label: "What we built",
      },
    ],
    notes: [
      "“The moment that changed my expectations came when an idea could become something tangible fast enough to discuss and improve with the people who needed it.”",
      "For me the turning point was February 2026, when the new coding models arrived (Claude Opus 4.6 and GPT-5.3 Codex). Keep it personal; no scoreboard.",
      "HTML presentations, coding agents in Salesforce, the GCO Planner, agent experiments and MEP (Market Evaluation Planner) were all built in these months. Progress was slower than the tools allowed because governance and IT reviews take time. That is design work, not a villain.",
    ],
  },
  {
    id: "prologue-language",
    chapter: "prologue",
    title: "A language nobody speaks yet",
    kicker: "Prologue · A new language",
    video: "p4-language",
    brand: "siemens",
    overlay: "language",
    beats: [
      { lines: ["The tools had", "a new language."], size: "lg", label: "A new language" },
      { lines: ["The work needed", "a shared one."], stack: true, size: "lg", label: "A shared one" },
    ],
    notes: [
      "“I could talk about agents, APIs, and orchestration for hours. The useful conversation began when we translated those words into problems everyone recognized.”",
      "From the Miro board: it sounded like someone speaking a language nobody understands. First people wore translation headphones; then some took them off because they understood. Others kept listening to their own music for a while. That is a normal difference in timing and needs.",
    ],
  },
  {
    id: "prologue-together",
    chapter: "prologue",
    title: "The idea spreads",
    kicker: "Prologue · The idea spreads",
    video: "p5-together",
    brand: "siemens",
    overlay: "constellation",
    beats: [
      { lines: ["More people saw", "what might be possible."], size: "lg", label: "More people saw it" },
      { lines: ["The question", "became ours."], stack: true, size: "xl", label: "The question became ours" },
    ],
    notes: [
      "“This stopped being one person's experiment. More people started asking what we could build for the work we do together. That is why we are here.”",
      "From here on the story belongs to the room. Other leaders arrived at the same ideas and brought their teams in; agents, HTML, APIs and automation became everyday language.",
    ],
  },
  {
    id: "signal",
    chapter: "signal",
    title: "Work is fragmented",
    kicker: "01 · The signal",
    video: "c01-fragments",
    brand: "siemens",
    overlay: "fragments",
    beats: [
      { lines: ["Every decision", "begins somewhere."], size: "lg", label: "Every decision begins somewhere" },
      {
        lines: ["The information needed to make it", "may be somewhere else."],
        stack: true,
        size: "md",
        label: "The information is somewhere else",
      },
      { lines: ["We have the data.", "We have the processes."], size: "lg", label: "We have the data" },
      {
        lines: ["The experience around them", "is still fragmented."],
        stack: true,
        size: "md",
        label: "Still fragmented",
      },
    ],
    notes: [
      "“Think of one decision your team made this week. How many places did you visit before you had enough context to make it?”",
      "Pause briefly. Do not ask for answers yet.",
    ],
  },
  {
    id: "shift",
    chapter: "shift",
    title: "From navigation to intention",
    kicker: "02 · The shift",
    video: "c02-intention",
    brand: "siemens",
    overlay: "intention",
    layout: "split",
    beats: [
      {
        lines: ["Today: find the screen,", "find the record,", "find the answer."],
        size: "md",
        label: "Today: find the screen",
      },
      { lines: ["Tomorrow: start with", "the question or action."], size: "lg", label: "Tomorrow: start with the question" },
      { lines: ["What changed in this market", "since our last review?"], eyebrow: "Future concept", size: "md", label: "Future concept" },
    ],
    notes: [
      "“This is a design proposition. It is not a claim that we have this product in production.”",
      "Point out the three trust markers on the answer: links back to the source records, an as-of time, and an explicit “Review before acting” step. Nothing is accessed without authorization.",
    ],
  },
  {
    id: "moonshot",
    chapter: "moonshot",
    title: "Work finds its moment",
    kicker: "03 · The moonshot",
    video: "c03-foundation",
    brand: "omterra",
    overlay: "roles",
    layout: "split",
    beats: [
      { lines: ["One trusted foundation.", "Many ways to work."], size: "lg", label: "One trusted foundation" },
      { lines: ["The next conversation,", "with the context that matters."], eyebrow: "Seller", size: "md", label: "Seller" },
      { lines: ["The wider picture,", "without assembling it by hand."], eyebrow: "Planner", size: "md", label: "Planner" },
      { lines: ["The decision, its evidence,", "and a clear audit trail."], eyebrow: "Approver", size: "md", label: "Approver" },
    ],
    notes: [
      "“The moonshot is a better flow of decisions across the organization. It is larger than any single AI assistant or app.”",
      "The central provocation: what if the business application came to the work, instead of making people go to the application?",
      "This is where Siemens Energy becomes Omterra in the header: the future company we are building together.",
    ],
  },
  {
    id: "engine",
    chapter: "engine",
    title: "What is real underneath",
    kicker: "04 · The engine",
    video: "c04-engine",
    brand: "omterra",
    overlay: "engine",
    layout: "split",
    beats: [
      { lines: ["The interface can change."], size: "lg", label: "The interface can change" },
      {
        lines: ["Ownership, permissions, and", "accountability cannot disappear."],
        stack: true,
        size: "md",
        label: "Ownership cannot disappear",
      },
      {
        lines: [],
        sub: ["Salesforce can remain the operational home for a record and its workflow."],
        stack: true,
        label: "Salesforce: operational home",
      },
      {
        lines: [],
        sub: ["Snowflake may support governed analysis across sources."],
        stack: true,
        label: "Snowflake: governed analysis",
      },
      {
        lines: [],
        sub: ["A new interface can bring the right view to the right task."],
        stack: true,
        label: "A new interface: the right view",
      },
    ],
    notes: [
      "“This is a candidate design pattern, not an architecture decision. Salesforce and Snowflake have distinct purposes and access models. A copied dataset does not automatically preserve Salesforce record permissions. Any write-back, identity, entitlements, latency, or licensing must be designed and validated.”",
      "From the Miro board: for years Salesforce pushed UI and low-code so non-technical users could change things. It is now moving toward no UI at all. Parker Harris talks about never logging in to Salesforce again: youtube.com/watch?v=wYFt9NCYaVI at 36:38. See also Salesforce Headless 360, AIforce (Dreamforce ’26) and Claudeforce.",
      "So how does Salesforce keep earning? Reading or changing data still needs an identity: a user licence, an integration user, API access. Opportunities, tasks and approvals still belong to individuals, so the flow stays tied to a user and their permissions even if the information is consumed elsewhere.",
      "Planners and strategists who only consume data may not need a full user licence: API, integration user, replication with Alteryx or Snowflake. Flag API consumption as a new cost model; do not promise savings. Limits and identity requirements depend on licence, edition and contract.",
    ],
  },
  {
    id: "tension",
    chapter: "tension",
    title: "Speed and trust",
    kicker: "05 · The tension",
    video: "c05-bridge",
    brand: "omterra",
    overlay: "tension",
    beats: [
      { lines: ["We can build ideas", "faster than before."], size: "lg", label: "Faster than before" },
      { lines: ["Can we make them", "trustworthy enough to use?"], stack: true, size: "lg", label: "Trustworthy enough to use?" },
      {
        lines: [],
        sub: ["Recent work in Salesforce apps, planners, presentations, and agent prototypes shows how quickly an idea can become tangible."],
        stack: true,
        label: "Evidence",
      },
    ],
    notes: [
      "“Prototypes accelerate learning. Production brings more questions: who owns it, who can use it, how is it tested, what does it cost, and how do we know it helps?”",
      "Speed, security, ownership, quality, cost and adoption are the principles we design with, not obstacles. On the Miro board: “After we talk about the future, with these principles.”",
    ],
  },
  {
    id: "workshop",
    chapter: "workshop",
    title: "Questions we must answer",
    kicker: "06 · The workshop",
    brand: "omterra",
    overlay: "workshop",
    layout: "split",
    interactive: true,
    beats: [
      {
        lines: ["A moonshot becomes useful when", "we ask difficult questions early."],
        size: "md",
        label: "Difficult questions early",
      },
      ...WORKSHOP_QUESTIONS.map((question, index) => ({
        lines: [question],
        eyebrow: `Question ${index + 1} of ${WORKSHOP_QUESTIONS.length}`,
        size: "md" as const,
        label: `Question ${index + 1}`,
      })),
      {
        lines: ["Pick one real workflow.", "Discuss the six questions."],
        sub: ["Pairs or small groups · 8–12 minutes"],
        eyebrow: "Pause for discussion",
        size: "md",
        pause: true,
        label: "Workshop pause",
      },
    ],
    notes: [
      "Allow 8–12 minutes. Ask pairs or small groups to pick one real workflow and discuss the six questions.",
      "Use “Pause for discussion” to freeze the screen. The 10-minute countdown only starts when you press it. Notes stay in this browser unless you export them; the presentation works fine if nobody types anything.",
    ],
  },
  {
    id: "choice",
    chapter: "choice",
    title: "Pick a moonshot candidate",
    kicker: "07 · The choice",
    video: "c07-choice",
    brand: "omterra",
    overlay: "candidates",
    layout: "split",
    interactive: true,
    beats: [
      { lines: ["Which workflow is", "worth testing first?"], size: "lg", label: "Which workflow first?" },
      {
        lines: [],
        sub: ["A real user.", "A clear owner.", "Accessible data.", "A measurable result."],
        stack: true,
        label: "Selection criteria",
      },
      {
        lines: [],
        sub: ["Name up to three candidates, place them, then select one together."],
        stack: true,
        pause: true,
        label: "Nominate candidates",
      },
    ],
    notes: [
      "Invite groups to nominate candidates. Enter up to three names locally, optionally place them by value to users and feasibility to test, then select one only if the room agrees.",
      "Never claim a vote or an agreement that did not happen. If nothing is selected, the closing screen says “Decision to be made together.”",
    ],
  },
  {
    id: "invitation",
    chapter: "invitation",
    title: "Begin the experiment",
    kicker: "08 · The invitation",
    video: "c08-invitation",
    brand: "omterra",
    overlay: "invitation",
    beats: [
      { lines: ["Imagine the future together."], size: "md", label: "Imagine together" },
      { lines: ["Choose one workflow."], stack: true, size: "md", label: "Choose one workflow" },
      { lines: ["Build a small version."], stack: true, size: "md", label: "Build a small version" },
      { lines: ["Learn from real use."], stack: true, size: "md", label: "Learn from real use" },
      { lines: ["What should we make", "possible first?"], size: "xl", label: "What should we make possible first?" },
    ],
    layout: "left",
    notes: [
      "“The moonshot is that work becomes clearer, faster, and more connected for the people doing it. Today we can choose one piece of that future to test.”",
    ],
  },
];

export function scenesInChapter(chapterId: string): Scene[] {
  return SCENES.filter((scene) => scene.chapter === chapterId);
}

export function chapterOf(scene: Scene): Chapter {
  const chapter = CHAPTERS.find((c) => c.id === scene.chapter);
  if (!chapter) throw new Error(`Scene ${scene.id} has unknown chapter ${scene.chapter}`);
  return chapter;
}

/** Scroll length of a scene's content, in viewport heights × 100. */
export function contentLength(scene: Scene): number {
  return Math.max(160, scene.beats.length * 95);
}
