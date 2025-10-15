// === デバッグ用リセットコマンド ===
if (localStorage.getItem("resetPending") === "true") {
  localStorage.clear();
  localStorage.removeItem("resetPending");
  alert("全データをリセットしました。");
}

// === ページ読み込み時 ===
window.addEventListener("DOMContentLoaded", () => {
  updateExamStatus();
  adjustViewportHeight();
});

// === 受験済みチェック ===
function updateExamStatus() {
  const select = document.getElementById("set");
  const options = select.querySelectorAll("option");
  options.forEach(option => {
    const setName = option.value;
    const done = localStorage.getItem(`${setName}_completed`) === "true";
    option.textContent = option.textContent.replace(" ✅", "");
    if (done) {
      option.textContent += " ✅";
      option.style.color = "#4caf50";
    } else {
      option.style.color = "";
    }
  });
}

// === 開始ボタン ===
function start() {
  const name = document.getElementById("name").value.trim();
  const set = document.getElementById("set").value;

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  // リセット用
  if (name === "リセットさん") {
    if (confirm("⚠️ 全データをリセットしますか？")) {
      localStorage.clear();
      alert("全データを削除しました。");
      location.reload();
    }
    return;
  }

  // 既受験確認
  const isCompleted = localStorage.getItem(`${set}_completed`) === "true";
  const isLocked = localStorage.getItem("exResultLocked") === "true";
  if (isCompleted && isLocked) {
    alert("この模試はすでに受験済みです。結果画面に移動します。");
    localStorage.setItem("currentExamSet", set);
    window.location.href = "exresult.html";
    return;
  }

  const prefix = `ex_${set}`;
  const hasSaved = localStorage.getItem("exCurrent") || localStorage.getItem("exStartTime");

  if (hasSaved) {
    alert("前回中断した状態から再開します。");
  } else {
    localStorage.setItem(`${prefix}_FreshStart`, "true");
  }

  localStorage.setItem(`${prefix}_Username`, name);
  localStorage.setItem("currentExamSet", set);
  window.location.href = "exrule.html";
}

// === 使い方スライド ===
const slides = [
  "最初に名前を入力し、模試を選んでください。",
  "右上の数字は残り時間です。問題は左右の矢印またはチャプターから移動可能です。",
  "途中保存にも対応しています。全て解けたら終了ボタンを押してください。"
];
let currentSlide = 0;

const img = document.getElementById("howtoImg");
const desc = document.getElementById("slideDesc");
const prev = document.getElementById("prevBtn");
const next = document.getElementById("nextBtn");
const indicator = document.getElementById("indicator");

function updateSlide() {
  img.src = `Howto${currentSlide + 1}.png`;
  desc.textContent = slides[currentSlide];
  prev.disabled = currentSlide === 0;
  next.disabled = currentSlide === slides.length - 1;
  renderIndicator();
}

function renderIndicator() {
  indicator.innerHTML = "";
  slides.forEach((_, i) => {
    const dot = document.createElement("div");
    dot.className = "dot" + (i === currentSlide ? " active" : "");
    indicator.appendChild(dot);
  });
}

prev.onclick = () => { if (currentSlide > 0) { currentSlide--; updateSlide(); } };
next.onclick = () => { if (currentSlide < slides.length - 1) { currentSlide++; updateSlide(); } };

function openHelp() {
  document.getElementById("modalHelp").classList.add("show");
  currentSlide = 0;
  updateSlide();
}
function closeHelp() {
  document.getElementById("modalHelp").classList.remove("show");
}

// === 高さ調整（スマホのアドレスバー対策） ===
function adjustViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("resize", adjustViewportHeight);
