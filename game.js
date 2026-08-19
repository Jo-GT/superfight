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
const pauseOverlay = document.querySelector('#pause-overlay');
const pauseMenu = document.querySelector('#pause-menu');
const moveList = document.querySelector('#move-list');
const moveListName = document.querySelector('#move-list-name');
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
const FIGHTER_SCALE = 1.65;
const assets = {
  cyclops: { root: 'Sprites/Cyclops/01 [Default]/', projectileRoot: 'Sprites/Cyclops/', idle: ['Idle_00.png','Idle_01.png','Idle_02.png','Idle_03.png','Idle_04.png','Idle_05.png','Idle_06.png','Idle_07.png'], walk: ['Walk_00.png','Walk_01.png','Walk_02.png','Walk_03.png','Walk_04.png','Walk_05.png','Walk_06.png','Walk_07.png'], attack: ['Attack1_00.png','Attack1_01.png','Attack1_02.png','Attack1_03.png','Attack1_04.png','Attack1_05.png','Attack1_06.png','Attack1_07.png','Attack1_08.png'], airAttack: ['Attackairstart_00.png','Attackairstart_01.png','Attackairstart_02.png','Attackairstart_03.png','Attackair_00.png','Attackair_01.png','Attackairland_00.png','Attackairland_01.png','Attackairland_02.png','Attackairland_03.png'], power: ['Powerstart_00.png','Powerstart_01.png','Power_00.png','Power_01.png','Power_02.png','Power_03.png','Power_04.png','Power_05.png','Power_06.png'], special: ['Special_000-002.png','Special_003-006.png','Special_007-008.png','Special_009-010.png','Special_011-012.png','Special_013.png','Special_014-016.png','Special_017-019.png','Special_020.png','Special_021-022.png','Special_023-025.png','Special_026.png','Special_027.png','Special_028.png','Special_029.png','Special_030.png','Special_031.png','Special_032.png','Special_033.png','Special_034.png','Special_035.png','Special_036.png','Special_037.png','Special_038.png','Special_039.png','Special_040.png'], jump: ['Jump_00.png','Jump_01.png','Jumpapex_00.png','Jumpapex_01.png','Jumpapex_02.png','Jumpfall_00.png','Jumpfall_01.png'], dodge: ['Dodge_00.png','Dodge_01.png','Dodge_02.png','Dodge_03.png','Dodge_04.png','Dodge_05.png'], hit: ['Hitstun_00.png','Hitstun_01.png'] },
  wolverine: { root: 'Sprites/Wolverine/04 [Blue]/', idle: ['Idle_00_10.png','Idle_01_11.png','Idle_02_12.png','Idle_03_13.png','Idle_04_14.png','Idle_05_15.png','Idle_06_16.png','Idle_07_17.png','Idle_08_18.png','Idle_20.png','Idle_21.png','Idle_22.png','Idle_23.png'], walk: ['Walk_00.png','Walk_01.png','Walk_02.png','Walk_03.png','Walk_04.png','Walk_05.png','Walk_06.png','Walk_07.png'], attack: ['Attack1_00.png','Attack1_01-02.png','Attack1_03.png','Attack2_00.png','Attack2_01.png','Attack2_02.png','Attack2_03.png','Attack2_04.png','Attack2_05.png'], airAttack: ['Attackairstart_00.png','Attackair_00.png','Attackair_01.png','Attackairland_00.png','Attackairland_01.png','Attackairland_02.png','Attackairland_03.png'], power: ['Attackchargedstart_00.png','Attackchargedheld_00.png','Attackchargedheld_01.png','Attackcharged_00.png','Attackcharged_01.png','Attackcharged_02.png','Attackcharged_03.png','Attackcharged_04.png','Attackcharged_05.png'], special: ['Specialstart_00.png','Specialstart_01.png','Specialstart_02_04.png','Specialstart_03_05.png','Special1_00.png','Special1_01.png','Special1_02.png','Special1_03.png','Special1_04.png','Special1_05.png'], jump: ['Jump_00.png','Jump_01.png','Jumpapex_00.png','Jumpapex_01.png','Jumpapex_02.png','Jumpfall_00.png','Jumpfall_01.png'], dodge: ['Dodge_00.png','Dodge_01.png','Dodge_02.png','Dodge_03.png','Dodge_04.png','Dodge_05.png','Dodge_06.png','Dodge_07.png','Dodge_08.png','Dodge_09.png'], hit: ['Hitstun_00.png','Hitstun_01.png'] }
};
assets.cyclops.attackStages = [
  ['Attack1_00.png','Attack1_01.png','Attack1_02.png','Attack1_03.png','Attack1_04.png','Attack1_05.png','Attack1_06.png','Attack1_07.png','Attack1_08.png'],
  ['Attack2_00.png','Attack2_01.png','Attack2_02.png','Attack2_03.png','Attack2_04.png','Attack2_05.png','Attack2_06.png'],
  ['Attack3_00.png','Attack3_01.png','Attack3_02.png','Attack3_03.png','Attack3_04-05.png','Attack3_06.png','Attack3_07.png'],
  ['Attack4_00.png','Attack4_01.png','Attack4_02.png','Attack4_03.png','Attack4_04_06.png','Attack4_05_07.png','Attack4_08.png','Attack4_09.png','Attack4_10.png','Attack4_11.png','Attack4_12.png']
];
const projectileFrames = {
  attack1: ['Attack1projectile_00.png','Attack1projectile_01.png','Attack1projectile_02.png','Attack1projectile_03.png','Attack1projectile_04.png','Attack1projectile_05.png'],
  attack4: ['Attack4projectile_00.png','Attack4projectile_01.png','Attack4projectile_02.png','Attack4projectile_03.png','Attack4projectile_04.png','Attack4projectile_05.png','Attack4projectile_06.png','Attack4projectile_07.png','Attack4projectile_08.png'],
  power: ['Powerprojectilestart_00.png','Powerprojectilestart_01.png','Powerprojectilestart_02.png','Powerprojectilestart_03.png','Powerprojectile_00.png','Powerprojectile_01.png','Powerprojectile_02.png','Powerprojectile_03.png','Powerprojectile_04.png','Powerprojectile_05.png','Powerprojectile_06.png','Powerprojectile_07.png'],
  special: ['Specialprojectile_000-008.png','Specialprojectile_009.png','Specialprojectile_010.png','Specialprojectile_011.png','Specialprojectile_012.png','Specialprojectile_013.png','Specialprojectile_014.png','Specialprojectile_015.png','Specialprojectile_016.png','Specialprojectile_017.png','Specialprojectile_018.png','Specialprojectile_019.png','Specialprojectile_020.png','Specialprojectile_021.png','Specialprojectile_022-023.png','Specialprojectile_024.png','Specialprojectile_025.png','Specialprojectile_026.png','Specialprojectile_027.png','Specialprojectile_028.png','Specialprojectile_029.png','Specialprojectile_030.png','Specialprojectile_031.png','Specialprojectile_032.png','Specialprojectile_033.png','Specialprojectile_034.png','Specialprojectile_035.png','Specialprojectile_036.png','Specialprojectile_037.png','Specialprojectile_038.png','Specialprojectile_039.png','Specialprojectile_040.png']
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
function framePath(fighter, state, frame) { const list = state === 'attack' && assets[fighter.kind].attackStages ? assets[fighter.kind].attackStages[fighter.attackStage - 1] : assets[fighter.kind][state] || assets[fighter.kind].idle; return assets[fighter.kind].root + list[Math.min(frame, list.length - 1)]; }
let projectiles = [];

class Projectile {
  constructor(owner, type) { this.owner = owner; this.type = type; this.x = owner.x + owner.facing * 105; this.y = owner.y - (type === 'special' ? 120 : type === 'attack1' || type === 'attack4' ? 115 : 95); this.direction = owner.facing; this.frame = 0; this.frameClock = 0; this.age = 0; this.hit = false; this.speed = type === 'special' ? 8.5 : type === 'attack4' ? 12 : 10; this.damage = type === 'special' ? 24 : type === 'attack4' ? 10 : type === 'attack1' ? 4 : 12; }
  update(dt, opponent) { this.age += dt; this.frameClock += dt; this.x += this.direction * this.speed * dt / 16; if (this.frameClock > 75) { this.frameClock = 0; this.frame += 1; } if (!this.hit && Math.abs(opponent.x - this.x) < (this.type === 'special' ? 115 : 75) && Math.abs(opponent.y - this.y) < 150) { opponent.takeHit(this.damage, this.direction * 34); this.owner.meter = Math.min(3, this.owner.meter + .6); if (this.type === 'attack1' || this.type === 'attack4') { this.owner.combo = Math.min(10, this.owner.combo + 1); this.owner.chainStage = this.owner.attackStage; } this.owner.comboTimer = 900; this.hit = true; } return this.age < (this.type === 'special' ? 2400 : 1100) && this.x > -250 && this.x < W + 250 && !this.hit; }
  draw() { const list = projectileFrames[this.type]; const path = assets.cyclops.projectileRoot + list[Math.min(this.frame, list.length - 1)]; const image = imageFor(path); if (!image.complete || !image.naturalWidth) return; const targetHeight = this.type === 'special' ? 240 : this.type === 'attack4' ? 140 : this.type === 'attack1' ? 110 : 140; const drawHeight = targetHeight; const drawWidth = image.naturalWidth / image.naturalHeight * drawHeight; ctx.save(); ctx.translate(this.x, this.y); ctx.scale(this.direction, 1); ctx.globalAlpha = this.type === 'special' ? .98 : 1; ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight); ctx.restore(); }
}

class Fighter {
  constructor(kind, x, facing, cpu = false, difficulty = 'normal') { this.kind = kind; this.x = x; this.y = FLOOR; this.vy = 0; this.facing = facing; this.cpu = cpu; this.aiProfile = difficultyProfiles[difficulty]; this.aiDecisionClock = 260; this.maxHealth = 120; this.health = this.maxHealth; this.meter = 0; this.state = 'idle'; this.frame = 0; this.frameClock = 0; this.stateTime = 0; this.attackCooldown = 0; this.invulnerable = 0; this.hitFlash = 0; this.combo = 0; this.comboTimer = 0; this.chainStage = 0; this.attackStage = 1; this.projectileSpawned = false; this.strikeConfirmed = false; }
  get grounded() { return this.y >= FLOOR; }
  setState(state) { if (this.state !== state) { this.state = state; this.frame = 0; this.frameClock = 0; this.stateTime = 0; } }
  animate(dt) { this.frameClock += dt; this.stateTime += dt; const rate = this.state === 'idle' ? 115 : 82; if (this.frameClock > rate) { this.frameClock = 0; this.frame += 1; const frames = this.state === 'attack' && assets[this.kind].attackStages ? assets[this.kind].attackStages[this.attackStage - 1] : assets[this.kind][this.state] || assets[this.kind].idle; if (this.frame >= frames.length) { if (['attack','airAttack','power','special','dodge','hit'].includes(this.state)) this.setState('idle'); else this.frame = 0; } } }
  takeHit(damage, push) { if (this.invulnerable > 0 || this.health <= 0) return; this.health = Math.max(0, this.health - damage); this.meter = Math.min(3, this.meter + .35); this.hitFlash = 130; this.setState('hit'); this.x += push; }
  attack(type) { if (this.attackCooldown > 0 || this.state !== 'idle' || !this.grounded) return false; const cost = type === 'special' ? 3 : type === 'power' ? 1 : 0; if (this.meter < cost) return false; this.meter -= cost; this.attackStage = type === 'attack' && this.comboTimer > 0 ? Math.min(4, this.chainStage + 1) : 1; this.projectileSpawned = false; this.setState(type); this.strikeConfirmed = false; this.attackCooldown = type === 'attack' ? 370 : type === 'power' ? 640 : 1100; return true; }
  update(dt, opponent) {
    this.attackCooldown = Math.max(0, this.attackCooldown - dt); this.invulnerable = Math.max(0, this.invulnerable - dt); this.hitFlash = Math.max(0, this.hitFlash - dt); this.comboTimer = Math.max(0, this.comboTimer - dt); if (this.comboTimer === 0) { this.combo = 0; this.chainStage = 0; }
    if (this.health <= 0) { this.setState('hit'); this.animate(dt); return; }
    if (this.state === 'hit') { this.animate(dt); return; }
    if (this.state === 'attack' || this.state === 'airAttack' || this.state === 'power' || this.state === 'special') { this.checkStrike(opponent); const comboProjectile = this.state === 'attack' && (this.attackStage === 1 || this.attackStage === 4); if (this.kind === 'cyclops' && comboProjectile && !this.projectileSpawned && this.stateTime >= 230) { projectiles.push(new Projectile(this, this.attackStage === 4 ? 'attack4' : 'attack1')); this.projectileSpawned = true; } if (this.kind === 'cyclops' && (this.state === 'power' || this.state === 'special') && !this.projectileSpawned && this.stateTime >= (this.state === 'special' ? 180 : 260)) { projectiles.push(new Projectile(this, this.state)); this.projectileSpawned = true; this.strikeConfirmed = true; } this.animate(dt); return; }
    if (this.state === 'dodge') { this.invulnerable = 80; this.x += this.facing * 5; this.animate(dt); return; }
    if (!this.grounded) { if (pressed.has('x') && this.state === 'jump') { this.attackStage = 1; this.projectileSpawned = false; this.strikeConfirmed = false; this.setState('airAttack'); this.vy = Math.min(this.vy, 1); } this.vy += .75 * dt / 16; this.y += this.vy * dt / 16; if (this.y >= FLOOR) { this.y = FLOOR; this.vy = 0; } if (this.state !== 'airAttack') this.setState('jump'); this.animate(dt); return; }
    if (this.cpu) this.ai(opponent, dt); else this.playerInput(dt);
    this.x = Math.max(90, Math.min(W - 90, this.x));
    this.facing = opponent.x >= this.x ? 1 : -1;
    this.animate(dt);
  }
  playerInput(dt) { const left = keys.has('ArrowLeft'), right = keys.has('ArrowRight'); if (left || right) { this.x += (right ? 1 : -1) * 4.2 * dt / 16; this.setState('walk'); } else this.setState('idle'); if (pressed.has('ArrowUp')) { this.vy = -15; this.y -= 2; this.setState('jump'); } if (pressed.has('ArrowDown')) { this.setState('dodge'); this.invulnerable = 300; } if (pressed.has('x')) this.attack('attack'); if (pressed.has('a')) this.attack('power'); if (pressed.has('s')) this.attack('special'); }
  ai(opponent, dt) { const profile = this.aiProfile; const distance = Math.abs(opponent.x - this.x); this.aiDecisionClock -= dt; if (profile.reaction && opponent.state === 'attack' && distance < 210 && Math.random() < profile.reaction * dt / 16) { this.setState('dodge'); this.invulnerable = 300; return; } if (distance > profile.idealRange) { this.x += this.facing * profile.approachSpeed * dt / 16; this.setState('walk'); return; } if (this.attackCooldown <= 0 && this.aiDecisionClock <= 0 && Math.random() < profile.attackChance * dt / 16) { this.aiDecisionClock = 260 / (profile.approachSpeed / 1.2); if (this.meter >= 3 && Math.random() < profile.specialChance) this.attack('special'); else if (this.meter >= 1 && Math.random() < .3 + profile.specialChance) this.attack('power'); else this.attack('attack'); return; } this.setState('idle'); }
  checkStrike(opponent) { if (this.strikeConfirmed) return; const isCyclopsBeam = this.kind === 'cyclops' && (this.state === 'power' || this.state === 'special'); if (isCyclopsBeam) return; const windows = this.state === 'airAttack' ? [140, 400] : this.state === 'attack' ? [140, 330] : this.state === 'power' ? [260, 560] : [480, 900]; const [start, end] = windows; if (this.stateTime < start || this.stateTime > end) return; const reach = this.state === 'airAttack' ? 155 : this.state === 'special' ? 260 : this.state === 'power' ? 210 : 175; const damage = this.state === 'airAttack' ? 8 : this.state === 'special' ? 24 : this.state === 'power' ? 12 : 6; if (Math.abs(opponent.x - this.x) < reach && Math.abs(opponent.y - this.y) < 180) { opponent.takeHit(damage, this.facing * 28); this.meter = Math.min(3, this.meter + .6); if (this.state === 'attack' || this.state === 'airAttack') { this.combo = Math.min(10, this.combo + 1); this.chainStage = this.attackStage; this.comboTimer = 900; } this.strikeConfirmed = true; } }
  draw() { const image = imageFor(framePath(this, this.state, this.frame)); if (!image.complete) return; ctx.save(); if (this.hitFlash > 0) ctx.globalAlpha = .55; ctx.translate(this.x, this.y); ctx.scale(this.facing * FIGHTER_SCALE, FIGHTER_SCALE); ctx.drawImage(image, -128, -224, 256, 256); ctx.restore(); if (this.invulnerable > 0) { ctx.strokeStyle = '#f8c947'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.x, this.y - 112, 65, 0, Math.PI * 2); ctx.stroke(); } }
}

let running = false, paused = false, roundTime = 99, last = performance.now(), secondClock = 0;
let p1 = new Fighter('cyclops', 350, 1), p2 = new Fighter('wolverine', 930, -1, true, selectedDifficulty);
function reset() { setCostume(selectedKind, selectedCostume); const opponentKind = selectedKind === 'cyclops' ? 'wolverine' : 'cyclops'; setCostume(opponentKind, costumeOptions[opponentKind][0][0]); p1 = new Fighter(selectedKind, 350, 1); p2 = new Fighter(opponentKind, 930, -1, true, selectedDifficulty); document.querySelector('#p1-name').textContent = characterNames[selectedKind]; document.querySelector('#p2-name').textContent = characterNames[opponentKind]; document.querySelector('#controls-name').textContent = characterNames[selectedKind]; roundTime = 99; message.textContent = 'FIGHT!'; }
function drawArena() { const sky = ctx.createLinearGradient(0, 0, 0, FLOOR); sky.addColorStop(0, '#172b35'); sky.addColorStop(1, '#50605b'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, canvas.height); ctx.fillStyle = '#253942'; ctx.fillRect(0, 340, W, FLOOR - 340); ctx.strokeStyle = 'rgba(103,225,224,.18)'; ctx.lineWidth = 2; for (let x = -600; x < W + 600; x += 80) { ctx.beginPath(); ctx.moveTo(W / 2, FLOOR); ctx.lineTo(x, canvas.height); ctx.stroke(); } ctx.strokeStyle = 'rgba(248,201,71,.32)'; ctx.beginPath(); ctx.moveTo(0, FLOOR); ctx.lineTo(W, FLOOR); ctx.stroke(); ctx.fillStyle = '#17252b'; ctx.fillRect(0, FLOOR + 3, W, canvas.height - FLOOR); ctx.fillStyle = 'rgba(248,201,71,.5)'; ctx.font = '700 16px Space Mono'; ctx.fillText('SECTOR 09', 42, 48); ctx.fillText('NO EXIT', W - 130, 48); }
function updateHud() { document.querySelector('#p1-health').style.width = `${p1.health / p1.maxHealth * 100}%`; document.querySelector('#p2-health').style.width = `${p2.health / p2.maxHealth * 100}%`; document.querySelector('#p1-meter').style.width = `${p1.meter / 3 * 100}%`; document.querySelector('#p2-meter').style.width = `${p2.meter / 3 * 100}%`; document.querySelector('#p1-combo').textContent = `x${p1.combo}`; document.querySelector('#p2-combo').textContent = `x${p2.combo}`; }
function loop(now) { const dt = Math.min(34, now - last); last = now; if (running && !paused) { secondClock += dt; if (secondClock > 1000) { secondClock = 0; roundTime = Math.max(0, roundTime - 1); } p1.update(dt, p2); p2.update(dt, p1); projectiles = projectiles.filter(projectile => projectile.update(dt, projectile.owner === p1 ? p2 : p1)); updateHud(); if (p1.health <= 0 || p2.health <= 0 || roundTime <= 0) { running = false; const winner = p1.health > p2.health ? 'CYCLOPS TAKES IT' : 'WOLVERINE TAKES IT'; message.textContent = roundTime <= 0 && p1.health === p2.health ? 'TIME' : winner; footerState.textContent = 'PRESS ENTER TO REMATCH'; overlay.classList.remove('hidden'); overlay.querySelector('h2').textContent = message.textContent; overlay.querySelector('.eyebrow').textContent = 'ROUND OVER'; } timerEl.textContent = String(roundTime).padStart(2, '0'); } drawArena(); projectiles.forEach(projectile => projectile.draw()); p1.draw(); p2.draw(); pressed.clear(); requestAnimationFrame(loop); }
function setPauseView(showMoves) { pauseMenu.classList.toggle('hidden', showMoves); moveList.classList.toggle('hidden', !showMoves); moveListName.textContent = characterNames[selectedKind]; }
function togglePause() { if (!running) return; paused = !paused; pauseOverlay.classList.toggle('hidden', !paused); if (paused) { setPauseView(false); footerState.textContent = 'GAME PAUSED // ESC RESUME'; } else footerState.textContent = `ROUND ACTIVE // ${selectedDifficulty.toUpperCase()} CPU`; }
function returnToMenu() { running = false; paused = false; projectiles = []; pauseOverlay.classList.add('hidden'); menuScreen.classList.remove('hidden'); overlay.classList.add('hidden'); footerState.textContent = 'PRESS ENTER TO BEGIN // ESC PAUSE'; }
function start() { reset(); projectiles = []; paused = false; running = true; pauseOverlay.classList.add('hidden'); menuScreen.classList.add('hidden'); overlay.classList.add('hidden'); footerState.textContent = `ROUND ACTIVE // ${selectedDifficulty.toUpperCase()} CPU`; last = performance.now(); }
window.addEventListener('keydown', event => { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; if (key === 'Escape') { event.preventDefault(); if (running) togglePause(); return; } if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','x','a','s','Enter'].includes(key)) event.preventDefault(); if (!keys.has(key)) pressed.add(key); keys.add(key); if (key === 'Enter' && !running) start(); });
window.addEventListener('keyup', event => { const key = event.key.length === 1 ? event.key.toLowerCase() : event.key; keys.delete(key); });
document.querySelectorAll('.character-card').forEach(card => card.addEventListener('click', () => selectCharacter(card.dataset.character)));
document.querySelectorAll('.difficulty').forEach(button => button.addEventListener('click', () => { selectedDifficulty = button.dataset.difficulty; document.querySelectorAll('.difficulty').forEach(option => option.classList.toggle('selected', option === button)); }));
outfitSelect.addEventListener('change', () => { selectedCostume = outfitSelect.value; });
document.querySelector('#start-button').addEventListener('click', start);
document.querySelector('#rematch-button').addEventListener('click', start);
document.querySelector('#resume-button').addEventListener('click', () => { if (paused) togglePause(); });
document.querySelector('#moves-button').addEventListener('click', () => setPauseView(true));
document.querySelector('#back-pause-button').addEventListener('click', () => setPauseView(false));
document.querySelector('#menu-button').addEventListener('click', returnToMenu);
populateOutfits();
requestAnimationFrame(loop);
