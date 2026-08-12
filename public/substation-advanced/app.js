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
    examResults: saved.examResults || {},
    examOptionOrders: saved.examOptionOrders || {},
    practiceOptionOrders: saved.practiceOptionOrders || {},
    autoNext: Boolean(saved.autoNext),
    toolsExpanded: typeof saved.toolsExpanded === "boolean" ? saved.toolsExpanded : !window.matchMedia("(max-width: 820px)").matches,
  };

  var elements = {
    quizView: document.getElementById("quiz-view"),
    questionType: document.getElementById("question-type"),
    questionBankName: document.getElementById("question-bank-name"),
    questionPosition: document.getElementById("question-position"),
    examScore: document.getElementById("exam-score"),
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
    questionTypeFilter: document.querySelector(".question-type-filter"),
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

  var examBlueprint = {
    single: 60,
    multiple: 10,
    true_false: 20,
  };

  var examTypeOrder = ["single", "multiple", "true_false"];

  var questionPoints = {
    single: 1,
    multiple: 2,
    true_false: 1,
  };

  var examQuestionCount = 90;
  var examTotalPoints = 100;

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
      examResults: state.examResults,
      examOptionOrders: state.examOptionOrders,
      practiceOptionOrders: state.practiceOptionOrders,
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

  function activeResults() {
    return state.mode === "exam" ? state.examResults : state.results;
  }

  function optionKeys(question) {
    return question.options.map(function (option) { return option.key; });
  }

  function isValidOptionOrder(question, order) {
    if (!Array.isArray(order) || order.length !== question.options.length) return false;
    var expected = optionKeys(question).slice().sort();
    return order.slice().sort().every(function (key, index) { return key === expected[index]; });
  }

  function createOptionOrder(question) {
    var keys = optionKeys(question);
    return question.type === "true_false" ? keys : shuffle(keys.slice());
  }

  function ensureExamOptionOrders() {
    var byId = new Map(data.questions.map(function (question) { return [question.id, question]; }));
    var nextOrders = {};
    (state.examOrder || []).forEach(function (id) {
      var question = byId.get(id);
      if (!question) return;
      var savedOrder = state.examOptionOrders[id];
      nextOrders[id] = isValidOptionOrder(question, savedOrder) ? savedOrder : createOptionOrder(question);
    });
    state.examOptionOrders = nextOrders;
  }

  function ensurePracticeOptionOrder(question) {
    if (question.type !== "single") return optionKeys(question);
    var savedOrder = state.practiceOptionOrders[question.id];
    if (!isValidOptionOrder(question, savedOrder)) {
      savedOrder = shuffle(optionKeys(question).slice());
      state.practiceOptionOrders[question.id] = savedOrder;
    }
    return savedOrder;
  }

  function displayedOptions(question) {
    var shouldRemapKeys = state.mode === "exam" || question.type === "single";
    var order = state.mode === "exam"
      ? (isValidOptionOrder(question, state.examOptionOrders[question.id]) ? state.examOptionOrders[question.id] : optionKeys(question))
      : ensurePracticeOptionOrder(question);
    var byKey = new Map(question.options.map(function (option) { return [option.key, option]; }));
    return order.map(function (originalKey, index) {
      return {
        displayKey: shouldRemapKeys ? String.fromCharCode(65 + index) : originalKey,
        option: byKey.get(originalKey),
      };
    });
  }

  function displayKeyFor(question, originalKey) {
    var item = displayedOptions(question).find(function (displayed) { return displayed.option.key === originalKey; });
    return item ? item.displayKey : originalKey;
  }

  function examStats() {
    var byId = new Map(data.questions.map(function (question) { return [question.id, question]; }));
    return (state.examOrder || []).reduce(function (stats, id) {
      var result = state.examResults[id];
      var question = byId.get(id);
      if (!result || !question) return stats;
      stats.answered += 1;
      if (result.correct) stats.score += questionPoints[question.type] || 0;
      return stats;
    }, { answered: 0, score: 0 });
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

    var result = activeResults()[question.id];
    state.selected = result && result.selected ? result.selected.slice() : [];
    elements.questionType.textContent = typeNames[question.type] + (state.mode === "exam" ? " · " + questionPoints[question.type] + "分" : "");
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

    displayedOptions(question).forEach(function (displayed) {
      var option = displayed.option;
      var button = document.createElement("button");
      button.className = "option";
      button.type = "button";
      button.dataset.key = option.key;
      button.dataset.displayKey = displayed.displayKey;
      button.innerHTML = '<span class="option-key">' + displayed.displayKey + '</span><span class="option-text"></span><span class="option-mark" aria-hidden="true"></span>';
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
    if (activeResults()[question.id]) return;
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
    activeResults()[question.id] = { correct: isCorrect, selected: selected };
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
    activeResults()[question.id] = { correct: null, selected: [] };
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
    elements.correctAnswerLabel.textContent = "正确答案：" + question.correct.map(function (key) { return displayKeyFor(question, key); }).sort().join("、");
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
    if (state.mode === "exam") {
      var stats = examStats();
      elements.examScore.hidden = false;
      elements.examScore.textContent = (stats.answered === examQuestionCount ? "最终" : "得分") + " " + stats.score + " / " + examTotalPoints + " · 已答 " + stats.answered + " / " + examQuestionCount;
      elements.dialogSummary.textContent = stats.answered + " / " + examQuestionCount + " 已作答 · 得分 " + stats.score + " / " + examTotalPoints;
    } else {
      elements.examScore.hidden = true;
      elements.dialogSummary.textContent = resultValues.length + " / " + data.questions.length + " 已作答";
    }
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
    elements.search.disabled = state.mode === "exam";
    elements.topicSelect.disabled = state.mode === "exam";
    elements.questionTypeFilter.hidden = state.mode === "exam";
    elements.questionTypeInputs.forEach(function (input) { input.disabled = state.mode === "exam"; });
    elements.autoNext.checked = state.autoNext;
    elements.wrongOnly.checked = state.wrongOnly;
    elements.wrongOnlyButton.classList.toggle("is-active", state.wrongOnly);
    elements.wrongOnlyButton.setAttribute("aria-pressed", state.wrongOnly ? "true" : "false");
    elements.wrongOnlyButton.title = state.wrongOnly ? "返回全部题目" : "只看错题";
    elements.shuffle.hidden = state.mode === "exam";
    elements.shuffle.classList.toggle("is-active", Boolean(state.order));
    elements.shuffle.setAttribute("aria-pressed", state.order ? "true" : "false");
    elements.shuffle.title = state.order ? "切换回顺序练习" : "切换到随机练习";
    elements.shuffleLabel.textContent = state.order ? "顺序" : "随机";
    var typeLabels = { all: "全部题型", single: "单选题", multiple: "多选题", true_false: "判断题", short: "简答题" };
    var modeLabels = { all: "全部题目", unanswered: "只看未做", favorites: "我的收藏", exam: "模拟考试（90题 · 100分）" };
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

  function shuffle(items) {
    for (var i = items.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = items[i]; items[i] = items[j]; items[j] = temp;
    }
    return items;
  }

  function createExam() {
    var candidates = data.questions.filter(function (question) {
      return state.bank === "all" || question.bank === state.bank;
    });
    var examQuestions = [];
    var missingType = null;

    examTypeOrder.some(function (type) {
      var pool = shuffle(candidates.filter(function (question) { return question.type === type; }).slice());
      if (pool.length < examBlueprint[type]) {
        missingType = type;
        return true;
      }
      examQuestions = examQuestions.concat(pool.slice(0, examBlueprint[type]));
      return false;
    });

    if (missingType) {
      window.alert("当前题库的" + typeNames[missingType] + "数量不足，无法生成模拟考试。");
      state.examOrder = null;
      state.examResults = {};
      state.examOptionOrders = {};
      return false;
    }

    state.examOrder = examQuestions.map(function (question) { return question.id; });
    state.examResults = {};
    state.examOptionOrders = {};
    ensureExamOptionOrders();
    return true;
  }

  function hasValidExam() {
    if (!Array.isArray(state.examOrder) || state.examOrder.length !== examQuestionCount) return false;
    var byId = new Map(data.questions.map(function (question) { return [question.id, question]; }));
    var expectedTypes = examTypeOrder.reduce(function (types, type) {
      return types.concat(Array(examBlueprint[type]).fill(type));
    }, []);
    return state.examOrder.every(function (id, index) {
      var question = byId.get(id);
      return question && question.type === expectedTypes[index];
    });
  }

  function changeMode(mode) {
    state.mode = mode;
    state.wrongOnly = false;
    if (mode === "exam") {
      state.query = "";
      state.topic = "all";
      state.questionType = "all";
      if (!createExam()) state.mode = "all";
    }
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
    state.examResults = {};
    state.practiceOptionOrders = {};
    state.wrongOnly = false;
    state.order = null;
    state.index = 0;
    state.selected = [];
    save();
    render();
  }

  function renderQuestionGrid() {
    var questions = filteredQuestions();
    var results = activeResults();
    elements.questionGrid.replaceChildren();
    elements.questionGrid.classList.toggle("is-grouped", state.mode === "exam");

    function createGridButton(question, index) {
      var result = results[question.id];
      var button = document.createElement("button");
      button.type = "button";
      button.className = "grid-cell";
      button.textContent = index + 1;
      button.title = typeNames[question.type] + " · " + question.bankName + " 第 " + question.number + " 题";
      if (index === state.index) button.classList.add("is-current");
      if (result && result.correct === true) button.classList.add("is-correct");
      if (result && result.correct === false) button.classList.add("is-wrong");
      button.addEventListener("click", function () {
        state.index = index;
        elements.dialog.close();
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      return button;
    }

    if (state.mode !== "exam") {
      questions.forEach(function (question, index) {
        elements.questionGrid.appendChild(createGridButton(question, index));
      });
      return;
    }

    var startNumber = 1;
    examTypeOrder.forEach(function (type) {
      var section = document.createElement("section");
      var heading = document.createElement("div");
      var title = document.createElement("strong");
      var details = document.createElement("span");
      var cells = document.createElement("div");
      var typeQuestions = questions.map(function (question, index) {
        return { question: question, index: index };
      }).filter(function (item) { return item.question.type === type; });
      var endNumber = startNumber + typeQuestions.length - 1;

      section.className = "question-grid-section";
      section.dataset.type = type;
      heading.className = "question-grid-heading";
      title.textContent = typeNames[type];
      details.textContent = typeQuestions.length + "题 · " + (typeQuestions.length * questionPoints[type]) + "分 · 第" + startNumber + "–" + endNumber + "题";
      cells.className = "question-grid-cells";
      typeQuestions.forEach(function (item) {
        cells.appendChild(createGridButton(item.question, item.index));
      });
      heading.append(title, details);
      section.append(heading, cells);
      elements.questionGrid.appendChild(section);
      startNumber = endNumber + 1;
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
    state.examResults = {};
    state.examOptionOrders = {};
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
    if (question && !activeResults()[question.id] && /^[a-zA-Z]$/.test(event.key)) {
      var key = event.key.toUpperCase();
      var displayed = displayedOptions(question).find(function (item) { return item.displayKey === key; });
      if (displayed) selectOption(question, displayed.option.key);
    }
  });

  if (state.mode === "exam" && !hasValidExam()) createExam();
  if (state.mode === "exam") ensureExamOptionOrders();
  var restoredQuestions = filteredQuestions();
  var restoredIndex = restoredQuestions.findIndex(function (question) { return question.id === state.currentId; });
  state.index = restoredIndex >= 0 ? restoredIndex : 0;
  render();
}());
