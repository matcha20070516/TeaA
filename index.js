function start() {
  const name = document.getElementById("name").value.trim();
  const set = document.getElementById("set").value;

  if (!name) {
    alert("名前を入力してください");
    return;
  }

  if (set.includes("謎検模試")) {
    const hasOldData =
      localStorage.getItem("exAnswers") ||
      localStorage.getItem("exUsername") ||
      localStorage.getItem("exSetName");
  }

    if (hasOldData) {
      const continueOld = confirm("以前のデータが残っています。続けますか？「OK」で続行、「キャンセル」で新しく始めます。");
      if (!continueOld) {
        let count = parseInt(localStorage.getItem("exAttemptCount") || "0", 10);
        count += 1;
        localStorage.setItem("exAttemptCount", count);
        const exKeysToClear = [
          "exUsername",
          "exSetName",
          "exAnswers",
          "exScore",
          "exTimeLimit",
          "exElapsedTime",
          "exStartTime",
          "exProgress",
          "exCurrentPage"
        ];
        exKeysToClear.forEach(key => localStorage.removeItem(key));
        alert("新しく始めます。('${count}回目の挑戦)');
      } else {
        alert("前回のデータで続行します。");
      }
    } else {
      localStorage.setItem("exAttemptCount", "1");
      alert("模試を始めます。（1回目の挑戦）")

    // 新旧どちらでも、localStorageに再保存（上書き）しておく
    localStorage.setItem("exUsername", name);
    localStorage.setItem("exSetName", set);

    window.location.href = "exrule.html";

  } else {
      // 通常のモード（sessionStorageを使う）
      sessionStorage.setItem("playerName", name);
      sessionStorage.setItem("setName", set);
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
