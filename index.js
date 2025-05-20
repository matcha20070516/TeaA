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

    if (hasOldData) {
      const continueOld = confirm("以前のデータが残っています。続けますか？「OK」で続行、「キャンセル」で新しく始めます。");
      if (!continueOld) {
        let count = parseInt(localStorage.getItem("exAttemptCount") || "0", 10);
        count += 1;
        localStorage.setItem("exAttemptCount", count);
        // 完全初期化：模試に関するすべてのkeyを削除
        const exKeysToClear = Object.keys(localStorage).filter(key => key.startsWith("ex"));
        exKeysToClear.forEach(key => localStorage.removeItem(key));
        alert(`新しく始めます（${count}回目の挑戦）`);
      } else {
        alert("前回のデータで続行します。");
      }
    } else {
      // 初回プレイ
      localStorage.setItem("exAttemptCount", "1");
      alert("模試を始めます。（1回目の挑戦）");
    }

    // 共通の保存（上書き）
    localStorage.setItem("exUsername", name);
    localStorage.setItem("exSetName", set);

    // 模試用ルールページへ
    window.location.href = "exrule.html";

  } else {
    // 通常モード：sessionStorage 使用
    sessionStorage.setItem("playerName", name);
    sessionStorage.setItem("setName", set);
    window.location.href = "rule.html";
  }
}
