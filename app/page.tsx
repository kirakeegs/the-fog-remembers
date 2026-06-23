"use client";

import { useEffect, useRef, useState } from "react";
import GameCanvas from "@/components/GameCanvas";

const TITLE_TRACKS = [
  { label: "归潮磁带", src: "/audio/silent.mp3" },
  { label: "疗养院磁带", src: "/audio/silent1.mp3" },
  { label: "破晓磁带", src: "/audio/silent2.mp3" },
];

const STORY_LINES = [
  "雾不是天气。它从灰洄镇旧疗养院的地下层升起，穿过锈蚀的铁门，把整座港镇拖进一场迟来的审判。",
  "你醒在归潮街口，手里只有一支快没电的手电。每一层都像某段记忆的遗址：公寓、医院、教堂、学校、海岸，还有没有尽头的更深处。",
  "找到物证，完成仪式，救下仍在雾里呼救的人。下沉越深，怪物越密，补给也会越多，直到你决定自己能走到哪里。",
  "出口不会用箭头标出来。听收音机、看灰烬、辨认水纹和微弱的光。雾会撒谎，但记忆总会留下方向。",
];

export default function Home() {
  const [mode, setMode] = useState<"title" | "new" | "continue">("title");
  const [hasSave, setHasSave] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setHasSave(typeof window !== "undefined" && GameHasSave());
  }, [mode]);

  useEffect(() => {
    if (mode !== "title") return;
    const id = window.setInterval(() => {
      setStoryIndex((value) => (value + 1) % STORY_LINES.length);
    }, 5200);
    return () => window.clearInterval(id);
  }, [mode]);

  // 仅在进入标题页或切换曲目时创建/销毁音频元素，避免每次开关都重建导致的竞态
  useEffect(() => {
    if (mode !== "title") return;

    const audio = new Audio(TITLE_TRACKS[trackIndex].src);
    audio.loop = true;
    audio.volume = 0.38;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [mode, trackIndex]);

  // 单独响应播放/暂停状态，作用在已存在的音频元素上
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicOn && mode === "title") {
      audio.play().catch(() => setMusicOn(false));
    } else {
      audio.pause();
    }
  }, [musicOn, mode, trackIndex]);

  const toggleMusic = () => setMusicOn((value) => !value);

  const nextTrack = () => {
    setTrackIndex((value) => (value + 1) % TITLE_TRACKS.length);
    setMusicOn(true);
  };

  if (mode !== "title") {
    return <GameCanvas continueRun={mode === "continue"} onExit={() => setMode("title")} />;
  }

  return (
    <main className="title-screen vignette">
      <div className="cover-scene" aria-hidden="true">
        <div className="cover-skyline" />
        <div className="cover-traffic cover-traffic-left">
          <span />
          <span />
          <span />
        </div>
        <div className="cover-traffic cover-traffic-right">
          <span />
          <span />
          <span />
        </div>
        <div className="cover-road" />
        <div className="cover-figure" />
        <div className="cover-fog cover-fog-a" />
        <div className="cover-fog cover-fog-b" />
        <div className="cover-ash" />
        <div className="cover-static" />
      </div>

      <section className="title-shell">
        <header className="title-hero">
          <p className="eyebrow">ORIGINAL PSYCHOLOGICAL HORROR / ENDLESS DESCENT</p>
          <h1>雾会记得</h1>
          <p className="subtitle">THE FOG REMEMBERS</p>
        </header>

        <section className="story-console" aria-label="story background">
          <div className="story-marker">CASE FILE {String(storyIndex + 1).padStart(2, "0")}</div>
          <p key={storyIndex}>{STORY_LINES[storyIndex]}</p>
        </section>

        <nav className="title-actions" aria-label="main actions">
          {hasSave && (
            <button className="ghost-button" onClick={() => setMode("continue")} type="button">
              继续下沉
            </button>
          )}
          <button className="primary-button" onClick={() => setMode("new")} type="button">
            坠入迷雾
          </button>
          <button className="ghost-button compact" onClick={toggleMusic} type="button">
            {musicOn ? "BGM 暂停" : "BGM 播放"}
          </button>
          <button className="ghost-button compact" onClick={nextTrack} type="button">
            {TITLE_TRACKS[trackIndex].label}
          </button>
        </nav>

        <section className="title-info-grid" aria-label="game information">
          <article className="info-block">
            <h2>操作</h2>
            <dl className="control-list">
              <dt>WASD / 方向键</dt>
              <dd>移动</dd>
              <dt>鼠标</dt>
              <dd>控制手电方向</dd>
              <dt>E</dt>
              <dd>互动、解救、完成仪式</dd>
              <dt>Q</dt>
              <dd>声呐扫描，会制造噪音</dd>
              <dt>1 / 2</dt>
              <dd>药水护盾 / 十字架定身</dd>
            </dl>
          </article>

          <article className="info-block">
            <h2>下沉规则</h2>
            <p>
              关卡会无限向下延伸。越深的层数会出现更多怪物、更长路线和更复杂的仪式；每次进入下一层时，
              雾也会吐出更多电池、药水和十字架，让你带着积累的资源继续冒险。
            </p>
          </article>
        </section>

        <footer className="title-footer">建议佩戴耳机。存档会记录你到达的最深层数和携带的道具。</footer>
      </section>
    </main>
  );
}

function GameHasSave(): boolean {
  try {
    return !!localStorage.getItem("fog-save-v1");
  } catch {
    return false;
  }
}
