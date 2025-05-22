window.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem("exUsername") || "名無し";
  const score = localStorage.getItem("exScore") || "0";
  const setName = localStorage.getItem("exSetName") || "謎検模試セット";
  const attemptCount = localStorage.getItem("exAttemptCount") || "1";

  document.getElementById("username").textContent = name;
  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;
  document.getElementById("setname").textContent = setName;

  const tweetText = encodeURIComponent(
    `${setName}の結果は【${score}点】でした！ #謎解き #TeaA`
  );
  const tweetUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  document.getElementById("share-link").href = tweetUrl;

  // detailリンクの設定もここで
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
