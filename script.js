const app = document.getElementById("app");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const shuffleBtn = document.getElementById("shuffle");
const repeatBtn = document.getElementById("repeat");
const likeBtn = document.getElementById("like");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progress-container");
const currentTimeEl = document.getElementById("current-time");
const remainingTimeEl = document.getElementById("remaining-time");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const cover = document.getElementById("cover");
const songList = document.getElementById("song-list");

// file = nome do mp3, image = nome da capa (sem extensão)
const songs = [
  { title: "The Last of Us", artist: "Gustavo Santaolalla", file: "The Last of Us", image: "The Last of Us" },
  { title: "Snake Eater", artist: "MGS 3", file: "MGS 3 - Snake Eater", image: "MGS 3 - Snake Eater" },
  { title: "Photograph", artist: "Ed Sheeran", file: "Ed Sheeran-Photograph", image: "Ed Sheeran-Photograph" },
  { title: "The Crossing", artist: "Ben Ottewell", file: "Ben Ottewell-The Crossing", image: "BenOttewell-The Crossing" },
  { title: "Days Gone", artist: "Trilha sonora", file: "DaysGoneTrilha", image: "DaysGoneTrilha" },
  { title: "Stand By Me", artist: "Florence + The Machine", file: "FlorenceThe Machine-StandByMe", image: "Florence-StandByMe" },
  { title: "I'll Keep Coming", artist: "Low Roar", file: "LowRoar - I'll KeepComing", image: "LowRoar - I'll KeepComing" },
  { title: "Sins of the Father", artist: "MGS V", file: "MGS V-Sins of the Father", image: "MGS V-Sins of the Father" },
  { title: "Waiting For You", artist: "Silent Hill 4", file: "SilentHill 4-WaitingForYou", image: "SilentHill4-Waiting For You" },
  { title: "Silent Hill Theme", artist: "Silent Hill", file: "SilentHill-Theme", image: "SilentHill-Theme" },
  { title: "I See Fire", artist: "Ed Sheeran", file: "Ed Sheeran-I See Fire", image: "Ed Sheeran-I See Fire" },
  { title: "I'll Take Everything", artist: "James Blunt", file: "James Blunt-I'll Take Everything", image: "James Blunt-I'll Take Everything" },
  { title: "Same Mistake", artist: "James Blunt", file: "James Blunt-Same Mistake", image: "James Blunt-Same Mistake" },
  { title: "You", artist: "James Blunt", file: "James Blunt-You", image: "James Blunt-You" },
  { title: "Geralt of Rivia", artist: "The Witcher", file: "The Witcher-GeraltofRivia", image: "The Witcher-GeraltofRivia" },
  { title: "Alegria", artist: "Louvor", file: "Alegria", image: "Alegria" },
  { title: "Amor", artist: "Louvor", file: "Amor", image: "Amor" },
  { title: "Benignidade", artist: "Louvor", file: "Benignidade", image: "Benignidade" },
  { title: "Bondade", artist: "Louvor", file: "Bondade", image: "Bondade" },
  { title: "Carta Filadélfia", artist: "Louvor", file: "CartaFiladélfia", image: "CartaFiladelfia" },
  { title: "O Poder de Um Nome", artist: "Louvor", file: "OPoderdeUmNome", image: "OPoderdeUmNome" },
  { title: "Paz", artist: "Louvor", file: "Paz", image: "Paz" },
  { title: "Paz (Instrumental)", artist: "Louvor", file: "PazInstrumental", image: "PazInstrumental" },
];

const BG_COUNT = 30;
const bgLayers = [document.getElementById("bg-a"), document.getElementById("bg-b")];
let bgActive = 0;
let bgCurrent = -1;

// Troca o fundo por uma paisagem aleatória (diferente da atual) com crossfade
function changeBackground() {
  let next;
  do {
    next = Math.floor(Math.random() * BG_COUNT) + 1;
  } while (next === bgCurrent && BG_COUNT > 1);
  bgCurrent = next;
  const url = `images/bg/bg${String(next).padStart(2, "0")}.jpg`;
  const img = new Image();
  img.onload = () => {
    if (bgCurrent !== next) return;
    const incoming = bgLayers[1 - bgActive];
    const outgoing = bgLayers[bgActive];
    incoming.style.backgroundImage = `url("${url}")`;
    incoming.classList.add("active");
    outgoing.classList.remove("active");
    bgActive = 1 - bgActive;
  };
  img.src = url;
}

let songIndex = 0;
let shuffle = false;
let repeat = false;
const liked = new Set(JSON.parse(localStorage.getItem("liked") || "[]"));

const isPlaying = () => app.classList.contains("playing");

function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function loadSong(index) {
  const song = songs[index];
  title.innerText = song.title;
  artist.innerText = song.artist;
  audio.src = encodeURI(`music/${song.file}.mp3`);
  cover.src = encodeURI(`images/${song.image}.jpg`);
  progress.style.width = "0%";
  currentTimeEl.innerText = "0:00";
  remainingTimeEl.innerText = "-0:00";
  updateLikeUI();
  renderList();
  changeBackground();
  animateChange();
  updateMediaSession();
}

function playSong() {
  app.classList.add("playing");
  playBtn.querySelector("i").className = "fa fa-pause";
  setupAnalyser();
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  audio.play().catch(() => {});
  setPlaybackState("playing");
  startVisualizer();
  renderList();
}

function pauseSong() {
  app.classList.remove("playing");
  playBtn.querySelector("i").className = "fa fa-play";
  audio.pause();
  setPlaybackState("paused");
  renderList();
}

function prevSong() {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  loadSong(songIndex);
  playSong();
}

function nextSong() {
  if (shuffle && songs.length > 1) {
    let next;
    do {
      next = Math.floor(Math.random() * songs.length);
    } while (next === songIndex);
    songIndex = next;
  } else {
    songIndex = (songIndex + 1) % songs.length;
  }
  loadSong(songIndex);
  playSong();
}

function updateProgress() {
  const { duration, currentTime } = audio;
  if (!duration) return;
  progress.style.width = `${(currentTime / duration) * 100}%`;
  currentTimeEl.innerText = formatTime(currentTime);
  remainingTimeEl.innerText = `-${formatTime(duration - currentTime)}`;
  updatePositionState();
}

function setProgress(e) {
  if (!audio.duration) return;
  const rect = progressContainer.getBoundingClientRect();
  audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
}

function toggleLike(index) {
  liked.has(index) ? liked.delete(index) : liked.add(index);
  localStorage.setItem("liked", JSON.stringify([...liked]));
  updateLikeUI();
  renderList();
}

function updateLikeUI() {
  likeBtn.classList.toggle("liked", liked.has(songIndex));
}

function renderList() {
  songList.innerHTML = "";
  songs.forEach((song, i) => {
    const current = i === songIndex;
    const li = document.createElement("li");
    li.className = "song-item" + (current ? " current" : "");
    li.innerHTML = `
      <div class="info">
        <span class="name"></span>
        <span class="by"></span>
      </div>
      <div class="btns">
        <button class="round-btn play-item" aria-label="Tocar">
          <i class="fa ${current && isPlaying() ? "fa-pause" : "fa-play"}"></i>
        </button>
        <button class="round-btn like-item ${liked.has(i) ? "liked" : ""}" aria-label="Favoritar">
          <i class="fa fa-heart"></i>
        </button>
      </div>`;
    li.querySelector(".name").innerText = song.title;
    li.querySelector(".by").innerText = song.artist;

    const play = () => {
      if (current) {
        isPlaying() ? pauseSong() : playSong();
      } else {
        songIndex = i;
        loadSong(i);
        playSong();
      }
    };
    li.querySelector(".info").addEventListener("click", play);
    li.querySelector(".play-item").addEventListener("click", play);
    li.querySelector(".like-item").addEventListener("click", () => toggleLike(i));
    songList.appendChild(li);
  });
}

// ---------- Animação ao trocar de música ----------
function animateChange() {
  [cover, document.querySelector(".track-text")].forEach((el) => {
    el.classList.remove("swap");
    void el.offsetWidth; // reinicia a animação
    el.classList.add("swap");
  });
}

// ---------- Cor de destaque extraída da capa ----------
const DEFAULT_ACCENT = [255, 45, 120];

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function hslToCss(h, s, l) {
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

function extractAccent() {
  const size = 48;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d", { willReadFrequently: true });
  g.drawImage(cover, 0, 0, size, size);
  const { data } = g.getImageData(0, 0, size, size);

  // 12 faixas de matiz; cada pixel vale mais quanto mais vivo for
  const buckets = Array.from({ length: 12 }, () => ({ w: 0, h: 0, s: 0 }));
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const weight = s * s * (1 - Math.abs(l - 0.5) * 1.6);
    if (weight <= 0) continue;
    const b = buckets[Math.floor(h / 30) % 12];
    b.w += weight;
    b.s += s * weight;
    b.h += h * weight;
  }
  const best = buckets.reduce((a, b) => (b.w > a.w ? b : a));
  if (best.w < 1) return null; // capa sem cor (preto e branco)
  return [best.h / best.w, Math.max(best.s / best.w, 0.65)];
}

function applyAccent() {
  let color = null;
  try {
    color = extractAccent();
  } catch (e) {
    // canvas bloqueado (ex.: aberto via file://) — usa a cor padrão
  }
  const root = document.documentElement.style;
  if (!color) {
    root.setProperty("--accent", "#ff2d78");
    root.setProperty("--accent-light", "#ff5aa5");
    accentCss = "#ff2d78";
    return;
  }
  const [h, s] = color;
  accentCss = hslToCss(h, s, 0.58);
  root.setProperty("--accent", accentCss);
  root.setProperty("--accent-light", hslToCss(h, s, 0.7));
}

let accentCss = "#ff2d78";
cover.addEventListener("load", applyAccent);
cover.addEventListener("error", () => {
  document.documentElement.style.removeProperty("--accent");
  document.documentElement.style.removeProperty("--accent-light");
  accentCss = "#ff2d78";
});

// ---------- Visualizador de áudio (Web Audio API) ----------
const canvas = document.getElementById("visualizer");
const ctx2d = canvas.getContext("2d");
const BARS_PER_SIDE = 16;
const levels = new Array(BARS_PER_SIDE * 2).fill(0);
let audioCtx = null;
let analyser = null;
let freqData = null;
let vizRunning = false;

function setupAnalyser() {
  // Via file:// o áudio é tratado como cross-origin e ficaria mudo
  if (analyser || location.protocol === "file:") return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AC();
    const source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    freqData = new Uint8Array(analyser.frequencyBinCount);
  } catch (e) {
    analyser = null;
  }
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawVisualizer(time) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * (window.devicePixelRatio || 1))) resizeCanvas();
  const playing = isPlaying();
  if (analyser && playing) analyser.getByteFrequencyData(freqData);

  const total = levels.length;
  const gap = 4;
  const barW = (w - gap * (total - 1)) / total;
  ctx2d.clearRect(0, 0, w, h);
  ctx2d.fillStyle = accentCss;

  let peak = 0;
  for (let i = 0; i < total; i++) {
    // espelhado: graves no centro, agudos nas pontas
    const dist = i < BARS_PER_SIDE ? BARS_PER_SIDE - 1 - i : i - BARS_PER_SIDE;
    let target = 0.04;
    if (playing) {
      target = analyser
        ? Math.pow(freqData[dist * 2] / 255, 1.3)
        : 0.25 + 0.2 * Math.sin(time / 180 + dist * 0.7); // sem analisador
    }
    levels[i] += (target - levels[i]) * 0.3;
    peak = Math.max(peak, levels[i]);

    const bh = Math.max(4, levels[i] * h);
    const x = i * (barW + gap);
    const y = (h - bh) / 2;
    ctx2d.globalAlpha = 0.45 + Math.min(levels[i], 1) * 0.55;
    ctx2d.beginPath();
    ctx2d.roundRect(x, y, barW, bh, barW / 2);
    ctx2d.fill();
  }
  ctx2d.globalAlpha = 1;

  // Continua enquanto toca ou até as barras assentarem
  if (playing || peak > 0.06) {
    requestAnimationFrame(drawVisualizer);
  } else {
    vizRunning = false;
  }
}

function startVisualizer() {
  if (vizRunning) return;
  vizRunning = true;
  requestAnimationFrame(drawVisualizer);
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
requestAnimationFrame(drawVisualizer); // desenha as barras em repouso

// ---------- Media Session (tela de bloqueio / teclas multimídia) ----------
function setPlaybackState(state) {
  if ("mediaSession" in navigator) navigator.mediaSession.playbackState = state;
}

function updateMediaSession() {
  if (!("mediaSession" in navigator)) return;
  const song = songs[songIndex];
  const artwork = new URL(cover.getAttribute("src"), location.href).href;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song.title,
    artist: song.artist,
    album: "Music Player",
    artwork: [{ src: artwork, sizes: "512x512", type: "image/jpeg" }],
  });
}

function updatePositionState() {
  if (!("mediaSession" in navigator) || !isFinite(audio.duration)) return;
  try {
    navigator.mediaSession.setPositionState({
      duration: audio.duration,
      playbackRate: audio.playbackRate,
      position: Math.min(audio.currentTime, audio.duration),
    });
  } catch (e) {
    // posição inválida durante a troca de faixa
  }
}

function seekBy(seconds) {
  if (!audio.duration) return;
  audio.currentTime = Math.min(Math.max(audio.currentTime + seconds, 0), audio.duration);
}

if ("mediaSession" in navigator) {
  const actions = {
    play: playSong,
    pause: pauseSong,
    previoustrack: prevSong,
    nexttrack: nextSong,
    seekbackward: () => seekBy(-10),
    seekforward: () => seekBy(10),
    seekto: (d) => {
      audio.currentTime = d.seekTime;
    },
  };
  Object.entries(actions).forEach(([name, fn]) => {
    try {
      navigator.mediaSession.setActionHandler(name, fn);
    } catch (e) {
      // ação não suportada neste navegador
    }
  });
}

// ---------- Atalhos de teclado ----------
// Espaço: play/pause · ← →: -5s/+5s · Shift+← →: anterior/próxima · M: mutar
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  switch (e.code) {
    case "Space":
      e.preventDefault();
      isPlaying() ? pauseSong() : playSong();
      break;
    case "ArrowRight":
      e.preventDefault();
      e.shiftKey ? nextSong() : seekBy(5);
      break;
    case "ArrowLeft":
      e.preventDefault();
      e.shiftKey ? prevSong() : seekBy(-5);
      break;
    case "KeyM":
      audio.muted = !audio.muted;
      break;
  }
});
// Evita que o espaço também "clique" no botão focado (Firefox ativa no keyup)
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") e.preventDefault();
});

playBtn.addEventListener("click", () => (isPlaying() ? pauseSong() : playSong()));
prevBtn.addEventListener("click", prevSong);
nextBtn.addEventListener("click", nextSong);
likeBtn.addEventListener("click", () => toggleLike(songIndex));
shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleBtn.classList.toggle("active", shuffle);
});
repeatBtn.addEventListener("click", () => {
  repeat = !repeat;
  repeatBtn.classList.toggle("active", repeat);
});

document.getElementById("show-list").addEventListener("click", () => app.classList.add("show-list"));
document.getElementById("show-player").addEventListener("click", () => app.classList.remove("show-list"));

audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("loadedmetadata", updateProgress);
progressContainer.addEventListener("click", setProgress);
audio.addEventListener("ended", () => {
  if (repeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextSong();
  }
});

loadSong(songIndex);
