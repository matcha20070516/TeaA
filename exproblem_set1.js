const total = 20;
let current = 1;
let timeLimit = 30 * 60; // 制限時間：30分（秒）

const answers = Array(total).fill("");

const pointsPerQuestion = [
  3, 5, 4, 6, 2,
  3, 5, 4, 6, 2,
  3, 5, 4, 6, 2,
  3, 5, 4, 6, 2
];
const correctAnswers = [
  "答え1", "答え2", "答え3", "答え4", "答え5",
  "答え6", "答え7", "答え8", "答え9", "答え10",
  "答え11", "答え12", "答え13", "答え14", "答え15",
  "答え16", "答え17", "答え18", "答え19", "答え20"
];

let timerInterval = null;

// 🔒 ロック状態を関数で判定
const isLocked = () => localStorage.getItem("exResultLocked") === "true";

// 新規スタート判定
const isFreshStart = localStorage.getItem("exFreshStart") === "true";
if (isFreshStart) {
  localStorage.removeItem("exFreshStart");
  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exElapsedTime");
  localStorage.removeItem("exAnswers");
} else {
  const savedCurrent = parseInt(localStorage.getItem("exCurrent") || "1", 10);
  current = savedCurrent;

  const savedElapsed = parseInt(localStorage.getItem("exElapsedTime") || "0", 10);
  timeLimit -= savedElapsed;

  const savedAnswers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
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
  localStorage.setItem("exElapsedTime", elapsed);
};

const autoSaveState = () => {
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exCurrent", current.toString());
  localStorage.setItem("exTimeLeft", timeLimit.toString());
};

const loadQuestion = () => {
  document.getElementById("question-num").textContent = `第${current}問`;
  document.getElementById("quiz-img").src = `q${current}.png`;
  document.getElementById("answer").value = answers[current - 1] || "";

  // 🔒 ロック時は入力不可
  document.getElementById("answer").disabled = isLocked();

  updateNavButtons();
  updateChapters();
};

const updateNavButtons = () => {
  document.getElementById("back-btn").style.visibility = current > 1 ? "visible" : "hidden";
  document.getElementById("forward-btn").style.visibility = current < total ? "visible" : "hidden";
};

const updateChapters = () => {
  const chapterContainer = document.getElementById("chapters");
  chapterContainer.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}`;
    btn.className = "chapter-btn";
    if (i + 1 === current) btn.classList.add("current");
    if (answers[i].trim() !== "") btn.classList.add("answered");
    btn.onclick = () => {
      saveCurrentAnswer();
      current = i + 1;
      localStorage.setItem("exCurrent", current.toString());
      loadQuestion();
    };
    chapterContainer.appendChild(btn);
  }
};

const back = () => {
  saveCurrentAnswer();
  if (current > 1) {
    current--;
    localStorage.setItem("exCurrent", current.toString());
    loadQuestion();
  }
};

const forward = () => {
  saveCurrentAnswer();
  if (current < total) {
    current++;
    localStorage.setItem("exCurrent", current.toString());
    loadQuestion();
  }
};

const saveCurrentAnswer = () => {
  answers[current - 1] = document.getElementById("answer").value.trim();
};

const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) =>
    score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0), 0);
};

const handleExamEnd = (message) => {
  saveCurrentAnswer();
  const username = document.getElementById("username-input")?.value || "名無し";
  const score = calculateScore(answers);

  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", score);
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", "謎検模試セット1");

  localStorage.setItem("exResultLocked", "true");

  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exTimeLeft");

  alert(message);
  location.href = "exresult.html";
};

const confirmAndFinish = () => {
  document.getElementById("confirm-overlay").style.display = "flex";
};
const timeUp = () => handleExamEnd("時間切れです。結果画面に移動します。");
const finishExam = () => handleExamEnd("試験終了です。結果画面に遷移します。");

window.onload = () => {
  // 🔒 ロックメッセージ表示
  if (isLocked()) {
    const lockNotice = document.createElement("p");
    lockNotice.textContent = "この模試の結果は確定済みです。解答を変更できません。";
    lockNotice.style.color = "red";
    document.querySelector(".quiz-area")?.prepend(lockNotice);
  }

  loadQuestion();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  setInterval(autoSaveState, 1000);

  document.getElementById("answer").addEventListener("input", () => {
    saveCurrentAnswer();
    updateChapters();
  });

  document.getElementById("submit-btn").onclick = confirmAndFinish;

  document.getElementById("confirm-yes").onclick = finishExam;
  document.getElementById("confirm-no").onclick = () => {
    document.getElementById("confirm-overlay").style.display = "none";
  };
};
