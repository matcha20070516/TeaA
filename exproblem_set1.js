const total = 20;
const set = localStorage.getItem("currentExamSet") || "謎検模試セット1";
const prefix = `ex_${set}`;

let current = 1;
let timeLimit = 30 * 60; // 制限時間：30分（秒）

const answers = Array(total).fill("");

// --- 以下修正ポイント ---

// ロック判定
const isLocked = () => localStorage.getItem(`${prefix}_ResultLocked`) === "true";

// 新規スタート判定
const isFreshStart = localStorage.getItem(`${prefix}_FreshStart`) === "true";
if (isFreshStart) {
  localStorage.removeItem(`${prefix}_FreshStart`);
  localStorage.removeItem(`${prefix}_Current`);
  localStorage.removeItem(`${prefix}_ElapsedTime`);
  localStorage.removeItem(`${prefix}_Answers`);
} else {
  const savedCurrent = parseInt(localStorage.getItem(`${prefix}_Current`) || "1", 10);
  current = savedCurrent;

  const savedElapsed = parseInt(localStorage.getItem(`${prefix}_ElapsedTime`) || "0", 10);
  timeLimit -= savedElapsed;

  const savedAnswers = JSON.parse(localStorage.getItem(`${prefix}_Answers`) || "[]");
  for (let i = 0; i < savedAnswers.length; i++) {
    answers[i] = savedAnswers[i] || "";
  }
}

const updateTimer = () => {
  if (timeLimit <= 0) {
    clearInterval(timerInterval);
    document.getElementById("timer").textContent = "終了";
    timeUp();
    return;
  }
  const m = Math.floor(timeLimit / 60);
  const s = timeLimit % 60;
  document.getElementById("timer").textContent =
    `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  timeLimit--;

  const elapsed = (30 * 60) - timeLimit;
  localStorage.setItem(`${prefix}_ElapsedTime`, elapsed);
};

const autoSaveState = () => {
  localStorage.setItem(`${prefix}_Answers`, JSON.stringify(answers));
  localStorage.setItem(`${prefix}_Current`, current.toString());
  localStorage.setItem(`${prefix}_TimeLeft`, timeLimit.toString());
};

const handleExamEnd = (message) => {
  saveCurrentAnswer();

  const username =
    document.getElementById("username-input")?.value ||
    localStorage.getItem(`${prefix}_Username`) ||
    "名無し";

  const setName = localStorage.getItem(`${prefix}_SetName`) || set;

  const score = calculateScore(answers);

  localStorage.setItem(`${prefix}_Username`, username);
  localStorage.setItem(`${prefix}_Score`, score);
  localStorage.setItem(`${prefix}_Answers`, JSON.stringify(answers));
  localStorage.setItem(`${prefix}_SetName`, setName);
  localStorage.setItem(`${prefix}_ResultLocked`, "true");

  localStorage.removeItem(`${prefix}_Current`);
  localStorage.removeItem(`${prefix}_TimeLeft`);

  alert(message);
  location.href = "exresult.html";
};
