window.addEventListener("DOMContentLoaded", () => {
  // 使用するセット名を取得し、キーのprefixとして使う
  const setName = localStorage.getItem("currentExamSet") || "謎検模試セット1";
  const prefix = `ex_${setName}`;

  const username = localStorage.getItem(`${prefix}_Username`) || "名無し";
  const score = localStorage.getItem(`${prefix}_Score`) || "0";
  const attemptCount = localStorage.getItem(`${prefix}_AttemptCount`) || "1";

  document.getElementById("username").textContent = username;
  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;
  document.getElementById("setname").textContent = setName;

  const tweetText = encodeURIComponent(
    `${setName}の結果は【${score}点】でした！ #謎解き #TeaA`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  document.getElementById("share-link").href = tweetUrl;

  // 詳細ページのリンク先をセット名で分岐
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
