import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  Series,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  CalculateMetadataFunction,
  staticFile,
} from 'remotion';
import {getAudioDurationInSeconds} from '@remotion/media-utils';

/* ------------------------------------------------------------------ */
/* THEME - edit colors / font here to match your reference channel     */
/* ------------------------------------------------------------------ */
export const theme = {
  stroke: '#ffffff',
  accent: '#ffd93d', // active subtitle word + headline
  cyan: '#00e5ff',
  magenta: '#ff4fd8',
  font: '"Arial Black", Impact, sans-serif',
  bgs: {
    space: ['#050816', '#1a1050'],
    deepblue: ['#06142e', '#0b4f8a'],
    dusk: ['#1b0f3b', '#a63d6f'],
    teal: ['#02131a', '#0f766e'],
  } as Record<string, string[]>,
};

/* ------------------------------------------------------------------ */
/* TYPES                                                               */
/* ------------------------------------------------------------------ */
export type Pose =
  | 'idle'
  | 'shocked'
  | 'thinking'
  | 'pointing'
  | 'walking'
  | 'floating'
  | 'celebrate';

export type IconName =
  | 'earth'
  | 'moon'
  | 'sun'
  | 'rocket'
  | 'ufo'
  | 'alien'
  | 'clock'
  | 'blackhole'
  | 'star'
  | 'atom'
  | 'planet'
  | 'lightbulb';

// Names map to public/audio/sfx_<name>.wav and music_<name>.wav,
// created by `node generate-audio.mjs`.
export type SfxName =
  | 'whoosh'
  | 'ticking'
  | 'boom'
  | 'sparkle'
  | 'riser'
  | 'pop'
  | 'alien'
  | 'beep';

export type MusicName = 'mysterious' | 'epic' | 'curious' | 'calm';

export type SceneProps = {
  narration: string;
  headline: string;
  pose: Pose;
  icons: IconName[];
  bg: string;
  voiceUrl: string;
  sfx?: SfxName;
  durationInFrames?: number;
  scene?: number;
  visual?: string;
  camera?: string;
  character_action?: string;
  motion?: string;
  visual_elements?: string[];
  transition_in?: string;
  transition_out?: string;
  highlight?: string;
};

export type ScienceStickProps = {
  title: string;
  scenes: SceneProps[];
  music?: MusicName;
};

const FPS = 30;
const PAD_SEC = 0.5; // silence after each narration line

/* ------------------------------------------------------------------ */
/* DURATION = length of each voiceover (so audio/visuals stay in sync) */
/* ------------------------------------------------------------------ */
export const calculateScienceMetadata: CalculateMetadataFunction<
  ScienceStickProps
> = async ({props}) => {
  const scenes = await Promise.all(
    props.scenes.map(async (s) => {
      if (!s.voiceUrl) return {...s, durationInFrames: 90};
      const sec = await getAudioDurationInSeconds(s.voiceUrl);
      return {...s, durationInFrames: Math.max(45, Math.ceil((sec + PAD_SEC) * FPS))};
    }),
  );
  const total = scenes.reduce((a, s) => a + (s.durationInFrames ?? 0), 0);
  return {
    durationInFrames: Math.max(30, total),
    fps: FPS,
    width: 1080,
    height: 1920,
    props: {...props, scenes},
  };
};

/* ------------------------------------------------------------------ */
/* ICONS (100x100 viewBox)                                             */
/* ------------------------------------------------------------------ */
const Icon: React.FC<{name: IconName; frame: number}> = ({name, frame}) => {
  const s = {stroke: '#fff', strokeWidth: 3, strokeLinejoin: 'round' as const};
  switch (name) {
    case 'earth':
      return (
        <g>
          <circle cx={50} cy={50} r={40} fill="#2e86ff" {...s} />
          <path d="M30 30 Q42 24 48 34 Q40 44 32 42Z M56 52 Q70 48 72 62 Q64 76 54 68Z" fill="#3ddc84" />
        </g>
      );
    case 'moon':
      return (
        <g>
          <circle cx={50} cy={50} r={40} fill="#e8e8ee" {...s} />
          <circle cx={36} cy={40} r={7} fill="#c3c3cf" />
          <circle cx={62} cy={58} r={10} fill="#c3c3cf" />
          <circle cx={44} cy={68} r={5} fill="#c3c3cf" />
        </g>
      );
    case 'sun':
      return (
        <g>
          <g transform={`rotate(${frame * 1.2} 50 50)`} stroke="#ffd93d" strokeWidth={5} strokeLinecap="round">
            {Array.from({length: 8}).map((_, i) => (
              <line key={i} x1={50} y1={4} x2={50} y2={14} transform={`rotate(${i * 45} 50 50)`} />
            ))}
          </g>
          <circle cx={50} cy={50} r={26} fill="#ffd93d" {...s} />
        </g>
      );
    case 'rocket':
      return (
        <g>
          <path d="M50 6 C70 24 70 54 62 74 L38 74 C30 54 30 24 50 6Z" fill="#f4f4f8" {...s} />
          <circle cx={50} cy={36} r={9} fill="#00e5ff" {...s} />
          <path d="M38 58 L20 82 L38 76Z M62 58 L80 82 L62 76Z" fill="#ff4fd8" {...s} />
          <path d={`M42 78 Q50 ${92 + Math.sin(frame / 2) * 8} 58 78Z`} fill="#ffd93d" />
        </g>
      );
    case 'ufo':
      return (
        <g>
          <path d="M34 50 Q50 14 66 50Z" fill="#9be7ff" {...s} />
          <ellipse cx={50} cy={54} rx={42} ry={14} fill="#8b8fa8" {...s} />
          <circle cx={26} cy={56} r={3} fill="#ffd93d" />
          <circle cx={50} cy={60} r={3} fill="#ffd93d" />
          <circle cx={74} cy={56} r={3} fill="#ffd93d" />
          <path d="M36 68 L22 98 L78 98 L64 68Z" fill="#ffd93d" opacity={0.25 + 0.15 * Math.sin(frame / 5)} />
        </g>
      );
    case 'alien':
      return (
        <g>
          <path d="M50 10 C84 10 82 62 50 90 C18 62 16 10 50 10Z" fill="#6ee26e" {...s} />
          <ellipse cx={34} cy={44} rx={9} ry={14} fill="#111" transform="rotate(-20 34 44)" />
          <ellipse cx={66} cy={44} rx={9} ry={14} fill="#111" transform="rotate(20 66 44)" />
        </g>
      );
    case 'clock': {
      const sec = (frame / 30) * 360 * 2; // fast-forward feel
      return (
        <g>
          <circle cx={50} cy={50} r={40} fill="#fff" {...s} stroke="#ffd93d" strokeWidth={6} />
          {Array.from({length: 12}).map((_, i) => (
            <line key={i} x1={50} y1={14} x2={50} y2={20} stroke="#111" strokeWidth={3} transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <line x1={50} y1={50} x2={50} y2={26} stroke="#111" strokeWidth={5} strokeLinecap="round" transform={`rotate(${sec} 50 50)`} />
          <line x1={50} y1={50} x2={50} y2={36} stroke="#111" strokeWidth={6} strokeLinecap="round" transform={`rotate(${sec / 12} 50 50)`} />
        </g>
      );
    }
    case 'blackhole':
      return (
        <g>
          <g transform={`rotate(${frame * 3} 50 50)`}>
            <ellipse cx={50} cy={50} rx={46} ry={16} fill="none" stroke="#ff4fd8" strokeWidth={5} />
            <ellipse cx={50} cy={50} rx={36} ry={11} fill="none" stroke="#ffd93d" strokeWidth={4} />
          </g>
          <circle cx={50} cy={50} r={22} fill="#000" stroke="#fff" strokeWidth={3} />
        </g>
      );
    case 'star':
      return (
        <polygon
          points="50,8 61,38 93,38 67,57 77,89 50,69 23,89 33,57 7,38 39,38"
          fill="#ffd93d"
          {...s}
          transform={`rotate(${Math.sin(frame / 12) * 10} 50 50)`}
        />
      );
    case 'atom':
      return (
        <g fill="none" stroke="#00e5ff" strokeWidth={4}>
          {[0, 60, 120].map((r) => (
            <ellipse key={r} cx={50} cy={50} rx={42} ry={15} transform={`rotate(${r + frame * 2} 50 50)`} />
          ))}
          <circle cx={50} cy={50} r={9} fill="#ff4fd8" stroke="#fff" strokeWidth={3} />
        </g>
      );
    case 'planet':
      return (
        <g>
          <circle cx={50} cy={50} r={28} fill="#ff9f43" {...s} />
          <ellipse cx={50} cy={52} rx={46} ry={11} fill="none" stroke="#ffd93d" strokeWidth={5} transform="rotate(-18 50 50)" />
        </g>
      );
    case 'lightbulb':
      return (
        <g>
          <circle cx={50} cy={40} r={26} fill="#ffe66d" {...s} />
          <rect x={38} y={64} width={24} height={16} rx={4} fill="#aaa" {...s} />
          <line x1={42} y1={88} x2={58} y2={88} {...s} />
        </g>
      );
    default:
      return null;
  }
};

/* ------------------------------------------------------------------ */
/* SUBTITLES (3 words at a time, active word highlighted)              */
/* ------------------------------------------------------------------ */
const Subtitles: React.FC<{text: string; durationInFrames: number}> = ({text, durationInFrames}) => {
  const frame = useCurrentFrame();
  const startF = 0.15 * FPS;
  const speechF = Math.max(1, durationInFrames - PAD_SEC * FPS - startF);
  const p = Math.min(1, Math.max(0, (frame - startF) / speechF));

  const words = text.split(/\s+/).filter(Boolean);
  const total = words.reduce((a, w) => a + w.length + 1, 0) || 1;
  let acc = 0;
  const timings = words.map((w) => {
    const start = acc / total;
    acc += w.length + 1;
    return {w, start, end: acc / total};
  });
  const active = Math.max(0, timings.findIndex((t) => p >= t.start && p < t.end));
  const idx = p >= 1 ? words.length - 1 : active;
  const chunk = Math.floor(idx / 3);
  const visible = timings.slice(chunk * 3, chunk * 3 + 3);
  const subtitleCharacters = visible.reduce((count, word) => count + word.w.length, 0);
  const subtitleFontSize = Math.min(80, 980 / (subtitleCharacters * 0.62 + visible.length * 0.4));

  return (
    <div
      style={{
        position: 'absolute',
        top: 1460,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontFamily: 'Arial, Helvetica, sans-serif',
        fontSize: subtitleFontSize,
        fontWeight: 800,
        lineHeight: 1.15,
        letterSpacing: -1,
        textTransform: 'uppercase',
      }}
    >
      {visible.map((t, i) => {
        const isActive = chunk * 3 + i === idx;
        return (
          <span
            key={chunk * 3 + i}
            style={{
              display: 'inline-block',
              margin: '0 8px',
              color: isActive ? theme.accent : '#fff',
              transform: `scale(${isActive ? 1.04 : 1})`,
              textShadow: '0 3px 16px rgba(0,0,0,0.65)',
            }}
          >
            {t.w}
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE                                                               */
/* ------------------------------------------------------------------ */
type VisualKind = IconName | 'brain' | 'cell' | 'dna' | 'molecule' | 'wave' | 'particle';

const isIconName = (name: string): name is IconName =>
  [
    'earth',
    'moon',
    'sun',
    'rocket',
    'ufo',
    'alien',
    'clock',
    'blackhole',
    'star',
    'atom',
    'planet',
    'lightbulb',
  ].includes(name);

const visualKindFor = (text: string): VisualKind | undefined => {
  const value = text.toLowerCase();
  if (/brain|neuron|synapse|nerve/.test(value)) return 'brain';
  if (/cell|organ|membrane|bacter|microbe/.test(value)) return 'cell';
  if (/dna|gene|chromosome|double helix/.test(value)) return 'dna';
  if (/molecule|chemical|protein|receptor/.test(value)) return 'molecule';
  if (/wave|sound|light|signal|frequency/.test(value)) return 'wave';
  if (/particle|electron|proton|neutron|atom|quantum/.test(value)) return 'particle';
  if (/black.?hole|singularity/.test(value)) return 'blackhole';
  if (/earth|globe|world/.test(value)) return 'earth';
  if (/moon|lunar/.test(value)) return 'moon';
  if (/sun|solar|star/.test(value)) return 'sun';
  if (/planet|mars|jupiter|saturn/.test(value)) return 'planet';
  if (/rocket|ship|spacecraft/.test(value)) return 'rocket';
  if (/clock|time|hour|second/.test(value)) return 'clock';
  if (/alien|ufo/.test(value)) return 'ufo';
  if (/lightbulb|idea/.test(value)) return 'lightbulb';
  return undefined;
};

const VisualMark: React.FC<{kind: VisualKind; frame: number}> = ({kind, frame}) => {
  if (
    kind === 'earth' ||
    kind === 'moon' ||
    kind === 'sun' ||
    kind === 'rocket' ||
    kind === 'ufo' ||
    kind === 'alien' ||
    kind === 'clock' ||
    kind === 'blackhole' ||
    kind === 'star' ||
    kind === 'atom' ||
    kind === 'planet' ||
    kind === 'lightbulb'
  ) {
    return <Icon name={kind} frame={frame} />;
  }

  if (kind === 'brain') {
    return (
      <g stroke="#fff1df" strokeWidth={3} strokeLinejoin="round">
        <path
          d="M50 14C38 4 25 14 27 27 11 27 12 47 21 51 9 63 22 81 34 78 39 92 50 86 50 77 50 86 63 92 68 78 82 81 93 63 79 51 89 47 89 27 73 27 75 14 62 4 50 14Z"
          fill="#ef806f"
        />
        <path d="M50 16V77M29 30Q42 29 42 43M22 54Q40 49 42 62M71 30Q58 29 58 43M78 54Q60 49 58 62" fill="none" />
        <circle cx={34} cy={36} r={3} fill="#ffe18b" stroke="none" />
        <circle cx={67} cy={56} r={3} fill="#ffe18b" stroke="none" />
      </g>
    );
  }

  if (kind === 'cell') {
    return (
      <g stroke="#e9fff0" strokeWidth={3}>
        <path d="M15 42C16 20 39 11 58 17 81 19 91 39 82 60 76 81 53 89 33 79 16 72 9 58 15 42Z" fill="#42b890" />
        <circle cx={54} cy={49} r={17} fill="#285a78" />
        <circle cx={58} cy={46} r={5} fill="#a5d9ff" stroke="none" />
        <ellipse cx={30} cy={45} rx={8} ry={4} fill="#f3cf69" transform="rotate(-25 30 45)" />
        <ellipse cx={70} cy={67} rx={8} ry={4} fill="#f3cf69" transform="rotate(25 70 67)" />
        <circle cx={31} cy={63} r={3} fill="#fff" stroke="none" />
      </g>
    );
  }

  if (kind === 'dna') {
    const points = Array.from({length: 7}, (_, i) => {
      const y = 12 + i * 13;
      const x1 = 50 + Math.sin((i + frame / 12) * 0.8) * 26;
      return {y, x1, x2: 100 - x1};
    });
    return (
      <g fill="none" strokeLinecap="round">
        <polyline points={points.map((point) => `${point.x1},${point.y}`).join(' ')} stroke="#69d9d0" strokeWidth={7} />
        <polyline points={points.map((point) => `${point.x2},${point.y}`).join(' ')} stroke="#ffc46b" strokeWidth={7} />
        {points.map((point, i) => (
          <line key={i} x1={point.x1} y1={point.y} x2={point.x2} y2={point.y} stroke="#fff" strokeWidth={2} opacity={0.8} />
        ))}
      </g>
    );
  }

  if (kind === 'molecule') {
    return (
      <g stroke="#fff" strokeWidth={4}>
        <path d="M26 30L50 50 75 28M50 50L34 76 72 72" fill="none" stroke="#b8d5ff" strokeWidth={5} />
        <circle cx={26} cy={30} r={12} fill="#ff806f" />
        <circle cx={50} cy={50} r={15} fill="#81d4ff" />
        <circle cx={75} cy={28} r={10} fill="#f5d477" />
        <circle cx={34} cy={76} r={10} fill="#bd9bff" />
        <circle cx={72} cy={72} r={12} fill="#76dfbc" />
      </g>
    );
  }

  if (kind === 'wave') {
    return (
      <g fill="none" strokeLinecap="round">
        <path d="M8 50C19 50 19 23 30 23S41 77 52 77 63 23 74 23 85 50 96 50" stroke="#65d9ee" strokeWidth={8} />
        <path d="M8 50H96" stroke="#fff" strokeWidth={2} strokeDasharray="4 9" opacity={0.55} />
        <circle cx={52} cy={77} r={5} fill="#ffd47e" stroke="none" />
      </g>
    );
  }

  return (
    <g>
      <circle cx={50} cy={50} r={39} fill="#596bc5" stroke="#fff" strokeWidth={3} />
      <circle cx={50} cy={50} r={25} fill="none" stroke="#b9c9ff" strokeWidth={2} opacity={0.8} />
      <circle cx={50} cy={50} r={10} fill="#ffcf70" />
      <circle cx={50} cy={50} r={4} fill="#fff" />
    </g>
  );
};

const getVisualKinds = (scene: SceneProps): {kind: VisualKind; label: string}[] => {
  const elements = Array.isArray(scene.visual_elements)
    ? scene.visual_elements.filter((element): element is string => typeof element === 'string')
    : [];
  const candidates = [...elements, scene.visual ?? '', ...(Array.isArray(scene.icons) ? scene.icons : [])];
  const seen = new Set<VisualKind>();
  const result: {kind: VisualKind; label: string}[] = [];

  for (const candidate of candidates) {
    const kind = visualKindFor(candidate) ?? (isIconName(candidate) ? candidate : undefined);
    if (!kind || seen.has(kind)) continue;
    seen.add(kind);
    result.push({kind, label: candidate.trim().slice(0, 24)});
    if (result.length === 3) break;
  }

  if (result.length === 0) {
    result.push({kind: 'molecule', label: scene.headline || 'SCIENCE'});
  }
  return result;
};

const SceneVisual: React.FC<{
  scene: SceneProps;
  frame: number;
  headlineOpacity?: number;
  showHeadline?: boolean;
}> = ({scene, frame, headlineOpacity = 1, showHeadline = true}) => {
  const {fps} = useVideoConfig();
  const [colorA, colorB] = theme.bgs[scene.bg] ?? theme.bgs.deepblue;
  const objects = getVisualKinds(scene);
  const intro = spring({frame, fps, config: {damping: 24, stiffness: 70}});
  const camera = (scene.camera ?? '').toLowerCase();
  const motion = (scene.motion ?? '').toLowerCase();
  const pushIn = /push|zoom|dolly|close.?up/.test(camera);
  const panLeft = /pan left|move left/.test(camera);
  const panRight = /pan right|move right/.test(camera);
  const energeticMotion = /orbit|spin|rotate|accelerat|spiral/.test(motion);
  const progress = Math.min(1, frame / (fps * 4));
  const scale = 1.015 + (pushIn ? progress * 0.07 : progress * 0.025);
  const pan = panLeft ? progress * 24 : panRight ? progress * -24 : 0;
  const positions =
    objects.length === 1
      ? [{x: 540, y: 545, size: 470}]
      : objects.length === 2
        ? [
            {x: 340, y: 520, size: 330},
            {x: 740, y: 605, size: 330},
          ]
        : [
            {x: 540, y: 525, size: 390},
            {x: 260, y: 370, size: 210},
            {x: 820, y: 700, size: 210},
          ];

  return (
    <AbsoluteFill
      style={{
        overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 42%, ${colorB} 0%, ${colorA} 68%, #07101f 100%)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: -50,
          opacity: 0.32,
          backgroundImage:
            'radial-gradient(circle at center, rgba(255,255,255,0.35) 1px, transparent 1.5px)',
          backgroundSize: '38px 38px',
          transform: `translateX(${pan}px) scale(${scale})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.08), transparent 38%, rgba(3,7,18,0.25))',
        }}
      />
      {showHeadline ? (
        <div
          style={{
            position: 'absolute',
            top: 132,
            left: 50,
            right: 50,
            textAlign: 'center',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 90,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: -3,
            color: '#fff8e9',
            textShadow: '0 5px 30px rgba(0,0,0,0.3)',
            transform: `translateY(${(1 - intro) * 26}px)`,
            opacity: intro * headlineOpacity,
          }}
        >
          {scene.headline}
        </div>
      ) : null}
      <svg
        width={1080}
        height={1120}
        viewBox="0 0 1080 1120"
        style={{
          position: 'absolute',
          top: 295,
          left: 0,
          transform: `translateX(${pan}px) scale(${scale})`,
          transformOrigin: '50% 45%',
        }}
      >
        <defs>
          <radialGradient id={`halo-${scene.scene ?? 0}`}>
            <stop offset="0%" stopColor="#fff" stopOpacity={0.16} />
            <stop offset="68%" stopColor="#9cc8ff" stopOpacity={0.05} />
            <stop offset="100%" stopColor="#9cc8ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={540} cy={540} rx={470} ry={440} fill={`url(#halo-${scene.scene ?? 0})`} />
        <ellipse
          cx={540}
          cy={545}
          rx={335 + Math.sin(frame / 50) * 8}
          ry={250}
          fill="none"
          stroke="rgba(210,230,255,0.18)"
          strokeWidth={2}
          transform={`rotate(${energeticMotion ? frame * 0.12 - 18 : -18} 540 545)`}
        />
        <ellipse
          cx={540}
          cy={545}
          rx={420}
          ry={310}
          fill="none"
          stroke="rgba(210,230,255,0.1)"
          strokeWidth={2}
          strokeDasharray="3 14"
          transform={`rotate(24 540 545)`}
        />
        {objects.length > 1 ? (
          <path
            d={objects.length === 2 ? 'M390 550 Q540 430 690 590' : 'M360 450 Q540 340 720 630'}
            fill="none"
            stroke="rgba(255,232,174,0.65)"
            strokeWidth={3}
            strokeDasharray="5 13"
          />
        ) : null}
        {objects.map(({kind, label}, index) => {
          const point = positions[index];
          const bob = Math.sin((frame + index * 13) / 24) * (index === 0 ? 9 : 14);
          const entrance = spring({frame: frame - index * 7, fps, config: {damping: 20, stiffness: 75}});
          return (
            <g
              key={`${kind}-${index}`}
              transform={`translate(${point.x - point.size / 2} ${point.y - point.size / 2 + bob}) scale(${(point.size / 100) * entrance})`}
              opacity={entrance}
            >
              <circle cx={50} cy={50} r={54} fill="rgba(255,255,255,0.08)" />
              <circle cx={50} cy={50} r={47} fill="rgba(5,12,30,0.26)" />
              <VisualMark kind={kind} frame={frame} />
              <text
                x={50}
                y={117}
                textAnchor="middle"
                fill="rgba(255,255,255,0.78)"
                fontSize={5}
                fontFamily="Arial, Helvetica, sans-serif"
                letterSpacing={0.9}
              >
                {label.toUpperCase()}
              </text>
            </g>
          );
        })}
        <circle cx={170 + Math.sin(frame / 35) * 35} cy={270} r={5} fill="#ffe09a" />
        <circle cx={895} cy={370 + Math.cos(frame / 40) * 30} r={4} fill="#b5ecff" />
        <circle cx={660} cy={895 + Math.sin(frame / 32) * 18} r={4} fill="#ffb5a8" />
      </svg>
    </AbsoluteFill>
  );
};

const Scene: React.FC<
  SceneProps & {durationInFrames: number; nextScene?: SceneProps}
> = (p) => {
  const frame = useCurrentFrame();
  const transitionFrames = 14;
  const transitionProgress =
    p.nextScene && frame >= p.durationInFrames - transitionFrames
      ? Math.min(1, (frame - p.durationInFrames + transitionFrames) / transitionFrames)
      : 0;
  const smoothProgress = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);

  return (
    <AbsoluteFill>
      <SceneVisual scene={p} frame={frame} headlineOpacity={1 - smoothProgress} />
      {p.nextScene && transitionProgress > 0 ? (
        <AbsoluteFill style={{opacity: smoothProgress}}>
          <SceneVisual
            scene={p.nextScene}
            frame={frame - p.durationInFrames + transitionFrames}
            showHeadline={false}
          />
        </AbsoluteFill>
      ) : null}
      <Subtitles text={p.narration} durationInFrames={p.durationInFrames} />
    </AbsoluteFill>
  );
};

const SceneAudio: React.FC<SceneProps> = ({voiceUrl, sfx}) => (
  <>
    {voiceUrl ? (
      <Sequence from={4}>
        <Audio src={voiceUrl} volume={1} />
      </Sequence>
    ) : null}
    {sfx ? <Audio src={staticFile(`audio/sfx_${sfx}.wav`)} volume={0.5} /> : null}
  </>
);

/* ------------------------------------------------------------------ */
/* ROOT COMPOSITION                                                    */
/* ------------------------------------------------------------------ */
export const ScienceStick: React.FC<ScienceStickProps> = ({scenes, music}) => {
  const {durationInFrames, fps} = useVideoConfig();
  const musicFadeInFrames = Math.min(fps, durationInFrames / 3);
  const musicFadeOutStart = Math.max(
    musicFadeInFrames,
    durationInFrames - Math.min(fps * 2, durationInFrames / 3),
  );
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Series>
        {scenes.map((s, i) => (
          <Series.Sequence key={i} durationInFrames={s.durationInFrames ?? 90}>
            <Scene
              {...s}
              durationInFrames={s.durationInFrames ?? 90}
              nextScene={scenes[i + 1]}
            />
          </Series.Sequence>
        ))}
      </Series>
      <Series>
        {scenes.map((scene, i) => (
          <Series.Sequence
            key={`audio-${i}`}
            durationInFrames={scene.durationInFrames ?? 90}
          >
            <SceneAudio {...scene} />
          </Series.Sequence>
        ))}
      </Series>
      {music ? (
        <Audio
          src={staticFile(`audio/music_${music}.wav`)}
          loop
          volume={(f) =>
            interpolate(
              f,
              [0, musicFadeInFrames, musicFadeOutStart, durationInFrames],
              [0, 0.14, 0.14, 0],
              {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
              },
            )
          }
        />
      ) : null}
    </AbsoluteFill>
  );
};
