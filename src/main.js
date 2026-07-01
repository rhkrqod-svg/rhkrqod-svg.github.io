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
  attackStat: document.querySelector("#attackStat"),
  defenseStat: document.querySelector("#defenseStat"),
  speedStat: document.querySelector("#speedStat"),
  dodgeStat: document.querySelector("#dodgeStat"),
  xpFill: document.querySelector("#xpFill"),
  weaponList: document.querySelector("#weaponList"),
  skillTooltip: document.querySelector("#skillTooltip"),
  codexList: document.querySelector("#codexList"),
  message: document.querySelector("#message"),
  messageTitle: document.querySelector("#messageTitle"),
  messageText: document.querySelector("#messageText"),
  startButton: document.querySelector("#startButton"),
  leaderboardOpenButton: document.querySelector("#leaderboardOpenButton"),
  heroPanel: document.querySelector("#heroPanel"),
  heroChoices: document.querySelector("#heroChoices"),
  upgradePanel: document.querySelector("#upgradePanel"),
  upgradeTitle: document.querySelector("#upgradeTitle"),
  upgradePauseButton: document.querySelector("#upgradePauseButton"),
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
  policeButton: document.querySelector("#policeButton"),
  policeCount: document.querySelector("#policeCount"),
  taserButton: document.querySelector("#taserButton"),
  taserCount: document.querySelector("#taserCount"),
  chickenButton: document.querySelector("#chickenButton"),
  chickenCount: document.querySelector("#chickenCount"),
  stimButton: document.querySelector("#stimButton"),
  stimCount: document.querySelector("#stimCount"),
  pauseButton: document.querySelector("#pauseButton"),
  moveStick: document.querySelector("#moveStick"),
  moveStickThumb: document.querySelector("#moveStickThumb"),
};

const sound = {
  ctx: null,
  master: null,
  enabled: true,
  voiceEnabled: true,
  normalMusic: null,
  normalMusicTargetVolume: 0,
  normalMusicFade: null,
  bossMusic: null,
  bossMusicTargetVolume: 0,
  bossMusicFade: null,
  last: new Map(),
};

const STORAGE_KEY = "villain-commando-best";
const LOCAL_LEADERBOARD_KEY = "villain-commando-local-leaderboard-v3";
const GLOBAL_LEADERBOARD_API = "https://subway-villain-leaderboard.rhkrqod.workers.dev/api/leaderboard";
const LEADERBOARD_API = (
  import.meta.env.VITE_LEADERBOARD_API ||
  (["localhost", "127.0.0.1"].includes(window.location.hostname) ? "/api/leaderboard" : GLOBAL_LEADERBOARD_API)
).trim();
const LEADERBOARD_LIMIT = 10;
const TAU = Math.PI * 2;
const WORLD_SIZE = 2800;
const MAX_RUN_TIME = 3600;
const DPR_LIMIT = 2;
const START_HP = 100;
const MAX_PLAYER_HP = 200;
const MAX_PLAYER_HP_LIMIT = 300;
const START_MAGNET_RANGE = 313;
const CHARACTER_SIZE_SCALE = 0.75;
const MONSTER_SIZE_SCALE = 0.42;
const BOSS_SIZE_SCALE = 0.45;
const FIXED_VIEW_SCALE = 0.5984;
const NORMAL_SPAWN_SAFE_RADIUS = 560;
const BOSS_SPAWN_SAFE_RADIUS = 760;
const PLAYER_RADIUS = 19 * CHARACTER_SIZE_SCALE;
const FIRST_AID_HEAL_RATIO = 0.5;
const BASE_REGEN_RATIO = 0.015;
const REGEN_UPGRADE_RATIO = 0.02;
const ENEMY_HP_GLOBAL_MULTIPLIER = 1.6;
const ENEMY_SPEED_GLOBAL_MULTIPLIER = 1.38;
const ENEMY_DAMAGE_GLOBAL_MULTIPLIER = 1.3;
const BOSS_SPEED_GLOBAL_MULTIPLIER = 1.15;
const COMMUTE_PROTEST_SPEED_MULTIPLIER = 1.4 / 1.2;
const COMMUTE_PROTEST_HP_MULTIPLIER = 1.1;
const ENEMY_XP_REWARD_MULTIPLIER = 1.35;
const XP_ORB_LIFETIME = 18;
const XP_ORB_FADE_TIME = 5;
const NORMAL_MUSIC_SRC = "/assets/audio/neon-arcade-normal.mp3";
const NORMAL_MUSIC_VOLUME = 0.16;
const BOSS_MUSIC_SRC = "/assets/audio/neon-circuit-boss.mp3";
const BOSS_MUSIC_VOLUME = 0.2;
const BOSS_ATTACK_COOLDOWN_MULTIPLIER = 1.3;
const BOSS_BASIC_ATTACK_MIN_COOLDOWN = 2.2;
const BOSS_BASIC_ATTACK_MAX_COOLDOWN = 3.2;
const BOSS_BASIC_ATTACK_COOLDOWN_MULTIPLIER = 0.8;
const BOSS_BASIC_ATTACK_SPEED_MULTIPLIER = 1.2;
const BOSS_STAB_ATTACK_DURATION_MULTIPLIER = 1 / BOSS_BASIC_ATTACK_SPEED_MULTIPLIER;
const BOSS_SPECIAL_ATTACK_MIN_COOLDOWN = 6.4;
const BOSS_SPECIAL_ATTACK_MAX_COOLDOWN = 8.2;
const RESERVE_LABEL = "예비군";
const TASER_DOT_TICK = 0.5;
const TASER_DOT_DAMAGE_RATIO = 0.325;
const SUBWAY_POLICE_DAMAGE_MULTIPLIER = 2.535;
const SUBWAY_POLICE_SPLASH_RADIUS = 60;
const SUBWAY_POLICE_SPLASH_DAMAGE_RATIO = 0.28;
const COMRADE_DROP_DESCENT_TIME = 1.8;
const CHICKEN_BUFF_DURATION = 7;
const CHICKEN_VISUAL_SCALE = 3;
const CHICKEN_COLLISION_RADIUS_MULTIPLIER = 2.25;
const CHICKEN_HIT_COOLDOWN = 0.5;
const CHICKEN_KNOCKBACK = 132;
const CHICKEN_RELEASE_INVULN = 1;
const TANK_CANNON_COOLDOWN = 1.5;
const TANK_CANNON_RADIUS = 112;
const TANK_CANNON_BOSS_STUN = 0.5;
const TANK_CANNON_MONSTER_STUN = 3;
const STIMPACK_DURATION = 8;
const STIMPACK_ATTACK_SPEED_MULTIPLIER = 3;
const STIMPACK_DRAIN_RATIO = 0.03;
const STIMPACK_DRAIN_TICK = 1;
const STIMPACK_VISUAL_SCALE_RATIO = 0.5;

const heroTypes = [
  {
    id: "gae-hwanam",
    name: "蹂묒슦",
    image: "/assets/heroes/gae-hwanam-cutout.png",
    cardImage: "/assets/heroes/gae-hwanam-cutout.png",
    chickenImage: "/assets/heroes/byeongu-chicken-form.png",
    quote: "?뺤쓽??諛⑺뼢???꾨땲???좏깮.",
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
    name: "?щ퉰",
    image: "/assets/heroes/gae-hwani-cutout.png",
    cardImage: "/assets/heroes/gae-hwani-cutout.png",
    chickenImage: "/assets/heroes/heebin-chicken-form.png",
    quote: "?묒? ?⑷린濡?湲몄쓣 ?곕떎.",
    hp: 100,
    maxHp: 100,
    atk: 120,
    def: 90,
    spd: 120,
    color: "#5a4632",
    accent: "#f0d7b7",
  },
  {
    id: "juyeon",
    name: "二쇱뿰",
    image: "/assets/heroes/juyeon-cutout.png",
    cardImage: "/assets/heroes/juyeon-card-tight.png",
    chickenImage: "/assets/heroes/juyeon-chicken-form.png",
    quote: "그날 빌런은 떠올렸다, 지배 당해왔던 공포를",
    hp: 90,
    maxHp: 90,
    atk: 135,
    def: 70,
    spd: 140,
    dodgeChance: 0.2,
    spriteScaleX: 1.3,
    spriteScaleY: 1.3,
    chickenScaleX: 4.2,
    chickenScaleY: 4.2,
    color: "#2f78c4",
    accent: "#9fd3ff",
  },
  {
    id: "changwoo",
    name: "李쎌슦",
    image: "/assets/heroes/changwoo-cutout.png",
    cardImage: "/assets/heroes/changwoo-card.png",
    chickenImage: "/assets/items/tank-cartoon.png",
    quote: "媛뺥븳 ?↔뎔, ?쏀븳 鍮뚮윴",
    hp: 150,
    maxHp: 150,
    atk: 65,
    def: 140,
    spd: 100,
    healMultiplier: 1.5,
    meleeDamageMultiplier: 1.95,
    bulletDamageMultiplier: 2.34,
    bulletFireRateMultiplier: 1.2,
    specialLabels: [],
    spriteScaleX: 1.08,
    spriteScaleY: 1.08,
    chickenScaleX: 3.2,
    chickenScaleY: 3.2,
    color: "#2e332b",
    accent: "#b7ef64",
  },
];

const heroImages = new Map();
const chickenHeroImages = new Map();
for (const hero of heroTypes) {
  const image = new Image();
  image.src = hero.image;
  heroImages.set(hero.id, image);
  if (hero.chickenImage) {
    const chickenImage = new Image();
    chickenImage.src = hero.chickenImage;
    chickenHeroImages.set(hero.id, chickenImage);
  }
}

function isTankRadioHero() {
  return player.heroId === "changwoo";
}

function isComradeHero() {
  return player.heroId === "changwoo";
}

function isRunnerCompanionHero() {
  return player.heroId === "juyeon";
}

function getStationPoliceDamage() {
  return Math.round((29 + Math.max(0, weapons.subwayPolice.level - 1) * 3) * SUBWAY_POLICE_DAMAGE_MULTIPLIER);
}

function getCompanionSkillName() {
  if (isComradeHero()) return "예비군";
  if (isRunnerCompanionHero()) return "페이스 메이커";
  return "지하철 경찰";
}

function getCompanionSkillDesc() {
  if (isComradeHero()) return "예비군이 창우 옆에서 기본탄환을 함께 발사합니다.";
  if (isRunnerCompanionHero()) return "페이스 메이커가 달려가 몸통박치기와 스플래시 피해를 줍니다.";
  return "지하철 경찰이 동행하며 보스를 우선 곤봉으로 공격합니다.";
}

function getPoliceItemName() {
  if (isComradeHero()) return "예비군 훈련";
  if (isRunnerCompanionHero()) return "마라톤 참가권";
  return "지하철 경찰대";
}

const bossTypes = [
  {
    id: "airport-thief-boss",
    name: "怨듯빆?꾨몣",
    image: "/assets/bosses/airport-thief-boss.png",
    color: "#704214",
    trim: "#ffca3a",
    hp: 3276,
    speed: 58,
    damage: 25,
    radius: 50,
    xp: 150,
    score: 660,
    special: "boss-airport",
  },
  {
    id: "jarvan-84",
    name: "자르반 84세",
    image: "/assets/bosses/jarvan-84.png",
    color: "#d4a017",
    trim: "#7b2cbf",
    hp: 3822,
    speed: 58,
    damage: 25,
    radius: 60,
    xp: 150,
    score: 660,
    special: "boss-jarvan",
  },
  {
    id: "danso-assassin",
    name: "단소살인마",
    image: "/assets/bosses/danso-assassin.png",
    color: "#0077b6",
    trim: "#f9c74f",
    hp: 3367,
    speed: 58,
    damage: 25,
    radius: 54,
    xp: 150,
    score: 660,
    special: "boss-danso",
  },
  {
    id: "praise-man",
    name: "칭찬남",
    image: "/assets/bosses/praise-man.png",
    color: "#6f42c1",
    trim: "#c77dff",
    hp: 3250,
    speed: 58,
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
    hp: 3484,
    speed: 58,
    damage: 25,
    radius: 58,
    xp: 150,
    score: 660,
    special: "boss-gum",
  },
];

const bossImages = new Map();
for (const boss of bossTypes) {
  bossImages.set(boss.id, createGameImage(boss.image));
}

const upgradePool = [
  {
    id: "multi",
    name: "분노의 탄환",
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
    id: "maxhp",
    name: "멘탈 강화",
    desc: "최대 체력 +15%, 즉시 회복",
    apply: () => {
      const previousMaxHp = player.maxHp;
      player.maxHp = Math.min(MAX_PLAYER_HP_LIMIT, player.maxHp * 1.15);
      player.hp = Math.min(player.maxHp, player.hp + player.maxHp - previousMaxHp);
    },
  },
  {
    id: "lightning",
    name: "민원 번개",
    desc: "가까운 적에게 주기적으로 번개",
    apply: () => {
      weapons.lightning.level += 1;
    },
  },
  {
    id: "boomerang",
    name: "교통카드 사출",
    desc: "벽에 튕기는 교통카드 개수 증가",
    apply: () => {
      weapons.card.level += 1;
      weapons.card.cooldown = Math.min(weapons.card.cooldown, 2.37);
    },
  },
  {
    id: "strapOrbit",
    name: "손잡이 회오리",
    desc: "주위를 도는 손잡이 보호 무기",
    apply: () => {
      weapons.strapOrbit.level += 1;
    },
  },
  {
    id: "tearGas",
    name: "최루탄",
    desc: "주인공 주위에 가스 장판으로 지속 피해",
    apply: () => {
      weapons.tearGas.level += 1;
    },
  },
  {
    id: "expressTrain",
    name: "급행열차 돌진",
    desc: "넓은 직선 범위를 밀어버림",
    apply: () => {
      weapons.expressTrain.level += 1;
      weapons.expressTrain.cooldown = Math.min(weapons.expressTrain.cooldown, 1.1);
    },
  },
  {
    id: "customerMissile",
    name: "고객센터 유도탄",
    desc: "가까운 적에게 유도탄을 발사하고 폭발 피해",
    apply: () => {
      weapons.customerMissile.level += 1;
      weapons.customerMissile.cooldown = Math.min(weapons.customerMissile.cooldown, 0.68);
    },
  },
  {
    id: "subwayPolice",
    name: "지하철 경찰",
    desc: "지하철 경찰이 동행하며 보스를 우선 공격",
    apply: () => {
      weapons.subwayPolice.level += 1;
    },
  },
  {
    id: "nuisanceResist",
    name: "민폐 내성",
    desc: "받는 피해 15% 감소",
    apply: () => {
      player.damageReduction = Math.min(0.6, player.damageReduction + 0.15);
    },
  },
  {
    id: "mentalRegen",
    name: "멘탈 회복력",
    desc: "자동 체력 회복량 +2%",
    apply: () => {
      player.regenLevel += 1;
      player.regenTimer = Math.min(player.regenTimer, 1.2);
    },
  },
];

const passiveUpgradeIds = new Set([
  "nuisanceResist",
  "mentalRegen",
]);

const weaponUpgradeIds = new Set([
  "lightning",
  "boomerang",
  "strapOrbit",
  "tearGas",
  "expressTrain",
  "customerMissile",
  "subwayPolice",
]);

function getUpgradeDisplay(choice) {
  if (choice?.id === "subwayPolice") {
    return {
      name: getCompanionSkillName(),
      desc: getCompanionSkillDesc(),
    };
  }
  return {
    name: choice?.name ?? "",
    desc: choice?.desc ?? "",
  };
}

function getTearGasRadius() {
  const level = Math.max(1, weapons.tearGas.level);
  return (58 + level * 8) * 1.3 * 1.7 * 1.5 * (1 + (level - 1) * 0.09);
}

function getTearGasDamage() {
  const level = Math.max(1, weapons.tearGas.level);
  return Math.round((9 + (level - 1) * 6) * 1.8 * (player.meleeDamageMultiplier || 1));
}

function getStrapOrbitRadius() {
  const level = Math.max(1, weapons.strapOrbit.level);
  return (58 + level * 6) * 1.69 * 1.2 * (1 + (level - 1) * 0.04);
}

function getStrapHandleRadius() {
  return 13 * 1.44;
}

function getStrapCount() {
  return Math.min(14, Math.max(2, weapons.strapOrbit.level * 2));
}

function getBasicBulletFireRate() {
  return player.fireRate / (player.bulletFireRateMultiplier || 1);
}

function getBasicBulletStyle() {
  if (player.heroId === "changwoo") return "military";
  if (player.heroId === "juyeon") return "medal";
  return "default";
}

let width = 1;
let height = 1;
let viewWidth = 1;
let viewHeight = 1;
let dpr = 1;
let lastFrame = 0;
let spawnTimer = 0;
let bossIndex = 0;
let bossBag = [];
let nextBossAt = 20;
let bossWarningFor = 0;
let specialStageBossMarks = new Set();
let specialStageUntil = 0;
let bestScore = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
let leaderboardEntries = [];
let pendingLeaderboardScore = null;
let skillTooltipTimer = 0;
let skillAnnouncement = null;
let leaderboardSubmitting = false;
let leaderboardServerOnline = false;
let bossBannerTimer = 0;
let bossBannerNameTimer = 0;

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
const tankShells = [];
const taserShots = [];
const policeSquads = [];
const stationPolicePets = [];
const pendingDansoBoomerangs = [];
const skillAnnouncementCooldowns = new Map();

const input = {
  x: 0,
  y: 0,
  touchId: null,
  originX: 0,
  originY: 0,
  pointers: new Map(),
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
  nextXp: 90,
  kills: 0,
  score: 0,
  elapsed: 0,
  damage: 32.5,
  attackPower: 100,
  defensePower: 100,
  fireRate: 0.35,
  fireCooldown: 0,
  shots: 1,
  bulletSpeed: 452,
  magnet: START_MAGNET_RANGE,
  damageReduction: 0,
  dodgeChance: 0,
  specialLabels: [],
  healMultiplier: 1,
  meleeDamageMultiplier: 1,
  bulletDamageMultiplier: 1,
  bulletFireRateMultiplier: 1,
  defenseBreakTimer: 0,
  defenseBreakPower: 0,
  stunTimer: 0,
  slowTimer: 0,
  slowMultiplier: 1,
  regenLevel: 0,
  regenTimer: 4,
  firstAidKits: 1,
  policeCalls: 0,
  taserGuns: 0,
  chickenBreasts: 0,
  chickenTimer: 0,
  tankCannonCooldown: 0,
  stimPacks: 0,
  stimTimer: 0,
  stimDrainTimer: STIMPACK_DRAIN_TICK,
  xpNeedMultiplier: 1,
  invuln: 0,
  alive: false,
};

const weapons = {
  lightning: { level: 0, cooldown: 3.4 },
  card: { level: 0, cooldown: 0.45 },
  lowKick: { level: 0, cooldown: 2.4 },
  strapOrbit: { level: 0, angle: 0 },
  tearGas: { level: 0, pulse: 0 },
  announcement: { level: 0, cooldown: 3.9 },
  expressTrain: { level: 0, cooldown: 8.2 },
  transferGate: { level: 0, cooldown: 6.2 },
  customerMissile: { level: 0, cooldown: 0.45 },
  subwayPolice: { level: 0 },
};

const game = {
  state: "menu",
  paused: false,
  manualPaused: false,
  pendingHeroChoice: false,
  pendingStarterChoices: 0,
  pendingLevelChoices: 0,
};

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, DPR_LIMIT);
  const rect = refs.app.getBoundingClientRect();
  width = Math.max(1, Math.floor(rect.width));
  height = Math.max(1, Math.floor(rect.height));
  updateViewSize();
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function updateViewSize() {
  viewWidth = width / FIXED_VIEW_SCALE;
  viewHeight = height / FIXED_VIEW_SCALE;
}

function snapCameraToPlayer() {
  updateViewSize();
  camera.x = clamp(player.x - viewWidth / 2, 0, WORLD_SIZE - viewWidth);
  camera.y = clamp(player.y - viewHeight / 2, 0, WORLD_SIZE - viewHeight);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function bossAttackCooldown(min, max) {
  return rand(min, max) * BOSS_ATTACK_COOLDOWN_MULTIPLIER;
}

function bossBasicAttackCooldown() {
  return bossAttackCooldown(BOSS_BASIC_ATTACK_MIN_COOLDOWN, BOSS_BASIC_ATTACK_MAX_COOLDOWN) * BOSS_BASIC_ATTACK_COOLDOWN_MULTIPLIER;
}

function bossSpecialAttackCooldown() {
  return bossAttackCooldown(BOSS_SPECIAL_ATTACK_MIN_COOLDOWN, BOSS_SPECIAL_ATTACK_MAX_COOLDOWN);
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

function ensureMusicTrack(kind) {
  if (!sound.enabled) return null;
  const isBoss = kind === "boss";
  const key = isBoss ? "bossMusic" : "normalMusic";
  if (!sound[key]) {
    const music = new Audio(isBoss ? BOSS_MUSIC_SRC : NORMAL_MUSIC_SRC);
    music.loop = true;
    music.preload = "auto";
    music.volume = 0;
    music.playsInline = true;
    sound[key] = music;
  }
  return sound[key];
}

function fadeMusicTrack(kind, targetVolume, { reset = false } = {}) {
  const isBoss = kind === "boss";
  const targetKey = isBoss ? "bossMusicTargetVolume" : "normalMusicTargetVolume";
  const fadeKey = isBoss ? "bossMusicFade" : "normalMusicFade";
  const maxVolume = isBoss ? BOSS_MUSIC_VOLUME : NORMAL_MUSIC_VOLUME;
  const music = ensureMusicTrack(kind);
  if (!music) return;
  sound[targetKey] = targetVolume;
  window.clearInterval(sound[fadeKey]);

  if (reset) {
    music.pause();
    music.currentTime = 0;
    music.volume = 0;
    sound[targetKey] = 0;
    return;
  }

  sound[fadeKey] = window.setInterval(() => {
    const diff = sound[targetKey] - music.volume;
    if (Math.abs(diff) < 0.015) {
      music.volume = sound[targetKey];
      if (music.volume <= 0) {
        music.pause();
        music.currentTime = 0;
      }
      window.clearInterval(sound[fadeKey]);
      sound[fadeKey] = null;
      return;
    }
    music.volume = clamp(music.volume + Math.sign(diff) * 0.035, 0, maxVolume);
  }, 45);
}

function updateBgm() {
  const upgradePicking = refs.upgradePanel && !refs.upgradePanel.classList.contains("hidden");
  const canPlay = game.state === "playing" && player.alive && (!game.paused || upgradePicking);
  const hasBoss = enemies.some((enemy) => enemy.boss);
  const shouldPlayBoss = canPlay && hasBoss;
  const shouldPlayNormal = canPlay && !hasBoss;

  for (const [kind, shouldPlay, volume] of [
    ["normal", shouldPlayNormal, NORMAL_MUSIC_VOLUME],
    ["boss", shouldPlayBoss, BOSS_MUSIC_VOLUME],
  ]) {
    const isBoss = kind === "boss";
    const music = shouldPlay || sound[isBoss ? "bossMusic" : "normalMusic"] ? ensureMusicTrack(kind) : null;
    if (!music) continue;
    const targetKey = isBoss ? "bossMusicTargetVolume" : "normalMusicTargetVolume";
    if (shouldPlay) {
      if (music.paused) music.play().catch(() => {});
      if (sound[targetKey] !== volume) fadeMusicTrack(kind, volume);
    } else if (!music.paused && sound[targetKey] !== 0) {
      fadeMusicTrack(kind, 0);
    }
  }
}

function stopAllMusic() {
  if (sound.normalMusic) fadeMusicTrack("normal", 0, { reset: true });
  if (sound.bossMusic) fadeMusicTrack("boss", 0, { reset: true });
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

function speakSkillName(text) {
  if (!sound.enabled || !sound.voiceEnabled || !("speechSynthesis" in window) || !soundAllowed("skillVoiceSpeech", 1150)) return;
  const cleanText = String(text ?? "").replace(/Lv\.\d+/gi, "").replace(/[!?~]+/g, "").trim();
  if (!cleanText || cleanText.length > 18 || cleanText.includes("�")) return;
  try {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ko-KR";
    utterance.rate = 1.14;
    utterance.pitch = 1.02;
    utterance.volume = 0.76;
    const voices = window.speechSynthesis.getVoices?.() ?? [];
    utterance.voice = voices.find((voice) => voice.lang?.toLowerCase().startsWith("ko")) ?? null;
    window.speechSynthesis.speak(utterance);
  } catch {
    sound.voiceEnabled = false;
  }
}

function speakSystemVoice(text, gap = 900) {
  if (!sound.enabled || !sound.voiceEnabled || !("speechSynthesis" in window) || !soundAllowed("systemVoiceSpeech", gap)) return;
  const cleanText = String(text ?? "").trim();
  if (!cleanText || cleanText.includes("�")) return;
  try {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ko-KR";
    utterance.rate = 1.02;
    utterance.pitch = 0.92;
    utterance.volume = 0.82;
    const voices = window.speechSynthesis.getVoices?.() ?? [];
    utterance.voice = voices.find((voice) => voice.lang?.toLowerCase().startsWith("ko")) ?? null;
    window.speechSynthesis.speak(utterance);
  } catch {
    sound.voiceEnabled = false;
  }
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
      playTone({ type: "triangle", frequency: 1120, endFrequency: 680, duration: 0.08, volume: 0.1, when: 0.045 });
      playNoise({ duration: 0.055, volume: 0.08, filter: 2600, when: 0.02 });
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
      if (!soundAllowed(id, 450)) return;
      playNoise({ duration: 0.62, volume: 0.3, filter: 360 });
      playTone({ type: "sawtooth", frequency: 110, endFrequency: 46, duration: 0.62, volume: 0.24 });
      playTone({ type: "square", frequency: 392, endFrequency: 392, duration: 0.14, volume: 0.18, when: 0.05 });
      playTone({ type: "square", frequency: 523, endFrequency: 440, duration: 0.2, volume: 0.14, when: 0.2 });
      break;
    case "gate":
      playTone({ type: "triangle", frequency: 520, endFrequency: 760, duration: 0.1, volume: 0.18 });
      playTone({ type: "triangle", frequency: 700, endFrequency: 420, duration: 0.16, volume: 0.16, when: 0.08 });
      break;
    case "gas":
      if (!soundAllowed(id, 900)) return;
      playNoise({ duration: 0.42, volume: 0.12, filter: 680 });
      playTone({ type: "sine", frequency: 92, endFrequency: 62, duration: 0.38, volume: 0.08 });
      break;
    case "strap":
      if (!soundAllowed(id, 160)) return;
      playTone({ type: "triangle", frequency: 560, endFrequency: 380, duration: 0.07, volume: 0.12 });
      playNoise({ duration: 0.045, volume: 0.06, filter: 1800 });
      break;
    case "missile":
      if (!soundAllowed(id, 90)) return;
      playTone({ type: "sawtooth", frequency: 420, endFrequency: 760, duration: 0.12, volume: 0.12 });
      playNoise({ duration: 0.08, volume: 0.08, filter: 1600 });
      break;
    case "explosion":
      playNoise({ duration: 0.18, volume: 0.25, filter: 780 });
      playTone({ type: "triangle", frequency: 95, endFrequency: 42, duration: 0.2, volume: 0.22 });
      break;
    case "taser":
      if (!soundAllowed(id, 280)) return;
      playNoise({ duration: 0.16, volume: 0.22, filter: 3200 });
      playTone({ type: "square", frequency: 1180, endFrequency: 280, duration: 0.18, volume: 0.18 });
      playTone({ type: "sawtooth", frequency: 1580, endFrequency: 740, duration: 0.1, volume: 0.1, when: 0.04 });
      break;
    case "taserHit":
      playNoise({ duration: 0.28, volume: 0.26, filter: 3600 });
      playTone({ type: "square", frequency: 1320, endFrequency: 110, duration: 0.32, volume: 0.22 });
      playTone({ type: "triangle", frequency: 720, endFrequency: 960, duration: 0.12, volume: 0.13, when: 0.08 });
      break;
    case "police":
      if (!soundAllowed(id, 450)) return;
      playTone({ type: "square", frequency: 740, endFrequency: 980, duration: 0.12, volume: 0.16 });
      playTone({ type: "square", frequency: 980, endFrequency: 740, duration: 0.12, volume: 0.14, when: 0.14 });
      playNoise({ duration: 0.16, volume: 0.08, filter: 2100, when: 0.06 });
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
  ensureMusicTrack("normal");
  ensureMusicTrack("boss");
  stopAllMusic();
  playSound("ui");
  enemies.length = 0;
  bullets.length = 0;
  orbs.length = 0;
  energyPickups.length = 0;
  particles.length = 0;
  damageZones.length = 0;
  popups.length = 0;
  speechBubbles.length = 0;
  skillAnnouncement = null;
  skillAnnouncementCooldowns.clear();
  cards.length = 0;
  missiles.length = 0;
  tankShells.length = 0;
  taserShots.length = 0;
  policeSquads.length = 0;
  stationPolicePets.length = 0;
  bossIndex = 0;
  bossBag = [];
  nextBossAt = 20;
  bossWarningFor = 0;
  specialStageBossMarks = new Set();
  specialStageUntil = 0;
  spawnTimer = 0;
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
    nextXp: 90,
    kills: 0,
    score: 0,
    elapsed: 0,
    damage: 32.5,
    attackPower: 100,
    defensePower: 100,
    fireRate: 0.35,
    fireCooldown: 0.18,
    shots: 1,
    bulletSpeed: 452,
    magnet: START_MAGNET_RANGE,
    damageReduction: 0,
    dodgeChance: 0,
    specialLabels: [],
    healMultiplier: 1,
    meleeDamageMultiplier: 1,
    bulletDamageMultiplier: 1,
    bulletFireRateMultiplier: 1,
    defenseBreakTimer: 0,
    defenseBreakPower: 0,
    stunTimer: 0,
    slowTimer: 0,
    slowMultiplier: 1,
    regenLevel: 0,
    regenTimer: 4,
    firstAidKits: 1,
    policeCalls: 0,
    taserGuns: 0,
    chickenBreasts: 0,
    chickenTimer: 0,
    tankCannonCooldown: 0,
    stimPacks: 0,
    stimTimer: 0,
    stimDrainTimer: STIMPACK_DRAIN_TICK,
    xpNeedMultiplier: 1,
    invuln: 0,
    alive: true,
  });
  snapCameraToPlayer();
  Object.assign(weapons.lightning, { level: 0, cooldown: 3.4 });
  Object.assign(weapons.card, { level: 0, cooldown: 0.45 });
  Object.assign(weapons.lowKick, { level: 0, cooldown: 2.4 });
  Object.assign(weapons.strapOrbit, { level: 0, angle: 0 });
  Object.assign(weapons.tearGas, { level: 0, pulse: 0 });
  Object.assign(weapons.announcement, { level: 0, cooldown: 3.9 });
  Object.assign(weapons.expressTrain, { level: 0, cooldown: 8.2 });
  Object.assign(weapons.transferGate, { level: 0, cooldown: 6.2 });
  Object.assign(weapons.customerMissile, { level: 0, cooldown: 0.45 });
  Object.assign(weapons.subwayPolice, { level: 0 });
  game.state = "playing";
  game.paused = true;
  game.manualPaused = false;
  game.pendingHeroChoice = true;
  game.pendingStarterChoices = 0;
  game.pendingLevelChoices = 0;
  pendingDansoBoomerangs.length = 0;
  input.pointers.clear();
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
    button.className = `hero-card hero-card--${hero.id}`;
    button.type = "button";
    button.innerHTML = `
      <img src="${hero.cardImage ?? hero.image}" alt="${hero.name}" />
      <strong>${hero.name}</strong>
      <p>${hero.quote}</p>
      <div class="hero-stats">
        <span>HP ${hero.hp}</span>
        <span>ATK ${hero.atk}</span>
        <span>DEF ${hero.def}</span>
        <span>SPD ${hero.spd}</span>
      </div>
      ${
        hero.specialLabels?.length
          ? `<div class="hero-specials">${hero.specialLabels.map((label) => `<span>${label}</span>`).join("")}</div>`
          : ""
      }
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
  player.damage = 25;
  player.attackPower = hero.atk;
  player.defensePower = hero.def;
  player.speed = 205 * (hero.spd / 100);
  player.damageReduction = 0;
  player.dodgeChance = hero.dodgeChance ?? 0;
  player.specialLabels = hero.specialLabels ? [...hero.specialLabels] : [];
  player.healMultiplier = hero.healMultiplier ?? 1;
  player.meleeDamageMultiplier = hero.meleeDamageMultiplier ?? 1;
  player.bulletDamageMultiplier = hero.bulletDamageMultiplier ?? 1;
  player.bulletFireRateMultiplier = hero.bulletFireRateMultiplier ?? 1;
  snapCameraToPlayer();
  refs.heroPanel.classList.add("hidden");
  game.pendingHeroChoice = false;
  game.pendingStarterChoices = 3;
  updateHud();
  openUpgradePanel();
}

function setupAllyPreview(mode = "pacemaker") {
  resetGame();
  const heroId = mode === "reserve" ? "changwoo" : mode === "police" ? "gae-hwanam" : "juyeon";
  selectHero(heroId);
  game.paused = false;
  game.manualPaused = false;
  game.pendingStarterChoices = 0;
  game.pendingLevelChoices = 0;
  refs.heroPanel.classList.add("hidden");
  refs.upgradePanel.classList.add("hidden");
  refs.message.classList.add("hidden");
  player.x = WORLD_SIZE / 2;
  player.y = WORLD_SIZE / 2;
  player.elapsed = 160;
  player.level = 5;
  player.policeCalls = 1;
  weapons.subwayPolice.level = 3;
  snapCameraToPlayer();
  syncStationPolicePets();
  const previewMonsters = [
    { type: monsterTypes[0], x: player.x - 190, y: player.y - 120 },
    { type: monsterTypes[1], x: player.x + 210, y: player.y - 108 },
    { type: monsterTypes[2], x: player.x - 235, y: player.y + 115 },
    { type: monsterTypes[5], x: player.x + 245, y: player.y + 120 },
  ];
  for (const item of previewMonsters) {
    const enemy = spawnEnemy(item.type, false);
    enemy.x = item.x;
    enemy.y = item.y;
    enemy.spawnFlash = 0;
    enemy.stunTimer = 0.6;
  }
  if (mode === "reserve") useComradeDropCall();
  else if (mode === "police") usePoliceCall();
  else usePacemakerMedalCall();
  updateHud();
}

function togglePause() {
  if (game.state !== "playing" || game.pendingHeroChoice || game.pendingStarterChoices > 0) return;
  if (!game.manualPaused && game.paused) return;
  game.manualPaused = !game.manualPaused;
  game.paused = game.manualPaused;
  resetFloatingStickMove();
  updateBgm();
  playSound("ui");
  updateHud();
}

function toggleUpgradePause() {
  if (game.state !== "playing" || refs.upgradePanel.classList.contains("hidden") || game.pendingStarterChoices > 0) return;
  game.manualPaused = !game.manualPaused;
  game.paused = game.manualPaused;
  resetFloatingStickMove();
  updateBgm();
  playSound("ui");
  updateUpgradePauseButton();
  updateHud();
}

function updateUpgradePauseButton() {
  if (!refs.upgradePauseButton) return;
  const starterPicking = game.pendingStarterChoices > 0;
  refs.upgradePauseButton.disabled = starterPicking;
  refs.upgradePauseButton.textContent = starterPicking ? "선택 중" : game.manualPaused ? "계속하기" : "일시정지";
  refs.upgradePauseButton.classList.toggle("active", game.manualPaused || starterPicking);
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

function calculateEnemyXp(type, hpScale) {
  const baseXp = type.xp ?? Math.max(1, Math.round((type.hp ?? 10) / 12));
  return Math.max(1, Math.round(baseXp * hpScale * ENEMY_XP_REWARD_MULTIPLIER));
}

function getEnemyLevelBonus() {
  return Math.max(0, player.level - 1);
}

function getBossHpLevelScale() {
  return 1 + getEnemyLevelBonus() * 0.22;
}

function getBossAttackLevelScale() {
  return 1 + getEnemyLevelBonus() * 0.08;
}

function getNormalEnemyLevelScale() {
  return 1 + getEnemyLevelBonus() * 0.07;
}

function getNormalEnemyHpLevelScale() {
  return 1 + getEnemyLevelBonus() * 0.14;
}

function scaleBossDamage(enemy, damage) {
  return Math.round(damage * (enemy.attackScale ?? 1) * ENEMY_DAMAGE_GLOBAL_MULTIPLIER);
}

function getSpawnSafeRadius(boss = false) {
  const viewportBased = Math.min(viewWidth, viewHeight) * (boss ? 0.62 : 0.48);
  return Math.max(boss ? BOSS_SPAWN_SAFE_RADIUS : NORMAL_SPAWN_SAFE_RADIUS, viewportBased);
}

function isSafeSpawnDistance(point, boss = false) {
  return Math.hypot(point.x - player.x, point.y - player.y) >= getSpawnSafeRadius(boss);
}

function keepSpawnAwayFromPlayer(point, boss = false, min = 50, max = WORLD_SIZE - 50) {
  const safeRadius = getSpawnSafeRadius(boss);
  let dx = point.x - player.x;
  let dy = point.y - player.y;
  let dist = Math.hypot(dx, dy);
  if (dist >= safeRadius) return point;
  if (dist < 0.001) {
    dx = player.x < WORLD_SIZE / 2 ? -1 : 1;
    dy = 0;
    dist = 1;
  }
  const pushed = {
    x: clamp(player.x + (dx / dist) * (safeRadius + 40), min, max),
    y: clamp(player.y + (dy / dist) * (safeRadius + 40), min, max),
  };
  if (Math.hypot(pushed.x - player.x, pushed.y - player.y) >= safeRadius * 0.92) return pushed;

  const fallbackPoints = [
    { x: min, y: min },
    { x: max, y: min },
    { x: min, y: max },
    { x: max, y: max },
    { x: min, y: clamp(player.y, min, max) },
    { x: max, y: clamp(player.y, min, max) },
    { x: clamp(player.x, min, max), y: min },
    { x: clamp(player.x, min, max), y: max },
  ];
  return fallbackPoints.sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y))[0];
}

function getOffscreenSpawnPoint(boss = false) {
  const margin = boss ? 260 : 170;
  const min = 50;
  const max = WORLD_SIZE - 50;
  const edgeBuffer = boss ? 120 : 78;
  const left = camera.x;
  const right = camera.x + viewWidth;
  const top = camera.y;
  const bottom = camera.y + viewHeight;
  const candidates = [];
  const allCandidates = [];
  const addCandidate = (point) => {
    allCandidates.push(point);
    if (isSafeSpawnDistance(point, boss)) candidates.push(point);
  };

  for (let sample = 0; sample < 6; sample += 1) {
    if (left > min) addCandidate({
      x: Math.max(min, left - margin),
      y: clamp(rand(top - margin * 0.35, bottom + margin * 0.35), min, max),
    });
    if (right < max) addCandidate({
      x: Math.min(max, right + margin),
      y: clamp(rand(top - margin * 0.35, bottom + margin * 0.35), min, max),
    });
    if (top > min) addCandidate({
      x: clamp(rand(left - margin * 0.35, right + margin * 0.35), min, max),
      y: Math.max(min, top - margin),
    });
    if (bottom < max) addCandidate({
      x: clamp(rand(left - margin * 0.35, right + margin * 0.35), min, max),
      y: Math.min(max, bottom + margin),
    });
  }

  let point;
  if (candidates.length > 0) {
    point = candidates[Math.floor(Math.random() * candidates.length)];
  } else if (allCandidates.length > 0) {
    point = allCandidates.sort((a, b) => Math.hypot(b.x - player.x, b.y - player.y) - Math.hypot(a.x - player.x, a.y - player.y))[0];
  } else {
    point = {
      x: player.x < WORLD_SIZE / 2 ? max : min,
      y: clamp(player.y, min, max),
    };
  }

  const visibleX = point.x >= left - edgeBuffer && point.x <= right + edgeBuffer;
  const visibleY = point.y >= top - edgeBuffer && point.y <= bottom + edgeBuffer;
  if (visibleX && visibleY) {
    const distances = [
      { side: "left", value: Math.abs(point.x - left), allowed: left > min },
      { side: "right", value: Math.abs(right - point.x), allowed: right < max },
      { side: "top", value: Math.abs(point.y - top), allowed: top > min },
      { side: "bottom", value: Math.abs(bottom - point.y), allowed: bottom < max },
    ]
      .filter((side) => side.allowed)
      .sort((a, b) => a.value - b.value);
    const side = distances[0]?.side;
    if (side === "left") point.x = Math.max(min, left - edgeBuffer);
    else if (side === "right") point.x = Math.min(max, right + edgeBuffer);
    else if (side === "top") point.y = Math.max(min, top - edgeBuffer);
    else if (side === "bottom") point.y = Math.min(max, bottom + edgeBuffer);
  }

  return keepSpawnAwayFromPlayer(point, boss, min, max);
}

function getEncircleOffscreenPoint(angle, extraDistance = 120) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const margin = 96 + extraDistance;
  const left = camera.x - margin;
  const right = camera.x + viewWidth + margin;
  const top = camera.y - margin;
  const bottom = camera.y + viewHeight + margin;
  const distances = [];
  if (dx > 0.001) distances.push((right - player.x) / dx);
  if (dx < -0.001) distances.push((left - player.x) / dx);
  if (dy > 0.001) distances.push((bottom - player.y) / dy);
  if (dy < -0.001) distances.push((top - player.y) / dy);
  const distance = Math.max(220, Math.min(...distances.filter((value) => value > 0)) + rand(12, 76));
  let point = {
    x: clamp(player.x + dx * distance, 50, WORLD_SIZE - 50),
    y: clamp(player.y + dy * distance, 50, WORLD_SIZE - 50),
  };
  const visible =
    point.x > camera.x - 64 &&
    point.x < camera.x + viewWidth + 64 &&
    point.y > camera.y - 64 &&
    point.y < camera.y + viewHeight + 64;
  if (visible) point = getOffscreenSpawnPoint(false);
  return keepSpawnAwayFromPlayer(point, false, 50, WORLD_SIZE - 50);
}

function spawnCommuteProtestStage() {
  showBossBanner("異쒓렐湲??쒖쐞 ?쒖옉");
  addPopup("異쒓렐湲??쒖쐞 ?쒖옉", player.x, player.y - 96, "#fff3b0", 2.0, 24);
  playSound("boss");

  const count = 100;
  const hpScale = getNormalEnemyHpLevelScale() * ENEMY_HP_GLOBAL_MULTIPLIER * 1.15 * COMMUTE_PROTEST_HP_MULTIPLIER;
  const attackScale = getNormalEnemyLevelScale();
  for (let i = 0; i < count; i += 1) {
    const angle = (TAU * i) / count + rand(-0.06, 0.06);
    const point = getEncircleOffscreenPoint(angle, 130 + (i % 5) * 18);
    const hp = 416 * hpScale;
    enemies.push({
      id: "commute-protest",
      name: "異쒓렐湲??쒖쐞?",
      shortName: "?쒖쐞?",
      color: "#495057",
      trim: "#fff3b0",
      hp,
      maxHp: hp,
      speed: rand(31, 43) * ENEMY_SPEED_GLOBAL_MULTIPLIER * COMMUTE_PROTEST_SPEED_MULTIPLIER,
      damage: 6 * attackScale * ENEMY_DAMAGE_GLOBAL_MULTIPLIER,
      attackScale,
      radius: 62 * 0.68 * 0.8 * MONSTER_SIZE_SCALE,
      bodySize: 0.9,
      xp: Math.round(26 * hpScale),
      score: 34,
      x: point.x,
      y: point.y,
      boss: false,
      special: "commute-protest",
      angleOffset: Math.random() * TAU,
      cooldown: rand(1.2, 2.4),
      hitFlash: 0,
      dash: 0,
      wobble: Math.random() * TAU,
      attackSpeechCooldown: 0,
      boostTimer: 0,
      speedBoostMultiplier: 1,
      defenseBoostTimer: 0,
      defenseBoostPower: 0,
      stunTimer: 0,
      taserLinkTimer: 0,
      taserLinkMax: 0,
      spawnFlash: 0.7,
    });
  }
}

function spawnEnemy(type = null, boss = false) {
  const minute = player.elapsed / 60;
  const chosen = type ?? weightedPick(monsterTypes, minute);
  const spawnPoint = getOffscreenSpawnPoint(boss);
  const x = spawnPoint.x;
  const y = spawnPoint.y;
  const normalScale = boss ? 1 + minute * 0.11 : 1 + Math.min(1.35, minute * 0.08);
  const normalLevelScale = getNormalEnemyLevelScale();
  const levelHpScale = boss ? getBossHpLevelScale() : getNormalEnemyHpLevelScale();
  const hpScale = normalScale * levelHpScale * ENEMY_HP_GLOBAL_MULTIPLIER * (boss ? 1 : 1.15);
  const attackScale = boss ? getBossAttackLevelScale() : normalLevelScale;
  const enemy = {
    ...chosen,
    x,
    y,
    hp: chosen.hp * hpScale,
    maxHp: chosen.hp * hpScale,
    speed: chosen.speed * (boss ? 1.42 * BOSS_SPEED_GLOBAL_MULTIPLIER : 1) * ENEMY_SPEED_GLOBAL_MULTIPLIER,
    damage: chosen.damage * attackScale * ENEMY_DAMAGE_GLOBAL_MULTIPLIER,
    attackScale,
    radius: chosen.radius * (boss ? BOSS_SIZE_SCALE : MONSTER_SIZE_SCALE),
    xp: calculateEnemyXp(chosen, hpScale),
    boss,
    angleOffset: Math.random() * TAU,
    cooldown: rand(0.3, 1.1),
    hitFlash: 0,
    dash: 0,
    wobble: Math.random() * TAU,
    swingCooldown: bossBasicAttackCooldown(),
    soundCooldown: bossSpecialAttackCooldown(),
    tauntCooldown: bossBasicAttackCooldown(),
    crisisCooldown: bossSpecialAttackCooldown(),
    flagCooldown: bossSpecialAttackCooldown(),
    spearCooldown: bossBasicAttackCooldown(),
    praiseCooldown: bossBasicAttackCooldown(),
    praiseStunCooldown: bossSpecialAttackCooldown(),
    bubbleCooldown: bossBasicAttackCooldown(),
    giantGumCooldown: bossSpecialAttackCooldown(),
    danceKickCooldown: bossAttackCooldown(0.7, 1.3),
    danceStampCooldown: bossSpecialAttackCooldown(),
    retreatTimer: 0,
    attackSpeechCooldown: 0,
    boostTimer: 0,
    speedBoostMultiplier: 1,
    defenseBoostTimer: 0,
    defenseBoostPower: 0,
    stunTimer: 0,
    taserLinkTimer: 0,
    taserLinkMax: 0,
    spawnFlash: boss ? 1.0 : 0.7,
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
  const multiplier = 0.68 + bossIndex * 0.27 + cycle * 0.4;
  const hpBoost = 1.15;
  const damageMultiplier = 0.82 + bossIndex * 0.06;
  boss.hp *= multiplier * hpBoost;
  boss.maxHp = boss.hp;
  boss.damage *= damageMultiplier;
  boss.attackScale *= damageMultiplier;
  boss.score = Math.round(base.score * (1 + bossIndex * 0.25));
  boss.xp = Math.round(boss.xp * multiplier * hpBoost);
  boss.radius = (base.radius + Math.min(14, bossIndex * 2)) * BOSS_SIZE_SCALE;
  bossIndex += 1;
  showBossBanner(base.name, { boss: true });
  addPopup("蹂댁뒪 ?깆옣", player.x, player.y - 90, "#ffe066", 1.8, 28);
  playSound("boss");
  updateBgm();
}

function updateBossSchedule() {
  if (enemies.some((enemy) => enemy.boss)) return;

  if (specialStageUntil > 0 && player.elapsed < specialStageUntil) return;

  if (player.elapsed >= nextBossAt) {
    const shouldSpawnSpecialStage = bossIndex >= 2 && bossIndex <= 8 && bossIndex % 2 === 0;
    if (shouldSpawnSpecialStage && !specialStageBossMarks.has(bossIndex)) {
      specialStageBossMarks.add(bossIndex);
      spawnCommuteProtestStage();
      specialStageUntil = player.elapsed + 24;
      nextBossAt = specialStageUntil;
      bossWarningFor = 0;
      return;
    }
    specialStageUntil = 0;
    spawnBoss();
    nextBossAt = player.elapsed + 55;
    bossWarningFor = 0;
  }
}

function showBossBanner(name, { boss = false } = {}) {
  window.clearTimeout(bossBannerTimer);
  window.clearTimeout(bossBannerNameTimer);
  const bossNameDelay = 825;
  const bossNameDuration = 2700;
  refs.bossBanner.classList.toggle("boss-alert", boss);
  refs.bossBanner.classList.remove("name-phase");
  refs.bossBanner.classList.remove("boss-name-only");
  refs.bossBanner.innerHTML = boss ? "<strong>보스출현</strong>" : `<strong>${name}</strong>`;
  refs.bossBanner.classList.add("active");
  if (boss) speakSystemVoice("보스 출현", 1600);
  if (boss) {
    bossBannerNameTimer = window.setTimeout(() => {
      refs.bossBanner.classList.remove("boss-alert");
      refs.bossBanner.classList.add("name-phase");
      refs.bossBanner.classList.add("boss-name-only");
      refs.bossBanner.innerHTML = `<strong>${name}</strong>`;
    }, bossNameDelay);
  }
  bossBannerTimer = window.setTimeout(() => {
    refs.bossBanner.classList.remove("active");
    refs.bossBanner.classList.remove("boss-alert");
    refs.bossBanner.classList.remove("name-phase");
    refs.bossBanner.classList.remove("boss-name-only");
  }, boss ? bossNameDelay + bossNameDuration : 2200);
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

function findCustomerMissileTarget(maxDistance = Infinity) {
  let nearestBoss = null;
  let nearestBossDistance = maxDistance;
  for (const enemy of enemies) {
    if (!enemy.boss) continue;
    const currentDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (currentDistance < nearestBossDistance) {
      nearestBoss = enemy;
      nearestBossDistance = currentDistance;
    }
  }
  return nearestBoss ?? findNearestEnemy(maxDistance);
}

function findPriorityEnemyFrom(source, maxDistance = Infinity) {
  let nearestBoss = null;
  let nearestBossDistance = maxDistance;
  let nearestEnemy = null;
  let nearestEnemyDistance = maxDistance;
  for (const enemy of enemies) {
    const currentDistance = Math.hypot(enemy.x - source.x, enemy.y - source.y);
    if (enemy.boss && currentDistance < nearestBossDistance) {
      nearestBoss = enemy;
      nearestBossDistance = currentDistance;
    }
    if (currentDistance < nearestEnemyDistance) {
      nearestEnemy = enemy;
      nearestEnemyDistance = currentDistance;
    }
  }
  return nearestBoss ?? nearestEnemy;
}

function fireBulletVolley(source, target, count, {
  damage = player.damage * (player.bulletDamageMultiplier || 1),
  speed = player.bulletSpeed,
  radius = 10,
  color = "#fff2a8",
  style = "default",
} = {}) {
  if (!target) return;
  const safeCount = Math.max(1, count);
  const baseAngle = angleTo(source, target);
  const spread = Math.min(0.72, 0.14 * (safeCount - 1));
  for (let i = 0; i < safeCount; i += 1) {
    const offset = safeCount === 1 ? 0 : -spread / 2 + (spread * i) / (safeCount - 1);
    bullets.push({
      x: source.x + Math.cos(baseAngle + offset) * 24,
      y: source.y + Math.sin(baseAngle + offset) * 24,
      vx: Math.cos(baseAngle + offset) * speed,
      vy: Math.sin(baseAngle + offset) * speed,
      damage,
      radius,
      life: 30,
      hitEnemies: new Set(),
      color,
      style,
    });
  }
}

function fireBullets() {
  const target = findPriorityEnemyFrom(player, 680);
  if (!target) return;
  const bulletStyle = getBasicBulletStyle();
  fireBulletVolley(player, target, player.shots, {
    style: bulletStyle,
    color: bulletStyle === "military" || bulletStyle === "medal" ? "#ffd166" : "#fff2a8",
  });
  playSound("shot");
}

function spawnCard() {
  if (weapons.card.level <= 0) return;
  const target = findNearestEnemy(820);
  if (!target) return;
  const angle = angleTo(player, target);
  const level = weapons.card.level;
  const count = Math.max(1, level);
  const spread = Math.min(0.62, 0.14 * (count - 1));
  const speed = 662;
  for (let i = 0; i < count; i += 1) {
    const cardAngle = count === 1 ? angle : angle - spread / 2 + (spread * i) / (count - 1);
    cards.push({
      x: player.x,
      y: player.y,
      vx: Math.cos(cardAngle) * speed,
      vy: Math.sin(cardAngle) * speed,
      damage: 64,
      life: 7.85,
      maxLife: 7.85,
      radius: 27,
      rotation: 0,
      bounces: 0,
      maxBounces: 5,
      hitTimers: new Map(),
      trail: [],
    });
  }
  playSound("card");
}

function strikeLightning() {
  if (weapons.lightning.level <= 0 || enemies.length === 0) return;
  const strikes = Math.min(5, weapons.lightning.level);
  const bossTarget = enemies
    .filter((enemy) => enemy.boss)
    .sort((a, b) => distance(player, a) - distance(player, b))[0];
  const targets = bossTarget ? [bossTarget] : [];
  const nearbyTargets = enemies
    .filter((enemy) => enemy !== bossTarget)
    .sort((a, b) => distance(player, a) - distance(player, b))
    .slice(0, strikes + 3)
    .sort(() => Math.random() - 0.5);
  for (const enemy of nearbyTargets) {
    if (targets.length >= strikes) break;
    targets.push(enemy);
  }
  for (const enemy of targets) {
    const damage = getLightningDamageForLevel(weapons.lightning.level);
    const strikeRadius = (58 + weapons.lightning.level * 7) * 1.183 * 1.3 * 1.2 * 1.15;
    const levelBonus = Math.max(0, weapons.lightning.level - 1);
    const bossStun = 0.5 + levelBonus * 0.1;
    const monsterStun = 3 + levelBonus * 0.3;
    damageEnemy(enemy, enemy.boss ? Math.round(damage * 1.25) : damage, "#9bf6ff");
    enemy.stunTimer = Math.max(enemy.stunTimer ?? 0, enemy.boss ? bossStun : monsterStun);
    addParticles(enemy.x, enemy.y, "#9bf6ff", enemy.boss ? 14 : 9);
    damageZones.push({
      x: enemy.x,
      y: enemy.y,
      radius: strikeRadius,
      damage: Math.round(damage * 0.45),
      stun: monsterStun,
      bossStun,
      life: 0.34,
      maxLife: 0.34,
      color: "#9bf6ff",
      hits: new Set([enemy]),
      kind: "lightning",
      boltSeed: Math.random() * TAU,
    });
  }
  if (targets.length > 0) {
    playSound("lightning");
  }
}

function getLightningDamageForLevel(level = 1) {
  const safeLevel = Math.max(1, level || 1);
  return Math.round((63 + safeLevel * 58) * 1.105 * 1.3 * 0.8);
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

function pickBossPriorityTarget(maxDistance = 900) {
  let nearestBoss = null;
  let nearestBossDistance = maxDistance;
  for (const enemy of enemies) {
    if (!enemy.boss) continue;
    const currentDistance = distance(player, enemy);
    if (currentDistance < nearestBossDistance) {
      nearestBoss = enemy;
      nearestBossDistance = currentDistance;
    }
  }
  return nearestBoss ?? pickClusterTarget(maxDistance);
}

function clampPointToVisibleWorld(x, y, margin = 90) {
  const safeMargin = Math.min(margin, viewWidth * 0.42, viewHeight * 0.42);
  return {
    x: clamp(x, camera.x + safeMargin, camera.x + viewWidth - safeMargin),
    y: clamp(y, camera.y + safeMargin, camera.y + viewHeight - safeMargin),
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
    push: 150 + level * 32,
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
    life: 0.78,
    maxLife: 0.78,
    color: "#80ffdb",
    hits: new Set(),
    kind: "announcementWave",
  });
  playSound("announcement");
}

function spawnExpressTrain() {
  const level = weapons.expressTrain.level;
  if (level <= 0) return;
  const trainWidthScale = 1.56;
  const trainLengthScale = 3.9;
  const vertical = Math.random() < 0.5;
  const direction = Math.random() < 0.5 ? -1 : 1;
  const target = pickBossPriorityTarget(1300);
  damageZones.push({
    x: target ? target.x : player.x,
    y: target ? target.y : player.y,
    vertical,
    width: (92 + level * 13) * trainWidthScale,
    trainLength: (520 + level * 34) * trainLengthScale,
    damage: (105 + level * 42) * 3,
    push: 470 + level * 62,
    stun: 3,
    bossStun: 0.5,
    angle: vertical ? (direction > 0 ? Math.PI / 2 : -Math.PI / 2) : direction > 0 ? 0 : Math.PI,
    direction,
    life: 3.07,
    maxLife: 3.07,
    color: "#f7d64a",
    hits: new Set(),
    kind: "train",
  });
  playSound("train");
}

function spawnTransferGate() {
  const level = weapons.transferGate.level;
  if (level <= 0 || enemies.length === 0) return;
  const target = pickClusterTarget(1000);
  if (!target) return;
  const crowdCount = Math.min(18, 9 + level * 3);
  const screenMargin = 68;
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
    radius: 112 + level * 20,
    startX: startWorld.x,
    startY: startWorld.y,
    endX: endWorld.x,
    endY: endWorld.y,
    pathLength,
    damage: 22 + level * 18,
    push: 128 + level * 18,
    life: 3.45,
    maxLife: 3.45,
    color: "#b197fc",
    armedAt: 0.04,
    angle,
    commuters: Array.from({ length: crowdCount }, (_, index) => ({
      delay: index * 0.045 + rand(0, 0.06),
      duration: rand(1.18, 1.55),
      lane: rand(-1.45, 1.45),
      coat: ["#f8f9fa", "#8fc7ff", "#fff3b0", "#ffb3c6", "#b8ffe4", "#cdb4db", "#adb5bd"][index % 7],
      bag: ["#7b2cbf", "#2d6a4f", "#704214", "#1d3557"][index % 4],
      size: rand(24, 33),
    })),
    hits: new Set(),
    kind: "gate",
  });
  playSound("gate");
}

function explodeCustomerMissile(missile) {
  const level = weapons.customerMissile.level;
  const radius = 54 + level * 12;
  const damage = Math.round((32 + level * 24) * 1.04 * 0.6 * 0.85);
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
  playSound("explosion");
}

function spawnCustomerMissiles() {
  const level = weapons.customerMissile.level;
  if (level <= 0 || enemies.length === 0) return;
  const count = Math.max(1, level);
  for (let i = 0; i < count; i += 1) {
    const target = findCustomerMissileTarget(900 + level * 40);
    if (!target) return;
    const angle = angleTo(player, target) + (i - (count - 1) / 2) * 0.32;
    const speed = 265 + level * 23;
    missiles.push({
      x: player.x + Math.cos(angle) * 22,
      y: player.y + Math.sin(angle) * 22,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      speed,
      turnRate: 7.2 + level * 0.5,
      damage: Math.round((22 + level * 15) * 1.04 * 0.85),
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

function getTankCannonDamage() {
  return 1200;
}

function fireTankCannon() {
  if (!isTankRadioHero() || !isChickenBuffActive()) return;
  const target = findPriorityEnemyFrom(player, 1500);
  if (!target) return;
  const angle = angleTo(player, target);
  tankShells.push({
    x: player.x + Math.cos(angle) * 44,
    y: player.y + Math.sin(angle) * 44,
    vx: Math.cos(angle) * 360,
    vy: Math.sin(angle) * 360,
    damage: getTankCannonDamage(),
    radius: 36,
    blastRadius: TANK_CANNON_RADIUS,
    life: 2.8,
    target,
    trail: [],
  });
  addPopup("K2 포격!", player.x, player.y - 96, "#ffd166", 0.55, 17);
  playSound("explosion");
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
  const wasChickenActive = player.chickenTimer > 0;
  player.chickenTimer = Math.max(0, (player.chickenTimer ?? 0) - delta);
  if (wasChickenActive && player.chickenTimer <= 0) {
    player.invuln = Math.max(player.invuln, CHICKEN_RELEASE_INVULN);
    addPopup("무적 1초", player.x, player.y - 66, "#ffd166", 0.55, 15);
  }
  if (player.stimTimer > 0) {
    player.stimTimer = Math.max(0, player.stimTimer - delta);
    player.stimDrainTimer = (player.stimDrainTimer ?? STIMPACK_DRAIN_TICK) - delta;
    while (player.stimTimer > 0 && player.stimDrainTimer <= 0) {
      applyStimpackDrain();
      player.stimDrainTimer += STIMPACK_DRAIN_TICK;
    }
  } else {
    player.stimDrainTimer = STIMPACK_DRAIN_TICK;
  }
  player.stunTimer = Math.max(0, player.stunTimer - delta);
  if (player.defenseBreakTimer > 0) {
    player.defenseBreakTimer = Math.max(0, player.defenseBreakTimer - delta);
    if (player.defenseBreakTimer <= 0) player.defenseBreakPower = 0;
  }
  if (player.hp < player.maxHp) {
    player.regenTimer -= delta;
    if (player.regenTimer <= 0) {
      healPlayer(getRegenHealAmount(), false);
      player.regenTimer = Math.max(2.2, 5.2 - player.regenLevel * 0.32);
    }
  }
  const cooldownDelta = getStimCooldownDelta(delta);
  player.fireCooldown -= cooldownDelta;
  if (!stunned && player.fireCooldown <= 0) {
    fireBullets();
    player.fireCooldown = getBasicBulletFireRate();
  }

  const strapSpeedMultiplier = player.heroId === "changwoo" ? 0.6 : 1;
  weapons.strapOrbit.angle += delta * (5.3 + weapons.strapOrbit.level * 0.32) * strapSpeedMultiplier * 1.3;
  weapons.lightning.cooldown -= cooldownDelta;
  if (weapons.lightning.cooldown <= 0) {
    strikeLightning();
    weapons.lightning.cooldown = 3;
  }

  weapons.card.cooldown -= cooldownDelta;
  if (weapons.card.level > 0 && weapons.card.cooldown <= 0) {
    spawnCard();
    weapons.card.cooldown = 2.37;
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

  weapons.customerMissile.cooldown -= cooldownDelta;
  if (weapons.customerMissile.level > 0 && weapons.customerMissile.cooldown <= 0) {
    spawnCustomerMissiles();
    weapons.customerMissile.cooldown = 0.68;
  }

  if (isTankRadioHero() && isChickenBuffActive()) {
    player.tankCannonCooldown -= delta;
    if (player.tankCannonCooldown <= 0) {
      fireTankCannon();
      player.tankCannonCooldown = TANK_CANNON_COOLDOWN;
    }
  } else {
    player.tankCannonCooldown = 0;
  }

}

function updatePendingDansoBoomerangs(delta) {
  for (const pending of [...pendingDansoBoomerangs]) {
    pending.delay -= delta;
    if (pending.delay > 0) continue;
    pendingDansoBoomerangs.splice(pendingDansoBoomerangs.indexOf(pending), 1);
    if (!pending.owner || !enemies.includes(pending.owner)) continue;
    launchDansoBoomerang(pending.owner, pending.variant);
  }
}

function updateEnemies(delta) {
  const minute = player.elapsed / 60;
  spawnTimer -= delta;
  const earlyTimeSpawnBoost = minute < 1 ? 0.72 : minute < 2 ? 0.86 : 1;
  const earlyLevelSpawnBoost = player.level <= 5 ? 0.92 : 1;
  const spawnGap = Math.max(0.62, (0.82 - minute * 0.014) * 1.95 * earlyTimeSpawnBoost * earlyLevelSpawnBoost);
  if (spawnTimer <= 0) {
    const basePack = 1 + Math.floor(minute * 0.26) + (Math.random() < 0.14 + minute * 0.012 ? 1 : 0);
    const levelSpawnMultiplier = 1 + Math.max(0, player.level - 1) * 0.03;
    const scaledPack = basePack * levelSpawnMultiplier;
    const pack = Math.floor(scaledPack) + (Math.random() < scaledPack % 1 ? 1 : 0);
    for (let i = 0; i < pack; i += 1) spawnEnemy();
    spawnTimer = spawnGap;
  }

  updateBossSchedule();

  for (const enemy of [...enemies]) {
    enemy.stunTimer = Math.max(0, (enemy.stunTimer ?? 0) - delta);
    enemy.taserLinkTimer = Math.max(0, (enemy.taserLinkTimer ?? 0) - delta);
    if (enemy.taserLinkTimer > 0) {
      enemy.taserDamageTick = Math.max(0, (enemy.taserDamageTick ?? TASER_DOT_TICK) - delta);
      if (enemy.taserDamageTick <= 0) {
        damageEnemy(enemy, enemy.taserDotDamage ?? 22, "#fff3b0");
        if (!enemies.includes(enemy)) continue;
        enemy.taserDamageTick = TASER_DOT_TICK;
      }
    } else {
      enemy.taserDamageTick = TASER_DOT_TICK;
      enemy.taserDotDamage = 0;
    }
    enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
    enemy.spawnFlash = Math.max(0, (enemy.spawnFlash ?? 0) - delta);
    if (enemy.stunTimer > 0) {
      enemy.wobble += delta * 0.35;
      continue;
    }
    enemy.cooldown -= delta;
    enemy.attackSpeechCooldown = Math.max(0, (enemy.attackSpeechCooldown ?? 0) - delta);
    enemy.boostTimer = Math.max(0, (enemy.boostTimer ?? 0) - delta);
    if (enemy.boostTimer <= 0) enemy.speedBoostMultiplier = 1;
    enemy.defenseBoostTimer = Math.max(0, (enemy.defenseBoostTimer ?? 0) - delta);
    if (enemy.defenseBoostTimer <= 0) enemy.defenseBoostPower = 0;
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
    if (enemy.special === "commute-protest") {
      speed *= 0.82 + Math.sin(enemy.wobble * 2.2) * 0.08;
    }
    if (enemy.special === "boss-dance" && enemy.retreatTimer > 0) {
      angle = angleTo(player, enemy);
      speed *= 1.9;
      enemy.retreatTimer = Math.max(0, enemy.retreatTimer - delta);
    }
    if (enemy.special === "boss-danso") {
      enemy.swingCooldown -= delta;
      enemy.soundCooldown -= delta;
      if (enemy.swingCooldown <= 0 && playerDistance < 880) {
        createDansoSwing(enemy);
        enemy.swingCooldown = bossBasicAttackCooldown();
      }
      if (enemy.soundCooldown <= 0 && playerDistance >= 160) {
        createDansoBoomerang(enemy);
        enemy.soundCooldown = bossSpecialAttackCooldown();
      }
    }
    if (enemy.special === "boss-airport") {
      enemy.tauntCooldown -= delta;
      enemy.crisisCooldown -= delta;
      if (enemy.tauntCooldown <= 0) {
        createAirportTaunt(enemy);
        enemy.tauntCooldown = bossBasicAttackCooldown();
      }
      if (enemy.crisisCooldown <= 0) {
        createAirportCrisis(enemy);
        enemy.crisisCooldown = bossSpecialAttackCooldown();
      }
    }
    if (enemy.special === "boss-jarvan") {
      enemy.flagCooldown -= delta;
      enemy.spearCooldown -= delta;
      if (enemy.flagCooldown <= 0) {
        createJarvanSpearVolley(enemy);
        enemy.flagCooldown = bossSpecialAttackCooldown();
      }
      if (enemy.spearCooldown <= 0 && playerDistance < Math.hypot(viewWidth, viewHeight) * 1.1) {
        createJarvanSpear(enemy);
        enemy.spearCooldown = bossBasicAttackCooldown();
      }
    }
    if (enemy.special === "boss-praise") {
      enemy.praiseCooldown -= delta;
      enemy.praiseStunCooldown -= delta;
      if (enemy.praiseCooldown <= 0) {
        createPraiseThumb(enemy);
        enemy.praiseCooldown = bossBasicAttackCooldown();
      }
      if (enemy.praiseStunCooldown <= 0) {
        createPraiseStunWave(enemy);
        enemy.praiseStunCooldown = bossSpecialAttackCooldown();
      }
    }
    if (enemy.special === "boss-gum") {
      enemy.bubbleCooldown -= delta;
      enemy.giantGumCooldown -= delta;
      if (enemy.bubbleCooldown <= 0) {
        createGumBubble(enemy);
        enemy.bubbleCooldown = bossBasicAttackCooldown();
      }
      if (enemy.giantGumCooldown <= 0) {
        createGiantGumBubble(enemy);
        enemy.giantGumCooldown = bossSpecialAttackCooldown();
      }
    }
    if (enemy.special === "boss-dance") {
      speed *= 1.18;
      enemy.danceKickCooldown -= delta;
      enemy.danceStampCooldown -= delta;
      if (enemy.danceKickCooldown <= 0 && playerDistance < 180) {
        createDanceKick(enemy);
        enemy.danceKickCooldown = bossAttackCooldown(2.0, 3.1);
      }
      if (enemy.danceStampCooldown <= 0) {
        createDanceStamp(enemy);
        enemy.danceStampCooldown = bossSpecialAttackCooldown();
      }
    }
    if (enemy.special === "luggage" || enemy.special === "boss-luggage") {
      if (enemy.cooldown <= 0) {
        enemy.dash = 0.35;
        enemy.cooldown = enemy.boss ? 2.8 * BOSS_ATTACK_COOLDOWN_MULTIPLIER : 4.2;
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
        enemy.cooldown = enemy.boss ? 2.1 * BOSS_ATTACK_COOLDOWN_MULTIPLIER : enemy.special === "shout" ? 2.7 : 3.4;
      }
    }
    if (enemy.boostTimer > 0) speed *= enemy.speedBoostMultiplier ?? 1;
    enemy.chickenHitCooldown = Math.max(0, (enemy.chickenHitCooldown ?? 0) - delta);

    enemy.x += Math.cos(angle) * speed * delta;
    enemy.y += Math.sin(angle) * speed * delta;

    const touchDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    const chickenActive = isChickenBuffActive();
    const playerBodyRadius = chickenActive ? player.radius * CHICKEN_COLLISION_RADIUS_MULTIPLIER : player.radius;
    if (touchDistance < enemy.radius + playerBodyRadius && chickenActive) {
      const canDamageWithBody = enemy.chickenHitCooldown <= 0;
      if (canDamageWithBody) {
        enemy.chickenHitCooldown = CHICKEN_HIT_COOLDOWN;
        damageEnemy(enemy, getChickenChargeDamage(), "#ffd166");
        if (!enemies.includes(enemy)) continue;
      }
      const push = angleTo(player, enemy);
      const pushAmount = (enemy.boss ? CHICKEN_KNOCKBACK / 2 : CHICKEN_KNOCKBACK) * (1 + clamp(player.chickenTimer / CHICKEN_BUFF_DURATION, 0, 1) * 0.18);
      enemy.x = clamp(enemy.x + Math.cos(push) * pushAmount, 35, WORLD_SIZE - 35);
      enemy.y = clamp(enemy.y + Math.sin(push) * pushAmount, 35, WORLD_SIZE - 35);
      addParticles(enemy.x, enemy.y, "#ffd166", canDamageWithBody ? enemy.boss ? 16 : 10 : enemy.boss ? 8 : 5);
      if (canDamageWithBody) addPopup("BODY!", enemy.x, enemy.y - enemy.radius - 16, "#ffd166", 0.45, enemy.boss ? 15 : 13);
      continue;
    }
    if (touchDistance < enemy.radius + player.radius && player.invuln <= 0) {
      if (enemy.boss && enemy.attackSpeechCooldown <= 0) {
        const line =
          enemy.special === "boss-airport"
            ? "???섎쭔 媛덇뎄?먭퀬!"
            : enemy.special === "boss-jarvan"
              ? "?딆? 寃껊뱾 鍮꾩폒??"
              : enemy.special === "boss-danso"
                ? "Who are you~ ??"
                : enemy.special === "boss-praise"
                  ? "?뱀떊??理쒓퀬??!"
                  : enemy.special === "boss-gum"
                    ? "踰꾨툝??"
                    : enemy.special === "boss-dance"
                      ? "?뚰궧 ?뚰궧"
                      : "鍮꾩폒!";
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
    damage: scaleBossDamage(enemy, damage),
    life: 0.52,
    maxLife: 0.52,
    color: enemy.boss ? "#ff477e" : "#ffd166",
    hostile: true,
    applied: false,
  });
}

function createDansoSwing(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "Who are you~ ??", 1.05);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    angle,
    length: Math.hypot(viewWidth, viewHeight) * 1.25,
    width: 32,
    radius: Math.hypot(viewWidth, viewHeight) * 1.25,
    damage: scaleBossDamage(enemy, 20),
    push: 54,
    stun: 0.22,
    life: 1.54 * BOSS_STAB_ATTACK_DURATION_MULTIPLIER,
    maxLife: 1.54 * BOSS_STAB_ATTACK_DURATION_MULTIPLIER,
    color: "#f9c74f",
    hostile: true,
    armedAt: 0.22 * BOSS_STAB_ATTACK_DURATION_MULTIPLIER,
    applied: false,
    kind: "dansoStab",
  });
  addParticles(enemy.x + Math.cos(angle) * 72, enemy.y + Math.sin(angle) * 72, "#f9c74f", 12);
}

function createDansoBoomerang(enemy) {
  launchDansoBoomerang(enemy, 0);
  pendingDansoBoomerangs.push({
    owner: enemy,
    delay: 2,
    variant: 1,
  });
}

function launchDansoBoomerang(enemy, variant = 0) {
  if (!enemies.includes(enemy)) return;
  const angle = angleTo(enemy, player);
  if (variant === 0) addSpeechBubble(enemy, "?덉씠 ?レ쑝硫?以묒씠 ?좊굹?쇱?~", 1.05);
  const startX = enemy.x + Math.cos(angle) * 54;
  const startY = enemy.y + Math.sin(angle) * 54;
  const targetDistance = Math.min(720, Math.max(260, Math.hypot(player.x - enemy.x, player.y - enemy.y) + 120));
  const targetX = enemy.x + Math.cos(angle) * targetDistance;
  const targetY = enemy.y + Math.sin(angle) * targetDistance;
  const curveSide = variant % 2 === 0 ? (Math.random() < 0.5 ? -1 : 1) : -1;
  const curveOffset = curveSide * Math.min(414, Math.max(219, targetDistance * 0.48));
  const life = 2.7 / 1.3;
  damageZones.push({
    x: startX,
    y: startY,
    prevX: startX,
    prevY: startY,
    startX,
    startY,
    targetX,
    targetY,
    curveOffset,
    angle,
    owner: enemy,
    radius: 120,
    damage: scaleBossDamage(enemy, 20),
    push: 58,
    stun: 0.28,
    returnAt: 0.56,
    life,
    maxLife: life,
    color: "#fff3b0",
    hostile: true,
    applied: false,
    kind: "dansoBoomerang",
    trail: [],
  });
  addParticles(enemy.x + Math.cos(angle) * 42, enemy.y + Math.sin(angle) * 42, "#fff3b0", 12);
}

function createAirportTaunt(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "???섎쭔 媛덇뎄?먭퀬!", 1.25);
  for (const offset of [-0.12, 0.12]) {
    const shotAngle = angle + offset;
    damageZones.push({
      x: enemy.x + Math.cos(shotAngle) * 34,
      y: enemy.y + Math.sin(shotAngle) * 34,
      vx: Math.cos(shotAngle) * 338 * BOSS_BASIC_ATTACK_SPEED_MULTIPLIER,
      vy: Math.sin(shotAngle) * 338 * BOSS_BASIC_ATTACK_SPEED_MULTIPLIER,
      radius: 55.2,
      damage: scaleBossDamage(enemy, 20),
      life: 2.15,
      maxLife: 2.15,
      color: "#80ffdb",
      hostile: true,
      consumeOnHit: true,
      applied: false,
      kind: "dollarBill",
    });
  }
  addParticles(enemy.x + Math.cos(angle) * 48, enemy.y + Math.sin(angle) * 48, "#80ffdb", 10);
}

function createAirportCrisis(enemy) {
  addSpeechBubble(enemy, "湲덉쑖 ?꾧린 紐⑤Ⅴ??湲덉쑖?꾧린 嫄곗???", 1.45);
  const dollarCount = 30;
  for (let i = 0; i < dollarCount; i += 1) {
    const angle = (TAU * i) / dollarCount + rand(-0.16, 0.16);
    damageZones.push({
      x: enemy.x,
      y: enemy.y,
      vx: Math.cos(angle) * rand(190, 330),
      vy: Math.sin(angle) * rand(190, 330),
      radius: 40.8,
      damage: scaleBossDamage(enemy, 12),
      life: 1.8,
      maxLife: 1.8,
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
  addSpeechBubble(enemy, "寃쎈줈?곕? 源껊컻!", 1.25);
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
  if (guarded > 0) addPopup(`諛⑹뼱 利앷? x${guarded}`, enemy.x, enemy.y - 28, "#fff3b0", 0.82, 14);
}

function createJarvanSpear(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "李쎌?瑜닿린!", 1.05);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    angle,
    length: Math.hypot(viewWidth, viewHeight) * 1.25,
    width: 70,
    radius: Math.hypot(viewWidth, viewHeight) * 1.25,
    damage: scaleBossDamage(enemy, 24),
    push: 86,
    stun: 0.46,
    life: 1.54 * BOSS_STAB_ATTACK_DURATION_MULTIPLIER,
    maxLife: 1.54 * BOSS_STAB_ATTACK_DURATION_MULTIPLIER,
    color: "#ffe066",
    hostile: true,
    armedAt: 0.46 * BOSS_STAB_ATTACK_DURATION_MULTIPLIER,
    applied: false,
    kind: "jarvanSpear",
  });
  addParticles(enemy.x + Math.cos(angle) * 82, enemy.y + Math.sin(angle) * 82, "#ffe066", 14);
}

function createJarvanSpearVolley(enemy) {
  const baseAngle = angleTo(enemy, player);
  addSpeechBubble(enemy, "李쎌쓣 諛쏆븘??", 1.15);
  for (const offset of [-0.36, -0.18, 0, 0.18, 0.36]) {
    const angle = baseAngle + offset;
    damageZones.push({
      x: enemy.x + Math.cos(angle) * 54,
      y: enemy.y + Math.sin(angle) * 54,
      vx: Math.cos(angle) * 350,
      vy: Math.sin(angle) * 350,
      angle,
      radius: 42,
      damage: scaleBossDamage(enemy, 22),
      push: 58,
      stun: 0.35,
      life: 1.65,
      maxLife: 1.65,
      color: "#ffe066",
      hostile: true,
      consumeOnHit: true,
      applied: false,
      kind: "jarvanFlyingSpear",
    });
  }
  addParticles(enemy.x, enemy.y, "#ffe066", 18);
}

function createPraiseThumb(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "?뱀떊??理쒓퀬??!", 1.1);
  for (const offset of [-0.13, 0.13]) {
    const shotAngle = angle + offset;
    damageZones.push({
      x: enemy.x + Math.cos(shotAngle) * 42,
      y: enemy.y + Math.sin(shotAngle) * 42,
      vx: Math.cos(shotAngle) * 620 * BOSS_BASIC_ATTACK_SPEED_MULTIPLIER,
      vy: Math.sin(shotAngle) * 620 * BOSS_BASIC_ATTACK_SPEED_MULTIPLIER,
      radius: 62.4,
      damage: scaleBossDamage(enemy, 20),
      life: 1.25,
      maxLife: 1.25,
      color: "#c77dff",
      hostile: true,
      consumeOnHit: true,
      applied: false,
      kind: "thumbShot",
    });
  }
}

function createPraiseStunWave(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "瑗쇱쭩 紐삵빐!", 1.25);
  damageZones.push({
    x: enemy.x + Math.cos(angle) * 54,
    y: enemy.y + Math.sin(angle) * 54,
    vx: Math.cos(angle) * 360,
    vy: Math.sin(angle) * 360,
    radius: 226.2,
    damage: scaleBossDamage(enemy, 18),
    stun: 1.6,
    life: 1.6,
    maxLife: 1.6,
    color: "#c77dff",
    hostile: true,
    consumeOnHit: true,
    applied: false,
    kind: "praiseWave",
  });
}

function createGumBubble(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "踰꾨툝??", 1.0);
  for (const offset of [-0.13, 0.13]) {
    const shotAngle = angle + offset;
    damageZones.push({
      x: enemy.x + Math.cos(shotAngle) * 42,
      y: enemy.y + Math.sin(shotAngle) * 42,
      vx: Math.cos(shotAngle) * 310 * BOSS_BASIC_ATTACK_SPEED_MULTIPLIER,
      vy: Math.sin(shotAngle) * 310 * BOSS_BASIC_ATTACK_SPEED_MULTIPLIER,
      radius: 65,
      damage: scaleBossDamage(enemy, 12),
      slow: 2.5,
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
}


function createGiantGumBubble(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "嫄곕? 踰꾨툝??", 1.35);
  damageZones.push({
    x: enemy.x + Math.cos(angle) * 54,
    y: enemy.y + Math.sin(angle) * 54,
    vx: Math.cos(angle) * 185,
    vy: Math.sin(angle) * 185,
    radius: 198,
    damage: scaleBossDamage(enemy, 27),
    push: 46,
    slow: 4,
    slowMultiplier: 0.42,
    life: 3.1,
    maxLife: 3.1,
    color: "#ff8fab",
    hostile: true,
    consumeOnHit: true,
    applied: false,
    kind: "giantGumBubble",
  });
  addParticles(enemy.x + Math.cos(angle) * 54, enemy.y + Math.sin(angle) * 54, "#ff8fab", 18);
}

function createDanceKick(enemy) {
  const angle = angleTo(enemy, player);
  addSpeechBubble(enemy, "?뚰궧 ?뚰궧", 1.0);
  damageZones.push({
    x: enemy.x,
    y: enemy.y,
    angle,
    arc: 1.25,
    radius: 120,
    damage: scaleBossDamage(enemy, 21),
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
  addSpeechBubble(enemy, "?섏씠???ㅽ꺃??", 1.15);
  damageZones.push({
    x: player.x,
    y: player.y,
    radius: 118,
    damage: scaleBossDamage(enemy, 26),
    push: 54,
    life: 0.86,
    maxLife: 0.86,
    color: "#c77dff",
    hostile: true,
    armedAt: 0.34,
    applied: false,
    kind: "danceStamp",
  });
}

function dropFakeLuggage(enemy) {
  const count = enemy.boss ? 8 : 3;
  if (enemy.boss) addSpeechBubble(enemy, "?섑븯臾?梨숆꺼!", 1.05);
  for (let i = 0; i < count; i += 1) {
    const angle = (TAU * i) / count + Math.random() * 0.4;
    damageZones.push({
      x: enemy.x + Math.cos(angle) * rand(40, 115),
      y: enemy.y + Math.sin(angle) * rand(40, 115),
      radius: enemy.boss ? 42 : 30,
      damage: enemy.boss ? scaleBossDamage(enemy, 14) : 8,
      life: 2.3,
      maxLife: 2.3,
      color: "#74c0fc",
      hostile: true,
      trap: true,
      applied: false,
    });
  }
}

function applyPlayerAttack(amount) {
  return amount * ((player.attackPower || 100) / 100);
}

function calculateIncomingDamage(amount) {
  const effectiveDefense = Math.max(20, (player.defensePower || 100) * (1 - player.defenseBreakPower));
  const afterDefense = amount * (100 / effectiveDefense);
  const afterPassive = afterDefense * (1 - clamp(player.damageReduction, 0, 0.6));
  return Math.max(1, Math.round(afterPassive));
}

function getRegenHealAmount() {
  const regenRatio = BASE_REGEN_RATIO + player.regenLevel * REGEN_UPGRADE_RATIO;
  return Math.max(1, Math.round(player.maxHp * regenRatio * (player.healMultiplier || 1)));
}

function increaseLevelStats() {
  const previousMaxHp = player.maxHp;
  player.attackPower *= 1.07;
  player.defensePower *= 1.07;
  player.speed *= 1.015;
  player.maxHp = Math.min(MAX_PLAYER_HP_LIMIT, player.maxHp * 1.04);
  player.hp = Math.min(player.maxHp, player.hp + player.maxHp - previousMaxHp);
}

function hurtPlayer(amount) {
  if (isChickenBuffActive()) {
    addPopup("臾댁쟻", player.x, player.y - 44, "#ffd166", 0.45, 15);
    return;
  }
  if ((player.dodgeChance ?? 0) > 0 && Math.random() < player.dodgeChance) {
    player.invuln = Math.max(player.invuln, 0.22);
    addPopup("?뚰뵾", player.x, player.y - 44, "#9fd3ff", 0.55, 16);
    playSound("ui");
    return;
  }
  const reducedAmount = calculateIncomingDamage(amount);
  player.hp = Math.max(0, player.hp - reducedAmount);
  player.invuln = 0.45;
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
    if (bullet.x < 0 || bullet.x > WORLD_SIZE || bullet.y < 0 || bullet.y > WORLD_SIZE) {
      bullets.splice(bullets.indexOf(bullet), 1);
      continue;
    }
    for (const enemy of [...enemies]) {
      if (bullet.hitEnemies?.has(enemy)) continue;
      if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.radius + bullet.radius) {
        bullet.hitEnemies?.add(enemy);
        damageEnemy(enemy, bullet.damage);
      }
    }
    if (bullet.life <= 0) bullets.splice(bullets.indexOf(bullet), 1);
  }

  for (const taser of [...taserShots]) {
    taser.life -= delta;
    taser.trail.push({ x: taser.x, y: taser.y, life: 0.18 });
    if (taser.trail.length > 10) taser.trail.shift();
    for (const point of taser.trail) point.life -= delta;
    taser.trail = taser.trail.filter((point) => point.life > 0);

    if (!taser.target || !enemies.includes(taser.target) || !taser.target.boss) {
      taser.target = findNearestBoss(1800);
    }
    if (taser.target) {
      const desired = angleTo(taser, taser.target);
      const current = Math.atan2(taser.vy, taser.vx);
      const next = current + clamp(angleDelta(desired, current), -8.5 * delta, 8.5 * delta);
      const speed = 820;
      taser.vx = Math.cos(next) * speed;
      taser.vy = Math.sin(next) * speed;
    }
    taser.x += taser.vx * delta;
    taser.y += taser.vy * delta;

    const target = taser.target;
    if (target && enemies.includes(target) && Math.hypot(target.x - taser.x, target.y - taser.y) < target.radius + taser.radius) {
      damageEnemy(target, taser.damage, "#fff3b0");
      if (enemies.includes(target)) {
        target.stunTimer = Math.max(target.stunTimer ?? 0, taser.stun);
        target.taserLinkTimer = Math.max(target.taserLinkTimer ?? 0, taser.stun);
        target.taserLinkMax = Math.max(target.taserLinkMax ?? 0, taser.stun);
        target.taserDamageTick = TASER_DOT_TICK;
        target.taserDotDamage = Math.max(1, Math.round(taser.damage * TASER_DOT_DAMAGE_RATIO));
        addPopup("기절 5초", target.x, target.y - target.radius - 36, "#fff3b0", 1.0, 20);
        addParticles(target.x, target.y, "#fff3b0", 46);
        addParticles(target.x, target.y, "#80ffdb", 24);
        playSound("taserHit");
      }
      taserShots.splice(taserShots.indexOf(taser), 1);
      continue;
    }
    if (taser.life <= 0 || taser.x < 0 || taser.x > WORLD_SIZE || taser.y < 0 || taser.y > WORLD_SIZE) {
      taserShots.splice(taserShots.indexOf(taser), 1);
    }
  }

  for (const card of [...cards]) {
    card.trail.push({ x: card.x, y: card.y, life: 0.22 });
    if (card.trail.length > 12) card.trail.shift();
    for (const point of card.trail) point.life -= delta;
    card.trail = card.trail.filter((point) => point.life > 0);
    for (const [enemy, cooldown] of [...card.hitTimers.entries()]) {
      const nextCooldown = cooldown - delta;
      if (nextCooldown <= 0 || !enemies.includes(enemy)) card.hitTimers.delete(enemy);
      else card.hitTimers.set(enemy, nextCooldown);
    }

    card.x += card.vx * delta;
    card.y += card.vy * delta;
    card.rotation += delta * (12 + weapons.card.level * 1.8);
    card.life -= delta;
    const bounds = {
      left: Math.max(24, camera.x + card.radius),
      right: Math.min(WORLD_SIZE - 24, camera.x + viewWidth - card.radius),
      top: Math.max(24, camera.y + card.radius),
      bottom: Math.min(WORLD_SIZE - 24, camera.y + viewHeight - card.radius),
    };
    let bounced = false;
    if (card.x <= bounds.left || card.x >= bounds.right) {
      card.x = clamp(card.x, bounds.left, bounds.right);
      card.vx *= -1;
      bounced = true;
    }
    if (card.y <= bounds.top || card.y >= bounds.bottom) {
      card.y = clamp(card.y, bounds.top, bounds.bottom);
      card.vy *= -1;
      bounced = true;
    }
    if (bounced) {
      card.bounces += 1;
      addParticles(card.x, card.y, "#80ffdb", 10);
      playSound("card");
      if (card.bounces >= card.maxBounces) {
        addParticles(card.x, card.y, "#dffdf5", 16);
        cards.splice(cards.indexOf(card), 1);
        continue;
      }
    }
    for (const enemy of [...enemies]) {
      if (!card.hitTimers.has(enemy) && Math.hypot(enemy.x - card.x, enemy.y - card.y) < enemy.radius + card.radius) {
        card.hitTimers.set(enemy, 0.28);
        damageEnemy(enemy, card.damage, "#80ffdb");
      }
    }
    if (card.life <= 0) {
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
      if (!missile.target || !enemies.includes(missile.target) || !missile.target.boss) missile.target = findCustomerMissileTarget(980);
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

  for (const shell of [...tankShells]) {
    shell.life -= delta;
    shell.trail.push({ x: shell.x, y: shell.y, life: 0.32 });
    if (shell.trail.length > 12) shell.trail.shift();
    for (const point of shell.trail) point.life -= delta;
    shell.trail = shell.trail.filter((point) => point.life > 0);

    if (!shell.target || !enemies.includes(shell.target)) {
      shell.target = findPriorityEnemyFrom(shell, 1400);
    }
    if (shell.target) {
      const desired = angleTo(shell, shell.target);
      const current = Math.atan2(shell.vy, shell.vx);
      const next = current + clamp(angleDelta(desired, current), -1.65 * delta, 1.65 * delta);
      const speed = Math.hypot(shell.vx, shell.vy) || 360;
      shell.vx = Math.cos(next) * speed;
      shell.vy = Math.sin(next) * speed;
    }
    shell.x += shell.vx * delta;
    shell.y += shell.vy * delta;

    let exploded = shell.life <= 0 || shell.x < 0 || shell.x > WORLD_SIZE || shell.y < 0 || shell.y > WORLD_SIZE;
    for (const enemy of [...enemies]) {
      if (Math.hypot(enemy.x - shell.x, enemy.y - shell.y) < enemy.radius + shell.radius) {
        exploded = true;
        break;
      }
    }
    if (!exploded) continue;

    addParticles(shell.x, shell.y, "#ff2d2d", 44);
    addParticles(shell.x, shell.y, "#ff7a1a", 30);
    damageZones.push({
      x: shell.x,
      y: shell.y,
      radius: shell.blastRadius,
      damage: 0,
      life: 1.5,
      maxLife: 1.5,
      color: "#ff2d2d",
      hits: new Set(),
      kind: "tankBlast",
    });
    for (const enemy of [...enemies]) {
      const d = Math.hypot(enemy.x - shell.x, enemy.y - shell.y);
      if (d > shell.blastRadius + enemy.radius) continue;
      const falloff = clamp(1 - d / Math.max(1, shell.blastRadius + enemy.radius), 0.55, 1);
      damageEnemy(enemy, Math.round(shell.damage * falloff), "#ff4d4d");
      if (enemies.includes(enemy)) {
        enemy.stunTimer = Math.max(enemy.stunTimer ?? 0, enemy.boss ? TANK_CANNON_BOSS_STUN : TANK_CANNON_MONSTER_STUN);
      }
    }
    playSound("explosion");
    tankShells.splice(tankShells.indexOf(shell), 1);
  }

  updateBlade(delta);
}

function updateBlade(delta = 0) {
  if (weapons.strapOrbit.level > 0) {
    const strapCount = getStrapCount();
    const strapRadius = getStrapOrbitRadius();
    const strapHandleRadius = getStrapHandleRadius();
    const strapDamage = Math.round((14 + (weapons.strapOrbit.level - 1) * 8) * 1.5 * 2 * (player.meleeDamageMultiplier || 1));
    for (let i = 0; i < strapCount; i += 1) {
      const strapAngle = weapons.strapOrbit.angle + (TAU * i) / strapCount;
      const strap = {
        x: player.x + Math.cos(strapAngle) * strapRadius,
        y: player.y + Math.sin(strapAngle) * strapRadius,
        radius: strapHandleRadius,
      };
      for (const enemy of [...enemies]) {
        if (Math.hypot(enemy.x - strap.x, enemy.y - strap.y) < enemy.radius + strap.radius) {
          if (!enemy.lastStrapHit || performance.now() - enemy.lastStrapHit > 170) {
            enemy.lastStrapHit = performance.now();
            damageEnemy(enemy, strapDamage, "#ffd6a5");
            playSound("strap");
          }
        }
      }
    }
  }

  if (weapons.tearGas.level > 0) {
    weapons.tearGas.pulse += delta * (1.5 + weapons.tearGas.level * 0.18);
    const gasRadius = getTearGasRadius();
    const gasDamage = getTearGasDamage();
    const now = performance.now();
    let gasHit = false;
    for (const enemy of [...enemies]) {
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) > gasRadius + enemy.radius) continue;
      if (enemy.lastTearGasHit && now - enemy.lastTearGasHit <= 360) continue;
      enemy.lastTearGasHit = now;
      damageEnemy(enemy, gasDamage, "#b7ef64");
      gasHit = true;
    }
    if (gasHit) {
      playSound("gas");
    }
  }
}

function damageEnemy(enemy, amount, color = "#fff2a8") {
  const guarded = enemy.defenseBoostTimer > 0 ? enemy.defenseBoostPower ?? 0 : 0;
  const finalAmount = Math.max(1, Math.round(applyPlayerAttack(amount) * (1 - guarded)));
  enemy.hp -= finalAmount;
  enemy.hitFlash = 0.08;
  playSound("hit");
  addParticles(enemy.x, enemy.y, guarded > 0 ? "#ffe066" : color, enemy.boss ? 14 : 7);
  addPopup(`-${finalAmount}`, enemy.x, enemy.y - enemy.radius, color, 0.48, enemy.boss ? 17 : 13);
  if (guarded > 0 && Math.random() < 0.35) addPopup("諛⑹뼱", enemy.x, enemy.y - enemy.radius, "#fff3b0", 0.45, 12);
  if (enemy.hp <= 0) killEnemy(enemy);
}

function getChickenChargeDamage() {
  const expressLevel = Math.max(1, weapons.expressTrain.level || 1);
  const expressDamage = (105 + expressLevel * 42) * 3;
  return Math.max(1, Math.round(expressDamage * 0.5));
}

function isStimpackActive() {
  return player.stimTimer > 0;
}

function getStimCooldownDelta(delta) {
  return isStimpackActive() ? delta * STIMPACK_ATTACK_SPEED_MULTIPLIER : delta;
}

function applyStimpackDrain() {
  const amount = Math.max(1, Math.round(player.maxHp * STIMPACK_DRAIN_RATIO));
  player.hp = Math.max(0, player.hp - amount);
  addPopup(`-${amount}`, player.x, player.y - 52, "#ff6b6b", 0.55, 14);
  addParticles(player.x, player.y, "#ff6b6b", 8);
  if (player.hp <= 0) endGame(false);
  updateHud();
}

function killEnemy(enemy) {
  const index = enemies.indexOf(enemy);
  if (index >= 0) enemies.splice(index, 1);
  player.kills += 1;
  const earnedScore = Math.max(1, Math.round((enemy.score ?? 0) / 10));
  player.score += earnedScore;
  dropXp(enemy.x, enemy.y, enemy.xp);
  if (enemy.boss) {
    addPopup("보스퇴치 완료", player.x, player.y - 148, "#ffe066", 2.65, 56);
    playSound("bossKill");
    speakSystemVoice("보스 퇴치 완료", 1600);
    dropBossRewardItems(enemy);
    nextBossAt = player.elapsed + Math.max(34, 46 - Math.min(12, bossIndex * 2));
    bossWarningFor = 0;
    updateBgm();
  } else {
    playSound("kill");
  }
  updateHud();
}

function grantFirstAidKit(count = 1, x = player.x, y = player.y) {
  player.firstAidKits += count;
  addPopup(`援ш툒??+${count}`, x, y - 24, "#b8ffe4", 0.9, 16);
  playSound("heal");
  updateHud();
}

function grantPoliceCall(count = 1, x = player.x, y = player.y) {
  player.policeCalls += count;
  addPopup(`${getPoliceItemName()} +${count}`, x, y - 48, "#b8dcff", 0.9, 16);
  playSound("levelUp");
  updateHud();
}

function grantTaserGun(count = 1, x = player.x, y = player.y) {
  player.taserGuns += count;
  addPopup(`?뚯씠?嫄?+${count}`, x, y - 66, "#fff3b0", 0.9, 16);
  playSound("levelUp");
  updateHud();
}

function grantChickenBreast(count = 1, x = player.x, y = player.y) {
  player.chickenBreasts += count;
  addPopup(`${getChickenItemName()} +${count}`, x, y - 84, "#ffd166", 0.9, 16);
  playSound("levelUp");
  updateHud();
}

function grantStimPack(count = 1, x = player.x, y = player.y) {
  player.stimPacks += count;
  addPopup(`?ㅽ???+${count}`, x, y - 102, "#ff8a80", 0.9, 16);
  playSound("levelUp");
  updateHud();
}

function dropBossRewardItems(enemy) {
  if (!enemy.boss) return;
  const rewardKinds = ["firstAid", "radio", "taser", "chicken", "stim"];
  for (let i = rewardKinds.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [rewardKinds[i], rewardKinds[j]] = [rewardKinds[j], rewardKinds[i]];
  }
  const selectedRewards = rewardKinds.filter(() => Math.random() < 0.35).slice(0, 2);
  if (selectedRewards.length === 0) selectedRewards.push(rewardKinds[0]);
  for (let i = 0; i < selectedRewards.length; i += 1) {
    dropBossRewardPickup(enemy, selectedRewards[i], i, selectedRewards.length);
  }
}

function dropBossRewardPickup(enemy, kind, index = 0, count = 1) {
  const angle = Math.random() * TAU + (TAU * index) / Math.max(1, count);
  const distance = rand(26, 72);
  energyPickups.push({
    kind,
    x: enemy.x + Math.cos(angle) * distance,
    y: enemy.y + Math.sin(angle) * distance,
    heal: 0,
    radius: (kind === "chicken" || kind === "stim" ? 14 : kind === "taser" ? 13 : kind === "radio" ? 14 : 13) * 1.5,
    boss: true,
    pulse: Math.random() * TAU,
    vx: Math.cos(angle) * rand(28, 78),
    vy: Math.sin(angle) * rand(28, 78),
  });
}

function getPoliceCallAngle() {
  const target = findNearestEnemy(1200);
  if (target) return angleTo(player, target);
  if (Math.abs(input.x) + Math.abs(input.y) > 0.1) return Math.atan2(input.y, input.x);
  return -Math.PI / 2;
}

function usePoliceCall() {
  if (game.state !== "playing" || game.paused || game.pendingHeroChoice || player.policeCalls <= 0) return;
  player.policeCalls -= 1;
  if (isComradeHero()) {
    useComradeDropCall();
    updateHud();
    return;
  }
  if (isRunnerCompanionHero()) {
    usePacemakerMedalCall();
    updateHud();
    return;
  }
  announceSkill("吏?섏쿋 寃쎌같?", { color: "#b8dcff", minGap: 500, source: "item" });
  const officers = [];
  const officerCount = 60;
  for (let i = 0; i < officerCount; i += 1) {
    const angle = (TAU * i) / officerCount + rand(-0.035, 0.035);
    const ring = i % 2;
    officers.push({
      angle,
      startRadius: 42 + ring * 28 + rand(-6, 6),
      speedOffset: rand(-28, 36),
      bob: Math.random() * TAU,
    });
  }
  policeSquads.push({
    x: player.x,
    y: player.y,
    officers,
    distance: 0,
    speed: 110,
    damage: 38.4,
    radius: 28,
    life: 7.2,
    maxLife: 7.2,
    hitTimers: new Map(),
    hitCounts: new Map(),
  });
  addPopup("吏?섏쿋 寃쎌같? 異쒕룞!", player.x, player.y - 72, "#b8dcff", 0.9, 18);
  addParticles(player.x, player.y, "#77beff", 26);
  playSound("police");
  updateHud();
}

function useComradeDropCall() {
  announceSkill("?덈퉬援??덈젴", { color: "#b7ef64", minGap: 500, source: "item" });
  const comrades = [];
  const count = 50;
  for (let i = 0; i < count; i += 1) {
    const angle = (TAU * i) / count + rand(-0.06, 0.06);
    const ring = i % 3;
    const standRadius = 112 + ring * 42 + rand(-10, 14);
    const startRadius = standRadius + rand(180, 270);
    comrades.push({
      angle,
      x: player.x + Math.cos(angle) * startRadius,
      y: player.y + Math.sin(angle) * startRadius,
      standRadius,
      dropHeight: rand(180, 320),
      dropDelay: (i % 10) * 0.045 + Math.floor(i / 10) * 0.035,
      attackCooldown: rand(0.06, 0.38),
      bob: Math.random() * TAU,
      facing: angle + Math.PI,
      landed: false,
    });
  }
  policeSquads.push({
    kind: "comradeDrop",
    x: player.x,
    y: player.y,
    comrades,
    life: 8 + COMRADE_DROP_DESCENT_TIME,
    maxLife: 8 + COMRADE_DROP_DESCENT_TIME,
    activeLife: 8,
    radius: 20,
  });
  addPopup("예비군 집결!", player.x, player.y - 76, "#b7ef64", 0.95, 20);
  addParticles(player.x, player.y, "#b7ef64", 30);
  playSound("police");
}

function usePacemakerMedalCall() {
  announceSkill("마라톤 참가권", { color: "#7fc8ff", minGap: 500, source: "item" });
  const officers = [];
  const count = 50;
  for (let i = 0; i < count; i += 1) {
    const angle = (TAU * i) / count + rand(-0.045, 0.045);
    const ring = i % 2;
    officers.push({
      angle,
      startRadius: 46 + ring * 30 + rand(-6, 6),
      speedOffset: rand(-22, 30),
      bob: Math.random() * TAU,
      scale: rand(0.94, 1.08),
    });
  }
  policeSquads.push({
    visual: "pacemaker",
    x: player.x,
    y: player.y,
    officers,
    distance: 0,
    speed: 128,
    radius: 24,
    damage: getStationPoliceDamage() * 1.2,
    maxHitsPerEnemy: 3,
    life: 5.2,
    maxLife: 5.2,
    hitTimers: new Map(),
    hitCounts: new Map(),
  });
  addPopup("留덈씪??李멸?沅?", player.x, player.y - 76, "#7fc8ff", 0.95, 20);
  addParticles(player.x, player.y, "#7fc8ff", 30);
  playSound("police");
}

function findNearestBoss(maxDistance = Infinity) {
  let nearest = null;
  let nearestDistance = maxDistance;
  for (const enemy of enemies) {
    if (!enemy.boss) continue;
    const currentDistance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    if (currentDistance < nearestDistance) {
      nearest = enemy;
      nearestDistance = currentDistance;
    }
  }
  return nearest;
}

function useTaserGun() {
  if (game.state !== "playing" || game.paused || game.pendingHeroChoice || player.taserGuns <= 0) return;
  const target = findNearestBoss(1800);
  if (!target) {
    addPopup("보스 없음", player.x, player.y - 58, "#fff3b0", 0.55, 14);
    return;
  }
  player.taserGuns -= 1;
  announceSkill("테이저건", { color: "#fff3b0", minGap: 500, source: "item" });
  const angle = angleTo(player, target);
  taserShots.push({
    x: player.x + Math.cos(angle) * 26,
    y: player.y + Math.sin(angle) * 26,
    originX: player.x + Math.cos(angle) * 18,
    originY: player.y + Math.sin(angle) * 18,
    vx: Math.cos(angle) * 820,
    vy: Math.sin(angle) * 820,
    radius: 12,
    damage: 286,
    stun: 5,
    life: 1.8,
    maxLife: 1.8,
    seed: Math.random() * 1000,
    target,
    trail: [],
  });
  addPopup("?뚯씠?嫄?", player.x, player.y - 62, "#fff3b0", 0.65, 15);
  playSound("taser");
  updateHud();
}

function getPoliceOfficerPosition(squad, officer) {
  const progress = 1 - squad.life / squad.maxLife;
  const stagger = Math.sin(officer.bob + progress * TAU * 2.2) * 8;
  const distance = officer.startRadius + squad.distance + progress * (officer.speedOffset ?? 0) + stagger;
  return {
    x: squad.x + Math.cos(officer.angle) * distance,
    y: squad.y + Math.sin(officer.angle) * distance,
    angle: officer.angle,
  };
}

function getPacemakerRunnerPosition(squad, runner) {
  const pass = squad.passIndex ?? 0;
  const rawProgress = (squad.passElapsed - runner.delay) / squad.passDuration;
  const progress = clamp(rawProgress, 0, 1);
  const eased = progress * progress * (3 - 2 * progress);
  const wobble = Math.sin(runner.bob + player.elapsed * 8) * 5;
  const x =
    pass === 0
      ? squad.leftX + (squad.rightX - squad.leftX) * (eased + runner.speedWobble)
      : squad.rightX - (squad.rightX - squad.leftX) * (eased + runner.speedWobble);
  return {
    x,
    y: runner.y + wobble,
    angle: pass === 0 ? 0 : Math.PI,
    active: rawProgress > 0 && rawProgress < 1,
    progress,
    rawProgress,
  };
}

function updatePacemakerMedalSquad(squad, delta) {
  const currentTimers = squad.hitTimers[squad.passIndex] ?? squad.hitTimers[0];
  for (const [enemy, cooldown] of [...currentTimers.entries()]) {
    const nextCooldown = cooldown - delta;
    if (nextCooldown <= 0 || !enemies.includes(enemy)) currentTimers.delete(enemy);
    else currentTimers.set(enemy, nextCooldown);
  }

  squad.passElapsed += delta;
  const maxDelay = Math.max(...squad.runners.map((runner) => runner.delay), 0);
  if (squad.passElapsed > squad.passDuration + maxDelay) {
    if (squad.passIndex === 0) {
      squad.returnTimer += delta;
      if (squad.returnTimer >= squad.returnDelay) {
        squad.passIndex = 1;
        squad.passElapsed = 0;
        squad.returnTimer = 0;
      }
    } else {
      squad.finished = true;
      return;
    }
  }

  const hitCounts = squad.hitCounts[squad.passIndex] ?? squad.hitCounts[0];
  const hitTimers = squad.hitTimers[squad.passIndex] ?? squad.hitTimers[0];
  for (const runnerInfo of squad.runners) {
    const runner = getPacemakerRunnerPosition(squad, runnerInfo);
    if (!runner.active) continue;
    for (const enemy of [...enemies]) {
      if (Math.hypot(enemy.x - runner.x, enemy.y - runner.y) > enemy.radius + squad.radius) continue;
      if ((hitCounts.get(enemy) ?? 0) >= 2) continue;
      if (hitTimers.has(enemy)) continue;
      hitTimers.set(enemy, 0.28);
      hitCounts.set(enemy, (hitCounts.get(enemy) ?? 0) + 1);
      damageEnemy(enemy, squad.damage, "#7fc8ff");
      applyCompanionSplashDamage(enemy.x, enemy.y, squad.damage * 0.28, 52, enemy, "#7fc8ff");
      const pushAmount = enemy.boss ? 12 : 34;
      enemy.x = clamp(enemy.x + Math.cos(runner.angle) * pushAmount, 35, WORLD_SIZE - 35);
      enemy.y = clamp(enemy.y + Math.sin(runner.angle) * pushAmount, 35, WORLD_SIZE - 35);
      addParticles(enemy.x, enemy.y, "#7fc8ff", 7);
    }
  }
}

function officerHitsHostileZone(officer, zone, radius) {
  if (zone.kind === "jarvanSpear" || zone.kind === "dansoStab") {
    const dx = officer.x - zone.x;
    const dy = officer.y - zone.y;
    const forward = Math.cos(zone.angle) * dx + Math.sin(zone.angle) * dy;
    const side = Math.abs(-Math.sin(zone.angle) * dx + Math.cos(zone.angle) * dy);
    return forward > 0 && forward < (zone.length ?? zone.radius) + radius && side < (zone.width ?? 40) / 2 + radius;
  }
  return Math.hypot(officer.x - zone.x, officer.y - zone.y) < radius + (zone.radius ?? 24);
}

function updatePoliceSquads(delta) {
  for (const squad of [...policeSquads]) {
    if (squad.kind === "comradeDrop") {
      updateComradeDropSquad(squad, delta);
      continue;
    }
    if (squad.kind === "pacemakerWave") {
      updatePacemakerMedalSquad(squad, delta);
      if (squad.finished) policeSquads.splice(policeSquads.indexOf(squad), 1);
      continue;
    }
    squad.life -= delta;
    squad.distance += squad.speed * delta;
    for (const [enemy, cooldown] of [...squad.hitTimers.entries()]) {
      const nextCooldown = cooldown - delta;
      if (nextCooldown <= 0 || !enemies.includes(enemy)) squad.hitTimers.delete(enemy);
      else squad.hitTimers.set(enemy, nextCooldown);
    }

    for (const officerInfo of squad.officers) {
      const officer = getPoliceOfficerPosition(squad, officerInfo);
      for (const zone of [...damageZones]) {
        if (!zone.hostile) continue;
        if (officerHitsHostileZone(officer, zone, squad.radius + 8)) {
          addParticles(officer.x, officer.y, "#b8dcff", 10);
          const zoneIndex = damageZones.indexOf(zone);
          if (zoneIndex >= 0) damageZones.splice(zoneIndex, 1);
        }
      }
      for (const enemy of [...enemies]) {
        if (Math.hypot(enemy.x - officer.x, enemy.y - officer.y) > enemy.radius + squad.radius) continue;
        if ((squad.hitCounts.get(enemy) ?? 0) >= (squad.maxHitsPerEnemy ?? 4)) continue;
        if (squad.hitTimers.has(enemy)) continue;
        squad.hitTimers.set(enemy, 0.22);
        squad.hitCounts.set(enemy, (squad.hitCounts.get(enemy) ?? 0) + 1);
        damageEnemy(enemy, squad.damage, "#b8dcff");
        const push = officer.angle;
        const pushAmount = enemy.boss ? 14 : 38;
        enemy.x = clamp(enemy.x + Math.cos(push) * pushAmount, 35, WORLD_SIZE - 35);
        enemy.y = clamp(enemy.y + Math.sin(push) * pushAmount, 35, WORLD_SIZE - 35);
        addParticles(enemy.x, enemy.y, "#b8dcff", 8);
      }
    }
    if (squad.life <= 0 || squad.distance > Math.max(viewWidth, viewHeight) * 0.95) {
      policeSquads.splice(policeSquads.indexOf(squad), 1);
    }
  }
}

function syncStationPolicePets() {
  const wanted = Math.max(0, weapons.subwayPolice.level);
  while (stationPolicePets.length < wanted) {
    const index = stationPolicePets.length;
    const angle = -Math.PI / 2 + (TAU * index) / Math.max(1, wanted || 1);
    stationPolicePets.push({
      x: player.x + Math.cos(angle) * 72,
      y: player.y + Math.sin(angle) * 72,
      slot: index,
      attackCooldown: rand(0.08, 0.36),
      swingTimer: 0,
      target: null,
      bob: Math.random() * TAU,
      facing: angle,
    });
  }
  while (stationPolicePets.length > wanted) stationPolicePets.pop();
  stationPolicePets.forEach((pet, index) => {
    pet.slot = index;
  });
}

function isChickenBuffActive() {
  return player.chickenTimer > 0;
}

function updateStationPolicePets(delta) {
  syncStationPolicePets();
  if (stationPolicePets.length === 0) return;
  if (isComradeHero()) {
    updateComradePets(delta);
    return;
  }
  if (isRunnerCompanionHero()) {
    updateRunnerCompanionPets(delta);
    return;
  }
  const count = stationPolicePets.length;
  for (const pet of stationPolicePets) {
    pet.attackCooldown = Math.max(0, pet.attackCooldown - delta);
    pet.swingTimer = Math.max(0, pet.swingTimer - delta);
    const slotAngle = -Math.PI / 2 + (TAU * pet.slot) / Math.max(1, count);
    const orbit = 62 + Math.min(5, count) * 7;
    const floatAngle = slotAngle + Math.sin(player.elapsed * 1.7 + pet.bob) * 0.12;
    const idleX = player.x + Math.cos(floatAngle) * orbit;
    const idleY = player.y + Math.sin(floatAngle) * orbit;
    const target = findPriorityEnemyFrom(pet, 820);
    pet.target = target;

    let goalX = idleX;
    let goalY = idleY;
    if (target) {
      const baseAngle = angleTo(target, player);
      const ringIndex = Math.floor(pet.slot / 6);
      const ringSlot = pet.slot % Math.min(6, count);
      const ringCount = Math.min(6, count);
      const formationAngle = baseAngle + (TAU * ringSlot) / Math.max(1, ringCount) + ringIndex * 0.18;
      const standOff = target.radius + 46 + ringIndex * 18;
      goalX = target.x + Math.cos(formationAngle) * standOff;
      goalY = target.y + Math.sin(formationAngle) * standOff;
    }

    const dx = goalX - pet.x;
    const dy = goalY - pet.y;
    const distanceToGoal = Math.hypot(dx, dy) || 1;
    const moveSpeed = target ? 375 : 255;
    const step = Math.min(distanceToGoal, moveSpeed * delta);
    pet.x = clamp(pet.x + (dx / distanceToGoal) * step, 25, WORLD_SIZE - 25);
    pet.y = clamp(pet.y + (dy / distanceToGoal) * step, 25, WORLD_SIZE - 25);
    if (distanceToGoal > 1) pet.facing = Math.atan2(dy, dx);

    for (const other of stationPolicePets) {
      if (other === pet) continue;
      const gapX = pet.x - other.x;
      const gapY = pet.y - other.y;
      const gap = Math.hypot(gapX, gapY) || 1;
      const minGap = 42;
      if (gap >= minGap) continue;
      const push = (minGap - gap) * 0.5;
      pet.x = clamp(pet.x + (gapX / gap) * push, 25, WORLD_SIZE - 25);
      pet.y = clamp(pet.y + (gapY / gap) * push, 25, WORLD_SIZE - 25);
    }

    if (!target) continue;
    const attackDistance = Math.hypot(target.x - pet.x, target.y - pet.y);
    if (attackDistance > target.radius + 54 || pet.attackCooldown > 0) continue;
    pet.attackCooldown = 0.58;
    pet.swingTimer = 0.22;
    pet.facing = angleTo(pet, target);
    const damage = getStationPoliceDamage();
    damageEnemy(target, damage, "#b8dcff");
    applyCompanionSplashDamage(target, damage);
    const pushAmount = target.boss ? 7 : 22;
    target.x = clamp(target.x + Math.cos(pet.facing) * pushAmount, 35, WORLD_SIZE - 35);
    target.y = clamp(target.y + Math.sin(pet.facing) * pushAmount, 35, WORLD_SIZE - 35);
    addParticles(target.x, target.y, "#b8dcff", target.boss ? 8 : 5);
    if (Math.random() < 0.42) playSound("police");
  }
}

function updateComradeDropSquad(squad, delta) {
  squad.life -= delta;
  const elapsed = squad.maxLife - squad.life;
  const activeElapsed = Math.max(0, elapsed - COMRADE_DROP_DESCENT_TIME);
  squad.x = player.x;
  squad.y = player.y;
  for (const comrade of squad.comrades) {
    const dropProgress = clamp((elapsed - comrade.dropDelay) / COMRADE_DROP_DESCENT_TIME, 0, 1);
    comrade.dropHeight = Math.max(0, comrade.dropHeight * (1 - delta * 3.2));
    const orbitPulse = Math.sin(player.elapsed * 1.2 + comrade.bob) * 7;
    const targetX = player.x + Math.cos(comrade.angle) * (comrade.standRadius + orbitPulse);
    const targetY = player.y + Math.sin(comrade.angle) * (comrade.standRadius + orbitPulse);
    if (dropProgress < 1) {
      const startX = player.x + Math.cos(comrade.angle) * (comrade.standRadius + 210);
      const startY = player.y + Math.sin(comrade.angle) * (comrade.standRadius + 210);
      const ease = dropProgress * dropProgress * (3 - 2 * dropProgress);
      comrade.x = startX + (targetX - startX) * ease;
      comrade.y = startY + (targetY - startY) * ease;
      comrade.landed = false;
      continue;
    }

    comrade.landed = true;
    const dx = targetX - comrade.x;
    const dy = targetY - comrade.y;
    const distance = Math.hypot(dx, dy) || 1;
    const step = Math.min(distance, 220 * delta);
    comrade.x = clamp(comrade.x + (dx / distance) * step, 25, WORLD_SIZE - 25);
    comrade.y = clamp(comrade.y + (dy / distance) * step, 25, WORLD_SIZE - 25);

    const target = findPriorityEnemyFrom(comrade, 760);
    if (target) comrade.facing = angleTo(comrade, target);
    else comrade.facing = comrade.angle + Math.PI;
    if (!target || activeElapsed > squad.activeLife) continue;
    comrade.attackCooldown -= delta;
    if (comrade.attackCooldown > 0) continue;
    fireBulletVolley(comrade, target, 1, {
      damage: player.damage * (player.bulletDamageMultiplier || 1),
      speed: player.bulletSpeed,
      radius: 8,
      color: "#ffd166",
      style: "military",
    });
    comrade.attackCooldown = getBasicBulletFireRate();
  }
  if (squad.life <= 0) {
    policeSquads.splice(policeSquads.indexOf(squad), 1);
  }
}

function applyCompanionSplashDamage(target, damage, color = "#8ecae6") {
  const splashDamage = Math.max(1, Math.round(damage * SUBWAY_POLICE_SPLASH_DAMAGE_RATIO));
  for (const enemy of [...enemies]) {
    if (enemy === target) continue;
    if (Math.hypot(enemy.x - target.x, enemy.y - target.y) > enemy.radius + SUBWAY_POLICE_SPLASH_RADIUS) continue;
    damageEnemy(enemy, splashDamage, color);
    if (enemies.includes(enemy)) {
      const splashPush = angleTo(target, enemy);
      const splashPushAmount = enemy.boss ? 3 : 9;
      enemy.x = clamp(enemy.x + Math.cos(splashPush) * splashPushAmount, 35, WORLD_SIZE - 35);
      enemy.y = clamp(enemy.y + Math.sin(splashPush) * splashPushAmount, 35, WORLD_SIZE - 35);
    }
  }
}

function updateComradePets(delta) {
  const count = stationPolicePets.length;
  const cooldownDelta = getStimCooldownDelta(delta);
  for (const pet of stationPolicePets) {
    pet.attackCooldown = Math.max(0, pet.attackCooldown - cooldownDelta);
    pet.swingTimer = Math.max(0, pet.swingTimer - delta);
    const side = pet.slot % 2 === 0 ? -1 : 1;
    const row = Math.floor(pet.slot / 2);
    const followAngle = Math.atan2(input.y || 0, input.x || 0);
    const hasMove = Math.hypot(input.x || 0, input.y || 0) > 0.1;
    const baseAngle = hasMove ? followAngle + Math.PI / 2 : -Math.PI / 2;
    const spacing = 34 + Math.min(4, count) * 2;
    const backOffset = 20 + row * 26;
    const idleX = player.x + Math.cos(baseAngle) * side * spacing - Math.cos(baseAngle - Math.PI / 2) * backOffset;
    const idleY = player.y + Math.sin(baseAngle) * side * spacing - Math.sin(baseAngle - Math.PI / 2) * backOffset;

    const dx = idleX - pet.x;
    const dy = idleY - pet.y;
    const distanceToGoal = Math.hypot(dx, dy) || 1;
    const step = Math.min(distanceToGoal, 380 * delta);
    pet.x = clamp(pet.x + (dx / distanceToGoal) * step, 25, WORLD_SIZE - 25);
    pet.y = clamp(pet.y + (dy / distanceToGoal) * step, 25, WORLD_SIZE - 25);

    const target = findPriorityEnemyFrom(pet, 760);
    pet.target = target;
    if (target) pet.facing = angleTo(pet, target);
    else if (distanceToGoal > 1) pet.facing = Math.atan2(dy, dx);

    if (!target || pet.attackCooldown > 0) continue;
    fireBulletVolley(pet, target, 1, {
      damage: player.damage * (player.bulletDamageMultiplier || 1),
      speed: player.bulletSpeed,
      radius: 8,
      color: "#ffd166",
      style: getBasicBulletStyle(),
    });
    pet.attackCooldown = getBasicBulletFireRate();
    pet.swingTimer = 0.16;
    if (Math.random() < 0.35) playSound("shot");
  }
}

function updateRunnerCompanionPets(delta) {
  const count = stationPolicePets.length;
  for (const pet of stationPolicePets) {
    pet.attackCooldown = Math.max(0, pet.attackCooldown - delta);
    pet.swingTimer = Math.max(0, pet.swingTimer - delta);
    const slotAngle = -Math.PI / 2 + (TAU * pet.slot) / Math.max(1, count);
    const orbit = 52 + Math.min(5, count) * 6;
    const idleX = player.x + Math.cos(slotAngle) * orbit;
    const idleY = player.y + Math.sin(slotAngle) * orbit;
    const target = findPriorityEnemyFrom(pet, 860);
    pet.target = target;

    let goalX = idleX;
    let goalY = idleY;
    if (target) {
      const chargeAngle = angleTo(pet, target);
      goalX = target.x - Math.cos(chargeAngle) * (target.radius + 12);
      goalY = target.y - Math.sin(chargeAngle) * (target.radius + 12);
      pet.facing = chargeAngle;
    }

    const dx = goalX - pet.x;
    const dy = goalY - pet.y;
    const distanceToGoal = Math.hypot(dx, dy) || 1;
    const moveSpeed = target ? 515 : 340;
    const step = Math.min(distanceToGoal, moveSpeed * delta);
    pet.x = clamp(pet.x + (dx / distanceToGoal) * step, 25, WORLD_SIZE - 25);
    pet.y = clamp(pet.y + (dy / distanceToGoal) * step, 25, WORLD_SIZE - 25);
    if (!target && distanceToGoal > 1) pet.facing = Math.atan2(dy, dx);

    for (const other of stationPolicePets) {
      if (other === pet) continue;
      const gapX = pet.x - other.x;
      const gapY = pet.y - other.y;
      const gap = Math.hypot(gapX, gapY) || 1;
      const minGap = 34;
      if (gap >= minGap) continue;
      const push = (minGap - gap) * 0.5;
      pet.x = clamp(pet.x + (gapX / gap) * push, 25, WORLD_SIZE - 25);
      pet.y = clamp(pet.y + (gapY / gap) * push, 25, WORLD_SIZE - 25);
    }

    if (!target || pet.attackCooldown > 0) continue;
    if (Math.hypot(target.x - pet.x, target.y - pet.y) > target.radius + 24) continue;
    pet.attackCooldown = 0.58;
    pet.swingTimer = 0.24;
    pet.facing = angleTo(pet, target);
    const damage = getStationPoliceDamage();
    damageEnemy(target, damage, "#9fd3ff");
    applyCompanionSplashDamage(target, damage, "#6ecbff");
    const pushAmount = target.boss ? 9 : 28;
    target.x = clamp(target.x + Math.cos(pet.facing) * pushAmount, 35, WORLD_SIZE - 35);
    target.y = clamp(target.y + Math.sin(pet.facing) * pushAmount, 35, WORLD_SIZE - 35);
    addParticles(target.x, target.y, "#9fd3ff", target.boss ? 10 : 7);
    if (Math.random() < 0.38) playSound("hit");
  }
}

function dropEnergy(enemy) {
  if (!enemy.boss) return;

  const count = 1;
  const heal = Math.round(player.maxHp * 0.2);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * TAU;
    const distance = rand(12, 54);
    energyPickups.push({
      x: enemy.x + Math.cos(angle) * distance,
      y: enemy.y + Math.sin(angle) * distance,
      heal: count > 1 ? Math.round(heal / count) : heal,
      radius: 13,
      boss: enemy.boss,
      pulse: Math.random() * TAU,
      vx: Math.cos(angle) * rand(22, 68),
      vy: Math.sin(angle) * rand(22, 68),
    });
  }
}

function dropPoliceRadio(enemy) {
  if (!enemy.boss) return;
  const angle = Math.random() * TAU;
  const distance = rand(28, 72);
  energyPickups.push({
    kind: "radio",
    x: enemy.x + Math.cos(angle) * distance,
    y: enemy.y + Math.sin(angle) * distance,
    heal: 0,
    radius: 14,
    boss: true,
    pulse: Math.random() * TAU,
    vx: Math.cos(angle) * rand(28, 78),
    vy: Math.sin(angle) * rand(28, 78),
  });
}

function dropXp(x, y, amount) {
  const angle = Math.random() * TAU;
  orbs.push({
    x: x + Math.cos(angle) * rand(6, 24),
    y: y + Math.sin(angle) * rand(6, 24),
    value: amount,
    radius: amount > 25 ? 4.2 : 3.2,
    vx: Math.cos(angle) * rand(25, 70),
    vy: Math.sin(angle) * rand(25, 70),
    life: XP_ORB_LIFETIME,
    maxLife: XP_ORB_LIFETIME,
  });
}

function updateOrbs(delta) {
  for (const orb of [...orbs]) {
    const d = Math.hypot(player.x - orb.x, player.y - orb.y);
    if (d >= player.magnet) {
      orb.life -= delta;
      if (orb.life <= 0) {
        orbs.splice(orbs.indexOf(orb), 1);
        continue;
      }
    }
    if (d < player.magnet) {
      const angle = angleTo(orb, player);
      const pull = 1040 + (1 - d / player.magnet) * 2640;
      orb.vx += Math.cos(angle) * pull * delta;
      orb.vy += Math.sin(angle) * pull * delta;
      orb.life = Math.max(orb.life, XP_ORB_FADE_TIME);
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
      if (pickup.kind === "radio") {
        grantPoliceCall(1, pickup.x, pickup.y);
        addPopup("무전기", pickup.x, pickup.y - 18, "#b8dcff", 0.8, 14);
        addParticles(pickup.x, pickup.y, "#77beff", 18);
      } else if (pickup.kind === "taser") {
        grantTaserGun(1, pickup.x, pickup.y);
        addPopup("테이저건", pickup.x, pickup.y - 18, "#fff3b0", 0.8, 14);
        addParticles(pickup.x, pickup.y, "#fff3b0", 20);
      } else if (pickup.kind === "chicken") {
        grantChickenBreast(1, pickup.x, pickup.y);
        addPopup(getChickenItemName(), pickup.x, pickup.y - 18, "#ffd166", 0.8, 14);
        addParticles(pickup.x, pickup.y, "#ffd166", 22);
      } else if (pickup.kind === "stim") {
        grantStimPack(1, pickup.x, pickup.y);
        addPopup("스팀팩", pickup.x, pickup.y - 18, "#ff8a80", 0.8, 14);
        addParticles(pickup.x, pickup.y, "#ff6b6b", 22);
      } else if (pickup.kind === "firstAid") {
        grantFirstAidKit(1, pickup.x, pickup.y);
        addPopup("구급팩", pickup.x, pickup.y - 18, "#b8ffe4", 0.8, 14);
        addParticles(pickup.x, pickup.y, "#36d399", 18);
      } else {
        healPlayer(Math.round(pickup.heal));
        playSound("heal");
        addParticles(pickup.x, pickup.y, "#36d399", pickup.boss ? 18 : 10);
      }
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
  announceSkill("역무원 구급팩", { color: "#b8ffe4", minGap: 500, source: "item" });
  addPopup("구급팩 사용", player.x, player.y - 56, "#b8ffe4", 0.75, 15);
  playSound("heal");
  updateHud();
}

function useChickenBreast() {
  if (game.state !== "playing" || game.paused || game.pendingHeroChoice || player.chickenBreasts <= 0) return;
  const itemName = getChickenItemName();
  player.chickenBreasts -= 1;
  player.chickenTimer = CHICKEN_BUFF_DURATION;
  if (isTankRadioHero()) player.tankCannonCooldown = 0.15;
  player.invuln = Math.max(player.invuln, 0.35);
  announceSkill(itemName, { color: "#ffd166", minGap: 500, source: "item" });
  addPopup(`${itemName}!`, player.x, player.y - 78, "#ffd166", 0.9, 20);
  addParticles(player.x, player.y, "#ffd166", 34);
  addParticles(player.x, player.y, "#b7ef64", 24);
  playSound("levelUp");
  updateHud();
}

function useStimPack() {
  if (game.state !== "playing" || game.paused || game.pendingHeroChoice || player.stimPacks <= 0 || player.stimTimer > 0) return;
  player.stimPacks -= 1;
  player.stimTimer = STIMPACK_DURATION;
  player.stimDrainTimer = STIMPACK_DRAIN_TICK;
  announceSkill("스팀팩", { color: "#ff8a80", minGap: 500, source: "item" });
  addPopup("스팀팩", player.x, player.y - 92, "#ff8a80", 0.9, 20);
  addParticles(player.x, player.y, "#ff6b6b", 34);
  playSound("levelUp");
  updateHud();
}

function getNextXpRequirement(previousRequirement, level) {
  const growth = 1.22 + Math.min(0.24, level * 0.014);
  const levelBonus = 34 + level * 5;
  const earlyLevelMultiplier = level <= 10 ? 1.2 : 1;
  return Math.max(12, Math.round((previousRequirement * growth + levelBonus) * player.xpNeedMultiplier * earlyLevelMultiplier));
}

function gainXp(amount) {
  player.xp += amount;
  while (player.xp >= player.nextXp) {
    player.xp -= player.nextXp;
    player.level += 1;
    increaseLevelStats();
    player.nextXp = getNextXpRequirement(player.nextXp, player.level);
    playSound("levelUp");
    if (refs.upgradePanel.classList.contains("hidden")) {
      openUpgradePanel();
    } else {
      game.pendingLevelChoices += 1;
    }
  }
  updateHud();
}

function openUpgradePanel() {
  const starterPicking = game.pendingStarterChoices > 0;
  game.manualPaused = !starterPicking;
  game.paused = true;
  if (refs.upgradeTitle) {
    refs.upgradeTitle.textContent =
      game.pendingStarterChoices > 0 ? `기본 스킬 선택 ${4 - game.pendingStarterChoices}/3` : "스킬 선택";
  }
  updateUpgradePauseButton();
  const starterPool = upgradePool.filter((choice) => choice && weaponUpgradeIds.has(choice.id));
  const choicePool = game.pendingStarterChoices > 0 ? starterPool : upgradePool;
  const choices = pickUpgradeChoices(choicePool, 3, game.pendingStarterChoices <= 0).sort((a, b) => {
    const aRank = weaponUpgradeIds.has(a.id) ? 0 : passiveUpgradeIds.has(a.id) ? 1 : 2;
    const bRank = weaponUpgradeIds.has(b.id) ? 0 : passiveUpgradeIds.has(b.id) ? 1 : 2;
    return aRank - bRank;
  });
  refs.upgradeChoices.innerHTML = "";
  for (const choice of choices) {
    const button = document.createElement("button");
    const upgradeType = weaponUpgradeIds.has(choice.id) ? "attack" : passiveUpgradeIds.has(choice.id) ? "passive" : "basic";
    const display = getUpgradeDisplay(choice);
    button.className = `upgrade-card ${upgradeType}`;
    button.type = "button";
    button.innerHTML = `<strong>${display.name}</strong><span>${display.desc}</span>`;
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
      if (game.pendingLevelChoices > 0) {
        game.pendingLevelChoices -= 1;
        updateHud();
        openUpgradePanel();
        return;
      }
      refs.upgradePanel.classList.add("hidden");
      if (refs.upgradeTitle) refs.upgradeTitle.textContent = "레벨 업";
      game.manualPaused = false;
      game.paused = game.manualPaused;
      updateUpgradePauseButton();
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
    if (zone.hitTimers) {
      for (const [enemy, cooldown] of [...zone.hitTimers.entries()]) {
        const nextCooldown = cooldown - delta;
        if (nextCooldown <= 0 || !enemies.includes(enemy)) zone.hitTimers.delete(enemy);
        else zone.hitTimers.set(enemy, nextCooldown);
      }
    }
    if (zone.kind === "dansoBoomerang" && zone.startX !== undefined) {
      const returnAt = zone.returnAt ?? 0.56;
      const owner = zone.owner ?? zone;
      const startX = zone.startX;
      const startY = zone.startY;
      const targetX = zone.targetX ?? zone.x;
      const targetY = zone.targetY ?? zone.y;
      const outboundAngle = Math.atan2(targetY - startY, targetX - startX);
      const sideAngle = outboundAngle + Math.PI / 2;
      const offset = zone.curveOffset ?? 240;
      const previousX = zone.x;
      const previousY = zone.y;
      let nextX;
      let nextY;
      if (progress < returnAt) {
        const t = clamp(progress / returnAt, 0, 1);
        const controlX = (startX + targetX) / 2 + Math.cos(sideAngle) * offset;
        const controlY = (startY + targetY) / 2 + Math.sin(sideAngle) * offset;
        nextX = (1 - t) ** 2 * startX + 2 * (1 - t) * t * controlX + t ** 2 * targetX;
        nextY = (1 - t) ** 2 * startY + 2 * (1 - t) * t * controlY + t ** 2 * targetY;
      } else {
        const t = clamp((progress - returnAt) / (1 - returnAt), 0, 1);
        const endX = owner.x ?? targetX;
        const endY = owner.y ?? targetY;
        const returnAngle = Math.atan2(endY - targetY, endX - targetX);
        const returnSide = returnAngle - Math.PI / 2;
        const controlX = (targetX + endX) / 2 + Math.cos(returnSide) * offset * 0.62;
        const controlY = (targetY + endY) / 2 + Math.sin(returnSide) * offset * 0.62;
        nextX = (1 - t) ** 2 * targetX + 2 * (1 - t) * t * controlX + t ** 2 * endX;
        nextY = (1 - t) ** 2 * targetY + 2 * (1 - t) * t * controlY + t ** 2 * endY;
      }
      zone.x = nextX;
      zone.y = nextY;
      zone.angle = Math.atan2(nextY - previousY, nextX - previousX);
      zone.trail = zone.trail ?? [];
      zone.trail.push({ x: nextX, y: nextY, life: 0.24 });
      if (zone.trail.length > 12) zone.trail.shift();
      for (const point of zone.trail) point.life -= delta;
      zone.trail = zone.trail.filter((point) => point.life > 0);
    }
    if (zone.vx || zone.vy) {
      if (zone.kind === "dansoBoomerang") {
        const turnProgress = 1 - zone.life / zone.maxLife;
        if (turnProgress >= (zone.returnAt ?? 0.5)) {
          const owner = zone.owner ?? zone;
          const returnAngle = angleTo(zone, owner);
          const returnSpeed = 500;
          zone.vx = Math.cos(returnAngle) * returnSpeed;
          zone.vy = Math.sin(returnAngle) * returnSpeed;
          zone.angle = returnAngle + Math.PI;
        }
      }
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
      } else if (zone.kind === "jarvanSpear" || zone.kind === "dansoStab") {
        const dx = player.x - zone.x;
        const dy = player.y - zone.y;
        const forward = Math.cos(zone.angle) * dx + Math.sin(zone.angle) * dy;
        const side = Math.abs(-Math.sin(zone.angle) * dx + Math.cos(zone.angle) * dy);
        hitPlayer = forward > 0 && forward < zone.length + player.radius && side < zone.width / 2 + player.radius;
      }
      if (active && !zone.applied && hitPlayer) {
        if (isChickenBuffActive()) {
          zone.applied = true;
          addPopup("臾댁쟻", player.x, player.y - 56, "#ffd166", 0.42, 14);
          if (zone.consumeOnHit) zone.life = 0;
          continue;
        }
        hurtPlayer(zone.damage);
        zone.applied = true;
        if (zone.push) {
          const push = zone.kind === "jarvanSpear" || zone.kind === "dansoStab" ? zone.angle : angleTo(zone, player);
          player.x += Math.cos(push) * zone.push;
          player.y += Math.sin(push) * zone.push;
        }
        if (zone.stun) {
          player.stunTimer = Math.max(player.stunTimer, zone.stun);
          addPopup("寃쎌쭅", player.x, player.y - 62, "#fff3b0", 0.55, 15);
        }
        if (zone.slow) {
          player.slowTimer = Math.max(player.slowTimer, zone.slow);
          player.slowMultiplier = Math.min(player.slowMultiplier, zone.slowMultiplier ?? 0.6);
          addPopup("둔화", player.x, player.y - 62, "#ffb3c6", 0.65, 15);
        }
        if (zone.consumeOnHit) zone.life = 0;
      }
      if (zone.trap && zone.applied) zone.life = Math.min(zone.life, 0.25);
    } else if (zone.damage) {
      const armed = zone.armedAt ? progress >= zone.armedAt : true;
      if (zone.kind === "bomb" && armed && !zone.exploded) {
        zone.exploded = true;
        addParticles(zone.x, zone.y, "#ff6b6b", 18);
        addParticles(zone.x, zone.y, "#ffd166", 14);
        addPopup("苡?", zone.x, zone.y - 18, "#fff3b0", 0.45, 18);
      }
      if (armed) {
        for (const enemy of [...enemies]) {
          if (zone.hits?.has(enemy)) continue;
          let hit = false;
          if (zone.kind === "train") {
            const trainLength = zone.trainLength ?? 520;
            const travel = zone.vertical ? height + trainLength * 1.35 : width + trainLength * 1.35;
            const moveProgress = clamp((progress - 0.04) / 0.92, 0, 1);
            const offset = -trainLength * 0.68 + travel * moveProgress;
            const centerX = zone.vertical ? zone.x : camera.x + (zone.direction > 0 ? offset : width - offset);
            const centerY = zone.vertical ? camera.y + (zone.direction > 0 ? offset : height - offset) : zone.y;
            hit = zone.vertical
              ? Math.abs(enemy.x - centerX) < zone.width / 2 + enemy.radius && Math.abs(enemy.y - centerY) < trainLength / 2 + enemy.radius
              : Math.abs(enemy.y - centerY) < zone.width / 2 + enemy.radius && Math.abs(enemy.x - centerX) < trainLength / 2 + enemy.radius;
          } else if (zone.kind === "lowKick") {
            const distanceToEnemy = Math.hypot(enemy.x - zone.x, enemy.y - zone.y);
            const kickAngle = angleTo(zone, enemy);
            hit = distanceToEnemy < zone.radius + enemy.radius && Math.abs(angleDelta(kickAngle, zone.angle)) < zone.arc / 2;
          } else if (zone.kind === "gate") {
            const angle = zone.angle ?? 0;
            const sideAngle = angle + Math.PI / 2;
            const pathLength = zone.pathLength ?? zone.radius * 2.65;
            for (const commuter of zone.commuters ?? []) {
              const t = clamp((progress - commuter.delay) / (commuter.duration ?? 0.62), 0, 1);
              if (t <= 0 || t >= 1) continue;
              const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
              const lane = commuter.lane * zone.radius * 0.95;
              const commuterX = zone.startX + Math.cos(angle) * pathLength * ease + Math.cos(sideAngle) * lane;
              const commuterY = zone.startY + Math.sin(angle) * pathLength * ease + Math.sin(sideAngle) * lane;
              if (Math.hypot(enemy.x - commuterX, enemy.y - commuterY) < enemy.radius + commuter.size * 1.62) {
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
          if (zone.stun || zone.bossStun) {
            const stunDuration = enemy.boss ? zone.bossStun ?? zone.stun : zone.stun;
            if (stunDuration) {
              enemy.stunTimer = Math.max(enemy.stunTimer ?? 0, stunDuration);
              addPopup("STUN", enemy.x, enemy.y - enemy.radius - 20, "#9bf6ff", 0.5, enemy.boss ? 15 : 13);
            }
          }
          if (zone.push) {
            const push = zone.kind === "gate" || zone.kind === "train" ? zone.angle ?? angleTo(zone, enemy) : angleTo(zone, enemy);
            const pushAmount = zone.push * (enemy.boss ? 1 / 3 : 1);
            enemy.x = clamp(enemy.x + Math.cos(push) * pushAmount, 35, WORLD_SIZE - 35);
            enemy.y = clamp(enemy.y + Math.sin(push) * pushAmount, 35, WORLD_SIZE - 35);
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

function announceSkill(name, { color = "#fff3b0", minGap = 1700, voice = true, source = "skill" } = {}) {
  if (source !== "item") return;
  const now = performance.now();
  const last = skillAnnouncementCooldowns.get(name) ?? 0;
  if (now - last < minGap) return;
  skillAnnouncementCooldowns.set(name, now);
  skillAnnouncement = {
    text: name,
    color,
    life: 1.02,
    maxLife: 1.02,
    seed: Math.random() * TAU,
  };
  playSound("ui");
  if (voice) speakSkillName(name);
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
  if (skillAnnouncement) {
    skillAnnouncement.life -= delta;
    if (skillAnnouncement.life <= 0) skillAnnouncement = null;
  }
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
      name: String(entry.name || "?대쫫?놁쓬").slice(0, 12),
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
                <span>${escapeHtml(entry.name)}<em>${escapeHtml(entry.hero || "캐릭터 미상")}</em></span>
                <span>${formatScore(entry.score)}</span>
              </li>
            `,
          )
          .join("")
      : `<li><strong>-</strong><span>아직 등록된 랭킹이 없습니다<em>캐릭터 미상</em></span><span>0</span></li>`;
}

async function loadLeaderboard() {
  if (!LEADERBOARD_API) {
    leaderboardServerOnline = false;
    applyLeaderboard(readLocalLeaderboard());
    return false;
  }

  try {
    const response = await fetch(LEADERBOARD_API, { cache: "no-store" });
    if (!response.ok) throw new Error("leaderboard_load_failed");
    const data = await response.json();
    leaderboardServerOnline = true;
    applyLeaderboard(data.entries);
    return true;
  } catch {
    leaderboardServerOnline = false;
    applyLeaderboard(readLocalLeaderboard());
    return false;
  }
}

async function prepareLeaderboardEntry() {
  if (!refs.leaderboardPanel) return;
  refs.leaderboardPanel.classList.remove("hidden");
  refs.rankForm?.classList.add("hidden");
  if (refs.rankHint) refs.rankHint.textContent = "랭킹 확인 중";

  const serverReady = await loadLeaderboard();

  if (!serverReady) {
    pendingLeaderboardScore = null;
    refs.rankForm?.classList.add("hidden");
    if (refs.rankHint) refs.rankHint.textContent = "서버 랭킹 미연결: 통합 랭킹 서버 설정이 필요합니다";
    return;
  }

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
    refs.rankHint.textContent = "TOP 10 諛뽰엯?덈떎";
  }
}

async function showStartLeaderboard() {
  refs.leaderboardPanel?.classList.remove("hidden");
  refs.rankForm?.classList.add("hidden");
  if (refs.rankHint) refs.rankHint.textContent = "랭킹 확인 중";
  await loadLeaderboard();
  if (refs.rankHint) refs.rankHint.textContent = leaderboardServerOnline ? "전체 유저 공유 랭킹" : "서버 연결 실패: 임시 저장 랭킹";
  playSound("ui");
}

async function submitLeaderboardEntry(event) {
  event.preventDefault();
  if (!pendingLeaderboardScore || leaderboardSubmitting) return;
  if (!LEADERBOARD_API || !leaderboardServerOnline) {
    if (refs.rankHint) refs.rankHint.textContent = "?쒕쾭 ??궧 誘몄뿰寃? ?먯닔瑜?怨듭쑀 ??ν븷 ???놁뒿?덈떎";
    return;
  }
  leaderboardSubmitting = true;
  if (refs.submitScoreButton) refs.submitScoreButton.disabled = true;
  const name = refs.playerNameInput?.value.trim() || "?대쫫?놁쓬";

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
    if (refs.rankHint) refs.rankHint.textContent = "?쒕쾭 ??궧 ?깅줉 ?꾨즺";
    renderLeaderboard();
  } catch {
    leaderboardServerOnline = false;
    if (refs.rankHint) refs.rankHint.textContent = "서버 연결 실패: 잠시 후 다시 등록하세요";
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
  updatePendingDansoBoomerangs(delta);
  updateEnemies(delta);
  updateProjectiles(delta);
  updatePoliceSquads(delta);
  updateStationPolicePets(delta);
  updateOrbs(delta);
  updateEnergyPickups(delta);
  updateDamageZones(delta);
  updateEffects(delta);
  if (player.elapsed >= MAX_RUN_TIME) endGame(true);
  updateHud();
}

function endGame(won) {
  playSound(won ? "levelUp" : "gameOver");
  stopAllMusic();
  player.alive = false;
  game.state = "ended";
  game.manualPaused = false;
  bestScore = Math.max(bestScore, player.score);
  localStorage.setItem(STORAGE_KEY, String(bestScore));
  refs.messageTitle.textContent = won ? "?묒쟾 ?깃났" : "?묒쟾 醫낅즺";
  refs.messageText.textContent = won
    ? `1?쒓컙??踰꾪끉?듬땲?? 理쒖쥌 ?먯닔 ${formatScore(player.score)}??`
    : `理쒖쥌 ?먯닔 ${formatScore(player.score)}?? ?ㅼ떆 異쒕룞?????덉뒿?덈떎.`;
  refs.startButton.textContent = "?ㅼ떆 異쒕룞";
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

function formatScore(value) {
  const score = Math.max(0, Math.round(Number(value) || 0));
  return score.toLocaleString("ko-KR");
}

function showSkillTooltip(item) {
  if (!refs.skillTooltip || !item?.desc) return;
  window.clearTimeout(skillTooltipTimer);
  refs.skillTooltip.textContent = item.desc;
  refs.skillTooltip.classList.add("active");
  skillTooltipTimer = window.setTimeout(() => {
    refs.skillTooltip?.classList.remove("active");
  }, 2600);
}

function renderLoadoutItems(items) {
  if (!refs.weaponList) return;
  refs.weaponList.innerHTML = "";
  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = item.type;
    button.style.setProperty("--power", item.power ?? 0.25);
    button.textContent = item.label;
    button.addEventListener("click", () => {
      playSound("ui");
      showSkillTooltip(item);
    });
    refs.weaponList.append(button);
  }
}

function updateHud() {
  refs.hp.textContent = `${Math.ceil(player.hp)} / ${Math.ceil(player.maxHp)}`;
  refs.hpFill.style.transform = `scaleX(${clamp(player.hp / player.maxHp, 0, 1)})`;
  refs.level.textContent = player.level;
  refs.time.textContent = formatTime(player.elapsed);
  refs.score.textContent = formatScore(player.score);
  if (refs.attackStat) refs.attackStat.textContent = Math.round(player.attackPower || 100);
  if (refs.defenseStat) refs.defenseStat.textContent = Math.round(player.defensePower || 100);
  if (refs.speedStat) refs.speedStat.textContent = Math.round((player.speed / 205) * 100);
  if (refs.dodgeStat) {
    const dodgePercent = Math.round((player.dodgeChance ?? 0) * 100);
    const labels = player.heroId === "changwoo" ? [] : [...(player.specialLabels || [])];
    if (dodgePercent > 0 && player.heroId !== "juyeon") labels.unshift(`?뚰뵾 ${dodgePercent}%`);
    refs.dodgeStat.textContent = labels.join(" / ");
    refs.dodgeStat.classList.toggle("hidden", labels.length <= 0);
  }
  refs.xpFill.style.transform = `scaleX(${clamp(player.xp / player.nextXp, 0, 1)})`;
  refs.bestScore.textContent = formatScore(bestScore);
  if (refs.firstAidCount) refs.firstAidCount.textContent = player.firstAidKits;
  if (refs.firstAidButton) {
    refs.firstAidButton.classList.toggle("item-hidden", player.firstAidKits <= 0);
    refs.firstAidButton.disabled = player.firstAidKits <= 0 || player.hp >= player.maxHp || game.state !== "playing" || game.paused;
  }
  if (refs.policeCount) refs.policeCount.textContent = player.policeCalls;
  if (refs.policeButton) {
    const policeLabel = refs.policeButton.querySelector("span");
    if (policeLabel) policeLabel.textContent = getPoliceItemName();
    refs.policeButton.setAttribute("aria-label", `${getPoliceItemName()} ?ъ슜`);
    refs.policeButton.classList.toggle("medal-mode", isRunnerCompanionHero());
    refs.policeButton.classList.toggle("item-hidden", player.policeCalls <= 0);
    refs.policeButton.disabled = player.policeCalls <= 0 || game.state !== "playing" || game.paused;
  }
  if (refs.taserCount) refs.taserCount.textContent = player.taserGuns;
  if (refs.taserButton) {
    refs.taserButton.classList.toggle("item-hidden", player.taserGuns <= 0);
    refs.taserButton.disabled = player.taserGuns <= 0 || !enemies.some((enemy) => enemy.boss) || game.state !== "playing" || game.paused;
  }
  if (refs.chickenCount) refs.chickenCount.textContent = player.chickenBreasts;
  if (refs.chickenButton) {
    refs.chickenButton.classList.toggle("tank-radio-mode", isTankRadioHero());
    const chickenLabel = refs.chickenButton.querySelector("span");
    if (chickenLabel) chickenLabel.textContent = getChickenItemName();
    refs.chickenButton.setAttribute("aria-label", `${getChickenItemName()} ?ъ슜`);
    refs.chickenButton.classList.toggle("item-hidden", player.chickenBreasts <= 0);
    refs.chickenButton.disabled = player.chickenBreasts <= 0 || game.state !== "playing" || game.paused || player.chickenTimer > 0;
  }
  if (refs.stimCount) refs.stimCount.textContent = player.stimPacks;
  if (refs.stimButton) {
    refs.stimButton.classList.toggle("item-hidden", player.stimPacks <= 0);
    refs.stimButton.disabled = player.stimPacks <= 0 || game.state !== "playing" || game.paused || player.stimTimer > 0;
  }
  if (refs.pauseButton) {
    refs.pauseButton.disabled = game.state !== "playing" || game.pendingHeroChoice || game.pendingStarterChoices > 0 || (game.paused && !game.manualPaused);
    refs.pauseButton.textContent = game.manualPaused ? "▶" : "||";
    refs.pauseButton.classList.toggle("active", game.manualPaused);
  }
  const chipPower = (level) => clamp((Number(level) || 1) / 7, 0.16, 1);
  const loadoutItems = [
    { label: `?꾪솚 x${player.shots}`, type: "attack", power: chipPower(player.shots), desc: `媛??媛源뚯슫 ?곸뿉寃?湲곕낯 ?꾪솚??諛쒖궗?⑸땲?? ?꾩옱 ${player.shots}諛쒖뵫 諛쒖궗.` },
    weapons.card.level > 0 ? { label: `援먰넻移대뱶 Lv.${weapons.card.level}`, type: "attack", power: chipPower(weapons.card.level), desc: "援먰넻移대뱶媛 ?붾㈃ 踰쎌뿉 理쒕? 5踰??뺢린硫??곸쓣 愿??怨듦꺽?⑸땲??" } : null,
    weapons.lightning.level > 0 ? { label: `踰덇컻 Lv.${weapons.lightning.level}`, type: "attack", power: chipPower(weapons.lightning.level), desc: "媛源뚯슫 ??二쇰???誘쇱썝 踰덇컻瑜??대젮 踰붿쐞 ?쇳빐瑜?以띾땲??" } : null,
    weapons.strapOrbit.level > 0 ? { label: `?먯옟??Lv.${weapons.strapOrbit.level}`, type: "attack", power: chipPower(weapons.strapOrbit.level), desc: `吏?섏쿋 ?먯옟??${getStrapCount()}媛쒓? 二쇱쐞瑜??뚯쟾?섎ŉ ?우? ?곸쓣 怨꾩냽 怨듦꺽?⑸땲??` } : null,
    weapons.tearGas.level > 0 ? { label: `理쒕쪟??Lv.${weapons.tearGas.level}`, type: "attack", power: chipPower(weapons.tearGas.level), desc: "二쇱씤怨?二쇰????먯옟?대낫???볦? 媛??吏?瑜?留뚮뱾怨??덉뿉 ?ㅼ뼱???곸뿉寃?吏???쇳빐瑜?以띾땲??" } : null,
    weapons.expressTrain.level > 0 ? { label: `湲됲뻾 Lv.${weapons.expressTrain.level}`, type: "attack", power: chipPower(weapons.expressTrain.level), desc: "湲됲뻾?댁감媛 蹂댁뒪瑜??곗꽑 ?몃젮 吏?섍?硫??쇳빐? ?됰갚??以띾땲??" } : null,
    weapons.customerMissile.level > 0 ? { label: `?좊룄??Lv.${weapons.customerMissile.level}`, type: "attack", power: chipPower(weapons.customerMissile.level), desc: "怨좉컼?쇳꽣 ?좊룄?꾩씠 蹂댁뒪瑜??곗꽑 異붿쟻?섍퀬 ?쏀븳 ??컻 ?쇳빐瑜?以띾땲??" } : null,
    weapons.subwayPolice.level > 0 ? { label: `${getCompanionSkillName()} Lv.${weapons.subwayPolice.level}`, type: "attack", power: chipPower(weapons.subwayPolice.level), desc: getCompanionSkillDesc() } : null,
    player.defenseBreakTimer > 0 ? { label: `방어저하 ${Math.ceil(player.defenseBreakTimer)}초`, type: "status", desc: "현재 방어력이 감소한 상태입니다." } : null,
    player.stunTimer > 0 ? { label: `경직 ${Math.ceil(player.stunTimer)}초`, type: "status", desc: "잠시 움직일 수 없는 상태입니다." } : null,
    player.slowTimer > 0 ? { label: `둔화 ${Math.ceil(player.slowTimer)}초`, type: "status", desc: "이동 속도가 느려진 상태입니다." } : null,
    player.damageReduction > 0 ? { label: `?댁꽦 ${Math.round(player.damageReduction * 100)}%`, type: "passive", power: chipPower(Math.round(player.damageReduction / 0.15)), desc: "諛쏅뒗 ?쇳빐媛 媛먯냼?⑸땲??" } : null,
    player.regenLevel > 0 ? { label: `?뚮났 Lv.${player.regenLevel}`, type: "passive", power: chipPower(player.regenLevel), desc: `?쇱젙 ?쒓컙留덈떎 理쒕? 泥대젰??${Number(((BASE_REGEN_RATIO + player.regenLevel * REGEN_UPGRADE_RATIO) * 100).toFixed(1))}%瑜??뚮났?⑸땲??` } : null,
    player.chickenTimer > 0 ? { label: `${getChickenItemName()} ${Math.ceil(player.chickenTimer)}초`, type: "status", desc: "몸집이 커지고 접촉한 적에게 몸통박치기 피해와 넉백을 줍니다." } : null,
    player.stimTimer > 0 ? { label: `스팀팩 ${Math.ceil(player.stimTimer)}초`, type: "status", desc: "일부 무기 쿨타임이 1/3로 줄지만 매초 최대 체력 3%를 잃습니다." } : null,
  ].filter(Boolean);
  renderLoadoutItems(loadoutItems);
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
  ctx.fillStyle = "#1f2529";
  ctx.fillRect(-80, -80, viewWidth + 160, viewHeight + 160);

  const tile = 72;
  const offsetX = -(((camera.x * 0.74) % tile) + tile) % tile;
  const offsetY = -(((camera.y * 0.74) % tile) + tile) % tile;

  ctx.strokeStyle = "rgba(230, 236, 240, 0.12)";
  ctx.lineWidth = 1;
  for (let x = offsetX - tile; x < viewWidth + tile * 2; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewHeight);
    ctx.stroke();
  }
  for (let y = offsetY - tile; y < viewHeight + tile * 2; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(viewWidth, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWorldBounds() {
  const left = -camera.x;
  const top = -camera.y;
  const right = WORLD_SIZE - camera.x;
  const bottom = WORLD_SIZE - camera.y;
  const visibleLeft = left > -48 && left < viewWidth + 48;
  const visibleRight = right > -48 && right < viewWidth + 48;
  const visibleTop = top > -48 && top < viewHeight + 48;
  const visibleBottom = bottom > -48 && bottom < viewHeight + 48;
  if (!visibleLeft && !visibleRight && !visibleTop && !visibleBottom) return;

  ctx.save();
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.strokeStyle = "rgba(255, 190, 11, 0.95)";
  ctx.lineWidth = 10;
  ctx.setLineDash([18, 12]);
  if (visibleLeft) {
    ctx.beginPath();
    ctx.moveTo(left + 5, Math.max(top, 0) - 80);
    ctx.lineTo(left + 5, Math.min(bottom, viewHeight) + 80);
    ctx.stroke();
  }
  if (visibleRight) {
    ctx.beginPath();
    ctx.moveTo(right - 5, Math.max(top, 0) - 80);
    ctx.lineTo(right - 5, Math.min(bottom, viewHeight) + 80);
    ctx.stroke();
  }
  if (visibleTop) {
    ctx.beginPath();
    ctx.moveTo(Math.max(left, 0) - 80, top + 5);
    ctx.lineTo(Math.min(right, viewWidth) + 80, top + 5);
    ctx.stroke();
  }
  if (visibleBottom) {
    ctx.beginPath();
    ctx.moveTo(Math.max(left, 0) - 80, bottom - 5);
    ctx.lineTo(Math.min(right, viewWidth) + 80, bottom - 5);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255, 71, 126, 0.72)";
  ctx.lineWidth = 3;
  ctx.strokeRect(left, top, WORLD_SIZE, WORLD_SIZE);
  ctx.restore();
}

function drawSubwayInteriorImage() {
  const offsetY = -(((camera.y * 0.16) % viewHeight) + viewHeight) % viewHeight;
  for (let y = offsetY - viewHeight; y < viewHeight + 1; y += viewHeight) {
    ctx.drawImage(subwayInteriorBg, 0, y, viewWidth, viewHeight);
  }

  const floorGlow = ctx.createRadialGradient(viewWidth / 2, viewHeight / 2, 40, viewWidth / 2, viewHeight / 2, viewHeight * 0.72);
  floorGlow.addColorStop(0, "rgba(5, 10, 14, 0)");
  floorGlow.addColorStop(1, "rgba(5, 8, 12, 0.22)");
  ctx.fillStyle = floorGlow;
  ctx.fillRect(0, 0, viewWidth, viewHeight);
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
  const chickenActive = player.chickenTimer > 0;
  const stimActive = player.stimTimer > 0;
  const transformedImage = chickenActive ? chickenHeroImages.get(player.heroId) : null;
  const heroImage = transformedImage?.complete && transformedImage.naturalWidth > 0 ? transformedImage : heroImages.get(player.heroId);
  const heroConfig = heroTypes.find((hero) => hero.id === player.heroId);
  const useHeroImage = Boolean(heroImage?.complete && heroImage.naturalWidth > 0);
  const chickenRatio = chickenActive ? clamp(player.chickenTimer / CHICKEN_BUFF_DURATION, 0, 1) : 0;
  const baseSpriteScaleX = heroConfig?.spriteScaleX ?? 1;
  const baseSpriteScaleY = heroConfig?.spriteScaleY ?? 1;
  const chickenSpriteScaleX = heroConfig?.chickenScaleX ?? CHICKEN_VISUAL_SCALE;
  const chickenSpriteScaleY = heroConfig?.chickenScaleY ?? CHICKEN_VISUAL_SCALE;
  const stimSpriteScaleX = baseSpriteScaleX + (chickenSpriteScaleX - baseSpriteScaleX) * STIMPACK_VISUAL_SCALE_RATIO;
  const stimSpriteScaleY = baseSpriteScaleY + (chickenSpriteScaleY - baseSpriteScaleY) * STIMPACK_VISUAL_SCALE_RATIO;
  const spriteScaleX = chickenActive ? chickenSpriteScaleX : stimActive ? stimSpriteScaleX : baseSpriteScaleX;
  const spriteScaleY = chickenActive ? chickenSpriteScaleY : stimActive ? stimSpriteScaleY : baseSpriteScaleY;
  const spriteHeight = Math.max(32, player.radius * 7.2) * spriteScaleY;
  const spriteWidth = useHeroImage ? spriteHeight * (heroImage.naturalWidth / heroImage.naturalHeight) * (spriteScaleX / Math.max(0.1, spriteScaleY)) : 0;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.globalAlpha = pulse;
  if (chickenActive) {
    const steam = performance.now() * 0.002;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.22 + chickenRatio * 0.12;
    ctx.fillStyle = "rgba(183, 239, 100, 0.18)";
    ctx.shadowColor = "#b7ef64";
    ctx.shadowBlur = 26;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius * 5.2, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 7; i += 1) {
      const angle = (TAU * i) / 7 + steam;
      const sx = Math.cos(angle) * player.radius * 4.0;
      const sy = Math.sin(angle) * player.radius * 3.2;
      ctx.beginPath();
      ctx.moveTo(sx, sy + 18);
      ctx.bezierCurveTo(sx + Math.sin(steam + i) * 12, sy, sx - Math.cos(steam + i) * 10, sy - 18, sx + 3, sy - 34);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (stimActive) {
    const pulseTime = performance.now() * 0.006;
    const steamTime = performance.now() * 0.0028;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.save();
    ctx.globalAlpha = 0.2 + Math.sin(pulseTime) * 0.04;
    ctx.strokeStyle = "rgba(255, 72, 46, 0.72)";
    ctx.shadowColor = "#ff4b35";
    ctx.shadowBlur = 26;
    ctx.lineWidth = 9;
    for (let i = 0; i < 3; i += 1) {
      const radiusX = player.radius * (3.9 + i * 0.78);
      const radiusY = player.radius * (5.0 + i * 0.88);
      ctx.beginPath();
      ctx.ellipse(0, -player.radius * 0.8, radiusX, radiusY, Math.sin(pulseTime + i) * 0.12, pulseTime + i * 1.35, pulseTime + i * 1.35 + Math.PI * 1.25);
      ctx.stroke();
    }
    ctx.restore();
    ctx.save();
    ctx.shadowColor = "#ff6b6b";
    ctx.shadowBlur = 40;
    for (let i = 0; i < 24; i += 1) {
      const seed = i * 1.73;
      const rise = (steamTime * (0.36 + (i % 4) * 0.08) + i * 0.071) % 1;
      const side = i % 2 === 0 ? -1 : 1;
      const baseX = side * (player.radius * (1.4 + (i % 4) * 0.54));
      const baseY = player.radius * (2.8 + (i % 3) * 0.5);
      const curl = Math.sin(steamTime * 4.8 + seed) * player.radius * 1.05;
      const x = baseX + curl * (0.55 + rise);
      const y = baseY - rise * player.radius * 9.4;
      const smokeRadius = player.radius * (0.9 + rise * 1.85);
      const alpha = Math.sin(rise * Math.PI) * 0.36;
      const gradient = ctx.createRadialGradient(x, y, smokeRadius * 0.12, x, y, smokeRadius);
      gradient.addColorStop(0, `rgba(255, 248, 240, ${alpha})`);
      gradient.addColorStop(0.44, `rgba(255, 135, 96, ${alpha * 0.62})`);
      gradient.addColorStop(1, "rgba(255, 68, 48, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(x, y, smokeRadius * 0.72, smokeRadius * 1.22, Math.sin(seed) * 0.45, 0, TAU);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(255, 238, 230, 0.56)";
    ctx.lineWidth = 4.8;
    ctx.lineCap = "round";
    for (let i = 0; i < 14; i += 1) {
      const side = i % 2 === 0 ? -1 : 1;
      const startX = side * player.radius * (1.35 + (i % 4) * 0.48);
      const startY = player.radius * (2.55 + (i % 3) * 0.32);
      const wave = Math.sin(steamTime * 4.2 + i) * player.radius * 1.2;
      ctx.globalAlpha = 0.48;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.bezierCurveTo(
        startX + wave,
        startY - player.radius * 2.5,
        startX - side * player.radius * 1.15,
        startY - player.radius * 5.2,
        startX + wave * 0.55,
        startY - player.radius * 7.5,
      );
      ctx.stroke();
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(255, 92, 65, 0.8)";
    ctx.shadowColor = "#ff6b6b";
    ctx.shadowBlur = 24;
    ctx.lineWidth = 4.4;
    for (let i = 0; i < 3; i += 1) {
      const radius = player.radius * (2.8 + i * 0.74) + Math.sin(pulseTime + i) * 4.5;
      ctx.globalAlpha = 0.52 - i * 0.08;
      ctx.beginPath();
      ctx.arc(0, 0, radius, pulseTime + i * 1.4, pulseTime + i * 1.4 + Math.PI * 1.35);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.62;
    ctx.strokeStyle = "rgba(255, 235, 225, 0.78)";
    for (let i = 0; i < 6; i += 1) {
      const angle = pulseTime * 1.8 + (TAU * i) / 6;
      const inner = player.radius * 1.8;
      const outer = player.radius * 4.6;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }
  if (useHeroImage) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    ctx.beginPath();
    ctx.ellipse(0, spriteHeight * 0.37, spriteWidth * 0.34, 4.2, 0, 0, TAU);
    ctx.fill();
    ctx.shadowColor = player.heroAccent;
    ctx.shadowBlur = chickenActive ? 26 : stimActive ? 18 : player.invuln > 0 ? 14 : 7;
    if (chickenActive) ctx.filter = "saturate(1.25) contrast(1.08) hue-rotate(18deg)";
    else if (stimActive) ctx.filter = "saturate(1.35) contrast(1.08)";
    ctx.drawImage(heroImage, -spriteWidth / 2, -spriteHeight * 0.58, spriteWidth, spriteHeight);
    ctx.filter = "none";
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
  if (chickenActive) {
    const secondsLeft = Math.max(1, Math.ceil(player.chickenTimer));
    const label = `${secondsLeft}초`;
    const badgeY = useHeroImage ? -spriteHeight * 0.58 - 18 : -player.radius - 28;
    ctx.save();
    ctx.globalAlpha = 0.94;
    ctx.font = "1000 15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(label);
    const badgeWidth = Math.max(46, metrics.width + 20);
    const badgeHeight = 24;
    const x = -badgeWidth / 2;
    const y = badgeY - badgeHeight / 2;
    ctx.shadowColor = "#ffd166";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "rgba(18, 12, 5, 0.82)";
    ctx.strokeStyle = "rgba(255, 209, 102, 0.92)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, badgeWidth, badgeHeight, 8);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff3b0";
    ctx.fillText(label, 0, badgeY + 1);
    ctx.restore();
  }
  ctx.restore();
}

function drawBlades() {
  if (weapons.tearGas.level > 0) {
    const gasRadius = getTearGasRadius();
    const p = worldToScreen(player.x, player.y);
    const pulse = weapons.tearGas.pulse;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.5;
    const gradient = ctx.createRadialGradient(0, 0, gasRadius * 0.14, 0, 0, gasRadius);
    gradient.addColorStop(0, "rgba(190, 196, 195, 0.24)");
    gradient.addColorStop(0.45, "rgba(135, 145, 143, 0.16)");
    gradient.addColorStop(0.78, "rgba(92, 101, 100, 0.08)");
    gradient.addColorStop(1, "rgba(60, 66, 66, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, gasRadius, 0, TAU);
    ctx.fill();

    for (let i = 0; i < 42; i += 1) {
      const angle = pulse * (0.1 + (i % 6) * 0.014) + (TAU * i) / 42;
      const radius = gasRadius * (0.1 + ((i * 31) % 86) / 100);
      const drift = Math.sin(pulse * 0.9 + i * 1.9) * (10 + (i % 5) * 3);
      const cloudSize = gasRadius * (0.052 + (i % 5) * 0.011);
      const x = Math.cos(angle) * (radius + drift);
      const y = Math.sin(angle) * (radius - drift * 0.6);
      const cloud = ctx.createRadialGradient(x, y, 0, x, y, cloudSize);
      cloud.addColorStop(0, "rgba(224, 228, 226, 0.22)");
      cloud.addColorStop(0.45, "rgba(150, 158, 156, 0.15)");
      cloud.addColorStop(1, "rgba(75, 82, 82, 0)");
      ctx.fillStyle = cloud;
      ctx.beginPath();
      ctx.arc(x, y, cloudSize, 0, TAU);
      ctx.fill();
    }
    ctx.restore();
  }

  if (weapons.strapOrbit.level > 0) {
    const strapCount = getStrapCount();
    const strapRadius = getStrapOrbitRadius();
    const strapDrawScale = getStrapHandleRadius() / 13;
    ctx.save();
    for (let i = 0; i < strapCount; i += 1) {
      const strapAngle = weapons.strapOrbit.angle + (TAU * i) / strapCount;
      const p = worldToScreen(player.x + Math.cos(strapAngle) * strapRadius, player.y + Math.sin(strapAngle) * strapRadius);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(strapAngle);
      ctx.strokeStyle = "#ffd6a5";
      ctx.fillStyle = "#5f4b32";
      ctx.lineWidth = 3 * strapDrawScale;
      ctx.beginPath();
      ctx.arc(0, 0, 10 * strapDrawScale, 0.2, TAU - 0.2);
      ctx.stroke();
      ctx.fillRect(-4 * strapDrawScale, -15 * strapDrawScale, 8 * strapDrawScale, 9 * strapDrawScale);
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawEnemy(enemy) {
  const p = worldToScreen(enemy.x, enemy.y);
  const actorImage = enemy.boss ? bossImages.get(enemy.id) : monsterImages.get(enemy.id);
  const useActorImage = canDrawGameImage(actorImage);
  const fallbackHeight = Math.max(enemy.boss ? 96 : 54, enemy.radius * (enemy.boss ? 5.4 : 4.35));
  const fallbackWidth = fallbackHeight * (enemy.boss ? 0.72 : 0.58);
  const imageHeight = useActorImage ? Math.max(enemy.boss ? 72 : 46, enemy.radius * (enemy.boss ? 7.4 : 5.9)) : fallbackHeight;
  const imageWidth = useActorImage ? imageHeight * (actorImage.naturalWidth / actorImage.naturalHeight) : fallbackWidth;
  const visualTop = imageHeight * 0.72;
  const visualBottom = imageHeight * 0.28;
  const visualHalfWidth = imageWidth / 2;
  const cullPadding = enemy.boss
    ? Math.max(240, imageHeight * 0.9, imageWidth * 0.7)
    : Math.max(110, imageHeight * 0.9, imageWidth * 0.75, enemy.radius * 5);
  const cullLeft = -visualHalfWidth - cullPadding;
  const cullRight = viewWidth + visualHalfWidth + cullPadding;
  const cullTop = -visualTop - cullPadding;
  const cullBottom = viewHeight + visualBottom + cullPadding;
  if (p.x < cullLeft || p.x > cullRight || p.y < cullTop || p.y > cullBottom) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.save();
  ctx.rotate(enemy.wobble * 0.25);
  if (enemy.spawnFlash > 0) {
    const flashProgress = clamp(enemy.spawnFlash / (enemy.boss ? 1.0 : 0.7), 0, 1);
    const ring = 1 + (1 - flashProgress) * 0.58;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = 0.18 + flashProgress * 0.38;
    ctx.strokeStyle = enemy.trim;
    ctx.lineWidth = enemy.boss ? 5 : 3;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(enemy.radius * 1.7, imageWidth * 0.34) * ring, 0, TAU);
    ctx.stroke();
    ctx.globalAlpha = 0.12 + flashProgress * 0.16;
    ctx.fillStyle = enemy.trim;
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(enemy.radius * 1.28, imageWidth * 0.24) * ring, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
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
    try {
      ctx.drawImage(actorImage, -imageWidth / 2, -imageHeight * 0.72, imageWidth, imageHeight);
    } catch {
      ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;
      ctx.strokeStyle = enemy.trim;
      ctx.lineWidth = enemy.boss ? 3.5 : 2.2;
      roundedRect(-fallbackWidth / 2, -fallbackHeight * 0.58, fallbackWidth, fallbackHeight * 0.78, Math.max(8, enemy.radius * 0.35));
      ctx.fill();
      ctx.stroke();
    }
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
    ctx.scale(enemy.boss ? 1.75 : 1.45, enemy.boss ? 1.75 : 1.45);
    ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : enemy.color;
    ctx.strokeStyle = enemy.trim;
    ctx.lineWidth = enemy.boss ? 2.8 : 1.8;
    if (enemy.special === "commute-protest") {
      ctx.save();
      ctx.scale(1.05, 1.05);
      ctx.fillStyle = enemy.hitFlash > 0 ? "#ffffff" : "#495057";
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, -enemy.radius * 0.92, enemy.radius * 0.28, 0, TAU);
      ctx.fill();
      ctx.stroke();
      roundedRect(-enemy.radius * 0.22, -enemy.radius * 0.62, enemy.radius * 0.58, enemy.radius * 0.78, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#dbe4ea";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(enemy.radius * 0.26, -enemy.radius * 0.18);
      ctx.lineTo(enemy.radius * 0.72, enemy.radius * 0.16);
      ctx.lineTo(enemy.radius * 0.88, enemy.radius * 0.52);
      ctx.stroke();
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(-enemy.radius * 0.22, enemy.radius * 0.42, enemy.radius * 0.44, 0, TAU);
      ctx.arc(enemy.radius * 0.72, enemy.radius * 0.48, enemy.radius * 0.18, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#fff3b0";
      ctx.fillRect(-enemy.radius * 0.68, enemy.radius * 0.87, enemy.radius * 1.58, 3);
      ctx.restore();
    } else if (enemy.id === "airport-thief" || enemy.special === "boss-luggage" || enemy.special === "boss-airport") {
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

  ctx.restore();
  if (enemy.boss || enemy.hp < enemy.maxHp) {
    const barWidth = enemy.boss ? Math.max(96, enemy.radius * 4.1) : Math.max(38, enemy.radius * 2.4);
    const barHeight = enemy.boss ? 7 : 5;
    const barY = -visualTop - (enemy.boss ? 18 : 11);
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    roundedRect(-barWidth / 2, barY, barWidth, barHeight, barHeight / 2);
    ctx.fill();
    ctx.fillStyle = enemy.boss ? "#ff477e" : "#ffd166";
    roundedRect(-barWidth / 2, barY, barWidth * clamp(enemy.hp / enemy.maxHp, 0, 1), barHeight, barHeight / 2);
    ctx.fill();
  }
  if (enemy.stunTimer > 0) {
    const stunY = -visualTop - (enemy.boss ? 44 : 28);
    const electricPulse = 0.75 + Math.sin(player.elapsed * 18) * 0.18;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = enemy.boss ? 0.66 + electricPulse * 0.34 : 0.48 + electricPulse * 0.28;
    ctx.strokeStyle = "#fff3b0";
    ctx.lineWidth = enemy.boss ? 6 : 2.4;
    const ringCount = enemy.boss ? 4 : 3;
    for (let ring = 0; ring < ringCount; ring += 1) {
      const ringRadius = enemy.radius * (1.28 + ring * 0.34 + Math.sin(player.elapsed * 11 + ring) * 0.09);
      ctx.beginPath();
      ctx.arc(0, 0, ringRadius, player.elapsed * (2 + ring * 0.4), TAU + player.elapsed * (2 + ring * 0.4));
      ctx.stroke();
    }
    ctx.strokeStyle = enemy.boss ? "#80ffdb" : "#fff3b0";
    ctx.lineWidth = enemy.boss ? 4.2 : 2.2;
    const boltCount = enemy.boss ? 14 : 9;
    for (let i = 0; i < boltCount; i += 1) {
      const angle = player.elapsed * 6.4 + (TAU * i) / boltCount;
      const inner = enemy.radius * (0.75 + (i % 3) * 0.08);
      const outer = enemy.radius * ((enemy.boss ? 1.95 : 1.55) + Math.sin(player.elapsed * 17 + i) * 0.2);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle + 0.16) * outer, Math.sin(angle + 0.16) * outer);
      ctx.stroke();
    }
    if (enemy.boss) {
      ctx.globalAlpha = 0.34 + electricPulse * 0.2;
      ctx.fillStyle = "#80ffdb";
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius * 1.55, 0, TAU);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 0.9 + Math.sin(player.elapsed * 24) * 0.08;
    ctx.strokeStyle = "#fff3b0";
    ctx.fillStyle = "#fff3b0";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      const offset = (i - 1) * 12;
      ctx.beginPath();
      ctx.moveTo(offset - 3, stunY - 10);
      ctx.lineTo(offset + 4, stunY - 1);
      ctx.lineTo(offset - 1, stunY - 1);
      ctx.lineTo(offset + 5, stunY + 10);
      ctx.stroke();
    }
    const label = "기절 " + enemy.stunTimer.toFixed(1) + "초";
    const labelWidth = enemy.boss ? 86 : 68;
    const labelHeight = enemy.boss ? 23 : 19;
    ctx.fillStyle = "rgba(12, 15, 18, 0.82)";
    ctx.strokeStyle = "#fff3b0";
    ctx.lineWidth = 2;
    roundedRect(-labelWidth / 2, stunY + 11, labelWidth, labelHeight, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#fff3b0";
    ctx.font = `900 ${enemy.boss ? 13 : 11}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, stunY + 11 + labelHeight / 2);
    ctx.restore();
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
    const angle = Math.atan2(bullet.vy, bullet.vx);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    if (bullet.style === "military") {
      const r = bullet.radius;
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 14;

      const trail = ctx.createLinearGradient(-r * 4.4, 0, -r * 0.8, 0);
      trail.addColorStop(0, "rgba(255, 209, 102, 0)");
      trail.addColorStop(0.58, "rgba(255, 209, 102, 0.22)");
      trail.addColorStop(1, "rgba(255, 243, 176, 0.52)");
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.moveTo(-r * 4.5, 0);
      ctx.lineTo(-r * 0.9, -r * 0.58);
      ctx.lineTo(-r * 0.9, r * 0.58);
      ctx.closePath();
      ctx.fill();

      const body = ctx.createLinearGradient(-r * 1.55, -r * 0.72, r * 1.85, r * 0.72);
      body.addColorStop(0, "#8a5a1f");
      body.addColorStop(0.18, "#c58f36");
      body.addColorStop(0.48, "#ffcf70");
      body.addColorStop(0.72, "#f6f1df");
      body.addColorStop(1, "#9b9b92");
      ctx.fillStyle = body;
      ctx.strokeStyle = "#3b2a16";
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.moveTo(r * 2.15, 0);
      ctx.quadraticCurveTo(r * 1.34, -r * 0.82, r * 0.45, -r * 0.74);
      ctx.lineTo(-r * 1.38, -r * 0.68);
      ctx.quadraticCurveTo(-r * 1.72, 0, -r * 1.38, r * 0.68);
      ctx.lineTo(r * 0.45, r * 0.74);
      ctx.quadraticCurveTo(r * 1.34, r * 0.82, r * 2.15, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.72, -r * 0.38);
      ctx.lineTo(r * 0.78, -r * 0.3);
      ctx.stroke();

      ctx.strokeStyle = "rgba(80, 48, 12, 0.72)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(-r * 1.05, -r * 0.6);
      ctx.lineTo(-r * 1.05, r * 0.6);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    if (bullet.style === "medal") {
      const r = bullet.radius;
      const spin = performance.now() * 0.012 + bullet.x * 0.01;
      const squash = 0.74 + Math.abs(Math.sin(spin)) * 0.28;
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 15;

      const trail = ctx.createLinearGradient(-r * 4, 0, -r * 0.9, 0);
      trail.addColorStop(0, "rgba(255, 209, 102, 0)");
      trail.addColorStop(0.62, "rgba(255, 209, 102, 0.2)");
      trail.addColorStop(1, "rgba(255, 243, 176, 0.52)");
      ctx.fillStyle = trail;
      ctx.beginPath();
      ctx.moveTo(-r * 4.1, 0);
      ctx.lineTo(-r * 0.86, -r * 0.64);
      ctx.lineTo(-r * 0.86, r * 0.64);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.scale(squash, 1);
      const medalGrad = ctx.createRadialGradient(-r * 0.24, -r * 0.34, r * 0.12, 0, 0, r * 1.2);
      medalGrad.addColorStop(0, "#fff8d6");
      medalGrad.addColorStop(0.34, "#ffd166");
      medalGrad.addColorStop(0.72, "#c98b1e");
      medalGrad.addColorStop(1, "#7f4f0f");
      ctx.fillStyle = medalGrad;
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 2.1;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.24, 0, TAU);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(98, 58, 9, 0.68)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.78, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = "#fff8d6";
      ctx.font = `900 ${Math.max(8, r * 0.9)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("완", 0, r * 0.02);
      ctx.restore();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#2f78c4";
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, -r * 1.08);
      ctx.lineTo(-r * 1.22, -r * 2.0);
      ctx.lineTo(-r * 0.22, -r * 1.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f8f9fa";
      ctx.beginPath();
      ctx.moveTo(r * 0.7, -r * 1.08);
      ctx.lineTo(r * 1.22, -r * 2.0);
      ctx.lineTo(r * 0.22, -r * 1.4);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.82)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.45, -r * 0.62);
      ctx.lineTo(r * 0.36, -r * 0.74);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    ctx.shadowColor = bullet.color ?? "#fff3b0";
    ctx.shadowBlur = 10;
    ctx.fillStyle = bullet.color === "#b8dcff" ? "#dff7ff" : "#f7d36f";
    ctx.strokeStyle = "#fff8d6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bullet.radius * 1.8, 0);
    ctx.lineTo(bullet.radius * 0.82, bullet.radius * 0.72);
    ctx.lineTo(-bullet.radius * 1.35, bullet.radius * 0.54);
    ctx.quadraticCurveTo(-bullet.radius * 1.8, 0, -bullet.radius * 1.35, -bullet.radius * 0.54);
    ctx.lineTo(bullet.radius * 0.82, -bullet.radius * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  for (const shell of tankShells) {
    for (const point of shell.trail) {
      const trailPoint = worldToScreen(point.x, point.y);
      ctx.globalAlpha = clamp(point.life / 0.32, 0, 1) * 0.62;
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.arc(trailPoint.x, trailPoint.y, Math.max(5, shell.radius * 0.42), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    const p = worldToScreen(shell.x, shell.y);
    const angle = Math.atan2(shell.vy, shell.vx);
    const r = shell.radius;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.shadowColor = "#ff2d2d";
    ctx.shadowBlur = 22;
    const fireTrail = ctx.createLinearGradient(-r * 4.8, 0, -r * 0.6, 0);
    fireTrail.addColorStop(0, "rgba(255, 107, 53, 0)");
    fireTrail.addColorStop(0.55, "rgba(255, 183, 3, 0.36)");
    fireTrail.addColorStop(1, "rgba(255, 243, 176, 0.82)");
    ctx.fillStyle = fireTrail;
    ctx.beginPath();
    ctx.moveTo(-r * 4.8, 0);
    ctx.lineTo(-r * 0.8, -r * 0.82);
    ctx.lineTo(-r * 0.8, r * 0.82);
    ctx.closePath();
    ctx.fill();

    const shellGrad = ctx.createLinearGradient(-r * 1.5, -r * 0.6, r * 2.0, r * 0.62);
    shellGrad.addColorStop(0, "#3a2d1b");
    shellGrad.addColorStop(0.32, "#7d5d2a");
    shellGrad.addColorStop(0.66, "#c5a05a");
    shellGrad.addColorStop(1, "#f8e6a0");
    ctx.fillStyle = shellGrad;
    ctx.strokeStyle = "#1d160d";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(r * 2.2, 0);
    ctx.quadraticCurveTo(r * 1.38, -r * 0.9, r * 0.26, -r * 0.78);
    ctx.lineTo(-r * 1.45, -r * 0.66);
    ctx.quadraticCurveTo(-r * 1.85, 0, -r * 1.45, r * 0.66);
    ctx.lineTo(r * 0.26, r * 0.78);
    ctx.quadraticCurveTo(r * 1.38, r * 0.9, r * 2.2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
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
    const cardWidth = 48;
    const cardHeight = 30;
    ctx.shadowColor = "#3dd6ff";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#f7fbff";
    ctx.strokeStyle = "#1149a8";
    ctx.lineWidth = 2.8;
    roundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 6);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#00a6e8";
    roundedRect(-20, -11, 19, 7, 3);
    ctx.fill();
    ctx.fillStyle = "#55c63f";
    roundedRect(1, -11, 19, 7, 3);
    ctx.fill();
    ctx.fillStyle = "#1149a8";
    ctx.font = "900 10px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("T-money", 0, 5);
    ctx.restore();
  }

  for (const enemy of enemies) {
    if (!enemy.boss || (enemy.taserLinkTimer ?? 0) <= 0) continue;
    const start = worldToScreen(player.x, player.y);
    const end = worldToScreen(enemy.x, enemy.y);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    const length = Math.hypot(end.x - start.x, end.y - start.y);
    const pulse = performance.now() * 0.024 + enemy.wobble;
    const lifeRatio = clamp((enemy.taserLinkTimer ?? 0) / Math.max(0.1, enemy.taserLinkMax ?? 5), 0, 1);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 0.45 + lifeRatio * 0.5;

    ctx.shadowColor = "#fff3b0";
    ctx.shadowBlur = 36;
    for (let strand = -2; strand <= 2; strand += 1) {
      ctx.beginPath();
      for (let i = 0; i <= 16; i += 1) {
        const t = i / 16;
        const jitter = Math.sin(pulse + i * 1.7 + strand) * 8 + Math.cos(pulse * 0.6 + i * 2.3) * 5;
        const sideOffset = strand === 0 ? jitter * 0.25 : strand * 7 + jitter;
        const x = start.x + Math.cos(angle) * length * t + Math.cos(angle + Math.PI / 2) * sideOffset;
        const y = start.y + Math.sin(angle) * length * t + Math.sin(angle + Math.PI / 2) * sideOffset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle =
        strand === 0 ? "rgba(255, 255, 255, 0.98)" : strand % 2 ? "rgba(128, 255, 219, 0.86)" : "rgba(255, 243, 176, 0.92)";
      ctx.lineWidth = strand === 0 ? 5.4 : 3.2;
      ctx.stroke();
    }

    const impactPulse = 1 + Math.sin(pulse * 1.45) * 0.18;
    ctx.globalAlpha = 0.58 + lifeRatio * 0.28;
    ctx.strokeStyle = "#80ffdb";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.arc(end.x, end.y, enemy.radius * 2.2 + 20 * impactPulse, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#fff3b0";
    ctx.lineWidth = 2.8;
    for (let i = 0; i < 9; i += 1) {
      const a = pulse * 0.75 + (TAU * i) / 9;
      const inner = enemy.radius * 0.85 + 8 + Math.sin(pulse + i) * 3;
      const outer = enemy.radius * 2.2 + 34 + Math.cos(pulse * 1.2 + i) * 8;
      ctx.beginPath();
      ctx.moveTo(end.x + Math.cos(a) * inner, end.y + Math.sin(a) * inner);
      ctx.lineTo(end.x + Math.cos(a) * outer, end.y + Math.sin(a) * outer);
      ctx.stroke();
    }

    ctx.globalAlpha = 0.34 + lifeRatio * 0.26;
    ctx.fillStyle = "rgba(255, 243, 176, 0.45)";
    ctx.beginPath();
    ctx.arc(start.x, start.y, 18 + Math.sin(pulse) * 3, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  for (const taser of taserShots) {
    const start = worldToScreen(taser.originX ?? player.x, taser.originY ?? player.y);
    const end = worldToScreen(taser.x, taser.y);
    const targetPoint = taser.target ? worldToScreen(taser.target.x, taser.target.y) : end;
    const wireAngle = Math.atan2(end.y - start.y, end.x - start.x);
    const wireLength = Math.hypot(end.x - start.x, end.y - start.y);
    const pulse = performance.now() * 0.018 + (taser.seed ?? 0);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.shadowColor = "#fff3b0";
    ctx.shadowBlur = 30;
    const muzzlePulse = 1 + Math.sin(pulse * 1.45) * 0.16;
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = "rgba(255, 243, 176, 0.45)";
    ctx.beginPath();
    ctx.arc(start.x, start.y, 18 * muzzlePulse, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.84;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3.8;
    ctx.beginPath();
    ctx.moveTo(start.x - Math.cos(wireAngle) * 8, start.y - Math.sin(wireAngle) * 8);
    ctx.lineTo(start.x + Math.cos(wireAngle) * 30, start.y + Math.sin(wireAngle) * 30);
    ctx.stroke();

    for (let strand = -2; strand <= 2; strand += 1) {
      ctx.beginPath();
      for (let i = 0; i <= 13; i += 1) {
        const t = i / 13;
        const jitter = Math.sin(pulse + i * 1.65 + strand * 0.7) * 9 + Math.cos(pulse * 0.72 + i * 2.15) * 5;
        const sideOffset = strand === 0 ? jitter * 0.35 : strand * 6 + jitter;
        const x = start.x + Math.cos(wireAngle) * wireLength * t + Math.cos(wireAngle + Math.PI / 2) * sideOffset;
        const y = start.y + Math.sin(wireAngle) * wireLength * t + Math.sin(wireAngle + Math.PI / 2) * sideOffset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.shadowColor = strand === 0 ? "#ffffff" : "#80ffdb";
      ctx.shadowBlur = strand === 0 ? 34 : 22;
      ctx.strokeStyle =
        strand === 0 ? "rgba(255, 255, 255, 0.98)" : strand % 2 ? "rgba(128, 255, 219, 0.88)" : "rgba(255, 243, 176, 0.9)";
      ctx.lineWidth = strand === 0 ? 5.8 : 3.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    for (let i = 0; i < 11; i += 1) {
      const t = (i + 0.5) / 11;
      const x = start.x + (end.x - start.x) * t + Math.sin(pulse + i) * 8;
      const y = start.y + (end.y - start.y) * t + Math.cos(pulse * 0.8 + i) * 8;
      ctx.globalAlpha = 0.48 + Math.sin(pulse + i) * 0.18;
      ctx.strokeStyle = i % 2 ? "#fff3b0" : "#80ffdb";
      ctx.lineWidth = i % 3 === 0 ? 3.8 : 2.4;
      ctx.beginPath();
      ctx.moveTo(x - 11, y);
      ctx.lineTo(x + 1, y - 7);
      ctx.lineTo(x - 2, y + 7);
      ctx.lineTo(x + 12, y);
      ctx.stroke();
    }

    const impactPulse = 1 + Math.sin(pulse * 1.7) * 0.18;
    ctx.globalAlpha = 0.74;
    ctx.shadowColor = "#80ffdb";
    ctx.shadowBlur = 34;
    ctx.strokeStyle = "#80ffdb";
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.arc(targetPoint.x, targetPoint.y, 28 * impactPulse, 0, TAU);
    ctx.stroke();
    ctx.strokeStyle = "#fff3b0";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(targetPoint.x, targetPoint.y, 42 + Math.sin(pulse) * 5, pulse, pulse + Math.PI * 1.35);
    ctx.stroke();
    for (let i = 0; i < 8; i += 1) {
      const a = pulse * 0.8 + (TAU * i) / 8;
      const inner = 18 + Math.sin(pulse + i) * 3;
      const outer = 48 + Math.cos(pulse * 1.3 + i) * 8;
      ctx.strokeStyle = i % 2 ? "#ffffff" : "#fff3b0";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(targetPoint.x + Math.cos(a) * inner, targetPoint.y + Math.sin(a) * inner);
      ctx.lineTo(targetPoint.x + Math.cos(a) * outer, targetPoint.y + Math.sin(a) * outer);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    for (const point of taser.trail) {
      const trailPoint = worldToScreen(point.x, point.y);
      ctx.globalAlpha = clamp(point.life / 0.18, 0, 1) * 0.96;
      ctx.fillStyle = "#fff3b0";
      ctx.beginPath();
      ctx.arc(trailPoint.x, trailPoint.y, 10.5, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(trailPoint.x, trailPoint.y, 18, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const p = worldToScreen(taser.x, taser.y);
    const angle = Math.atan2(taser.vy, taser.vx);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    ctx.shadowColor = "#fff3b0";
    ctx.shadowBlur = 50;
    ctx.strokeStyle = "#fff3b0";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-24, 0);
    ctx.lineTo(17, 0);
    ctx.stroke();
    ctx.strokeStyle = "#80ffdb";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-24, -10);
    ctx.lineTo(-13, 3);
    ctx.lineTo(0, -8);
    ctx.lineTo(14, 7);
    ctx.stroke();
    ctx.fillStyle = "#f9c74f";
    ctx.beginPath();
    ctx.moveTo(24, 0);
    ctx.lineTo(1, -15);
    ctx.lineTo(7, 0);
    ctx.lineTo(1, 15);
    ctx.closePath();
    ctx.fill();
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

}

function drawPoliceSquads() {
  for (const squad of policeSquads) {
    if (squad.kind === "comradeDrop") {
      drawComradeDropSquad(squad);
      continue;
    }
    if (squad.kind === "pacemakerWave") {
      drawPacemakerMedalSquad(squad);
      continue;
    }
    const fade = clamp(squad.life / 0.7, 0, 1);
    const progress = 1 - squad.life / squad.maxLife;
    for (const officerInfo of squad.officers) {
      const officer = getPoliceOfficerPosition(squad, officerInfo);
      const p = worldToScreen(officer.x, officer.y);
      const step = Math.sin(officerInfo.bob + player.elapsed * 9 + squad.distance * 0.05);
      ctx.save();
      ctx.translate(p.x, p.y);
      const allyImage = squad.visual === "pacemaker" ? pacemakerRunnerImage : subwayPoliceImage;
      const allyGlow = squad.visual === "pacemaker" ? "#7fc8ff" : "#77beff";
      if (canDrawGameImage(allyImage)) {
        const facing = Math.cos(officer.angle) >= 0 ? 1 : -1;
        drawAllyCutout(allyImage, {
          height: squad.visual === "pacemaker" ? 82 * (officerInfo.scale ?? 1) : 96,
          facing,
          naturalFacing: squad.visual === "pacemaker" ? 1 : -1,
          alpha: fade,
          glow: allyGlow,
          bob: officerInfo.bob,
          recoil: Math.abs(Math.sin(progress * Math.PI * 6)),
        });
        ctx.restore();
        continue;
      }
      ctx.rotate(officer.angle);
      ctx.scale(1.5, 1.5);
      ctx.globalAlpha = fade;
      ctx.shadowColor = "#77beff";
      ctx.shadowBlur = 13;
      ctx.fillStyle = "rgba(119, 190, 255, 0.16)";
      ctx.beginPath();
      ctx.ellipse(0, 10, 24, 13, 0, 0, TAU);
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1b4f9c";
      roundedRect(-11, -14, 22, 28, 7);
      ctx.fill();
      ctx.strokeStyle = "#b8dcff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#f1c9a4";
      ctx.beginPath();
      ctx.arc(0, -25, 9, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#183f7a";
      roundedRect(-10, -34, 20, 8, 4);
      ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(-3, -36, 6, 3);

      ctx.strokeStyle = "#0b234a";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-7, 13);
      ctx.lineTo(-12, 23 + step * 3);
      ctx.moveTo(7, 13);
      ctx.lineTo(12, 23 - step * 3);
      ctx.stroke();

      ctx.strokeStyle = "#2a1608";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(11, -4);
      ctx.lineTo(28 + Math.sin(progress * Math.PI * 6) * 8, -13);
      ctx.stroke();
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, -6);
      ctx.lineTo(26, -11);
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 7px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("POL", 0, -3);
      ctx.restore();
    }
  }
}

function drawPacemakerRunnerCutout({ scale = 1, facing = 1, alpha = 1, bob = 0, accent = "#9fd3ff" } = {}) {
  const imageReady = canDrawGameImage(pacemakerRunnerImage);
  const spriteHeight = 74 * scale;
  const spriteWidth = imageReady ? spriteHeight * (pacemakerRunnerImage.naturalWidth / pacemakerRunnerImage.naturalHeight) : 34 * scale;
  const step = Math.sin(bob + player.elapsed * 15);
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.scale(facing, 1);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, spriteHeight * 0.33, spriteWidth * 0.34, 4.5 * scale, 0, 0, TAU);
  ctx.fill();

  if (imageReady) {
    ctx.drawImage(pacemakerRunnerImage, -spriteWidth / 2, -spriteHeight * 0.62, spriteWidth, spriteHeight);
  } else {
    ctx.fillStyle = "#d5aa82";
    ctx.beginPath();
    ctx.arc(0, -24 * scale, 8 * scale, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#d8ff21";
    roundedRect(-9 * scale, -15 * scale, 18 * scale, 28 * scale, 6 * scale);
    ctx.fill();
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = 4 * scale;
    ctx.beginPath();
    ctx.moveTo(-6 * scale, 13 * scale);
    ctx.lineTo(-15 * scale, (25 - step * 4) * scale);
    ctx.moveTo(6 * scale, 13 * scale);
    ctx.lineTo(17 * scale, (24 + step * 4) * scale);
    ctx.stroke();
  }
  ctx.restore();
}

function drawAllyCutout(image, { height = 68, facing = 1, naturalFacing = 1, alpha = 1, glow = "#b8dcff", bob = 0, recoil = 0, label = "" } = {}) {
  const imageReady = canDrawGameImage(image);
  const spriteHeight = height;
  const spriteWidth = imageReady ? spriteHeight * (image.naturalWidth / image.naturalHeight) : spriteHeight * 0.46;
  const step = Math.sin(bob + player.elapsed * 10);
  const directionScale = facing * naturalFacing;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  ctx.ellipse(0, spriteHeight * 0.34, spriteWidth * 0.34, 4.4, 0, 0, TAU);
  ctx.fill();
  ctx.scale(directionScale, 1);
  if (imageReady) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = 10;
    ctx.drawImage(image, -spriteWidth / 2, -spriteHeight * 0.64 + step * 0.4, spriteWidth, spriteHeight);
    ctx.shadowBlur = 0;
  } else {
    ctx.fillStyle = glow;
    roundedRect(-10, -18, 20, 34, 6);
    ctx.fill();
  }
  if (recoil > 0.18) {
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = "rgba(255, 243, 176, 0.82)";
    ctx.beginPath();
    ctx.moveTo(spriteWidth * 0.5, -spriteHeight * 0.24);
    ctx.lineTo(spriteWidth * 0.68, -spriteHeight * 0.31);
    ctx.lineTo(spriteWidth * 0.62, -spriteHeight * 0.19);
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
  if (label) {
    ctx.scale(directionScale, 1);
    ctx.fillStyle = "#f8f9fa";
    ctx.font = "900 7px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 0, -3);
  }
  ctx.restore();
}

function drawPacemakerMedalSquad(squad) {
  const sortedRunners = [...squad.runners].sort((a, b) => a.y - b.y);
  for (const runnerInfo of sortedRunners) {
    const runner = getPacemakerRunnerPosition(squad, runnerInfo);
    if (runner.rawProgress < -0.05 || runner.rawProgress > 1.05) continue;
    const p = worldToScreen(runner.x, runner.y);
    const fadeIn = clamp((runner.rawProgress + 0.05) / 0.12, 0, 1);
    const fadeOut = clamp((1.05 - runner.rawProgress) / 0.12, 0, 1);
    const alpha = Math.min(fadeIn, fadeOut);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.translate(0, Math.sin(runnerInfo.bob + player.elapsed * 10) * 2);
    drawPacemakerRunnerCutout({
      scale: 0.7 * runnerInfo.scale,
      facing: squad.passIndex === 0 ? 1 : -1,
      alpha,
      bob: runnerInfo.bob,
      accent: "#7fc8ff",
    });

    ctx.restore();
  }
}

function drawComradeDropSquad(squad) {
  const fade = clamp(squad.life / 0.7, 0, 1);
  const elapsed = squad.maxLife - squad.life;
  const sorted = [...squad.comrades].sort((a, b) => a.y - b.y);
  for (const comrade of sorted) {
    const p = worldToScreen(comrade.x, comrade.y);
    const dropProgress = clamp((elapsed - comrade.dropDelay) / COMRADE_DROP_DESCENT_TIME, 0, 1);
    const parachuteY = -46 - (1 - dropProgress) * 18;
    const step = Math.sin(comrade.bob + player.elapsed * 9);
    const recoil = clamp(comrade.attackCooldown < 0.08 ? 1 - comrade.attackCooldown / 0.08 : 0, 0, 1);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(comrade.facing);
    ctx.globalAlpha = fade;
    if (canDrawGameImage(reserveSoldierImage)) {
      if (dropProgress < 1 || !comrade.landed) {
        ctx.save();
        ctx.rotate(-comrade.facing);
        ctx.shadowColor = "#b7ef64";
        ctx.shadowBlur = 9;
        ctx.fillStyle = "rgba(183, 239, 100, 0.82)";
        ctx.strokeStyle = "#f8f9fa";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, parachuteY, 22, Math.PI, TAU);
        ctx.lineTo(22, parachuteY);
        ctx.quadraticCurveTo(0, parachuteY + 10, -22, parachuteY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(248, 249, 250, 0.78)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-16, parachuteY + 4);
        ctx.lineTo(-6, -27);
        ctx.moveTo(16, parachuteY + 4);
        ctx.lineTo(6, -27);
        ctx.stroke();
        ctx.restore();
      }
      ctx.rotate(-comrade.facing);
      drawAllyCutout(reserveSoldierImage, {
        height: 72,
        facing: Math.cos(comrade.facing) >= 0 ? 1 : -1,
        naturalFacing: 1,
        alpha: 1,
        glow: "#b7ef64",
        bob: comrade.bob,
        recoil,
        label: RESERVE_LABEL,
      });
      ctx.restore();
      continue;
    }
    ctx.scale(0.78, 0.78);

    if (dropProgress < 1 || !comrade.landed) {
      ctx.save();
      ctx.rotate(-comrade.facing);
      ctx.shadowColor = "#b7ef64";
      ctx.shadowBlur = 9;
      ctx.fillStyle = "rgba(183, 239, 100, 0.82)";
      ctx.strokeStyle = "#f8f9fa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, parachuteY, 22, Math.PI, TAU);
      ctx.lineTo(22, parachuteY);
      ctx.quadraticCurveTo(0, parachuteY + 10, -22, parachuteY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(248, 249, 250, 0.78)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-16, parachuteY + 4);
      ctx.lineTo(-6, -27);
      ctx.moveTo(16, parachuteY + 4);
      ctx.lineTo(6, -27);
      ctx.stroke();
      ctx.restore();
    }

    ctx.shadowColor = "#b7ef64";
    ctx.shadowBlur = 8;
    ctx.fillStyle = "rgba(183, 239, 100, 0.14)";
    ctx.beginPath();
    ctx.ellipse(0, 13, 21, 10, 0, 0, TAU);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#435240";
    roundedRect(-10, -14, 20, 29, 6);
    ctx.fill();
    ctx.strokeStyle = "#b7ef64";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#d2a982";
    ctx.beginPath();
    ctx.arc(0, -25, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#4b5737";
    roundedRect(-10, -35, 20, 9, 4);
    ctx.fill();
    ctx.fillStyle = "#2f3929";
    ctx.fillRect(-4, -39, 8, 5);

    ctx.strokeStyle = "#263022";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, 13);
    ctx.lineTo(-11, 23 + step * 2);
    ctx.moveTo(7, 13);
    ctx.lineTo(11, 23 - step * 2);
    ctx.stroke();

    ctx.strokeStyle = "#151918";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(5, -8);
    ctx.lineTo(27 - recoil * 5, -9);
    ctx.stroke();
    ctx.strokeStyle = "#b7ef64";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18 - recoil * 5, -12);
    ctx.lineTo(31 - recoil * 5, -12);
    ctx.stroke();
    if (recoil > 0.2) {
      ctx.fillStyle = "rgba(255, 243, 176, 0.75)";
      ctx.beginPath();
      ctx.moveTo(33, -12);
      ctx.lineTo(43, -16);
      ctx.lineTo(39, -9);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#f8f9fa";
    ctx.font = "900 7px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("예비군", 0, -3);
    ctx.restore();
  }
}

function drawStationPolicePets() {
  if (isComradeHero()) {
    drawComradePets();
    return;
  }
  if (isRunnerCompanionHero()) {
    drawRunnerCompanionPets();
    return;
  }
  const sortedPets = [...stationPolicePets].sort((a, b) => a.y - b.y);
  for (const pet of sortedPets) {
    const p = worldToScreen(pet.x, pet.y);
    const step = Math.sin(pet.bob + player.elapsed * 10);
    const swing = clamp(pet.swingTimer / 0.22, 0, 1);
    const batonAngle = -0.55 + Math.sin((1 - swing) * Math.PI) * 1.2;
    ctx.save();
    ctx.translate(p.x, p.y);
    if (canDrawGameImage(subwayPoliceImage)) {
      const facing = Math.cos(pet.facing) >= 0 ? 1 : -1;
      const recoil = clamp(pet.swingTimer / 0.22, 0, 1);
      drawAllyCutout(subwayPoliceImage, {
        height: 92,
        facing,
        naturalFacing: -1,
        alpha: 1,
        glow: "#77beff",
        bob: pet.bob,
        recoil,
      });
      if (recoil > 0.18) {
        ctx.globalAlpha = 0.52 * recoil;
        ctx.strokeStyle = "#b8dcff";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(facing * 22, 0, 18 + recoil * 18, -0.72, 0.72);
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }
    ctx.rotate(pet.facing);
    ctx.scale(1.22, 1.22);
    ctx.shadowColor = "#77beff";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "rgba(119, 190, 255, 0.18)";
    ctx.beginPath();
    ctx.ellipse(0, 12, 23, 12, 0, 0, TAU);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#123f84";
    roundedRect(-10, -14, 20, 28, 7);
    ctx.fill();
    ctx.strokeStyle = "#b8dcff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f1c9a4";
    ctx.beginPath();
    ctx.arc(0, -25, 9, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#183f7a";
    roundedRect(-10, -34, 20, 8, 4);
    ctx.fill();
    ctx.fillStyle = "#ffd166";
    ctx.fillRect(-3, -36, 6, 3);

    ctx.strokeStyle = "#0b234a";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, 13);
    ctx.lineTo(-12, 23 + step * 3);
    ctx.moveTo(7, 13);
    ctx.lineTo(12, 23 - step * 3);
    ctx.stroke();

    ctx.save();
    ctx.rotate(batonAngle);
    ctx.strokeStyle = "#2a1608";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(10, -2);
    ctx.lineTo(31, -15);
    ctx.stroke();
    ctx.strokeStyle = "#ffd166";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, -5);
    ctx.lineTo(28, -13);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 7px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("泥좉꼍", 0, -3);
    ctx.restore();
  }
}

function drawComradePets() {
  const sortedPets = [...stationPolicePets].sort((a, b) => a.y - b.y);
  for (const pet of sortedPets) {
    const p = worldToScreen(pet.x, pet.y);
    const step = Math.sin(pet.bob + player.elapsed * 9);
    const recoil = clamp(pet.swingTimer / 0.16, 0, 1);
    ctx.save();
    ctx.translate(p.x, p.y);
    if (canDrawGameImage(reserveSoldierImage)) {
      const facing = Math.cos(pet.facing) >= 0 ? 1 : -1;
      drawAllyCutout(reserveSoldierImage, {
        height: 76,
        facing,
        naturalFacing: 1,
        alpha: 1,
        glow: "#9fd3ff",
        bob: pet.bob,
        recoil,
        label: "예비군",
      });
      ctx.restore();
      continue;
    }
    ctx.rotate(pet.facing);
    ctx.scale(1.05, 1.05);
    ctx.shadowColor = "#9fd3ff";
    ctx.shadowBlur = 9;
    ctx.fillStyle = "rgba(159, 211, 255, 0.14)";
    ctx.beginPath();
    ctx.ellipse(0, 12, 22, 11, 0, 0, TAU);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#435240";
    roundedRect(-10, -14, 20, 29, 6);
    ctx.fill();
    ctx.strokeStyle = "#9fb57a";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#6f7a4a";
    roundedRect(-12, -19, 24, 9, 4);
    ctx.fill();
    ctx.fillStyle = "#d2a982";
    ctx.beginPath();
    ctx.arc(0, -25, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#4b5737";
    roundedRect(-10, -35, 20, 9, 4);
    ctx.fill();
    ctx.fillStyle = "#2f3929";
    ctx.fillRect(-4, -39, 8, 5);

    ctx.strokeStyle = "#263022";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-7, 13);
    ctx.lineTo(-11, 23 + step * 2);
    ctx.moveTo(7, 13);
    ctx.lineTo(11, 23 - step * 2);
    ctx.stroke();

    ctx.strokeStyle = "#151918";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(5, -8);
    ctx.lineTo(27 - recoil * 5, -9);
    ctx.stroke();
    ctx.strokeStyle = "#9fb57a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18 - recoil * 5, -12);
    ctx.lineTo(31 - recoil * 5, -12);
    ctx.stroke();
    if (recoil > 0.2) {
      ctx.fillStyle = "rgba(255, 243, 176, 0.75)";
      ctx.beginPath();
      ctx.moveTo(33, -12);
      ctx.lineTo(43, -16);
      ctx.lineTo(39, -9);
      ctx.closePath();
      ctx.fill();
    }

    ctx.fillStyle = "#f8f9fa";
    ctx.font = "900 7px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("예비군", 0, -3);
    ctx.restore();
  }
}

function drawRunnerCompanionPets() {
  const sortedPets = [...stationPolicePets].sort((a, b) => a.y - b.y);
  for (const pet of sortedPets) {
    const p = worldToScreen(pet.x, pet.y);
    const step = Math.sin(pet.bob + player.elapsed * 12);
    const impact = clamp(pet.swingTimer / 0.24, 0, 1);
    ctx.save();
    ctx.translate(p.x, p.y);
    if (isRunnerCompanionHero() && canDrawGameImage(pacemakerRunnerImage)) {
      const facing = Math.cos(pet.facing) >= 0 ? 1 : -1;
      ctx.translate(0, Math.sin(pet.bob + player.elapsed * 10) * 2);
      ctx.scale(1 + impact * 0.08, 1 + impact * 0.04);
      drawPacemakerRunnerCutout({
        scale: 0.82,
        facing,
        alpha: 1,
        bob: pet.bob,
        accent: "#9fd3ff",
      });
      ctx.restore();
      continue;
    }
    ctx.rotate(pet.facing);
    ctx.scale(1.03 + impact * 0.08, 1.03);
    ctx.shadowColor = "#9fd3ff";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "rgba(159, 211, 255, 0.16)";
    ctx.beginPath();
    ctx.ellipse(0, 13, 23, 10, 0, 0, TAU);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#f8f9fa";
    roundedRect(-9, -15, 18, 28, 6);
    ctx.fill();
    ctx.strokeStyle = "#2f78c4";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#2f78c4";
    roundedRect(-7, -11, 14, 11, 4);
    ctx.fill();
    ctx.fillStyle = "#d9f2ff";
    ctx.fillRect(-2, -12, 4, 24);

    ctx.fillStyle = "#d2a982";
    ctx.beginPath();
    ctx.arc(0, -25, 8, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    roundedRect(-10, -34, 20, 7, 4);
    ctx.fill();
    ctx.strokeStyle = "#2f78c4";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-9, -30);
    ctx.lineTo(-17, -29);
    ctx.stroke();

    ctx.strokeStyle = "#d2a982";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-8, -6);
    ctx.lineTo(-16, 4 + step * 2);
    ctx.moveTo(8, -6);
    ctx.lineTo(19 + impact * 7, -10);
    ctx.stroke();

    ctx.strokeStyle = "#172033";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(-6, 12);
    ctx.lineTo(-13, 24 - step * 3);
    ctx.moveTo(6, 12);
    ctx.lineTo(16, 23 + step * 3);
    ctx.stroke();

    if (impact > 0.18) {
      ctx.globalAlpha = 0.55 * impact;
      ctx.strokeStyle = "#9fd3ff";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(18, 0, 18 + impact * 18, -0.72, 0.72);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#f8f9fa";
    ctx.font = "900 7px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?섎찓", 0, -3);
    ctx.restore();
  }
}

function drawOrbs() {
  for (const orb of orbs) {
    const p = worldToScreen(orb.x, orb.y);
    const fade = clamp(orb.life / XP_ORB_FADE_TIME, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.2 * fade;
    ctx.fillStyle = "#64dfdf";
    ctx.shadowColor = "#64dfdf";
    ctx.shadowBlur = 2 * fade;
    ctx.beginPath();
    ctx.arc(p.x, p.y, orb.radius, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.08 * fade;
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
    if (pickup.kind === "radio") {
      ctx.shadowColor = "#77beff";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#102a55";
      ctx.strokeStyle = "#b8dcff";
      ctx.lineWidth = 2.5;
      roundedRect(-size * 0.82, -size * 1.05, size * 1.64, size * 2.1, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#b8dcff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size * 0.18, -size * 1.05);
      ctx.lineTo(size * 0.68, -size * 1.82);
      ctx.stroke();
      ctx.fillStyle = "#77beff";
      ctx.beginPath();
      ctx.arc(0, -size * 0.34, size * 0.22, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#eaf5ff";
      ctx.font = `900 ${Math.max(7, size * 0.58)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("P", 0, size * 0.42);
      ctx.shadowBlur = 0;
      ctx.restore();
      continue;
    }
    if (pickup.kind === "taser") {
      ctx.shadowColor = "#fff3b0";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#1f2933";
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 2.5;
      roundedRect(-size * 1.0, -size * 0.45, size * 1.55, size * 0.9, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff3b0";
      ctx.fillRect(size * 0.42, -size * 0.18, size * 0.7, size * 0.36);
      ctx.fillStyle = "#f9c74f";
      ctx.beginPath();
      ctx.moveTo(-size * 0.28, -size * 0.95);
      ctx.lineTo(size * 0.08, -size * 0.15);
      ctx.lineTo(-size * 0.1, -size * 0.15);
      ctx.lineTo(size * 0.22, size * 0.84);
      ctx.lineTo(-size * 0.38, -size * 0.02);
      ctx.lineTo(-size * 0.16, -size * 0.02);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.restore();
      continue;
    }
    if (pickup.kind === "chicken") {
      if (isTankRadioHero()) {
        ctx.shadowColor = "#ffd166";
        ctx.shadowBlur = 20;
        ctx.fillStyle = "#2a312b";
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        roundedRect(-size * 0.48, -size * 0.48, size * 0.86, size * 1.05, size * 0.16);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#fff3b0";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(size * 0.18, -size * 0.58);
        ctx.lineTo(size * 0.52, -size * 0.92);
        ctx.stroke();
        ctx.fillStyle = "#9ad7a8";
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        roundedRect(-size * 0.28, -size * 0.3, size * 0.5, size * 0.24, size * 0.06);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#101512";
        for (let i = 0; i < 3; i += 1) {
          ctx.fillRect(-size * 0.25, size * (0.02 + i * 0.16), size * 0.5, size * 0.045);
        }
        ctx.shadowBlur = 0;
        ctx.restore();
        continue;
      }
      ctx.shadowColor = "#ffd166";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#fff7d6";
      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.95, size * 0.58, -0.22, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.ellipse(-size * 0.18, -size * 0.05, size * 0.55, size * 0.22, -0.25, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.68;
      ctx.beginPath();
      ctx.ellipse(size * 0.25, -size * 0.22, size * 0.22, size * 0.08, -0.3, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#4a2800";
      ctx.font = `900 ${Math.max(7, size * 0.52)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("P", 0, size * 0.02);
      ctx.shadowBlur = 0;
      ctx.restore();
      continue;
    }
    if (pickup.kind === "stim") {
      ctx.shadowColor = "#ff6b6b";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffe3e3";
      ctx.strokeStyle = "#c92a2a";
      ctx.lineWidth = 2.5;
      ctx.rotate(-0.5);
      roundedRect(-size * 0.88, -size * 0.2, size * 1.45, size * 0.42, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(-size * 0.42, -size * 0.15, size * 0.68, size * 0.3);
      ctx.strokeStyle = "#fff5f5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(size * 0.56, 0);
      ctx.lineTo(size * 1.06, 0);
      ctx.stroke();
      ctx.fillStyle = "#c92a2a";
      ctx.font = `900 ${Math.max(7, size * 0.5)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("S", -size * 0.12, size * 0.02);
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
      const trainLength = zone.trainLength ?? 520;
      const trainWidth = zone.width;
      const travel = zone.vertical ? height + trainLength * 1.35 : width + trainLength * 1.35;
      const moveProgress = clamp((progress - 0.04) / 0.92, 0, 1);
      const offset = -trainLength * 0.68 + travel * moveProgress;
      const centerX = zone.vertical ? p.x : zone.direction > 0 ? offset : width - offset;
      const centerY = zone.vertical ? (zone.direction > 0 ? offset : height - offset) : p.y;
      const fade = Math.min(clamp(progress / 0.18, 0, 1), clamp((1 - progress) / 0.16, 0, 1));

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(zone.vertical ? Math.PI / 2 : 0);
      if (zone.direction < 0) ctx.rotate(Math.PI);
      ctx.globalAlpha = 0.96 * fade;
      ctx.shadowColor = "#f7d64a";
      ctx.shadowBlur = 18;

      const carX = -trainLength / 2;
      const carY = -trainWidth / 2;
      ctx.fillStyle = "#dfe7ec";
      ctx.strokeStyle = "#0b2c45";
      ctx.lineWidth = 4;
      roundedRect(carX, carY, trainLength, trainWidth, 18);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0052a4";
      ctx.fillRect(carX + 14, carY + trainWidth * 0.58, trainLength - 28, trainWidth * 0.12);
      ctx.fillStyle = "#f7d64a";
      ctx.fillRect(carX + 14, carY + trainWidth * 0.72, trainLength - 28, trainWidth * 0.05);

      const cabinWidth = trainWidth * 0.5;
      ctx.fillStyle = "#142533";
      roundedRect(carX + 22, carY + 13, cabinWidth, trainWidth - 26, 10);
      ctx.fill();
      ctx.fillStyle = "#1e3b52";
      const windowCount = Math.max(5, Math.floor(trainLength / 86));
      const gap = (trainLength - cabinWidth - 72) / windowCount;
      for (let i = 0; i < windowCount; i += 1) {
        const wx = carX + cabinWidth + 38 + i * gap;
        roundedRect(wx, carY + 14, Math.max(26, gap * 0.58), trainWidth * 0.34, 7);
        ctx.fill();
      }

      ctx.fillStyle = "#fff3b0";
      ctx.font = `900 ${Math.max(12, trainWidth * 0.16)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EXPRESS", carX + trainLength * 0.52, carY + trainWidth * 0.52);

      ctx.fillStyle = "#ff477e";
      ctx.beginPath();
      ctx.arc(carX + trainLength - 26, carY + trainWidth * 0.3, 5, 0, TAU);
      ctx.arc(carX + trainLength - 26, carY + trainWidth * 0.7, 5, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.restore();
      continue;
    }

    if (zone.kind === "tankBlast") {
      const blastProgress = clamp(progress, 0, 1);
      const fade = clamp((1 - blastProgress) / 0.8, 0, 1);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.78 * fade;
      ctx.shadowColor = "#ff2d2d";
      ctx.shadowBlur = 34;
      const blastGrad = ctx.createRadialGradient(0, 0, zone.radius * 0.08, 0, 0, zone.radius);
      blastGrad.addColorStop(0, "rgba(255, 245, 220, 0.94)");
      blastGrad.addColorStop(0.22, "rgba(255, 45, 45, 0.66)");
      blastGrad.addColorStop(0.62, "rgba(170, 0, 0, 0.34)");
      blastGrad.addColorStop(1, "rgba(255, 0, 0, 0)");
      ctx.fillStyle = blastGrad;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.42 + blastProgress * 0.72), 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 80, 80, 0.88)";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.34 + blastProgress * 0.8), 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.38 * fade;
      ctx.fillStyle = "#2f2a1f";
      for (let i = 0; i < 10; i += 1) {
        const a = (TAU * i) / 10 + zone.x * 0.001;
        const d = zone.radius * (0.18 + blastProgress * (0.45 + (i % 3) * 0.08));
        ctx.beginPath();
        ctx.arc(Math.cos(a) * d, Math.sin(a) * d, 9 + (i % 4) * 3, 0, TAU);
        ctx.fill();
      }
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
        ctx.fillText("誘쇱썝", 0, 0);
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
      ctx.restore();
      continue;
    }

    if (zone.kind === "gate") {
      const angle = zone.angle ?? 0;
      const sideAngle = angle + Math.PI / 2;
      const openProgress = Math.min(clamp(progress / 0.84, 0, 1), clamp((1 - progress) / 0.32, 0, 1));
      const flash = Math.sin(Math.min(1, progress / 0.84) * Math.PI);
      const doorWidth = zone.radius * 1.28;
      const doorHeight = zone.radius * 1.5;
      const panelWidth = doorWidth * 0.5;
      const panelGap = openProgress * doorWidth * 0.44;
      const startP = worldToScreen(zone.startX ?? zone.x, zone.startY ?? zone.y);
      const endP = worldToScreen(zone.endX ?? zone.x, zone.endY ?? zone.y);
      const pathLength = zone.pathLength ?? Math.hypot(endP.x - startP.x, endP.y - startP.y);

      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 + flash * 0.2;
      ctx.strokeStyle = "#b197fc";
      ctx.lineWidth = zone.radius * 1.35;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startP.x, startP.y);
      ctx.lineTo(endP.x, endP.y);
      ctx.stroke();
      ctx.globalAlpha = 0.64;
      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(startP.x, startP.y);
      ctx.lineTo(endP.x, endP.y);
      ctx.stroke();
      ctx.globalAlpha = 0.18 + flash * 0.18;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.setLineDash([18, 16]);
      for (const lane of [-1.25, -0.65, 0, 0.65, 1.25]) {
        const laneOffset = lane * zone.radius * 0.86;
        ctx.beginPath();
        ctx.moveTo(startP.x + Math.cos(sideAngle) * laneOffset, startP.y + Math.sin(sideAngle) * laneOffset);
        ctx.lineTo(endP.x + Math.cos(sideAngle) * laneOffset, endP.y + Math.sin(sideAngle) * laneOffset);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.save();
      ctx.translate(startP.x, startP.y);
      ctx.rotate(angle);

      ctx.globalAlpha = 0.82 + flash * 0.16;
      ctx.shadowColor = "#80ffdb";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "rgba(8, 18, 24, 0.86)";
      roundedRect(-doorWidth / 2, -doorHeight / 2, doorWidth, doorHeight, 14);
      ctx.fill();
      ctx.fillStyle = "rgba(128, 255, 219, 0.18)";
      roundedRect(-doorWidth / 2 + 7, -doorHeight / 2 + 7, doorWidth - 14, doorHeight - 14, 10);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 7;
      roundedRect(-doorWidth / 2, -doorHeight / 2, doorWidth, doorHeight, 14);
      ctx.stroke();

      ctx.fillStyle = "#fff3b0";
      ctx.font = `900 ${Math.max(11, zone.radius * 0.15)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("TRANSFER", 0, -doorHeight * 0.42);
      ctx.fillStyle = openProgress > 0.62 ? "#36d399" : "#ff477e";
      ctx.beginPath();
      ctx.arc(-doorWidth * 0.34, -doorHeight * 0.31, 5, 0, TAU);
      ctx.arc(doorWidth * 0.34, -doorHeight * 0.31, 5, 0, TAU);
      ctx.fill();

      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgba(11, 20, 26, 0.88)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 3;
      roundedRect(-doorWidth / 2 - panelGap, -doorHeight / 2 + 7, panelWidth, doorHeight - 14, 8);
      ctx.fill();
      ctx.stroke();
      roundedRect(panelGap, -doorHeight / 2 + 7, panelWidth, doorHeight - 14, 8);
      ctx.fill();
      ctx.stroke();

      ctx.globalAlpha = 0.42 + openProgress * 0.42;
      ctx.fillStyle = "rgba(255, 243, 176, 0.28)";
      ctx.fillRect(-panelGap, -doorHeight * 0.42, panelGap * 2, doorHeight * 0.84);

      ctx.globalAlpha = 0.55;
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
        const t = clamp((progress - commuter.delay) / (commuter.duration ?? 0.62), 0, 1);
        if (t <= 0 || t >= 1) continue;
        const fade = Math.sin(t * Math.PI);
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const lane = commuter.lane * zone.radius * 0.95;
        const x = startP.x + Math.cos(angle) * pathLength * ease + Math.cos(sideAngle) * lane;
        const y = startP.y + Math.sin(angle) * pathLength * ease + Math.sin(sideAngle) * lane;
        const size = commuter.size ?? 24;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.globalAlpha = fade * 0.92;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.strokeStyle = "rgba(128, 255, 219, 0.26)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-size * 2.1, size * 0.18);
        ctx.lineTo(-size * 0.72, size * 0.18);
        ctx.moveTo(-size * 2.35, -size * 0.28);
        ctx.lineTo(-size * 1.02, -size * 0.28);
        ctx.moveTo(-size * 1.85, size * 0.62);
        ctx.lineTo(-size * 0.88, size * 0.62);
        ctx.stroke();

        ctx.globalAlpha = fade * 0.18;
        ctx.fillStyle = commuter.coat ?? "#f8f9fa";
        ctx.beginPath();
        ctx.ellipse(-size * 0.25, size * 0.12, size * 0.86, size * 1.32, 0, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = fade * 0.92;

        ctx.shadowColor = "#80ffdb";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#ffd6a5";
        ctx.beginPath();
        ctx.arc(0, -size * 0.96, size * 0.38, 0, TAU);
        ctx.fill();

        ctx.shadowBlur = 7;
        ctx.fillStyle = commuter.coat ?? "#f8f9fa";
        roundedRect(-size * 0.44, -size * 0.58, size * 0.88, size * 1.28, size * 0.22);
        ctx.fill();
        ctx.strokeStyle = "rgba(5, 8, 12, 0.66)";
        ctx.lineWidth = 1.8;
        roundedRect(-size * 0.44, -size * 0.58, size * 0.88, size * 1.28, size * 0.22);
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#1d3557";
        ctx.lineWidth = Math.max(3, size * 0.15);
        ctx.beginPath();
        ctx.moveTo(-size * 0.2, size * 0.66);
        ctx.lineTo(-size * 0.42, size * 1.34);
        ctx.moveTo(size * 0.16, size * 0.66);
        ctx.lineTo(size * 0.43, size * 1.34);
        ctx.stroke();

        ctx.fillStyle = commuter.bag ?? "#7b2cbf";
        roundedRect(size * 0.32, -size * 0.2, size * 0.42, size * 0.62, size * 0.12);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(size * 0.32, -size * 0.1, size * 0.24, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(5, 8, 12, 0.86)";
        ctx.beginPath();
        ctx.arc(-size * 0.13, -size * 1.04, size * 0.045, 0, TAU);
        ctx.arc(size * 0.13, -size * 1.04, size * 0.045, 0, TAU);
        ctx.fill();
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

    if (zone.kind === "dansoSoundwave") {
      const wave = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.18 + wave * 0.34;
      ctx.fillStyle = "rgba(255, 243, 176, 0.18)";
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.75 + wave * 0.3), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.86;
      ctx.strokeStyle = "#fff3b0";
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i += 1) {
        ctx.beginPath();
        ctx.arc(0, 0, zone.radius * (0.42 + i * 0.28 + progress * 0.16), -0.7, 0.7);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#f9c74f";
      ctx.font = "900 18px system-ui";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("♪", 0, 1);
      ctx.restore();
      continue;
    }

    if (zone.kind === "dansoThrow" || zone.kind === "dansoBoomerang") {
      if (zone.trail?.length > 1) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255, 243, 176, 0.28)";
        ctx.lineWidth = Math.max(3, zone.radius * 0.08);
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let i = 0; i < zone.trail.length; i += 1) {
          const trailPoint = worldToScreen(zone.trail[i].x, zone.trail[i].y);
          if (i === 0) ctx.moveTo(trailPoint.x, trailPoint.y);
          else ctx.lineTo(trailPoint.x, trailPoint.y);
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.translate(p.x, p.y);
      ctx.rotate(zone.angle + progress * 18);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "rgba(249, 199, 79, 0.22)";
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * 1.08, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 0.96;
      ctx.strokeStyle = "#8d5524";
      ctx.lineWidth = Math.max(7, zone.radius * 0.17);
      ctx.lineCap = "round";
      const stickLength = Math.max(82, zone.radius * 1.92);
      ctx.beginPath();
      ctx.moveTo(-stickLength / 2, 0);
      ctx.lineTo(stickLength / 2, 0);
      ctx.stroke();
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = Math.max(2, zone.radius * 0.045);
      ctx.beginPath();
      ctx.moveTo(-stickLength * 0.42, -zone.radius * 0.06);
      ctx.lineTo(stickLength * 0.42, -zone.radius * 0.06);
      ctx.stroke();
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
      const billWidth = zone.radius * 2.8;
      const billHeight = zone.radius * 1.55;
      ctx.globalAlpha = 0.95;
      ctx.shadowColor = "#fff3b0";
      ctx.shadowBlur = 12;
      ctx.fillStyle = "#7cffc7";
      ctx.strokeStyle = "#ffe066";
      ctx.lineWidth = 4;
      roundedRect(-billWidth / 2, -billHeight / 2, billWidth, billHeight, 7);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#0b6b5e";
      ctx.lineWidth = 2;
      roundedRect(-billWidth * 0.34, -billHeight * 0.28, billWidth * 0.68, billHeight * 0.56, 4);
      ctx.stroke();
      ctx.fillStyle = "#0b6b5e";
      ctx.font = `1000 ${Math.round(zone.radius * 0.9)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 0, 1);
      ctx.restore();
      continue;
    }

    if (zone.kind === "gumBubble" || zone.kind === "giantGumBubble") {
      const isGiant = zone.kind === "giantGumBubble";
      const shine = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "rgba(255, 143, 171, 0.62)";
      ctx.strokeStyle = "#ffc2d1";
      ctx.lineWidth = isGiant ? 5 : 3;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * (0.9 + shine * 0.08), 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.globalAlpha = isGiant ? 0.95 : 0.85;
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      ctx.beginPath();
      ctx.arc(-zone.radius * 0.28, -zone.radius * 0.28, zone.radius * (isGiant ? 0.2 : 0.18), 0, TAU);
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
      ctx.fillText("?몟", 0, 0);
      ctx.restore();
      continue;
    }

    if (zone.kind === "praiseWave") {
      const wave = Math.sin(progress * Math.PI);
      ctx.translate(p.x, p.y);
      ctx.rotate(Math.atan2(zone.vy ?? 0, zone.vx ?? 1));
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.2 + wave * 0.34;
      ctx.fillStyle = "rgba(199, 125, 255, 0.2)";
      ctx.beginPath();
      ctx.ellipse(0, 0, zone.radius * 1.35, zone.radius * 0.78, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#e0aaff";
      ctx.lineWidth = 5;
      for (let i = 0; i < 3; i += 1) {
        ctx.globalAlpha = Math.max(0.18, 0.8 - i * 0.18 - progress * 0.24);
        ctx.beginPath();
        ctx.arc(-zone.radius * 0.2 + i * zone.radius * 0.34, 0, zone.radius * (0.42 + i * 0.18), -0.86, 0.86);
        ctx.stroke();
      }
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#fff3b0";
      ctx.font = `900 ${Math.round(zone.radius * 0.42)}px system-ui`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("!", zone.radius * 0.3, 0);
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
      ctx.fillText("?곕?", 34, -55);
      ctx.restore();
      continue;
    }

    if (zone.kind === "jarvanSpear" || zone.kind === "dansoStab") {
      const isDansoStab = zone.kind === "dansoStab";
      const thrust = Math.sin(progress * Math.PI);
      const reachProgress = clamp(Math.pow(clamp(progress * 1.08, 0, 1), 1.45), 0.04, 1);
      const reach = zone.length * reachProgress;
      ctx.translate(p.x, p.y);
      ctx.rotate(zone.angle);
      ctx.globalCompositeOperation = "lighter";
      if (isDansoStab) {
        const bodyWidth = 14;
        ctx.globalAlpha = 0.12 + thrust * 0.22;
        ctx.fillStyle = "rgba(249, 199, 79, 0.18)";
        roundedRect(8, -bodyWidth * 0.78, reach, bodyWidth * 1.56, 16);
        ctx.fill();

        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.98;
        const grad = ctx.createLinearGradient(0, -bodyWidth / 2, 0, bodyWidth / 2);
        grad.addColorStop(0, "#f1c56b");
        grad.addColorStop(0.5, "#9b5f24");
        grad.addColorStop(1, "#4f2c12");
        ctx.fillStyle = grad;
        roundedRect(12, -bodyWidth / 2, Math.max(24, reach - 8), bodyWidth, 14);
        ctx.fill();
        ctx.strokeStyle = "#2a1608";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#1b1209";
        const holeStart = Math.max(46, reach * 0.18);
        const holeGap = Math.max(34, Math.min(54, reach / 9));
        for (let i = 0; i < 7; i += 1) {
          const hx = holeStart + i * holeGap;
          if (hx > reach - 38) break;
          ctx.beginPath();
          ctx.ellipse(hx, -bodyWidth * 0.12, 2.4, 3.2, 0, 0, TAU);
          ctx.fill();
        }

        ctx.strokeStyle = "#ffe6a3";
        ctx.lineWidth = 2.4;
        for (const bandX of [32, reach * 0.34, reach * 0.62, Math.max(44, reach - 24)]) {
          ctx.beginPath();
          ctx.moveTo(bandX, -bodyWidth * 0.42);
          ctx.lineTo(bandX, bodyWidth * 0.42);
          ctx.stroke();
        }

        ctx.fillStyle = "#6b3f1d";
        roundedRect(0, -13, 22, 26, 8);
        ctx.fill();
        ctx.fillStyle = "#f1c9a4";
        ctx.beginPath();
        ctx.arc(-9, 0, 10, 0, TAU);
        ctx.fill();

        ctx.fillStyle = "#f1c56b";
        ctx.strokeStyle = "#2a1608";
        ctx.lineWidth = 1.8;
        roundedRect(Math.max(14, reach - 6), -bodyWidth * 0.5, bodyWidth * 0.72, bodyWidth, bodyWidth * 0.5);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.18 + thrust * 0.35;
        ctx.fillStyle = "rgba(255, 224, 102, 0.16)";
        roundedRect(12, -zone.width / 2, reach, zone.width, 18);
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 0.98;
        const bladeWidth = 26;
        const bladeStart = 34;
        const bladeLength = Math.max(54, reach - bladeStart);
        const bladeGradient = ctx.createLinearGradient(bladeStart, -bladeWidth / 2, bladeStart, bladeWidth / 2);
        bladeGradient.addColorStop(0, "#fff8dc");
        bladeGradient.addColorStop(0.22, "#f7d36b");
        bladeGradient.addColorStop(0.5, "#d4af37");
        bladeGradient.addColorStop(0.78, "#fff4bd");
        bladeGradient.addColorStop(1, "#8c6b18");
        ctx.fillStyle = bladeGradient;
        ctx.beginPath();
        ctx.moveTo(bladeStart, -bladeWidth * 0.55);
        ctx.lineTo(bladeStart + bladeLength - 26, -bladeWidth * 0.36);
        ctx.lineTo(bladeStart + bladeLength + 28, 0);
        ctx.lineTo(bladeStart + bladeLength - 26, bladeWidth * 0.36);
        ctx.lineTo(bladeStart, bladeWidth * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#4a2c08";
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bladeStart + 12, -bladeWidth * 0.2);
        ctx.lineTo(bladeStart + bladeLength - 8, -bladeWidth * 0.1);
        ctx.stroke();
        ctx.fillStyle = "#5c3508";
        roundedRect(0, -13, 36, 26, 8);
        ctx.fill();
        ctx.fillStyle = "#ffd166";
        ctx.strokeStyle = "#4a2c08";
        ctx.lineWidth = 2;
        roundedRect(22, -24, 13, 48, 5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#6f4518";
        ctx.beginPath();
        ctx.arc(1, 0, 10, 0, TAU);
        ctx.fill();
      }
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

    if (zone.kind === "jarvanFlyingSpear") {
      ctx.translate(p.x, p.y);
      ctx.rotate(zone.angle);
      ctx.scale(zone.radius / 30, zone.radius / 30);
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = "rgba(255, 224, 102, 0.22)";
      roundedRect(-42, -20, 104, 40, 18);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.98;
      const bladeGradient = ctx.createLinearGradient(-18, -13, -18, 13);
      bladeGradient.addColorStop(0, "#fff8dc");
      bladeGradient.addColorStop(0.22, "#f7d36b");
      bladeGradient.addColorStop(0.5, "#d4af37");
      bladeGradient.addColorStop(0.78, "#fff4bd");
      bladeGradient.addColorStop(1, "#8c6b18");
      ctx.fillStyle = bladeGradient;
      ctx.beginPath();
      ctx.moveTo(-16, -14);
      ctx.lineTo(38, -10);
      ctx.lineTo(68, 0);
      ctx.lineTo(38, 10);
      ctx.lineTo(-16, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#4a2c08";
      ctx.lineWidth = 2.4;
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -5);
      ctx.lineTo(44, -3);
      ctx.stroke();
      ctx.fillStyle = "#5c3508";
      roundedRect(-46, -8, 34, 16, 5);
      ctx.fill();
      ctx.fillStyle = "#ffd166";
      ctx.strokeStyle = "#4a2c08";
      ctx.lineWidth = 1.8;
      roundedRect(-18, -18, 10, 36, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#6f4518";
      ctx.beginPath();
      ctx.arc(-48, 0, 7, 0, TAU);
      ctx.fill();
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
      ctx.restore();
      continue;
    }

    if (zone.kind === "announcementWave") {
      const pulse = Math.sin(progress * Math.PI);
      const fade = Math.max(0, 1 - progress);
      const baseRadius = zone.radius * (0.28 + progress * 0.82);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.translate(p.x, p.y);

      ctx.globalAlpha = 0.1 + pulse * 0.2;
      const glow = ctx.createRadialGradient(0, 0, zone.radius * 0.08, 0, 0, zone.radius * 0.92);
      glow.addColorStop(0, "rgba(128, 255, 219, 0.34)");
      glow.addColorStop(0.48, "rgba(67, 170, 255, 0.16)");
      glow.addColorStop(1, "rgba(67, 170, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, zone.radius * 0.92, 0, TAU);
      ctx.fill();

      for (let i = 0; i < 4; i += 1) {
        const ringProgress = (progress + i * 0.16) % 1;
        const ringRadius = zone.radius * (0.18 + ringProgress * 0.88);
        ctx.globalAlpha = Math.max(0, 0.48 - ringProgress * 0.42);
        ctx.strokeStyle = i % 2 === 0 ? "#80ffdb" : "#64dfdf";
        ctx.lineWidth = Math.max(3, 9 - i * 1.4);
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, TAU);
        ctx.stroke();
      }

      ctx.globalAlpha = 0.5 * fade;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.4;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.arc(0, 0, baseRadius * 1.04, 0, TAU);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.globalAlpha = 0.56 + pulse * 0.3;
      ctx.strokeStyle = "#b8fff2";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      for (let i = 0; i < 10; i += 1) {
        const angle = (TAU / 10) * i + progress * 0.9;
        const inner = zone.radius * 0.3;
        const outer = zone.radius * (0.64 + pulse * 0.16);
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner);
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 0.96;
      ctx.fillStyle = "rgba(8, 20, 26, 0.88)";
      ctx.strokeStyle = "#80ffdb";
      ctx.lineWidth = 3;
      roundedRect(-25, -19, 28, 38, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#80ffdb";
      ctx.beginPath();
      ctx.moveTo(2, -13);
      ctx.lineTo(28, -24);
      ctx.lineTo(28, 24);
      ctx.lineTo(2, 13);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i += 1) {
        ctx.globalAlpha = 0.38 + pulse * 0.22;
        ctx.beginPath();
        ctx.arc(26, 0, 22 + i * 14 + pulse * 5, -0.72, 0.72);
        ctx.stroke();
      }

      ctx.restore();
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

function drawSkillAnnouncement() {
  if (!skillAnnouncement || game.state !== "playing") return;
  const progress = 1 - skillAnnouncement.life / skillAnnouncement.maxLife;
  const alpha = clamp(Math.sin(progress * Math.PI) * 1.18, 0, 1);
  const pop = 0.92 + Math.sin(clamp(progress * 1.25, 0, 1) * Math.PI) * 0.16;
  const y = Math.max(108, height * 0.21);
  const text = skillAnnouncement.text;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.translate(width / 2, y);
  ctx.scale(pop, pop);
  ctx.font = "900 25px system-ui";
  const textWidth = Math.min(width - 38, ctx.measureText(text).width + 52);
  const boxHeight = 46;
  const glow = 0.4 + Math.sin(performance.now() * 0.012 + skillAnnouncement.seed) * 0.12;
  ctx.shadowColor = skillAnnouncement.color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = `rgba(8, 12, 18, ${0.58 + glow * 0.16})`;
  ctx.strokeStyle = skillAnnouncement.color;
  ctx.lineWidth = 2.4;
  roundedRect(-textWidth / 2, -boxHeight / 2, textWidth, boxHeight, 14);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 20;
  ctx.fillStyle = skillAnnouncement.color;
  ctx.fillText(text, 0, 1);
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = "900 12px system-ui";
  ctx.fillText("SKILL", 0, -31);
  ctx.restore();
}

function render() {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.shadowBlur = 0;
  ctx.setLineDash([]);
  ctx.clearRect(0, 0, width, height);

  updateViewSize();
  const targetCameraX = player.x - viewWidth / 2;
  const targetCameraY = player.y - viewHeight / 2;
  camera.x += (targetCameraX - camera.x) * 0.12;
  camera.y += (targetCameraY - camera.y) * 0.12;
  camera.x = clamp(camera.x, 0, WORLD_SIZE - viewWidth);
  camera.y = clamp(camera.y, 0, WORLD_SIZE - viewHeight);

  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.scale(FIXED_VIEW_SCALE, FIXED_VIEW_SCALE);
  ctx.translate(-viewWidth / 2, -viewHeight / 2);
  drawGrid();
  drawWorldBounds();
  drawDamageZones();
  drawOrbs();
  drawEnergyPickups();
  drawProjectiles();
  drawPoliceSquads();
  drawStationPolicePets();
  for (const enemy of enemies) drawEnemy(enemy);
  drawBlades();
  drawPlayer();
  drawEffects();
  ctx.restore();
  drawSkillAnnouncement();

  if (game.state === "menu") {
    ctx.fillStyle = "rgba(5,7,8,0.16)";
    ctx.fillRect(0, 0, width, height);
  }
}

function frame(now) {
  const delta = Math.min(0.035, (now - lastFrame) / 1000 || 0);
  lastFrame = now;
  update(delta);
  updateBgm();
  render();
  requestAnimationFrame(frame);
}

function shouldIgnoreMovePointer(event) {
  if (game.state !== "playing" || game.paused) return true;
  if (input.touchId !== null && input.pointers.size < 1) return true;
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

function rememberPointer(event) {
  input.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
}

window.addEventListener("resize", resize);
new ResizeObserver(resize).observe(refs.app);
window.addEventListener("keydown", (event) => {
  if (event.code === "KeyH") {
    useFirstAidKit();
    return;
  }
  if (event.code === "KeyP") {
    usePoliceCall();
    return;
  }
  if (event.code === "KeyT") {
    useTaserGun();
    return;
  }
  if (event.code === "KeyC") {
    useChickenBreast();
    return;
  }
  if (event.code === "KeyV") {
    useStimPack();
    return;
  }
  keys.add(event.code);
});
window.addEventListener("keyup", (event) => keys.delete(event.code));

refs.startButton.addEventListener("click", resetGame);
refs.leaderboardOpenButton?.addEventListener("click", showStartLeaderboard);
refs.firstAidButton?.addEventListener("click", useFirstAidKit);
refs.policeButton?.addEventListener("click", usePoliceCall);
refs.taserButton?.addEventListener("click", useTaserGun);
refs.chickenButton?.addEventListener("click", useChickenBreast);
refs.stimButton?.addEventListener("click", useStimPack);
refs.pauseButton?.addEventListener("click", togglePause);
refs.upgradePauseButton?.addEventListener("click", toggleUpgradePause);
refs.rankForm?.addEventListener("submit", submitLeaderboardEntry);

refs.app.addEventListener("pointerdown", (event) => {
  if (shouldIgnoreMovePointer(event)) return;
  event.preventDefault();
  rememberPointer(event);
  if (input.pointers.size >= 2) {
    event.preventDefault();
    resetFloatingStickMove();
    return;
  }
  input.touchId = event.pointerId;
  refs.app.setPointerCapture?.(event.pointerId);
  positionFloatingStick(event.clientX, event.clientY);
  setFloatingStickMove(event.clientX, event.clientY);
});

refs.app.addEventListener("pointermove", (event) => {
  if (input.pointers.has(event.pointerId)) {
    rememberPointer(event);
    if (input.pointers.size >= 2) {
      event.preventDefault();
      return;
    }
  }
  if (input.touchId !== event.pointerId) return;
  event.preventDefault();
  setFloatingStickMove(event.clientX, event.clientY);
});

refs.app.addEventListener("pointerup", (event) => {
  if (input.touchId === event.pointerId) resetFloatingStickMove();
  input.pointers.delete(event.pointerId);
});

refs.app.addEventListener("pointercancel", (event) => {
  if (input.touchId === event.pointerId) resetFloatingStickMove();
  input.pointers.delete(event.pointerId);
});

refs.app.addEventListener(
  "wheel",
  (event) => {
    event.preventDefault();
  },
  { passive: false },
);

resize();
renderCodex();
loadLeaderboard().catch(() => {
  if (refs.rankHint) refs.rankHint.textContent = "Loading ranking";
});
const previewMode = new URLSearchParams(window.location.search).get("preview");
if (["pacemaker", "reserve", "police"].includes(previewMode)) {
  setupAllyPreview(previewMode);
}
updateHud();
requestAnimationFrame(frame);

