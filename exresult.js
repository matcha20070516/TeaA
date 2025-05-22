window.addEventListener("DOMContentLoaded", () => {
  // セット名（= ID）を取得
  const setId = localStorage.getItem("exSetName") || "謎検模試_M";
  const prefix = `ex_${setId}_`;

  // プレフィックスを使ってデータ取得
  const username = localStorage.getItem(`${prefix}username`) || "名無し";
  const setName = localStorage.getItem(`${prefix}setname`) || setId;
  const score = localStorage.getItem("exScore") || "0";
  const attemptCount = localStorage.getItem("exAttemptCount") || "1";

  // 表示に反映
  document.getElementById("username").textContent = username;
  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;
  document.getElementById("setname").textContent = setName;

  // ツイートリンク設定
  const tweetText = encodeURIComponent(
    `${setName}の結果は【${score}点】でした！ #謎解き #TeaA`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  document.getElementById("share-link").href = tweetUrl;

  // 詳細リンク設定
  let detailPage = "exresult_detail_M.html"; // デフォルト
  if (setName.includes("ろい")) {
    detailPage = "exresult_detail_ろい.html";
  } else if (setName.includes("set3")) {
    detailPage = "exresult_detail_set3.html";
  }

  const detailLink = document.getElementById("detail-link");
  if (detailLink) {
    detailLink.href = detailPage;
  }
});
