import "./styles.css";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const subwayInteriorBg = new Image();
subwayInteriorBg.src = "/assets/line1-subway-interior-bg.png";

const refs = {
  app: document.querySelector("#app"),
  hp: document.querySelector("#health"),
  hpFill: document.querySelector("#healthFill"),
  level: document.querySelector("#level"),
  time: document.querySelector("#time"),
  score: document.querySelector("#score"),
  xpFill: document.querySelector("#xpFill"),
  weaponList: document.querySelector("#weaponList"),
  codexList: document.querySelector("#codexList"),
  message: document.querySelector("#message"),
  messageTitle: document.querySelector("#messageTitle"),
  messageText: document.querySelector("#messageText"),
  startButton: document.querySelector("#startButton"),
  heroPanel: document.querySelector("#heroPanel"),
  heroChoices: document.querySelector("#heroChoices"),
  upgradePanel: document.querySelector("#upgradePanel"),
  upgradeTitle: document.querySelector("#upgradeTitle"),
  upgradeChoices: document.querySelector("#upgradeChoices"),
  leaderboardPanel: document.querySelector("#leaderboardPanel"),
  leaderboardList: document.querySelector("#leaderboardList"),
  rankForm: document.querySelector("#rankForm"),
  playerNameInput: document.querySelector("#playerNameInput"),
  submitScoreButton: document.querySelector("#submitScoreButton"),
  rankHint: document.querySelector("#rankHint"),
  bossBanner: document.querySelector("#bossBanner"),
  bestScore: document.querySelector("#bestScore"),
  firstAidButton: document.querySelector("#firstAidButton"),
  firstAidCount: document.querySelector("#firstAidCount"),
  pauseButton: document.querySelector("#pauseButton"),
  moveStick: document.querySelector("#moveStick"),
  moveStickThumb: document.querySelector("#moveStickThumb"),
};

const sound = {
  ctx: null,
  master: null,
  enabled: true,
  last: new Map(),
};

const STORAGE_KEY = "villain-commando-best";
const LOCAL_LEADERBOARD_KEY = "villain-commando-local-leaderboard";
const LEADERBOARD_API = import.meta.env.VITE_LEADERBOARD_API || "/api/leaderboard";
const LEADERBOARD_LIMIT = 10;
const TAU = Math.PI * 2;
const WORLD_SIZE = 2800;
const MAX_RUN_TIME = 1200;
const DPR_LIMIT = 2;
const START_HP = 100;
const MAX_PLAYER_HP = 200;
const MAX_PLAYER_HP_LIMIT = 300;
const START_MAGNET_RANGE = 185;
const CHARACTER_SIZE_SCALE = 0.5;
const MONSTER_SIZE_SCALE = 0.42;
const BOSS_SIZE_SCALE = 0.3;
const PLAYER_RADIUS = 19 * CHARACTER_SIZE_SCALE;
const FIRST_AID_HEAL_RATIO = 0.5;

const heroTypes = [
  {
    id: "gae-hwanam",
    name: "개화남",
    image: "/assets/heroes/gae-hwanam-cutout.png",
    quote: "정의는 방향이 아니라 선택.",
    hp: 120,
    maxHp: 120,
    atk: 90,
    def: 120,
    spd: 90,
    color: "#1f2327",
    accent: "#d6b06f",
  },
  {
    id: "gae-hwani",
    name: "개화녀",
    image: "/assets/heroes/gae-hwani-cutout.png",
    quote: "작은 용기로 길을 연다.",
    hp: 100,
    maxHp: 100,
    atk: 120,
    def: 90,
    spd: 120,
    color: "#5a4632",
    accent: "#f0d7b7",
  },
];

const heroImages = new Map();
for (const hero of heroTypes) {
  const image = new Image();
  image.src = hero.image;
  heroImages.set(hero.id, image);
}

const monsterTypes = [
  {
    id: "spread-seat-guy",
    name: "쩍벌남",
    shortName: "쩍벌남",
    image: "/assets/monsters/spread-seat-guy.png?v=20260619b",
    color: "#7b2cbf",
    trim: "#c77dff",
    hp: 160,
    speed: 45,
    damage: 14,
    radius: 62 * 0.52,
    bodySize: 0.65,
    xp: 15,
    score: 42,
    weight: (minute) => 5 + minute * 0.6,
    note: "좌석을 통째로 점령한 느린 탱커",
    special: "tank",
  },
  {
    id: "phone-woman",
    name: "통화녀",
    shortName: "통화녀",
    image: "/assets/monsters/phone-woman.png?v=20260619b",
    color: "#00a896",
    trim: "#80ffdb",
    hp: 80,
    speed: 80,
    damage: 8,
    radius: 62 * 0.42,
    bodySize: 0.42,
    xp: 9,
    score: 26,
    weight: (minute) => 8 + minute * 0.9,
    note: "통화에 정신 팔린 중속 몬스터",
    special: "spiral",
  },
  {
    id: "pushy-aunt",
    name: "밀치기아줌마",
    shortName: "밀치기",
    image: "/assets/monsters/pushy-aunt.png?v=20260619b",
    color: "#f77f00",
    trim: "#ffbe0b",
    hp: 120,
    speed: 105,
    damage: 10,
    radius: 62 * 0.4,
    bodySize: 0.5,
    xp: 13,
    score: 38,
    weight: (minute) => 7 + minute * 1.2,
    note: "빠르게 파고드는 돌진형 몬스터",
    special: "zigzag",
  },
  {
    id: "wall-man",
    name: "철벽남",
    shortName: "철벽남",
    image: "/assets/monsters/wall-man.png?v=20260619b",
    color: "#1d3557",
    trim: "#48cae4",
    hp: 220,
    speed: 30,
    damage: 10,
    radius: 62 * 0.6,
    bodySize: 0.75,
    xp: 19,
    score: 55,
    weight: (minute) => 3.5 + minute * 0.55,
    note: "느리지만 단단한 벽 같은 탱커",
    special: "tank",
  },
  {
    id: "backpack-spinner",
    name: "백팩 스핀러",
    shortName: "백팩",
    image: "/assets/monsters/backpack-spinner.png?v=20260619b",
    color: "#2d6a4f",
    trim: "#95d5b2",
    hp: 110,
    speed: 90,
    damage: 15,
    radius: 62 * 0.46,
    bodySize: 0.58,
    xp: 14,
    score: 46,
    weight: (minute) => 5.5 + minute * 0.9,
    note: "회전하며 접근하는 고위험 몬스터",
    special: "spiral",
  },
  {
    id: "speakerphone-man",
    name: "스피커폰맨",
    shortName: "스피커",
    image: "/assets/monsters/speakerphone-man.png?v=20260619b",
    color: "#c9184a",
    trim: "#ff8fab",
    hp: 140,
    speed: 60,
    damage: 12,
    radius: 62 * 0.42,
    bodySize: 0.52,
    xp: 15,
    score: 44,
    weight: (minute) => 5.5 + minute * 0.75,
    note: "스피커 파동으로 압박하는 소음형 몬스터",
    special: "shout",
  },
];

const legacyMonsterTypes = [
  {
    id: "line-noise",
    name: "1호선 황금코트 소음장군",
    shortName: "황금소음",
    color: "#f05d4f",
    trim: "#ffe066",
    hp: 38,
    speed: 72,
    damage: 9,
    radius: 18,
    xp: 7,
    score: 10,
    weight: (minute) => 10 + minute * 1.2,
    note: "노이즈 캔슬링을 뚫는 고성 파동",
    special: "pulse",
  },
  {
    id: "seat-blocker",
    name: "쩍벌 좌석왕",
    shortName: "쩍벌왕",
    color: "#8f6bff",
    trim: "#f7efff",
    hp: 115,
    speed: 44,
    damage: 15,
    radius: 28,
    xp: 16,
    score: 45,
    weight: (minute) => Math.max(0, minute - 0.4) * 4,
    note: "두 칸을 한 몸처럼 쓰는 탱커",
    special: "tank",
  },
  {
    id: "queue-cutter",
    name: "개찰구 새치기 러너",
    shortName: "새치기",
    color: "#36d399",
    trim: "#effff7",
    hp: 26,
    speed: 118,
    damage: 7,
    radius: 15,
    xp: 6,
    score: 18,
    weight: (minute) => 3 + minute * 2.8,
    note: "눈 마주치기 전에 지그재그 돌진",
    special: "zigzag",
  },
  {
    id: "airport-thief",
    name: "공항 캐리어 슬쩍맨",
    shortName: "슬쩍맨",
    color: "#2f80ed",
    trim: "#d8ecff",
    hp: 70,
    speed: 86,
    damage: 12,
    radius: 20,
    xp: 14,
    score: 60,
    weight: (minute) => Math.max(0, minute - 1) * 3.8,
    note: "수하물 함정을 흩뿌리고 튐",
    special: "luggage",
  },
  {
    id: "bus-yeller",
    name: "버스 엄지척 고성왕",
    shortName: "고성왕",
    color: "#ff9f1c",
    trim: "#fff2cc",
    hp: 86,
    speed: 58,
    damage: 11,
    radius: 22,
    xp: 15,
    score: 55,
    weight: (minute) => Math.max(0, minute - 1.5) * 3.2,
    note: "위협 발언은 삭제, 고성 링만 남김",
    special: "shout",
  },
  {
    id: "receipt-storm",
    name: "민원 영수증 폭탄러",
    shortName: "영수증",
    color: "#f3f0d7",
    trim: "#1b1b1b",
    hp: 52,
    speed: 96,
    damage: 8,
    radius: 17,
    xp: 10,
    score: 30,
    weight: (minute) => Math.max(0, minute - 2) * 2.5,
    note: "증거라며 종이 회오리로 압박",
    special: "spiral",
  },
];

const monsterImages = new Map();
for (const monster of monsterTypes) {
  if (!monster.image) continue;
  const image = new Image();
  image.src = monster.image;
  monsterImages.set(monster.id, image);
}

const legacyBossTypes = [
  {
    id: "rush-hour",
    name: "1호선 최종 혼잡왕",
    color: "#d7263d",
    trim: "#fff3b0",
    hp: 850,
    speed: 48,
    damage: 20,
    radius: 46,
    xp: 90,
    score: 260,
    special: "boss-pulse",
  },
  {
    id: "lost-luggage-master",
    name: "공항 수하물 마스터",
    color: "#255f85",
    trim: "#bde0fe",
    hp: 1180,
    speed: 54,
    damage: 24,
    radius: 50,
    xp: 130,
    score: 420,
    special: "boss-luggage",
  },
  {
    id: "noise-overlord",
    name: "전설의 민폐 집합체",
    color: "#5f0f40",
    trim: "#fb8b24",
    hp: 1600,
    speed: 50,
    damage: 28,
    radius: 58,
    xp: 180,
    score: 650,
    special: "boss-final",
  },
];

const bossTypes = [
  {
    id: "airport-thief-boss",
    name: "공항도둑",
    image: "/assets/bosses/airport-thief-boss.png",
    color: "#704214",
    trim: "#ffca3a",
    hp: 2520,
    speed: 62,
    damage: 24,
    radius: 50,
    xp: 130,
    score: 560,
    special: "boss-airport",
  },
  {
    id: "jarvan-84",
    name: "자르반 84세",
    image: "/assets/bosses/jarvan-84.png",
    color: "#d4a017",
    trim: "#7b2cbf",
    hp: 2940,
    speed: 48,
    damage: 30,
    radius: 60,
    xp: 170,
    score: 720,
    special: "boss-jarvan",
  },
  {
    id: "danso-assassin",
    name: "단소살인마",
    image: "/assets/bosses/danso-assassin.png",
    color: "#0077b6",
    trim: "#f9c74f",
    hp: 2590,
    speed: 58,
    damage: 28,
    radius: 54,
    xp: 150,
    score: 640,
    special: "boss-danso",
  },
  {
    id: "praise-man",
    name: "칭찬남",
    image: "/assets/bosses/praise-man.png",
    color: "#6f42c1",
    trim: "#c77dff",
    hp: 2500,
    speed: 60,
    damage: 25,
    radius: 54,
    xp: 150,
    score: 660,
    special: "boss-praise",
  },
  {
    id: "bubblegum-woman",
    name: "풍선껌녀",
    image: "/assets/bosses/bubblegum-woman.png",
    color: "#b5179e",
    trim: "#ff8fab",
    hp: 2680,
    speed: 52,
    damage: 24,
    radius: 58,
    xp: 160,
    score: 690,
    special: "boss-gum",
  },
  {
    id: "dance-woman",
    name: "캐시워크녀",
    image: "/assets/bosses/dance-woman.png",
    color: "#3c096c",
    trim: "#c77dff",
    hp: 2380,
    speed: 88,
    damage: 26,
    radius: 48,
    xp: 155,
    score: 700,
    special: "boss-dance",
  },
];

const bossImages = new Map();
for (const boss of bossTypes) {
  const image = new Image();
  image.src = boss.image;
  bossImages.set(boss.id, image);
}

const upgradePool = [
  {
    id: "rapid",
    name: "따발총 모드",
    desc: "자동 사격 속도 +18%",
    apply: () => {
      player.fireRate *= 0.82;
    },
  },
  {
    id: "damage",
    name: "참교육 탄환",
    desc: "탄환 피해 +25%",
    apply: () => {
      player.damage *= 1.25;
    },
  },
  {
    id: "multi",
    name: "분노의 산탄",
    desc: "동시 발사 +1",
    apply: () => {
      player.shots += 1;
    },
  },
  {
    id: "magnet",
    name: "민심 흡수기",
    desc: "경험치 흡수 범위 +35%",
    apply: () => {
      player.magnet *= 1.45;
    },
  },
  {
    id: "speed",
    name: "칼퇴 스텝",
    desc: "이동 속도 +12%",
    apply: () => {
      player.speed *= 1.12;
    },
  },
  {
    id: "maxhp",
    name: "멘탈 강화",
    desc: "최대 체력 +25, 즉시 회복",
    apply: () => {
      player.maxHp = Math.min(MAX_PLAYER_HP, player.maxHp + 25);
      player.hp = Math.min(player.maxHp, player.hp + 35);
    },
  },
  {
    id: "lightning",
    name: "민원 번개",
    desc: "가까운 적에게 주기적 낙뢰",
    apply: () => {
      weapons.lightning.level += 1;
    },
  },
  {
    id: "boomerang",
    name: "교통카드 투척",
    desc: "교통카드를 던져 적을 관통 공격",
    apply: () => {
      weapons.card.level += 1;
      weapons.card.cooldown = Math.min(weapons.card.cooldown, 0.45);
    },
  },
  {
    id: "lowKick",
    name: "응징 로우킥",
    desc: "전방을 채찍처럼 휘두르는 범위 공격",
    apply: () => {
      weapons.lowKick.level += 1;
      weapons.lowKick.cooldown = Math.min(weapons.lowKick.cooldown, 0.45);
    },
  },
  {
    id: "strapOrbit",
    name: "손잡이 회오리",
    desc: "주변을 도는 손잡이 보호 무기",
    apply: () => {
      weapons.strapOrbit.level += 1;
    },
  },
  {
    id: "announcement",
    name: "안내방송 충격파",
    desc: "원형 음파가 퍼지며 적을 밀어냄",
    apply: () => {
      weapons.announcement.level += 1;
      weapons.announcement.cooldown = Math.min(weapons.announcement.cooldown, 0.55);
    },
  },
  {
    id: "expressTrain",
    name: "급행열차 돌진",
    desc: "넓은 직선 범위를 쓸어버림",
    apply: () => {
      weapons.expressTrain.level += 1;
      weapons.expressTrain.cooldown = Math.min(weapons.expressTrain.cooldown, 1.1);
    },
  },
  {
    id: "transferGate",
    name: "환승 게이트",
    desc: "적 많은 곳에 게이트 폭발",
    apply: () => {
      weapons.transferGate.level += 1;
      weapons.transferGate.cooldown = Math.min(weapons.transferGate.cooldown, 0.8);
    },
  },
  {
    id: "customerMissile",
    name: "고객센터 유도탄",
    desc: "가까운 적에게 유도탄을 발사하고 폭발 피해",
    apply: () => {
      weapons.customerMissile.level += 1;
      weapons.customerMissile.cooldown = Math.min(weapons.customerMissile.cooldown, 0.28);
    },
  },
  {
    id: "callBell",
    name: "분노의 호출벨",
    desc: "호출벨 투사체가 날아가 적을 관통 공격",
    apply: () => {
      weapons.callBell.level += 1;
      weapons.callBell.cooldown = Math.min(weapons.callBell.cooldown, 0.8);
    },
  },
  {
    id: "rushAdapt",
    name: "러시아워 적응력",
    desc: "이동 속도 +10%",
    apply: () => {
      player.speed *= 1.1;
    },
  },
  {
    id: "transferMaster",
    name: "환승 고수",
    desc: "경험치 흡수 범위 +30%",
    apply: () => {
      player.magnet *= 1.3;
    },
  },
  {
    id: "nuisanceResist",
    name: "민폐 내성",
    desc: "받는 피해 8% 감소",
    apply: () => {
      player.damageReduction = Math.min(0.5, player.damageReduction + 0.08);
    },
  },
  {
    id: "mentalRegen",
    name: "멘탈 회복력",
    desc: "일정 시간마다 체력 소량 회복",
    apply: () => {
      player.regenLevel += 1;
      player.regenTimer = Math.min(player.regenTimer, 1.2);
    },
  },
  {
    id: "commuteSurvival",
    name: "출근길 생존술",
    desc: "최대 에너지 +20, 즉시 회복",
    apply: () => {
      player.maxHp = Math.min(MAX_PLAYER_HP_LIMIT, player.maxHp + 20);
      player.hp = Math.min(player.maxHp, player.hp + 25);
    },
  },
  {
    id: "complaintProcessing",
    name: "민원 처리 속도",
    desc: "레벨업 필요 경험치 8% 감소",
    apply: () => {
      player.xpNeedMultiplier = Math.max(0.65, player.xpNeedMultiplier * 0.92);
      player.nextXp = Math.max(12, Math.round(player.nextXp * 0.92));
    },
  },
];

const passiveUpgradeIds = new Set([
  "rushAdapt",
  "transferMaster",
  "nuisanceResist",
  "mentalRegen",
  "commuteSurvival",
  "complaintProcessing",
]);

const weaponUpgradeIds = new Set([
  "lightning",
  "boomerang",
  "lowKick",
  "strapOrbit",
  "announcement",
  "expressTrain",
  "transferGate",
  "customerMissile",
  "callBell",
]);

let width = 1;
let height = 1;
let dpr = 1;
let lastFrame = 0;
let spawnTimer = 0;
let bossIndex = 0;
let bossBag = [];
let nextBossAt = 20;
let bossWarningFor = 0;
let shake = 0;
let bestScore = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
let leaderboardEntries = [];
let pendingLeaderboardScore = null;
let leaderboardSubmitting = false;

const keys = new Set();
const enemies = [];
const bullets = [];
const orbs = [];
const energyPickups = [];
const particles = [];
const damageZones = [];
const popups = [];
const speechBubbles = [];
const cards = [];
const missiles = [];
const callBells = [];

const input = {
  x: 0,
  y: 0,
  touchId: null,
  originX: 0,
  originY: 0,
};

const camera = { x: 0, y: 0 };

const player = {
  x: WORLD_SIZE / 2,
  y: WORLD_SIZE / 2,
  heroId: "",
  heroName: "",
  heroColor: "#223b79",
  heroAccent: "#ffd166",
  radius: PLAYER_RADIUS,
  hp: START_HP,
  maxHp: MAX_PLAYER_HP,
  speed: 205,
  level: 1,
  xp: 0,
  nextXp: 35,
  kills: 0,
  score: 0,
  elapsed: 0,
  damage: 34,
  fireRate: 0.128,
  fireCooldown: 0,
  shots: 1,
  bulletSpeed: 660,
  magnet: START_MAGNET_RANGE,
  damageReduction: 0,
  defenseBreakTimer: 0,
  defenseBreakPower: 0,
  stunTimer: 0,
  slowTimer: 0,
  slowMultiplier: 1,
  regenLevel: 0,
  regenTimer: 4,
  firstAidKits: 1,
  xpNeedMultiplier: 1,
  invuln: 0,
  alive: false,
};

const weapons = {
  lightning: { level: 0, cooldown: 3.4 },
  card: { level: 0, cooldown: 0.45 },
  lowKick: { level: 0, cooldown: 2.4 },
  strapOrbit: { level: 0, angle: 0 },
  announcement: { level: 0, cooldown: 3.9 },
  expressTrain: { level: 0, cooldown: 8.2 },
  transferGate: { level: 0, cooldown: 6.2 },
  customerMissile: { level: 0, cooldown: 0.45 },
  callBell: { level: 0, cooldown: 3.4 },
};

const game = {
  state: "menu",
  paused: false,
  manualPaused: false,
  pendingHeroChoice: false,
  pendingStarterChoices: 0,
};

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
  const rect = refs.app.getBoundingClientRect();
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

function angleDelta(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function ensureAudio() {
  if (!sound.enabled) return null;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  if (!sound.ctx) {
    sound.ctx = new AudioContext();
    sound.master = sound.ctx.createGain();
    sound.master.gain.value = 0.2;
    sound.master.connect(sound.ctx.destination);
  }
  if (sound.ctx.state === "suspended") sound.ctx.resume();
  return sound.ctx;
}

function soundAllowed(id, gap = 0) {
  const now = performance.now();
  const last = sound.last.get(id) ?? 0;
  if (now - last < gap) return false;
  sound.last.set(id, now);
  return true;
}

function playTone({
  type = "sine",
  frequency = 440,
  endFrequency = frequency,
  duration = 0.12,
  volume = 0.3,
  attack = 0.006,
  when = 0,
}) {
  const audio = ensureAudio();
  if (!audio || !sound.master) return;
  const start = audio.currentTime + when;
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(24, endFrequency), start + duration);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(sound.master);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function playNoise({ duration = 0.14, volume = 0.22, filter = 900, when = 0 } = {}) {
  const audio = ensureAudio();
  if (!audio || !sound.master) return;
  const start = audio.currentTime + when;
  const buffer = audio.createBuffer(1, Math.max(1, Math.floor(audio.sampleRate * duration)), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const source = audio.createBufferSource();
  const gain = audio.createGain();
  const biquad = audio.createBiquadFilter();
  source.buffer = buffer;
  biquad.type = "lowpass";
  biquad.frequency.value = filter;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(biquad).connect(gain).connect(sound.master);
  source.start(start);
}

function playSound(id) {
  switch (id) {
    case "ui":
      if (!soundAllowed(id, 80)) return;
      playTone({ type: "triangle", frequency: 640, endFrequency: 920, duration: 0.08, volume: 0.2 });
      break;
    case "shot":
      if (!soundAllowed(id, 85)) return;
      playTone({ type: "square", frequency: 520, endFrequency: 260, duration: 0.055, volume: 0.13 });
      break;
    case "card":
      if (!soundAllowed(id, 180)) return;
      playTone({ type: "sawtooth", frequency: 740, endFrequency: 980, duration: 0.1, volume: 0.16 });
      break;
    case "lightning":
      playNoise({ duration: 0.16, volume: 0.2, filter: 2200 });
      playTone({ type: "sawtooth", frequency: 980, endFrequency: 240, duration: 0.18, volume: 0.14 });
      break;
    case "lowKick":
      playTone({ type: "triangle", frequency: 170, endFrequency: 82, duration: 0.13, volume: 0.28 });
      playNoise({ duration: 0.1, volume: 0.14, filter: 520 });
      break;
    case "announcement":
      playTone({ type: "sine", frequency: 392, endFrequency: 523, duration: 0.11, volume: 0.18 });
      playTone({ type: "sine", frequency: 523, endFrequency: 659, duration: 0.11, volume: 0.16, when: 0.08 });
      break;
    case "train":
      playNoise({ duration: 0.32, volume: 0.22, filter: 520 });
      playTone({ type: "sawtooth", frequency: 130, endFrequency: 70, duration: 0.32, volume: 0.18 });
      break;
    case "gate":
      playTone({ type: "triangle", frequency: 520, endFrequency: 760, duration: 0.1, volume: 0.18 });
      playTone({ type: "triangle", frequency: 700, endFrequency: 420, duration: 0.16, volume: 0.16, when: 0.08 });
      break;
    case "missile":
      if (!soundAllowed(id, 90)) return;
      playTone({ type: "sawtooth", frequency: 420, endFrequency: 760, duration: 0.12, volume: 0.12 });
      break;
    case "explosion":
      playNoise({ duration: 0.18, volume: 0.25, filter: 780 });
      playTone({ type: "triangle", frequency: 95, endFrequency: 42, duration: 0.2, volume: 0.22 });
      break;
    case "bell":
      playTone({ type: "sine", frequency: 980, endFrequency: 980, duration: 0.08, volume: 0.2 });
      playTone({ type: "sine", frequency: 1318, endFrequency: 880, duration: 0.12, volume: 0.14, when: 0.04 });
      break;
    case "hit":
      if (!soundAllowed(id, 45)) return;
      playTone({ type: "triangle", frequency: 220, endFrequency: 160, duration: 0.05, volume: 0.09 });
      break;
    case "kill":
      if (!soundAllowed(id, 70)) return;
      playTone({ type: "triangle", frequency: 360, endFrequency: 620, duration: 0.08, volume: 0.12 });
      break;
    case "boss":
      playTone({ type: "sawtooth", frequency: 92, endFrequency: 58, duration: 0.28, volume: 0.25 });
      playNoise({ duration: 0.22, volume: 0.18, filter: 680, when: 0.06 });
      break;
    case "bossKill":
      playTone({ type: "triangle", frequency: 220, endFrequency: 440, duration: 0.14, volume: 0.2 });
      playTone({ type: "triangle", frequency: 330, endFrequency: 660, duration: 0.18, volume: 0.18, when: 0.1 });
      playNoise({ duration: 0.22, volume: 0.16, filter: 1400, when: 0.04 });
      break;
    case "playerHit":
      if (!soundAllowed(id, 220)) return;
      playTone({ type: "sawtooth", frequency: 180, endFrequency: 75, duration: 0.16, volume: 0.22 });
      break;
    case "heal":
      playTone({ type: "sine", frequency: 440, endFrequency: 660, duration: 0.12, volume: 0.16 });
      playTone({ type: "sine", frequency: 660, endFrequency: 880, duration: 0.14, volume: 0.14, when: 0.08 });
      break;
    case "xp":
      if (!soundAllowed(id, 95)) return;
      playTone({ type: "sine", frequency: 880, endFrequency: 1180, duration: 0.045, volume: 0.08 });
      break;
    case "levelUp":
      playTone({ type: "triangle", frequency: 392, endFrequency: 523, duration: 0.1, volume: 0.2 });
      playTone({ type: "triangle", frequency: 523, endFrequency: 784, duration: 0.16, volume: 0.2, when: 0.1 });
      break;
    case "gameOver":
      playTone({ type: "sawtooth", frequency: 220, endFrequency: 110, duration: 0.26, volume: 0.2 });
      playTone({ type: "sawtooth", frequency: 165, endFrequency: 82, duration: 0.32, volume: 0.16, when: 0.16 });
      break;
  }
}

function resetGame() {
  ensureAudio();
  playSound("ui");
  enemies.length = 0;
  bullets.length = 0;
  orbs.length = 0;
  energyPickups.length = 0;
  particles.length = 0;
  damageZones.length = 0;
  popups.length = 0;
  speechBubbles.length = 0;
  cards.length = 0;
  missiles.length = 0;
  callBells.length = 0;
  bossIndex = 0;
  bossBag = [];
  nextBossAt = 20;
  bossWarningFor = 0;
  spawnTimer = 0;
  shake = 0;
  pendingLeaderboardScore = null;
  leaderboardSubmitting = false;
  refs.leaderboardPanel?.classList.add("hidden");
  refs.rankForm?.classList.add("hidden");
  if (refs.playerNameInput) refs.playerNameInput.value = "";
  Object.assign(player, {
    x: WORLD_SIZE / 2,
    y: WORLD_SIZE / 2,
    heroId: "",
    heroName: "",
    heroColor: "#223b79",
    heroAccent: "#ffd166",
    radius: PLAYER_RADIUS,
    hp: START_HP,
    maxHp: MAX_PLAYER_HP,
    speed: 205,
    level: 1,
    xp: 0,
    nextXp: 35,
    kills: 0,
    score: 0,
    elapsed: 0,
    damage: 34,
    fireRate: 0.128,
    fireCooldown: 0.05,
    shots: 1,
    bulletSpeed: 660,
    magnet: START_MAGNET_RANGE,
    damageReduction: 0,
    defenseBreakTimer: 0,
    defenseBreakPower: 0,
    stunTimer: 0,
    slowTimer: 0,
    slowMultiplier: 1,
    regenLevel: 0,
    regenTimer: 4,
    firstAidKits: 1,
    xpNeedMultiplier: 1,
    invuln: 0,
    alive: true,
  });
  Object.assign(weapons.lightning, { level: 0, cooldown: 3.4 });
  Object.assign(weapons.card, { level: 0, cooldown: 0.45 });
  Object.assign(weapons.lowKick, { level: 0, cooldown: 2.4 });
  Object.assign(weapons.strapOrbit, { level: 0, angle: 0 });
  Object.assign(weapons.announcement, { level: 0, cooldown: 3.9 });
  Object.assign(weapons.expressTrain, { level: 0, cooldown: 8.2 });
  Object.assign(weapons.transferGate, { level: 0, cooldown: 6.2 });
  Object.assign(weapons.customerMissile, { level: 0, cooldown: 0.45 });
  Object.assign(weapons.callBell, { level: 0, cooldown: 3.4 });
  game.state = "playing";
  game.paused = true;
  game.manualPaused = false;
  game.pendingHeroChoice = true;
  game.pendingStarterChoices = 0;
  refs.message.classList.remove("start-screen");
  refs.message.classList.add("hidden");
  refs.heroPanel.classList.remove("hidden");
  refs.upgradePanel.classList.add("hidden");
  refs.bossBanner.classList.remove("active");
  updateHud();
  renderHeroChoices();
}

function renderHeroChoices() {
  refs.heroChoices.innerHTML = "";
  for (const hero of heroTypes) {
    const button = document.createElement("button");
    button.className = "hero-card";
    button.type = "button";
    button.innerHTML = `
      <img src="${hero.image}" alt="${hero.name}" />
      <strong>${hero.name}</strong>
      <p>${hero.quote}</p>
      <div class="hero-stats">
        <span>HP ${hero.hp}</span>
        <span>ATK ${hero.atk}</span>
        <span>DEF ${hero.def}</span>
        <span>SPD ${hero.spd}</span>
      </div>
    `;
    button.addEventListener("click", () => selectHero(hero.id));
    refs.heroChoices.append(button);
  }
}

function selectHero(heroId) {
  playSound("ui");
  const hero = heroTypes.find((item) => item.id === heroId) ?? heroTypes[0];
  player.heroId = hero.id;
  player.heroName = hero.name;
  player.heroColor = hero.color;
  player.heroAccent = hero.accent;
  player.maxHp = hero.maxHp;
  player.hp = hero.maxHp;
  player.damage = 34 * (hero.atk / 100);
  player.speed = 205 * (hero.spd / 100);
  player.damageReduction = clamp((hero.def - 100) / 250, -0.08, 0.12);
  refs.heroPanel.classList.add("hidden");
  game.pendingHeroChoice = false;
  game.pendingStarterChoices = 3;
  updateHud();
  openUpgradePanel();
}

function togglePause() {
  if (game.state !== "playing" || game.pendingHeroChoice || game.pendingStarterChoices > 0) return;
  if (!game.manualPaused && game.paused) return;
  game.manualPaused = !game.manualPaused;
  game.paused = game.manualPaused;
  resetFloatingStickMove();
  playSound("ui");
  updateHud();
}

function weightedPick(types, minute) {
  const weighted = types.map((type) => ({ type, weight: Math.max(0, type.weight?.(minute) ?? 1) }));
  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * Math.max(total, 1);
  for (const item of weighted) {
    roll -= item.weight;
    if (roll <= 0) return item.type;
  }
  return types[0];
}

function shuffle(items) {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickUpgradeChoices(pool, count = 3, boostBulletCount = false) {
  const remaining = [...pool];
  const choices = [];
  while (choices.length < count && remaining.length > 0) {
    const weighted = remaining.map((choice) => ({
      choice,
      weight: boostBulletCount && choice.id === "multi" ? 2 : 1,
    }));
    const total = weighted.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * total;
    const index = weighted.findIndex((item) => {
      roll -= item.weight;
      return roll <= 0;
    });
    choices.push(remaining.splice(Math.max(0, index), 1)[0]);
  }
  return choices;
}

function spawnEnemy(type = null, boss = false) {
  const minute = player.elapsed / 60;
  const chosen = type ?? weightedPick(monsterTypes, minute);
  const angle = Math.random() * TAU;
  const spawnDistance = Math.max(width, height) * 0.62 + 90;
  const x = clamp(player.x + Math.cos(angle) * spawnDistance, 50, WORLD_SIZE - 50);
  const y = clamp(player.y + Math.sin(angle) * spawnDistance, 50, WORLD_SIZE - 50);
  const normalScale = boss ? 1 + minute * 0.11 : 1;
  const enemy = {
    ...chosen,
    x,
    y,
    hp: chosen.hp * normalScale,
    maxHp: chosen.hp * normalScale,
    speed: chosen.speed * (boss ? 1.3 : 1),
    damage: chosen.damage * (boss ? 1 : 1),
    radius: chosen.radius * (boss ? BOSS_SIZE_SCALE : MONSTER_SIZE_SCALE),
    boss,
    angleOffset: Math.random() * TAU,
    cooldown: rand(0.3, 1.1),
    hitFlash: 0,
    dash: 0,
    wobble: Math.random() * TAU,
    swingCooldown: rand(0.5, 1.2),
    shockCooldown: rand(1.5, 2.4),
    tauntCooldown: rand(2.4, 3.8),
    crisisCooldown: rand(5.0, 6.8),
    flagCooldown: rand(2.8, 4.2),
    spearCooldown: rand(1.6, 2.6),
    praiseCooldown: rand(1.0, 1.8),
    praiseStunCooldown: rand(3.2, 4.8),
    bubbleCooldown: rand(0.8, 1.5),
    gumMissileCooldown: rand(3.0, 4.5),
    danceKickCooldown: rand(0.7, 1.3),
    danceStampCooldown: rand(2.6, 4.0),
    retreatTimer: 0,
    attackSpeechCooldown: 0,
    boostTimer: 0,
    speedBoostMultiplier: 1,
    defenseBoostTimer: 0,
    defenseBoostPower: 0,
  };
  enemies.push(enemy);
  return enemy;
}

function drawBossType() {
  if (bossBag.length === 0) {
    bossBag = shuffle(bossTypes);
  }
  return bossBag.pop();
}

function spawnBoss() {
  const base = drawBossType();
  const boss = spawnEnemy({ ...base, weight: () => 0 }, true);
  const cycle = Math.floor(bossIndex / bossTypes.length);
  const multiplier = 0.55 + bossIndex * 0.24 + cycle * 0.35;
  boss.hp *= multiplier;
  boss.maxHp = boss.hp;
  boss.damage *= 0.82 + bossIndex * 0.06;
  boss.score = Math.round(base.score * (1 + bossIndex * 0.25));
  boss.xp = Math.round(base.xp * (1 + bossIndex * 0.18));
  boss.radius = (base.radius + Math.min(14, bossIndex * 2)) * BOSS_SIZE_SCALE;
  bossIndex += 1;
  showBossBanner(base.name);
  addPopup("보스 등장", player.x, player.y - 90, "#ffe066", 1.8, 28);
  playSound("boss");
}

function updateBossSchedule() {
  if (enemies.some((enemy) => enemy.boss)) return;

  const timeUntilBoss = nextBossAt - player.elapsed;
  if (timeUntilBoss <= 5 && timeUntilBoss > 0 && bossWarningFor !== nextBossAt) {
    bossWarningFor = nextBossAt;
    showBossBanner("보스 접근 중");
  }

  if (player.elapsed >= nextBossAt) {
    spawnBoss();
    nextBossAt = player.elapsed + 55;
    bossWarningFor = 0;
  }
}

function showBossBanner(name) {
  refs.bossBanner.textContent = name;
  refs.bossBanner.classList.add("active");
  window.setTimeout(() => refs.bossBanner.classList.remove("active"), 2200);
}

function getMoveVector() {
  let x = input.x;
  let y = input.y;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) x -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) x += 1;
  if (keys.has("KeyW") || keys.has("ArrowUp")) y -= 1;
  if (keys.has("KeyS") || keys.has("ArrowDown")) y += 1;
  const len = Math.hypot(x, y);
  if (len > 1) {
    x /= len;
    y /= len;
  }
  return { x, y };
}

function findNearestEnemy(maxDistance = Infinity) {
  let nearest = null;
  let nearestDistance = maxDistance;
  for (const enemy of enemies) {
    const currentDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (currentDistance < nearestDistance) {
      nearest = enemy;
      nearestDistance = currentDistance;
    }
  }
  return nearest;
}

function fireBullets() {
  const target = findNearestEnemy(680);
  if (!target) return;
  const baseAngle = angleTo(player, target);
  const spread = Math.min(0.72, 0.14 * (player.shots - 1));
  for (let i = 0; i < player.shots; i += 1) {
    const offset = player.shots === 1 ? 0 : -spread / 2 + (spread * i) / (player.shots - 1);
    bullets.push({
      x: player.x + Math.cos(baseAngle + offset) * 24,
      y: player.y + Math.sin(baseAngle + offset) * 24,
      vx: Math.cos(baseAngle + offset) * player.bulletSpeed,
      vy: Math.sin(baseAngle + offset) * player.bulletSpeed,
      damage: player.damage,
      radius: 10,
      life: 1.35,
      pierce: Math.floor(player.shots / 3),
      color: "#fff2a8",
    });
  }
  playSound("shot");
}

function spawnCard() {
  if (weapons.card.level <= 0) return;
  const target = findNearestEnemy(820);
  if (!target) return;
  const angle = angleTo(player, target);
  const level = weapons.card.level;
  cards.push({
    x: player.x,
    y: player.y,
    vx: Math.cos(angle) * (500 + level * 18),
    vy: Math.sin(angle) * (500 + level * 18),
    damage: 20 + level * 18,
    life: 1.9,
    maxLife: 1.9,
    radius: 18 + level * 2,
    rotation: 0,
    returning: false,
    hits: new Set(),
    trail: [],
  });
  playSound("card");
}

function strikeLightning() {
  if (weapons.lightning.level <= 0 || enemies.length === 0) return;
  const strikes = Math.min(5, weapons.lightning.level);
  const targets = [...enemies]
    .sort((a, b) => distance(player, a) - distance(player, b))
    .slice(0, strikes + 2)
    .sort(() => Math.random() - 0.5)
    .slice(0, strikes);
  for (const enemy of targets) {
    damageEnemy(enemy, 34 + weapons.lightning.level * 22, "#9bf6ff");
    addParticles(enemy.x, enemy.y, "#9bf6ff", 6);
    damageZones.push({
      x: enemy.x,
      y: enemy.y,
      radius: 48 + weapons.lightning.level * 4,
      life: 0.34,
      maxLife: 0.34,
      color: "#9bf6ff",
      kind: "lightning",
      boltSeed: Math.random() * TAU,
    });
  }
  if (targets.length > 0) playSound("lightning");
}

function pickClusterTarget(maxDistance = 900) {
  const candidates = enemies.filter((enemy) => distance(player, enemy) < maxDistance);
  if (candidates.length === 0) return findNearestEnemy(maxDistance);
  return candidates
    .map((enemy) => ({
      enemy,
      score: candidates.filter((other) => Math.hypot(other.x - enemy.x, other.y - enemy.y) < 170).length,
    }))
    .sort((a, b) => b.score - a.score)[0].enemy;
}

function clampPointToVisibleWorld(x, y, margin = 90) {
  const safeMargin = Math.min(margin, width * 0.42, height * 0.42);
  return {
    x: clamp(x, camera.x + safeMargin, camera.x + width - safeMargin),
    y: clamp(y, camera.y + safeMargin, camera.y + height - safeMargin),
  };
}

function spawnLowKick() {
  const level = weapons.lowKick.level;
  if (level <= 0 || enemies.length === 0) return;
  const target = findNearestEnemy(860);
  if (!target) return;
  const angle = angleTo(player, target);
  damageZones.push({
    x: player.x,
    y: player.y,
    angle,
    arc: 2.12,
    radius: 232 + level * 44,
    damage: 30 + level * 22,
    push: 76 + level * 18,
    life: 0.42,
    maxLife: 0.42,
    color: "#ffb703",
    hits: new Set(),
    kind: "lowKick",
  });
  addParticles(player.x + Math.cos(angle) * 116, player.y + Math.sin(angle) * 116, "#ffb703", 14);
  playSound("lowKick");
}

function spawnAnnouncementWave() {
  const level = weapons.announcement.level;
  if (level <= 0) return;
  damageZones.push({
    x: player.x,
    y: player.y,
    radius: 104 + level * 45,
    damage: 18 + level * 18,
    push: 70 + level * 22,
    life: 0.62,
    maxLife: 0.62,
    color: "#fff3b0",
    hits: new Set(),
    kind: "wave",
  });
  playSound("announcement");
}

function spawnExpressTrain() {
  const level = weapons.expressTrain.level;
  if (level <= 0) return;
  const vertical = Math.random() < 0.5;
  const target = pickClusterTarget(1300);
  damageZones.push({
    x: target ? target.x : player.x,
    y: target ? target.y : player.y,
    vertical,
    width: 92 + level * 13,
    damage: 92 + level * 42,
    life: 0.58,
    maxLife: 0.58,
    color: "#f7d64a",
    hits: new Set(),
    kind: "train",
  });
  shake = Math.max(shake, 8);
  playSound("train");
}

function spawnTransferGate() {
  const level = weapons.transferGate.level;
  if (level <= 0 || enemies.length === 0) return;
  const target = pickClusterTarget(1000);
  if (!target) return;
  const crowdCount = Math.min(10, 4 + level * 2);
  const screenMargin = 46;
  const diagonalFlip = Math.random() < 0.5;
  const startScreen = diagonalFlip ? { x: -screenMargin, y: -screenMargin } : { x: width + screenMargin, y: -screenMargin };
  const endScreen = diagonalFlip ? { x: width + screenMargin, y: height + screenMargin } : { x: -screenMargin, y: height + screenMargin };
  const startWorld = { x: camera.x + startScreen.x, y: camera.y + startScreen.y };
  const endWorld = { x: camera.x + endScreen.x, y: camera.y + endScreen.y };
  const angle = Math.atan2(endWorld.y - startWorld.y, endWorld.x - startWorld.x);
  const pathLength = Math.hypot(endWorld.x - startWorld.x, endWorld.y - startWorld.y);
  damageZones.push({
    x: target.x,
    y: target.y,
    radius: 92 + level * 18,
    startX: startWorld.x,
    startY: startWorld.y,
    endX: endWorld.x,
    endY: endWorld.y,
    pathLength,
    damage: 22 + level * 18,
    push: 72 + level * 12,
    life: 1.7,
    maxLife: 1.7,
    color: "#b197fc",
    armedAt: 0.04,
    angle,
    commuters: Array.from({ length: crowdCount }, (_, index) => ({
      delay: index * 0.045 + rand(0, 0.08),
      lane: rand(-1, 1),
      speed: rand(0.68, 0.88),
      size: rand(15, 21),
    })),
    hits: new Set(),
    kind: "gate",
  });
  playSound("gate");
}

function explodeCustomerMissile(missile) {
  const level = weapons.customerMissile.level;
  const radius = 54 + level * 12;
  const damage = 45 + level * 24;
  damageZones.push({
    x: missile.x,
    y: missile.y,
    radius,
    damage,
    life: 0.34,
    maxLife: 0.34,
    color: "#80ffdb",
    hits: new Set(),
    kind: "missileExplosion",
  });
  addParticles(missile.x, missile.y, "#80ffdb", 14 + level * 2);
  addParticles(missile.x, missile.y, "#fff3b0", 8);
  shake = Math.max(shake, 5);
  playSound("explosion");
}

function spawnCustomerMissiles() {
  const level = weapons.customerMissile.level;
  if (level <= 0 || enemies.length === 0) return;
  const count = Math.min(5, 1 + Math.floor((level - 1) / 2));
  for (let i = 0; i < count; i += 1) {
    const target = findNearestEnemy(900 + level * 40);
    if (!target) return;
    const angle = angleTo(player, target) + (i - (count - 1) / 2) * 0.32;
    const speed = 210 + level * 18;
    missiles.push({
      x: player.x + Math.cos(angle) * 22,
      y: player.y + Math.sin(angle) * 22,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      turnRate: 7.2 + level * 0.5,
      damage: 32 + level * 15,
      radius: 8,
      life: 3.2,
      target,
      trail: [],
      delay: i * 0.08,
      color: "#80ffdb",
    });
  }
  playSound("missile");
}

function spawnCallBell() {
  const level = weapons.callBell.level;
  if (level <= 0 || enemies.length === 0) return;
  const target = findNearestEnemy(900 + level * 60);
  if (!target) return;
  const count = Math.min(3, 1 + Math.floor((level - 1) / 3));
  const baseAngle = angleTo(player, target);
  const spread = count === 1 ? 0 : 0.28;
  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + (count === 1 ? 0 : -spread / 2 + (spread * i) / (count - 1));
    const speed = 500 + level * 28;
    callBells.push({
      x: player.x + Math.cos(angle) * 24,
      y: player.y + Math.sin(angle) * 24,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: 28 + level * 16,
      radius: 14 + level * 0.6,
      pierce: 2 + Math.floor(level * 0.75),
      life: 1.35,
      rotation: Math.random() * TAU,
      hits: new Set(),
      trail: [],
    });
  }
  addParticles(player.x + Math.cos(baseAngle) * 42, player.y + Math.sin(baseAngle) * 42, "#ff6b6b", 8);
  playSound("bell");
}

function updatePlayer(delta) {
  const move = getMoveVector();
  const stunned = player.stunTimer > 0;
  player.slowTimer = Math.max(0, player.slowTimer - delta);
  if (player.slowTimer <= 0) player.slowMultiplier = 1;
  if (!stunned) {
    const currentSpeed = player.speed * player.slowMultiplier;
    player.x = clamp(player.x + move.x * currentSpeed * delta, 24, WORLD_SIZE - 24);
    player.y = clamp(player.y + move.y * currentSpeed * delta, 24, WORLD_SIZE - 24);
  }
  player.invuln = Math.max(0, player.invuln - delta);
  player.stunTimer = Math.max(0, player.stunTimer - delta);
  if (player.defenseBreakTimer > 0) {
    player.defenseBreakTimer = Math.max(0, player.defenseBreakTimer - delta);
    if (player.defenseBreakTimer <= 0) player.defenseBreakPower = 0;
  }
  if (player.regenLevel > 0 && player.hp < player.maxHp) {
    player.regenTimer -= delta;
    if (player.regenTimer <= 0) {
      healPlayer(3 + player.regenLevel * 2, false);
      player.regenTimer = Math.max(2.2, 5.2 - player.regenLevel * 0.32);
    }
  }
  player.fireCooldown -= delta;
  if (!stunned && player.fireCooldown <= 0) {
    fireBullets();
    player.fireCooldown = player.fireRate;
  }

  weapons.strapOrbit.angle += delta * (3.1 + weapons.strapOrbit.level * 0.18);
  weapons.lightning.cooldown -= delta;
  if (weapons.lightning.cooldown <= 0) {
    strikeLightning();
    weapons.lightning.cooldown = Math.max(1.25, 3.5 - weapons.lightning.level * 0.34);
  }

  weapons.card.cooldown -= delta;
  if (weapons.card.level > 0 && weapons.card.cooldown <= 0) {
    spawnCard();
    weapons.card.cooldown = Math.max(0.42, 1.45 - weapons.card.level * 0.13);
  }

  weapons.lowKick.cooldown -= delta;
  if (weapons.lowKick.level > 0 && weapons.lowKick.cooldown <= 0) {
    spawnLowKick();
    weapons.lowKick.cooldown = Math.max(0.95, 2.55 - weapons.lowKick.level * 0.22);
  }

  weapons.announcement.cooldown -= delta;
  if (weapons.announcement.level > 0 && weapons.announcement.cooldown <= 0) {
    spawnAnnouncementWave();
    weapons.announcement.cooldown = Math.max(1.45, (6.5 - weapons.announcement.level * 0.36) / 1.5);
  }

  weapons.expressTrain.cooldown -= delta;
  if (weapons.expressTrain.level > 0 && weapons.expressTrain.cooldown <= 0) {
    spawnExpressTrain();
    weapons.expressTrain.cooldown = Math.max(4.4, 9 - weapons.expressTrain.level * 0.45);
  }

  weapons.transferGate.cooldown -= delta;
  if (weapons.transferGate.level > 0 && weapons.transferGate.cooldown <= 0) {
    spawnTransferGate();
    weapons.transferGate.cooldown = Math.max(2.1, 6.8 - weapons.transferGate.level * 0.38);
  }

  weapons.customerMissile.cooldown -= delta;
  if (weapons.customerMissile.level > 0 && weapons.customerMissile.cooldown <= 0) {
    spawnCustomerMissiles();
    weapons.customerMissile.cooldown = Math.max(0.28, 0.55 - weapons.customerMissile.level * 0.04);
  }

  weapons.callBell.cooldown -= delta;
  if (weapons.callBell.level > 0 && weapons.callBell.cooldown <= 0) {
    spawnCallBell();
    weapons.callBell.cooldown = Math.max(0.9, 3.5 - weapons.callBell.level * 0.22);
  }

}

function updateEnemies(delta) {
  const minute = player.elapsed / 60;
  spawnTimer -= delta;
  const spawnGap = Math.max(0.09, 0.62 - minute * 0.075);
  if (spawnTimer <= 0) {
    const pack = 2 + Math.floor(minute * 1.2) + (Math.random() < 0.25 + minute * 0.1 ? 1 : 0);
    for (let i = 0; i < pack; i += 1) spawnEnemy();
    spawnTimer = spawnGap;
  }

  updateBossSchedule();

  for (const enemy of [...enemies]) {
    enemy.cooldown -= delta;
    enemy.attackSpeechCooldown = Math.max(0, (enemy.attackSpeechCooldown ?? 0) - delta);
    enemy.boostTimer = Math.max(0, (enemy.boostTimer ?? 0) - delta);
    if (enemy.boostTimer <= 0) enemy.speedBoostMultiplier = 1;
    enemy.defenseBoostTimer = Math.max(0, (enemy.defenseBoostTimer ?? 0) - delta);
    if (enemy.defenseBoostTimer <= 0) enemy.defenseBoostPower = 0;
    enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
    enemy.wobble += delta;
    let angle = angleTo(enemy, player);
    let speed = enemy.speed;
    const playerDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);

    if (enemy.special === "zigzag") {
      angle += Math.sin(enemy.wobble * 6) * 0.72;
      speed *= 1.08;
    }
    if (enemy.special === "spiral") {
      angle += Math.sin(enemy.wobble * 4.5) * 1.1;
    }
    if (enemy.special === "boss-dance" && enemy.retreatTimer > 0) {
      angle = angleTo(player, enemy);
      speed *= 1.9;
      enemy.retreatTimer = Math.max(0, enemy.retreatTimer - delta);
    }
    if (enemy.special === "boss-danso") {
      enemy.swingCooldown -= delta;
      enemy.shockCooldown -= delta;
      if (enemy.swingCooldown <= 0 && playerDistance < 190) {
        createDansoSwing(enemy);
        enemy.swingCooldown = rand(1.35, 2.05);
      }
      if (enemy.shockCooldown <= 0) {
        createDansoShockwave(enemy);
        enemy.shockCooldown = rand(3.8, 5.2);
      }
    }
    if (enemy.special === "boss-airport") {
      enemy.tauntCooldown -= delta;
      enemy.crisisCooldown -= delta;
      if (enemy.tauntCooldown <= 0) {
        createAirportTaunt(enemy);
        enemy.tauntCooldown = rand(6.5, 8.4);
      }
      if (enemy.crisisCooldown <= 0) {
        createAirportCrisis(enemy);
        enemy.crisisCooldown = rand(9.0, 11.5);
      }
    }
    if (enemy.special === "boss-jarvan") {
      enemy.flagCooldown -= delta;
      enemy.spearCooldown -= delta;
      if (enemy.flagCooldown <= 0) {
        createJarvanFlag(enemy);
        enemy.flagCooldown = rand(7.4, 9.6);
      }
      if (enemy.spearCooldown <= 0 && playerDistance < 320) {
        createJarvanSpear(enemy);
        enemy.spearCooldown = rand(3.0, 4.4);
      }
    }
    if (enemy.special === "boss-praise") {
      enemy.praiseCooldown -= delta;
      enemy.praiseStunCooldown -= delta;
      if (enemy.praiseCooldown <= 0) {
        createPraiseThumb(enemy);
        enemy.praiseCooldown = rand(1.4, 2.1);
      }
      if (enemy.praiseStunCooldown <= 0) {
        createPraiseStunWave(enemy);
        enemy.praiseStunCooldown = rand(5.6, 7.4);
      }
    }
    if (enemy.special === "boss-gum") {
      enemy.bubbleCooldown -= delta;
      enemy.gumMissileCooldown -= delta;
      if (enemy.bubbleCooldown <= 0) {
        createGumBubble(enemy);
        enemy.bubbleCooldown = rand(1.15, 1.8);
      }
      if (enemy.gumMissileCooldown <= 0) {
        createGumMissiles(enemy);
        enemy.gumMissileCooldown = rand(5.2, 7.0);
      }
    }
    if (enemy.special === "boss-dance") {
      speed *= 1.18;
      enemy.danceKickCooldown -= delta;
      enemy.danceStampCooldown -= delta;
      if (enemy.danceKickCooldown <= 0 && playerDistance < 180) {
        createDanceKick(enemy);
        enemy.danceKickCooldown = rand(2.0, 3.1);
      }
      if (enemy.danceStampCooldown <= 0) {
        createDanceStamp(enemy);
        enemy.danceStampCooldown = rand(5.5, 7.2);
      }
    }
    if (enemy.special === "luggage" || enemy.special === "boss-luggage") {
      if (enemy.cooldown <= 0) {
        enemy.dash = 0.35;
        enemy.cooldown = enemy.boss ? 2.8 : 4.2;
        dropFakeLuggage(enemy);
      }
      if (enemy.dash > 0) {
        speed *= enemy.boss ? 2.5 : 2.2;
        enemy.dash -= delta;
      }
    }
    if (
      enemy.special === "pulse" ||
      enemy.special === "shout" ||
      enemy.special === "boss-pulse" ||
      enemy.special === "boss-final"
    ) {
      if (enemy.cooldown <= 0) {
        const pulseRadius =
          enemy.special === "boss-jarvan" ? 178 : enemy.special === "boss-danso" ? 138 : enemy.boss ? 150 : enemy.special === "shout" ? 106 : 82;
        const pulseDamage = enemy.special === "boss-jarvan" ? 18 : enemy.special === "boss-danso" ? 16 : enemy.boss ? 12 : 7;
        createPulse(enemy, pulseRadius, pulseDamage);
        enemy.cooldown = enemy.boss ? 2.1 : enemy.special === "shout" ? 2.7 : 3.4;
      }
    }
    if (enemy.boostTimer > 0) speed *= enemy.speedBoostMultiplier ?? 1;

    enemy.x += Math.cos(angle) * speed * delta;
    enemy.y += Math.sin(angle) * speed * delta;

    const touchDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (touchDistance < enemy.radius + player.radius && player.invuln <= 0) {
      if (enemy.boss && enemy.attackSpeechCooldown <= 0) {
        const line =
          enemy.special === "boss-airport"
            ? "왜 나만 갈구냐고!"
            : enemy.special === "boss-jarvan"
              ? "젊은 것들 비켜라!"
              : enemy.special === "boss-danso"
                ? "너 까불지마!!"
                : enemy.special === "boss-praise"
                  ? "당신이 최고야?!"
                  : enemy.special === "boss-gum"
                    ? "버블팝!"
                    : enemy.special === "boss-dance"
                      ? "워킹 워킹"
                      : "비켜!";
        addSpeechBubble(enemy, line, 1.05);
        enemy.attackSpeechCooldown = 2.2;
      }
      hurtPlayer(enemy.damage);
      const push = angleTo(enemy, player);
      player.x += Math.cos(push) * 18;
      player.y += Math.sin(push) * 18;
    }
  }
}

function createPulse(enemy, radius, damage) {
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    radius,
    damage,
    life: 0.52,
    maxLife: 0.52,
    color: enemy.boss ? "#ff477e" : "#ffd166",
    hostile: true,
    applied: false,
  });
}

function createDansoSwing(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "너 누구야! who are you !! 확!", 1.35);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    angle,
    arc: 1.55,
    radius: 142,
    damage: 18,
    push: 42,
    life: 0.34,
    maxLife: 0.34,
    color: "#f9c74f",
    hostile: true,
    applied: false,
    kind: "dansoSwing",
  });
  addParticles(enemy.x + Math.cos(angle) * 62, enemy.y + Math.sin(angle) * 62, "#f9c74f", 10);
}

function createDansoShockwave(enemy) {
  addSpeechBubble(enemy, "너 까불지마!! 겁대가리 없으면 저승간다", 1.45);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    radius: 178,
    damage: 22,
    push: 64,
    life: 0.72,
    maxLife: 0.72,
    color: "#f9c74f",
    hostile: true,
    applied: false,
    kind: "dansoShock",
  });
  shake = Math.max(shake, 10);
  addParticles(enemy.x, enemy.y, "#f9c74f", 18);
  addPopup("단소 충격파", enemy.x, enemy.y - 34, "#fff3b0", 0.65, 15);
}

function createAirportTaunt(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "왜 나만 갈구냐고!", 1.25);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    angle,
    length: 210,
    width: 56,
    radius: 210,
    damage: 20,
    push: 70,
    life: 0.34,
    maxLife: 0.34,
    color: "#ffd166",
    hostile: true,
    applied: false,
    kind: "airportPoint",
  });
  addParticles(enemy.x + Math.cos(angle) * 80, enemy.y + Math.sin(angle) * 80, "#ffd166", 12);
}

function createAirportCrisis(enemy) {
  addSpeechBubble(enemy, "금융 위기 모르냐 금융위기 거지야~", 1.45);
  shake = Math.max(shake, 8);
  for (let i = 0; i < 12; i += 1) {
    const angle = (TAU * i) / 12 + rand(-0.16, 0.16);
    damageZones.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * rand(180, 330),
      vy: Math.sin(angle) * rand(180, 330),
      radius: 17,
      damage: 12,
      life: 1.25,
      maxLife: 1.25,
      color: "#80ffdb",
      hostile: true,
      consumeOnHit: true,
      applied: false,
      kind: "dollarBill",
    });
  }
  addParticles(enemy.x, enemy.y, "#80ffdb", 20);
}

function createJarvanFlag(enemy) {
  const flagRadius = 540;
  let guarded = 0;
  for (const target of enemies) {
    if (target === enemy || target.boss) continue;
    if (Math.hypot(target.x - enemy.x, target.y - enemy.y) > flagRadius) continue;
    target.defenseBoostTimer = Math.max(target.defenseBoostTimer ?? 0, 5.4);
    target.defenseBoostPower = Math.max(target.defenseBoostPower ?? 0, 0.42);
    addParticles(target.x, target.y, "#f9c74f", 5);
    guarded += 1;
  }
  addSpeechBubble(enemy, "경로우대 깃발!", 1.25);
  addParticles(enemy.x, enemy.y, "#f9c74f", 24);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    radius: flagRadius,
    life: 0.68,
    maxLife: 0.68,
    color: "#f9c74f",
    kind: "jarvanFlag",
  });
  if (guarded > 0) addPopup(`방어 증가 x${guarded}`, enemy.x, enemy.y - 28, "#fff3b0", 0.82, 14);
}

function createJarvanSpear(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "지팡이 창술!", 1.05);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    angle,
    length: 238,
    width: 58,
    radius: 238,
    damage: 24,
    push: 86,
    stun: 0.46,
    life: 0.44,
    maxLife: 0.44,
    color: "#ffe066",
    hostile: true,
    applied: false,
    kind: "jarvanSpear",
  });
  addParticles(enemy.x + Math.cos(angle) * 82, enemy.y + Math.sin(angle) * 82, "#ffe066", 14);
}

function createPraiseThumb(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "당신이 최고야?!", 1.1);
  damageZones.push({
    x: enemy.x + Math.cos(angle) * 42,
    y: enemy.y + Math.sin(angle) * 42,
    vx: Math.cos(angle) * 420,
    vy: Math.sin(angle) * 420,
    radius: 24,
    damage: 18,
    life: 1.25,
    maxLife: 1.25,
    color: "#c77dff",
    hostile: true,
    consumeOnHit: true,
    applied: false,
    kind: "thumbShot",
  });
}

function createPraiseStunWave(enemy) {
  addSpeechBubble(enemy, "꼼짝 못해!", 1.25);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    radius: 230,
    damage: 12,
    stun: 3,
    life: 0.78,
    maxLife: 0.78,
    color: "#c77dff",
    hostile: true,
    applied: false,
    kind: "praiseWave",
  });
  shake = Math.max(shake, 7);
}

function createGumBubble(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "버블팝!", 1.0);
  damageZones.push({
    x: enemy.x + Math.cos(angle) * 42,
    y: enemy.y + Math.sin(angle) * 42,
    vx: Math.cos(angle) * 310,
    vy: Math.sin(angle) * 310,
    radius: 25,
    damage: 15,
    slow: 10,
    slowMultiplier: 0.55,
    life: 1.6,
    maxLife: 1.6,
    color: "#ff8fab",
    hostile: true,
    consumeOnHit: true,
    applied: false,
    kind: "gumBubble",
  });
}

function createGumMissiles(enemy) {
  addSpeechBubble(enemy, "츄잉 츄잉!", 1.2);
  const count = 1;
  const baseAngle = angleTo(enemy, player);
  for (let i = 0; i < count; i += 1) {
    const angle = baseAngle + (i - (count - 1) / 2) * 0.24;
    damageZones.push({
      x: enemy.x + Math.cos(angle) * 38,
      y: enemy.y + Math.sin(angle) * 38,
      vx: Math.cos(angle) * 260,
      vy: Math.sin(angle) * 260,
      radius: 30,
      damage: 19,
      slow: 10,
      slowMultiplier: 0.5,
      life: 2.0,
      maxLife: 2.0,
      color: "#ff8fab",
      hostile: true,
      consumeOnHit: true,
      applied: false,
      kind: "gumMissile",
    });
  }
}

function createDanceKick(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "워킹 워킹", 1.0);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    angle,
    arc: 1.25,
    radius: 120,
    damage: 21,
    push: 72,
    life: 0.32,
    maxLife: 0.32,
    color: "#c77dff",
    hostile: true,
    applied: false,
    kind: "danceKick",
  });
  enemy.retreatTimer = 0.75;
}

function createDanceStamp(enemy) {
  addSpeechBubble(enemy, "하이힐 스탬프!", 1.15);
  damageZones.push({
    x: player.x,
    y: player.y,
    radius: 118,
    damage: 26,
    push: 54,
    life: 0.86,
    maxLife: 0.86,
    color: "#c77dff",
    hostile: true,
    armedAt: 0.34,
    applied: false,
    kind: "danceStamp",
  });
  shake = Math.max(shake, 6);
}

function dropFakeLuggage(enemy) {
  const count = enemy.boss ? 8 : 3;
  if (enemy.boss) addSpeechBubble(enemy, "수하물 챙겨!", 1.05);
  for (let i = 0; i < count; i += 1) {
    const angle = (TAU * i) / count + Math.random() * 0.4;
    damageZones.push({
      x: enemy.x + Math.cos(angle) * rand(40, 115),
      y: enemy.y + Math.sin(angle) * rand(40, 115),
      radius: enemy.boss ? 42 : 30,
      damage: enemy.boss ? 14 : 8,
      life: 2.3,
      maxLife: 2.3,
      color: "#74c0fc",
      hostile: true,
      trap: true,
      applied: false,
    });
  }
}

function hurtPlayer(amount) {
  const effectiveReduction = clamp(player.damageReduction - player.defenseBreakPower, -0.5, 0.6);
  const reducedAmount = Math.max(1, Math.round(amount * (1 - effectiveReduction)));
  player.hp = Math.max(0, player.hp - reducedAmount);
  player.invuln = 0.45;
  shake = Math.max(shake, 9);
  playSound("playerHit");
  addPopup(`-${reducedAmount}`, player.x, player.y - 28, "#ff6b6b", 0.7, 16);
  if (player.hp <= 0) endGame(false);
  updateHud();
}

function updateProjectiles(delta) {
  for (const bullet of [...bullets]) {
    bullet.x += bullet.vx * delta;
    bullet.y += bullet.vy * delta;
    bullet.life -= delta;
    for (const enemy of [...enemies]) {
      if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + bullet.radius) {
        damageEnemy(enemy, bullet.damage);
        bullet.pierce -= 1;
        if (bullet.pierce < 0) bullet.life = 0;
        break;
      }
    }
    if (bullet.life <= 0) bullets.splice(bullets.indexOf(bullet), 1);
  }

  for (const card of [...cards]) {
    card.trail.push({ x: card.x, y: card.y, life: 0.22 });
    if (card.trail.length > 12) card.trail.shift();
    for (const point of card.trail) point.life -= delta;
    card.trail = card.trail.filter((point) => point.life > 0);

    card.x += card.vx * delta;
    card.y += card.vy * delta;
    card.rotation += delta * (12 + weapons.card.level * 1.8);
    card.life -= delta;
    const traveled = Math.hypot(card.x - player.x, card.y - player.y);
    if (!card.returning && (card.life < card.maxLife * 0.54 || traveled > 360 + weapons.card.level * 30)) {
      card.returning = true;
    }
    if (card.returning) {
      const angle = angleTo(card, player);
      const returnSpeed = 560 + weapons.card.level * 24;
      card.vx = Math.cos(angle) * returnSpeed;
      card.vy = Math.sin(angle) * returnSpeed;
    }
    for (const enemy of [...enemies]) {
      if (!card.hits.has(enemy) && Math.hypot(enemy.x - card.x, enemy.y - card.y) < enemy.radius + card.radius) {
        card.hits.add(enemy);
        damageEnemy(enemy, card.damage, "#80ffdb");
      }
    }
    if (card.life <= 0 || (card.returning && Math.hypot(card.x - player.x, card.y - player.y) < 26)) {
      cards.splice(cards.indexOf(card), 1);
    }
  }

  for (const missile of [...missiles]) {
    missile.life -= delta;
    missile.delay = Math.max(0, missile.delay - delta);
    missile.trail.push({ x: missile.x, y: missile.y, life: 0.28 });
    if (missile.trail.length > 14) missile.trail.shift();
    for (const point of missile.trail) point.life -= delta;
    missile.trail = missile.trail.filter((point) => point.life > 0);

    if (missile.delay <= 0) {
      if (!missile.target || !enemies.includes(missile.target)) missile.target = findNearestEnemy(980);
      if (missile.target) {
        const desired = angleTo(missile, missile.target);
        const current = Math.atan2(missile.vy, missile.vx);
        const next = current + clamp(angleDelta(desired, current), -missile.turnRate * delta, missile.turnRate * delta);
        missile.vx = Math.cos(next) * missile.speed;
        missile.vy = Math.sin(next) * missile.speed;
      }
      missile.x += missile.vx * delta;
      missile.y += missile.vy * delta;
    }

    let exploded = false;
    for (const enemy of [...enemies]) {
      if (Math.hypot(enemy.x - missile.x, enemy.y - missile.y) < enemy.radius + missile.radius) {
        damageEnemy(enemy, missile.damage, "#80ffdb");
        explodeCustomerMissile(missile);
        missiles.splice(missiles.indexOf(missile), 1);
        exploded = true;
        break;
      }
    }
    if (!exploded && missile.life <= 0) {
      explodeCustomerMissile(missile);
      missiles.splice(missiles.indexOf(missile), 1);
    }
  }

  for (const bell of [...callBells]) {
    bell.trail.push({ x: bell.x, y: bell.y, life: 0.24 });
    if (bell.trail.length > 10) bell.trail.shift();
    for (const point of bell.trail) point.life -= delta;
    bell.trail = bell.trail.filter((point) => point.life > 0);
    bell.x += bell.vx * delta;
    bell.y += bell.vy * delta;
    bell.rotation += delta * 13;
    bell.life -= delta;

    for (const enemy of [...enemies]) {
      if (bell.hits.has(enemy)) continue;
      if (Math.hypot(enemy.x - bell.x, enemy.y - bell.y) < enemy.radius + bell.radius) {
        bell.hits.add(enemy);
        damageEnemy(enemy, bell.damage, "#ff6b6b");
        addParticles(enemy.x, enemy.y, "#ff6b6b", 7);
        bell.pierce -= 1;
        if (bell.pierce < 0) bell.life = 0;
      }
    }
    if (bell.life <= 0) callBells.splice(callBells.indexOf(bell), 1);
  }

  updateBlade(delta);
}

function updateBlade() {
  if (weapons.strapOrbit.level > 0) {
    const strapCount = Math.min(7, weapons.strapOrbit.level + 2);
    const strapRadius = 58 + weapons.strapOrbit.level * 6;
    const strapDamage = 10 + weapons.strapOrbit.level * 8;
    for (let i = 0; i < strapCount; i += 1) {
      const strapAngle = weapons.strapOrbit.angle + (TAU * i) / strapCount;
      const strap = {
        x: player.x + Math.cos(strapAngle) * strapRadius,
        y: player.y + Math.sin(strapAngle) * strapRadius,
        radius: 13,
      };
      for (const enemy of [...enemies]) {
        if (Math.hypot(enemy.x - strap.x, enemy.y - strap.y) < enemy.radius + strap.radius) {
          if (!enemy.lastStrapHit || performance.now() - enemy.lastStrapHit > 260) {
            enemy.lastStrapHit = performance.now();
            damageEnemy(enemy, strapDamage, "#ffd6a5");
          }
        }
      }
    }
  }
}

function damageEnemy(enemy, amount, color = "#fff2a8") {
  const guarded = enemy.defenseBoostTimer > 0 ? enemy.defenseBoostPower ?? 0 : 0;
  const finalAmount = Math.max(1, Math.round(amount * (1 - guarded)));
  enemy.hp -= finalAmount;
  enemy.hitFlash = 0.08;
  playSound("hit");
  addParticles(enemy.x, enemy.y, guarded > 0 ? "#ffe066" : color, enemy.boss ? 14 : 7);
  if (guarded > 0 && Math.random() < 0.35) addPopup("방어", enemy.x, enemy.y - enemy.radius, "#fff3b0", 0.45, 12);
  if (enemy.hp <= 0) killEnemy(enemy);
}

function killEnemy(enemy) {
  const index = enemies.indexOf(enemy);
  if (index >= 0) enemies.splice(index, 1);
  player.kills += 1;
  player.score += enemy.score;
  addPopup(`+${enemy.score}`, enemy.x, enemy.y - enemy.radius, "#ffe066", 0.75, 15);
  dropXp(enemy.x, enemy.y, enemy.xp);
  dropEnergy(enemy);
  if (enemy.boss) {
    playSound("bossKill");
    grantFirstAidKit(1, enemy.x, enemy.y);
    shake = Math.max(shake, 18);
    for (let i = 0; i < 16; i += 1) dropXp(enemy.x + rand(-45, 45), enemy.y + rand(-45, 45), 12);
    nextBossAt = player.elapsed + Math.max(34, 46 - Math.min(12, bossIndex * 2));
    bossWarningFor = 0;
    showBossBanner("다음 보스 대기");
  } else {
    playSound("kill");
  }
  updateHud();
}

function grantFirstAidKit(count = 1, x = player.x, y = player.y) {
  player.firstAidKits += count;
  addPopup(`구급팩 +${count}`, x, y - 24, "#b8ffe4", 0.9, 16);
  playSound("heal");
  updateHud();
}

function dropEnergy(enemy) {
  const guaranteed = enemy.boss;
  const dropChance = enemy.boss ? 1 : 1 / 500;
  if (!guaranteed && Math.random() > dropChance) return;

  const count = 1;
  const heal = enemy.boss ? Math.round(player.maxHp * 0.2) : Math.round(rand(14, 23));
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * TAU;
    const distance = enemy.boss ? rand(12, 54) : rand(6, 20);
    energyPickups.push({
      x: enemy.x + Math.cos(angle) * distance,
      y: enemy.y + Math.sin(angle) * distance,
      heal: count > 1 ? Math.round(heal / count) : heal,
      radius: enemy.boss ? 13 : 10,
      boss: enemy.boss,
      pulse: Math.random() * TAU,
      vx: Math.cos(angle) * rand(22, 68),
      vy: Math.sin(angle) * rand(22, 68),
    });
  }
}

function dropXp(x, y, amount) {
  const pieces = Math.max(1, Math.ceil(amount / 9));
  for (let i = 0; i < pieces; i += 1) {
    const angle = Math.random() * TAU;
    orbs.push({
      x: x + Math.cos(angle) * rand(6, 24),
      y: y + Math.sin(angle) * rand(6, 24),
      value: amount / pieces,
      radius: amount > 25 ? 4.2 : 3.2,
      vx: Math.cos(angle) * rand(25, 70),
      vy: Math.sin(angle) * rand(25, 70),
    });
  }
}

function updateOrbs(delta) {
  for (const orb of [...orbs]) {
    const d = Math.hypot(player.x - orb.x, player.y - orb.y);
    if (d < player.magnet) {
      const angle = angleTo(orb, player);
      const pull = 520 + (1 - d / player.magnet) * 1320;
      orb.vx += Math.cos(angle) * pull * delta;
      orb.vy += Math.sin(angle) * pull * delta;
    }
    orb.x += orb.vx * delta;
    orb.y += orb.vy * delta;
    orb.vx *= 0.965;
    orb.vy *= 0.965;
    if (d < player.radius + orb.radius + 6) {
      gainXp(orb.value);
      playSound("xp");
      orbs.splice(orbs.indexOf(orb), 1);
    }
  }
}

function updateEnergyPickups(delta) {
  for (const pickup of [...energyPickups]) {
    pickup.pulse += delta * 7;
    const d = Math.hypot(player.x - pickup.x, player.y - pickup.y);
    const attractRange = pickup.boss ? player.magnet * 1.65 : player.magnet * 1.12;
    if (d < attractRange) {
      const angle = angleTo(pickup, player);
      const pull = 360 + (1 - d / attractRange) * 1180;
      pickup.vx += Math.cos(angle) * pull * delta;
      pickup.vy += Math.sin(angle) * pull * delta;
    }
    pickup.x += pickup.vx * delta;
    pickup.y += pickup.vy * delta;
    pickup.vx *= 0.92;
    pickup.vy *= 0.92;
    if (d < player.radius + pickup.radius + 8) {
      healPlayer(Math.round(pickup.heal));
      playSound("heal");
      if (pickup.kind === "firstAid") addPopup("구급팩", pickup.x, pickup.y - 18, "#b8ffe4", 0.8, 14);
      addParticles(pickup.x, pickup.y, "#36d399", pickup.boss ? 18 : 10);
      energyPickups.splice(energyPickups.indexOf(pickup), 1);
    }
  }
}

function healPlayer(amount, showPopup = true) {
  const before = player.hp;
  player.hp = Math.min(player.maxHp, player.hp + amount);
  const restored = Math.round(player.hp - before);
  if (showPopup) addPopup(restored > 0 ? `+${restored}` : "MAX", player.x, player.y - 34, "#36d399", 0.7, 16);
  updateHud();
}

function useFirstAidKit() {
  if (game.state !== "playing" || game.paused || game.pendingHeroChoice || player.firstAidKits <= 0 || player.hp >= player.maxHp) {
    if (player.hp >= player.maxHp) addPopup("MAX", player.x, player.y - 34, "#b8ffe4", 0.55, 14);
    return;
  }
  player.firstAidKits -= 1;
  healPlayer(Math.round(player.maxHp * FIRST_AID_HEAL_RATIO));
  addPopup("구급팩 사용", player.x, player.y - 56, "#b8ffe4", 0.75, 15);
  playSound("heal");
  updateHud();
}

function getNextXpRequirement(previousRequirement, level) {
  const growth = 1.14 + Math.min(0.18, level * 0.012);
  const levelBonus = 14 + level * 3;
  return Math.max(12, Math.round((previousRequirement * growth + levelBonus) * player.xpNeedMultiplier));
}

function gainXp(amount) {
  player.xp += amount;
  while (player.xp >= player.nextXp) {
    player.xp -= player.nextXp;
    player.level += 1;
    player.nextXp = getNextXpRequirement(player.nextXp, player.level);
    playSound("levelUp");
    openUpgradePanel();
  }
  updateHud();
}

function openUpgradePanel() {
  game.paused = true;
  if (refs.upgradeTitle) {
    refs.upgradeTitle.textContent =
      game.pendingStarterChoices > 0 ? `기본 스킬 선택 ${4 - game.pendingStarterChoices}/3` : "레벨 업";
  }
  const starterPool = upgradePool.filter((choice) => choice && weaponUpgradeIds.has(choice.id));
  const choicePool = game.pendingStarterChoices > 0 ? starterPool : upgradePool;
  const choices = pickUpgradeChoices(choicePool, 3, game.pendingStarterChoices <= 0);
  refs.upgradeChoices.innerHTML = "";
  for (const choice of choices) {
    const button = document.createElement("button");
    button.className = "upgrade-card";
    button.type = "button";
    button.innerHTML = `<strong>${choice.name}</strong><span>${choice.desc}</span>`;
    button.addEventListener("click", () => {
      playSound("ui");
      choice.apply();
      if (game.pendingStarterChoices > 0) {
        game.pendingStarterChoices -= 1;
        updateHud();
        if (game.pendingStarterChoices > 0) {
          openUpgradePanel();
          return;
        }
      }
      refs.upgradePanel.classList.add("hidden");
      if (refs.upgradeTitle) refs.upgradeTitle.textContent = "레벨 업";
      game.manualPaused = false;
      game.paused = false;
      updateHud();
    });
    refs.upgradeChoices.append(button);
  }
  refs.upgradePanel.classList.remove("hidden");
}

function updateDamageZones(delta) {
  for (const zone of [...damageZones]) {
    zone.life -= delta;
    const progress = 1 - zone.life / zone.maxLife;
    if (zone.vx || zone.vy) {
      zone.x += (zone.vx ?? 0) * delta;
      zone.y += (zone.vy ?? 0) * delta;
    }
    if (zone.kind === "bomb") {
      const safePoint = clampPointToVisibleWorld(zone.x, zone.y, Math.min(132, zone.radius + 26));
      zone.x = safePoint.x;
      zone.y = safePoint.y;
    }
    if (zone.hostile) {
      const active = zone.vx || zone.vy ? true : zone.armedAt ? progress >= zone.armedAt : zone.trap ? zone.life < zone.maxLife - 0.25 : zone.life < zone.maxLife * 0.72;
      const distanceToPlayer = Math.hypot(player.x - zone.x, player.y - zone.y);
      let hitPlayer = distanceToPlayer < zone.radius + player.radius;
      if (zone.kind === "dansoSwing") {
        const swingAngle = angleTo(zone, player);
        hitPlayer = hitPlayer && Math.abs(angleDelta(swingAngle, zone.angle)) < zone.arc / 2;
      } else if (zone.kind === "danceKick") {
        const kickAngle = angleTo(zone, player);
        hitPlayer = hitPlayer && Math.abs(angleDelta(kickAngle, zone.angle)) < zone.arc / 2;
      } else if (zone.kind === "jarvanSpear" || zone.kind === "airportPoint") {
        const dx = player.x - zone.x;
        const dy = player.y - zone.y;
        const forward = Math.cos(zone.angle) * dx + Math.sin(zone.angle) * dy;
        const side = Math.abs(-Math.sin(zone.angle) * dx + Math.cos(zone.angle) * dy);
        hitPlayer = forward > 0 && forward < zone.length + player.radius && side < zone.width / 2 + player.radius;
      }
      if (active && !zone.applied && hitPlayer) {
        hurtPlayer(zone.damage);
        zone.applied = true;
        if (zone.push) {
          const push = zone.kind === "jarvanSpear" || zone.kind === "airportPoint" ? zone.angle : angleTo(zone, player);
          player.x += Math.cos(push) * zone.push;
          player.y += Math.sin(push) * zone.push;
        }
        if (zone.stun) {
          player.stunTimer = Math.max(player.stunTimer, zone.stun);
          addPopup("경직", player.x, player.y - 62, "#fff3b0", 0.55, 15);
        }
        if (zone.slow) {
          player.slowTimer = Math.max(player.slowTimer, zone.slow);
          player.slowMultiplier = Math.min(player.slowMultiplier, zone.slowMultiplier ?? 0.6);
          addPopup("느려짐", player.x, player.y - 62, "#ffb3c6", 0.65, 15);
        }
        if (zone.consumeOnHit) zone.life = 0;
      }
      if (zone.trap && zone.applied) zone.life = Math.min(zone.life, 0.25);
    } else if (zone.damage) {
      const armed = zone.armedAt ? progress >= zone.armedAt : true;
      if (zone.kind === "bomb" && armed && !zone.exploded) {
        zone.exploded = true;
        shake = Math.max(shake, 10);
        addParticles(zone.x, zone.y, "#ff6b6b", 18);
        addParticles(zone.x, zone.y, "#ffd166", 14);
        addPopup("쾅!", zone.x, zone.y - 18, "#fff3b0", 0.45, 18);
      }
      if (armed) {
        for (const enemy of [...enemies]) {
          if (zone.hits?.has(enemy)) continue;
          let hit = false;
          if (zone.kind === "train") {
            hit = zone.vertical ? Math.abs(enemy.x - zone.x) < zone.width / 2 + enemy.radius : Math.abs(enemy.y - zone.y) < zone.width / 2 + enemy.radius;
          } else if (zone.kind === "lowKick") {
            const distanceToEnemy = Math.hypot(enemy.x - zone.x, enemy.y - zone.y);
            const kickAngle = angleTo(zone, enemy);
            hit = distanceToEnemy < zone.radius + enemy.radius && Math.abs(angleDelta(kickAngle, zone.angle)) < zone.arc / 2;
          } else if (zone.kind === "gate") {
            const angle = zone.angle ?? 0;
            const sideAngle = angle + Math.PI / 2;
            const pathLength = zone.pathLength ?? zone.radius * 2.65;
            for (const commuter of zone.commuters ?? []) {
              const t = clamp((progress - commuter.delay) / 1.12 * commuter.speed, 0, 1);
              if (t <= 0 || t >= 1) continue;
              const lane = commuter.lane * zone.radius * 0.95;
              const commuterX = zone.startX + Math.cos(angle) * pathLength * t + Math.cos(sideAngle) * lane;
              const commuterY = zone.startY + Math.sin(angle) * pathLength * t + Math.sin(sideAngle) * lane;
              if (Math.hypot(enemy.x - commuterX, enemy.y - commuterY) < enemy.radius + commuter.size * 1.35) {
                hit = true;
                break;
              }
            }
          } else {
            hit = Math.hypot(enemy.x - zone.x, enemy.y - zone.y) < zone.radius + enemy.radius;
          }
          if (!hit) continue;
          zone.hits?.add(enemy);
          damageEnemy(enemy, zone.damage, zone.color);
          if (zone.push) {
            const push = zone.kind === "gate" ? zone.angle ?? angleTo(zone, enemy) : angleTo(zone, enemy);
            enemy.x += Math.cos(push) * zone.push;
            enemy.y += Math.sin(push) * zone.push;
          }
        }
      }
    }
    if (zone.life <= 0) damageZones.splice(damageZones.indexOf(zone), 1);
  }
}

function addParticles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * TAU;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * rand(50, 190),
      vy: Math.sin(angle) * rand(50, 190),
      life: rand(0.18, 0.42),
      maxLife: 0.42,
      radius: rand(2, 5),
      color,
    });
  }
}

function addPopup(text, x, y, color, life, size) {
  popups.push({ text, x, y, color, life, maxLife: life, size });
}

function addSpeechBubble(target, text, life = 1.35) {
  if (!target) return;
  speechBubbles.push({
    target,
    text,
    x: target.x,
    y: target.y,
    life,
    maxLife: life,
  });
  if (speechBubbles.length > 8) speechBubbles.shift();
}

function wrapCanvasText(text, maxWidth) {
  const chars = [...String(text ?? "")];
  const lines = [];
  let line = "";
  for (const char of chars) {
    const next = line + char;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line.trimEnd());
      line = char.trimStart();
    } else {
      line = next;
    }
  }
  if (line) lines.push(line.trimEnd());
  return lines.length ? lines : [""];
}

function updateEffects(delta) {
  for (const particle of [...particles]) {
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vx *= 0.9;
    particle.vy *= 0.9;
    particle.life -= delta;
    if (particle.life <= 0) particles.splice(particles.indexOf(particle), 1);
  }
  for (const popup of [...popups]) {
    popup.y -= 34 * delta;
    popup.life -= delta;
    if (popup.life <= 0) popups.splice(popups.indexOf(popup), 1);
  }
  for (const bubble of [...speechBubbles]) {
    if (bubble.target && enemies.includes(bubble.target)) {
      bubble.x = bubble.target.x;
      bubble.y = bubble.target.y;
    }
    bubble.life -= delta;
    if (bubble.life <= 0) speechBubbles.splice(speechBubbles.indexOf(bubble), 1);
  }
  shake = Math.max(0, shake - delta * 24);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeLeaderboard(entries) {
  return (Array.isArray(entries) ? entries : [])
    .map((entry) => ({
      name: String(entry.name || "이름없음").slice(0, 12),
      score: Math.max(0, Math.round(Number(entry.score) || 0)),
      hero: String(entry.hero || "").slice(0, 12),
      survivedSeconds: Math.max(0, Math.round(Number(entry.survivedSeconds) || 0)),
    }))
    .sort((a, b) => b.score - a.score || b.survivedSeconds - a.survivedSeconds)
    .slice(0, LEADERBOARD_LIMIT);
}

function readLocalLeaderboard() {
  try {
    return normalizeLeaderboard(JSON.parse(localStorage.getItem(LOCAL_LEADERBOARD_KEY) || "[]"));
  } catch {
    return [];
  }
}

function saveLocalLeaderboard(entries) {
  const normalized = normalizeLeaderboard(entries);
  localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(normalized));
  return normalized;
}

function applyLeaderboard(entries) {
  leaderboardEntries = normalizeLeaderboard(entries);
  if (leaderboardEntries[0]) {
    bestScore = Math.max(bestScore, leaderboardEntries[0].score);
    localStorage.setItem(STORAGE_KEY, String(bestScore));
  }
  renderLeaderboard();
  updateHud();
  return leaderboardEntries;
}

function isTopTenScore(score) {
  if (score <= 0) return false;
  if (leaderboardEntries.length < LEADERBOARD_LIMIT) return true;
  return score >= leaderboardEntries[leaderboardEntries.length - 1].score;
}

function renderLeaderboard() {
  if (!refs.leaderboardList) return;
  refs.leaderboardList.innerHTML =
    leaderboardEntries.length > 0
      ? leaderboardEntries
          .map(
            (entry, index) => `
              <li>
                <strong>${index + 1}</strong>
                <span>${escapeHtml(entry.name)}</span>
                <span>${entry.score}점</span>
              </li>
            `,
          )
          .join("")
      : `<li><strong>-</strong><span>아직 등록된 랭킹이 없습니다</span><span>0점</span></li>`;
}

async function loadLeaderboard() {
  try {
    const response = await fetch(LEADERBOARD_API, { cache: "no-store" });
    if (!response.ok) throw new Error("leaderboard_load_failed");
    const data = await response.json();
    return applyLeaderboard(data.entries);
  } catch {
    return applyLeaderboard(readLocalLeaderboard());
  }
}

async function prepareLeaderboardEntry() {
  if (!refs.leaderboardPanel) return;
  refs.leaderboardPanel.classList.remove("hidden");
  refs.rankForm?.classList.add("hidden");
  if (refs.rankHint) refs.rankHint.textContent = "랭킹 확인 중";

  await loadLeaderboard();

  if (isTopTenScore(player.score)) {
    pendingLeaderboardScore = {
      score: player.score,
      hero: player.heroName,
      survivedSeconds: Math.floor(player.elapsed),
    };
    refs.rankForm?.classList.remove("hidden");
    if (refs.rankHint) refs.rankHint.textContent = "TOP 10 진입! 이름을 등록하세요";
    window.setTimeout(() => refs.playerNameInput?.focus(), 120);
  } else if (refs.rankHint) {
    refs.rankHint.textContent = "TOP 10 밖입니다";
  }
}

async function submitLeaderboardEntry(event) {
  event.preventDefault();
  if (!pendingLeaderboardScore || leaderboardSubmitting) return;
  leaderboardSubmitting = true;
  if (refs.submitScoreButton) refs.submitScoreButton.disabled = true;
  const name = refs.playerNameInput?.value.trim() || "이름없음";

  try {
    const response = await fetch(LEADERBOARD_API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...pendingLeaderboardScore, name }),
    });
    if (!response.ok) throw new Error("leaderboard_submit_failed");
    const data = await response.json();
    leaderboardEntries = normalizeLeaderboard(data.entries);
    pendingLeaderboardScore = null;
    refs.rankForm?.classList.add("hidden");
    if (refs.rankHint) refs.rankHint.textContent = "서버 랭킹 등록 완료";
    renderLeaderboard();
  } catch {
    leaderboardEntries = saveLocalLeaderboard([...leaderboardEntries, { ...pendingLeaderboardScore, name }]);
    pendingLeaderboardScore = null;
    refs.rankForm?.classList.add("hidden");
    if (refs.rankHint) refs.rankHint.textContent = "기기 랭킹에 등록 완료";
    renderLeaderboard();
    updateHud();
  } finally {
    leaderboardSubmitting = false;
    if (refs.submitScoreButton) refs.submitScoreButton.disabled = false;
  }
}

function update(delta) {
  if (game.state !== "playing" || game.paused || !player.alive) return;
  player.elapsed += delta;
  updatePlayer(delta);
  updateEnemies(delta);
  updateProjectiles(delta);
  updateOrbs(delta);
  updateEnergyPickups(delta);
  updateDamageZones(delta);
  updateEffects(delta);
  if (player.elapsed >= MAX_RUN_TIME) endGame(true);
  updateHud();
}

function endGame(won) {
  playSound(won ? "levelUp" : "gameOver");
  player.alive = false;
  game.state = "ended";
  game.manualPaused = false;
  bestScore = Math.max(bestScore, player.score);
  localStorage.setItem(STORAGE_KEY, String(bestScore));
  refs.messageTitle.textContent = won ? "작전 성공" : "작전 종료";
  refs.messageText.textContent = won
    ? `20분을 버텼습니다. 최종 점수 ${player.score}점.`
    : `최종 점수 ${player.score}점. 다시 출동할 수 있습니다.`;
  refs.startButton.textContent = "다시 출동";
  refs.message.classList.remove("start-screen");
  refs.message.classList.remove("hidden");
  prepareLeaderboardEntry();
  updateHud();
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}

function updateHud() {
  refs.hp.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;
  refs.hpFill.style.transform = `scaleX(${clamp(player.hp / player.maxHp, 0, 1)})`;
  refs.level.textContent = player.level;
  refs.time.textContent = formatTime(player.elapsed);
  refs.score.textContent = player.score;
  refs.xpFill.style.transform = `scaleX(${clamp(player.xp / player.nextXp, 0, 1)})`;
  refs.bestScore.textContent = bestScore;
  if (refs.firstAidCount) refs.firstAidCount.textContent = player.firstAidKits;
  if (refs.firstAidButton) refs.firstAidButton.disabled = player.firstAidKits <= 0 || player.hp >= player.maxHp || game.state !== "playing" || game.paused;
  if (refs.pauseButton) {
    refs.pauseButton.disabled = game.state !== "playing" || game.pendingHeroChoice || game.pendingStarterChoices > 0 || (game.paused && !game.manualPaused);
    refs.pauseButton.textContent = game.manualPaused ? "▶" : "Ⅱ";
    refs.pauseButton.classList.toggle("active", game.manualPaused);
  }
  refs.weaponList.innerHTML = [
    `탄환 x${player.shots}`,
    weapons.card.level > 0 ? `교통카드 Lv.${weapons.card.level}` : null,
    weapons.lightning.level > 0 ? `번개 Lv.${weapons.lightning.level}` : null,
    weapons.lowKick.level > 0 ? `로우킥 Lv.${weapons.lowKick.level}` : null,
    weapons.strapOrbit.level > 0 ? `손잡이 Lv.${weapons.strapOrbit.level}` : null,
    weapons.announcement.level > 0 ? `방송파 Lv.${weapons.announcement.level}` : null,
    weapons.expressTrain.level > 0 ? `급행 Lv.${weapons.expressTrain.level}` : null,
    weapons.transferGate.level > 0 ? `환승 Lv.${weapons.transferGate.level}` : null,
    weapons.customerMissile.level > 0 ? `유도탄 Lv.${weapons.customerMissile.level}` : null,
    weapons.callBell.level > 0 ? `호출벨 Lv.${weapons.callBell.level}` : null,
    player.defenseBreakTimer > 0 ? `방어저하 ${Math.ceil(player.defenseBreakTimer)}초` : null,
    player.stunTimer > 0 ? `경직 ${Math.ceil(player.stunTimer)}초` : null,
    player.slowTimer > 0 ? `둔화 ${Math.ceil(player.slowTimer)}초` : null,
    player.damageReduction > 0 ? `내성 ${Math.round(player.damageReduction * 100)}%` : null,
    player.regenLevel > 0 ? `회복 Lv.${player.regenLevel}` : null,
  ]
    .filter(Boolean)
    .map((item) => `<span>${item}</span>`)
    .join("");
}

function renderCodex() {
  if (!refs.codexList) return;
  refs.codexList.innerHTML = monsterTypes
    .map(
      (monster) => `
        <article>
          <i style="--monster-color: ${monster.color}"></i>
          <div>
            <strong>${monster.name}</strong>
            <span>${monster.note}</span>
          </div>
        </article>
      `,
    )
    .join("");
}

function worldToScreen(x, y) {
  return {
    x: x - camera.x,
    y: y - camera.y,
  };
}

function drawGrid() {
  ctx.save();
  ctx.fillStyle = "#20272c";
  ctx.fillRect(-80, -80, width + 160, height + 160);

  const tile = 72;
  const offsetX = -(((camera.x * 0.74) % tile) + tile) % tile;
  const offsetY = -(((camera.y * 0.74) % tile) + tile) % tile;

  ctx.strokeStyle = "rgba(230, 236, 240, 0.095)";
  ctx.lineWidth = 1;
  for (let x = offsetX - tile; x < width + tile * 2; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = offsetY - tile; y < height + tile * 2; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  const seam = 18;
  const seamOffset = -(((camera.y * 0.9) % (tile * 2)) + tile * 2) % (tile * 2);
  ctx.fillStyle = "rgba(255, 255, 255, 0.025)";
  for (let y = seamOffset; y < height + tile * 2; y += tile * 2) {
    ctx.fillRect(0, y + tile - seam / 2, width, seam);
  }

  const floorGlow = ctx.createRadialGradient(width / 2, height * 0.44, 40, width / 2, height * 0.5, height * 0.75);
  floorGlow.addColorStop(0, "rgba(255, 255, 255, 0.06)");
  floorGlow.addColorStop(1, "rgba(4, 7, 10, 0.3)");
  ctx.fillStyle = floorGlow;
  ctx.fillRect(-80, -80, width + 160, height + 160);
  ctx.restore();
}

function drawSubwayInteriorImage() {
  const offsetY = -(((camera.y * 0.16) % height) + height) % height;
  for (let y = offsetY - height; y < height + 1; y += height) {
    ctx.drawImage(subwayInteriorBg, 0, y, width, height);
  }

  const floorGlow = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, height * 0.72);
  floorGlow.addColorStop(0, "rgba(5, 10, 14, 0)");
  floorGlow.addColorStop(1, "rgba(5, 8, 12, 0.22)");
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, 0, width, height);
}

function drawLineOneStation() {
  const centerX = WORLD_SIZE / 2;
  const railX = centerX - camera.x;
  const railWidth = 168;
  const leftEdge = railX - railWidth / 2;
  const rightEdge = railX + railWidth / 2;

  ctx.fillStyle = "#0a0e12";
  ctx.fillRect(leftEdge, -80, railWidth, height + 160);

  ctx.fillStyle = "rgba(0, 83, 160, 0.18)";
  ctx.fillRect(0, 0, Math.max(0, leftEdge - 18), height);
  ctx.fillRect(rightEdge + 18, 0, Math.max(0, width - rightEdge - 18), height);

  ctx.fillStyle = "#0052a4";
  ctx.fillRect(leftEdge - 34, -80, 10, height + 160);
  ctx.fillRect(rightEdge + 24, -80, 10, height + 160);

  ctx.fillStyle = "#f7d64a";
  ctx.fillRect(leftEdge - 16, -80, 4, height + 160);
  ctx.fillRect(rightEdge + 12, -80, 4, height + 160);

  drawRailSleepers(leftEdge, rightEdge);
  drawRailLines(railX);
  drawPlatformColumns(centerX);
  drawStationSigns(centerX);
}

function drawRailSleepers(leftEdge, rightEdge) {
  const sleeperHeight = 8;
  const spacing = 42;
  const offsetY = -camera.y % spacing;

  ctx.fillStyle = "#2a241f";
  for (let y = offsetY - spacing; y < height + spacing; y += spacing) {
    ctx.fillRect(leftEdge + 12, y, rightEdge - leftEdge - 24, sleeperHeight);
  }
}

function drawRailLines(railX) {
  ctx.strokeStyle = "#b9c1c8";
  ctx.lineWidth = 4;
  for (const x of [railX - 42, railX + 42]) {
    ctx.beginPath();
    ctx.moveTo(x, -80);
    ctx.lineTo(x, height + 80);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 1;
  for (const x of [railX - 56, railX + 56]) {
    ctx.beginPath();
    ctx.moveTo(x, -80);
    ctx.lineTo(x, height + 80);
    ctx.stroke();
  }
}

function drawPlatformColumns(centerX) {
  const spacing = 360;
  const offsetY = -camera.y % spacing;
  const columnXs = [centerX - 250, centerX + 250];

  for (let y = offsetY - spacing; y < height + spacing; y += spacing) {
    for (const worldX of columnXs) {
      const x = worldX - camera.x;
      if (x < -80 || x > width + 80) continue;
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.beginPath();
      ctx.ellipse(x + 8, y + 8, 22, 18, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#29333b";
      ctx.beginPath();
      ctx.ellipse(x, y, 22, 18, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#0052a4";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, y, 27, 23, 0, 0, TAU);
      ctx.stroke();
    }
  }
}

function drawStationSigns(centerX) {
  const spacing = 620;
  const offsetY = -camera.y % spacing;
  const signXs = [centerX - 310, centerX + 310];

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let y = offsetY - spacing; y < height + spacing; y += spacing) {
    for (const worldX of signXs) {
      const x = worldX - camera.x;
      if (x < -180 || x > width + 180) continue;
      ctx.fillStyle = "rgba(5,8,12,0.78)";
      roundedRect(x - 86, y - 24, 172, 48, 8);
      ctx.fill();
      ctx.strokeStyle = "#0052a4";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = "900 16px system-ui";
      ctx.fillText("1호선", x - 36, y - 5);
      ctx.fillStyle = "#8fc7ff";
      ctx.font = "800 11px system-ui";
      ctx.fillText("빌런역", x + 38, y - 5);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.font = "700 9px system-ui";
      ctx.fillText("인천  |  소요산", x, y + 12);
    }
  }
}

function drawPlayer() {
  const p = worldToScreen(player.x, player.y);
  const pulse = player.invuln > 0 ? Math.sin(performance.now() * 0.04) * 0.3 + 0.7 : 1;
  const heroImage = heroImages.get(player.heroId);
  const useHeroImage = Boolean(heroImage?.complete && heroImage.naturalWidth > 0);
  const spriteHeight = Math.max(32, player.radius * 7.2);
  const spriteWidth = useHeroImage ? spriteHeight * (heroImage.naturalWidth / heroImage.naturalHeight) : 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = pulse;
  if (useHeroImage) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, spriteHeight * 0.37, spriteWidth * 0.34, 4.2, 0, 0, TAU);
    ctx.fill();
    ctx.shadowColor = player.heroAccent;
    ctx.shadowBlur = player.invuln > 0 ? 14 : 7;
    ctx.drawImage(heroImage, -spriteWidth / 2, -spriteHeight * 0.58, spriteWidth, spriteHeight);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = "#eaf2ff";
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 3.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = player.heroColor;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, TAU);
    ctx.fill();
    ctx.fillStyle = player.heroAccent;
    ctx.fillRect(-2.5, -player.radius - 6, 5, 10);
    ctx.strokeStyle = "#f8f9fa";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 2, -0.2, Math.PI + 0.6);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBlades() {
  if (weapons.strapOrbit.level > 0) {
    const strapCount = Math.min(7, weapons.strapOrbit.level + 2);
    const strapRadius = 58 + weapons.strapOrbit.level * 6;
    ctx.save();
    for (let i = 0; i < strapCount; i += 1) {
      const strapAngle = weapons.strapOrbit.angle + (TAU * i) / strapCount;
      const p = worldToScreen(player.x + Math.cos(strapAngle) * strapRadius, player.y + Math.sin(strapAngle) * strapRadius);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(strapAngle);
      ctx.strokeStyle = "#ffd6a5";
      ctx.fillStyle = "#5f4b32";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0.2, TAU - 0.2);
      ctx.stroke();
      ctx.fillRect(-4, -15, 8, 9);
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawEnemy(enemy) {
  const p = worldToScreen(enemy.x, enemy.y);
  if (p.x < -120 || p.x > width + 120 || p.y < -120 || p.y > height + 120) return;
  const actorImage = enemy.boss ? bossImages.get(enemy.id) : monsterImages.get(enemy.id);
  const useActorImage = Boolean(actorImage?.complete && actorImage.naturalWidth > 0);
  const imageHeight = useActorImage ? Math.max(enemy.boss ? 72 : 46, enemy.radius * (enemy.boss ? 7.4 : 5.9)) : 0;
  const imageWidth = useActorImage ? imageHeight * (actorImage.naturalWidth / actorImage.naturalHeight) : 0;
  const visualTop = useActorImage ? imageHeight * 0.72 : enemy.radius;
  const visualBottom = useActorImage ? imageHeight * 0.28 : enemy.radius;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(enemy.wobble * 0.25);
  if (enemy.boostTimer > 0) {
    const boostPulse = 0.75 + Math.sin(performance.now() * 0.018) * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.42;
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * (1.45 + boostPulse * 0.24), 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = "#ffd166";
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * (1.08 + boostPulse * 0.18), 0, TAU);
    ctx.fill();
    ctx.restore();
  }
  if (enemy.defenseBoostTimer > 0) {
    const guardPulse = 0.78 + Math.sin(performance.now() * 0.015) * 0.16;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.38;
    ctx.strokeStyle = "#fff3b0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * (1.72 + guardPulse * 0.22), 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = "#f9c74f";
    ctx.beginPath();
    ctx.arc(0, 0, enemy.radius * (1.26 + guardPulse * 0.18), 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  if (useActorImage) {
    ctx.shadowColor = enemy.trim;
    ctx.shadowBlur = enemy.hitFlash > 0 ? 18 : enemy.boss ? 10 : 6;
    ctx.drawImage(actorImage, -imageWidth / 2, -imageHeight * 0.72, imageWidth, imageHeight);
    ctx.shadowBlur = 0;
    if (enemy.hitFlash > 0) {
      ctx.globalAlpha = 0.35;
      ctx.globalCompositeOperation = "source-atop";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-imageWidth / 2, -imageHeight * 0.72, imageWidth, imageHeight);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
    }
  } else {
    ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;
    ctx.strokeStyle = enemy.trim;
    ctx.lineWidth = enemy.boss ? 2.8 : 1.8;
    if (enemy.id === "airport-thief" || enemy.special === "boss-luggage" || enemy.special === "boss-airport") {
      roundedRect(-enemy.radius, -enemy.radius * 0.8, enemy.radius * 2, enemy.radius * 1.6, Math.max(3, enemy.radius * 0.32));
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = enemy.trim;
      ctx.fillRect(-enemy.radius * 0.45, -enemy.radius - enemy.radius * 0.35, enemy.radius * 0.9, enemy.radius * 0.35);
    } else if (enemy.id === "seat-blocker") {
      ctx.beginPath();
      ctx.moveTo(0, -enemy.radius);
      ctx.lineTo(enemy.radius, -4);
      ctx.lineTo(enemy.radius * 0.55, enemy.radius);
      ctx.lineTo(-enemy.radius * 0.55, enemy.radius);
      ctx.lineTo(-enemy.radius, -4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }

    ctx.fillStyle = "#101418";
    ctx.beginPath();
    ctx.arc(-enemy.radius * 0.33, -enemy.radius * 0.18, Math.max(1.4, enemy.radius * 0.12), 0, TAU);
    ctx.arc(enemy.radius * 0.33, -enemy.radius * 0.18, Math.max(1.4, enemy.radius * 0.12), 0, TAU);
    ctx.fill();
  }

  if (enemy.boss || enemy.hp < enemy.maxHp) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const barWidth = enemy.boss ? 96 : 46;
    const bar = worldToScreen(enemy.x, enemy.y - visualTop - 16);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(bar.x - barWidth / 2, bar.y, barWidth, 6);
    ctx.fillStyle = enemy.boss ? "#ff477e" : "#ffd166";
    ctx.fillRect(bar.x - barWidth / 2, bar.y, barWidth * clamp(enemy.hp / enemy.maxHp, 0, 1), 6);
  }

  if (enemy.boss) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const label = worldToScreen(enemy.x, enemy.y + visualBottom + 24);
    ctx.fillStyle = "#fff3b0";
    ctx.font = "900 15px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(enemy.name, label.x, label.y);
  } else {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const label = worldToScreen(enemy.x, enemy.y + enemy.radius + 18);
    ctx.fillStyle = "rgba(248,249,250,0.74)";
    ctx.font = "900 11px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(enemy.shortName, label.x, label.y);
  }
  ctx.restore();
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawProjectiles() {
  for (const bullet of bullets) {
    const p = worldToScreen(bullet.x, bullet.y);
    ctx.fillStyle = bullet.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, bullet.radius, 0, TAU);
    ctx.fill();
  }
  for (const card of cards) {
    for (const point of card.trail) {
      const trailPoint = worldToScreen(point.x, point.y);
      ctx.globalAlpha = clamp(point.life / 0.22, 0, 1) * 0.48;
      ctx.fillStyle = "#80ffdb";
      ctx.beginPath();
      ctx.arc(trailPoint.x, trailPoint.y, Math.max(4, card.radius * 0.42), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    const p = worldToScreen(card.x, card.y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(card.rotation);
    ctx.shadowColor = "#80ffdb";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#dffdf5";
    ctx.strokeStyle = "#0b6b5e";
    ctx.lineWidth = 3;
    roundedRect(-22, -14, 44, 28, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#0052a4";
    ctx.fillRect(-19, -10, 38, 5);
    ctx.fillStyle = "#0b6b5e";
    ctx.font = "900 11px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TAP", 0, 4);
    ctx.restore();
  }

  for (const missile of missiles) {
    for (const point of missile.trail) {
      const trailPoint = worldToScreen(point.x, point.y);
      ctx.globalAlpha = clamp(point.life / 0.28, 0, 1) * 0.5;
      ctx.fillStyle = "#80ffdb";
      ctx.beginPath();
      ctx.arc(trailPoint.x, trailPoint.y, 5, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    const p = worldToScreen(missile.x, missile.y);
    const angle = Math.atan2(missile.vy, missile.vx);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.shadowColor = "#80ffdb";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#dffdf5";
    ctx.strokeStyle = "#0b6b5e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(-14, -4, 5, 8);
    ctx.restore();
  }

  for (const bell of callBells) {
    for (const point of bell.trail) {
      const trailPoint = worldToScreen(point.x, point.y);
      ctx.globalAlpha = clamp(point.life / 0.24, 0, 1) * 0.46;
      ctx.fillStyle = "#ff6b6b";
      ctx.beginPath();
      ctx.arc(trailPoint.x, trailPoint.y, Math.max(4, bell.radius * 0.45), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    const p = worldToScreen(bell.x, bell.y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(bell.rotation);
    ctx.shadowColor = "#ff6b6b";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#fff3b0";
    ctx.strokeStyle = "#7a1f24";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, -2, bell.radius * 0.72, Math.PI, TAU);
    ctx.lineTo(bell.radius * 0.9, bell.radius * 0.55);
    ctx.lineTo(-bell.radius * 0.9, bell.radius * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ff6b6b";
    ctx.beginPath();
    ctx.arc(0, bell.radius * 0.58, bell.radius * 0.25, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#7a1f24";
    ctx.font = "900 8px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("CALL", 0, 1);
    ctx.restore();
  }

}

function drawOrbs() {
  for (const orb of orbs) {
    const p = worldToScreen(orb.x, orb.y);
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = "#64dfdf";
    ctx.shadowColor = "#64dfdf";
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, orb.radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.14;
    ctx.strokeStyle = "#e6fffb";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

function drawEnergyPickups() {
  for (const pickup of energyPickups) {
    const p = worldToScreen(pickup.x, pickup.y);
    if (p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) continue;
    const pulse = 1 + Math.sin(pickup.pulse) * 0.12;
    const size = pickup.radius * pulse;

    ctx.save();
    ctx.translate(p.x, p.y);
    if (pickup.kind === "firstAid") {
      ctx.shadowColor = "#b8ffe4";
      ctx.shadowBlur = 18;
      ctx.fillStyle = "#f8f9fa";
      ctx.strokeStyle = "#1f7a68";
      ctx.lineWidth = 2.5;
      roundedRect(-size * 1.1, -size * 0.82, size * 2.2, size * 1.64, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1f7a68";
      ctx.fillRect(-size * 0.18, -size * 0.54, size * 0.36, size * 1.08);
      ctx.fillRect(-size * 0.58, -size * 0.14, size * 1.16, size * 0.28);
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -size * 0.92, size * 0.38, Math.PI, TAU);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
      continue;
    }
    ctx.shadowColor = "#36d399";
    ctx.shadowBlur = pickup.boss ? 22 : 14;
    ctx.fillStyle = pickup.boss ? "#b8ffe4" : "#80ffdb";
    ctx.strokeStyle = "#0b6b5e";
    ctx.lineWidth = pickup.boss ? 3 : 2;
    roundedRect(-size, -size * 0.72, size * 2, size * 1.44, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#0b6b5e";
    ctx.fillRect(size * 0.8, -size * 0.32, size * 0.28, size * 0.64);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-size * 0.16, -size * 0.48, size * 0.32, size * 0.96);
    ctx.fillRect(-size * 0.48, -size * 0.16, size * 0.96, size * 0.32);
    ctx.restore();
  }
}

function drawDamageZones() {
  for (const zone of damageZones) {
    const p = worldToScreen(zone.x, zone.y);
    const progress = 1 - zone.life / zone.maxLife;
    ctx.save();
    if (zone.kind === "train") {
      const active = zone.kind === "train" ? 0.34 + Math.sin(progress * Math.PI) * 0.28 : 0.22 + Math.sin(progress * Math.PI) * 0.34;
      ctx.globalAlpha = active;
      ctx.fillStyle = zone.color;
      if (zone.vertical) {
        ctx.fillRect(p.x - zone.width / 2, -20, zone.width, height + 40);
      } else {
        ctx.fillRect(-20, p.y - zone.width / 2, width + 40, zone.width);
      }
      ctx.globalAlpha = Math.min(1, active + 0.22);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = zone.kind === "train" ? 5 : 2;
      ctx.beginPath();
      if (zone.vertical) {
        ctx.moveTo(p.x, -20);
        ctx.lineTo(p.x, height + 20);
      } else {
        ctx.moveTo(-20, p.y);
        ctx.lineTo(width + 20, p.y);
      }
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (zone.kind === "bomb") {
      const armedPoint = zone.armedAt ?? 0.36;
      const warningProgress = clamp(progress / armedPoint, 0, 1);
      const blastProgress = clamp((progress - armedPoint) / Math.max(0.001, 1 - armedPoint), 0, 1);
      const bombMargin = Math.min(zone.radius + 18, width * 0.42, height * 0.42);
      const safeX = clamp(p.x, bombMargin, width - bombMargin);
      const safeY = clamp(p.y, bombMargin, height - bombMargin);
      if (safeX !== p.x || safeY !== p.y) {
        zone.x = camera.x + safeX;
        zone.y = camera.y + safeY;
      }
      ctx.save();
      ctx.translate(safeX, safeY);
      if (progress < armedPoint) {
        const pulse = 0.82 + Math.sin(performance.now() * 0.018) * 0.08;
        ctx.globalAlpha = 0.38 + warningProgress * 0.32;
        ctx.fillStyle = "rgba(255, 71, 126, 0.13)";
        ctx.strokeStyle = "#ff477e";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, zone.radius * pulse, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 0.86;
        ctx.strokeStyle = "#fff3b0";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i += 1) {
          const angle = (TAU * i) / 4 + warningProgress * 0.9;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * zone.radius * 0.42, Math.sin(angle) * zone.radius * 0.42);
          ctx.lineTo(Math.cos(angle) * zone.radius * 0.74, Math.sin(angle) * zone.radius * 0.74);
          ctx.stroke();
        }
        ctx.fillStyle = "#fff3b0";
        ctx.font = "900 13px system-ui";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("민원", 0, 0);
      } else {
        const flash = Math.max(0, 1 - blastProgress);
        const ringRadius = zone.radius * (0.35 + blastProgress * 1.12);
        ctx.globalAlpha = 0.18 + flash * 0.48;
        ctx.fillStyle = "#fff3b0";
        ctx.beginPath();
        ctx.arc(0, 0, zone.radius * (0.5 + flash * 0.42), 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.42 * flash;
        ctx.fillStyle = "#ff477e";
        ctx.beginPath();
        ctx.arc(0, 0, zone.radius, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 0.9 * flash;
        for (let i = 0; i < 10; i += 1) {
          const angle = (TAU * i) / 10 + blastProgress * 0.7;
          ctx.strokeStyle = i % 2 ? "#ffd166" : "#ff6b6b";
          ctx.lineWidth = i % 2 ? 4 : 6;
          ctx.beginPath();
          ctx.moveTo(Math.cos(angle) * zone.radius * 0.16, Math.sin(angle) * zone.radius * 0.16);
          ctx.lineTo(Math.cos(angle) * zone.radius * (0.55 + blastProgress * 0.45), Math.sin(angle) * zone.radius * (0.55 + blastProgress * 0.45));
          ctx.stroke();
        }
        ctx.globalAlpha = Math.max(0, 0.95 - blastProgress * 0.72);
        ctx.strokeStyle = "#fff3b0";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, TAU);
        ctx.stroke();
        ctx.globalAlpha = Math.max(0, 0.58 - blastProgress * 0.46);
        ctx.strokeStyle = "#ff6b6b";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, zone.radius * (0.72 + blastProgress * 0.52), 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }

    if (zone.kind === "gate") {
      const angle = zone.angle ?? 0;
      const sideAngle = angle + Math.PI / 2;
      const openProgress = Math.min(clamp(progress / 0.34, 0, 1), clamp((1 - progress) / 0.24, 0, 1));
      const flash = Math.sin(Math.min(1, progress / 0.48) * Math.PI);
      const doorWidth = zone.radius * 1.28;
      const doorHeight = zone.radius * 1.5;
      const panelWidth = doorWidth * 0.5;
      const panelGap = openProgress * doorWidth * 0.44;
      const startP = worldToScreen(zone.startX ?? zone.x, zone.startY ?? zone.y);
      const endP = worldToScreen(zone.endX ?? zone.x, zone.endY ?? zone.y);
      const pathLength = zone.pathLength ?? Math.hypot(endP.x - startP.x, endP.y - startP.y);

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.14 + flash * 0.16;
      ctx.strokeStyle = "#b197fc";
      ctx.lineWidth = zone.radius * 1.25;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startP.x, startP.y);
      ctx.lineTo(endP.x, endP.y);
      ctx.stroke();
      ctx.globalAlpha = 0.52;
      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startP.x, startP.y);
      ctx.lineTo(endP.x, endP.y);
      ctx.stroke();

      ctx.save();
      ctx.translate(startP.x, startP.y);
      ctx.rotate(angle);

      ctx.globalAlpha = 0.72 + flash * 0.2;
      ctx.shadowColor = "#80ffdb";
      ctx.shadowBlur = 16;
      ctx.fillStyle = "rgba(128, 255, 219, 0.2)";
      roundedRect(-doorWidth / 2, -doorHeight / 2, doorWidth, doorHeight, 12);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 6;
      roundedRect(-doorWidth / 2, -doorHeight / 2, doorWidth, doorHeight, 12);
      ctx.stroke();

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(11, 20, 26, 0.88)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 2;
      roundedRect(-doorWidth / 2 - panelGap, -doorHeight / 2 + 7, panelWidth, doorHeight - 14, 8);
      ctx.fill();
      ctx.stroke();
      roundedRect(panelGap, -doorHeight / 2 + 7, panelWidth, doorHeight - 14, 8);
      ctx.fill();
      ctx.stroke();

      ctx.globalAlpha = 0.5 + openProgress * 0.38;
      ctx.fillStyle = "rgba(255, 243, 176, 0.28)";
      ctx.fillRect(-panelGap, -doorHeight * 0.42, panelGap * 2, doorHeight * 0.84);

      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
      ctx.lineWidth = 2;
      for (const lane of [-0.62, -0.25, 0.12, 0.49]) {
        ctx.beginPath();
        ctx.moveTo(-zone.radius * 0.12, lane * zone.radius * 0.64);
        ctx.lineTo(zone.radius * 1.36, lane * zone.radius * 0.64);
        ctx.stroke();
      }
      ctx.restore();

      for (const commuter of zone.commuters ?? []) {
        const t = clamp((progress - commuter.delay) / 1.12 * commuter.speed, 0, 1);
        if (t <= 0 || t >= 1) continue;
        const fade = Math.sin(t * Math.PI);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const lane = commuter.lane * zone.radius * 0.95;
        const x = startP.x + Math.cos(angle) * pathLength * ease + Math.cos(sideAngle) * lane;
        const y = startP.y + Math.sin(angle) * pathLength * ease + Math.sin(sideAngle) * lane;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = fade * 0.88;
        ctx.fillStyle = "#f8f9fa";
        ctx.shadowColor = "#b197fc";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, -commuter.size * 0.9, commuter.size * 0.46, 0, TAU);
        ctx.fill();
        roundedRect(-commuter.size * 0.42, -commuter.size * 0.32, commuter.size * 0.84, commuter.size * 1.25, commuter.size * 0.25);
        ctx.fill();
        ctx.fillStyle = "#b197fc";
        ctx.fillRect(-commuter.size * 0.26, commuter.size * 0.82, commuter.size * 0.2, commuter.size * 0.75);
        ctx.fillRect(commuter.size * 0.06, commuter.size * 0.82, commuter.size * 0.2, commuter.size * 0.75);
        ctx.restore();
      }
      ctx.restore();
      continue;
    }

    if (zone.kind === "dansoSwing") {
      const sweep = Math.sin(progress * Math.PI);
      const start = -zone.arc / 2;
      const end = start + zone.arc * clamp(progress * 1.7, 0.18, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(zone.angle);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.2 + sweep * 0.46;
      ctx.fillStyle = "rgba(249, 199, 79, 0.2)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, zone.radius, start, end);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.84;
      ctx.strokeStyle = "#f9c74f";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.58 + sweep * 0.24), start, end);
      ctx.stroke();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.34 + sweep * 0.22), start * 0.75, end);
      ctx.stroke();
      const staffAngle = end;
      ctx.rotate(staffAngle);
      ctx.translate(zone.radius * 0.78, 0);
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = "#8d5524";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(-38, 0);
      ctx.lineTo(38, 0);
      ctx.stroke();
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-32, -4);
      ctx.lineTo(32, -4);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (zone.kind === "dansoShock") {
      const wave = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.12 + wave * 0.34;
      ctx.fillStyle = "rgba(249, 199, 79, 0.2)";
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.4 + progress * 0.72), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.9 - progress * 0.45;
      ctx.strokeStyle = "#f9c74f";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.22 + progress * 0.78), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.58 - progress * 0.18;
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.46 + progress * 0.58), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.78 * wave;
      ctx.strokeStyle = "#8d5524";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      for (let i = 0; i < 10; i += 1) {
        const angle = (TAU * i) / 10 + 0.12 * Math.sin(i);
        const inner = zone.radius * (0.16 + progress * 0.12);
        const outer = zone.radius * (0.44 + progress * 0.52) * rand(0.86, 1.08);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = "#8d5524";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(-8, -zone.radius * 0.58);
      ctx.lineTo(8, zone.radius * 0.12);
      ctx.stroke();
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-3, -zone.radius * 0.52);
      ctx.lineTo(5, zone.radius * 0.04);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (zone.kind === "airportTaunt") {
      const wave = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 + wave * 0.28;
      ctx.fillStyle = "rgba(255, 209, 102, 0.12)";
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.34 + progress * 0.72), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.72 - progress * 0.34;
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.26 + progress * 0.74), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.9 * wave;
      ctx.fillStyle = "#ffe066";
      ctx.font = "900 15px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("가속!", 0, 0);
      ctx.restore();
      continue;
    }

    if (zone.kind === "airportCrisis") {
      const wave = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 + wave * 0.36;
      ctx.fillStyle = "rgba(255, 107, 107, 0.18)";
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.55 + progress * 0.45), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.88 - progress * 0.38;
      ctx.strokeStyle = "#ff8787";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.45 + progress * 0.7), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.72 * wave;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i += 1) {
        const angle = (TAU * i) / 5 + progress * 1.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * zone.radius * 0.28, Math.sin(angle) * zone.radius * 0.28);
        ctx.lineTo(Math.cos(angle) * zone.radius * 0.64, Math.sin(angle) * zone.radius * 0.64);
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }

    if (zone.kind === "dollarBill") {
      ctx.translate(p.x, p.y);
      ctx.rotate(progress * 8);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "#80ffdb";
      ctx.strokeStyle = "#0b6b5e";
      ctx.lineWidth = 2;
      roundedRect(-18, -10, 36, 20, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#0b6b5e";
      ctx.font = "900 12px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 1);
      ctx.restore();
      continue;
    }

    if (zone.kind === "gumBubble" || zone.kind === "gumMissile") {
      const shine = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "rgba(255, 143, 171, 0.62)";
      ctx.strokeStyle = "#ffc2d1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.9 + shine * 0.08), 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.beginPath();
      ctx.arc(-zone.radius * 0.28, -zone.radius * 0.28, zone.radius * 0.18, 0, TAU);
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (zone.kind === "thumbShot") {
      ctx.translate(p.x, p.y);
      ctx.rotate(progress * 6);
      ctx.globalAlpha = 0.9;
      ctx.font = `900 ${Math.round(zone.radius * 1.7)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff3b0";
      ctx.fillText("👍", 0, 0);
      ctx.restore();
      continue;
    }

    if (zone.kind === "jarvanFlag") {
      const wave = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.15 + wave * 0.28;
      ctx.fillStyle = "rgba(249, 199, 79, 0.18)";
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.3 + progress * 0.76), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.84 - progress * 0.34;
      ctx.strokeStyle = "#f9c74f";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.22 + progress * 0.78), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.9 * wave;
      ctx.fillStyle = "#8d5524";
      ctx.fillRect(-4, -78, 8, 104);
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.moveTo(4, -74);
      ctx.lineTo(68, -56);
      ctx.lineTo(4, -36);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#3b2f1d";
      ctx.font = "900 14px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("우대", 34, -55);
      ctx.restore();
      continue;
    }

    if (zone.kind === "jarvanSpear") {
      const thrust = Math.sin(progress * Math.PI);
      const reach = zone.length * clamp(progress * 1.45, 0.22, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(zone.angle);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 + thrust * 0.35;
      ctx.fillStyle = "rgba(255, 224, 102, 0.18)";
      roundedRect(12, -zone.width / 2, reach, zone.width, 18);
      ctx.fill();
      ctx.globalAlpha = 0.95;
      ctx.strokeStyle = "#8d5524";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(reach, 0);
      ctx.stroke();
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(16, -5);
      ctx.lineTo(reach - 8, -5);
      ctx.stroke();
      ctx.fillStyle = "#ffe066";
      ctx.beginPath();
      ctx.moveTo(reach + 20, 0);
      ctx.lineTo(reach - 8, -16);
      ctx.lineTo(reach - 2, 0);
      ctx.lineTo(reach - 8, 16);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 0.62 * thrust;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      for (const offset of [-20, 20]) {
        ctx.beginPath();
        ctx.moveTo(reach * 0.22, offset);
        ctx.lineTo(reach * 0.94, offset * 0.45);
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }

    if (zone.kind === "lowKick") {
      const sweep = Math.sin(progress * Math.PI);
      const start = -zone.arc / 2;
      const end = start + zone.arc * clamp(progress * 1.75, 0.18, 1);
      const reach = zone.radius * (0.74 + sweep * 0.18);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(zone.angle);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.1 + sweep * 0.24;
      ctx.fillStyle = "rgba(255, 183, 3, 0.18)";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, zone.radius, start, end);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 0.94;
      ctx.strokeStyle = "#ffb703";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(Math.cos(start * 0.42) * zone.radius * 0.2, Math.sin(start * 0.42) * zone.radius * 0.2);
      ctx.quadraticCurveTo(
        Math.cos(start * 0.28) * zone.radius * 0.58,
        Math.sin(start * 0.28) * zone.radius * 0.96,
        Math.cos(end) * reach,
        Math.sin(end) * reach,
      );
      ctx.stroke();

      ctx.globalAlpha = 0.78;
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(start * 0.35) * zone.radius * 0.26, Math.sin(start * 0.35) * zone.radius * 0.24);
      ctx.quadraticCurveTo(
        Math.cos(start * 0.16) * zone.radius * 0.66,
        Math.sin(start * 0.16) * zone.radius * 0.72,
        Math.cos(end) * zone.radius * (0.84 + sweep * 0.1),
        Math.sin(end) * zone.radius * (0.84 + sweep * 0.1),
      );
      ctx.stroke();

      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = "#ff6b00";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.7 + sweep * 0.16), start + 0.2, end - 0.08);
      ctx.stroke();

      ctx.globalAlpha = 0.7 * sweep;
      ctx.fillStyle = "#fff3b0";
      ctx.beginPath();
      ctx.ellipse(Math.cos(end) * reach, Math.sin(end) * reach, 30, 12, end, 0, TAU);
      ctx.fill();

      const footAngle = end;
      const footX = Math.cos(footAngle) * zone.radius * 0.72;
      const footY = Math.sin(footAngle) * zone.radius * 0.72;
      ctx.translate(footX, footY);
      ctx.rotate(footAngle);
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = "#14181d";
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 2;
      roundedRect(-20, -10, 40, 20, 7);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (zone.kind === "lightning") {
      const flash = Math.max(0, 1 - progress);
      const strikeHeight = 185 + zone.radius * 0.55;
      const segments = 6;
      const seed = zone.boltSeed ?? 0;
      const points = [];
      for (let i = 0; i <= segments; i += 1) {
        const t = i / segments;
        const jitter = i === 0 || i === segments ? 0 : Math.sin(seed + i * 2.17) * 11 + Math.cos(seed * 0.7 + i * 1.31) * 6;
        points.push({
          x: p.x + jitter,
          y: p.y - strikeHeight * (1 - t),
        });
      }

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.16 + flash * 0.34;
      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 9;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      ctx.globalAlpha = 0.5 + flash * 0.18;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();

      for (let i = 2; i < points.length - 1; i += 2) {
        const point = points[i];
        const side = i % 4 === 0 ? 1 : -1;
        ctx.globalAlpha = 0.22 * flash;
        ctx.strokeStyle = "#9bf6ff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(point.x + side * (20 + i * 3), point.y + 16);
        ctx.stroke();
      }

      ctx.globalAlpha = 0.28 + flash * 0.4;
      ctx.fillStyle = "#9bf6ff";
      ctx.beginPath();
      ctx.arc(p.x, p.y, zone.radius * (0.4 + progress * 0.32), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.92 - progress * 0.42;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, zone.radius * (0.45 + progress * 0.72), 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, zone.radius * (0.72 + progress * 0.62), 0, TAU);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    ctx.globalAlpha = zone.hostile ? 0.24 + Math.sin(progress * Math.PI) * 0.28 : 0.8;
    ctx.strokeStyle = zone.color;
    ctx.fillStyle = zone.trap ? "rgba(116,192,252,0.1)" : "transparent";
    ctx.lineWidth = zone.trap ? 3 : 5;
    ctx.beginPath();
    const displayRadius = zone.armedAt && progress < zone.armedAt ? zone.radius : zone.radius * (zone.trap ? 1 : Math.max(progress, 0.25));
    ctx.arc(p.x, p.y, displayRadius, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawEffects() {
  for (const particle of particles) {
    const p = worldToScreen(particle.x, particle.y);
    ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, particle.radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  for (const bubble of speechBubbles) {
    const target = bubble.target;
    const p = worldToScreen(bubble.x, bubble.y);
    const targetRadius = target?.radius ?? 18;
    const topOffset = target?.boss ? Math.max(66, targetRadius * 5.8) : targetRadius * 2.2;
    const alpha = clamp(bubble.life / bubble.maxLife, 0, 1);
    ctx.save();
    ctx.font = "900 13px system-ui";
    const maxTextWidth = Math.min(260, width - 52);
    const lines = wrapCanvasText(bubble.text, maxTextWidth);
    const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    const bubbleWidth = Math.min(Math.max(84, textWidth + 28), width - 24);
    const lineHeight = 16;
    const bubbleHeight = Math.max(34, 18 + lines.length * lineHeight);
    const bubbleX = clamp(p.x - bubbleWidth / 2, 12, width - bubbleWidth - 12);
    const bubbleY = clamp(p.y - topOffset - bubbleHeight, 12, height - bubbleHeight - 12);
    const tailX = clamp(p.x, bubbleX + 18, bubbleX + bubbleWidth - 18);

    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(0, 0, 0, 0.36)";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(248, 249, 250, 0.96)";
    ctx.strokeStyle = "rgba(255, 214, 102, 0.95)";
    ctx.lineWidth = 2;
    roundedRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 8);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.moveTo(tailX - 8, bubbleY + bubbleHeight - 1);
    ctx.lineTo(tailX + 8, bubbleY + bubbleHeight - 1);
    ctx.lineTo(clamp(p.x, 8, width - 8), Math.min(height - 8, bubbleY + bubbleHeight + 13));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#111820";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const firstLineY = bubbleY + bubbleHeight / 2 - ((lines.length - 1) * lineHeight) / 2 + 1;
    lines.forEach((line, index) => {
      ctx.fillText(line, bubbleX + bubbleWidth / 2, firstLineY + index * lineHeight);
    });
    ctx.restore();
  }
  for (const popup of popups) {
    const p = worldToScreen(popup.x, popup.y);
    ctx.globalAlpha = clamp(popup.life / popup.maxLife, 0, 1);
    ctx.fillStyle = popup.color;
    ctx.font = `900 ${popup.size}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(popup.text, p.x, p.y);
    ctx.globalAlpha = 1;
  }
}

function render() {
  const targetCameraX = player.x - width / 2;
  const targetCameraY = player.y - height / 2;
  camera.x += (targetCameraX - camera.x) * 0.12;
  camera.y += (targetCameraY - camera.y) * 0.12;
  camera.x = clamp(camera.x, 0, WORLD_SIZE - width);
  camera.y = clamp(camera.y, 0, WORLD_SIZE - height);

  ctx.save();
  if (shake > 0) {
    ctx.translate(rand(-shake, shake), rand(-shake, shake));
  }
  drawGrid();
  drawDamageZones();
  drawOrbs();
  drawEnergyPickups();
  drawProjectiles();
  for (const enemy of enemies) drawEnemy(enemy);
  drawBlades();
  drawPlayer();
  drawEffects();
  ctx.restore();

  if (game.state === "menu") {
    ctx.fillStyle = "rgba(5,7,8,0.16)";
    ctx.fillRect(0, 0, width, height);
  }
}

function frame(now) {
  const delta = Math.min(0.035, (now - lastFrame) / 1000 || 0);
  lastFrame = now;
  update(delta);
  render();
  requestAnimationFrame(frame);
}

function shouldIgnoreMovePointer(event) {
  if (game.state !== "playing" || game.paused || input.touchId !== null) return true;
  return Boolean(event.target?.closest?.("button, input, form, .message, .hero-panel, .upgrade-panel, .leaderboard-panel"));
}

function positionFloatingStick(clientX, clientY) {
  const rect = refs.app.getBoundingClientRect();
  input.originX = clientX - rect.left;
  input.originY = clientY - rect.top;
  if (refs.moveStick) {
    refs.moveStick.style.left = `${input.originX}px`;
    refs.moveStick.style.top = `${input.originY}px`;
    refs.moveStick.classList.add("active");
  }
  if (refs.moveStickThumb) refs.moveStickThumb.style.transform = "translate(-50%, -50%)";
}

function setFloatingStickMove(clientX, clientY) {
  const rect = refs.app.getBoundingClientRect();
  const touchX = clientX - rect.left;
  const touchY = clientY - rect.top;
  const rawX = touchX - input.originX;
  const rawY = touchY - input.originY;
  const distance = Math.hypot(rawX, rawY);
  const deadZone = 8;
  const max = 42;
  if (distance < deadZone) {
    input.x = 0;
    input.y = 0;
    if (refs.moveStickThumb) refs.moveStickThumb.style.transform = "translate(-50%, -50%)";
    return;
  }
  const clamped = Math.min(max, distance);
  const angle = Math.atan2(rawY, rawX);
  const thumbX = Math.cos(angle) * clamped;
  const thumbY = Math.sin(angle) * clamped;
  const strength = Math.min(1, (distance - deadZone) / max);
  input.x = (rawX / distance) * strength;
  input.y = (rawY / distance) * strength;
  if (refs.moveStickThumb) {
    refs.moveStickThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;
  }
}

function resetFloatingStickMove() {
  input.x = 0;
  input.y = 0;
  input.touchId = null;
  if (refs.moveStickThumb) refs.moveStickThumb.style.transform = "translate(-50%, -50%)";
  refs.moveStick?.classList.remove("active");
}

window.addEventListener("resize", resize);
new ResizeObserver(resize).observe(refs.app);
window.addEventListener("keydown", (event) => {
  if (event.code === "KeyH") {
    useFirstAidKit();
    return;
  }
  keys.add(event.code);
});
window.addEventListener("keyup", (event) => keys.delete(event.code));

refs.startButton.addEventListener("click", resetGame);
refs.firstAidButton?.addEventListener("click", useFirstAidKit);
refs.pauseButton?.addEventListener("click", togglePause);
refs.rankForm?.addEventListener("submit", submitLeaderboardEntry);

refs.app.addEventListener("pointerdown", (event) => {
  if (shouldIgnoreMovePointer(event)) return;
  event.preventDefault();
  input.touchId = event.pointerId;
  refs.app.setPointerCapture?.(event.pointerId);
  positionFloatingStick(event.clientX, event.clientY);
  setFloatingStickMove(event.clientX, event.clientY);
});

refs.app.addEventListener("pointermove", (event) => {
  if (input.touchId !== event.pointerId) return;
  event.preventDefault();
  setFloatingStickMove(event.clientX, event.clientY);
});

refs.app.addEventListener("pointerup", (event) => {
  if (input.touchId === event.pointerId) resetFloatingStickMove();
});

refs.app.addEventListener("pointercancel", (event) => {
  if (input.touchId === event.pointerId) resetFloatingStickMove();
});

resize();
renderCodex();
loadLeaderboard().catch(() => {
  if (refs.rankHint) refs.rankHint.textContent = "서버 연결 대기";
});
updateHud();
requestAnimationFrame(frame);
