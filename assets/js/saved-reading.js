/* Browser-local article bookmarks. No account or personal data is required. */
(function savedReadingModule() {
  "use strict";
  var storageKey = "ahmed-saved-reading-v1";
  var analytics = function (name, params) { window.AhmedAnalytics?.event(name, params || {}); };
  function read() { try { var value = JSON.parse(localStorage.getItem(storageKey) || "[]"); return Array.isArray(value) ? value : []; } catch (_error) { return []; } }
  function write(items) { try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch (_error) { /* Optional browser feature. */ } updateCounts(items); }
  function updateCounts(items) { document.querySelectorAll("[data-saved-count]").forEach(function (node) { node.textContent = String(items.length); }); }
  function currentArticle() {
    var slug = document.body.dataset.articleSlug;
    if (!slug) return null;
    return {
      slug: slug,
      title: document.querySelector(".article-page-header h1")?.textContent.trim() || document.title.replace(/\s*\|.*$/, ""),
      category: document.querySelector(".article-page-header .eyebrow")?.textContent.split("·")[0].trim() || "Article",
      url: document.querySelector('link[rel="canonical"]')?.pathname || location.pathname,
      savedAt: new Date().toISOString()
    };
  }
  function renderBookmarkButton() {
    var button = document.querySelector("[data-article-bookmark]");
    var article = currentArticle();
    if (!button || !article) return;
    function render() {
      var saved = read().some(function (item) { return item.slug === article.slug; });
      button.setAttribute("aria-pressed", String(saved));
      button.textContent = saved ? "Saved" : "Save article";
    }
    button.addEventListener("click", function () {
      var items = read();
      var existing = items.findIndex(function (item) { return item.slug === article.slug; });
      if (existing >= 0) { items.splice(existing, 1); analytics("article_bookmark_removed", { article_slug: article.slug }); }
      else { items.unshift(article); analytics("article_bookmark_added", { article_slug: article.slug }); }
      write(items.slice(0, 100));
      render();
    });
    render();
  }
  function renderSavedPage() {
    var container = document.querySelector("[data-saved-reading-list]");
    var status = document.querySelector("[data-saved-reading-status]");
    if (!container || !status) return;
    function render() {
      var items = read();
      container.replaceChildren();
      status.textContent = items.length ? items.length + " saved article" + (items.length === 1 ? "" : "s") + "." : "No articles saved yet.";
      if (!items.length) {
        var empty = document.createElement("div"); empty.className = "saved-reading-empty";
        empty.innerHTML = '<h2>Build a personal reading list.</h2><p>Open any article and choose “Save article”. Your list stays in this browser and is not attached to an account.</p><a href="/knowledge/index.html">Explore the Knowledge Hub →</a>';
        container.appendChild(empty); return;
      }
      items.forEach(function (item, index) {
        var article = document.createElement("article"); article.className = "saved-reading-card";
        var copy = document.createElement("div");
        var small = document.createElement("small"); small.textContent = String(index + 1).padStart(2, "0") + " · " + item.category;
        var title = document.createElement("h2"); var link = document.createElement("a"); link.href = item.url; link.textContent = item.title; title.appendChild(link);
        var time = document.createElement("time"); time.dateTime = item.savedAt; time.textContent = "Saved " + new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(item.savedAt));
        copy.append(small, title, time);
        var remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.setAttribute("aria-label", "Remove " + item.title + " from saved reading");
        remove.addEventListener("click", function () { write(read().filter(function (saved) { return saved.slug !== item.slug; })); render(); });
        article.append(copy, remove); container.appendChild(article);
      });
    }
    render();
  }
  function setupCollectionButtons() {
    document.querySelectorAll("[data-collection-save]").forEach(function (button) {
      function render() { var saved = read().some(function (item) { return item.slug === button.dataset.slug; }); button.textContent = saved ? "Saved" : "Save"; button.setAttribute("aria-pressed", String(saved)); }
      button.addEventListener("click", function () {
        var items = read(); var existing = items.findIndex(function (item) { return item.slug === button.dataset.slug; });
        if (existing >= 0) items.splice(existing, 1); else items.unshift({ slug: button.dataset.slug, title: button.dataset.title, category: button.dataset.category, url: button.dataset.url, savedAt: new Date().toISOString() });
        write(items.slice(0, 100)); render();
      });
      render();
    });
  }
  function setup() { updateCounts(read()); renderBookmarkButton(); renderSavedPage(); setupCollectionButtons(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", setup, { once: true }); else setup();
  new MutationObserver(function (records) {
    if (records.some(function (record) { return Array.from(record.addedNodes).some(function (node) { return node.nodeType === 1 && (node.matches?.("[data-saved-count]") || node.querySelector?.("[data-saved-count]")); }); })) updateCounts(read());
  }).observe(document.documentElement, { childList: true, subtree: true });
}());
