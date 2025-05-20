// index.js

function start() {
  const name = document.getElementById("name").value.trim();
  const set = document.getElementById("set").value;

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  if (set.includes("謎検模試")) {
    // 謎検模試モードはlocalStorageに保存
    localStorage.setItem("exUsername", name);
    localStorage.setItem("exSetName", set);
  } else {
    // 通常モードはsessionStorageに保存
    sessionStorage.setItem("playerName", name);
    sessionStorage.setItem("setName", set);
  }

  if (set.includes("謎検模試")) {
    window.location.href = "exrule.html";
  } else {
    window.location.href = "rule.html";
  }
}

// ビューポート高さ調整（スマホブラウザのvh問題対策）
function adjustViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustViewportHeight);
window.addEventListener('load', adjustViewportHeight);
