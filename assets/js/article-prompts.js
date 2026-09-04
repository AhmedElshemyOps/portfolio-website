/* Accessible copy and preview controls for generated article prompt cards. */
"use strict";

(function setupArticlePrompts() {
  const buttons = [...document.querySelectorAll("[data-copy-target]")];
  if (!buttons.length) return;

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const field = document.createElement("textarea");
    field.value = text;
    field.readOnly = true;
    field.style.cssText = "position:fixed;inset:0 auto auto -9999px;opacity:0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    if (!copied) throw new Error("Copy command unavailable");
  };

  buttons.forEach((button, index) => {
    if (button.dataset.copyReady === "true") return;
    const target = document.getElementById(button.dataset.copyTarget);
    if (!target) return;
    const card = button.closest(".prompt-card, .article-prompt");
    const status = card?.querySelector(
      "[data-copy-status], .copy-status, .article-copy-status",
    );
    const promptText = target.textContent.trim();
    const words = promptText.match(/\b[\w’'-]+\b/g)?.length || 0;
    card?.classList.remove("is-collapsed", "is-expanded");

    button.dataset.copyReady = "true";
    button.classList.add("prompt-copy-action");
    button.innerHTML =
      '<span class="copy-action-icon" aria-hidden="true">⧉</span><span>Copy prompt</span>';
    button.setAttribute("aria-label", `Copy complete prompt (${words} words)`);

    if (card && !card.querySelector(".prompt-utility-meta")) {
      const utility = document.createElement("div");
      utility.className = "prompt-utility-meta";
      utility.innerHTML = `<span>${words.toLocaleString()} words</span><span>Copy-ready template</span><span>Human review required</span>`;
      target.closest("pre")?.before(utility);
    }

    button.addEventListener("click", async () => {
      const label = button.querySelector("span:last-child");
      try {
        await copyText(promptText);
        button.classList.add("is-copied");
        button.querySelector(".copy-action-icon").textContent = "✓";
        label.textContent = "Prompt copied";
        if (status)
          status.textContent =
            "The complete prompt is ready to paste. Replace placeholders and verify the output before operational use.";
        window.setTimeout(() => {
          button.classList.remove("is-copied");
          button.querySelector(".copy-action-icon").textContent = "⧉";
          label.textContent = "Copy prompt";
          if (status) status.textContent = "";
        }, 3000);
      } catch (_error) {
        if (status)
          status.textContent =
            "Copy was blocked. Select the prompt text and copy it manually.";
        target.focus();
      }
    });
  });

  const cards = [
    ...new Set(
      buttons
        .map((button) => button.closest(".prompt-card, .article-prompt"))
        .filter(Boolean),
    ),
  ];
  if (cards.length > 1) {
    const navigator = document.createElement("nav");
    navigator.className = "prompt-navigator";
    navigator.setAttribute("aria-label", "Prompt template navigation");
    navigator.innerHTML =
      '<strong>Prompt templates</strong><span data-prompt-position>1 of 1</span><div><button type="button" data-prompt-previous>Previous</button><button type="button" data-prompt-next>Next</button></div>';
    cards[0].before(navigator);
    let current = 0;
    const position = navigator.querySelector("[data-prompt-position]");
    const previous = navigator.querySelector("[data-prompt-previous]");
    const next = navigator.querySelector("[data-prompt-next]");
    const render = () => {
      position.textContent = `${current + 1} of ${cards.length}`;
      previous.disabled = current === 0;
      next.disabled = current === cards.length - 1;
    };
    const move = (amount) => {
      current = Math.max(0, Math.min(cards.length - 1, current + amount));
      const card = cards[current];
      card.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
      window.setTimeout(
        () =>
          card
            .querySelector("button, a, [tabindex]")
            ?.focus({ preventScroll: true }),
        450,
      );
      render();
    };
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    render();
  }
})();
