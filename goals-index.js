// goals-index.js

const goalContainer = document.getElementById("goalContainer");
let goals = JSON.parse(localStorage.getItem("goals") || "[]");

function saveGoals() {
  localStorage.setItem("goals", JSON.stringify(goals));
}

function renderGoals() {
  if (!goalContainer) return;
  goalContainer.innerHTML = "";

  const activeGoals = goals.filter(goal => goal.status !== "達成");

  activeGoals.forEach(goal => {
    const div = document.createElement("div");
    div.className = "goal-card";

    let percent = 0;
    if (goal.type === "quantitative") {
      percent = Math.round((goal.currentProgress || 0) / goal.targetValue * 100);
    } else if (goal.type === "checklist") {
      const doneCount = goal.items.filter(i => i.done).length;
      percent = Math.round(doneCount / goal.items.length * 100);
    }

    div.innerHTML = `
      <div class="goal-row" style="display: flex; align-items: center; gap: 40px; margin-bottom: 20px;">
        <span class="goal-title" style="flex: 2; font-size: 1.2rem; font-weight: bold; color: #2c3e50;">${goal.title}</span>
        <span class="goal-progress" style="flex: 1; font-size: 1rem; text-align: center;">達成率: <strong>${percent}%</strong></span>
        <span class="goal-actions" style="flex: 2; display: flex; justify-content: flex-end; gap: 12px;">
          <button class="delete" onclick="deleteGoal(${goal.id})">削除</button>
          <button class="delete" onclick="editGoal(${goal.id})">編集</button>
          <button class="delete" onclick="markAsAchieved(${goal.id}, ${percent})">達成</button>
        </span>
      </div>
    `;
    goalContainer.appendChild(div);
  });
}

function markAsAchieved(id, percent) {
  if (percent < 100) {
    alert("達成率が100%未満のため、達成できません。");
    return;
  }
  const goal = goals.find(g => g.id === id);
  goal.status = "達成";
  saveGoals();
  renderGoals();
}

function deleteGoal(id) {
  if (!confirm("本当に削除しますか？")) return;
  goals = goals.filter(g => g.id !== id);
  saveGoals();
  renderGoals();
}

function editGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;
  localStorage.setItem("editingGoal", JSON.stringify(goal));
  window.location.href = `goals-edit.html`;
}

// AI提案ボタン押下処理
async function generateAiSuggestion() {
  const title = document.getElementById("goalTitle")?.value;
  const category = document.getElementById("goalCategory")?.value;
  const deadline = document.getElementById("goalDeadline")?.value;

  if (!title || !category || !deadline) {
    alert("目標のタイトル・カテゴリ・締切を入力してください。");
    return;
  }

  const suggestionArea = document.getElementById("aiSuggestionResult");
  suggestionArea.innerText = "提案を生成中...";

  try {
    const response = await fetch("http://localhost:3001/goal-advice", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userPrompt: `目標: ${title}\nカテゴリ: ${category}\n締切: ${deadline} に向けた目標達成のアドバイスをください。`
  })
});
const data = await response.json();
suggestionArea.innerText = data.reply || "提案を取得できませんでした。";
  } catch (e) {
    suggestionArea.innerText = "エラーが発生しました。";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderGoals();
});
