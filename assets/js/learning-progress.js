(function setupLearningProgress() {
  "use strict";
  var root = document.querySelector("[data-learning-path]");
  if (!root) return;
  var storageKey = "ahmed-learning-progress-v1";
  var state = {};
  try { state = JSON.parse(window.localStorage.getItem(storageKey) || "{}"); } catch (_error) { state = {}; }
  if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};
  var pathSlug = root.dataset.learningPath;
  var steps = Array.from(root.querySelectorAll("[data-path-step]"));
  var currentSteps = new Set(steps.map(function (step) { return step.dataset.pathStep; }));
  var complete = new Set((Array.isArray(state[pathSlug]) ? state[pathSlug] : []).filter(function (slug) { return currentSteps.has(slug); }));
  var progressText = root.querySelector('[data-path-progress-text]');
  progressText.setAttribute('role', 'status');
  var sessionOnly = false;
  function render() {
    steps.forEach(function (step) {
      var slug = step.dataset.pathStep;
      var done = complete.has(slug);
      step.classList.toggle("is-complete", done);
      var button = step.querySelector("[data-mark-read]");
      button.setAttribute("aria-pressed", String(done));
      button.textContent = done ? "Completed" : "Mark complete";
    });
    var count = complete.size;
    progressText.textContent = count + " of " + steps.length + " complete" + (sessionOnly ? '. Not saved: these changes last only until this page closes or reloads.' : '');
    root.querySelector("[data-path-progress-bar]").style.width = (steps.length ? count / steps.length * 100 : 0) + "%";
  }
  root.addEventListener("click", function (event) {
    var button = event.target.closest?.("[data-mark-read]");
    if (!button) return;
    var slug = button.dataset.markRead;
    if (!currentSteps.has(slug)) return;
    if (complete.has(slug)) complete.delete(slug); else complete.add(slug);
    state[pathSlug] = Array.from(complete);
    try { window.localStorage.setItem(storageKey, JSON.stringify(state)); sessionOnly = false; }
    catch (_error) { sessionOnly = true; }
    window.AhmedAnalytics?.event("learning_step_updated", { learning_path: pathSlug, completed: complete.has(slug), step_slug: slug });
    render();
  });
  window.AhmedAnalytics?.event("learning_path_opened", { learning_path: pathSlug });
  render();
}());
