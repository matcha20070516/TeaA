window.onload = () => {
  const answers = JSON.parse(localStorage.getItem("exAnswers") || "[]");
  const correctAnswers = [
    "答え1", "答え2", "答え3", "答え4", "答え5",
    "答え6", "答え7", "答え8", "答え9", "答え10",
    "答え11", "答え12", "答え13", "答え14", "答え15",
    "答え16", "答え17", "答え18", "答え19", "答え20"
  ];
  const pointsPerQuestion = [
    3, 5, 4, 6, 2,
    3, 5, 4, 6, 2,
    3, 5, 4, 6, 2,
    3, 5, 4, 6, 2
  ];
  const username = localStorage.getItem("exUsername") || "名無し";

  document.getElementById("username").textContent = `受験者名：${username}`;

  const tbody = document.querySelector("#detail-table tbody");
  let totalScore = 0;
  let correctCount = 0;

  for (let i = 0; i < correctAnswers.length; i++) {
  const tr = document.createElement("tr");

  const userAns = answers[i] || "";
  const isCorrect = userAns === correctAnswers[i];

  if (isCorrect) {
    tr.classList.add("correct");
    totalScore += pointsPerQuestion[i];
    correctCount++;
  } else {
    tr.classList.add("incorrect");
  }

  tr.innerHTML = `
    <td>第${i + 1}問</td>
    <td>${userAns || "（無記入）"}</td>
    <td>${correctAnswers[i]}</td>
    <td>${pointsPerQuestion[i]}</td>
  `;
  tbody.appendChild(tr);
    if (isCorrect) {
      totalScore += pointsPerQuestion[i];
      correctCount++;
    }
  }

  document.getElementById("result-summary").textContent = `正解数：${correctCount} / ${correctAnswers.length} 問, 合計得点：${totalScore} 点`;
};
