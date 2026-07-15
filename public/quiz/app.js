(function () {
  "use strict";

  var data = window.QUESTION_BANK;
  var storageKey = "line-safety-quiz-progress-v1";
  var saved = loadSaved();
  var state = {
    bank: saved.bank || "all",
    wrongOnly: false,
    order: null,
    index: 0,
    selected: [],
    results: saved.results || {},
  };

  var elements = {
    quizView: document.getElementById("quiz-view"),
    questionType: document.getElementById("question-type"),
    questionBankName: document.getElementById("question-bank-name"),
    questionPosition: document.getElementById("question-position"),
    progressFill: document.getElementById("progress-fill"),
    questionStem: document.getElementById("question-stem"),
    multipleHint: document.getElementById("multiple-hint"),
    options: document.getElementById("options"),
    submit: document.getElementById("submit-answer"),
    reveal: document.getElementById("reveal-answer"),
    feedback: document.getElementById("answer-feedback"),
    feedbackTitle: document.getElementById("feedback-title"),
    correctAnswerLabel: document.getElementById("correct-answer-label"),
    answerText: document.getElementById("answer-text"),
    previous: document.getElementById("previous-button"),
    next: document.getElementById("next-button"),
    emptyState: document.getElementById("empty-state"),
    showAll: document.getElementById("show-all-button"),
    wrongOnly: document.getElementById("wrong-only"),
    wrongCount: document.getElementById("wrong-count"),
    answeredTotal: document.getElementById("answered-total"),
    accuracyTotal: document.getElementById("accuracy-total"),
    reset: document.getElementById("reset-progress"),
    resetTop: document.getElementById("reset-progress-top"),
    shuffle: document.getElementById("shuffle-button"),
    shuffleLabel: document.getElementById("shuffle-label"),
    dialog: document.getElementById("question-dialog"),
    questionGrid: document.getElementById("question-grid"),
    dialogSummary: document.getElementById("dialog-summary"),
    bankSelect: document.getElementById("bank-select"),
  };

  var typeNames = {
    single: "单选题",
    multiple: "多选题",
    true_false: "判断题",
    short: "简答题",
  };

  document.getElementById("count-all").textContent = data.questions.length;
  document.getElementById("count-general").textContent = data.counts.general;
  document.getElementById("count-foundation").textContent = data.counts.foundation;

  function loadSaved() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (error) {
      return {};
    }
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify({ bank: state.bank, results: state.results }));
  }

  function filteredQuestions() {
    var questions = data.questions.filter(function (question) {
      return state.bank === "all" || question.bank === state.bank;
    });
    if (state.wrongOnly) {
      questions = questions.filter(function (question) {
        return state.results[question.id] && state.results[question.id].correct === false;
      });
    }
    if (state.order) {
      var byId = new Map(questions.map(function (question) { return [question.id, question]; }));
      questions = state.order.map(function (id) { return byId.get(id); }).filter(Boolean);
    }
    return questions;
  }

  function currentQuestion() {
    return filteredQuestions()[state.index];
  }

  function render() {
    var questions = filteredQuestions();
    if (state.index >= questions.length) state.index = Math.max(0, questions.length - 1);
    var question = questions[state.index];
    updateSummary();
    updateBankControls();

    if (!question) {
      elements.quizView.querySelector(".question-meta").hidden = true;
      elements.quizView.querySelector(".progress-track").hidden = true;
      elements.quizView.querySelector(".question-area").hidden = true;
      elements.emptyState.hidden = false;
      elements.previous.disabled = true;
      elements.next.disabled = true;
      return;
    }

    elements.quizView.querySelector(".question-meta").hidden = false;
    elements.quizView.querySelector(".progress-track").hidden = false;
    elements.quizView.querySelector(".question-area").hidden = false;
    elements.emptyState.hidden = true;

    var result = state.results[question.id];
    state.selected = result && result.selected ? result.selected.slice() : [];
    elements.questionType.textContent = typeNames[question.type];
    elements.questionBankName.textContent = question.bankName + " · 第 " + question.number + " 题";
    elements.questionPosition.textContent = (state.index + 1) + " / " + questions.length;
    elements.progressFill.style.width = ((state.index + 1) / questions.length * 100) + "%";
    elements.questionStem.textContent = question.stem;
    elements.multipleHint.hidden = question.type !== "multiple";
    elements.submit.hidden = question.type !== "multiple" || Boolean(result);
    elements.submit.disabled = state.selected.length === 0;
    elements.reveal.hidden = question.type !== "short" || Boolean(result);
    elements.feedback.hidden = true;
    elements.feedback.className = "answer-feedback";
    elements.options.replaceChildren();

    question.options.forEach(function (option) {
      var button = document.createElement("button");
      button.className = "option";
      button.type = "button";
      button.dataset.key = option.key;
      button.innerHTML = '<span class="option-key">' + option.key + '</span><span class="option-text"></span><span class="option-mark" aria-hidden="true"></span>';
      button.querySelector(".option-text").textContent = option.text;
      if (state.selected.includes(option.key)) button.classList.add("is-selected");
      if (result) {
        button.disabled = true;
        if (question.correct.includes(option.key)) {
          button.classList.add("is-correct");
          button.querySelector(".option-mark").textContent = "✓";
        } else if (result.selected.includes(option.key)) {
          button.classList.add("is-wrong");
          button.querySelector(".option-mark").textContent = "×";
        }
      }
      button.addEventListener("click", function () { selectOption(question, option.key); });
      elements.options.appendChild(button);
    });

    if (result) showFeedback(question, result);
    elements.previous.disabled = state.index === 0;
    elements.next.disabled = state.index === questions.length - 1;
    elements.next.innerHTML = state.index === questions.length - 1 ? '已到最后一题' : '下一题 <span aria-hidden="true">→</span>';
  }

  function selectOption(question, key) {
    if (state.results[question.id]) return;
    if (question.type === "multiple") {
      state.selected = state.selected.includes(key)
        ? state.selected.filter(function (item) { return item !== key; })
        : state.selected.concat(key);
      renderSelectionOnly();
    } else {
      state.selected = [key];
      grade(question);
    }
  }

  function renderSelectionOnly() {
    Array.from(elements.options.children).forEach(function (button) {
      button.classList.toggle("is-selected", state.selected.includes(button.dataset.key));
    });
    elements.submit.disabled = state.selected.length === 0;
  }

  function grade(question) {
    var selected = state.selected.slice().sort();
    var correct = question.correct.slice().sort();
    var isCorrect = selected.length === correct.length && selected.every(function (key, index) { return key === correct[index]; });
    state.results[question.id] = { correct: isCorrect, selected: selected };
    save();
    render();
  }

  function revealShortAnswer() {
    var question = currentQuestion();
    if (!question || question.type !== "short") return;
    state.results[question.id] = { correct: null, selected: [] };
    save();
    render();
  }

  function showFeedback(question, result) {
    elements.feedback.hidden = false;
    if (question.type === "short") {
      elements.feedback.classList.add("is-reference");
      elements.feedbackTitle.textContent = "参考答案";
      elements.correctAnswerLabel.textContent = "";
      elements.answerText.textContent = question.answerText;
      return;
    }
    elements.feedbackTitle.textContent = result.correct ? "回答正确" : "回答错误";
    elements.correctAnswerLabel.textContent = "正确答案：" + question.correct.join("、");
    elements.answerText.textContent = result.correct ? "已掌握这道题，继续下一题。" : "绿色选项为正确答案，红色选项为你的选择。";
    if (!result.correct) elements.feedback.classList.add("is-wrong");
  }

  function updateSummary() {
    var resultValues = Object.values(state.results);
    var graded = resultValues.filter(function (result) { return result.correct !== null; });
    var correct = graded.filter(function (result) { return result.correct; }).length;
    var wrong = graded.length - correct;
    elements.answeredTotal.textContent = resultValues.length;
    elements.accuracyTotal.textContent = graded.length ? Math.round(correct / graded.length * 100) + "%" : "--";
    elements.wrongCount.textContent = wrong;
    elements.dialogSummary.textContent = resultValues.length + " / " + data.questions.length + " 已作答";
  }

  function updateBankControls() {
    document.querySelectorAll(".bank-button").forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.bank === state.bank);
    });
    elements.bankSelect.value = state.bank;
    elements.wrongOnly.checked = state.wrongOnly;
    elements.shuffle.classList.toggle("is-active", Boolean(state.order));
    elements.shuffle.setAttribute("aria-pressed", state.order ? "true" : "false");
    elements.shuffle.title = state.order ? "切换回顺序练习" : "切换到随机练习";
    elements.shuffleLabel.textContent = state.order ? "顺序" : "随机";
  }

  function changeBank(bank) {
    state.bank = bank;
    state.index = 0;
    state.order = null;
    state.selected = [];
    save();
    render();
  }

  function move(offset) {
    var nextIndex = state.index + offset;
    if (nextIndex < 0 || nextIndex >= filteredQuestions().length) return;
    state.index = nextIndex;
    state.selected = [];
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleOrder() {
    var current = currentQuestion();

    if (state.order) {
      state.order = null;
      var sequentialQuestions = filteredQuestions();
      var sequentialIndex = current
        ? sequentialQuestions.findIndex(function (question) { return question.id === current.id; })
        : 0;
      state.index = Math.max(0, sequentialIndex);
      render();
      return;
    }

    var ids = filteredQuestions()
      .map(function (question) { return question.id; })
      .filter(function (id) { return !current || id !== current.id; });
    for (var i = ids.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = ids[i]; ids[i] = ids[j]; ids[j] = temp;
    }
    state.order = current ? [current.id].concat(ids) : ids;
    state.index = 0;
    render();
  }

  function resetProgress() {
    if (!window.confirm("确定要清空全部答题记录吗？清空后无法恢复。")) return;
    state.results = {};
    state.wrongOnly = false;
    state.order = null;
    state.index = 0;
    state.selected = [];
    save();
    render();
  }

  function renderQuestionGrid() {
    var questions = filteredQuestions();
    elements.questionGrid.replaceChildren();
    questions.forEach(function (question, index) {
      var result = state.results[question.id];
      var button = document.createElement("button");
      button.type = "button";
      button.className = "grid-cell";
      button.textContent = index + 1;
      button.title = question.bankName + " 第 " + question.number + " 题";
      if (index === state.index) button.classList.add("is-current");
      if (result && result.correct === true) button.classList.add("is-correct");
      if (result && result.correct === false) button.classList.add("is-wrong");
      button.addEventListener("click", function () {
        state.index = index;
        elements.dialog.close();
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      elements.questionGrid.appendChild(button);
    });
  }

  document.querySelectorAll(".bank-button").forEach(function (button) {
    button.addEventListener("click", function () { changeBank(button.dataset.bank); });
  });
  elements.bankSelect.addEventListener("change", function () { changeBank(elements.bankSelect.value); });
  elements.wrongOnly.addEventListener("change", function () {
    state.wrongOnly = elements.wrongOnly.checked;
    state.index = 0;
    state.order = null;
    render();
  });
  elements.submit.addEventListener("click", function () {
    var question = currentQuestion();
    if (question) grade(question);
  });
  elements.reveal.addEventListener("click", revealShortAnswer);
  elements.previous.addEventListener("click", function () { move(-1); });
  elements.next.addEventListener("click", function () { move(1); });
  elements.shuffle.addEventListener("click", toggleOrder);
  elements.showAll.addEventListener("click", function () {
    state.wrongOnly = false;
    state.index = 0;
    render();
  });
  elements.reset.addEventListener("click", resetProgress);
  elements.resetTop.addEventListener("click", resetProgress);
  document.getElementById("question-grid-button").addEventListener("click", function () {
    renderQuestionGrid();
    elements.dialog.showModal();
  });
  document.getElementById("close-dialog").addEventListener("click", function () { elements.dialog.close(); });
  elements.dialog.addEventListener("click", function (event) {
    if (event.target === elements.dialog) elements.dialog.close();
  });
  document.addEventListener("keydown", function (event) {
    if (elements.dialog.open || event.target.matches("select, input")) return;
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
    var question = currentQuestion();
    if (question && !state.results[question.id] && /^[a-zA-Z]$/.test(event.key)) {
      var key = event.key.toUpperCase();
      if (question.options.some(function (option) { return option.key === key; })) selectOption(question, key);
    }
  });

  render();
}());
