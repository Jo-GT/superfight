const canvas = document.querySelector('#arena');
const ctx = canvas.getContext('2d');
const keys = new Set();
const pressed = new Set();
const message = document.querySelector('#message');
const timerEl = document.querySelector('#timer');
const overlay = document.querySelector('#start-overlay');
const footerState = document.querySelector('#footer-state');
const menuScreen = document.querySelector('#menu-screen');
const outfitSelect = document.querySelector('#outfit-select');
const characterNames = { cyclops: 'CYCLOPS', wolverine: 'WOLVERINE' };
const costumeOptions = {
  cyclops: [['default', '01 [Default]'], ['red', '03 [Red]'], ['cable', "07 [Cable '97]"]],
  wolverine: [['blue', '04 [Blue]'], ['classic', '06 [Classic]'], ['stealth', '08 [Stealth]']]
};
const difficultyProfiles = {
  easy: { approachSpeed: 1.2, attackChance: .018, reaction: 0, idealRange: 220, specialChance: .08 },
  normal: { approachSpeed: 1.9, attackChance: .035, reaction: .12, idealRange: 180, specialChance: .18 },
  hard: { approachSpeed: 2.7, attackChance: .06, reaction: .24, idealRange: 145, specialChance: .32 }
};
let selectedKind = 'cyclops';
let selectedCostume = 'default';
let selectedDifficulty = 'easy';

const W = canvas.width;
const FLOOR = 574;
const assets = {
  cyclops: { root: 'Sprites/Cyclops/01 [Default]/', idle: ['Idle_00.png','Idle_01.png','Idle_02.png','Idle_03.png','Idle_04.png','Idle_05.png','Idle_06.png','Idle_07.png'], walk: ['Walk_00.png','Walk_01.png','Walk_02.png','Walk_03.png','Walk_04.png','Walk_05.png','Walk_06.png','Walk_07.png'], attack: ['Attack1_00.png','Attack1_01.png','Attack1_02.png','Attack1_03.png','Attack1_04.png','Attack1_05.png','Attack1_06.png','Attack1_07.png','Attack1_08.png'], power: ['Powerstart_00.png','Powerstart_01.png','Powerstart_02.png','Power_00.png','Power_01.png','Power_02.png','Power_03.png','Power_04.png','Power_05.png','Power_06.png'], special: ['Specialprojectile_000-008.png','Specialprojectile_009.png','Specialprojectile_010.png','Specialprojectile_011.png','Specialprojectile_012.png','Specialprojectile_013.png','Specialprojectile_014.png','Specialprojectile_015.png'], jump: ['Jump_00.png','Jump_01.png','Jumpapex_00.png','Jumpapex_01.png','Jumpapex_02.png','Jumpfall_00.png','Jumpfall_01.png'], dodge: ['Dodge_00.png','Dodge_01.png','Dodge_02.png','Dodge_03.png','Dodge_04.png','Dodge_05.png'], hit: ['Hitstun_00.png','Hitstun_01.png'] },
  wolverine: { root: 'Sprites/Wolverine/04 [Blue]/', idle: ['Idle_00_10.png','Idle_01_11.png','Idle_02_12.png','Idle_03_13.png','Idle_04_14.png','Idle_05_15.png','Idle_06_16.png','Idle_07_17.png','Idle_08_18.png','Idle_20.png','Idle_21.png','Idle_22.png','Idle_23.png'], walk: ['Walk_00.png','Walk_01.png','Walk_02.png','Walk_03.png','Walk_04.png','Walk_05.png','Walk_06.png','Walk_07.png'], attack: ['Attack1_00.png','Attack1_01-02.png','Attack1_03.png','Attack2_00.png','Attack2_01.png','Attack2_02.png','Attack2_03.png','Attack2_04.png','Attack2_05.png'], power: ['Attackchargedstart_00.png','Attackchargedheld_00.png','Attackchargedheld_01.png','Attackcharged_00.png','Attackcharged_01.png','Attackcharged_02.png','Attackcharged_03.png','Attackcharged_04.png','Attackcharged_05.png'], special: ['Specialstart_00.png','Specialstart_01.png','Specialstart_02_04.png','Specialstart_03_05.png','Special1_00.png','Special1_01.png','Special1_02.png','Special1_03.png','Special1_04.png','Special1_05.png'], jump: ['Jump_00.png','Jump_01.png','Jumpapex_00.png','Jumpapex_01.png','Jumpapex_02.png','Jumpfall_00.png','Jumpfall_01.png'], dodge: ['Dodge_00.png','Dodge_01.png','Dodge_02.png','Dodge_03.png','Dodge_04.png','Dodge_05.png'], hit: ['Hitstun_00.png','Hitstun_01.png'] }
};

function setCostume(kind, costume) {
  const folder = costumeOptions[kind].find(([id]) => id === costume)?.[1] || costumeOptions[kind][0][1];
  assets[kind].root = `Sprites/${kind === 'cyclops' ? 'Cyclops' : 'Wolverine'}/${folder}/`;
}
function populateOutfits() {
  outfitSelect.innerHTML = costumeOptions[selectedKind].map(([id, label]) => `<option value="${id}">${label}</option>`).join('');
  outfitSelect.value = selectedCostume;
}
function selectCharacter(kind) {
  selectedKind = kind;
  selectedCostume = costumeOptions[kind][0][0];
  document.querySelectorAll('.character-card').forEach(card => card.classList.toggle('selected', card.dataset.character === kind));
  populateOutfits();
}

const loaded = new Map();
function imageFor(path) { if (!loaded.has(path)) { const image = new Image(); image.src = path; loaded.set(path, image); } return loaded.get(path); }
function framePath(fighter, state, frame) { const list = assets[fighter.kind][state] || assets[fighter.kind].idle; return assets[fighter.kind].root + list[Math.min(frame, list.length - 1)]; }

class Fighter {
  constructor(kind, x, facing, cpu = false, difficulty = 'normal') { this.kind = kind; this.x = x; this.y = FLOOR; this.vy = 0; this.facing = facing; this.cpu = cpu; this.aiProfile = difficultyProfiles[difficulty]; this.aiDecisionClock = 260; this.health = 100; this.meter = 0; this.state = 'idle'; this.frame = 0; this.frameClock = 0; this.stateTime = 0; this.attackCooldown = 0; this.invulnerable = 0; this.hitFlash = 0; this.combo = 0; }
  get grounded() { return this.y >= FLOOR; }
  setState(state) { if (this.state !== state) { this.state = state; this.frame = 0; this.frameClock = 0; this.stateTime = 0; } }
  animate(dt) { this.frameClock += dt; this.stateTime += dt; const rate = this.state === 'idle' ? 115 : 82; if (this.frameClock > rate) { this.frameClock = 0; this.frame += 1; const frames = assets[this.kind][this.state] || assets[this.kind].idle; if (this.frame >= frames.length) { if (['attack','power','special','dodge','hit'].includes(this.state)) this.setState('idle'); else this.frame = 0; } } }
  takeHit(damage, push) { if (this.invulnerable > 0 || this.health <= 0) return; this.health = Math.max(0, this.health - damage); this.meter = Math.min(3, this.meter + .35); this.hitFlash = 130; this.setState('hit'); this.x += push; }
  attack(type) { if (this.attackCooldown > 0 || this.state !== 'idle' || !this.grounded) return false; const cost = type === 'special' ? 3 : type === 'power' ? 1 : 0; if (this.meter < cost) return false; this.meter -= cost; this.setState(type); this.attackCooldown = type === 'attack' ? 370 : type === 'power' ? 640 : 1100; return true; }
  update(dt, opponent) {
    this.attackCooldown = Math.max(0, this.attackCooldown - dt); this.invulnerable = Math.max(0, this.invulnerable - dt); this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.health <= 0) { this.setState('hit'); this.animate(dt); return; }
    if (this.state === 'hit') { this.animate(dt); return; }
    if (this.state === 'attack' || this.state === 'power' || this.state === 'special') { this.animate(dt); if (this.stateTime > (this.state === 'special' ? 620 : this.state === 'power' ? 380 : 260)) this.checkStrike(opponent); return; }
    if (this.state === 'dodge') { this.invulnerable = 80; this.x += this.facing * 5; this.animate(dt); return; }
    if (!this.grounded) { this.vy += .75 * dt / 16; this.y += this.vy * dt / 16; if (this.y >= FLOOR) { this.y = FLOOR; this.vy = 0; } this.setState(this.vy < 0 ? 'jump' : 'jump'); this.animate(dt); return; }
    if (this.cpu) this.ai(opponent, dt); else this.playerInput(dt);
    this.x = Math.max(90, Math.min(W - 90, this.x));
    this.facing = opponent.x >= this.x ? 1 : -1;
    this.animate(dt);
  }
  playerInput(dt) { const left = keys.has('ArrowLeft'), right = keys.has('ArrowRight'); if (left || right) { this.x += (right ? 1 : -1) * 4.2 * dt / 16; this.setState('walk'); } else this.setState('idle'); if (pressed.has('ArrowUp')) { this.vy = -15; this.y -= 2; this.setState('jump'); } if (pressed.has('ArrowDown')) { this.setState('dodge'); this.invulnerable = 300; } if (pressed.has('x')) this.attack('attack'); if (pressed.has('a')) this.attack('power'); if (pressed.has('s')) this.attack('special'); }
  ai(opponent, dt) { const profile = this.aiProfile; const distance = Math.abs(opponent.x - this.x); this.aiDecisionClock -= dt; if (profile.reaction && opponent.state === 'attack' && distance < 210 && Math.random() < profile.reaction * dt / 16) { this.setState('dodge'); this.invulnerable = 300; return; } if (distance > profile.idealRange) { this.x += this.facing * profile.approachSpeed * dt / 16; this.setState('walk'); return; } if (this.attackCooldown <= 0 && this.aiDecisionClock <= 0 && Math.random() < profile.attackChance * dt / 16) { this.aiDecisionClock = 260 / (profile.approachSpeed / 1.2); if (this.meter >= 3 && Math.random() < profile.specialChance) this.attack('special'); else if (this.meter >= 1 && Math.random() < .3 + profile.specialChance) this.attack('power'); else this.attack('attack'); return; } this.setState('idle'); }
  checkStrike(opponent) { if (this.stateTime < 190 || this.stateTime > 240) return; const reach = this.state === 'special' ? 330 : this.state === 'power' ? 270 : 145; if (Math.abs(opponent.x - this.x) < reach && Math.abs(opponent.y - this.y) < 180) { const damage = this.state === 'special' ? 24 : this.state === 'power' ? 12 : 6; opponent.takeHit(damage, this.facing * 28); this.meter = Math.min(3, this.meter + .6); this.combo += 1; this.stateTime = 1000; } }
  draw() { const image = imageFor(framePath(this, this.state, this.frame)); if (!image.complete) return; ctx.save(); if (this.hitFlash > 0) ctx.globalAlpha = .55; const scale = 1.42, width = 256 * scale, height = 256 * scale; ctx.translate(this.x, this.y - 226); ctx.scale(this.facing * scale, scale); ctx.drawImage(image, -128, -30, 256, 256); ctx.restore(); if (this.invulnerable > 0) { ctx.strokeStyle = '#f8c947'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.x, this.y - 112, 65, 0, Math.PI * 2); ctx.stroke(); } }
}

let running = false, roundTime = 99, last = performance.now(), secondClock = 0;
let p1 = new Fighter('cyclops', 350, 1), p2 = new Fighter('wolverine', 930, -1, true, selectedDifficulty);
function reset() { setCostume(selectedKind, selectedCostume); const opponentKind = selectedKind === 'cyclops' ? 'wolverine' : 'cyclops'; setCostume(opponentKind, costumeOptions[opponentKind][0][0]); p1 = new Fighter(selectedKind, 350, 1); p2 = new Fighter(opponentKind, 930, -1, true, selectedDifficulty); document.querySelector('#p1-name').textContent = characterNames[selectedKind]; document.querySelector('#p2-name').textContent = characterNames[opponentKind]; roundTime = 99; message.textContent = 'FIGHT!'; }
function drawArena() { const sky = ctx.createLinearGradient(0, 0, 0, FLOOR); sky.addColorStop(0, '#172b35'); sky.addColorStop(1, '#50605b'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, canvas.height); ctx.fillStyle = '#253942'; ctx.fillRect(0, 340, W, FLOOR - 340); ctx.strokeStyle = 'rgba(103,225,224,.18)'; ctx.lineWidth = 2; for (let x = -600; x < W + 600; x += 80) { ctx.beginPath(); ctx.moveTo(W / 2, FLOOR); ctx.lineTo(x, canvas.height); ctx.stroke(); } ctx.strokeStyle = 'rgba(248,201,71,.32)'; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.stroke(); ctx.fillStyle = '#17252b'; ctx.fillRect(0, FLOOR + 3, W, canvas.height - FLOOR); ctx.fillStyle = 'rgba(248,201,71,.5)'; ctx.font = '700 16px Space Mono'; ctx.fillText('SECTOR 09', 42, 48); ctx.fillText('NO EXIT', W - 130, 48); }
function updateHud() { document.querySelector('#p1-health').style.width = `${p1.health}%`; document.querySelector('#p2-health').style.width = `${p2.health}%`; document.querySelector('#p1-meter').style.width = `${p1.meter / 3 * 100}%`; document.querySelector('#p2-meter').style.width = `${p2.meter / 3 * 100}%`; }
function loop(now) { const dt = Math.min(34, now - last); last = now; if (running) { secondClock += dt; if (secondClock > 1000) { secondClock = 0; roundTime = Math.max(0, roundTime - 1); } p1.update(dt, p2); p2.update(dt, p1); updateHud(); if (p1.health <= 0 || p2.health <= 0 || roundTime <= 0) { running = false; const winner = p1.health > p2.health ? 'CYCLOPS TAKES IT' : 'WOLVERINE TAKES IT'; message.textContent = roundTime <= 0 && p1.health === p2.health ? 'TIME' : winner; footerState.textContent = 'PRESS ENTER TO REMATCH'; overlay.classList.remove('hidden'); overlay.querySelector('h2').textContent = message.textContent; overlay.querySelector('.eyebrow').textContent = 'ROUND OVER'; } timerEl.textContent = String(roundTime).padStart(2, '0'); } drawArena(); p1.draw(); p2.draw(); pressed.clear(); requestAnimationFrame(loop); }
function start() { reset(); running = true; menuScreen.classList.add('hidden'); overlay.classList.add('hidden'); footerState.textContent = `ROUND ACTIVE // ${selectedDifficulty.toUpperCase()} CPU`; last = performance.now(); }
window.addEventListener('keydown', event => { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','x','a','s','Enter'].includes(key)) event.preventDefault(); if (!keys.has(key)) pressed.add(key); keys.add(key); if (key === 'Enter' && !running) start(); });
window.addEventListener('keyup', event => { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; keys.delete(key); });
document.querySelectorAll('.character-card').forEach(card => card.addEventListener('click', () => selectCharacter(card.dataset.character)));
document.querySelectorAll('.difficulty').forEach(button => button.addEventListener('click', () => { selectedDifficulty = button.dataset.difficulty; document.querySelectorAll('.difficulty').forEach(option => option.classList.toggle('selected', option === button)); }));
outfitSelect.addEventListener('change', () => { selectedCostume = outfitSelect.value; });
document.querySelector('#start-button').addEventListener('click', start);
document.querySelector('#rematch-button').addEventListener('click', start);
populateOutfits();
requestAnimationFrame(loop);
