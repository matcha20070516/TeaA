// ページ読み込み時に実行
window.addEventListener("DOMContentLoaded", () => {
  // localStorageから取得（デフォルト値も指定）
  const username = localStorage.getItem("playerName") || "名無し";
  const score = localStorage.getItem("exScore") || "0";
  const setName = localStorage.getItem("setName") || "謎検模試セット";

  // HTMLに反映
  document.getElementById("username").textContent = username;
  document.getElementById("set-name").textContent = stename;
  document.getElementById("score").textContent = score;

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
