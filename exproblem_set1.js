// 問題総数
const total = 20;
// 現在の問題番号（1スタート）
let current = parseInt(localStorage.getItem("exCurrentPage") || "1", 10);
// 制限時間（秒）
let timeLimit = 30 * 60;
// タイマーID
let timerInterval = null;

// ユーザーの回答配列（空文字で初期化）
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

// タイマー更新
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
    `${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  timeLimit--;
};

// 問題表示更新
const loadQuestion = () => {
  document.getElementById("question-num").textContent = `第${current}問`;
  document.getElementById("quiz-img").src = `q${current}.png`;
  document.getElementById("answer").value = answers[current - 1];
  document.getElementById("answer").disabled = false;
  updateNavButtons();
  updateChapters();
};

// ナビボタン表示切替
const updateNavButtons = () => {
  document.getElementById("back-btn").style.visibility = current > 1 ? "visible" : "hidden";
  document.getElementById("forward-btn").style.visibility = current < total ? "visible" : "hidden";
};

// チャプター（問題番号）ボタン更新
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
      const saveCurrentPage = () => {
        localStorage.setItem("exCurrentPage", current);
      };
      current = i + 1;
      saveCurrentPage();
      loadQuestion();
    };
    chapterContainer.appendChild(btn);
  }
};

// 戻るボタン
const back = () => {
  saveCurrentAnswer();
  if (current > 1) {
    current--;
    saveCurrentPage();
    loadQuestion();
  }
};

// 進むボタン
const forward = () => {
  saveCurrentAnswer();
  if (current < total) {
    current++;
    saveCurrentPage();
    loadQuestion();
  }
};

// 現在の回答保存
const saveCurrentAnswer = () => {
  answers[current - 1] = document.getElementById("answer").value.trim();
};

// スコア計算
const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) => {
    return score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0);
  }, 0);
};

// 試験終了処理
const finishExam = () => {
  saveCurrentAnswer();
  const username = localStorage.getItem("exUsername") || "名無し";
  const score = calculateScore(answers);
  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", score);
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", "謎検模試セット1");
  alert("試験終了です。結果画面に遷移します。");
  location.href = "exresult.html";
};

// 終了確認モーダル表示
const confirmAndFinish = () => {
  const overlay = document.getElementById("confirm-overlay");
  overlay.style.display = "flex";
  document.getElementById("confirm-yes").onclick = () => {
    overlay.style.display = "none";
    finishExam();
  };
  document.getElementById("confirm-no").onclick = () => {
    overlay.style.display = "none";
  };
};

// 時間切れ時処理
const timeUp = () => {
  saveCurrentAnswer();
  const username = document.getElementById("username-input")?.value || "名無し";
  const score = calculateScore(answers);
  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", score);
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", "謎検模試セット1");
  alert("時間切れです。結果画面に移動します。");
  location.href = "exresult.html";
};

window.onload = () => {
  loadQuestion();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);

  document.getElementById("answer").addEventListener("input", () => {
    saveCurrentAnswer();
    updateChapters();
  });

  const submitBtn = document.getElementById("submit-btn");
  if (submitBtn) submitBtn.onclick = confirmAndFinish;
};
