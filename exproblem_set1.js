const total = 20;
let current = 1;
let timeLimit = 30 * 60; // 制限時間：30分（秒）

// 回答配列（空で初期化）
const answers = Array(total).fill("");

// 問題ごとの配点（例）
const pointsPerQuestion = [
  3, 5, 4, 6, 2,
  3, 5, 4, 6, 2,
  3, 5, 4, 6, 2,
  3, 5, 4, 6, 2
];
// 正解の配列（例）
const correctAnswers = [
  "答え1", "答え2", "答え3", "答え4", "答え5",
  "答え6", "答え7", "答え8", "答え9", "答え10",
  "答え11", "答え12", "答え13", "答え14", "答え15",
  "答え16", "答え17", "答え18", "答え19", "答え20"
];

// タイマーID
let timerInterval = null;

// 🔶 新規スタート判定
const isFreshStart = localStorage.getItem("exFreshStart") === "true";
if (isFreshStart) {
  localStorage.removeItem("exFreshStart");
  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exElapsedTime");
  localStorage.removeItem("exAnswers");
  // current = 1, timeLimit = 1800 そのまま
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

// タイマー表示
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

  // 経過時間を保存
  const elapsed = (30 * 60) - timeLimit;
  localStorage.setItem("exElapsedTime", elapsed);
};

// 回答・ページ状態の自動保存
const autoSaveState = () => {
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exCurrent", current.toString());
  localStorage.setItem("exTimeLeft", timeLimit.toString());
};

// 問題表示
const loadQuestion = () => {
  document.getElementById("question-num").textContent = `第${current}問`;
  document.getElementById("quiz-img").src = `q${current}.png`;
  document.getElementById("answer").value = answers[current - 1] || "";
  document.getElementById("answer").disabled = false;
  updateNavButtons();
  updateChapters();
};

// ナビボタン
const updateNavButtons = () => {
  document.getElementById("back-btn").style.visibility = current > 1 ? "visible" : "hidden";
  document.getElementById("forward-btn").style.visibility = current < total ? "visible" : "hidden";
};

// チャプター更新
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

// ボタン操作
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

// 回答保存
const saveCurrentAnswer = () => {
  answers[current - 1] = document.getElementById("answer").value.trim();
};

// スコア計算
const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) =>
    score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0), 0);
};

// 試験終了処理（共通）
const handleExamEnd = (message) => {
  saveCurrentAnswer();
  const username = document.getElementById("username-input")?.value || "名無し";
  const score = calculateScore(answers);

  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", score);
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", "謎検模試セット1");

  // 終了時に保存データを整理
  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exTimeLeft");

  alert(message);
  location.href = "exresult.html";
};

// 手動終了・時間切れ
const confirmAndFinish = () => {
  document.getElementById("confirm-overlay").style.display = "flex";
};
const timeUp = () => handleExamEnd("時間切れです。結果画面に移動します。");
const finishExam = () => handleExamEnd("試験終了です。結果画面に遷移します。");

// 起動時処理
window.onload = () => {
  loadQuestion();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
  setInterval(autoSaveState, 1000);

  document.getElementById("answer").addEventListener("input", () => {
    saveCurrentAnswer();
    updateChapters();
  });

  document.getElementById("submit-btn").onclick = confirmAndFinish;

  // ポップアップ対応
  document.getElementById("confirm-yes").onclick = finishExam;
  document.getElementById("confirm-no").onclick = () => {
    document.getElementById("confirm-overlay").style.display = "none";
  };
};
