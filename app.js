/* ==========================================================================
   Pizza Cutter Royale - Main Game Script with Multi-touch & P2P WebRTC
   ========================================================================== */

window.onerror = function(message, source, lineno, colno, error) {
  const errText = `JS ERROR: ${message}\nLine: ${lineno}:${colno}\nSource: ${source}`;
  console.error(errText);
  alert(errText);
  return false;
};

// --- 1. Sound Synthesizer (Web Audio API) ---
class SoundSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn("Web Audio API not supported or blocked:", e);
    }
  }

  playTick() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);
      
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio playTick blocked:", e);
    }
  }

  playLock() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn("Audio playLock blocked:", e);
    }
  }

  playSlice() {
    try {
      this.init();
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 0.3; // 0.3 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.3);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start();
      noise.stop(this.ctx.currentTime + 0.3);
      
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.2);
      
      oscGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      oscGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      
      osc.connect(oscGain);
      oscGain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch (e) {
      console.warn("Audio playSlice blocked:", e);
    }
  }

  playDing() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        
        gain.gain.setValueAtTime(0.08, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.2);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.2);
      });
    } catch (e) {
      console.warn("Audio playDing blocked:", e);
    }
  }

  playGameOver() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25]; // Fanfare
      const duration = [0.15, 0.15, 0.15, 0.3, 0.15, 0.15, 0.6];
      
      let time = now;
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = (idx === notes.length - 1) ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration[idx] - 0.02);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(time);
        osc.stop(time + duration[idx]);
        
        time += duration[idx];
      });
    } catch (e) {
      console.warn("Audio playGameOver blocked:", e);
    }
  }
}

const sfx = new SoundSynth();

// --- 2. Chef Characters & Pizza Types Config ---
const CHEFS = [
  { id: 'pepperoni', name: 'シェフ・ペパロニ', emoji: '👨‍🍳', desc: 'バランス型。堅実なカット。' },
  { id: 'mozzarella', name: 'マダム・モッツァレラ', emoji: '👩‍🍳', desc: '慎重派。端っこを安全に狙う。' },
  { id: 'basil', name: '青年バジル', emoji: '🧑‍🍳', desc: 'トッピング狙い。具材を逃さない。' },
  { id: 'anchovy', name: '頑固オヤジ・アンチョビ', emoji: '👴', desc: '豪快。常に大きなスライスを狙う。' },
  { id: 'pineapple', name: 'ピニャ・パイナップル', emoji: '🍍', desc: 'トリッキー。奇想天外な角度。' },
  { id: 'chili', name: '激辛チリガール', emoji: '🌶️', desc: '好戦的。他プレイヤーを邪魔するカット。' },
  { id: 'mushroom', name: 'きのこ博士', emoji: '🍄', desc: '観察眼鋭い。他人のラインを見極める。' },
  { id: 'gold', name: '皇帝ゴールド', emoji: '👑', desc: '黄金トッピングを最優先する強欲AI。' }
];

const PIZZA_TYPES = [
  {
    name: '極上マルゲリータ',
    crustColor: '#d35400',
    sauceColor: '#c0392b',
    cheeseColor: '#f1c40f',
    toppings: [
      { type: 'basil', color: '#2ecc71', score: 10, count: 8, radius: 12, label: '🍃' },
      { type: 'tomato', color: '#e74c3c', score: 15, count: 6, radius: 14, label: '🍅' },
      { type: 'mozzarella', color: '#f5f6fa', score: 5, count: 10, radius: 16, label: '⚪' },
      { type: 'tabasco', color: '#ff4757', score: -30, count: 2, radius: 15, label: '🌶️' }
    ]
  },
  {
    name: 'デラックス・ミートミックス',
    crustColor: '#a04000',
    sauceColor: '#962d22',
    cheeseColor: '#f39c12',
    toppings: [
      { type: 'pepperoni', color: '#c0392b', score: 10, count: 12, radius: 15, label: '🍕' },
      { type: 'mushroom', color: '#bdc3c7', score: 15, count: 8, radius: 13, label: '🍄' },
      { type: 'olive', color: '#2c3e50', score: 15, count: 10, radius: 8, label: '⚫' },
      { type: 'bacon', color: '#e84393', score: 25, count: 4, radius: 18, label: '🥓' },
      { type: 'tabasco', color: '#ff4757', score: -30, count: 3, radius: 15, label: '🌶️' }
    ]
  },
  {
    name: 'コズミック・ゴールド',
    crustColor: '#2c3e50',
    sauceColor: '#2f3640',
    cheeseColor: '#ffd32a',
    toppings: [
      { type: 'star_pepper', color: '#ffa502', score: 20, count: 8, radius: 14, label: '⭐' },
      { type: 'nebula_cheese', color: '#9b59b6', score: 10, count: 12, radius: 15, label: '🔮' },
      { type: 'golden_truffle', color: '#ffd700', score: 100, count: 2, radius: 20, label: '👑' },
      { type: 'tabasco', color: '#ff4757', score: -30, count: 3, radius: 15, label: '🌶️' }
    ]
  },
  {
    name: '海鮮ロワイヤル',
    crustColor: '#1a6b8a',
    sauceColor: '#0d4f6b',
    cheeseColor: '#b8e0f0',
    toppings: [
      { type: 'shrimp',   color: '#ff8c69', score: 20, count: 8,  radius: 14, label: '🍤' },
      { type: 'squid',    color: '#e8e8f0', score: 15, count: 6,  radius: 16, label: '🦑' },
      { type: 'salmon',   color: '#ff6b6b', score: 10, count: 10, radius: 13, label: '🐟' },
      { type: 'sea_urchin', color: '#f39c12', score: 50, count: 3, radius: 18, label: '🦔' },
      { type: 'wasabi',   color: '#2ecc71', score: -40, count: 2, radius: 14, label: '💚' }
    ]
  }
];

// --- 3. Geometry & Slicing Core Functions ---

function dist(p1, p2) {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

function getPolygonArea(poly) {
  let area = 0;
  const n = poly.length;
  if (n < 3) return 0;
  for (let i = 0; i < n; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % n];
    area += (p1.x * p2.y) - (p2.x * p1.y);
  }
  return Math.abs(area) * 0.5;
}

function getPolygonCentroid(poly) {
  const n = poly.length;
  if (n < 3) return { x: 0, y: 0 };
  let cx = 0, cy = 0;
  let areaSum = 0;
  for (let i = 0; i < n; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % n];
    const factor = (p1.x * p2.y - p2.x * p1.y);
    cx += (p1.x + p2.x) * factor;
    cy += (p1.y + p2.y) * factor;
    areaSum += factor;
  }
  if (Math.abs(areaSum) < 1e-5) {
    let sx = 0, sy = 0;
    poly.forEach(p => { sx += p.x; sy += p.y; });
    return { x: sx / n, y: sy / n };
  }
  const area = areaSum * 0.5;
  return {
    x: cx / (6 * area),
    y: cy / (6 * area)
  };
}

function getLineSide(p1, p2, p) {
  const val = (p2.x - p1.x) * (p.y - p1.y) - (p2.y - p1.y) * (p.x - p1.x);
  if (Math.abs(val) < 1e-7) return 0;
  return val > 0 ? 1 : -1;
}

function getIntersection(a1, a2, b1, b2) {
  const det = (a2.x - a1.x) * (b2.y - b1.y) - (a2.y - a1.y) * (b2.x - b1.x);
  if (Math.abs(det) < 1e-7) return null;

  const t = ((b1.x - a1.x) * (b2.y - b1.y) - (b1.y - a1.y) * (b2.x - b1.x)) / det;
  return {
    x: a1.x + t * (a2.x - a1.x),
    y: a1.y + t * (a2.y - a1.y)
  };
}

function slicePolygon(poly, line) {
  const n = poly.length;
  if (n < 3) return [poly];

  const p1 = line.p1;
  const p2 = line.p2;

  const sides = poly.map(p => getLineSide(p1, p2, p));

  let hasPos = false;
  let hasNeg = false;
  for (let i = 0; i < n; i++) {
    if (sides[i] > 0) hasPos = true;
    if (sides[i] < 0) hasNeg = true;
  }

  if (!hasPos || !hasNeg) {
    return [poly];
  }

  const poly1 = [];
  const poly2 = [];

  for (let i = 0; i < n; i++) {
    const current = poly[i];
    const next = poly[(i + 1) % n];
    const sideCurrent = sides[i];
    const sideNext = sides[(i + 1) % n];

    if (sideCurrent >= 0) {
      poly1.push({ x: current.x, y: current.y });
    }
    if (sideCurrent <= 0) {
      poly2.push({ x: current.x, y: current.y });
    }

    if (sideCurrent !== 0 && sideNext !== 0 && sideCurrent !== sideNext) {
      const intersect = getIntersection(current, next, p1, p2);
      if (intersect) {
        poly1.push(intersect);
        poly2.push(intersect);
      }
    }
  }

  const result = [];
  if (poly1.length >= 3 && getPolygonArea(poly1) > 10) result.push(poly1);
  if (poly2.length >= 3 && getPolygonArea(poly2) > 10) result.push(poly2);
  
  return result.length > 0 ? result : [poly];
}

function isPointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > p.y) !== (yj > p.y))
        && (p.x < (xj - xi) * (p.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}


// --- 4. Game Engine Class ---
class PizzaGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.state = 'SETUP';
    this.round = 1;
    this.maxRounds = 3;
    this.winMode = 'ROUNDS'; // 'ROUNDS' or 'SCORE'
    this.winScore = 500;
    this.roundWinner = null; // Player who triggered score-based game over
    
    this.pizzaCenter = { x: 425, y: 425 };
    this.pizzaRadius = 250;
    
    this.players = [];
    this.activePlayersCount = 8;
    
    this.pizzaSlices = [];
    this.toppings = [];
    this.particles = [];
    
    // Turn-based pick state variables
    this.pickOrder = [];
    this.pickIndex = 0;
    this.selectedSliceIndex = -1;
    
    this.timer = 10;
    this.timerInterval = null;
    
    this.keys = {};
    this.mouse = { x: 0, y: 0, isDown: false };
    
    // Multi-touch mappings
    this.activeTouches = {}; // touch.identifier -> player.id
    
    // P2P Multiplayer Networking State
    this.netMode = 'LOCAL'; // LOCAL or ONLINE
    this.netRole = null;    // 'HOST' or 'CLIENT'
    this.peer = null;
    this.connections = [];  // List of active Peer connections (Host only)
    this.hostConnection = null; // Host connection (Client only)
    this.roomId = null;
    this.myClientId = 0;    // P1 (0) by default, clients get assigned P2-P8
    
    this.lastSentAngle = 0;
    this.isTouchUser = false; // Flag to ignore mouse events once touch is detected
    this.isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    this.setupUI();
    this.bindEvents();
    this.bindNetworkEvents();
    this.bindWinConditionEvents();
    
    requestAnimationFrame((t) => this.drawLoop(t));
  }

  // --- UI & Initialization ---
  setupUI() {
    const container = document.getElementById('player-setup-cards');
    container.innerHTML = '';
    
    this.players = [];
    
    const defaultTypes = [
      'HUMAN',          // P1
      'CPU_MEDIUM',     // P2
      'CPU_MEDIUM',     // P3
      'CPU_MEDIUM',     // P4
      'CPU_EASY',       // P5
      'CPU_EASY',       // P6
      'CLOSED',         // P7
      'CLOSED'          // P8
    ];

    const colors = [
      '#ff4d4d', '#3399ff', '#ffd32a', '#0be881',
      '#af40ff', '#ff8f00', '#00d2d3', '#ff4757'
    ];

    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      const plateDistance = 380;
      
      this.players.push({
        id: i,
        name: `Player ${i + 1}`,
        type: defaultTypes[i],
        color: colors[i],
        chef: CHEFS[i % CHEFS.length],
        score: 0,
        roundScore: 0,
        platePos: {
          x: this.pizzaCenter.x + plateDistance * Math.cos(angle),
          y: this.pizzaCenter.y + plateDistance * Math.sin(angle)
        },
        plateAngle: angle,
        aimAngle: angle + Math.PI,
        isLocked: false,
        cutLine1: null,
        cutLine2: null,
        sweepDir: 1,
        sweepSpeed: 0.015 + (i * 0.002)
      });
      
      const card = document.createElement('div');
      card.className = `setup-card p${i + 1} ${defaultTypes[i] === 'CLOSED' ? 'closed' : 'active-player'}`;
      card.id = `setup-card-${i}`;
      card.innerHTML = `
        <div class="card-header">
          <span class="player-badge">P${i + 1}</span>
          <select class="type-select" data-player-id="${i}" id="type-select-${i}">
            <option value="HUMAN" ${defaultTypes[i] === 'HUMAN' ? 'selected' : ''}>人間 (Human)</option>
            <option value="CPU_EASY" ${defaultTypes[i] === 'CPU_EASY' ? 'selected' : ''}>CPU (Easy)</option>
            <option value="CPU_MEDIUM" ${defaultTypes[i] === 'CPU_MEDIUM' ? 'selected' : ''}>CPU (Medium)</option>
            <option value="CPU_HARD" ${defaultTypes[i] === 'CPU_HARD' ? 'selected' : ''}>CPU (Hard)</option>
            <option value="CLOSED" ${defaultTypes[i] === 'CLOSED' ? 'selected' : ''}>不参加 (Closed)</option>
          </select>
        </div>
        
        <div class="char-preview" id="char-preview-${i}">
          <div class="char-avatar">${this.players[i].chef.emoji}</div>
          <div class="char-details">
            <select class="char-select" data-player-id="${i}" id="char-select-${i}">
              ${CHEFS.map((chef, idx) => `<option value="${chef.id}" ${chef.id === this.players[i].chef.id ? 'selected' : ''}>${chef.name}</option>`).join('')}
            </select>
            <div class="char-desc" id="char-desc-${i}">${this.players[i].chef.desc}</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    }
  }

  bindEvents() {
    // Character select hooks
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('char-select')) {
        const pid = parseInt(e.target.dataset.playerId);
        
        // Network restriction: Clients can only modify their own slot
        if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT' && pid !== this.myClientId) {
          // Revert selection
          e.target.value = this.players[pid].chef.id;
          return;
        }

        const chef = CHEFS.find(c => c.id === e.target.value);
        this.players[pid].chef = chef;
        
        const card = document.getElementById(`setup-card-${pid}`);
        card.querySelector('.char-avatar').textContent = chef.emoji;
        document.getElementById(`char-desc-${pid}`).textContent = chef.desc;

        // Send changes to network peers
        if (this.netMode === 'ONLINE') {
          if (this.netRole === 'HOST') {
            this.broadcastLobbyState();
          } else {
            this.sendToHost({ type: 'LOBBY_UPDATE', chefId: chef.id });
          }
        }
      }
    });

    // Player type select hooks
    document.addEventListener('change', (e) => {
      if (e.target.classList.contains('type-select')) {
        const pid = parseInt(e.target.dataset.playerId);

        // Network restriction: Clients cannot change player slots
        if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT') {
          e.target.value = this.players[pid].type;
          return;
        }

        const type = e.target.value;
        this.players[pid].type = type;
        
        const card = document.getElementById(`setup-card-${pid}`);
        if (type === 'CLOSED') {
          card.className = `setup-card p${pid + 1} closed`;
        } else {
          card.className = `setup-card p${pid + 1} active-player`;
        }

        if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
          this.broadcastLobbyState();
        }
      }
    });

    document.getElementById('start-game-btn').addEventListener('click', () => {
      if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT') return;

      const activeCount = this.players.filter(p => p.type !== 'CLOSED').length;
      if (activeCount < 2) {
        alert('最低2人以上のプレイヤー（またはCPU）を参加させてください！');
        return;
      }
      sfx.init();

      if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
        this.broadcast({ type: 'GAME_START', winMode: this.winMode, winScore: this.winScore, maxRounds: this.maxRounds });
      }

      this.startGame();
    });

    document.getElementById('next-round-btn').addEventListener('click', () => {
      if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT') return;
      document.getElementById('round-summary-overlay').classList.remove('active');

      if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
        this.broadcast({ type: 'NEXT_ROUND' });
      }

      this.nextRound();
    });

    document.getElementById('restart-game-btn').addEventListener('click', () => {
      if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT') return;
      document.getElementById('game-over-overlay').classList.remove('active');

      if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
        this.broadcast({ type: 'GOTO_SETUP' });
      }

      this.resetToSetup();
    });

    // Help modal
    document.getElementById('help-btn').addEventListener('click', () => {
      document.getElementById('help-overlay').classList.add('active');
    });
    document.getElementById('help-close-btn').addEventListener('click', () => {
      document.getElementById('help-overlay').classList.remove('active');
    });
    document.getElementById('help-overlay').addEventListener('click', (e) => {
      if (e.target === document.getElementById('help-overlay')) {
        document.getElementById('help-overlay').classList.remove('active');
      }
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      const activePlayerId = (this.netMode === 'ONLINE') ? this.myClientId : null;
      
      if (this.isAimingState()) {
        this.players.forEach(p => {
          if (p.type === 'HUMAN' && (activePlayerId === null || p.id === activePlayerId)) {
            const keysDef = this.getPlayerKeys(p.id);
            if (e.code === keysDef.lock && !p.isLocked) {
              p.isLocked = true;
              sfx.playLock();
              this.createLockSpark(p.platePos);

              if (this.netMode === 'ONLINE') {
                if (this.netRole === 'CLIENT') {
                  this.sendToHost({ type: 'AIM_INPUT', angle: p.aimAngle, isLocked: true });
                } else {
                  this.broadcast({ type: 'AIM_SYNC', id: p.id, angle: p.aimAngle, isLocked: true });
                  this.checkAllReady();
                }
              } else {
                this.checkAllReady();
              }
            }
          }
        });
      }

      // Keyboard selection in Fork Pick phase
      if (this.state === 'FORK_PICK') {
        const activePicker = this.pickOrder[this.pickIndex];
        if (activePicker && activePicker.type === 'HUMAN' && (activePlayerId === null || activePicker.id === activePlayerId)) {
          const keysDef = this.getPlayerKeys(activePicker.id);
          
          if (e.code === keysDef.ccw || e.code === 'ArrowLeft') {
            this.cycleUnclaimedSlice(-1);
          } else if (e.code === keysDef.cw || e.code === 'ArrowRight') {
            this.cycleUnclaimedSlice(1);
          } else if (e.code === keysDef.lock || e.code === 'Space' || e.code === 'Enter') {
            this.confirmForkPick();
          }
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse events on canvas
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isTouchDevice || this.isTouchUser) return;
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      
      const activeId = (this.netMode === 'ONLINE') ? this.myClientId : 0;
      const p = this.players[activeId];
      
      if (p && p.type === 'HUMAN' && this.isAimingState() && !p.isLocked) {
        const angle = Math.atan2(this.mouse.y - p.platePos.y, this.mouse.x - p.platePos.x);
        const baseCenterAngle = p.plateAngle + Math.PI;
        const diff = this.angleDiff(angle, baseCenterAngle);
        if (Math.abs(diff) < 1.1) {
          p.aimAngle = angle;
          
          // Send aim changes to network Host
          if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT' && Math.abs(angle - this.lastSentAngle) > 0.01) {
            this.sendToHost({ type: 'AIM_INPUT', angle: p.aimAngle, isLocked: false });
            this.lastSentAngle = angle;
          }
        }
      }
    });

    this.canvas.addEventListener('mousedown', (e) => {
      if (this.isTouchDevice || this.isTouchUser) return;
      this.mouse.isDown = true;
      const activeId = (this.netMode === 'ONLINE') ? this.myClientId : 0;
      const p = this.players[activeId];
      
      if (this.isAimingState() && p && p.type === 'HUMAN' && !p.isLocked) {
        p.isLocked = true;
        sfx.playLock();
        this.createLockSpark(p.platePos);

        if (this.netMode === 'ONLINE') {
          if (this.netRole === 'CLIENT') {
            this.sendToHost({ type: 'AIM_INPUT', angle: p.aimAngle, isLocked: true });
          } else {
            this.broadcast({ type: 'AIM_SYNC', id: p.id, angle: p.aimAngle, isLocked: true });
            this.checkAllReady();
          }
        } else {
          this.checkAllReady();
        }
      }

      if (this.state === 'FORK_PICK') {
        const activePicker = this.pickOrder[this.pickIndex];
        const activePlayerId = (this.netMode === 'ONLINE') ? this.myClientId : null;
        
        if (activePicker && activePicker.type === 'HUMAN' && (activePlayerId === null || activePicker.id === activePlayerId)) {
          this.pizzaSlices.forEach((slice, idx) => {
            if (!slice.claimedBy && isPointInPolygon(this.mouse, slice.polygon)) {
              this.selectedSliceIndex = idx;
              this.confirmForkPick();
            }
          });
        }
      }
    });

    this.canvas.addEventListener('mouseup', () => {
      this.mouse.isDown = false;
    });

    // Touch events for mobile/tablet support
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
    this.canvas.addEventListener('touchcancel', (e) => this.handleTouchEnd(e), { passive: false });
  }

  resetToSetup() {
    this.state = 'SETUP';
    this.roundWinner = null;
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('setup-screen').classList.add('active');
    
    // Enable dropdowns if offline/host
    if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
      for (let i = 0; i < 8; i++) {
        document.getElementById(`type-select-${i}`).disabled = false;
        document.getElementById(`char-select-${i}`).disabled = false;
      }
      this.setWinConditionUIEnabled(true);
    }
  }

  // --- Step 3: P2P Network Handlers ---
  bindNetworkEvents() {
    const localTab = document.getElementById('mode-local-btn');
    const onlineTab = document.getElementById('mode-online-btn');
    const onlinePanel = document.getElementById('online-setup-panel');
    const hostBtn = document.getElementById('host-room-btn');
    const joinBtn = document.getElementById('join-room-btn');
    const statusText = document.getElementById('online-status-text');

    localTab.addEventListener('click', () => {
      localTab.classList.add('active');
      onlineTab.classList.remove('active');
      onlinePanel.style.display = 'none';
      
      this.netMode = 'LOCAL';
      this.myClientId = 0; // Reset
      statusText.textContent = 'ローカル接続モード';
      document.getElementById('start-game-btn').style.display = 'block';

      // Terminate connection
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      this.connections = [];
      this.hostConnection = null;
      this.setupUI();
    });

    onlineTab.addEventListener('click', () => {
      onlineTab.classList.add('active');
      localTab.classList.remove('active');
      onlinePanel.style.display = 'flex';
      
      this.netMode = 'ONLINE';
      statusText.textContent = 'オンライン対戦ロビーを選択中...';
    });

    hostBtn.addEventListener('click', () => {
      this.netRole = 'HOST';
      this.myClientId = 0; // Host is Player 1
      statusText.textContent = '部屋IDを作成中...';
      this.hostRoom();
    });

    joinBtn.addEventListener('click', () => {
      const roomInput = document.getElementById('join-room-id-input').value.trim();
      if (roomInput.length !== 4) {
        alert('正しい4桁の部屋IDを入力してください。');
        return;
      }
      this.netRole = 'CLIENT';
      statusText.textContent = '部屋に接続中...';
      this.joinRoom(roomInput);
    });
  }

  hostRoom() {
    this.roomId = Math.floor(1000 + Math.random() * 9000).toString();
    
    if (this.peer) this.peer.destroy();
    
    // Create connection to signaling server
    this.peer = new Peer('pizza-cutter-room-' + this.roomId);

    this.peer.on('open', (id) => {
      document.getElementById('room-id-val').textContent = this.roomId;
      document.getElementById('host-room-id-display').style.display = 'inline-block';
      document.getElementById('online-status-text').textContent = '部屋を作成完了。他のプレイヤーの接続を待っています...';
      
      // Hide client join controls
      document.getElementById('join-room-id-input').disabled = true;
      document.getElementById('join-room-btn').disabled = true;
      document.getElementById('host-room-btn').disabled = true;
    });

    this.peer.on('connection', (conn) => {
      this.handleHostConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error(err);
      if (err.type === 'unavailable-id') {
        // Regenerate ID if colliding
        this.hostRoom();
      } else {
        document.getElementById('online-status-text').textContent = 'エラー: ' + err.message;
      }
    });
  }

  joinRoom(targetRoomId) {
    if (this.peer) this.peer.destroy();
    
    this.peer = new Peer(); // Auto random peer ID

    this.peer.on('open', (id) => {
      // Connect to Host Peer ID
      const conn = this.peer.connect('pizza-cutter-room-' + targetRoomId, {
        metadata: { name: 'Player' }
      });
      
      this.hostConnection = conn;

      conn.on('open', () => {
        document.getElementById('online-status-text').textContent = 'ホストへの接続成功！同期中...';
        document.getElementById('join-room-id-input').disabled = true;
        document.getElementById('join-room-btn').disabled = true;
        document.getElementById('host-room-btn').disabled = true;
        
        // Hide start game button for clients
        document.getElementById('start-game-btn').style.display = 'none';
        
        // Disable other dropdown controls
        for (let i = 0; i < 8; i++) {
          document.getElementById(`type-select-${i}`).disabled = true;
          document.getElementById(`char-select-${i}`).disabled = true;
        }

        // Disable win condition panel (host-only setting)
        this.setWinConditionUIEnabled(false);
      });

      conn.on('data', (data) => {
        this.handleClientData(data);
      });

      conn.on('close', () => {
        alert('ホストから切断されました。');
        location.reload();
      });
    });

    this.peer.on('error', (err) => {
      console.error(err);
      document.getElementById('online-status-text').textContent = '接続エラー: 部屋が存在しないか、満員です。';
    });
  }

  handleHostConnection(conn) {
    // Check if slot available
    const activeCount = this.players.filter(p => p.type === 'HUMAN').length;
    if (this.connections.length >= 7 || activeCount >= 8) {
      conn.send({ type: 'REJECT', reason: 'Room is full' });
      conn.close();
      return;
    }

    // Find first available closed or CPU slot to assign
    let assignedId = -1;
    for (let i = 1; i < 8; i++) {
      if (this.players[i].type !== 'HUMAN') {
        assignedId = i;
        break;
      }
    }

    if (assignedId === -1) {
      conn.send({ type: 'REJECT', reason: 'No slots available' });
      conn.close();
      return;
    }

    conn.playerId = assignedId;
    this.connections.push(conn);
    
    // Convert slot to Human
    this.players[assignedId].type = 'HUMAN';
    const card = document.getElementById(`setup-card-${assignedId}`);
    card.className = `setup-card p${assignedId + 1} active-player`;
    document.getElementById(`type-select-${assignedId}`).value = 'HUMAN';

    document.getElementById('online-status-text').textContent = `P${assignedId + 1} が接続されました！`;

    // Inform client of their ID assignment and update lobby state when the connection is open
    const sendWelcome = () => {
      conn.send({ type: 'JOIN_RESPONSE', myClientId: assignedId });
      this.broadcastLobbyState();
    };

    if (conn.open) {
      sendWelcome();
    } else {
      conn.on('open', sendWelcome);
    }

    conn.on('data', (data) => {
      this.handleHostData(conn, data);
    });

    conn.on('close', () => {
      // Revert to CPU on disconnect
      this.connections = this.connections.filter(c => c !== conn);
      this.players[conn.playerId].type = 'CPU_MEDIUM';
      document.getElementById(`type-select-${conn.playerId}`).value = 'CPU_MEDIUM';
      const slotCard = document.getElementById(`setup-card-${conn.playerId}`);
      slotCard.className = `setup-card p${conn.playerId + 1} active-player`;
      
      document.getElementById('online-status-text').textContent = `P${conn.playerId + 1} が切断されました。`;
      this.broadcastLobbyState();
    });
  }



  // Host parsing Client inputs
  handleHostData(conn, data) {
    const pid = conn.playerId;

    if (data.type === 'LOBBY_UPDATE') {
      const chef = CHEFS.find(c => c.id === data.chefId);
      this.players[pid].chef = chef;
      
      // Update lobby visually
      const card = document.getElementById(`setup-card-${pid}`);
      card.querySelector('.char-avatar').textContent = chef.emoji;
      document.getElementById(`char-desc-${pid}`).textContent = chef.desc;
      document.getElementById(`char-select-${pid}`).value = chef.id;
      
      this.broadcastLobbyState();
    }

    if (data.type === 'AIM_INPUT') {
      const p = this.players[pid];
      p.aimAngle = data.angle;
      p.isLocked = data.isLocked;
      
      if (p.isLocked) {
        sfx.playLock();
        this.createLockSpark(p.platePos);
        this.checkAllReady();
      }
    }

    if (data.type === 'FORK_INPUT') {
      const activePicker = this.pickOrder[this.pickIndex];
      if (activePicker && activePicker.id === pid && this.selectedSliceIndex === -1) {
        this.selectedSliceIndex = data.sliceIndex;
        this.confirmForkPick();
      }
    }
  }

  broadcastLobbyState() {
    const lobby = this.players.map(p => ({
      id: p.id,
      type: p.type,
      chefId: p.chef.id
    }));
    this.broadcast({ type: 'LOBBY_STATE', lobby });
  }

  broadcast(data) {
    this.connections.forEach(conn => {
      try {
        if (conn && conn.open) {
          conn.send(data);
        }
      } catch (err) {
        console.error("Broadcast send error:", err);
      }
    });
  }

  sendToHost(data) {
    try {
      if (this.hostConnection && this.hostConnection.open) {
        this.hostConnection.send(data);
      }
    } catch (err) {
      console.error("Send to host error:", err);
    }
  }

  // --- Slices & Aim Synchronization overrides ---
  confirmForkPick() {
    const p = this.pickOrder[this.pickIndex];
    const slice = this.pizzaSlices[this.selectedSliceIndex];
    
    if (!slice || slice.claimedBy) {
      this.selectedSliceIndex = -1; // Reset
      return;
    }
    
    const forkCentroid = getPolygonCentroid(slice.polygon);
    
    slice.claimedBy = p;
    slice.forkPos = forkCentroid;
    
    sfx.playLock();
    this.createLockSpark(slice.forkPos);

    if (this.netMode === 'ONLINE') {
      if (this.netRole === 'HOST') {
        this.broadcast({
          type: 'FORK_PICK_CONFIRM',
          sliceIndex: this.selectedSliceIndex,
          playerId: p.id,
          forkPos: forkCentroid,
          pickIndex: this.pickIndex + 1
        });
        
        this.pickIndex++;
        this.selectedSliceIndex = -1;
        this.nextPlayerPick();
      } else {
        // Send choice to host, don't advance turn locally yet
        this.sendToHost({ type: 'FORK_INPUT', sliceIndex: this.selectedSliceIndex });
        this.selectedSliceIndex = -1;
      }
    } else {
      this.pickIndex++;
      this.selectedSliceIndex = -1;
      this.nextPlayerPick();
    }
  }

  // --- Game Loop Update Syncs ---
  update(timestamp) {
    // 1. Aim sweeping
    this.players.forEach(p => {
      // Local player input handling
      const isLocalAiming = (this.netMode === 'LOCAL' || p.id === this.myClientId);
      
      if (p.type === 'HUMAN' && this.isAimingState() && !p.isLocked && isLocalAiming) {
        const keys = this.getPlayerKeys(p.id);
        const rotSpeed = 0.03;
        let angleChanged = false;
        
        if (this.keys[keys.ccw]) {
          p.aimAngle -= rotSpeed;
          angleChanged = true;
        }
        if (this.keys[keys.cw]) {
          p.aimAngle += rotSpeed;
          angleChanged = true;
        }
        
        const baseCenter = p.plateAngle + Math.PI;
        const diff = this.angleDiff(p.aimAngle, baseCenter);
        if (diff > 1.1) p.aimAngle = baseCenter + 1.1;
        if (diff < -1.1) p.aimAngle = baseCenter - 1.1;

        // Rate-limit drag updates to host
        if (angleChanged && this.netMode === 'ONLINE' && this.netRole === 'CLIENT' && Math.abs(p.aimAngle - this.lastSentAngle) > 0.01) {
          this.sendToHost({ type: 'AIM_INPUT', angle: p.aimAngle, isLocked: false });
          this.lastSentAngle = p.aimAngle;
        }
      }
    });

    // 2. CPU AI sweeps (Only calculated by Host or locally)
    if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
      this.runAI(timestamp);
      
      // Host periodically broadcasts all angles
      if (this.netMode === 'ONLINE' && this.netRole === 'HOST' && this.isAimingState()) {
        const angles = this.players.filter(p => p.type !== 'CLOSED').map(p => ({
          id: p.id,
          angle: p.aimAngle,
          isLocked: p.isLocked
        }));
        this.broadcast({ type: 'AIM_TICK', angles });
      }
    }

    this.updateParticles();

    // Toppings drop
    if (this.state === 'ROUND_START') {
      this.toppings.forEach(t => {
        if (t.bounceOffset < 0) {
          t.bounceVel += 1.5;
          t.bounceOffset += t.bounceVel;
          
          if (t.bounceOffset >= 0) {
            t.bounceOffset = 0;
            t.bounceVel = -t.bounceVel * 0.4;
            if (Math.abs(t.bounceVel) < 2) t.bounceVel = 0;
            
            for (let i = 0; i < 4; i++) {
              this.particles.push({
                x: t.x,
                y: t.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                color: t.config.color,
                radius: 1 + Math.random() * 2,
                life: 0.8,
                decay: 0.05
              });
            }
          }
        }
        if (t.scale < 1) t.scale += 0.08;
      });
    }
  }

  setWinConditionUIEnabled(enabled) {
    const els = [
      document.getElementById('wm-rounds-btn'),
      document.getElementById('wm-score-btn'),
      document.getElementById('max-rounds-input'),
      document.getElementById('win-score-input'),
      document.getElementById('max-rounds-score-input'),
    ];
    els.forEach(el => {
      if (!el) return;
      el.disabled = !enabled;
      el.style.opacity = enabled ? '' : '0.4';
      el.style.pointerEvents = enabled ? '' : 'none';
    });
  }

  bindWinConditionEvents() {
    const roundsBtn = document.getElementById('wm-rounds-btn');
    const scoreBtn = document.getElementById('wm-score-btn');
    const roundsConfig = document.getElementById('wm-rounds-config');
    const scoreConfig = document.getElementById('wm-score-config');

    roundsBtn.addEventListener('click', () => {
      roundsBtn.classList.add('active');
      scoreBtn.classList.remove('active');
      roundsConfig.style.display = '';
      scoreConfig.style.display = 'none';
      this.winMode = 'ROUNDS';
    });

    scoreBtn.addEventListener('click', () => {
      scoreBtn.classList.add('active');
      roundsBtn.classList.remove('active');
      scoreConfig.style.display = '';
      roundsConfig.style.display = 'none';
      this.winMode = 'SCORE';
    });
  }

  // Override start methods to broadcast state
  startGame() {
    this.round = 1;
    this.roundWinner = null;
    this.players.forEach(p => p.score = 0);

    if (this.winMode === 'ROUNDS') {
      const v = parseInt(document.getElementById('max-rounds-input').value, 10);
      this.maxRounds = (isNaN(v) || v < 1) ? 5 : Math.min(v, 20);
    } else {
      const ws = parseInt(document.getElementById('win-score-input').value, 10);
      const mr = parseInt(document.getElementById('max-rounds-score-input').value, 10);
      this.winScore = (isNaN(ws) || ws < 50) ? 5000 : Math.min(ws, 99999);
      this.maxRounds = (isNaN(mr) || mr < 1) ? 10 : Math.min(mr, 30);
    }

    document.getElementById('max-rounds-display').textContent =
      this.winMode === 'SCORE' ? `最大${this.maxRounds}` : this.maxRounds;
    
    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    this.setupRound();
  }

  setupRound() {
    this.state = 'ROUND_START';
    document.getElementById('current-round').textContent = this.round;
    document.getElementById('phase-banner').textContent = 'ピザ調理中... 🍕';
    
    this.pizzaSlices = [];
    this.toppings = [];
    this.particles = [];
    
    this.players.forEach(p => {
      p.roundScore = 0;
      p.isLocked = false;
      p.cutLine1 = null;
      p.cutLine2 = null;
      p.aimAngle = p.plateAngle + Math.PI;
    });

    const basePoly = [];
    const steps = 64;
    for (let i = 0; i < steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      basePoly.push({
        x: this.pizzaCenter.x + this.pizzaRadius * Math.cos(theta),
        y: this.pizzaCenter.y + this.pizzaRadius * Math.sin(theta)
      });
    }
    
    this.pizzaSlices.push({
      polygon: basePoly,
      velX: 0,
      velY: 0,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
      targetPlate: null,
      flyProgress: 0,
      claimedBy: null,
      forkPos: null
    });

    // Generate toppings (Calculated by host/local, sync to client)
    const pizzaType = PIZZA_TYPES[(this.round - 1) % PIZZA_TYPES.length];
    
    if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
      pizzaType.toppings.forEach(topConfig => {
        let spawned = 0;
        let attempts = 0;
        while (spawned < topConfig.count && attempts < 200) {
          attempts++;
          const r = Math.random() * (this.pizzaRadius - 40);
          const theta = Math.random() * Math.PI * 2;
          const tx = this.pizzaCenter.x + r * Math.cos(theta);
          const ty = this.pizzaCenter.y + r * Math.sin(theta);
          
          let overlaps = false;
          for (const existing of this.toppings) {
            if (dist(existing, { x: tx, y: ty }) < 24) {
              overlaps = true;
              break;
            }
          }
          
          if (!overlaps) {
            this.toppings.push({
              x: tx,
              y: ty,
              config: topConfig,
              bounceOffset: -300 - Math.random() * 200,
              bounceVel: 0,
              scale: 0,
              claimedBySlice: null
            });
            spawned++;
          }
        }
      });

      // Host sends toppings coordinates
      if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
        const topSync = this.toppings.map(t => ({
          x: t.x,
          y: t.y,
          type: t.config.type,
          bounceOffset: t.bounceOffset
        }));
        this.broadcast({
          type: 'ROUND_START_SYNC',
          round: this.round,
          toppings: topSync
        });
      }
    }

    this.updateSidebars();
    this.updateControlsHint();

    let doughScale = 0;
    const dropAnim = () => {
      if (this.state !== 'ROUND_START') return;
      doughScale += 0.08;
      if (doughScale >= 1) {
        doughScale = 1;
        
        // Host triggers Aim phase
        if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
          setTimeout(() => this.startAiming(1), 1000);
        }
      }
      this.pizzaSlices[0].scale = doughScale;
    };
    
    const interval = setInterval(() => {
      dropAnim();
      if (doughScale === 1) clearInterval(interval);
    }, 30);
  }

  startAiming(cutPhase) {
    this.state = cutPhase === 1 ? 'AIMING_1' : 'AIMING_2';
    document.getElementById('phase-banner').textContent = `エイミング中 (Cut ${cutPhase}/2) 🎯`;
    
    if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
      this.broadcast({ type: 'AIM_START', cutPhase });
    }
    
    this.players.forEach(p => {
      if (p.type !== 'CLOSED') {
        p.isLocked = false;
      } else {
        p.isLocked = true;
      }
    });

    this.timer = 10;
    document.getElementById('timer-sec').textContent = this.timer;
    
    if (this.timerInterval) clearInterval(this.timerInterval);
    
    this.timerInterval = setInterval(() => {
      this.timer--;
      document.getElementById('timer-sec').textContent = this.timer;
      
      if (this.timer <= 3 && this.timer > 0) {
        sfx.playTick();
      }
      
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.executeCuts(cutPhase);
      }
    }, 1000);
  }

  checkAllReady() {
    const activePlayers = this.players.filter(p => p.type !== 'CLOSED');
    const allLocked = activePlayers.every(p => p.isLocked);
    if (allLocked) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      const phase = this.state === 'AIMING_1' ? 1 : 2;
      this.executeCuts(phase);
    }
  }

  executeCuts(cutPhase) {
    this.state = cutPhase === 1 ? 'CUTTING_1' : 'CUTTING_2';
    document.getElementById('phase-banner').textContent = `ピザカット！ (Cut ${cutPhase}/2) ⚡`;
    
    // Host locks and broadcasts cut angles
    if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
      const finalAngles = this.players.filter(p => p.type !== 'CLOSED').map(p => ({
        id: p.id,
        angle: p.aimAngle
      }));
      this.broadcast({ type: 'EXECUTE_CUTS', cutPhase, finalAngles });
    }

    this.players.forEach(p => {
      if (p.type !== 'CLOSED') {
        const dirX = Math.cos(p.aimAngle);
        const dirY = Math.sin(p.aimAngle);
        
        const line = {
          p1: { x: p.platePos.x, y: p.platePos.y },
          p2: { x: p.platePos.x + dirX * 1000, y: p.platePos.y + dirY * 1000 }
        };
        
        if (cutPhase === 1) {
          p.cutLine1 = line;
        } else {
          p.cutLine2 = line;
        }
      }
    });

    sfx.playSlice();
    this.createCutFlash();

    setTimeout(() => {
      let slicedList = [...this.pizzaSlices];
      
      this.players.forEach(p => {
        if (p.type !== 'CLOSED') {
          const line = (cutPhase === 1) ? p.cutLine1 : p.cutLine2;
          const currentSliced = [];
          
          slicedList.forEach(slice => {
            const split = slicePolygon(slice.polygon, line);
            split.forEach(poly => {
              let isClaimed = null;
              let forkPos = null;
              
              if (slice.claimedBy && slice.forkPos) {
                if (isPointInPolygon(slice.forkPos, poly)) {
                  isClaimed = slice.claimedBy;
                  forkPos = slice.forkPos;
                }
              }

              currentSliced.push({
                polygon: poly,
                velX: 0,
                velY: 0,
                offsetX: slice.offsetX,
                offsetY: slice.offsetY,
                scale: 1,
                targetPlate: null,
                flyProgress: 0,
                claimedBy: isClaimed,
                forkPos: forkPos
              });
            });
          });
          slicedList = currentSliced;
        }
      });
      
      this.pizzaSlices = slicedList;

      // Host transitions states
      if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
        if (cutPhase === 1) {
          setTimeout(() => this.startForkPick(), 1200);
        } else {
          setTimeout(() => this.resolveScoring(), 1200);
        }
      }
    }, 600);
  }

  // Fork pick syncs
  startForkPick() {
    this.state = 'FORK_PICK';
    
    const active = this.players.filter(p => p.type !== 'CLOSED');
    this.pickOrder = [...active].sort((a, b) => a.score - b.score);
    this.pickIndex = 0;

    if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
      const pickOrderIds = this.pickOrder.map(p => p.id);
      this.broadcast({ type: 'FORK_PICK_START', pickOrderIds, pickIndex: 0 });
    }

    this.nextPlayerPick();
  }

  // Scoring overrides
  resolveScoring() {
    this.state = 'SCORING';
    document.getElementById('phase-banner').textContent = '回収・スコア集計中... 💰';
    
    if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
      this.broadcast({ type: 'SCORING_START' });
    }

    this.pizzaSlices.forEach(slice => {
      const cent = getPolygonCentroid(slice.polygon);
      const dirX = cent.x - this.pizzaCenter.x;
      const dirY = cent.y - this.pizzaCenter.y;
      const length = Math.sqrt(dirX*dirX + dirY*dirY);
      
      if (length > 0) {
        slice.velX = (dirX / length) * 1.5;
        slice.velY = (dirY / length) * 1.5;
      }
    });

    this.pizzaSlices.forEach(slice => {
      if (!slice.claimedBy) {
        const cent = getPolygonCentroid(slice.polygon);
        let closestPlayer = null;
        let minDist = 999999;
        
        this.players.forEach(p => {
          if (p.type === 'CLOSED') return;
          const d = dist(p.platePos, cent);
          if (d < minDist) {
            minDist = d;
            closestPlayer = p;
          }
        });
        
        slice.claimedBy = closestPlayer;
      }
    });

    this.toppings.forEach(topping => {
      for (const slice of this.pizzaSlices) {
        if (isPointInPolygon(topping, slice.polygon)) {
          slice.toppingsCount = (slice.toppingsCount || 0) + 1;
          slice.toppingsPoints = (slice.toppingsPoints || 0) + topping.config.score;
          topping.claimedBySlice = slice;
          break;
        }
      }
    });

    let progress = 0;
    const scoreAnim = () => {
      if (this.state !== 'SCORING') return;
      progress += 0.02;
      
      this.pizzaSlices.forEach(slice => {
        if (slice.claimedBy) {
          slice.targetPlate = slice.claimedBy.platePos;
          slice.flyProgress = progress;
          
          const cent = getPolygonCentroid(slice.polygon);
          const destX = slice.targetPlate.x - cent.x;
          const destY = slice.targetPlate.y - cent.y;
          
          slice.offsetX = destX * progress;
          slice.offsetY = destY * progress;
          slice.scale = 1 - progress;
        }
      });

      this.toppings.forEach(topping => {
        if (topping.claimedBySlice && topping.claimedBySlice.claimedBy) {
          const slice = topping.claimedBySlice;
          const dest = slice.claimedBy.platePos;
          topping.x = topping.x + (dest.x - topping.x) * 0.05;
          topping.y = topping.y + (dest.y - topping.y) * 0.05;
          topping.scale = 1 - progress;
        } else {
          topping.scale = 1 - progress;
        }
      });

      if (progress >= 1) {
        progress = 1;
        
        // Final scoring only trigger on host/local
        if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
          this.addFinalScores();
        }
      } else {
        setTimeout(scoreAnim, 30);
      }
    };
    
    sfx.playDing();
    scoreAnim();
  }

  addFinalScores() {
    this.pizzaSlices.forEach(slice => {
      if (slice.claimedBy) {
        const areaScore = Math.round(getPolygonArea(slice.polygon) / 100);
        const toppingScore = slice.toppingsPoints || 0;
        const totalAward = areaScore + toppingScore;
        
        slice.claimedBy.roundScore += totalAward;
        slice.claimedBy.score += totalAward;
        
        this.createLockSpark(slice.claimedBy.platePos);
      }
    });

    this.updateSidebars();

    // Host syncs scoring calculations
    if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
      const scoresMap = {};
      this.players.forEach(p => {
        scoresMap[p.id] = { roundScore: p.roundScore, score: p.score };
      });
      this.broadcast({ type: 'SCORE_SYNC', scores: scoresMap });
    }

    setTimeout(() => this.showRoundSummary(), 800);
  }

  // Handle Score synchronization on clients
  handleClientDataScoreSync(data) {
    if (data.type === 'SCORE_SYNC') {
      this.players.forEach(p => {
        if (data.scores[p.id]) {
          p.roundScore = data.scores[p.id].roundScore;
          p.score = data.scores[p.id].score;
        }
      });
      this.updateSidebars();
      setTimeout(() => this.showRoundSummary(), 800);
    }
  }
  handleClientData(data) {
    if (data.type === 'JOIN_RESPONSE') {
      this.myClientId = data.myClientId;
      document.getElementById(`char-select-${this.myClientId}`).disabled = false;
      document.getElementById('online-status-text').textContent = `P${this.myClientId + 1} として参加しました！`;
    }

    if (data.type === 'AIM_SYNC') {
      const p = this.players[data.id];
      if (p) {
        p.aimAngle = data.angle;
        p.isLocked = data.isLocked;
        if (p.isLocked) {
          sfx.playLock();
          this.createLockSpark(p.platePos);
        }
      }
      this.updateSidebars();
    }

    if (data.type === 'LOBBY_STATE') {
      data.lobby.forEach(pData => {
        const p = this.players[pData.id];
        p.type = pData.type;
        p.chef = CHEFS.find(c => c.id === pData.chefId);
        
        const card = document.getElementById(`setup-card-${p.id}`);
        if (p.type === 'CLOSED') {
          card.className = `setup-card p${p.id + 1} closed`;
        } else {
          card.className = `setup-card p${p.id + 1} active-player`;
        }
        document.getElementById(`type-select-${p.id}`).value = p.type;
        document.getElementById(`char-select-${p.id}`).value = p.chef.id;
        card.querySelector('.char-avatar').textContent = p.chef.emoji;
        document.getElementById(`char-desc-${p.id}`).textContent = p.chef.desc;
      });
    }

    if (data.type === 'GAME_START') {
      sfx.init();
      if (data.winMode) this.winMode = data.winMode;
      if (data.winScore) this.winScore = data.winScore;
      if (data.maxRounds) this.maxRounds = data.maxRounds;
      this.startGame();
    }

    if (data.type === 'AIM_START') {
      this.startAiming(data.cutPhase);
    }

    if (data.type === 'ROUND_START_SYNC') {
      this.round = data.round;
      this.setupRound();
      
      this.toppings = data.toppings.map(tData => {
        const topType = PIZZA_TYPES[(this.round - 1) % PIZZA_TYPES.length].toppings.find(tc => tc.type === tData.type);
        return {
          x: tData.x,
          y: tData.y,
          config: topType,
          bounceOffset: tData.bounceOffset,
          bounceVel: 0,
          scale: 0,
          claimedBySlice: null
        };
      });
    }

    if (data.type === 'AIM_TICK') {
      data.angles.forEach(angData => {
        if (angData.id !== this.myClientId) {
          const p = this.players[angData.id];
          p.aimAngle = angData.angle;
          p.isLocked = angData.isLocked;
        }
      });
      this.updateSidebars();
    }

    if (data.type === 'EXECUTE_CUTS') {
      data.finalAngles.forEach(angData => {
        this.players[angData.id].aimAngle = angData.angle;
        this.players[angData.id].isLocked = true;
      });
      this.executeCuts(data.cutPhase);
    }

    if (data.type === 'FORK_PICK_START') {
      this.state = 'FORK_PICK';
      this.pickOrder = data.pickOrderIds.map(id => this.players[id]);
      this.pickIndex = data.pickIndex;
      this.nextPlayerPick();
    }

    if (data.type === 'FORK_PICK_CONFIRM') {
      const p = this.players[data.playerId];
      const slice = this.pizzaSlices[data.sliceIndex];
      slice.claimedBy = p;
      slice.forkPos = data.forkPos;
      sfx.playLock();
      this.createLockSpark(slice.forkPos);
      
      this.pickIndex = data.pickIndex;
      this.nextPlayerPick();
    }

    if (data.type === 'SCORING_START') {
      this.resolveScoring();
    }

    if (data.type === 'SCORE_SYNC') {
      this.handleClientDataScoreSync(data);
    }

    if (data.type === 'NEXT_ROUND') {
      document.getElementById('round-summary-overlay').classList.remove('active');
      this.nextRound();
    }

    if (data.type === 'GOTO_SETUP') {
      document.getElementById('game-over-overlay').classList.remove('active');
      this.resetToSetup();
    }
  }

  // --- Multi-touch Handlers for Smartphones and iPads ---
  handleTouchStart(e) {
    e.preventDefault();
    this.isTouchUser = true; // Mark as touch user to disable mouse events
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const tx = (touch.clientX - rect.left) * scaleX;
      const ty = (touch.clientY - rect.top) * scaleY;
      
      const touchPt = { x: tx, y: ty };

      if (this.state === 'FORK_PICK') {
        const activePicker = this.pickOrder[this.pickIndex];
        const activePlayerId = (this.netMode === 'ONLINE') ? this.myClientId : null;
        
        if (activePicker && activePicker.type === 'HUMAN' && (activePlayerId === null || activePicker.id === activePlayerId)) {
          this.pizzaSlices.forEach((slice, idx) => {
            if (!slice.claimedBy && isPointInPolygon(touchPt, slice.polygon)) {
              this.selectedSliceIndex = idx;
              this.confirmForkPick();
            }
          });
        }
        continue;
      }

      if (this.isAimingState()) {
        const activePlayerId = (this.netMode === 'ONLINE') ? this.myClientId : null;

        // 1. 即時ロックオン判定 (お皿の直上 70px 以内を触った瞬間)
        let lockedPlayer = null;
        this.players.forEach(p => {
          if (p.type === 'HUMAN' && !p.isLocked && (activePlayerId === null || p.id === activePlayerId)) {
            if (dist(p.platePos, touchPt) < 70) {
              lockedPlayer = p;
            }
          }
        });

        if (lockedPlayer) {
          lockedPlayer.isLocked = true;
          sfx.playLock();
          this.createLockSpark(lockedPlayer.platePos);

          if (this.netMode === 'ONLINE') {
            if (this.netRole === 'CLIENT') {
              this.sendToHost({ type: 'AIM_INPUT', angle: lockedPlayer.aimAngle, isLocked: true });
            } else {
              this.broadcast({ type: 'AIM_SYNC', id: lockedPlayer.id, angle: lockedPlayer.aimAngle, isLocked: true });
              this.checkAllReady();
            }
          } else {
            this.checkAllReady();
          }
          continue; // ロックオンした場合はドラッグ紐付けを行わない
        }

        // 2. ドラッグ回転用の紐付け (お皿の周辺 70px〜180px 以内)
        let assignedPlayerId = -1;

        if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT') {
          const myPlayer = this.players[this.myClientId];
          if (myPlayer && myPlayer.type === 'HUMAN' && !myPlayer.isLocked) {
            assignedPlayerId = this.myClientId;
          }
        } else {
          // ローカル対戦時：お皿から70px〜180px以内のプレイヤーを探す
          const candidates = this.players.filter(p => {
            if (p.type !== 'HUMAN' || p.isLocked) return false;
            const d = dist(p.platePos, touchPt);
            return d >= 70 && d < 180;
          });

          if (candidates.length === 1) {
            assignedPlayerId = candidates[0].id;
          } else if (candidates.length > 2) {
            let closestPlayer = candidates[0];
            let minDist = dist(closestPlayer.platePos, touchPt);
            
            for (let k = 1; k < candidates.length; k++) {
              const d = dist(candidates[k].platePos, touchPt);
              if (d < minDist) {
                minDist = d;
                closestPlayer = candidates[k];
              }
            }
            assignedPlayerId = closestPlayer.id;
          } else if (candidates.length === 2) {
            // candidates.length が 2 の場合 (P1とP2が両方判定内に入っている場合など)
            let closestPlayer = candidates[0];
            let minDist = dist(closestPlayer.platePos, touchPt);
            const d2 = dist(candidates[1].platePos, touchPt);
            if (d2 < minDist) {
              closestPlayer = candidates[1];
            }
            assignedPlayerId = closestPlayer.id;
          }
        }

        // 重複登録の防止 (すでに他の指で操作されているプレイヤーは紐付けない)
        if (assignedPlayerId !== -1) {
          const isAlreadyAssigned = Object.values(this.activeTouches).some(t => t.playerId === assignedPlayerId);
          if (!isAlreadyAssigned) {
            this.activeTouches[touch.identifier] = {
              playerId: assignedPlayerId,
              startX: tx,
              startY: ty
            };
          }
        }
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const tInfo = this.activeTouches[touch.identifier];
      
      if (tInfo !== undefined) {
        const pid = tInfo.playerId;
        const p = this.players[pid];
        if (p && p.type === 'HUMAN' && !p.isLocked) {
          const tx = (touch.clientX - rect.left) * scaleX;
          const ty = (touch.clientY - rect.top) * scaleY;
          
          let angle = Math.atan2(ty - p.platePos.y, tx - p.platePos.x);
          const baseCenterAngle = p.plateAngle + Math.PI;
          const diff = this.angleDiff(angle, baseCenterAngle);
          
          const limit = 1.1;
          if (diff > limit) {
            angle = baseCenterAngle + limit;
          } else if (diff < -limit) {
            angle = baseCenterAngle - limit;
          }
          
          p.aimAngle = angle;
          
          if (this.netMode === 'ONLINE' && this.netRole === 'CLIENT' && Math.abs(angle - this.lastSentAngle) > 0.01) {
            this.sendToHost({ type: 'AIM_INPUT', angle: p.aimAngle, isLocked: false });
            this.lastSentAngle = angle;
          }
        }
      }
    }
  }

  handleTouchEnd(e) {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      delete this.activeTouches[touch.identifier];
    }
  }

  // --- Keyboard Bindings helper ---
  cycleUnclaimedSlice(direction) {
    const n = this.pizzaSlices.length;
    if (n === 0) return;
    
    let idx = this.selectedSliceIndex;
    for (let i = 0; i < n; i++) {
      idx = (idx + direction + n) % n;
      if (!this.pizzaSlices[idx].claimedBy) {
        this.selectedSliceIndex = idx;
        sfx.playTick();
        break;
      }
    }
  }

  nextPlayerPick() {
    if (this.pickIndex >= this.pickOrder.length) {
      if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
        setTimeout(() => this.startAiming(2), 1000);
      }
      return;
    }

    const p = this.pickOrder[this.pickIndex];
    document.getElementById('phase-banner').textContent = `${p.chef.emoji} ${p.chef.name}のフォークキープ中！🍴`;
    
    this.updateSidebars();

    if (p.type.startsWith('CPU')) {
      if (!(this.netMode === 'ONLINE' && this.netRole === 'CLIENT')) {
        setTimeout(() => this.cpuForkPick(p), 1200);
      }
    } else {
      // Local check or client specific turn activation
      const isMyTurn = (this.netMode === 'LOCAL' || p.id === this.myClientId);
      if (isMyTurn) {
        this.selectedSliceIndex = this.firstUnclaimedSliceIndex();
      } else {
        this.selectedSliceIndex = -1; // Wait for other player
      }
    }
  }

  cpuForkPick(player) {
    const candidates = [];
    this.pizzaSlices.forEach((slice, idx) => {
      if (!slice.claimedBy) {
        const area = getPolygonArea(slice.polygon);
        let toppingValue = 0;
        
        this.toppings.forEach(t => {
          if (isPointInPolygon(t, slice.polygon)) {
            toppingValue += t.config.score;
          }
        });
        
        const value = (area / 100) + toppingValue;
        candidates.push({ idx, value });
      }
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => b.value - a.value);
      let selected = candidates[0];
      
      if (player.type === 'CPU_EASY' && candidates.length > 1) {
        if (Math.random() < 0.5) {
          selected = candidates[Math.floor(Math.random() * candidates.length)];
        }
      } else if (player.type === 'CPU_MEDIUM' && candidates.length > 2) {
        if (Math.random() < 0.2) {
          selected = candidates[1];
        }
      }
      
      const slice = this.pizzaSlices[selected.idx];
      slice.claimedBy = player;
      slice.forkPos = getPolygonCentroid(slice.polygon);
      
      sfx.playLock();
      this.createLockSpark(slice.forkPos);
      
      if (this.netMode === 'ONLINE' && this.netRole === 'HOST') {
        this.broadcast({
          type: 'FORK_PICK_CONFIRM',
          sliceIndex: selected.idx,
          playerId: player.id,
          forkPos: slice.forkPos,
          pickIndex: this.pickIndex + 1
        });
      }
    }
    
    this.pickIndex++;
    this.updateSidebars();
    setTimeout(() => this.nextPlayerPick(), 800);
  }

  nextRound() {
    this.round++;

    if (this.winMode === 'SCORE') {
      const active = this.players.filter(p => p.type !== 'CLOSED');
      const leaders = active.filter(p => p.score >= this.winScore);
      if (leaders.length > 0) {
        leaders.sort((a, b) => b.score - a.score);
        this.roundWinner = leaders[0];
        this.showGameOver();
        return;
      }
    }

    if (this.round > this.maxRounds) {
      this.showGameOver();
    } else {
      this.setupRound();
    }
  }

  showGameOver() {
    this.state = 'GAME_OVER';
    sfx.playGameOver();
    
    const active = this.players.filter(p => p.type !== 'CLOSED');
    active.sort((a, b) => b.score - a.score);

    const crownTitle = document.querySelector('#game-over-overlay .crown-title');
    if (this.winMode === 'SCORE' && this.roundWinner) {
      crownTitle.innerHTML = `🎯 先取り達成！ 🎯<br><span style="font-size:0.6em;opacity:0.85;">${this.roundWinner.chef.emoji} ${this.roundWinner.chef.name} が ${this.winScore}点 を突破！</span>`;
    } else {
      crownTitle.textContent = '🏆 最終結果 🏆';
    }
    
    const podium = document.getElementById('podium-container');
    podium.innerHTML = '';
    
    const classes = ['first', 'second', 'third'];
    const ranks = ['🥇 1st', '🥈 2nd', '🥉 3rd'];
    
    for (let i = 0; i < Math.min(3, active.length); i++) {
      const p = active[i];
      const stand = document.createElement('div');
      stand.className = `podium-stand ${classes[i]}`;
      stand.innerHTML = `
        <div class="podium-chef">${p.chef.emoji}</div>
        <div class="podium-rank">${ranks[i]}</div>
        <div class="podium-name">${p.chef.name}</div>
        <div class="podium-score">${p.score} 点</div>
      `;
      podium.appendChild(stand);
    }

    const scoreList = document.getElementById('final-scores-list');
    scoreList.innerHTML = '';
    active.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = 'final-row';
      row.innerHTML = `
        <span class="name">#${idx + 1} ${p.chef.name} (P${p.id + 1})</span>
        <span class="score">${p.score} 点</span>
      `;
      scoreList.appendChild(row);
    });

    document.getElementById('game-over-overlay').classList.add('active');
    this.createConfetti();
  }

  // --- Rendering Functions ---
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawPizzaBoard();
    this.drawPizzaPieces();
    this.drawToppings();
    this.drawCuts();
    this.drawForks();
    this.drawPlates();
    this.drawParticles();

    if (this.state === 'AIMING_1' || this.state === 'AIMING_2') {
      const activeId = (this.netMode === 'ONLINE') ? this.myClientId : 0;
      const p1 = this.players[activeId];
      if (p1 && p1.type === 'HUMAN' && !p1.isLocked) {
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, 8, 0, Math.PI * 2);
        this.ctx.strokeStyle = p1.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    }
  }

  drawPizzaBoard() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.pizzaCenter.x, this.pizzaCenter.y, this.pizzaRadius + 20, 0, Math.PI * 2);
    
    const woodGrad = this.ctx.createRadialGradient(
      this.pizzaCenter.x, this.pizzaCenter.y, this.pizzaRadius - 50,
      this.pizzaCenter.x, this.pizzaCenter.y, this.pizzaRadius + 30
    );
    woodGrad.addColorStop(0, '#3e2723');
    woodGrad.addColorStop(1, '#1b0a0a');
    
    this.ctx.fillStyle = woodGrad;
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    this.ctx.shadowBlur = 25;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 15;
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.arc(this.pizzaCenter.x, this.pizzaCenter.y, this.pizzaRadius + 8, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#271212';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  drawPizzaPieces() {
    const pizzaType = PIZZA_TYPES[(this.round - 1) % PIZZA_TYPES.length];

    this.pizzaSlices.forEach((slice, idx) => {
      const poly = slice.polygon;
      if (poly.length < 3) return;

      this.ctx.save();
      
      this.ctx.translate(slice.offsetX, slice.offsetY);
      this.ctx.scale(slice.scale, slice.scale);

      this.ctx.beginPath();
      this.ctx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) {
        this.ctx.lineTo(poly[i].x, poly[i].y);
      }
      this.ctx.closePath();
      
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      this.ctx.shadowBlur = 10;
      this.ctx.shadowOffsetY = 5;
      
      this.ctx.fillStyle = '#f3a683';
      this.ctx.fill();
      
      this.ctx.shadowColor = 'transparent';

      this.ctx.beginPath();
      const centroid = getPolygonCentroid(poly);
      const saucePoly = poly.map(pt => {
        return {
          x: pt.x + (centroid.x - pt.x) * 0.08,
          y: pt.y + (centroid.y - pt.y) * 0.08
        };
      });
      
      this.ctx.moveTo(saucePoly[0].x, saucePoly[0].y);
      for (let i = 1; i < saucePoly.length; i++) {
        this.ctx.lineTo(saucePoly[i].x, saucePoly[i].y);
      }
      this.ctx.closePath();
      this.ctx.fillStyle = pizzaType.sauceColor;
      this.ctx.fill();

      this.ctx.beginPath();
      const cheesePoly = poly.map(pt => {
        return {
          x: pt.x + (centroid.x - pt.x) * 0.14,
          y: pt.y + (centroid.y - pt.y) * 0.14
        };
      });
      this.ctx.moveTo(cheesePoly[0].x, cheesePoly[0].y);
      for (let i = 1; i < cheesePoly.length; i++) {
        this.ctx.lineTo(cheesePoly[i].x, cheesePoly[i].y);
      }
      this.ctx.closePath();
      
      const cheeseGrad = this.ctx.createRadialGradient(
        centroid.x, centroid.y, 10,
        centroid.x, centroid.y, this.pizzaRadius * 0.8
      );
      cheeseGrad.addColorStop(0, cheesePoly.length > 5 ? pizzaType.cheeseColor : '#fdf9d6');
      cheeseGrad.addColorStop(1, '#e58e26');
      
      this.ctx.fillStyle = cheeseGrad;
      this.ctx.fill();

      cheesePoly.forEach((pt, idx) => {
        if (idx % 4 === 0) {
          const bx = pt.x + (centroid.x - pt.x) * 0.25;
          const by = pt.y + (centroid.y - pt.y) * 0.25;
          this.ctx.beginPath();
          this.ctx.arc(bx, by, 8, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(120, 50, 5, 0.25)';
          this.ctx.fill();
        }
      });

      const n = poly.length;
      for (let i = 0; i < n; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % n];

        const d1 = dist(p1, this.pizzaCenter);
        const d2 = dist(p2, this.pizzaCenter);

        if (d1 >= this.pizzaRadius - 3 && d2 >= this.pizzaRadius - 3) {
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          
          this.ctx.strokeStyle = pizzaType.crustColor;
          this.ctx.lineWidth = 14;
          this.ctx.lineCap = 'round';
          this.ctx.stroke();

          this.ctx.strokeStyle = '#e67e22';
          this.ctx.lineWidth = 5;
          this.ctx.stroke();
          
          this.ctx.strokeStyle = '#2d1606';
          this.ctx.lineWidth = 2;
          this.ctx.setLineDash([2, 20]);
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        }
      }

      const activePicker = (this.state === 'FORK_PICK') ? this.pickOrder[this.pickIndex] : null;
      const activePlayerId = (this.netMode === 'ONLINE') ? this.myClientId : null;
      
      const isSelected = (activePicker && 
                          activePicker.type === 'HUMAN' && 
                          (activePlayerId === null || activePicker.id === activePlayerId) && 
                          this.selectedSliceIndex === idx);
                          
      if (isSelected) {
        this.ctx.beginPath();
        this.ctx.moveTo(poly[0].x, poly[0].y);
        for (let i = 1; i < poly.length; i++) {
          this.ctx.lineTo(poly[i].x, poly[i].y);
        }
        this.ctx.closePath();
        
        const activePickerColor = activePicker.color;
        this.ctx.strokeStyle = activePickerColor;
        this.ctx.lineWidth = 6;
        
        this.ctx.shadowColor = activePickerColor;
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();
        this.ctx.shadowColor = 'transparent';
      }

      this.ctx.restore();
    });
  }

  drawToppings() {
    this.toppings.forEach(t => {
      this.ctx.save();
      
      let drawX = t.x;
      let drawY = t.y;
      
      if (t.claimedBySlice) {
        drawX += t.claimedBySlice.offsetX;
        drawY += t.claimedBySlice.offsetY;
        this.ctx.scale(t.scale, t.scale);
      }
      
      drawY += t.bounceOffset;

      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      this.ctx.shadowBlur = 4;
      this.ctx.shadowOffsetY = 3;

      this.ctx.font = `${t.config.radius * 1.5}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(t.config.label, drawX, drawY);

      this.ctx.restore();
    });
  }

  drawCuts() {
    this.players.forEach(p => {
      if (p.type === 'CLOSED') return;

      const isAiming = this.isAimingState();
      
      if (isAiming) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(p.platePos.x, p.platePos.y);
        
        const lineLen = 900;
        const lx = p.platePos.x + Math.cos(p.aimAngle) * lineLen;
        const ly = p.platePos.y + Math.sin(p.aimAngle) * lineLen;
        this.ctx.lineTo(lx, ly);
        
        this.ctx.strokeStyle = p.color;
        this.ctx.shadowColor = p.color;
        
        if (p.isLocked) {
          this.ctx.lineWidth = 4;
          this.ctx.shadowBlur = 15;
          this.ctx.setLineDash([15, 10]);
        } else {
          this.ctx.lineWidth = 1.5;
          this.ctx.shadowBlur = 4;
        }
        
        this.ctx.stroke();
        this.ctx.restore();
      }

      if (this.state === 'AIMING_2' || this.state === 'CUTTING_2' || this.state === 'FORK_PICK' || this.state === 'SCORING') {
        if (p.cutLine1) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.moveTo(p.cutLine1.p1.x, p.cutLine1.p1.y);
          this.ctx.lineTo(p.cutLine1.p2.x, p.cutLine1.p2.y);
          this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          this.ctx.lineWidth = 2.5;
          this.ctx.setLineDash([5, 5]);
          this.ctx.stroke();
          this.ctx.restore();
        }
      }
    });
  }

  drawForks() {
    this.pizzaSlices.forEach(slice => {
      if (slice.claimedBy && slice.forkPos) {
        this.ctx.save();
        
        this.ctx.translate(slice.offsetX, slice.offsetY);
        this.ctx.scale(slice.scale, slice.scale);

        const fx = slice.forkPos.x;
        const fy = slice.forkPos.y;

        this.ctx.beginPath();
        this.ctx.arc(fx, fy, 15, 0, Math.PI * 2);
        this.ctx.fillStyle = slice.claimedBy.color;
        
        this.ctx.shadowColor = slice.claimedBy.color;
        this.ctx.shadowBlur = 12;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🍴', fx, fy);

        this.ctx.restore();
      }
    });
  }

  drawPlates() {
    this.players.forEach(p => {
      if (p.type === 'CLOSED') return;
      
      this.ctx.save();
      
      this.ctx.beginPath();
      this.ctx.arc(p.platePos.x, p.platePos.y, 45, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(24, 15, 15, 0.8)';
      this.ctx.strokeStyle = p.color;
      this.ctx.lineWidth = 3;
      
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.stroke();
      this.ctx.fill();
      
      this.ctx.shadowColor = 'transparent';

      this.ctx.beginPath();
      this.ctx.arc(p.platePos.x, p.platePos.y, 38, 0, Math.PI * 2);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      this.ctx.font = '38px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(p.chef.emoji, p.platePos.x, p.platePos.y);

      this.ctx.beginPath();
      this.ctx.arc(p.platePos.x + 30, p.platePos.y - 30, 12, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      
      this.ctx.font = 'bold 10px Outfit';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(`P${p.id + 1}`, p.platePos.x + 30, p.platePos.y - 30);

      this.ctx.font = 'bold 15px Fredoka';
      this.ctx.fillStyle = '#fff';
      const scoreAngle = p.plateAngle;
      const tx = p.platePos.x + Math.cos(scoreAngle) * 65;
      const ty = p.platePos.y + Math.sin(scoreAngle) * 65;
      this.ctx.fillText(`${p.score} 点`, tx, ty);

      this.ctx.restore();
    });
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.beginPath();
      
      if (p.wobble !== undefined) {
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.wobble * 0.1);
        this.ctx.rect(-p.radius, -p.radius/2, p.radius*2, p.radius);
      } else {
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      }
      
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fill();
      this.ctx.restore();
    });
  }

  // --- Mathematics Helpers ---
  angleDiff(a, b) {
    let diff = a - b;
    while (diff < -Math.PI) diff += Math.PI * 2;
    while (diff > Math.PI) diff -= Math.PI * 2;
    return diff;
  }

  // --- 5. Game Loop & Update Methods ---
  drawLoop(timestamp) {
    this.update(timestamp);
    this.render();
    requestAnimationFrame((t) => this.drawLoop(t));
  }

  calcBestAimAngle(p) {
    const baseCenter = p.plateAngle + Math.PI;
    let bestAngle = baseCenter;
    let bestScore = -Infinity;

    for (let a = baseCenter - 1.05; a <= baseCenter + 1.05; a += 0.04) {
      const dirX = Math.cos(a);
      const dirY = Math.sin(a);
      let score = 0;

      this.toppings.forEach(t => {
        if (!t.config) return;
        const dx = t.x - p.platePos.x;
        const dy = t.y - p.platePos.y;
        const projLen = dx * dirX + dy * dirY;
        if (projLen < 0) return;
        const perpDist = Math.abs(dx * dirY - dy * dirX);
        if (perpDist < (t.config.radius || 14) + 6) {
          score += t.config.score;
        }
      });

      if (score > bestScore) {
        bestScore = score;
        bestAngle = a;
      }
    }

    return bestAngle;
  }

  runAI(timestamp) {
    if (this.state !== 'AIMING_1' && this.state !== 'AIMING_2') return;
    
    this.players.forEach(p => {
      if (!p.type.startsWith('CPU') || p.isLocked) return;

      const baseCenter = p.plateAngle + Math.PI;
      const limit = 1.1;

      if (p.type === 'CPU_HARD') {
        // ターゲット角度を計算（高スコアトッピング狙い）
        if (!p._hardTarget || Math.random() < 0.03) {
          p._hardTarget = this.calcBestAimAngle(p);
        }
        const toTarget = this.angleDiff(p._hardTarget, p.aimAngle);
        const steerSpeed = 0.035;
        p.aimAngle += Math.sign(toTarget) * Math.min(Math.abs(toTarget), steerSpeed);

        // 範囲制限
        const d = this.angleDiff(p.aimAngle, baseCenter);
        if (d > limit) p.aimAngle = baseCenter + limit;
        if (d < -limit) p.aimAngle = baseCenter - limit;

        // ターゲットに近づいたら確定（タイムプレッシャー時は即確定）
        const atTarget = Math.abs(toTarget) < 0.06;
        if (atTarget || this.timer <= 2) {
          p.isLocked = true;
          sfx.playLock();
          this.createLockSpark(p.platePos);
          if (this.netMode === 'ONLINE') {
            this.broadcast({ type: 'AIM_SYNC', id: p.id, angle: p.aimAngle, isLocked: true });
          }
          this.checkAllReady();
        }
        return;
      }

      // Easy / Medium: ランダムスイープ
      p.aimAngle += p.sweepDir * p.sweepSpeed;
      
      const diff = this.angleDiff(p.aimAngle, baseCenter);
      if (diff > limit) {
        p.aimAngle = baseCenter + limit;
        p.sweepDir = -1;
      } else if (diff < -limit) {
        p.aimAngle = baseCenter - limit;
        p.sweepDir = 1;
      }
      
      let lockChance = 0.005;
      if (p.type === 'CPU_EASY') lockChance = 0.002;
      if (this.timer <= 2) lockChance = 0.2;
      
      if (Math.random() < lockChance) {
        p.isLocked = true;
        sfx.playLock();
        this.createLockSpark(p.platePos);
        if (this.netMode === 'ONLINE') {
          this.broadcast({ type: 'AIM_SYNC', id: p.id, angle: p.aimAngle, isLocked: true });
        }
        this.checkAllReady();
      }
    });
  }

  updateSidebars() {
    const leftSidebar = document.getElementById('players-sidebar-left');
    const rightSidebar = document.getElementById('players-sidebar-right');
    if (!leftSidebar || !rightSidebar) return;
    
    leftSidebar.innerHTML = '';
    rightSidebar.innerHTML = '';
    
    const activePicker = (this.state === 'FORK_PICK') ? this.pickOrder[this.pickIndex] : null;

    this.players.forEach((p, idx) => {
      if (p.type === 'CLOSED') return;
      
      const card = document.createElement('div');
      card.className = 'sidebar-card';
      card.style.setProperty('--player-color', p.color);
      
      if (activePicker && activePicker.id === p.id) {
        card.classList.add('active-turn');
      }
      
      let statusText = '';
      let statusClass = '';
      
      if (this.state === 'SETUP') {
        statusText = p.type === 'HUMAN' ? 'Human' : 'CPU';
      } else if (this.state === 'AIMING_1' || this.state === 'AIMING_2') {
        if (p.isLocked) {
          statusText = 'LOCKED';
          statusClass = 'locked';
        } else {
          statusText = 'AIMING';
          statusClass = 'aiming';
        }
      } else if (this.state === 'FORK_PICK') {
        if (activePicker && activePicker.id === p.id) {
          statusText = 'PICKING...';
          statusClass = 'aiming';
        } else {
          const hasClaimed = this.pizzaSlices.some(s => s.claimedBy && s.claimedBy.id === p.id);
          statusText = hasClaimed ? 'KEEPT' : 'WAITING';
          statusClass = hasClaimed ? 'ready' : '';
        }
      } else {
        statusText = 'READY';
        statusClass = 'ready';
      }
      
      card.innerHTML = `
        <div class="side-avatar">${p.chef.emoji}</div>
        <div class="side-info">
          <div class="side-header">
            <span class="side-name">${p.name}</span>
            <span class="side-score">${p.score}点</span>
          </div>
          <div class="side-status-bar">
            <span class="side-status-text ${statusClass}">${statusText}</span>
            <span class="side-chef-name" style="font-size:0.7rem; opacity:0.7;">${p.chef.name}</span>
          </div>
        </div>
      `;
      
      if (idx < 4) {
        leftSidebar.appendChild(card);
      } else {
        rightSidebar.appendChild(card);
      }
    });
  }

  updateControlsHint() {
    const list = document.getElementById('active-controls-list');
    if (!list) return;
    list.innerHTML = '';
    
    this.players.forEach(p => {
      if (p.type === 'HUMAN') {
        const keys = this.getPlayerKeys(p.id);
        const li = document.createElement('li');
        const ccwLabel  = keys.ccw  === 'ArrowLeft'  ? '←' : keys.ccw.replace('Key', '').replace('Arrow', '').replace('Numpad', 'NUM');
        const cwLabel   = keys.cw   === 'ArrowRight' ? '→' : keys.cw.replace('Key', '').replace('Arrow', '').replace('Numpad', 'NUM');
        const lockLabel = keys.lock === 'Space'      ? 'Space' : keys.lock.replace('Key', '').replace('Arrow', '').replace('Numpad', 'NUM');
        if (keys.universal) {
          li.innerHTML = `<span class="key-cap">P${p.id + 1}</span>: ドラッグ or タッチ / <span class="key-cap">${ccwLabel}</span>・<span class="key-cap">${cwLabel}</span> 回転, <span class="key-cap">${lockLabel}</span> 決定`;
        } else if (p.id === 0) {
          li.innerHTML = `<span class="key-cap">P1</span>: ドラッグ or タッチ / <span class="key-cap">${ccwLabel}</span>・<span class="key-cap">${cwLabel}</span>, <span class="key-cap">${lockLabel}</span> 決定`;
        } else {
          li.innerHTML = `<span class="key-cap">P${p.id + 1}</span>: <span class="key-cap">${ccwLabel}</span>・<span class="key-cap">${cwLabel}</span>, <span class="key-cap">${lockLabel}</span> 決定`;
        }
        list.appendChild(li);
      }
    });
    
    if (list.children.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'CPU vs CPU Game Watching Mode';
      list.appendChild(li);
    }
  }

  getPlayerKeys(id) {
    // オンラインモード or ローカルで人間が1人のみ → 共通キー（どのプレイヤースロットでも同じ操作）
    const humanCount = this.players.filter(p => p.type === 'HUMAN').length;
    if (this.netMode === 'ONLINE' || humanCount <= 1) {
      return { ccw: 'ArrowLeft', cw: 'ArrowRight', lock: 'Space', universal: true };
    }

    // ローカル多人数対戦 → プレイヤーごとの個別キー
    const keyConfigs = [
      { ccw: 'KeyA',     cw: 'KeyD',      lock: 'Space'     }, // P1
      { ccw: 'KeyF',     cw: 'KeyH',      lock: 'KeyG'      }, // P2
      { ccw: 'KeyJ',     cw: 'KeyL',      lock: 'KeyK'      }, // P3
      { ccw: 'ArrowLeft',cw: 'ArrowRight', lock: 'ArrowDown' }, // P4
      { ccw: 'KeyV',     cw: 'KeyN',      lock: 'KeyB'      }, // P5
      { ccw: 'Numpad4',  cw: 'Numpad6',   lock: 'Numpad5'   }, // P6
      { ccw: 'KeyU',     cw: 'KeyO',      lock: 'KeyI'      }, // P7
      { ccw: 'KeyX',     cw: 'KeyZ',      lock: 'KeyC'      }, // P8
    ];
    return keyConfigs[id] || { ccw: '', cw: '', lock: '' };
  }

  firstUnclaimedSliceIndex() {
    for (let i = 0; i < this.pizzaSlices.length; i++) {
      if (!this.pizzaSlices[i].claimedBy) {
        return i;
      }
    }
    return -1;
  }

  createLockSpark(pos) {
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x: pos.x,
        y: pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#ffd32a',
        radius: 2 + Math.random() * 3,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.03
      });
    }
  }

  createCutFlash() {
    this.players.forEach(p => {
      if (p.type === 'CLOSED' || !p.aimAngle) return;
      const lineLen = 800;
      const step = 20;
      for (let d = 0; d < lineLen; d += step) {
        const x = p.platePos.x + Math.cos(p.aimAngle) * d;
        const y = p.platePos.y + Math.sin(p.aimAngle) * d;
        
        if (dist({x, y}, this.pizzaCenter) < this.pizzaRadius + 50) {
          for (let i = 0; i < 2; i++) {
            const angle = p.aimAngle + Math.PI/2 + (Math.random() - 0.5) * 1.5;
            const speed = 1 + Math.random() * 3;
            this.particles.push({
              x: x,
              y: y,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              color: '#ffffff',
              radius: 1.5 + Math.random() * 2,
              life: 0.6,
              decay: 0.05
            });
          }
        }
      }
    });
  }

  createConfetti() {
    const colors = ['#ffd32a', '#ff4757', '#2ecc71', '#3498db', '#9b59b6', '#e67e22'];
    for (let i = 0; i < 100; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 5 + Math.random() * 5,
        life: 1.0,
        decay: 0.005 + Math.random() * 0.005,
        wobble: Math.random() * 360,
        wobbleSpeed: 0.05 + Math.random() * 0.05
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      
      if (p.wobble !== undefined) {
        p.vy = 1.5 + Math.sin(p.wobble) * 0.5;
        p.vx += Math.sin(p.wobble * 0.5) * 0.05;
        p.wobble += p.wobbleSpeed;
      }
      
      p.life -= p.decay;
      
      if (p.life <= 0 || p.y > this.canvas.height + 20) {
        this.particles.splice(i, 1);
      }
    }
    
    if (this.state === 'GAME_OVER' && Math.random() < 0.15) {
      const colors = ['#ffd32a', '#ff4757', '#2ecc71', '#3498db', '#9b59b6', '#e67e22'];
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -10,
        vx: (Math.random() - 0.5) * 3,
        vy: 1.5 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 5 + Math.random() * 5,
        life: 1.0,
        decay: 0.005 + Math.random() * 0.005,
        wobble: Math.random() * 360,
        wobbleSpeed: 0.05 + Math.random() * 0.05
      });
    }
  }

  isAimingState() {
    return this.state === 'AIMING_1' || this.state === 'AIMING_2';
  }

  showRoundSummary() {
    const scoreList = document.getElementById('round-score-list');
    scoreList.innerHTML = '';

    const active = this.players.filter(p => p.type !== 'CLOSED');
    active.sort((a, b) => b.roundScore - a.roundScore);

    const isScoreMode = this.winMode === 'SCORE';

    // タイトルを先に書き換えてから id="summary-round-num" を再確立する
    const summaryTitle = document.querySelector('#round-summary-overlay h2');
    if (summaryTitle) {
      if (isScoreMode) {
        summaryTitle.innerHTML = `ROUND <span id="summary-round-num">${this.round}</span> 結果 <span class="summary-target-badge">🎯 目標: ${this.winScore}点</span>`;
      } else {
        summaryTitle.innerHTML = `ROUND <span id="summary-round-num">${this.round}</span> 結果`;
      }
    } else {
      document.getElementById('summary-round-num').textContent = this.round;
    }

    active.forEach((p, idx) => {
      const row = document.createElement('div');
      row.className = 'summary-row';

      let progressHtml = '';
      if (isScoreMode) {
        const pct = Math.min(100, Math.round((p.score / this.winScore) * 100));
        progressHtml = `
          <div class="score-progress-bar">
            <div class="score-progress-fill" style="width:${pct}%; background:${p.color}"></div>
            <span class="score-progress-label">${p.score} / ${this.winScore} 点 (${pct}%)</span>
          </div>`;
      }

      row.innerHTML = `
        <span class="summary-rank">#${idx + 1}</span>
        <span class="summary-chef">${p.chef.emoji}</span>
        <span class="summary-name">${p.chef.name} (P${p.id + 1})</span>
        <div class="summary-score-details">
          <span class="summary-added-score">+${p.roundScore} 点</span>
          <span class="summary-total">累計: ${p.score} 点</span>
        </div>
        ${progressHtml}
      `;
      scoreList.appendChild(row);
    });

    // スコア先取り制のとき、誰かが目標達成済みならボタンを「最終結果へ」に変える
    const nextBtn = document.getElementById('next-round-btn');
    if (isScoreMode) {
      const alreadyWon = active.some(p => p.score >= this.winScore);
      nextBtn.textContent = alreadyWon ? '🏆 最終結果へ' : '次のラウンドへ ➡️';
    } else {
      const isLastRound = this.round >= this.maxRounds;
      nextBtn.textContent = isLastRound ? '🏆 最終結果へ' : '次のラウンドへ ➡️';
    }

    document.getElementById('round-summary-overlay').classList.add('active');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.pizzaGame = new PizzaGame();
});
