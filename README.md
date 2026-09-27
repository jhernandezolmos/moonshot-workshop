# From Spreadsheets to Systems — scroll presentation

A local, scroll-driven version of the Moonshot talk. Each scene pins a silent
cinematic clip behind the text; the clip's playhead follows the scroll position
(forward and backward), and the copy appears beat by beat. The story follows
the Miro board: the journey from October 2025, the new language, McCoy, GCO
Planner, MEP and the coding agents in Salesforce, the shift away from UI, the
engine, the principles for tomorrow, and the open questions for the workshop.

The clips are pre-generated and bundled in `public/media/`. Nothing calls a
paid API or needs credentials while the presentation is open.

## GitLab Pages

The project is
[gs-s-go/moonshot_workshop](https://code.siemens-energy.com/gs-s-go/moonshot_workshop).
The presentation is
[https://moonshot-workshop-87f1c2.code.siemens-energy.io](https://moonshot-workshop-87f1c2.code.siemens-energy.io).

A push to `main` runs `.gitlab-ci.yml`. The `pages` job publishes `site/`
(the compiled app) together with the clips in `public/media`. The runner does
not install npm. After changing the app, rebuild that folder before pushing:

```bash
npm run pages:site
```

Asset URLs are relative, so the same build works on whatever Pages address
GitLab assigns.

That address is not the project page. The project page is the repository.
After the pipeline succeeds, the presentation link is listed in the project
under **Deploy > Pages**. The site is private, so opening it requires a
GitLab login with access to this project.

## Run it

```bash
cd "Moonshot PPT/presentation"
npm install
npm run dev          # http://localhost:5173
```

For the venue, use the production build (no dev tooling, same behavior):

```bash
npm run build
npm run preview      # http://localhost:4173
```

Chrome or Edge on a laptop connected to the projector works best. Close other
heavy tabs; the clips decode locally.

## Presenting

Scroll with a trackpad or mouse, or use the keyboard.

| Key | Action |
| --- | --- |
| → / ← | Next / previous stop (always) |
| Space, Shift+Space, PageDown, PageUp, ↓, ↑ | Next / previous stop (presenter mode, works with clickers) |
| P | Presenter mode on/off (controls bar at the bottom) |
| N | Notes drawer (presenter mode) |
| M | Chapter menu |
| F | Fullscreen |
| . | Freeze motion on the current frame |
| Esc | Close the menu or the notes drawer |

Shortcuts are ignored while typing in a field. The workshop pause beat never
auto-advances.

**Speaker window.** In presenter mode, "Speaker window" opens the notes in a
separate window (`?view=notes`). Drag it to the laptop screen and keep the
presentation fullscreen on the projector; both stay in sync.

**Readable version.** The "Readable version" button (top right) switches to a
linear page with still images and all text visible. The same version is used
automatically when the system asks for reduced motion. It is also the better
choice on a slow machine.

**Reload recovery.** The current scene is kept in the URL hash, so a reload
returns to the same place.

## Workshop notes and candidates

- Chapter 06 (the workshop) has the tools: a pause banner, a 10-minute
  timer, and a notes field.
- Chapter 07 (the choice) collects up to three candidate workflows, places
  them on a value/feasibility grid, and lets the room select one. The
  selection is carried into the closing scene (chapter 08). Until someone
  selects one, the closing reads "Decision to be made together."
- Notes and candidates are saved only in this browser (`localStorage`, key
  `moonshot-presentation:v1`). "Export notes" downloads a Markdown file
  (`moonshot-workshop-notes-YYYY-MM-DD.md`).
- To reset before a session, clear the site data in the browser or run
  `localStorage.removeItem("moonshot-presentation:v1")` in the console.

## Changing the content

- **Text, beats, notes, chapters:** `src/story.ts`. Each scene lists its
  `video` (a file name in `public/media/` without extension), `brand`
  (`siemens` or `omterra`, which drives the logo crossfade), optional
  `overlay`, beats, and speaker notes.
- **Overlays** (file chips, timeline, engine layers, candidates, and so on):
  `src/overlays/`.
- **Logos:** `public/brand/siemens-energy-white.svg` and
  `public/brand/omterra-wordmark.png`.

### Replacing or adding a clip

Encoded clips and posters live in `public/media/`. Replace the `.mp4` and the
matching `.jpg`, keep the file name, and push to `main`.

`npm run media` re-encodes a raw file from `../generated/raw/` (the sibling
folder in the local workshop workspace) into `public/media/`: a keyframe every
4 frames, no audio, 1920×1080, plus a poster. Reference the file name, without
an extension, from `src/story.ts`.

A scene without a clip falls back to a procedural background, and a clip that
fails to load falls back to its poster.

## Tests

```bash
npm test
```

Covers stop navigation and keyboard control, candidate selection, notes
export, and the readable version.
