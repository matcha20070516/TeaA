const total = 20;
let current = 1;
const TOTAL_TIME = 30 * 60; // 30分（秒）
let startTime; // 開始時刻

const answers = Array(total).fill(””);

const pointsPerQuestion = [
2, 3, 6, 3, 4,
4, 4, 4, 6, 6,
6, 3, 3, 4, 6,
4, 8, 8, 6, 10
];

const correctAnswers = [
“3”, “たにそこ”, “はんたい”, “おろそか”, “こまいぬ”,
“ちくせき”, “ユニオン”, “ホエール”, “はんらん”, “がんばん”,
“たつじん”, “とのさま”, “かけごえ”, “てきかく”, “ドリーム”,
“みさんが”, “ながさき”, “いせえび”, “はだいろ”, “かいどく”
];

const answerFormats = [
“半角数字”, “ひらがな”, “ひらがな”, “ひらがな”, “ひらがな”,
“ひらがな”, “カタカナ”, “カタカナ”, “ひらがな”, “ひらがな”,
“ひらがな”, “ひらがな”, “ひらがな”, “ひらがな”, “カタカナ”,
“ひらがな”, “ひらがな”, “ひらがな”, “ひらがな”, “ひらがな”
];

let timerInterval = null;

// 試験セット名（複数の試験に対応）
const EXAM_SET_NAME = “謎検模試_M”;

// ============================================
// 既存システムとの互換性を保つためのプレフィックス管理
// ============================================
const getStorageKey = (key) => {
// 新しいシステム: ex_${examSet}_Key
const examSet = localStorage.getItem(“currentExamSet”) || EXAM_SET_NAME;
return `ex_${examSet}_${key}`;
};

// 旧システムとの互換性のための取得関数
const getStorageValue = (key, fallbackKey = null) => {
const newKey = getStorageKey(key);
const value = localStorage.getItem(newKey);

// 新しいキーで取得できなければ、フォールバック（旧システム）
if (value === null && fallbackKey) {
return localStorage.getItem(fallbackKey);
}
return value;
};

const setStorageValue = (key, value) => {
const newKey = getStorageKey(key);
localStorage.setItem(newKey, value);
};

const removeStorageValue = (key) => {
const newKey = getStorageKey(key);
localStorage.removeItem(newKey);
};

const isLocked = () => {
return getStorageValue(“ResultLocked”, “exResultLocked”) === “true”;
};

const isValidFormat = (answer, format) => {
if (!answer || answer.trim() === “”) return true;

switch(format) {
case “半角数字”:
return /^[0-9]+$/.test(answer);
case “ひらがな”:
return /^[ぁ-ん]+$/.test(answer);
case “カタカナ”:
return /^[ァ-ヶー]+$/.test(answer);
case “漢字”:
return /^[一-龯]+$/.test(answer);
case “英字”:
return /^[a-zA-Z]+$/.test(answer);
default:
return true;
}
};

// 級判定関数
const getGrade = (score) => {
const s = parseInt(score);
if (s === 100) return { name: “1級”, num: 1 };
if (s >= 90) return { name: “準1級”, num: 2 };
if (s >= 80) return { name: “2級”, num: 3 };
if (s >= 70) return { name: “準2級”, num: 4 };
if (s >= 60) return { name: “3級”, num: 5 };
if (s >= 50) return { name: “4級”, num: 6 };
if (s >= 40) return { name: “5級”, num: 7 };
if (s >= 30) return { name: “6級”, num: 8 };
if (s >= 20) return { name: “7級”, num: 9 };
return { name: “8級”, num: 10 };
};

// ============================================
// 修正1: タイマーリセット対策 - より堅牢な初期化
// ============================================
const initializeExam = () => {
// 現在の試験セットを保存
localStorage.setItem(“currentExamSet”, EXAM_SET_NAME);

const isFreshStart = getStorageValue(“FreshStart”, “exFreshStart”) === “true”;

if (isFreshStart) {
console.log(“新規開始: データをリセット”);
// 新規開始の場合、全てリセット
removeStorageValue(“FreshStart”);
removeStorageValue(“Current”);
removeStorageValue(“StartTime”);
removeStorageValue(“Answers”);
removeStorageValue(“ElapsedTime”);

```
// 旧キーもクリア
localStorage.removeItem("exFreshStart");
localStorage.removeItem("exCurrent");
localStorage.removeItem("exStartTime");
localStorage.removeItem("exAnswers");
localStorage.removeItem("exElapsedTime");

// 新規開始時刻を記録
startTime = Date.now();
setStorageValue("StartTime", startTime.toString());
console.log("新規開始: startTime =", startTime);
```

} else {
// 継続の場合、保存された時刻を復元
const savedStartTime = getStorageValue(“StartTime”, “exStartTime”);

```
if (savedStartTime && savedStartTime !== "null" && savedStartTime !== "undefined") {
  startTime = parseInt(savedStartTime, 10);
  console.log("継続: startTime復元 =", startTime);
} else {
  // 保存された開始時刻がない場合は新規として扱う
  startTime = Date.now();
  setStorageValue("StartTime", startTime.toString());
  console.log("開始時刻なし、新規作成: startTime =", startTime);
}

// 現在の問題番号を復元
const savedCurrent = getStorageValue("Current", "exCurrent");
if (savedCurrent) {
  current = parseInt(savedCurrent, 10);
  if (isNaN(current) || current < 1 || current > total) {
    current = 1;
  }
}

// 保存された解答を復元
const savedAnswers = getStorageValue("Answers", "exAnswers");
if (savedAnswers) {
  try {
    const parsedAnswers = JSON.parse(savedAnswers);
    for (let i = 0; i < Math.min(parsedAnswers.length, total); i++) {
      answers[i] = parsedAnswers[i] || "";
    }
  } catch (e) {
    console.error("解答の復元に失敗:", e);
  }
}
```

}

// 開始時刻が正しく設定されているか確認
if (!startTime || isNaN(startTime)) {
console.error(“startTimeが不正です。リセットします。”);
startTime = Date.now();
setStorageValue(“StartTime”, startTime.toString());
}
};

// ============================================
// タイマー更新（ミリ秒精度で確実に計算）
// ============================================
const updateTimer = () => {
const now = Date.now();
const elapsedMs = now - startTime;
const elapsedSec = Math.floor(elapsedMs / 1000);
const remainingSec = TOTAL_TIME - elapsedSec;

if (remainingSec <= 0) {
clearInterval(timerInterval);
document.getElementById(“timer”).textContent = “終了”;
timeUp();
return;
}

const m = Math.floor(remainingSec / 60);
const s = remainingSec % 60;
document.getElementById(“timer”).textContent =
`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

// 経過時間を保存（結果画面用）
setStorageValue(“ElapsedTime”, elapsedSec.toString());
// 旧キーにも保存（互換性）
localStorage.setItem(“exElapsedTime”, elapsedSec.toString());
};

const autoSaveState = () => {
setStorageValue(“Answers”, JSON.stringify(answers));
setStorageValue(“Current”, current.toString());
setStorageValue(“StartTime”, startTime.toString());
};

const loadQuestion = () => {
document.getElementById(“question-num”).textContent = `第${current}問`;
document.getElementById(“quiz-img”).src = `mq${current}.PNG`;
document.getElementById(“answer”).value = answers[current - 1] || “”;

const formatSpan = document.getElementById(“answer-format”);
formatSpan.textContent = answerFormats[current - 1] || “”;

document.getElementById(“answer”).disabled = isLocked();

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

const checkCurrentAnswerFormat = () => {
const answerInput = document.getElementById(“answer”);
const formatSpan = document.getElementById(“answer-format”);
const currentAnswer = answerInput.value.trim();
const currentFormat = answerFormats[current - 1];

if (currentAnswer && !isValidFormat(currentAnswer, currentFormat)) {
answerInput.style.borderColor = “#e53935”;
answerInput.style.backgroundColor = “#ffebee”;
formatSpan.style.color = “#e53935”;
} else {
answerInput.style.borderColor = “#ccc”;
answerInput.style.backgroundColor = “white”;
formatSpan.style.color = “#666”;
}
};

const updateNavButtons = () => {
document.getElementById(“back-btn”).style.visibility = current > 1 ? “visible” : “hidden”;
document.getElementById(“forward-btn”).style.visibility = current < total ? “visible” : “hidden”;
};

const updateChapters = () => {
const chapterContainer = document.getElementById(“chapters”);
chapterContainer.innerHTML = “”;
for (let i = 0; i < total; i++) {
const btn = document.createElement(“button”);
btn.textContent = `${i + 1}`;
btn.className = “chapter-btn”;

```
if (i + 1 === current) btn.classList.add("current");

if (answers[i].trim() !== "") {
  if (isValidFormat(answers[i], answerFormats[i])) {
    btn.classList.add("answered");
  } else {
    btn.classList.add("invalid");
  }
}

btn.onclick = () => {
  saveCurrentAnswer();
  current = i + 1;
  setStorageValue("Current", current.toString());
  loadQuestion();
};
chapterContainer.appendChild(btn);
```

}
};

const back = () => {
saveCurrentAnswer();
if (current > 1) {
current–;
setStorageValue(“Current”, current.toString());
loadQuestion();
}
};

const forward = () => {
saveCurrentAnswer();
if (current < total) {
current++;
setStorageValue(“Current”, current.toString());
loadQuestion();
}
};

const saveCurrentAnswer = () => {
answers[current - 1] = document.getElementById(“answer”).value.trim();
};

const calculateScore = (userAnswers) => {
return userAnswers.reduce((score, ans, idx) =>
score + (ans === correctAnswers[idx] ? pointsPerQuestion[idx] : 0), 0);
};

// ============================================
// 修正3: 既存の級別ページシステムへの遷移
// ============================================
const handleExamEnd = (message) => {
saveCurrentAnswer();

const username =
document.getElementById(“username-input”)?.value ||
getStorageValue(“Username”, “exUsername”) ||
“名無し”;

const score = calculateScore(answers);
const grade = getGrade(score);

// 既存システムに合わせてデータを保存
setStorageValue(“Username”, username);
setStorageValue(“Score”, score.toString());
setStorageValue(“GradeName”, grade.name);
setStorageValue(“GradeNum”, grade.num.toString());
setStorageValue(“Answers”, JSON.stringify(answers));
setStorageValue(“SetName”, EXAM_SET_NAME);
setStorageValue(“ResultLocked”, “true”);

// 旧キーにも保存（互換性）
localStorage.setItem(“exUsername”, username);
localStorage.setItem(“exScore”, score.toString());
localStorage.setItem(“exGradeName”, grade.name);
localStorage.setItem(“exGradeNum”, grade.num.toString());
localStorage.setItem(“exAnswers”, JSON.stringify(answers));
localStorage.setItem(“exSetName”, EXAM_SET_NAME);
localStorage.setItem(“exResultLocked”, “true”);

// 受験済みフラグを保存
localStorage.setItem(`${EXAM_SET_NAME}_completed`, “true”);

// currentExamSetを保存（結果ページで使用）
localStorage.setItem(“currentExamSet”, EXAM_SET_NAME);

removeStorageValue(“Current”);
localStorage.removeItem(“exCurrent”);

const reviewMode = getStorageValue(“ReviewMode”, “exReviewMode”) === “true”;
if (reviewMode) {
const t = document.getElementById(“timer”);
if (t) t.style.display = “none”;

```
const ans = document.getElementById("answer");
if (ans) ans.disabled = true;

const submitBtn = document.getElementById("submit-btn");
if (submitBtn) submitBtn.style.display = "none";
```

}

alert(message);

// 既存の級別ページへ遷移（OGP対応の結果ページ）
const baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, ‘’);
const shareUrl = `${baseUrl}share/grade-${grade.num}.html`;

const params = new URLSearchParams({
grade: grade.name,
score: score.toString(),
shareUrl: shareUrl
});

// 既存の結果ページに遷移
const resultPage = `exresult_grade${grade.num}.html?${params.toString()}`;

console.log(“遷移先:”, resultPage);
console.log(“保存データ:”, { username, score, grade, setName: EXAM_SET_NAME });

// ページ遷移を実行
window.location.href = resultPage;
};

const confirmAndFinish = () => {
let invalidCount = 0;
for (let i = 0; i < total; i++) {
if (answers[i].trim() !== “” && !isValidFormat(answers[i], answerFormats[i])) {
invalidCount++;
}
}

if (invalidCount > 0) {
const confirmMsg = `解答形式が正しくない問題が${invalidCount}問あります。\nこのまま終了しますか？`;
if (!confirm(confirmMsg)) {
return;
}
}

document.getElementById(“confirm-overlay”).style.display = “flex”;
};

const timeUp = () => handleExamEnd(“時間切れです。結果画面に移動します。”);
const finishExam = () => handleExamEnd(“結果画面に遷移します。”);

document.addEventListener(“keydown”, (e) => {
if (isLocked()) return;

if (e.key === “ArrowLeft” && current > 1) {
back();
}
if (e.key === “ArrowRight” && current < total) {
forward();
}
});

// ============================================
// 初期化処理
// ============================================
window.onload = () => {
// 試験データの初期化
initializeExam();

if (isLocked()) {
const lockNotice = document.createElement(“p”);
lockNotice.textContent = “この模試の結果は確定済みです。解答を変更できません。”;
lockNotice.style.color = “red”;
lockNotice.style.fontWeight = “bold”;
lockNotice.style.textAlign = “center”;
document.querySelector(”.quiz-area”)?.prepend(lockNotice);

```
const elapsed = parseInt(
  getStorageValue("ElapsedTime", "exElapsedTime") || "0",
  10
);
const fixedTimeLeft = TOTAL_TIME - elapsed;
const m = Math.floor(fixedTimeLeft / 60);
const s = fixedTimeLeft % 60;
document.getElementById("timer").textContent =
  `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

loadQuestion();
```

} else {
loadQuestion();
updateTimer();
timerInterval = setInterval(updateTimer, 1000);
setInterval(autoSaveState, 2000);

```
const answerInput = document.getElementById("answer");
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
```

}

const reviewMode = getStorageValue(“ReviewMode”, “exReviewMode”) === “true”;
const submitBtn = document.getElementById(“submit-btn”);
const confirmYes = document.getElementById(“confirm-yes”);
const confirmNo = document.getElementById(“confirm-no”);

if (reviewMode) {
if (submitBtn) submitBtn.onclick = finishExam;
const overlay = document.getElementById(“confirm-overlay”);
if (overlay) overlay.style.display = “none”;
} else {
if (submitBtn) submitBtn.onclick = confirmAndFinish;
if (confirmYes) confirmYes.onclick = finishExam;
if (confirmNo) confirmNo.onclick = () => {
document.getElementById(“confirm-overlay”).style.display = “none”;
};
}

console.log(“初期化完了:”, { current, startTime, isLocked: isLocked() });
};

// ページ離脱時の警告
window.addEventListener(“beforeunload”, (e) => {
if (!isLocked() && answers.some(a => a.trim() !== “”)) {
e.preventDefault();
e.returnValue = “試験中です。ページを離れますか？”;
}
});
