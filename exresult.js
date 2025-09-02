window.addEventListener("DOMContentLoaded", () => {
  const setName = localStorage.getItem("currentExamSet") || "";
  const prefix = `ex_${setName}_`;

  const username = localStorage.getItem(`${prefix}Username`) || "名無し";
  const score = localStorage.getItem(`${prefix}Score`) || localStorage.getItem("exScore") || "0";
  const displaySetName = localStorage.getItem(`${prefix}SetName`) || setName;
  const attemptCount = localStorage.getItem(`${prefix}AttemptCount`) || "1";

  document.getElementById("username").textContent = username;
  document.getElementById("score").textContent = score;
  document.getElementById("attemptCountDisplay").textContent = `${attemptCount}回目`;
  document.getElementById("setname").textContent = displaySetName;

  const reviewBtn = document.getElementById("review-btn");
if (reviewBtn) {
  reviewBtn.addEventListener("click", () => {
    const setName = localStorage.getItem("currentExamSet") || "set1";
    localStorage.setItem("exReviewMode", "true");
    localStorage.setItem("exReviewSet", setName); // ★どのセットか保存
    // セット名で飛び先を変える
    let problemPage = "exproblem_set1.html";
    if (setName.includes("ろい")) {
      problemPage = "exproblem_ろい.html";
    } else if (setName.includes("set3")) {
      problemPage = "exproblem_set3.html";
    }

    window.location.href = problemPage;
  });
}

    window.location.href = problemPage;
  });
}
                        
  const tweetText = encodeURIComponent(
    `『${displaySetName}』の結果は【${score}点】でした！ #謎解き #TExAM`
  );
  document.getElementById("share-link").href = `https://twitter.com/intent/tweet?text=${tweetText}`;

  // detailリンク
  let detailPage = "exresult_detail_M.html";
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
