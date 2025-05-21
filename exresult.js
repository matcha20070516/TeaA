window.addEventListener("DOMContentLoaded", () => {
  // localStorageから取得（デフォルト値も指定）
  const username = localStorage.getItem("exUsername") || "名無し"; // ←これを追加！
  const score = localStorage.getItem("exScore") || "0";
  const setName = localStorage.getItem("exSetName") || "謎検模試セット";
  const attemptCount = localStorage.getItem("exAttemptCount") || "1";
  
  // HTMLに反映
  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.textContent = username;
  }

  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;

  const setNameElement = document.getElementById("setname");
  if (setNameElement) {
    setNameElement.textContent = setName;
  }

  const tweetText = encodeURIComponent(
    `${setName}の結果は【${score}点】でした！ #謎解き #TeaA`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  document.getElementById("share-link").href = tweetUrl;
});

// localStorageからセット名を取得
const setName = localStorage.getItem("exSetName") || "謎検模試セット";

// セット名に応じてリンク先を決定
let detailPage = "exresult_detail_M.html"; // デフォルト
if (setName.includes("ろい")) {
  detailPage = "exresult_detail_ろい.html";
} else if (setName.includes("set3")) {
  detailPage = "exresult_detail_set3.html";
}

// 「詳細を見る」リンクにセット
const detailLink = document.getElementById("detail-link");
if (detailLink) {
  detailLink.href = detailPage;
}
