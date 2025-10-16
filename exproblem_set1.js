// === exproblem_set1.js（修正版・全文） ===

// 問題数・タイマーなどの設定
const total = 20;
let current = 1;
const TOTAL_TIME = 30 * 60; // 30分（秒）
let startTime; // 開始時刻（ミリ秒）
let timerInterval = null;

// 回答配列（初期は空）
const answers = Array(total).fill("");

// このセット専用のプレフィックス（キー衝突防止）
const SET_PREFIX = "ex1_";

// 配点・正解・入力形式
const pointsPerQuestion = [
  2, 3, 6, 3, 4,
  4, 4, 4, 6, 6,
  6, 3, 3, 4, 6,
  4, 8, 8, 6, 10
];

const correctAnswers = [
  "3", "たにそこ", "はんたい", "おろそか", "こまいぬ",
  "ちくせき", "ユニオン", "ホエール", "はんらん", "がんばん",
  "たつじん", "とのさま", "かけごえ", "てきかく", "ドリーム",
  "みさんが", "ながさき", "いせえび", "はだいろ", "かいどく"
];

const answerFormats = [
  "半角数字", "ひらがな", "ひらがな", "ひらがな", "ひらがな",
  "ひらがな", "カタカナ", "カタカナ", "ひらがな", "ひらがな",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "カタカナ",
  "ひらがな", "ひらがな", "ひらがな", "ひらがな", "ひらがな"
];

// ロック判定
const isLocked = () => localStorage.getItem(SET_PREFIX + "ResultLocked") === "true";

// 回答形式チェック
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

// 級判定関数
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

// 新規スタート判定（セット専用キーを使用）
const isFreshStart = localStorage.getItem(SET_PREFIX + "FreshStart") === "true";
if (isFreshStart) {
  localStorage.removeItem(SET_PREFIX + "FreshStart");
  localStorage.removeItem(SET_PREFIX + "Current");
  localStorage.removeItem(SET_PREFIX + "StartTime");
  localStorage.removeItem(SET_PREFIX + "Answers");

  // 新規開始時刻を記録
  startTime = Date.now();
  localStorage.setItem(SET_PREFIX + "StartTime", String(startTime));
} else {
  // 保存された開始時刻を取得
  const savedTime = localStorage.getItem(SET_PREFIX + "StartTime");
  startTime = savedTime ? parseInt(savedTime, 10) : Date.now();

  // 保存がなかった場合は新規として保存
  if (!savedTime) {
    localStorage.setItem(SET_PREFIX + "StartTime", String(startTime));
  }

  const savedCurrent = parseInt(localStorage.getItem(SET_PREFIX + "Current") || "1", 10);
  if (!Number.isNaN(savedCurrent) && savedCurrent >= 1 && savedCurrent <= total) {
    current = savedCurrent;
  }

  const savedAnswers = JSON.parse(localStorage.getItem(SET_PREFIX + "Answers") || "[]");
  for (let i = 0; i < Math.min(savedAnswers.length, total); i++) {
    answers[i] = savedAnswers[i] || "";
  }
}

// タイマー更新
const updateTimer = () => {
  // 経過時間を計算（ミリ秒→秒）
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const remainingSec = TOTAL_TIME - elapsedSec;

  const timerEl = document.getElementById("timer");
  if (remainingSec <= 0) {
    clearInterval(timerInterval);
    if (timerEl) timerEl.textContent = "終了";
    // 経過時間を保存（結果画面用）
    localStorage.setItem(SET_PREFIX + "ElapsedTime", String(TOTAL_TIME));
    timeUp();
    return;
  }

  const m = Math.floor(remainingSec / 60);
  const s = remainingSec % 60;
  if (timerEl) timerEl.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  // 経過時間を保存（結果画面用）
  localStorage.setItem(SET_PREFIX + "ElapsedTime", String(elapsedSec));
};

// 自動保存（Answers / Current）
const autoSaveState = () => {
  localStorage.setItem(SET_PREFIX + "Answers", JSON.stringify(answers));
  localStorage.setItem(SET_PREFIX + "Current", current.toString());
};

// 問題読み込み
const loadQuestion = () => {
  const qNumEl = document.getElementById("question-num");
  if (qNumEl) qNumEl.textContent = `第${current}問`;

  const imgEl = document.getElementById("quiz-img");
  if (imgEl) imgEl.src = `mq${current}.PNG`;

  const ansEl = document.getElementById("answer");
  if (ansEl) ansEl.value = answers[current - 1] || "";

  const formatSpan = document.getElementById("answer-format");
  if (formatSpan) formatSpan.textContent = answerFormats[current - 1] || "";

  if (ansEl) ansEl.disabled = isLocked();

  checkCurrentAnswerFormat();
  updateNavButtons();
  updateChapters();

  // 次の問題の画像をプリロード
  if (current < total) {
    const nextImg = new Image();
    nextImg.src = `mq${current + 1}.PNG`;
  }
  if (current > 1) {
    const prevImg = new Image();
    prevImg.src = `mq${current - 1}.PNG`;
  }
};

// フォーマットチェック（現在の解答欄）
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

// ナビボタンの表示更新
const updateNavButtons = () => {
  const backBtn = document.getElementById("back-btn");
  const forwardBtn = document.getElementById("forward-btn");
  if (backBtn) backBtn.style.visibility = current > 1 ? "visible" : "hidden";
  if (forwardBtn) forwardBtn.style.visibility = current < total ? "visible" : "hidden";
};

// チャプター（問題一覧）更新
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

    btn.onclick = () => {
      saveCurrentAnswer();
      current = i + 1;
      localStorage.setItem(SET_PREFIX + "Current", current.toString());
      loadQuestion();
    };
    chapterContainer.appendChild(btn);
  }
};

// 戻る
const back = () => {
  saveCurrentAnswer();
  if (current > 1) {
    current--;
    localStorage.setItem(SET_PREFIX + "Current", current.toString());
    loadQuestion();
  }
};

// 進む
const forward = () => {
  saveCurrentAnswer();
  if (current < total) {
    current++;
    localStorage.setItem(SET_PREFIX + "Current", current.toString());
    loadQuestion();
  }
};

// 現在の解答を保存（配列に）
const saveCurrentAnswer = () => {
  const ansEl = document.getElementById("answer");
  if (!ansEl) return;
  answers[current - 1] = ansEl.value.trim();
  // 即時保存しておく
  localStorage.setItem(SET_PREFIX + "Answers", JSON.stringify(answers));
};

// スコア計算
const calculateScore = (userAnswers) => {
  return userAnswers.reduce((score, ans, idx) => {
    return score + ((ans === correctAnswers[idx]) ? pointsPerQuestion[idx] : 0);
  }, 0);
};

// 試験終了処理（共通）
const handleExamEnd = (message) => {
  saveCurrentAnswer();

  const usernameEl = document.getElementById("username-input");
  const username = (usernameEl && usernameEl.value) || localStorage.getItem(SET_PREFIX + "Username") || "名無し";

  const setName = "謎検模試_M";
  const score = calculateScore(answers);
  const grade = getGrade(score);

  localStorage.setItem(SET_PREFIX + "Username", username);
  localStorage.setItem(SET_PREFIX + "Score", String(score));
  localStorage.setItem(SET_PREFIX + "Answers", JSON.stringify(answers));
  localStorage.setItem(SET_PREFIX + "SetName", setName);
  localStorage.setItem(SET_PREFIX + "ResultLocked", "true");

  // 受験済みフラグを保存（セット名ベース）
  localStorage.setItem(`${setName}_completed`, "true");

  // 現在のprogress削除（編集不可にするため）
  localStorage.removeItem(SET_PREFIX + "Current");

  const reviewMode = localStorage.getItem(SET_PREFIX + "ReviewMode") === "true";
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

// 確認→終了
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

// 初期化（window.onload）
window.onload = () => {
  if (isLocked()) {
    const container = document.querySelector(".container");
    if (container) {
      const lockNotice = document.createElement("p");
      lockNotice.textContent = "この模試の結果は確定済みです。解答を変更できません。";
      lockNotice.style.color = "red";
      container.prepend(lockNotice);
    }

    // 経過時間から固定の残り時間表示（保存されている ElapsedTime を使う）
    const elapsed = parseInt(localStorage.getItem(SET_PREFIX + "ElapsedTime") || "0", 10);
    const fixedTimeLeft = Math.max(TOTAL_TIME - (Number.isNaN(elapsed) ? 0 : elapsed), 0);
    const m = Math.floor(fixedTimeLeft / 60);
    const s = fixedTimeLeft % 60;
    const timerEl = document.getElementById("timer");
    if (timerEl) timerEl.textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

    loadQuestion();
  } else {
    loadQuestion();
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    setInterval(autoSaveState, 1000);

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

  // submit / confirm UI 振り分け
  const reviewMode = localStorage.getItem(SET_PREFIX + "ReviewMode") === "true";
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
