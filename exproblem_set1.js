const total = 20; // 問題数
let current = 1;
const TOTAL_TIME = 30 * 60; // 制限時間：30分（秒）

let remainingTime = TOTAL_TIME;
let startTime = null;
let timerInterval = null;
let answers = Array(total).fill("");
let setName = localStorage.getItem("exSetName") || "set1";

// ローカルストレージキー（セットごと）
const storagePrefix = `exam_${setName}_`;
const savedAnswers = JSON.parse(localStorage.getItem(storagePrefix + "answers") || "[]");
if (savedAnswers.length === total) answers = savedAnswers;

const savedRemaining = localStorage.getItem(storagePrefix + "remainingTime");
if (savedRemaining) remainingTime = parseInt(savedRemaining);

window.onload = () => {
  const answerInput = document.getElementById("answer");
  const timerDisplay = document.getElementById("timer");
  const chapterContainer = document.getElementById("chapter-container");

  // === タイマー開始 ===
  if (!startTime) startTime = Date.now();
  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);

  // === チャプター生成 ===
  for (let i = 0; i < total; i++) {
    const btn = document.createElement("button");
    btn.textContent = `${i + 1}`;
    btn.className = "chapter-btn";
    btn.onclick = () => goToQuestion(i + 1);
    chapterContainer.appendChild(btn);
  }
  updateChapters();

  // === 入力初期化 ===
  answerInput.value = answers[current - 1] || "";

  answerInput.addEventListener("input", () => {
    answers[current - 1] = answerInput.value;
    localStorage.setItem(storagePrefix + "answers", JSON.stringify(answers));
    updateChapters();
  });

  document.getElementById("next-btn").onclick = nextQuestion;
  document.getElementById("prev-btn").onclick = prevQuestion;
  document.getElementById("finish-btn").onclick = finishExam;
};

function updateTimer() {
  remainingTime = TOTAL_TIME - Math.floor((Date.now() - startTime) / 1000);
  if (remainingTime <= 0) {
    remainingTime = 0;
    clearInterval(timerInterval);
    finishExam();
  }

  const m = Math.floor(remainingTime / 60);
  const s = remainingTime % 60;
  document.getElementById("timer").textContent = `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;

  localStorage.setItem(storagePrefix + "remainingTime", remainingTime);
}

function goToQuestion(num) {
  saveCurrentAnswer();
  current = num;
  document.getElementById("problem-img").src = `images/ex${setName}_q${num}.png`;
  document.getElementById("answer").value = answers[num - 1] || "";
  updateChapters();
}

function saveCurrentAnswer() {
  const answerInput = document.getElementById("answer");
  if (answerInput) {
    answers[current - 1] = answerInput.value;
    localStorage.setItem(storagePrefix + "answers", JSON.stringify(answers));
  }
}

function nextQuestion() {
  if (current < total) {
    saveCurrentAnswer();
    current++;
    goToQuestion(current);
  }
}

function prevQuestion() {
  if (current > 1) {
    saveCurrentAnswer();
    current--;
    goToQuestion(current);
  }
}

function updateChapters() {
  const buttons = document.querySelectorAll(".chapter-btn");
  buttons.forEach((btn, i) => {
    btn.classList.toggle("active", i + 1 === current);
    const ans = answers[i];
    btn.classList.toggle("answered", ans && ans.trim() !== "");
  });
}

function finishExam() {
  clearInterval(timerInterval);
  saveCurrentAnswer();

  const elapsed = TOTAL_TIME - remainingTime;
  localStorage.setItem(storagePrefix + "elapsed", elapsed);
  localStorage.setItem(storagePrefix + "answers", JSON.stringify(answers));
  localStorage.setItem(storagePrefix + "finished", "true");

  window.location.href = "exresult.html";
}
