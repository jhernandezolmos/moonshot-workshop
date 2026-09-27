import { Fragment, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { engine } from "../engine";
import { chapterOf, contentLength, SCENES, type Beat, type Scene } from "../story";
import { Overlay } from "../overlays/Overlay";

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

interface SceneProps {
  scene: Scene;
  index: number;
  near: boolean;
  readable: boolean;
}

export function SceneView({ scene, index, near, readable }: SceneProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [beat, setBeat] = useState(0);
  const shownBeat = readable ? scene.beats.length - 1 : beat;
  const first = index === 0;
  const last = index === SCENES.length - 1;

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    return engine.register({
      id: scene.id,
      index,
      beats: scene.beats.length,
      section,
      stage,
      getVideo: () => videoRef.current,
      onBeat: setBeat,
    });
  }, [scene.id, scene.beats.length, index]);

  const style = {
    "--enter-len": first ? 0 : 100,
    "--exit-len": last ? 0 : 100,
    "--content-len": contentLength(scene),
  } as CSSProperties;

  const chapter = chapterOf(scene);
  const classes = [
    "scene",
    `scene--${scene.layout ?? "left"}`,
    `scene--${scene.id}`,
    scene.interactive ? "scene--interactive" : "",
    scene.video ? "" : "scene--procedural",
    first ? "scene--first" : "",
  ];

  return (
    <section
      id={scene.id}
      ref={sectionRef}
      className={classes.filter(Boolean).join(" ")}
      style={style}
      aria-labelledby={`${scene.id}-title`}
      data-brand={scene.brand}
    >
      <div className="stage" ref={stageRef} data-beat={shownBeat}>
        <SceneMedia scene={scene} near={near} readable={readable} videoRef={videoRef} />
        <div className="stage__shade" aria-hidden="true" />
        {scene.overlay ? <Overlay id={scene.overlay} beat={shownBeat} readable={readable} /> : null}
        <div className="stage__copy">
          <h2 id={`${scene.id}-title`} className="sr-only">
            {chapter.number === "00" ? "Prologue" : `Chapter ${chapter.number}, ${chapter.title}`}: {scene.title}
          </h2>
          <p className="kicker" aria-hidden="true">
            {scene.kicker}
          </p>
          <BeatGroups beats={scene.beats} active={shownBeat} readable={readable} />
        </div>
      </div>
    </section>
  );
}

function SceneMedia({
  scene,
  near,
  readable,
  videoRef,
}: {
  scene: Scene;
  near: boolean;
  readable: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}) {
  const [failed, setFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [requested, setRequested] = useState(near);
  if (near && !requested) setRequested(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !requested || !scene.video || readable) return;
    const url = media(`${scene.video}.mp4`);
    // Tests only need the address. The published host does not answer the
    // partial reads a scroll-scrub needs, so the clip is loaded whole and
    // marked as video even when the server sends a generic file type.
    if (import.meta.env.MODE === "test") {
      video.src = url;
      return;
    }
    let cancelled = false;
    let objectUrl = "";
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        const typed = blob.type.startsWith("video/") ? blob : new Blob([blob], { type: "video/mp4" });
        objectUrl = URL.createObjectURL(typed);
        video.src = objectUrl;
      })
      .catch(() => {
        if (!cancelled) video.src = url;
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [requested, readable, scene.video, videoRef]);

  if (!scene.video) return <div className="media media--procedural" aria-hidden="true" />;

  const poster = media(`${scene.video}.jpg`);
  if (readable || failed) {
    return (
      <div className="media" aria-hidden="true">
        {posterFailed ? null : <img className="media__el" src={poster} alt="" onError={() => setPosterFailed(true)} />}
      </div>
    );
  }

  return (
    <div className="media" aria-hidden="true">
      <video
        ref={videoRef}
        className="media__el"
        poster={poster}
        muted
        playsInline
        disablePictureInPicture
        preload="auto"
        tabIndex={-1}
        onLoadedData={(event) => {
          const video = event.currentTarget;
          const played = video.play?.();
          if (played && typeof played.then === "function") played.then(() => video.pause()).catch(() => undefined);
          engine.schedule();
        }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function groupsOf(beats: Beat[]): number[][] {
  const groups: number[][] = [];
  beats.forEach((beat, index) => {
    if (!beat.stack || groups.length === 0) groups.push([index]);
    else groups[groups.length - 1].push(index);
  });
  return groups;
}

function BeatGroups({ beats, active, readable }: { beats: Beat[]; active: number; readable: boolean }) {
  const groups = groupsOf(beats);
  return (
    <div className="beats">
      {groups.map((group) => {
        const groupOn = readable || group.includes(active);
        return (
          <div key={group[0]} className={`beat-group${groupOn ? " is-on" : ""}`}>
            {group.map((index) => (
              <BeatView key={index} beat={beats[index]} on={groupOn && (readable || index <= active)} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

function BeatView({ beat, on }: { beat: Beat; on: boolean }) {
  let word = 0;
  return (
    <div className={`beat beat--${beat.size ?? "md"}${on ? " is-on" : ""}${beat.pause ? " beat--pause" : ""}`}>
      {beat.eyebrow ? <p className="beat__eyebrow">{beat.eyebrow}</p> : null}
      {beat.lines.length > 0 ? (
        <p className="beat__lines">
          {beat.lines.map((line) => (
            <span className="line" key={line}>
              {line.split(" ").map((text, i) => (
                <Fragment key={`${text}-${i}`}>
                  <span className="word" style={{ "--w": word++ } as CSSProperties}>
                    {text}
                  </span>{" "}
                </Fragment>
              ))}
            </span>
          ))}
        </p>
      ) : null}
      {beat.sub ? (
        <p className="beat__sub">
          {beat.sub.map((line, i) => (
            <span className="sub-line" key={line} style={{ "--w": i } as CSSProperties}>
              {line}{" "}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
