window.addEventListener("DOMContentLoaded", () => {
  // prefixの取得（例：スコア保存時に使ったセット名から生成）
  const setName = localStorage.getItem("exSetName") || "謎検模試セット";
  const prefix = setName.replace(/\s+/g, "").replace(/[^\w]/g, ""); // 例: "謎検模試セット" → "謎検模試セット"

  const username = localStorage.getItem(`${prefix}_Username`) || "名無し";
  const score = localStorage.getItem("exScore") || "0";
  const attemptCount = localStorage.getItem("exAttemptCount") || "1";

  // HTML要素に表示
  document.getElementById("username").textContent = username;
  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;
  document.getElementById("setname").textContent = setName;

  // ツイートリンク作成
  const tweetText = encodeURIComponent(
    `${setName}の結果は【${score}点】でした！ #謎解き #TeaA`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  document.getElementById("share-link").href = tweetUrl;

  // detailリンク設定
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
