(function () {
  "use strict";

  var data = window.QUESTION_BANK;
  var storageKey = "substation-advanced-quiz-progress-v1";
  var saved = loadSaved();
  var state = {
    bank: saved.bank || "all",
    wrongOnly: Boolean(saved.wrongOnly),
    query: saved.query || "",
    topic: saved.topic || "all",
    questionType: saved.questionType || "all",
    mode: saved.mode || "all",
    order: null,
    index: 0,
    selected: [],
    results: saved.results || {},
    favorites: saved.favorites || [],
    currentId: saved.currentId || null,
    examOrder: saved.examOrder || null,
    autoNext: Boolean(saved.autoNext),
    toolsExpanded: typeof saved.toolsExpanded === "boolean" ? saved.toolsExpanded : !window.matchMedia("(max-width: 820px)").matches,
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
    wrongOnlyButton: document.getElementById("wrong-only-button"),
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
    search: document.getElementById("question-search"),
    topicSelect: document.getElementById("topic-select"),
    questionTypeInputs: document.querySelectorAll('input[name="question-type-filter"]'),
    modeSelect: document.getElementById("mode-select"),
    favorite: document.getElementById("favorite-button"),
    autoNext: document.getElementById("auto-next"),
    tools: document.getElementById("study-tools"),
    toolsSummary: document.getElementById("tools-summary"),
  };

  var typeNames = {
    single: "单选题",
    multiple: "多选题",
    true_false: "判断题",
    short: "简答题",
  };

  if (!["all", "single", "multiple", "true_false", "short"].includes(state.questionType)) state.questionType = "all";

  document.getElementById("count-all").textContent = data.questions.length;
  data.banks.forEach(function (bank) {
    document.getElementById("count-" + bank.id).textContent = bank.count;
  });

  Array.from(new Set(data.questions.map(function (question) { return question.topic; }).filter(Boolean)))
    .sort(function (a, b) { return a.localeCompare(b, "zh-CN"); })
    .forEach(function (topic) {
      var option = document.createElement("option");
      option.value = topic;
      option.textContent = topic;
      elements.topicSelect.appendChild(option);
    });

  if (!Array.from(elements.topicSelect.options).some(function (option) { return option.value === state.topic; })) state.topic = "all";
  elements.search.value = state.query;
  elements.topicSelect.value = state.topic;
  elements.questionTypeInputs.forEach(function (input) { input.checked = input.value === state.questionType; });
  elements.modeSelect.value = state.mode;
  elements.autoNext.checked = state.autoNext;
  elements.tools.open = state.toolsExpanded;

  function loadSaved() {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || {};
    } catch (error) {
      return {};
    }
  }

  function save() {
    localStorage.setItem(storageKey, JSON.stringify({
      bank: state.bank,
      wrongOnly: state.wrongOnly,
      query: state.query,
      topic: state.topic,
      questionType: state.questionType,
      mode: state.mode,
      results: state.results,
      favorites: state.favorites,
      currentId: state.currentId,
      examOrder: state.examOrder,
      autoNext: state.autoNext,
      toolsExpanded: state.toolsExpanded,
    }));
  }

  function filteredQuestions() {
    var questions = data.questions.filter(function (question) {
      return state.bank === "all" || question.bank === state.bank;
    });
    if (state.questionType !== "all") {
      questions = questions.filter(function (question) { return question.type === state.questionType; });
    }
    if (state.topic !== "all") {
      questions = questions.filter(function (question) { return question.topic === state.topic; });
    }
    if (state.query) {
      var query = state.query.toLocaleLowerCase("zh-CN");
      questions = questions.filter(function (question) {
        return (question.stem + " " + question.topic).toLocaleLowerCase("zh-CN").includes(query);
      });
    }
    if (state.wrongOnly) {
      questions = questions.filter(function (question) {
        return state.results[question.id] && state.results[question.id].correct === false;
      });
    }
    if (state.mode === "unanswered") {
      questions = questions.filter(function (question) { return !state.results[question.id]; });
    } else if (state.mode === "favorites") {
      questions = questions.filter(function (question) { return state.favorites.includes(question.id); });
    } else if (state.mode === "exam") {
      var examIds = new Set(state.examOrder || []);
      questions = questions.filter(function (question) { return examIds.has(question.id); });
      var examById = new Map(questions.map(function (question) { return [question.id, question]; }));
      questions = (state.examOrder || []).map(function (id) { return examById.get(id); }).filter(Boolean);
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
    state.currentId = question ? question.id : null;
    updateSummary();
    updateBankControls();
    updateFavoriteButton(question);

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
    elements.questionBankName.textContent = question.bankName + " · " + question.topic + " · 第 " + question.number + " 题";
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
    save();
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
    var questionId = question.id;
    var selected = state.selected.slice().sort();
    var correct = question.correct.slice().sort();
    var isCorrect = selected.length === correct.length && selected.every(function (key, index) { return key === correct[index]; });
    state.results[question.id] = { correct: isCorrect, selected: selected };
    save();
    render();
    if (isCorrect && state.autoNext && state.index < filteredQuestions().length - 1) {
      window.setTimeout(function () {
        var current = currentQuestion();
        if (current && current.id === questionId) move(1);
      }, 650);
    }
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
    elements.search.value = state.query;
    elements.topicSelect.value = state.topic;
    elements.questionTypeInputs.forEach(function (input) { input.checked = input.value === state.questionType; });
    elements.modeSelect.value = state.mode;
    elements.autoNext.checked = state.autoNext;
    elements.wrongOnly.checked = state.wrongOnly;
    elements.wrongOnlyButton.classList.toggle("is-active", state.wrongOnly);
    elements.wrongOnlyButton.setAttribute("aria-pressed", state.wrongOnly ? "true" : "false");
    elements.wrongOnlyButton.title = state.wrongOnly ? "返回全部题目" : "只看错题";
    elements.shuffle.classList.toggle("is-active", Boolean(state.order));
    elements.shuffle.setAttribute("aria-pressed", state.order ? "true" : "false");
    elements.shuffle.title = state.order ? "切换回顺序练习" : "切换到随机练习";
    elements.shuffleLabel.textContent = state.order ? "顺序" : "随机";
    var typeLabels = { all: "全部题型", single: "单选题", multiple: "多选题", true_false: "判断题", short: "简答题" };
    var modeLabels = { all: "全部题目", unanswered: "只看未做", favorites: "我的收藏", exam: "模拟考试" };
    var summaryParts = [typeLabels[state.questionType] || "全部题型", state.topic === "all" ? "全部知识点" : state.topic, modeLabels[state.mode] || "全部题目"];
    if (state.query) summaryParts.push("搜索：" + state.query);
    elements.toolsSummary.textContent = summaryParts.join(" · ");
  }

  function updateFavoriteButton(question) {
    var active = Boolean(question && state.favorites.includes(question.id));
    elements.favorite.disabled = !question;
    elements.favorite.classList.toggle("is-active", active);
    elements.favorite.setAttribute("aria-pressed", active ? "true" : "false");
    elements.favorite.querySelector("span:first-child").textContent = active ? "★" : "☆";
    elements.favorite.querySelector("span:last-child").textContent = active ? "已收藏" : "收藏本题";
  }

  function toggleFavorite() {
    var question = currentQuestion();
    if (!question) return;
    state.favorites = state.favorites.includes(question.id)
      ? state.favorites.filter(function (id) { return id !== question.id; })
      : state.favorites.concat(question.id);
    if (state.mode === "favorites" && !state.favorites.includes(question.id)) {
      state.index = Math.min(state.index, Math.max(0, filteredQuestions().length - 1));
    }
    save();
    render();
  }

  function resetRange() {
    state.index = 0;
    state.order = null;
    state.selected = [];
  }

  function createExam() {
    var previousMode = state.mode;
    state.mode = "all";
    var candidates = filteredQuestions().map(function (question) { return question.id; });
    state.mode = previousMode;
    for (var i = candidates.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = candidates[i]; candidates[i] = candidates[j]; candidates[j] = temp;
    }
    state.examOrder = candidates.slice(0, 100);
  }

  function changeMode(mode) {
    state.mode = mode;
    state.wrongOnly = false;
    if (mode === "exam") createExam();
    resetRange();
    save();
    render();
  }

  function changeBank(bank) {
    state.bank = bank;
    if (state.mode === "exam") createExam();
    resetRange();
    save();
    render();
  }

  function changeQuestionType(questionType) {
    state.questionType = questionType;
    if (state.mode === "exam") createExam();
    resetRange();
    save();
    render();
  }

  function setWrongOnly(enabled) {
    state.wrongOnly = enabled;
    if (enabled) state.mode = "all";
    resetRange();
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
  elements.search.addEventListener("input", function () {
    state.query = elements.search.value.trim();
    if (state.mode === "exam") createExam();
    resetRange();
    save();
    render();
  });
  elements.topicSelect.addEventListener("change", function () {
    state.topic = elements.topicSelect.value;
    if (state.mode === "exam") createExam();
    resetRange();
    save();
    render();
  });
  elements.questionTypeInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (input.checked) changeQuestionType(input.value);
    });
  });
  elements.modeSelect.addEventListener("change", function () { changeMode(elements.modeSelect.value); });
  elements.favorite.addEventListener("click", toggleFavorite);
  elements.autoNext.addEventListener("change", function () {
    state.autoNext = elements.autoNext.checked;
    save();
  });
  elements.tools.addEventListener("toggle", function () {
    state.toolsExpanded = elements.tools.open;
    save();
  });
  elements.wrongOnly.addEventListener("change", function () {
    setWrongOnly(elements.wrongOnly.checked);
  });
  elements.wrongOnlyButton.addEventListener("click", function () { setWrongOnly(!state.wrongOnly); });
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
    state.query = "";
    state.topic = "all";
    state.questionType = "all";
    state.mode = "all";
    state.examOrder = null;
    resetRange();
    save();
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

  if (state.mode === "exam" && (!state.examOrder || state.examOrder.length === 0)) createExam();
  var restoredQuestions = filteredQuestions();
  var restoredIndex = restoredQuestions.findIndex(function (question) { return question.id === state.currentId; });
  state.index = restoredIndex >= 0 ? restoredIndex : 0;
  render();
}());
