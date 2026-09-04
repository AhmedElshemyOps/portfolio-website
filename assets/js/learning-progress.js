(function setupLearningProgress() {
  "use strict";
  var root = document.querySelector("[data-learning-path]");
  if (!root) return;
  var storageKey = "ahmed-learning-progress-v1";
  var state = {};
  try { state = JSON.parse(window.localStorage.getItem(storageKey) || "{}"); } catch (_error) { state = {}; }
  var pathSlug = root.dataset.learningPath;
  var steps = Array.from(root.querySelectorAll("[data-path-step]"));
  var complete = new Set(Array.isArray(state[pathSlug]) ? state[pathSlug] : []);
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
    root.querySelector("[data-path-progress-text]").textContent = count + " of " + steps.length + " complete";
    root.querySelector("[data-path-progress-bar]").style.width = (steps.length ? count / steps.length * 100 : 0) + "%";
  }
  root.addEventListener("click", function (event) {
    var button = event.target.closest?.("[data-mark-read]");
    if (!button) return;
    var slug = button.dataset.markRead;
    if (complete.has(slug)) complete.delete(slug); else complete.add(slug);
    state[pathSlug] = Array.from(complete);
    try { window.localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_error) {}
    window.AhmedAnalytics?.event("learning_step_updated", { learning_path: pathSlug, completed: complete.has(slug), step_slug: slug });
    render();
  });
  window.AhmedAnalytics?.event("learning_path_opened", { learning_path: pathSlug });
  render();
}());
