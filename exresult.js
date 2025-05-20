function log(msg) {
  const logDiv = document.getElementById("debugLog");
  if (logDiv) {
    logDiv.textContent += msg + "\n";
  } else {
    console.log(msg);
  }
}


// ページ読み込み時に実行
window.addEventListener("DOMContentLoaded", () => {
  // localStorageから取得（デフォルト値も指定）
  const username = localStorage.getItem("exUsername") || "名無し";
  const score = localStorage.getItem("exScore") || "0";
  const setName = localStorage.getItem("exSetName") || "謎検模試セット";
  const attemptCount = localStorage.getItem("exAttemptCount") || "1";
  
  // デバッグログ出力
  log("Debug: username = " + username);
  log("Debug: setName = " + setName);
  log("Debug: score = " + score);
  log("Debug: attemptCount = " + 

  // HTMLに反映
  document.getElementById("username").textContent = username;
  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;

  // （必要であればセット名も表示）
  const setNameElement = document.getElementById("setname");
  if (setNameElement) {
    setNameElement.textContent = setName;
  }

  // ツイートリンク生成
  const tweetText = encodeURIComponent(
    `${setName}の結果は【${score}点】でした！ #謎解き #TeaA`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  document.getElementById("share-link").href = tweetUrl;
});
