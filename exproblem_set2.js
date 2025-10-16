const total = 20;
let current = 1;
const TOTAL_TIME = 30 * 60; // 30分（秒）
let startTime; // 開始時刻

const answers = Array(total).fill("");

// 問題ごとの配点
const pointsPerQuestion = [
  2, 3, 4, 5, 4,
  3, 3, 6, 4, 5,
  4, 4, 6, 4, 4,
  8, 7, 8, 6, 10
];


// 問題ごとの正解
const correctAnswers = [
  "ぐうたら", "ごうこく", "すうしき", "こうつうひ", "もんばん",
  "はかい", "めのう", "ふはつ", "こたつ", "ゴルフ",
  "エデン", "2", "4", "カウント", "めんどり",
  "うせつ", "ハウス", "かいひ", "まるた", "くせ"
];

// 問題ごとの解答形式（ここを変えれば個別設定可能）
const answerFormats = [
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "カタカナ",
  "カタカナ", "半角数字", "半角数字", "カタカナ", "ひらがな",
  "ひらがな", "カタカナ", "ひらがな", "ひらがな", "ひらがな"
];

let timerInterval = null;

// ロック確認
const isLocked = () => localStorage.getItem("exResultLocked") === "true";

const isValidFormat = (answer, format) => {
  if (!answer || answer.trim() === "") return true;

  switch (format) {
    case "半角数字":
      return /^[0-9]+$/.test(answer);
    case "ひらがな":
      return /^[ぁ-ん]+$/.test(answer);
    case "カタカナ":
      return /^[ァ-ヶー]+$/.test(answer);
    case "漢字":
      return /^[一-龯]+$/.test(answer);
    case "英字":
      return /^[a-zA-Z]+$/.test(answer);
    default:
      return true;
  }
};

// 級判定関数（※スコアの上限などは既存仕様に合わせています）
const getGrade = (score) => {
  const s = parseInt(score, 10);
  if (s === 100) return { name: "1級", num: 1 };
  if (s >= 90) return { name: "準1級", num: 2 };
  if (s >= 80) return { name: "2級", num: 3 };
  if (s >= 70) return { name: "準2級", num: 4 };
  if (s >= 60) return { name: "3級", num: 5 };
  if (s >= 50) return { name: "4級", num: 6 };
  if (s >= 40) return { name: "5級", num: 7 };
  if (s >= 30) return { name: "6級", num: 8 };
  if (s >= 20) return { name: "7級", num: 9 };
  return { name: "8級", num: 10 };
};

// 新規スタート判定
const isFreshStart = localStorage.getItem("exFreshStart") === "true";
if (isFreshStart) {
  localStorage.removeItem("exFreshStart");
  localStorage.removeItem("exCurrent");
  localStorage.removeItem("exStartTime");
  localStorage.removeItem("exAnswers");

  startTime = Date.now();
  localStorage.setItem("exStartTime", startTime.toString());
} else {
  const savedTime = localStorage.getItem("exStartTime");
  startTime = savedTime ? parseInt(savedTime, 10) : Date.now();
  if (!savedTime) localStorage.setItem("exStartTime", startTime.toString());

  const savedCurrent = parseInt(localStorage.getItem("exCurrent") || "1", 10);
  if (!Number.isNaN(savedCurrent) && savedCurrent >= 1 && savedCurrent <= total) {
    current = savedCurrent;
  }

  const savedAnswers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
  for (let i = 0; i < Math.min(savedAnswers.length, total); i++) {
    answers[i] = savedAnswers[i] || "";
  }
}

// タイマー更新（残り時間表示）
const updateTimer = () => {
  // 経過時間を計算（ms -> s）
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const remainingSec = TOTAL_TIME - elapsedSec;

  if (remainingSec <= 0) {
    clearInterval(timerInterval);
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = "終了";
    // 経過時間保存
    localStorage.setItem("exElapsedTime", String(TOTAL_TIME));
    timeUp();
    return;
  }

  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;
  const timerEl = document.getElementById("timer");
  if (timerEl) {
    timerEl.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // 経過時間を保存（結果画面用）
  localStorage.setItem("exElapsedTime", String(elapsedSec));
};

// 自動保存
const autoSaveState = () => {
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exCurrent", current.toString());
};

// 問題の読み込み
const loadQuestion = () => {
  const qNumEl = document.getElementById("question-num");
  if (qNumEl) qNumEl.textContent = `第${current}問`;

  const imgEl = document.getElementById("quiz-img");
  if (imgEl) imgEl.src = `mq2${current}.PNG`;

  const answerEl = document.getElementById("answer");
  if (answerEl) answerEl.value = answers[current - 1] || "";

  const formatSpan = document.getElementById("answer-format");
  if (formatSpan) formatSpan.textContent = answerFormats[current - 1] || "";

  if (answerEl) answerEl.disabled = isLocked();

  checkCurrentAnswerFormat();
  updateNavButtons();
  updateChapters();

  // プリロード（存在しれば）
  if (current < total) {
    const nextImg = new Image();
    nextImg.src = `mq2${current + 1}.PNG`;
  }
  if (current > 1) {
    const prevImg = new Image();
    prevImg.src = `mq2${current - 1}.PNG`;
  }
};

const checkCurrentAnswerFormat = () => {
  const answerInput = document.getElementById("answer");
  const formatSpan = document.getElementById("answer-format");
  if (!answerInput) return;

  const currentAnswer = answerInput.value.trim();
  const currentFormat = answerFormats[current - 1];

  if (currentAnswer && !isValidFormat(currentAnswer, currentFormat)) {
    answerInput.style.borderColor = "#e53935";
    answerInput.style.backgroundColor = "#ffebee";
    if (formatSpan) formatSpan.style.color = "#e53935";
  } else {
    answerInput.style.borderColor = "#ccc";
    answerInput.style.backgroundColor = "white";
    if (formatSpan) formatSpan.style.color = "#666";
  }
};

const updateNavButtons = () => {
  const backBtn = document.getElementById("back-btn");
  const forwardBtn = document.getElementById("forward-btn");
  if (backBtn) backBtn.style.visibility = current > 1 ? "visible" : "hidden";
  if (forwardBtn) forwardBtn.style.visibility = current < total ? "visible" : "hidden";
};

const updateChapters = () => {
  const chapterContainer = document.getElementById("chapters");
  if (!chapterContainer) return;
  chapterContainer.innerHTML = "";

  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}`;
    btn.className = "chapter-btn";

    if (i + 1 === current) btn.classList.add("current");

    if ((answers[i] || "").trim() !== "") {
      if (isValidFormat(answers[i], answerFormats[i])) {
        btn.classList.add("answered");
      } else {
        btn.classList.add("invalid");
      }
    }

    // クリックで移動（保存してから）
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
  const ansEl = document.getElementById("answer");
  if (!ansEl) return;
  answers[current - 1] = ansEl.value.trim();
  // すぐにローカルにも保存しておく
  localStorage.setItem("exAnswers", JSON.stringify(answers));
};

const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) =>
    score + ((ans === correctAnswers[idx]) ? pointsPerQuestion[idx] : 0)
  , 0);
};

const handleExamEnd = (message) => {
  saveCurrentAnswer();

  const username =
    (document.getElementById("username-input") && document.getElementById("username-input").value) ||
    localStorage.getItem("exUsername") ||
    "名無し";

  const setName = "謎検模試_MⅡ";
  const score = calculateScore(answers);
  const grade = getGrade(score);

  localStorage.setItem("exUsername", username);
  localStorage.setItem("exScore", String(score));
  localStorage.setItem("exAnswers", JSON.stringify(answers));
  localStorage.setItem("exSetName", setName);
  localStorage.setItem("exResultLocked", "true");

  // 受験済みフラグ
  localStorage.setItem(`${setName}_completed`, "true");

  localStorage.removeItem("exCurrent");

  const reviewMode = localStorage.getItem("exReviewMode") === "true";
  if (reviewMode) {
    const t = document.getElementById("timer");
    if (t) t.style.display = "none";

    const ans = document.getElementById("answer");
    if (ans) ans.disabled = true;

    const submitBtn = document.getElementById("submit-btn");
    if (submitBtn) submitBtn.style.display = "none";
  }

  alert(message);

  const shareUrl = `https://matcha20070516.github.io/mytestplaydate/share/grade-${grade.num}.html`;

  const params = new URLSearchParams({
    grade: grade.name,
    score: String(score),
    set: setName,
    shareUrl: shareUrl
  });
  location.href = `exresult_grade${grade.num}.html?${params.toString()}`;
};

const confirmAndFinish = () => {
  let invalidCount = 0;
  for (let i = 0; i < total; i++) {
    if ((answers[i] || "").trim() !== "" && !isValidFormat(answers[i], answerFormats[i])) {
      invalidCount++;
    }
  }

  if (invalidCount > 0) {
    const confirmMsg = `解答形式が正しくない問題が${invalidCount}問あります。\nこのまま終了しますか？`;
    if (!confirm(confirmMsg)) {
      return;
    }
  }

  const overlay = document.getElementById("confirm-overlay");
  if (overlay) overlay.style.display = "flex";
};

const timeUp = () => handleExamEnd("時間切れです。結果画面に移動します。");
const finishExam = () => handleExamEnd("結果画面に遷移します。");

// キーボード操作（左右）
document.addEventListener("keydown", (e) => {
  if (isLocked()) return;

  if (e.key === "ArrowLeft" && current > 1) {
    back();
  }
  if (e.key === "ArrowRight" && current < total) {
    forward();
  }
});

// 初期化（DOMContentLoaded より window.onload を使っている既存実装に合わせる）
window.onload = () => {
  // ロック済みならその旨を表示（落ちないようにDOMチェック）
  if (isLocked()) {
    const container = document.querySelector(".container");
    if (container) {
      const lockNotice = document.createElement("p");
      lockNotice.textContent = "この模試の結果は確定済みです。解答を変更できません。";
      lockNotice.style.color = "red";
      container.prepend(lockNotice);
    }

    // 経過時間から固定の残り時間表示（保存されている exElapsedTime を使う）
    const elapsed = parseInt(localStorage.getItem("exElapsedTime") || "0", 10);
    const fixedTimeLeft = Math.max(TOTAL_TIME - (isNaN(elapsed) ? 0 : elapsed), 0);
    const m = Math.floor(fixedTimeLeft / 60);
    const s = fixedTimeLeft % 60;
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    loadQuestion();
  } else {
    loadQuestion();
    updateTimer();
    // タイマーは1秒ごと
    timerInterval = setInterval(updateTimer, 1000);
    // 自動保存は1秒ごと
    setInterval(autoSaveState, 1000);

    // IME 対応のための composition フラグ
    const answerInput = document.getElementById("answer");
    if (answerInput) {
      let composing = false;

      answerInput.addEventListener("compositionstart", () => {
        composing = true;
      });

      answerInput.addEventListener("compositionend", () => {
        composing = false;
        saveCurrentAnswer();
        checkCurrentAnswerFormat();
        updateChapters();
      });

      answerInput.addEventListener("input", () => {
        if (!composing) {
          saveCurrentAnswer();
          checkCurrentAnswerFormat();
          updateChapters();
        }
      });
    }
  }

  // submit / confirm UI
  const reviewMode = localStorage.getItem("exReviewMode") === "true";
  const submitBtn = document.getElementById("submit-btn");
  const confirmYes = document.getElementById("confirm-yes");
  const confirmNo = document.getElementById("confirm-no");

  if (reviewMode) {
    if (submitBtn) submitBtn.onclick = finishExam;
    const overlay = document.getElementById("confirm-overlay");
    if (overlay) overlay.style.display = "none";
  } else {
    if (submitBtn) submitBtn.onclick = confirmAndFinish;
    if (confirmYes) confirmYes.onclick = finishExam;
    if (confirmNo) {
      confirmNo.onclick = () => {
        const overlay = document.getElementById("confirm-overlay");
        if (overlay) overlay.style.display = "none";
      };
    }
  }
};
