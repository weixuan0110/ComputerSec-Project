// Ransomware Defense
// Simple Plants-vs-Zombies-style educational game using only vanilla JavaScript.

const ROWS = 5;
const COLS = 8;
const CELL_W = 86;
const CELL_H = 86;
const START_POINTS = 50;
const START_MONEY = 10000;
const GAME_SECONDS = 270;
const STAGE_SECONDS = 90;
const QUESTION_SECONDS = 30;

const defenderTypes = {
  backup: { name: "Backup Defender", icon: "💾", projectile: "📦", cost: 50, damage: 25, rate: 1500, role: "damage" },
  firewall: { name: "Firewall Defender", icon: "🛡️", projectile: "🧱", cost: 75, damage: 20, rate: 1700, role: "block" },
  antivirus: { name: "Antivirus Defender", icon: "🧪", projectile: "💉", cost: 100, damage: 40, rate: 850, role: "damage" },
  email: { name: "Email Filter Defender", icon: "📧", projectile: "✉️", cost: 50, damage: 15, rate: 1600, role: "slow" },
  boom: { name: "Three-Box Bomb", icon: "💥", cost: 200, role: "boom" }
};

// Five clear enemy classes. Stage multipliers increase their health and speed.
const enemyTypes = [
  { name: "Basic Ransomware", icon: "🦠", health: 100, speed: 0.026, ability: "normal", skill: "Balanced threat", loss: 1000 },
  { name: "Speed Malware", icon: "⚡", health: 75, speed: 0.043, ability: "fast", skill: "Moves much faster", loss: 1000 },
  { name: "Heavy Encryptor", icon: "🔐", health: 250, speed: 0.018, ability: "tank", skill: "Very high health", loss: 2000 },
  { name: "Defense Hacker", icon: "🛠️", health: 125, speed: 0.029, ability: "attack", skill: "Destroys placed defenders", loss: 1000 },
  { name: "Botnet Gang", icon: "🤖", health: 75, speed: 0.028, ability: "gang", skill: "Spawns in a group of 3", loss: 1000 }
];

// Each stage has 20 questions: basics, recognition, then incident response.
// Format: [question, correct answer, wrong answer, wrong answer, wrong answer]
const questionBanks = [
  [
    ["What is ransomware?", "Malware that encrypts files for payment", "A backup program", "A faster browser", "A firewall rule"],
    ["What does malware mean?", "Malicious software", "Managed hardware", "Mail storage", "Manual login"],
    ["What makes a password stronger?", "Length plus varied characters", "Your first name", "12345678", "One repeated word"],
    ["Why keep software updated?", "Updates repair security weaknesses", "Updates remove backups", "Updates share passwords", "Updates disable encryption"],
    ["What is a backup?", "A separate copy of important data", "A ransom payment", "An email attachment", "A public password"],
    ["Where should a safe backup be kept?", "Offline or separately protected", "Only on the infected PC", "Inside an unknown email", "On a public link"],
    ["What does antivirus software do?", "Detects and removes known threats", "Guarantees no attack ever", "Creates phishing emails", "Replaces all backups"],
    ["What is a firewall used for?", "Controlling network traffic", "Writing documents", "Charging a laptop", "Making passwords shorter"],
    ["What is phishing?", "A trick used to steal data or access", "A file backup method", "A software update", "A network cable"],
    ["Which download is highest risk?", "Cracked software from an unknown site", "An official vendor update", "Your own document", "A company policy PDF"],
    ["What should you do before opening a link?", "Check its sender and destination", "Disable protection", "Share your password", "Click immediately"],
    ["Why use multi-factor authentication?", "It adds another verification step", "It makes passwords public", "It removes encryption", "It opens attachments"],
    ["What is encryption?", "Converting data into protected form", "Deleting every file", "Sending spam", "Restarting a monitor"],
    ["Who should receive your password?", "Nobody", "Any email sender", "Unknown support staff", "Social media followers"],
    ["What does SP buy in this game?", "Computer security defenders", "Extra ransom payments", "Enemy upgrades", "Shorter passwords"],
    ["What is social engineering?", "Manipulating people to reveal access", "Repairing computer hardware", "Compressing files", "Building a firewall"],
    ["Why lock your screen when away?", "To prevent unauthorized access", "To delete malware", "To update the network", "To create backups"],
    ["What should protect important accounts?", "Unique passwords", "One shared password", "No password", "A visible sticky note"],
    ["What is a security patch?", "A fix for a software vulnerability", "A phishing attachment", "A ransom note", "A damaged cable"],
    ["What is the safest daily habit?", "Pause and verify unusual requests", "Trust every urgent message", "Disable updates", "Reuse passwords"]
  ],
  [
    ["An email says URGENT and asks for your password. What is the warning sign?", "Pressure plus a credential request", "Correct spelling", "A company logo", "A normal greeting"],
    ["Which sender address looks suspicious?", "support@micros0ft-help.com", "support@microsoft.com", "teacher@school.edu", "hr@company.com"],
    ["Which attachment is most dangerous?", "invoice.exe", "meeting.txt", "photo.jpg", "policy.pdf"],
    ["A link says bank.com but opens bank-login.xyz. What happened?", "The visible text hid a different address", "The firewall updated", "A backup completed", "The password became stronger"],
    ["A friend sends an unexpected file. What should you do?", "Confirm with them another way", "Run it immediately", "Disable antivirus", "Forward it widely"],
    ["Which message is likely phishing?", "Verify now or lose your account", "Minutes from a known meeting", "A report you requested", "Your saved draft"],
    ["A website asks to enable macros to view a bill. What is safest?", "Do not enable them; verify the source", "Enable all macros", "Turn off protection", "Enter an admin password"],
    ["What can a fake QR code do?", "Send you to a malicious website", "Create an offline backup", "Patch the computer", "Strengthen encryption"],
    ["A login page has a misspelled domain. What should you do?", "Close it and use the official site", "Enter details quickly", "Reuse another password", "Download its tool"],
    ["Why inspect a file extension?", "It can reveal an executable file", "It shows server health", "It pays the ransom", "It guarantees safety"],
    ["What is a Trojan horse?", "Malware disguised as legitimate software", "A secure backup", "A firewall setting", "A password manager"],
    ["Why is cracked software risky?", "It may contain hidden malware", "It always updates safely", "It creates clean backups", "It blocks phishing"],
    ["A popup claims your PC is infected and gives a phone number. What now?", "Close it and contact trusted support", "Call and give remote access", "Pay immediately", "Share bank details"],
    ["Which action helps detect a fake email?", "Hover over links before clicking", "Ignore the sender domain", "Open every attachment", "Disable spam filtering"],
    ["What is an unexpected MFA prompt a sign of?", "Someone may know your password", "A backup finished", "The monitor failed", "The firewall is offline"],
    ["What should happen to a suspicious email?", "Report it using the company process", "Reply with credentials", "Send it to everyone", "Run its attachment"],
    ["A USB drive is found outside. What is safest?", "Give it to security without plugging it in", "Open every file", "Use it for backups", "Take it home"],
    ["Why do attackers create urgency?", "To make people act without checking", "To improve backups", "To slow malware", "To patch software"],
    ["Which invoice clue is suspicious?", "It is unexpected and uses an executable", "It matches a real purchase", "It came through the approved system", "Finance confirmed it"],
    ["What should you verify in a support request?", "The person's identity and official channel", "Only the logo", "Only the message color", "Nothing if it is urgent"]
  ],
  [
    ["Files suddenly gain .locked extensions. What is your first priority?", "Isolate the affected computer", "Pay immediately", "Delete all logs", "Connect more drives"],
    ["Why isolate an infected device?", "To reduce spread across the network", "To speed up encryption", "To erase backups", "To share the malware"],
    ["Who should be notified during an incident?", "The organization's incident response contact", "Only social media", "Unknown online users", "Nobody"],
    ["What should happen to a ransom note?", "Preserve it as evidence", "Edit and resend it", "Delete every log", "Use it as a password"],
    ["What is the safest recovery source?", "A tested clean offline backup", "The infected drive", "An unknown decryptor", "A cracked program"],
    ["Why not pay ransom immediately?", "Payment does not guarantee recovery", "Payment removes all risks", "Payment patches systems", "Payment creates backups"],
    ["Before restoring files, what must be confirmed?", "The threat has been contained", "The attacker is online", "All passwords are shared", "Protection is disabled"],
    ["Why preserve system logs?", "They help investigate what happened", "They make malware faster", "They reduce password length", "They replace backups"],
    ["What does containment mean?", "Limiting the incident's spread and damage", "Publishing credentials", "Deleting every backup", "Opening suspicious files"],
    ["What should be changed after account compromise?", "Affected credentials and access tokens", "The monitor brightness", "Document names only", "Nothing"],
    ["When is a backup trustworthy?", "After it is tested and confirmed clean", "Whenever it exists", "After paying ransom", "When connected during attack"],
    ["What is lateral movement?", "An attacker spreading to other systems", "Moving a monitor sideways", "Copying a clean document", "Updating one application"],
    ["Why document incident actions?", "To support coordination and later review", "To help malware hide", "To remove evidence", "To avoid reporting"],
    ["What should happen to compromised accounts?", "Disable or secure them promptly", "Give them admin access", "Publish their passwords", "Ignore them"],
    ["What is eradication?", "Removing malware and its persistence", "Paying the attacker", "Disconnecting backups forever", "Deleting the incident report"],
    ["What follows containment and eradication?", "Careful recovery and monitoring", "Opening the ransom attachment", "Disabling all updates", "Sharing admin passwords"],
    ["Why scan restored systems?", "To check that threats are not returning", "To weaken encryption", "To stop backups", "To create phishing mail"],
    ["What improves future ransomware readiness?", "Tested response plans and backup drills", "Unknown recovery tools", "Shared passwords", "Disabled logging"],
    ["When should authorities or regulators be contacted?", "According to policy and legal requirements", "Only when attackers request it", "Never", "Before checking the incident"],
    ["What is the final incident-response lesson?", "Prepare, contain, recover, and improve", "Pay, hide, and forget", "Delete logs and wait", "Reconnect everything immediately"]
  ]
];

let points;
let companyMoney;
let timeLeft;
let questionTimeLeft;
let currentStage;
let selectedDefender;
let defenders;
let enemies;
let projectiles;
let occupiedCells;
let gameOver;
let lastTime;
let enemySpawnTimer;
let animationId;
let questionIndexes;
let waveAnnouncedStage;
let finalCleanup;
let activeQuestion;
let mistakes;
let answerRecords;
let playerName;
let sessionStartedAt;
let completedSession;
let soundEnabled = true;
let audioContext;
let masterGain;
let lastAttackSound = 0;

const battlefield = document.getElementById("battlefield");
const pointsDisplay = document.getElementById("pointsDisplay");
const moneyDisplay = document.getElementById("moneyDisplay");
const stageDisplay = document.getElementById("stageDisplay");
const timeDisplay = document.getElementById("timeDisplay");
const questionTimerEl = document.getElementById("questionTimer");
const questionCategoryEl = document.getElementById("questionCategory");
const backgroundMusic = document.getElementById("backgroundMusic");
const questionText = document.getElementById("questionText");
const answersEl = document.getElementById("answers");
const messageEl = document.getElementById("message");

document.getElementById("restartBtn").addEventListener("click", startGame);
document.getElementById("startBtn").addEventListener("click", beginGame);
document.getElementById("soundBtn").addEventListener("click", toggleSound);
document.getElementById("reviewBtn").addEventListener("click", toggleReview);
document.getElementById("playAgainBtn").addEventListener("click", startGame);
document.getElementById("downloadRecordBtn").addEventListener("click", downloadCurrentRecord);
document.getElementById("closeLeaderboardBtn").addEventListener("click", closeLeaderboard);
document.querySelectorAll(".leaderboard-open").forEach((button) => {
  button.addEventListener("click", openLeaderboard);
});

document.querySelectorAll(".defender-btn, .tool-btn").forEach((button) => {
  button.addEventListener("click", () => selectDefender(button.dataset.type));
});

// Build the static 5-row by 8-column grid.
function createGrid() {
  battlefield.innerHTML = "";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", () => placeDefender(row, col));
      cell.addEventListener("mouseenter", () => previewPlacement(row, col, true));
      cell.addEventListener("mouseleave", clearPlacementPreview);
      battlefield.appendChild(cell);
    }
  }
}

function startGame() {
  cancelAnimationFrame(animationId);
  points = START_POINTS;
  companyMoney = START_MONEY;
  timeLeft = GAME_SECONDS;
  questionTimeLeft = QUESTION_SECONDS;
  currentStage = 1;
  selectedDefender = "backup";
  defenders = [];
  enemies = [];
  projectiles = [];
  occupiedCells = new Set();
  gameOver = false;
  lastTime = 0;
  enemySpawnTimer = 0;
  questionIndexes = [0, 0, 0];
  waveAnnouncedStage = 0;
  finalCleanup = false;
  activeQuestion = null;
  mistakes = [];
  answerRecords = [];
  playerName = "Anonymous";
  sessionStartedAt = null;
  completedSession = null;
  stopMusic(true);

  createGrid();
  selectDefender("backup");
  answersEl.innerHTML = "";
  questionText.textContent = "Press Start Defense to begin.";
  setMessage("Read the guide, then start the company defense.");
  updateDisplays();
  document.getElementById("startScreen").classList.remove("hidden");
  document.getElementById("resultScreen").classList.add("hidden");
  document.getElementById("resultScreen").classList.remove("lost");
  document.getElementById("leaderboardScreen").classList.add("hidden");
  document.getElementById("reviewPanel").classList.add("hidden");
  document.getElementById("reviewBtn").textContent = "Review Mistakes";
}

function beginGame() {
  document.getElementById("startScreen").classList.add("hidden");
  playerName = document.getElementById("playerNameInput").value.trim() || "Anonymous";
  sessionStartedAt = new Date().toISOString();
  startAudio();
  lastTime = performance.now();
  showQuestion();
  setMessage("Choose a defender, then click an empty grid cell.");
  animationId = requestAnimationFrame(gameLoop);
}

function selectDefender(type) {
  selectedDefender = type;
  document.querySelectorAll(".defender-btn, .tool-btn").forEach((button) => {
    button.classList.toggle("selected", button.dataset.type === type);
  });
}

function clearPlacementPreview() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("preview-place", "preview-bomb", "preview-remove");
  });
}

function previewPlacement(row, col, active) {
  clearPlacementPreview();
  if (!active || gameOver) return;

  if (selectedDefender === "boom") {
    for (let targetCol = Math.max(0, col - 1); targetCol <= Math.min(COLS - 1, col + 1); targetCol++) {
      document.querySelector(`.cell[data-row="${row}"][data-col="${targetCol}"]`)?.classList.add("preview-bomb");
    }
    return;
  }

  const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
  cell?.classList.add(selectedDefender === "remove" ? "preview-remove" : "preview-place");
}

// Place a defender if the player has enough points and the cell is empty.
function placeDefender(row, col) {
  if (gameOver) return;
  const key = `${row}-${col}`;

  if (selectedDefender === "remove") {
    const defender = defenders.find((item) => item.row === row && item.col === col);
    if (!defender) {
      setMessage("There is no defender in that box.", "bad");
      return;
    }
    defenders = defenders.filter((item) => item !== defender);
    occupiedCells.delete(key);
    setMessage("Defender removed. Security Points are not refunded.", "good");
    return;
  }

  const type = defenderTypes[selectedDefender];
  if (type.role === "boom") {
    const firstCol = Math.max(0, col - 1);
    const lastCol = Math.min(COLS - 1, col + 1);
    const firstX = firstCol * CELL_W;
    const lastX = (lastCol + 1) * CELL_W;
    const visibleTargets = enemies.filter((enemy) =>
      enemy.row === row &&
      enemy.x + 29 >= firstX &&
      enemy.x + 29 < lastX
    );
    if (visibleTargets.length === 0) {
      setMessage("No threats inside those highlighted boxes. Bomb was not used.", "bad");
      return;
    }
    if (points < type.cost) {
      setMessage("Three-Box Bomb needs 200 Security Points.", "bad");
      return;
    }
    points -= type.cost;
    visibleTargets.forEach((enemy) => {
      enemy.health = 0;
    });
    battlefield.classList.remove("boom-flash");
    void battlefield.offsetWidth;
    battlefield.classList.add("boom-flash");
    playBoomSound();
    setMessage(`Three-Box Bomb cleared ${visibleTargets.length} threat(s)!`, "good");
    updateDisplays();
    return;
  }

  if (occupiedCells.has(key)) {
    setMessage("A defender is already in that cell.", "bad");
    return;
  }

  if (points < type.cost) {
    setMessage("Not enough Security Points.", "bad");
    return;
  }

  points -= type.cost;
  occupiedCells.add(key);
  defenders.push({
    row,
    col,
    x: col * CELL_W + 14,
    y: row * CELL_H + 14,
    type: selectedDefender,
    cooldown: 0,
    health: 100,
    hitUntil: 0
  });
  setMessage(`${type.name} placed.`, "good");
  updateDisplays();
}

function gameLoop(now) {
  if (gameOver) return;

  const delta = now - lastTime;
  lastTime = now;

  if (!finalCleanup) {
    timeLeft -= delta / 1000;
    if (timeLeft <= 0) {
      timeLeft = 0;
      finalCleanup = true;
      battlefield.classList.remove("big-wave");
      setMessage("FINAL CLEANUP: destroy every remaining threat to win!", "good");
    }
  }
  questionTimeLeft -= delta / 1000;
  enemySpawnTimer += delta;

  const stageElapsed = (GAME_SECONDS - timeLeft) % STAGE_SECONDS;
  const bigWave = !finalCleanup && stageElapsed >= STAGE_SECONDS - 15;
  const normalDelay = currentStage === 1 ? 4300 : currentStage === 2 ? 3400 : 2600;
  const spawnDelay = bigWave ? [1350, 1100, 850][currentStage - 1] : normalDelay;
  battlefield.classList.toggle("big-wave", bigWave);

  if (bigWave && waveAnnouncedStage !== currentStage) {
    waveAnnouncedStage = currentStage;
    const waveMessage = currentStage === 3
      ? "FINAL VIRUS WAVE: Clear all threats!"
      : `STAGE ${currentStage} VIRUS WAVE: Clear all threats!`;
    setMessage(waveMessage, "bad");
    spawnBigWave();
  }

  if (!finalCleanup && enemySpawnTimer >= spawnDelay) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  if (questionTimeLeft <= 0) {
    recordAnswer(activeQuestion, "No answer", false);
    recordMistake(activeQuestion, "No answer");
    setMessage("Question missed. No SP earned, but no money was lost.", "bad");
    showQuestion();
  }

  updateStage();
  updateDefenders(delta);
  updateProjectiles(delta);
  updateEnemies(delta);
  checkCollisions();
  cleanupObjects();
  renderObjects();
  updateDisplays();
  checkWinLose();

  animationId = requestAnimationFrame(gameLoop);
}

function spawnEnemy(row = Math.floor(Math.random() * ROWS), xOffset = 0) {
  const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  const groupSize = type.ability === "gang" ? 3 : 1;
  for (let member = 0; member < groupSize; member++) {
    createEnemy(type, row, xOffset - member * 48);
  }
}

function createEnemy(type, row, xOffset) {
  const healthMultiplier = [1, 1.25, 1.55][currentStage - 1];
  const speedMultiplier = [1, 1.15, 1.32][currentStage - 1];
  const stageHealth = Math.round(type.health * healthMultiplier);
  enemies.push({
    row,
    x: COLS * CELL_W - 10 + xOffset,
    y: row * CELL_H + 14,
    health: stageHealth,
    maxHealth: stageHealth,
    speed: type.speed * speedMultiplier,
    baseSpeed: type.speed * speedMultiplier,
    loss: type.loss,
    icon: type.icon,
    name: type.name,
    ability: type.ability,
    skill: type.skill,
    attackTimer: 0,
    slowedUntil: 0,
    blockedUntil: 0
  });
}

// Final waves deploy several threats into every row at the same moment.
function spawnBigWave() {
  for (let row = 0; row < ROWS; row++) {
    const amount = 3 + Math.floor(Math.random() * 4);
    for (let index = 0; index < amount; index++) {
      spawnEnemy(row, -index * 52);
    }
  }
}

// Defenders automatically attack enemies in the same row.
function updateDefenders(delta) {
  defenders.forEach((defender) => {
    defender.cooldown -= delta;
    const type = defenderTypes[defender.type];
    const target = enemies.find((enemy) => enemy.row === defender.row && enemy.x > defender.x);

    if (!target || defender.cooldown > 0) return;

    projectiles.push(makeProjectile(defender, type));
    playAttackSound(defender.type);
    defender.cooldown = type.rate;
  });
}

function makeProjectile(defender, type) {
  return {
    row: defender.row,
    x: defender.x + 48,
    y: defender.y + 18,
    damage: type.damage,
    effect: type.role,
    icon: type.projectile,
    speed: 0.55
  };
}

function updateProjectiles(delta) {
  projectiles.forEach((projectile) => {
    projectile.x += projectile.speed * delta;
  });
}

function updateEnemies(delta) {
  const now = performance.now();
  enemies.forEach((enemy) => {
    const blocked = enemy.blockedUntil > now;
    const slowed = enemy.slowedUntil > now;
    enemy.speed = enemy.baseSpeed * (slowed ? 0.45 : 1);

    const targetDefender = enemy.ability === "attack"
      ? defenders.find((defender) =>
          defender.row === enemy.row &&
          enemy.x >= defender.x &&
          enemy.x - defender.x < 64
        )
      : null;

    if (targetDefender) {
      enemy.attackTimer += delta;
      if (enemy.attackTimer >= 1000) {
        targetDefender.health -= 50;
        targetDefender.hitUntil = now + 250;
        enemy.attackTimer = 0;
        playDeductSound();
        if (targetDefender.health <= 0) {
          defenders = defenders.filter((defender) => defender !== targetDefender);
          occupiedCells.delete(`${targetDefender.row}-${targetDefender.col}`);
          setMessage("Defense Hacker destroyed a defender!", "bad");
        }
      }
    } else {
      enemy.attackTimer = 0;
      if (!blocked) enemy.x -= enemy.speed * delta;
    }

    if (enemy.x <= -10) {
      companyMoney -= enemy.loss;
      playDeductSound();
      enemy.health = 0;
      setMessage(`A threat reached the server. Company loss: RM${enemy.loss.toLocaleString()}.`, "bad");
    }
  });
}

// Projectiles damage enemies when they overlap.
function checkCollisions() {
  projectiles.forEach((projectile) => {
    const hit = enemies.find((enemy) => {
      return enemy.row === projectile.row && Math.abs(enemy.x - projectile.x) < 32;
    });

    if (!hit) return;
    hit.health -= projectile.damage;
    projectile.hit = true;
    if (projectile.effect === "slow") {
      hit.slowedUntil = performance.now() + 2200;
    }
    if (projectile.effect === "block") {
      hit.blockedUntil = performance.now() + 1600;
    }
  });
}

function cleanupObjects() {
  enemies = enemies.filter((enemy) => enemy.health > 0);
  projectiles = projectiles.filter((projectile) => !projectile.hit && projectile.x < COLS * CELL_W + 80);
}

function renderObjects() {
  document.querySelectorAll(".defender, .enemy, .projectile").forEach((el) => el.remove());

  defenders.forEach((defender) => {
    const type = defenderTypes[defender.type];
    const el = document.createElement("div");
    el.className = `defender ${defender.hitUntil > performance.now() ? "hit" : ""}`;
    el.textContent = type.icon;
    el.title = `${type.name}: ${defender.health} HP`;
    el.style.left = `${(defender.x / (COLS * CELL_W)) * 100}%`;
    el.style.top = `${(defender.y / (ROWS * CELL_H)) * 100}%`;
    battlefield.appendChild(el);
  });

  enemies.forEach((enemy) => {
    const el = document.createElement("div");
    el.className = `enemy ${enemy.slowedUntil > performance.now() ? "slowed" : ""}`;
    el.textContent = enemy.icon;
    el.style.left = `${(enemy.x / (COLS * CELL_W)) * 100}%`;
    el.style.top = `${(enemy.y / (ROWS * CELL_H)) * 100}%`;
    el.title = `${enemy.name}: ${Math.ceil(enemy.health)} HP · ${enemy.skill}`;
    battlefield.appendChild(el);
  });

  projectiles.forEach((projectile) => {
    const el = document.createElement("div");
    el.className = `projectile projectile-${projectile.effect}`;
    el.textContent = projectile.icon;
    el.style.left = `${(projectile.x / (COLS * CELL_W)) * 100}%`;
    el.style.top = `${(projectile.y / (ROWS * CELL_H)) * 100}%`;
    battlefield.appendChild(el);
  });
}

// Shows a question and answer buttons. Correct answers give points.
function showQuestion() {
  const bankIndex = currentStage - 1;
  const bank = questionBanks[bankIndex];
  const categoryNames = ["Security Basics", "Spot the Threat", "Incident Response"];
  questionCategoryEl.textContent = `Stage ${currentStage} · ${categoryNames[bankIndex]}`;
  const raw = bank[questionIndexes[bankIndex] % bank.length];
  questionIndexes[bankIndex]++;
  const shuffledAnswers = raw.slice(1).map((text, index) => ({ text, correct: index === 0 }));
  shuffledAnswers.sort(() => Math.random() - 0.5);
  const item = {
    question: raw[0],
    answers: shuffledAnswers.map((answer) => answer.text),
    correct: shuffledAnswers.findIndex((answer) => answer.correct),
    stage: currentStage
  };
  activeQuestion = item;
  questionTimeLeft = QUESTION_SECONDS;
  questionText.textContent = item.question;
  answersEl.innerHTML = "";

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = `${String.fromCharCode(65 + index)}. ${answer}`;
    button.addEventListener("click", () => answerQuestion(item, index));
    answersEl.appendChild(button);
  });
}

function answerQuestion(item, index) {
  const isCorrect = index === item.correct;
  recordAnswer(item, item.answers[index], isCorrect);
  if (isCorrect) {
    points += 50;
    setMessage("Correct! +50 Security Points", "good");
  } else {
    recordMistake(item, item.answers[index]);
    const letter = String.fromCharCode(65 + item.correct);
    setMessage(`Incorrect. No SP earned. Correct answer: ${letter}. ${item.answers[item.correct]}`, "bad");
  }
  showQuestion();
  updateDisplays();
}

function updateDisplays() {
  pointsDisplay.textContent = points;
  moneyDisplay.textContent = `RM${Math.max(0, companyMoney).toLocaleString()}`;
  stageDisplay.textContent = `${currentStage} / 3`;
  questionTimerEl.textContent = `${Math.max(0, Math.ceil(questionTimeLeft))}s`;
  questionTimerEl.classList.toggle("urgent", questionTimeLeft <= 10);
  if (finalCleanup) {
    timeDisplay.textContent = `CLEAN: ${enemies.length}`;
  } else {
    const minutes = Math.floor(Math.max(0, timeLeft) / 60);
    const seconds = String(Math.floor(Math.max(0, timeLeft) % 60)).padStart(2, "0");
    timeDisplay.textContent = `${minutes}:${seconds}`;
  }
}

function updateStage() {
  const elapsed = GAME_SECONDS - timeLeft;
  const nextStage = Math.min(3, Math.floor(elapsed / STAGE_SECONDS) + 1);
  if (nextStage !== currentStage) {
    currentStage = nextStage;
    setMessage(`Stage ${currentStage}! Threats now have more health and move faster.`, "bad");
  }
}

function checkWinLose() {
  if (companyMoney <= 0) {
    endGame(false);
    return;
  }

  if (finalCleanup && enemies.length === 0) {
    endGame(true);
  }
}

function endGame(won) {
  gameOver = true;
  cancelAnimationFrame(animationId);
  stopMusic();
  if (won) {
    playWinSound();
    setMessage(`You Win! The server survived with RM${companyMoney.toLocaleString()} remaining.`, "good");
  } else {
    setMessage("Game Over. The company ran out of recovery money.", "bad");
  }
  saveSessionResult(won);
  showResultScreen(won);
}

function recordAnswer(item, selectedAnswer, isCorrect) {
  if (!item) return;
  answerRecords.push({
    stage: item.stage,
    question: item.question,
    selectedAnswer,
    correctAnswer: item.answers[item.correct],
    isCorrect,
    responseSeconds: Math.max(0, Math.round(QUESTION_SECONDS - questionTimeLeft))
  });
}

function saveSessionResult(won) {
  completedSession = {
    playerName,
    startedAt: sessionStartedAt,
    completedAt: new Date().toISOString(),
    outcome: won ? "Win" : "Loss",
    stageReached: currentStage,
    remainingMoney: Math.max(0, companyMoney),
    securityPoints: points,
    mistakes: mistakes.length,
    answers: answerRecords
  };

  try {
    const history = JSON.parse(localStorage.getItem("ransomwareDefenseRecords") || "[]");
    history.push(completedSession);
    localStorage.setItem("ransomwareDefenseRecords", JSON.stringify(history.slice(-50)));
  } catch {
    setMessage("Result created, but browser storage is unavailable. Download the CSV now.", "bad");
  }
  submitSessionResult();
}

async function submitSessionResult() {
  const status = document.getElementById("recordStatus");
  status.className = "record-status";
  status.textContent = "Sending result to the game owner...";

  try {
    const response = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(completedSession)
    });
    if (!response.ok) throw new Error("Result service unavailable");
    status.classList.add("saved");
    status.textContent = "Result saved online successfully.";
  } catch {
    status.classList.add("failed");
    status.textContent = "Online save failed. Please download and send the CSV record.";
  }
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

function downloadCurrentRecord() {
  if (!completedSession) return;
  const headers = [
    "Player", "Started", "Completed", "Outcome", "Stage", "Money",
    "Security Points", "Question Stage", "Question", "Selected Answer",
    "Correct Answer", "Correct", "Response Seconds"
  ];
  const answers = completedSession.answers.length ? completedSession.answers : [{}];
  const rows = answers.map((answer) => [
    completedSession.playerName,
    completedSession.startedAt,
    completedSession.completedAt,
    completedSession.outcome,
    completedSession.stageReached,
    completedSession.remainingMoney,
    completedSession.securityPoints,
    answer.stage,
    answer.question,
    answer.selectedAnswer,
    answer.correctAnswer,
    answer.isCorrect,
    answer.responseSeconds
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `ransomware-defense-${playerName.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "player"}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function openLeaderboard() {
  const screen = document.getElementById("leaderboardScreen");
  const body = document.getElementById("leaderboardBody");
  screen.classList.remove("hidden");
  body.innerHTML = '<tr><td colspan="6">Loading leaderboard...</td></tr>';

  try {
    const response = await fetch("/api/leaderboard");
    if (!response.ok) throw new Error("Leaderboard unavailable");
    const data = await response.json();
    if (!data.leaderboard.length) {
      body.innerHTML = '<tr><td colspan="6">No winning records yet. Be the first!</td></tr>';
      return;
    }

    body.innerHTML = "";
    data.leaderboard.forEach((entry) => {
      const row = document.createElement("tr");
      const minutes = Math.floor(entry.durationSeconds / 60);
      const seconds = String(entry.durationSeconds % 60).padStart(2, "0");
      [
        `#${entry.rank}`,
        entry.playerName,
        `RM${entry.remainingMoney.toLocaleString()}`,
        entry.securityPoints,
        entry.mistakes,
        `${minutes}:${seconds}`
      ].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });
      body.appendChild(row);
    });
  } catch {
    body.innerHTML = '<tr><td colspan="6">Leaderboard could not be loaded. Please try again.</td></tr>';
  }
}

function closeLeaderboard() {
  document.getElementById("leaderboardScreen").classList.add("hidden");
}

function recordMistake(item, selectedAnswer) {
  if (!item) return;
  const explanations = [
    "This is a computer-security foundation that helps prevent ransomware before an incident begins.",
    "Recognizing this clue helps users stop phishing and malicious files before they execute.",
    "This response supports safe containment, evidence preservation, and recovery during an incident."
  ];
  mistakes.push({
    question: item.question,
    selected: selectedAnswer,
    correct: item.answers[item.correct],
    explanation: explanations[item.stage - 1]
  });
}

function showResultScreen(won) {
  document.getElementById("resultScreen").classList.toggle("lost", !won);
  document.getElementById("resultIcon").textContent = won ? "🏆" : "💸";
  document.getElementById("resultLabel").textContent = won ? "COMPANY NETWORK SECURED" : "RANSOMWARE WON THIS ROUND";
  document.getElementById("resultTitle").textContent = won ? "Congratulations!" : "Game Over!";
  const summary = document.getElementById("resultSummary");
  summary.textContent = won
    ? `You cleared every virus, completed all 3 stages, and protected RM${companyMoney.toLocaleString()}. You made ${mistakes.length} question mistake${mistakes.length === 1 ? "" : "s"}.`
    : `The ransomware left a message: "Your money is my recovery fund now!" Review your mistakes, rebuild your defenses, and take it back next round.`;
  renderReview();
  document.getElementById("resultScreen").classList.remove("hidden");
}

function renderReview() {
  const list = document.getElementById("reviewList");
  list.innerHTML = "";
  if (mistakes.length === 0) {
    list.innerHTML = '<div class="review-item"><strong>Perfect result</strong><span>No incorrect or missed questions.</span></div>';
    return;
  }

  mistakes.forEach((mistake, index) => {
    const item = document.createElement("div");
    item.className = "review-item";
    item.innerHTML = `
      <strong>${index + 1}. ${mistake.question}</strong>
      <span>Your answer: ${mistake.selected}</span>
      <span class="review-correct">Correct answer: ${mistake.correct}</span>
      <span>${mistake.explanation}</span>
    `;
    list.appendChild(item);
  });
}

function toggleReview() {
  const panel = document.getElementById("reviewPanel");
  const isHidden = panel.classList.toggle("hidden");
  document.getElementById("reviewBtn").textContent = isHidden ? "Review Mistakes" : "Hide Review";
}

// Original Web Audio sounds keep the game self-contained without audio files.
function setupAudio() {
  if (audioContext) return;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  audioContext = new AudioEngine();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0.16;
  masterGain.connect(audioContext.destination);
}

function playTone(frequency, duration, type = "square", volume = 0.12, delay = 0) {
  if (!soundEnabled || !audioContext || !masterGain) return;
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  oscillator.connect(gain);
  gain.connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration);
}

function startAudio() {
  if (!soundEnabled) return;
  setupAudio();
  if (audioContext?.state === "suspended") audioContext.resume();
  startMusic();
}

function startMusic() {
  if (!soundEnabled) return;
  backgroundMusic.volume = 0.32;
  backgroundMusic.play().catch(() => {});
}

function stopMusic(reset = false) {
  backgroundMusic.pause();
  if (reset) backgroundMusic.currentTime = 0;
}

function playAttackSound(defenderType) {
  if (!audioContext || audioContext.currentTime - lastAttackSound < 0.045) return;
  lastAttackSound = audioContext.currentTime;
  const frequencies = { backup: 520, firewall: 210, antivirus: 760, email: 430 };
  playTone(frequencies[defenderType], 0.07, defenderType === "firewall" ? "sawtooth" : "square", 0.1);
}

function playDeductSound() {
  playTone(180, 0.22, "sawtooth", 0.16);
  playTone(120, 0.3, "square", 0.12, 0.12);
}

function playBoomSound() {
  playTone(95, 0.42, "sawtooth", 0.22);
  playTone(55, 0.55, "square", 0.16, 0.05);
}

function playWinSound() {
  [523, 659, 784].forEach((frequency, index) => {
    playTone(frequency, 0.35, "triangle", 0.13, index * 0.12);
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  const button = document.getElementById("soundBtn");
  button.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
  button.setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled && !gameOver && document.getElementById("startScreen").classList.contains("hidden")) {
    startAudio();
  } else {
    stopMusic();
  }
}

function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = `message ${type}`;
}

startGame();
