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

const DOSSIERS = [
  {
    label: "故事背景",
    code: "CASE 01",
    title: "灰洄镇不会放人",
    body: "雾从旧疗养院的地下层向外翻涌，吞掉街灯、楼梯间和海岸线。你不是来逃出去的，你是来把被雾扣押的记忆一件件取回。",
    bullets: ["归潮街口是第一层入口", "旧疗养院是雾的源头", "每次下沉都会改写路线和补给"],
  },
  {
    label: "操作",
    code: "FIELD 02",
    title: "用光和声音活下去",
    body: "移动、手电、声呐和道具构成核心节奏。你越急，噪音越高；你越贪，电量越少。所有操作都服务于一个目标：在黑暗里判断方向。",
    bullets: ["WASD / 方向键移动，鼠标控制手电", "E 互动、解救、完成仪式", "Q 声呐扫描，1 药水护盾，2 十字架定身"],
  },
  {
    label: "下沉规则",
    code: "DEPTH 03",
    title: "越深越危险，也越值得",
    body: "每一层都是一个新的心理场景：更多怪物、更远目标、更复杂仪式。完成物证和信笺后，出口会显影；你可以撤离，也可以带着补给继续下沉。",
    bullets: ["层数越深，路线和怪物密度越高", "下沉会补充电池、药水和十字架", "最深层数会被保存为纪录"],
  },
  {
    label: "玩法策略",
    code: "TACTIC 04",
    title: "不要找箭头，找异常",
    body: "雾会误导视线，但不会抹掉痕迹。灰烬、水纹、收音机杂音、背影和弱光都在暗示目标方向。保留一次保命道具，比多拿一件物证更重要。",
    bullets: ["先听环境提示，再决定是否冲刺", "怪物逼近时用十字架争取距离", "电量低于 25% 时停止无意义照明"],
  },
];

const SURVIVAL_LOOP = ["侦听线索", "搜集物证", "完成仪式", "解救幸存者", "显影出口", "继续下沉"];

export default function Home() {
  const [mode, setMode] = useState<"title" | "new" | "continue">("title");
  const [hasSave, setHasSave] = useState(false);
  const [storyIndex, setStoryIndex] = useState(0);
  const [trackIndex, setTrackIndex] = useState(0);
  const [dossierIndex, setDossierIndex] = useState(0);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dossier = DOSSIERS[dossierIndex];

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

        <section className="title-command-deck" aria-label="launch controls">
          <div className="tape-deck">
            <span className="deck-label">NOW PLAYING</span>
            <strong>{TITLE_TRACKS[trackIndex].label}</strong>
            <span>{musicOn ? "磁带正在转动" : "磁带待机，按播放唤醒封面音轨"}</span>
          </div>

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
              切换磁带
            </button>
          </nav>
        </section>

        <a className="scroll-cue" href="#fog-archive">
          下滑读取雾档案
        </a>
      </section>

      <section id="fog-archive" className="archive-section" aria-label="fog archive">
        <div className="archive-visual" aria-hidden="true" />

        <div className="archive-terminal">
          <div className="archive-heading">
            <span>FOG ARCHIVE TERMINAL</span>
            <h2>下沉前简报</h2>
          </div>

          <div className="archive-tabs" role="tablist" aria-label="archive pages">
            {DOSSIERS.map((entry, index) => (
              <button
                key={entry.code}
                className={index === dossierIndex ? "is-active" : ""}
                onClick={() => setDossierIndex(index)}
                role="tab"
                type="button"
                aria-selected={index === dossierIndex}
              >
                <span>{entry.label}</span>
                <small>{entry.code}</small>
              </button>
            ))}
          </div>

          <article className="archive-page">
            <span>{dossier.code}</span>
            <h3>{dossier.title}</h3>
            <p>{dossier.body}</p>
            <ul>
              {dossier.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="protocol-board" aria-label="survival loop">
          <span>RUN LOOP</span>
          <h2>一局的核心玩法</h2>
          <ol>
            {SURVIVAL_LOOP.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>建议佩戴耳机。存档会记录你到达的最深层数和携带的道具。</p>
        </aside>
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
